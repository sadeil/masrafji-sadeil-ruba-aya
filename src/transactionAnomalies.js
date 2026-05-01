/**
 * Masrafji · Transaction anomaly detectors.
 *
 * Pure-JS detectors that scan a transactions array and surface things the user
 * probably didn't notice: duplicate charges, recurring subscriptions, and
 * category spend spikes vs the prior week.
 *
 * Each detector returns an array of `Anomaly` records that the notification
 * feed converts into inbox items. Keeping the data shape generic so we can add
 * more detectors (refunds, cash-back, weekend overspend, …) without touching
 * the consumer.
 *
 * Anomaly shape:
 *   {
 *     kind: 'duplicate' | 'subscription' | 'category-spike',
 *     severity: 'info' | 'warning' | 'danger',
 *     // detector-specific payload — read by the formatter in notificationFeed:
 *     name?: string,
 *     amount?: number,
 *     category?: string,
 *     count?: number,        // how many times we saw it
 *     pct?: number,          // percentage change (category-spike)
 *     monthsSeen?: number,   // (subscription) distinct months observed
 *     daysApart?: number,    // (duplicate) days between the two charges
 *   }
 */

const DAY = 24 * 60 * 60 * 1000;

function expensesOnly(txs) {
  return (txs || []).filter((t) => t && t.amount < 0);
}

function normalizeName(name = '') {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z؀-ۿ0-9]+/g, ' ')
    .trim();
}

function startOfWeek(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay()); // Sun-anchored week
  return x.getTime();
}

/* ---------------------------------------------------------------------------
 * Duplicate charges — same merchant + same amount within 5 days.
 * Ignores rounding noise (matches if amounts are within 1 cent).
 * --------------------------------------------------------------------------- */

export function detectDuplicates(transactions, { withinDays = 5 } = {}) {
  const window = withinDays * DAY;
  const expenses = expensesOnly(transactions)
    .map((t) => ({ ...t, _key: normalizeName(t.name), _ts: new Date(t.date).getTime() }))
    .sort((a, b) => a._ts - b._ts);

  const seen = new Map(); // key → list of {tx, ts}
  const out = [];

  for (const tx of expenses) {
    const list = seen.get(tx._key) || [];
    for (const prior of list) {
      const dt = tx._ts - prior._ts;
      if (dt > 0 && dt <= window && Math.abs(prior.tx.amount - tx.amount) < 0.011) {
        out.push({
          kind: 'duplicate',
          severity: 'warning',
          name: tx.name,
          nameAr: tx.nameAr || null,
          category: tx.category,
          icon: tx.icon || 'alert-circle',
          amount: tx.amount,
          daysApart: Math.max(1, Math.round(dt / DAY)),
        });
        break; // one alert per duplicate pair, not N²
      }
    }
    list.push({ tx, ts: tx._ts });
    seen.set(tx._key, list);
  }

  return out;
}

/* ---------------------------------------------------------------------------
 * Subscriptions — same merchant + (within 10%) amount appearing in ≥2 distinct
 * calendar months. Catches Netflix/Spotify/gym memberships you forgot about.
 * --------------------------------------------------------------------------- */

export function detectSubscriptions(transactions) {
  const expenses = expensesOnly(transactions).map((t) => ({
    ...t,
    _key: normalizeName(t.name),
    _ym: (() => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })(),
  }));

  // Group by name → { months: Set, samples: [tx] }
  const groups = new Map();
  for (const tx of expenses) {
    const g = groups.get(tx._key) || { months: new Set(), samples: [], totalAbs: 0 };
    g.months.add(tx._ym);
    g.samples.push(tx);
    g.totalAbs += Math.abs(tx.amount);
    groups.set(tx._key, g);
  }

  const out = [];
  for (const [, g] of groups) {
    if (g.months.size < 2) continue;
    // Filter for amount stability — flag only if all charges are within ±10%.
    const amounts = g.samples.map((s) => Math.abs(s.amount));
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    if (max === 0) continue;
    if (max - min > min * 0.1 + 0.5) continue; // allow tiny tolerance for cents
    const sample = g.samples[0];
    out.push({
      kind: 'subscription',
      severity: 'info',
      name: sample.name,
      nameAr: sample.nameAr || null,
      category: sample.category,
      icon: sample.icon || 'refresh-cw',
      amount: -Math.round((g.totalAbs / g.samples.length) * 100) / 100,
      monthsSeen: g.months.size,
      count: g.samples.length,
    });
  }

  // Most frequent first
  return out.sort((a, b) => (b.monthsSeen - a.monthsSeen) || (b.count - a.count));
}

/* ---------------------------------------------------------------------------
 * Category spikes — recent week vs prior week per category. Flag categories
 * that grew >150% or by >$50 absolute (whichever is larger).
 * --------------------------------------------------------------------------- */

export function detectCategorySpikes(transactions, { now = Date.now() } = {}) {
  const expenses = expensesOnly(transactions);
  const thisWeek = startOfWeek(now);
  const lastWeek = thisWeek - 7 * DAY;

  const cur = new Map();
  const prev = new Map();
  for (const t of expenses) {
    const ts = new Date(t.date).getTime();
    const cat = t.category || 'Other';
    const abs = Math.abs(t.amount);
    if (ts >= thisWeek) cur.set(cat, (cur.get(cat) || 0) + abs);
    else if (ts >= lastWeek && ts < thisWeek) prev.set(cat, (prev.get(cat) || 0) + abs);
  }

  const out = [];
  for (const [cat, curAmt] of cur) {
    const prevAmt = prev.get(cat) || 0;
    if (curAmt < 20) continue; // don't bother for tiny totals
    if (prevAmt === 0) {
      // brand-new category this week — quietly informative, not alarming
      out.push({
        kind: 'category-spike',
        severity: 'info',
        category: cat,
        icon: 'trending-up',
        amount: -curAmt,
        pct: null,
        firstWeek: true,
      });
      continue;
    }
    const ratio = curAmt / prevAmt;
    const delta = curAmt - prevAmt;
    if (ratio >= 1.5 && delta >= 30) {
      out.push({
        kind: 'category-spike',
        severity: ratio >= 2 ? 'danger' : 'warning',
        category: cat,
        icon: 'trending-up',
        amount: -curAmt,
        pct: Math.round((ratio - 1) * 100),
        firstWeek: false,
      });
    }
  }

  return out.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
}

/* ---------------------------------------------------------------------------
 * Convenience — run them all, capped per-kind so the inbox doesn't drown.
 * --------------------------------------------------------------------------- */

export function detectAnomalies(transactions, opts = {}) {
  return {
    duplicates: detectDuplicates(transactions, opts).slice(0, 1),
    subscriptions: detectSubscriptions(transactions, opts).slice(0, 2),
    spikes: detectCategorySpikes(transactions, opts).slice(0, 2),
  };
}
