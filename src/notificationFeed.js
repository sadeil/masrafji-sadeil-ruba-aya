/**
 * Masrafji · Notification feed builder.
 *
 * Combines the curated per-role base list (from `notifications.js`) with
 * data-driven items synthesized from the active dashboard data (overdue
 * bills, near-complete goals, over-budget categories, low balance etc.) to
 * produce a rich, lifelike notification inbox per user.
 *
 * Each feed item shape:
 *   {
 *     id: string,
 *     severity: 'info' | 'success' | 'warning' | 'danger' | 'brand',
 *     icon: string,        // lucide icon key (see Icons.jsx)
 *     category: 'bills' | 'goals' | 'budget' | 'tips' |
 *               'subscriptions' | 'invoices' | 'savings' | 'income',
 *     tab: string,         // dashboard tab to navigate to on action
 *     title: string,       // already-localized
 *     body: string,        // already-localized
 *     action: string,      // already-localized (optional)
 *     time: Date,          // notification timestamp
 *     pinned?: boolean,    // surfaces at top regardless of time
 *   }
 *
 * The function returns a stable feed for a given role/lang. Read state and
 * dismissed ids are kept in localStorage and applied by the caller.
 */

import notifications from './notifications.js';
import { fmtMoney } from './format.js';
import { detectAnomalies } from './transactionAnomalies.js';

/* ---------------------------------------------------------------------------
 * Heuristic id → category mapping.
 * --------------------------------------------------------------------------- */

function idToCategory(id) {
  if (/electric|wifi|internet|bill|upcoming|school|term/i.test(id)) return 'bills';
  if (/goal|emergency|phone|fund|buffer|streak|safety/i.test(id)) return 'goals';
  if (/expenses|household|spend|budget|alert|transport|allowance/i.test(id)) return 'budget';
  if (/netflix|subs|subscription|music|renewal/i.test(id)) return 'subscriptions';
  if (/invoice|overdue|late|payment|client|income/i.test(id)) return 'invoices';
  if (/tip|streak|saving|tax/i.test(id)) return 'tips';
  return 'tips';
}

/* ---------------------------------------------------------------------------
 * Localized snippets used by data-driven items below. Kept inline (rather
 * than expanding the dictionary further) so the synthesis stays close to the
 * data shape.
 * --------------------------------------------------------------------------- */

const S = {
  billDueSoon: {
    en: (name, days) => ({
      title: `${name} bill due soon`,
      body:
        days <= 0
          ? `Your ${name.toLowerCase()} bill is due today.`
          : days === 1
          ? `Your ${name.toLowerCase()} bill is due tomorrow.`
          : `Your ${name.toLowerCase()} bill is due in ${days} days.`,
      action: 'View bill',
    }),
    ar: (name, days) => ({
      title: `فاتورة ${name} قريبة`,
      body:
        days <= 0
          ? `فاتورة ${name} مستحقة اليوم.`
          : days === 1
          ? `فاتورة ${name} مستحقة بكرا.`
          : `فاتورة ${name} مستحقة بعد ${days} أيام.`,
      action: 'عرض الفاتورة',
    }),
  },
  goalNearDone: {
    en: (name, leftStr) => ({
      title: `${name} — almost there`,
      body: `Only ${leftStr} left to reach your goal. Keep going!`,
      action: 'View goal',
    }),
    ar: (name, leftStr) => ({
      title: `${name} — قربت تخلص`,
      body: `ضل عليك ${leftStr} للوصول للهدف. كمل بنفس الطريقة!`,
      action: 'عرض الهدف',
    }),
  },
  goalAchieved: {
    en: (name) => ({
      title: `🎉 ${name} achieved`,
      body: `You hit your goal — time to celebrate and pick the next one.`,
      action: 'View goal',
    }),
    ar: (name) => ({
      title: `🎉 تحقق هدف ${name}`,
      body: `وصلت لهدفك — حان الوقت للاحتفال واختيار الهدف الجاي.`,
      action: 'عرض الهدف',
    }),
  },
  overBudget: {
    en: (cat, overStr) => ({
      title: `${cat} is over budget`,
      body: `You spent ${overStr} more than your monthly limit.`,
      action: 'Review budget',
    }),
    ar: (cat, overStr) => ({
      title: `${cat} تجاوزت الميزانية`,
      body: `صرفت ${overStr} زيادة عن حد الشهر.`,
      action: 'مراجعة الميزانية',
    }),
  },
  budgetTight: {
    en: (cat, pct) => ({
      title: `${cat} is at ${pct}%`,
      body: `Heads-up: you've used most of this month's budget for ${cat.toLowerCase()}.`,
      action: 'View budget',
    }),
    ar: (cat, pct) => ({
      title: `${cat} وصلت ${pct}%`,
      body: `انتبه — صرفت معظم ميزانية ${cat} لهذا الشهر.`,
      action: 'عرض الميزانية',
    }),
  },
  weeklySummary: {
    en: () => ({
      title: 'Your weekly summary is ready',
      body: 'See where your money went and how this week compares.',
      action: 'Open report',
    }),
    ar: () => ({
      title: 'ملخّصك الأسبوعي جاهز',
      body: 'شوف وين راحت فلوسك وكيف هاد الأسبوع مقارنة بغيره.',
      action: 'فتح التقرير',
    }),
  },
  duplicateCharge: {
    en: (name, amountStr, daysApart) => ({
      title: `Possible duplicate at ${name}`,
      body: `${amountStr} was charged ${daysApart === 1 ? 'a day' : `${daysApart} days`} after an identical charge. Worth a quick check.`,
      action: 'Dispute charge',
      secondary: 'Contact bank',
    }),
    ar: (name, amountStr, daysApart) => ({
      title: `يمكن خصم مكرّر — ${name}`,
      body: `تم خصم ${amountStr} بعد ${daysApart === 1 ? 'يوم واحد' : `${daysApart} أيام`} من خصم مطابق. راجعها بسرعة.`,
      action: 'تقديم اعتراض',
      secondary: 'تواصل مع البنك',
    }),
  },
  subscriptionFound: {
    en: (name, amountStr, monthsSeen) => ({
      title: `Recurring: ${name}`,
      body: `Charged about ${amountStr}/month for ${monthsSeen} months. If you don't use it, cancel to free that up.`,
      action: 'Cancel subscription',
      secondary: 'Keep it',
    }),
    ar: (name, amountStr, monthsSeen) => ({
      title: `اشتراك متكرّر — ${name}`,
      body: `حوالي ${amountStr} شهرياً منذ ${monthsSeen} أشهر. إذا مش بتستخدمه، إلغاءه بيوفّر هالمبلغ.`,
      action: 'إلغاء الاشتراك',
      secondary: 'احتفظ فيه',
    }),
  },
  categorySpike: {
    en: (cat, pct, amountStr) => ({
      title: `${cat} spending up ${pct}%`,
      body: `You're spending ${amountStr} on ${cat.toLowerCase()} this week — well above last week's pace.`,
      action: 'See breakdown',
    }),
    ar: (cat, pct, amountStr) => ({
      title: `${cat} ارتفعت بنسبة ${pct}%`,
      body: `صرفت ${amountStr} على ${cat} هاد الأسبوع — أعلى بكتير من الأسبوع الماضي.`,
      action: 'عرض التفاصيل',
    }),
  },
  newCategorySpend: {
    en: (cat, amountStr) => ({
      title: `New spending in ${cat}`,
      body: `${amountStr} on ${cat.toLowerCase()} this week — first time in a while. Just a heads-up.`,
      action: 'See breakdown',
    }),
    ar: (cat, amountStr) => ({
      title: `صرف جديد في ${cat}`,
      body: `${amountStr} على ${cat} هاد الأسبوع — أول مرة من فترة. مجرّد تنبيه.`,
      action: 'عرض التفاصيل',
    }),
  },
};

/* ---------------------------------------------------------------------------
 * Feed builder.
 * --------------------------------------------------------------------------- */

const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;
const DAY = 24 * HOUR;

/**
 * Build a personalized feed of ~6–8 notifications for the given role.
 *
 * @param {string} roleId
 * @param {'en'|'ar'} lang
 * @param {object} data Dashboard data (bills, budgets, goals, kpis…)
 * @param {string} currency Currency code for amount formatting
 */
export function buildNotificationFeed(roleId, lang = 'en', data = {}, currency = 'USD') {
  const now = Date.now();
  const baseList = notifications[roleId] || notifications.general;

  /* 1) Curated, role-specific items — staggered times to feel natural. */
  const offsets = [4 * MIN, 32 * MIN, 2 * HOUR, 6 * HOUR, 26 * HOUR, 38 * HOUR, 3 * DAY, 5 * DAY];
  const curated = baseList.map((n, i) => ({
    id: n.id,
    severity: n.severity,
    icon: n.icon,
    tab: n.tab,
    category: idToCategory(n.id),
    title: n.title[lang] || n.title.en,
    body: n.body[lang] || n.body.en,
    action: n.action?.[lang] || n.action?.en,
    time: new Date(now - (offsets[i] ?? 4 * DAY)),
  }));

  /* 2) Data-driven items synthesized from current dashboard state. */
  const synthesized = [];

  // Bills due in the next 7 days (sorted closest first).
  const upcomingBills = (data.bills || [])
    .map((b) => ({ ...b, daysAway: Math.ceil((new Date(b.due).getTime() - now) / DAY) }))
    .filter((b) => b.daysAway <= 7 && b.daysAway >= -1)
    .sort((a, b) => a.daysAway - b.daysAway)
    .slice(0, 2);

  upcomingBills.forEach((b, i) => {
    const name = lang === 'ar' && b.nameAr ? b.nameAr : b.name;
    const copy = S.billDueSoon[lang](name, b.daysAway);
    synthesized.push({
      id: `auto-bill-${b.id || i}`,
      severity: b.daysAway <= 1 ? 'danger' : 'warning',
      icon: b.icon || 'calendar',
      category: 'bills',
      tab: 'budget',
      title: copy.title,
      body: copy.body,
      action: copy.action,
      time: new Date(now - (15 + i * 90) * MIN),
      pinned: b.daysAway <= 1,
    });
  });

  // Goals close to completion (≥70% but <100%).
  const closeGoals = (data.goals || [])
    .filter((g) => g.target && g.saved / g.target >= 0.7 && g.saved < g.target)
    .slice(0, 1);
  closeGoals.forEach((g, i) => {
    const name = lang === 'ar' && g.nameAr ? g.nameAr : g.name;
    const left = Math.max(0, g.target - g.saved);
    const copy = S.goalNearDone[lang](name, fmtMoney(left, currency));
    synthesized.push({
      id: `auto-goal-${g.id || i}`,
      severity: 'success',
      icon: g.icon || 'target',
      category: 'goals',
      tab: 'goals',
      title: copy.title,
      body: copy.body,
      action: copy.action,
      time: new Date(now - (45 + i * 60) * MIN),
    });
  });

  // Achieved goal (100%).
  const achievedGoals = (data.goals || []).filter((g) => g.target && g.saved >= g.target).slice(0, 1);
  achievedGoals.forEach((g, i) => {
    const name = lang === 'ar' && g.nameAr ? g.nameAr : g.name;
    const copy = S.goalAchieved[lang](name);
    synthesized.push({
      id: `auto-goal-done-${g.id || i}`,
      severity: 'success',
      icon: 'sparkles',
      category: 'goals',
      tab: 'goals',
      title: copy.title,
      body: copy.body,
      action: copy.action,
      time: new Date(now - 22 * HOUR),
    });
  });

  // Over-budget categories (top 1).
  const overBudget = (data.budgets || [])
    .filter((b) => b.spent > b.limit)
    .sort((a, b) => b.spent - b.limit - (a.spent - a.limit))
    .slice(0, 1);
  overBudget.forEach((b, i) => {
    const cat = catLabel(b.category, lang);
    const over = b.spent - b.limit;
    const copy = S.overBudget[lang](cat, fmtMoney(over, currency));
    synthesized.push({
      id: `auto-overbudget-${b.category}-${i}`,
      severity: 'danger',
      icon: b.icon || 'alert-triangle',
      category: 'budget',
      tab: 'budget',
      title: copy.title,
      body: copy.body,
      action: copy.action,
      time: new Date(now - 3 * HOUR),
      pinned: true,
    });
  });

  // Tight-but-not-over budget (85–99%).
  const tightBudget = (data.budgets || [])
    .filter((b) => {
      const pct = (b.spent / b.limit) * 100;
      return pct >= 85 && pct < 100;
    })
    .slice(0, 1);
  tightBudget.forEach((b, i) => {
    const cat = catLabel(b.category, lang);
    const pct = Math.round((b.spent / b.limit) * 100);
    const copy = S.budgetTight[lang](cat, pct);
    synthesized.push({
      id: `auto-tightbudget-${b.category}-${i}`,
      severity: 'warning',
      icon: b.icon || 'gauge',
      category: 'budget',
      tab: 'budget',
      title: copy.title,
      body: copy.body,
      action: copy.action,
      time: new Date(now - (5 * HOUR + i * MIN)),
    });
  });

  /* ── DEMO-GUARANTEED anomaly notifications ────────────────────────────
   * These are hardcoded per persona so the demo flow ALWAYS shows the
   * Dispute / Cancel-subscription action buttons, even if the live
   * detector would skip a transaction or the user has dismissed alerts
   * in a previous session. They're pushed before merge with curated
   * items, sorted by pinned-first, so duplicates land at the very top. */
  const DEMO_ANOMALIES = {
    'university-student': [
      {
        id: 'demo-dup-visa-amazon',
        kind: 'duplicate',
        severity: 'danger',
        icon: 'alert-circle',
        merchant: 'Amazon.com',
        amount: 34.99,
        copyEn: {
          title: 'Duplicate Visa charge — Amazon.com',
          body: 'Your Visa was charged $34.99 twice within seconds. Looks like a card double-billing.',
          action: 'Dispute charge',
          secondary: 'Contact bank',
        },
        copyAr: {
          title: 'خصم مكرّر على بطاقتك — Amazon.com',
          body: 'تم خصم ٣٤٫٩٩ دولار مرّتين خلال ثوانٍ. يبدو ازدواجاً في النظام — راجع العمليّة بسرعة.',
          action: 'تقديم اعتراض',
          secondary: 'تواصل مع البنك',
        },
        offsetMin: 35,
      },
      {
        id: 'demo-sub-spotify',
        kind: 'subscription',
        severity: 'info',
        icon: 'refresh-cw',
        merchant: 'Spotify Premium',
        amount: 4.99,
        copyEn: {
          title: 'Recurring: Spotify Premium',
          body: "Charged $4.99/month for 3 months. If you don't use it, cancel to free that up.",
          action: 'Cancel subscription',
          secondary: 'Keep it',
        },
        copyAr: {
          title: 'اشتراك متكرّر — Spotify Premium',
          body: 'مُشتركٌ بـ ٤٫٩٩ دولار شهرياً منذ ٣ أشهر. إن لم تستخدمه، إلغاؤه يوفّر هذا المبلغ.',
          action: 'إلغاء الاشتراك',
          secondary: 'احتفظ فيه',
        },
        offsetMin: 4 * 60,
      },
    ],
    'family-parent': [
      {
        id: 'demo-dup-carrefour',
        kind: 'duplicate',
        severity: 'danger',
        icon: 'alert-circle',
        merchant: 'Carrefour',
        amount: 142.50,
        copyEn: {
          title: 'Duplicate Visa charge — Carrefour',
          body: 'Your card was charged $142.50 twice within seconds. Looks like a billing duplicate.',
          action: 'Dispute charge',
          secondary: 'Contact bank',
        },
        copyAr: {
          title: 'خصم مكرّر على بطاقتك — كارفور',
          body: 'تم خصم ١٤٢٫٥٠ دولار مرّتين خلال ثوانٍ. يبدو ازدواجاً في النظام — راجع العمليّة بسرعة.',
          action: 'تقديم اعتراض',
          secondary: 'تواصل مع البنك',
        },
        offsetMin: 35,
      },
      {
        id: 'demo-sub-netflix',
        kind: 'subscription',
        severity: 'info',
        icon: 'refresh-cw',
        merchant: 'Netflix',
        amount: 14.99,
        copyEn: {
          title: 'Recurring: Netflix',
          body: "Charged $14.99/month for 3 months. If you don't use it, cancel to free that up.",
          action: 'Cancel subscription',
          secondary: 'Keep it',
        },
        copyAr: {
          title: 'اشتراك متكرّر — Netflix',
          body: 'مُشتركٌ بـ ١٤٫٩٩ دولار شهرياً منذ ٣ أشهر. إن لم تستخدمه، إلغاؤه يوفّر هذا المبلغ.',
          action: 'إلغاء الاشتراك',
          secondary: 'احتفظ فيه',
        },
        offsetMin: 4 * 60,
      },
    ],
    employee: [
      {
        id: 'demo-sub-spotify-emp',
        kind: 'subscription',
        severity: 'info',
        icon: 'refresh-cw',
        merchant: 'Spotify',
        amount: 9.99,
        copyEn: {
          title: 'Recurring: Spotify',
          body: "Charged $9.99/month for 3 months. If you don't use it, cancel to free that up.",
          action: 'Cancel subscription',
          secondary: 'Keep it',
        },
        copyAr: {
          title: 'اشتراك متكرّر — Spotify',
          body: 'مُشتركٌ بـ ٩٫٩٩ دولار شهرياً منذ ٣ أشهر. إن لم تستخدمه، إلغاؤه يوفّر هذا المبلغ.',
          action: 'إلغاء الاشتراك',
          secondary: 'احتفظ فيه',
        },
        offsetMin: 4 * 60,
      },
    ],
  };

  const demoList = DEMO_ANOMALIES[roleId] || [];
  demoList.forEach((d) => {
    const copy = lang === 'ar' ? d.copyAr : d.copyEn;
    synthesized.push({
      id: d.id,
      severity: d.severity,
      icon: d.icon,
      category: d.kind === 'subscription' ? 'subscriptions' : 'tips',
      tab: 'transactions',
      title: copy.title,
      body: copy.body,
      action: copy.action,
      secondaryAction: copy.secondary,
      anomalyKind: d.kind,
      merchant: d.merchant,
      amount: d.amount,
      time: new Date(now - d.offsetMin * MIN),
      pinned: d.kind === 'duplicate',
    });
  });

  /* ── AI anomaly detectors (live, additive — won't duplicate the IDs above) */
  const anomalies = detectAnomalies(data.transactions || [], { now });

  anomalies.duplicates.forEach((a, i) => {
    const name = lang === 'ar' && a.nameAr ? a.nameAr : a.name;
    const copy = S.duplicateCharge[lang](name, fmtMoney(Math.abs(a.amount), currency), a.daysApart);
    synthesized.push({
      id: `auto-dup-${i}`,
      severity: a.severity,
      icon: 'alert-circle',
      category: 'tips',
      tab: 'transactions',
      title: copy.title,
      body: copy.body,
      action: copy.action,
      secondaryAction: copy.secondary,
      anomalyKind: 'duplicate',
      time: new Date(now - (35 + i * 60) * MIN),
      pinned: true,
    });
  });

  anomalies.subscriptions.forEach((a, i) => {
    const name = lang === 'ar' && a.nameAr ? a.nameAr : a.name;
    const copy = S.subscriptionFound[lang](
      name,
      fmtMoney(Math.abs(a.amount), currency),
      a.monthsSeen,
    );
    synthesized.push({
      id: `auto-sub-${i}`,
      severity: a.severity,
      icon: 'refresh-cw',
      category: 'subscriptions',
      tab: 'transactions',
      title: copy.title,
      body: copy.body,
      action: copy.action,
      secondaryAction: copy.secondary,
      anomalyKind: 'subscription',
      time: new Date(now - (4 + i) * HOUR),
    });
  });

  anomalies.spikes.forEach((a, i) => {
    const cat = catLabel(a.category, lang);
    const copy = a.firstWeek
      ? S.newCategorySpend[lang](cat, fmtMoney(Math.abs(a.amount), currency))
      : S.categorySpike[lang](cat, a.pct, fmtMoney(Math.abs(a.amount), currency));
    synthesized.push({
      id: `auto-spike-${a.category}-${i}`,
      severity: a.severity,
      icon: 'trending-up',
      category: 'budget',
      tab: 'reports',
      title: copy.title,
      body: copy.body,
      action: copy.action,
      time: new Date(now - (2 + i) * HOUR),
    });
  });

  // Weekly summary (always available — cheap delight).
  const weekly = S.weeklySummary[lang]();
  synthesized.push({
    id: 'auto-weekly-summary',
    severity: 'brand',
    icon: 'sparkles',
    category: 'tips',
    tab: 'reports',
    title: weekly.title,
    body: weekly.body,
    action: weekly.action,
    time: new Date(now - 18 * HOUR),
  });

  /* 3) Merge, dedup by id, then sort: pinned first, then newest first. */
  const all = [...synthesized, ...curated];
  const seen = new Set();
  const merged = [];
  for (const item of all) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  merged.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.time.getTime() - a.time.getTime();
  });

  return merged.slice(0, 12);
}

/* ---------------------------------------------------------------------------
 * Internal helper. We keep a tiny inline category translator here to avoid
 * importing the React-only i18n hook from a plain module.
 * --------------------------------------------------------------------------- */

function catLabel(cat, lang) {
  if (lang !== 'ar') return cat;
  const map = {
    Groceries: 'مشتريات',
    Utilities: 'فواتير',
    Children: 'الأطفال',
    Rent: 'الإيجار',
    Transport: 'مواصلات',
    Other: 'أخرى',
    Income: 'الدخل',
    Health: 'الصحة',
    Payroll: 'الرواتب',
    Marketing: 'التسويق',
    'Tools & SaaS': 'الأدوات',
    Tools: 'الأدوات',
    Office: 'المكتب',
    Travel: 'السفر',
    'Tax buffer': 'صندوق الضريبة',
    Tax: 'الضرائب',
    Revenue: 'الإيرادات',
    Food: 'الأكل',
    'Food & snacks': 'الأكل والوجبات',
    Entertainment: 'الترفيه',
    School: 'المدرسة',
    Subs: 'الاشتراكات',
    'Subs & fun': 'الاشتراكات والترفيه',
    Books: 'الكتب',
    'Rent / dorm': 'إيجار / سكن',
    Bills: 'فواتير',
    Loan: 'قرض',
    Invest: 'استثمار',
    Software: 'برمجيات',
    Hardware: 'أجهزة',
    'Health insurance': 'تأمين صحي',
    Coworking: 'مساحة عمل',
    Personal: 'شخصي',
    Housing: 'السكن',
    Fun: 'ترفيه',
    Dining: 'مطاعم',
  };
  return map[cat] || cat;
}

/* ---------------------------------------------------------------------------
 * Format an absolute Date as a relative time string using i18n strings.
 * Pass the `t` helper from `useT` so the caller controls localization.
 * --------------------------------------------------------------------------- */

export function formatRelativeShort(date, t) {
  if (!date) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / MIN);
  if (mins < 1) return t('notifCenter.justNow');
  if (mins < 60) return t('notifCenter.minAgo', { n: mins });
  const hours = Math.round(diffMs / HOUR);
  if (hours < 24) return t('notifCenter.hoursAgo', { n: hours });
  const days = Math.round(diffMs / DAY);
  return t('notifCenter.daysAgo', { n: days });
}

/* ---------------------------------------------------------------------------
 * Group feed items into Today / Yesterday / Earlier this week buckets.
 * --------------------------------------------------------------------------- */

export function groupByDay(items) {
  const today = startOfDay(new Date());
  const yesterday = new Date(today.getTime() - DAY);

  const t = [];
  const y = [];
  const earlier = [];

  for (const item of items) {
    const d = startOfDay(item.time);
    if (d.getTime() === today.getTime()) t.push(item);
    else if (d.getTime() === yesterday.getTime()) y.push(item);
    else earlier.push(item);
  }

  return { today: t, yesterday: y, earlier };
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
