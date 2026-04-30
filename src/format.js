import { CURRENCIES } from './data.js';

/**
 * Convert an amount stored in USD into the user-selected display currency.
 */
export function convert(amountUsd, code = 'USD') {
  const c = CURRENCIES[code] || CURRENCIES.USD;
  return amountUsd * c.rate;
}

const symbolFor = (code) => {
  const c = CURRENCIES[code] || CURRENCIES.USD;
  return c.symbol;
};

/**
 * Format a number as a currency string in the selected display currency.
 * Numbers always render LTR (tabular nums) regardless of UI direction so
 * "$1,420" reads naturally even inside an Arabic paragraph.
 */
export function fmtMoney(amountUsd, code = 'USD', { compact = false, sign = false } = {}) {
  const c = CURRENCIES[code] || CURRENCIES.USD;
  const value = convert(amountUsd, code);
  const showSign = sign && value > 0 ? '+' : '';
  const abs = Math.abs(value);
  const opts = compact
    ? { notation: 'compact', maximumFractionDigits: 1 }
    : { minimumFractionDigits: abs >= 100 ? 0 : 2, maximumFractionDigits: 2 };
  let formatted;
  try {
    formatted = new Intl.NumberFormat('en-US', opts).format(abs);
  } catch {
    formatted = abs.toFixed(2);
  }
  const negSign = value < 0 ? '-' : '';
  const sym = symbolFor(code);
  if (code === 'JOD') return `${negSign}${showSign}${formatted} JD`;
  if (code === 'EUR') return `${negSign}${showSign}€${formatted}`;
  return `${negSign}${showSign}${sym}${formatted}`;
}

export function fmtNum(value, { compact = false } = {}) {
  const opts = compact
    ? { notation: 'compact', maximumFractionDigits: 1 }
    : { maximumFractionDigits: 0 };
  try {
    return new Intl.NumberFormat('en-US', opts).format(value);
  } catch {
    return String(value);
  }
}

export function fmtPct(value, { sign = false } = {}) {
  const showSign = sign && value > 0 ? '+' : '';
  return `${showSign}${value.toFixed(1)}%`;
}

export function fmtDateShort(iso, lang = 'en') {
  try {
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function fmtRelative(iso, t = (k) => k) {
  const date = new Date(iso);
  const today = new Date(2026, 3, 30);
  const diff = Math.round((today - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return t('common.today');
  if (diff === 1) return t('common.yesterday');
  if (diff > 0 && diff < 7) return t('common.daysAgo', { n: diff }) === 'common.daysAgo'
    ? `${diff} days ago`
    : t('common.daysAgo', { n: diff });
  if (diff < 0) {
    const d = Math.abs(diff);
    if (d === 1) return t('common.tomorrow');
    if (d < 7) {
      const v = t('common.inDays', { n: d });
      return v === 'common.inDays' ? `In ${d} days` : v;
    }
    if (d < 30) {
      const w = Math.round(d / 7);
      const v = t('common.inWeeks', { n: w });
      return v === 'common.inWeeks' ? `In ${w} weeks` : v;
    }
  }
  return fmtDateShort(iso);
}

export function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Pick the localised version of an object field, falling back to the base.
 * `pick(tx, 'name', 'ar')` returns `tx.nameAr` when present, else `tx.name`.
 */
export function pick(obj, field, lang = 'en') {
  if (!obj) return '';
  if (lang === 'ar') {
    const arField = `${field}Ar`;
    if (obj[arField]) return obj[arField];
  }
  return obj[field];
}
