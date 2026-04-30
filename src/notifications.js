/**
 * Smart per-role onboarding notifications.
 *
 * Each user type gets a curated rotation of notifications that feel relevant
 * to that life-stage (bills, allowance, invoices, savings goals…). When the
 * dashboard loads we pick one item from the role's list, rotating through
 * them across visits via localStorage so the banner never feels repetitive.
 *
 * Every notification is bilingual (en / ar), has a tone, an icon, a short
 * title, a longer helpful body, and an optional action that maps to a
 * dashboard tab so the action button can deep-link to the right page.
 *
 * Severity tones drive colour:
 *   - 'info'     — neutral nudge (blue)
 *   - 'success'  — positive milestone (green)
 *   - 'warning'  — heads-up (amber)
 *   - 'danger'   — needs action (red)
 *   - 'brand'    — a friendly tip (brand purple/blue)
 *
 * The `tab` field is the dashboard tab id we navigate to when the action
 * button is tapped.
 */

const N = {
  /* ------------------------------------------------------------------ */
  /*                       Family Parent                                */
  /* ------------------------------------------------------------------ */
  'family-parent': [
    {
      id: 'fp-electric-bill',
      severity: 'warning',
      icon: 'zap',
      tab: 'budget',
      title: { en: 'Electricity bill is coming soon', ar: 'فاتورة الكهرباء قريبة' },
      body: {
        en: 'Your electricity bill is due in 3 days. Would you like to add a reminder?',
        ar: 'ضل 3 أيام على موعد دفع فاتورة الكهرباء. بدك نضيفها للتذكيرات؟',
      },
      action: { en: 'Add reminder', ar: 'إضافة تذكير' },
    },
    {
      id: 'fp-household-high',
      severity: 'danger',
      icon: 'trending-up',
      tab: 'reports',
      title: { en: 'Household spending is high', ar: 'مصاريف البيت مرتفعة' },
      body: {
        en: 'Your household spending is 18% higher than last month.',
        ar: 'مصاريف البيت هذا الشهر أعلى من الشهر الماضي بنسبة 18%.',
      },
      action: { en: 'View details', ar: 'عرض التفاصيل' },
    },
    {
      id: 'fp-emergency-fund',
      severity: 'success',
      icon: 'shield',
      tab: 'goals',
      title: { en: 'Emergency fund progress', ar: 'صندوق الطوارئ' },
      body: {
        en: 'You are close to your emergency fund goal — only 250 ILS left.',
        ar: 'أنت قريب من هدف صندوق الطوارئ. ضل عليك 250 شيكل فقط.',
      },
      action: { en: 'View goal', ar: 'متابعة الهدف' },
    },
    {
      id: 'fp-school-fees',
      severity: 'info',
      icon: 'graduation-cap',
      tab: 'budget',
      title: { en: "Kids' school fees", ar: 'رسوم مدرسة الأطفال' },
      body: {
        en: 'Term 3 school fees are due next week. Plan ahead to avoid late charges.',
        ar: 'رسوم الفصل الثالث للمدرسة مستحقة الأسبوع الجاي. خطّط من هلأ.',
      },
      action: { en: 'View bills', ar: 'عرض الفواتير' },
    },
  ],

  /* ------------------------------------------------------------------ */
  /*                       Business Owner                               */
  /* ------------------------------------------------------------------ */
  business: [
    {
      id: 'bz-overdue-invoice',
      severity: 'danger',
      icon: 'file-text',
      tab: 'transactions',
      title: { en: 'Client payment overdue', ar: 'دفعة عميل متأخرة' },
      body: {
        en: 'One client invoice has been unpaid for 5 days.',
        ar: 'في فاتورة غير مدفوعة من أحد العملاء منذ 5 أيام.',
      },
      action: { en: 'View invoices', ar: 'عرض الفواتير' },
    },
    {
      id: 'bz-expenses-high',
      severity: 'warning',
      icon: 'trending-up',
      tab: 'budget',
      title: { en: 'Business expenses are high', ar: 'المصاريف عالية' },
      body: {
        en: 'Company expenses are higher than usual this week.',
        ar: 'مصاريف الشركة هذا الأسبوع أعلى من المعتاد.',
      },
      action: { en: 'Review expenses', ar: 'مراجعة المصاريف' },
    },
    {
      id: 'bz-cashflow-low',
      severity: 'info',
      icon: 'activity',
      tab: 'reports',
      title: { en: 'Cash flow needs attention', ar: 'Cash Flow يحتاج متابعة' },
      body: {
        en: 'Cash flow is lower this month — check upcoming payments.',
        ar: 'التدفق النقدي منخفض هذا الشهر. راجع المدفوعات القادمة.',
      },
      action: { en: 'View report', ar: 'عرض التقرير' },
    },
    {
      id: 'bz-tax-buffer',
      severity: 'brand',
      icon: 'shield',
      tab: 'goals',
      title: { en: 'Quarterly tax buffer', ar: 'صندوق الضريبة' },
      body: {
        en: 'Set aside 25% of this month’s revenue for the upcoming quarterly tax filing.',
        ar: 'احفظ 25% من إيرادات الشهر لتغطية الضريبة الربعية القادمة.',
      },
      action: { en: 'Open goal', ar: 'فتح الهدف' },
    },
  ],

  /* ------------------------------------------------------------------ */
  /*                       School Student                               */
  /* ------------------------------------------------------------------ */
  'school-student': [
    {
      id: 'ss-allowance-low',
      severity: 'warning',
      icon: 'wallet',
      tab: 'budget',
      title: { en: 'Your allowance is almost finished', ar: 'مصروفك قرب يخلص' },
      body: {
        en: 'You have 12 ILS left from this week’s allowance. Spend carefully today.',
        ar: 'ضل معك 12 شيكل من مصروف الأسبوع. انتبه لمصاريفك اليوم.',
      },
      action: { en: 'View allowance', ar: 'عرض المصروف' },
    },
    {
      id: 'ss-netflix',
      severity: 'info',
      icon: 'music',
      tab: 'transactions',
      title: { en: 'Subscription ending soon', ar: 'اشتراك قريب ينتهي' },
      body: {
        en: 'Your Netflix subscription is ending soon. Check if you want to renew it.',
        ar: 'اشتراك Netflix راح ينتهي قريبًا. تأكد إذا بدك تجدده.',
      },
      action: { en: 'View subscriptions', ar: 'عرض الاشتراكات' },
    },
    {
      id: 'ss-phone-goal',
      severity: 'success',
      icon: 'smartphone',
      tab: 'goals',
      title: { en: 'Saving goal progress', ar: 'هدف الادخار' },
      body: {
        en: 'You saved 70% toward your phone goal. Keep going!',
        ar: 'أنت وفرت 70% من هدف شراء الموبايل. كمل بنفس الطريقة!',
      },
      action: { en: 'View goal', ar: 'عرض الهدف' },
    },
    {
      id: 'ss-streak',
      severity: 'brand',
      icon: 'sparkles',
      tab: 'overview',
      title: { en: '5-day saving streak!', ar: '٥ أيام ادخار متتالية!' },
      body: {
        en: 'You’ve put a little aside every day this week — earn a 7-day badge.',
        ar: 'كل يوم هاد الأسبوع وفرت شي بسيط — كمل لشارة الأيام السبعة.',
      },
      action: { en: 'See badges', ar: 'عرض الشارات' },
    },
  ],

  /* ------------------------------------------------------------------ */
  /*                       University Student                           */
  /* ------------------------------------------------------------------ */
  'university-student': [
    {
      id: 'us-budget-low',
      severity: 'warning',
      icon: 'wallet',
      tab: 'budget',
      title: { en: 'Your budget is almost finished', ar: 'ميزانيتك قربت تخلص' },
      body: {
        en: 'You have 120 ILS left until the end of the month. Try reducing daily expenses.',
        ar: 'ضل معك 120 شيكل لنهاية الشهر. حاول تقلل المصاريف اليومية.',
      },
      action: { en: 'View budget', ar: 'عرض الميزانية' },
    },
    {
      id: 'us-renewal',
      severity: 'info',
      icon: 'wifi',
      tab: 'transactions',
      title: { en: 'Subscription renewal soon', ar: 'اشتراك شهري قريب' },
      body: {
        en: 'Your internet or learning platform subscription renews in 2 days.',
        ar: 'اشتراك الإنترنت أو المنصة التعليمية راح يتجدد خلال يومين.',
      },
      action: { en: 'View bills', ar: 'عرض الفواتير' },
    },
    {
      id: 'us-transport',
      severity: 'danger',
      icon: 'bus',
      tab: 'reports',
      title: { en: 'Transport spending increased', ar: 'مصاريف المواصلات زادت' },
      body: {
        en: 'Your transportation spending is higher than usual this week.',
        ar: 'مصاريف المواصلات هذا الأسبوع أعلى من المعتاد.',
      },
      action: { en: 'View analysis', ar: 'عرض التحليل' },
    },
    {
      id: 'us-buffer-goal',
      severity: 'success',
      icon: 'shield',
      tab: 'goals',
      title: { en: 'Buffer goal on track', ar: 'هدف صندوق الأمان' },
      body: {
        en: 'You’re 30% of the way to a 3-month safety net. Nice consistency!',
        ar: 'وصلت 30% من هدف صندوق ٣ أشهر — استمر بنفس الإيقاع!',
      },
      action: { en: 'View goal', ar: 'عرض الهدف' },
    },
  ],

  /* ------------------------------------------------------------------ */
  /*                          Employee                                  */
  /* ------------------------------------------------------------------ */
  employee: [
    {
      id: 'emp-bill',
      severity: 'warning',
      icon: 'wifi',
      tab: 'budget',
      title: { en: 'Bill coming soon', ar: 'فاتورة قريبة' },
      body: {
        en: 'Your internet bill is due in 2 days. Don’t forget to pay.',
        ar: 'فاتورة الإنترنت موعدها بعد يومين. لا تنسى الدفع.',
      },
      action: { en: 'Add reminder', ar: 'إضافة تذكير' },
    },
    {
      id: 'emp-salary-spend',
      severity: 'info',
      icon: 'trending-up',
      tab: 'reports',
      title: { en: 'Salary spending update', ar: 'تقسيم الراتب' },
      body: {
        en: 'You have used 65% of your salary this month.',
        ar: 'تم صرف 65% من راتبك لهذا الشهر.',
      },
      action: { en: 'View details', ar: 'عرض التفاصيل' },
    },
    {
      id: 'emp-savings-goal',
      severity: 'success',
      icon: 'piggy-bank',
      tab: 'goals',
      title: { en: 'Savings goal update', ar: 'هدف الادخار' },
      body: {
        en: 'You are close to your monthly saving goal — only 100 ILS left.',
        ar: 'أنت قريب من هدف الادخار الشهري. ضل 100 شيكل فقط.',
      },
      action: { en: 'View goal', ar: 'عرض الهدف' },
    },
    {
      id: 'emp-subs',
      severity: 'brand',
      icon: 'music',
      tab: 'budget',
      title: { en: 'Subscriptions creeping up', ar: 'تضخم الاشتراكات' },
      body: {
        en: '5 active subscriptions = $80/mo. Cancelling one frees $40+ a year.',
        ar: '٥ اشتراكات شهرية = $80. لو ألغيت واحد، توفر $40+ بالسنة.',
      },
      action: { en: 'Review subs', ar: 'مراجعة الاشتراكات' },
    },
  ],

  /* ------------------------------------------------------------------ */
  /*                          Freelancer                                */
  /* ------------------------------------------------------------------ */
  freelancer: [
    {
      id: 'fl-late-payment',
      severity: 'danger',
      icon: 'file-text',
      tab: 'transactions',
      title: { en: 'Late client payment', ar: 'دفعة متأخرة' },
      body: {
        en: 'A client payment is overdue. Check your unpaid invoices.',
        ar: 'في عميل تأخر بالدفع. راجع الفواتير غير المدفوعة.',
      },
      action: { en: 'View invoices', ar: 'عرض الفواتير' },
    },
    {
      id: 'fl-income-low',
      severity: 'warning',
      icon: 'trending-down',
      tab: 'reports',
      title: { en: 'Income below target', ar: 'الدخل أقل من الهدف' },
      body: {
        en: 'Your current income is 30% below this month’s target.',
        ar: 'دخلك الحالي أقل من هدف الشهر بنسبة 30%.',
      },
      action: { en: 'View projects', ar: 'عرض المشاريع' },
    },
    {
      id: 'fl-safety-fund',
      severity: 'info',
      icon: 'shield',
      tab: 'goals',
      title: { en: 'Safety fund reminder', ar: 'صندوق الأمان' },
      body: {
        en: 'This month’s income is unstable. Consider adding to your safety fund.',
        ar: 'الشهر هذا دخله متغير. حاول تضيف مبلغ لصندوق الأمان.',
      },
      action: { en: 'Add saving', ar: 'إضافة ادخار' },
    },
    {
      id: 'fl-tax-buffer',
      severity: 'brand',
      icon: 'shield',
      tab: 'goals',
      title: { en: 'Set aside 25% for tax', ar: 'خصص 25% للضريبة' },
      body: {
        en: 'Auto-transfer is moving funds to your tax buffer today.',
        ar: 'التحويل التلقائي رح ينقل دفعة لصندوق الضريبة اليوم.',
      },
      action: { en: 'View buffer', ar: 'عرض الصندوق' },
    },
  ],

  /* ------------------------------------------------------------------ */
  /*                          General User                              */
  /* ------------------------------------------------------------------ */
  general: [
    {
      id: 'gn-budget-alert',
      severity: 'warning',
      icon: 'trending-up',
      tab: 'reports',
      title: { en: 'Budget alert', ar: 'تنبيه ميزانية' },
      body: {
        en: 'You spent more than usual this week.',
        ar: 'أنت صرفت أكثر من المعتاد هذا الأسبوع.',
      },
      action: { en: 'View expenses', ar: 'عرض المصاريف' },
    },
    {
      id: 'gn-upcoming',
      severity: 'info',
      icon: 'calendar',
      tab: 'budget',
      title: { en: 'Upcoming payment', ar: 'فاتورة قريبة' },
      body: {
        en: 'You have a payment due in 3 days.',
        ar: 'عندك دفعة قريبة خلال 3 أيام.',
      },
      action: { en: 'View bills', ar: 'عرض الفواتير' },
    },
    {
      id: 'gn-tip',
      severity: 'brand',
      icon: 'sparkles',
      tab: 'budget',
      title: { en: 'Financial tip', ar: 'نصيحة مالية' },
      body: {
        en: 'Try setting a daily spending limit to keep your budget on track.',
        ar: 'جرب تحدد حد يومي للمصاريف حتى تسيطر على الميزانية.',
      },
      action: { en: 'Open budget', ar: 'فتح الميزانية' },
    },
    {
      id: 'gn-savings',
      severity: 'success',
      icon: 'piggy-bank',
      tab: 'goals',
      title: { en: 'Savings on track', ar: 'الادخار على المسار' },
      body: {
        en: 'You added 4.6% to your savings this month — keep it up.',
        ar: 'زدت ادخارك بنسبة 4.6% هذا الشهر — استمر.',
      },
      action: { en: 'View goals', ar: 'عرض الأهداف' },
    },
  ],
};

/**
 * Pick the next notification for the given role, rotating through the list
 * across visits (kept in localStorage). When dashboard data is provided, we
 * also boost the priority of items that match real conditions (e.g. low
 * balance, subs over budget) so the alert always feels relevant.
 *
 * @param {string} roleId  Selected user-type id
 * @param {string} lang    'en' | 'ar'
 * @param {object} data    Optional dashboard data for the role
 */
export function pickNotification(roleId, lang = 'en', data) {
  const list = N[roleId] || N.general;
  if (!list || list.length === 0) return null;

  const rotateKey = `masrafji-notif-${roleId}`;
  let last = -1;
  try {
    const v = window.localStorage.getItem(rotateKey);
    if (v != null) last = parseInt(v, 10);
  } catch {
    /* ignore */
  }

  const ranked = rankByDashboard(list, data);
  const startIdx = (last + 1) % ranked.length;
  const chosen = ranked[startIdx] || ranked[0];

  try {
    window.localStorage.setItem(rotateKey, String(startIdx));
  } catch {
    /* ignore */
  }

  return {
    id: chosen.id,
    severity: chosen.severity,
    icon: chosen.icon,
    tab: chosen.tab,
    title: chosen.title[lang] || chosen.title.en,
    body: chosen.body[lang] || chosen.body.en,
    action: chosen.action?.[lang] || chosen.action?.en,
  };
}

/**
 * Lightweight relevance ranker. We re-order the role list so notifications
 * matching live dashboard conditions surface first — but rotation still
 * cycles within that order so the user sees variety across visits.
 */
function rankByDashboard(list, data) {
  if (!data) return list;
  const score = (n) => {
    let s = 0;

    // Bills due within 7 days
    if (data.bills?.some((b) => isWithinDays(b.due, 7)) && /bill|electric|wifi|internet|upcoming/i.test(n.id))
      s += 3;

    // Overdue invoices / late payments
    if (data.alerts?.some((a) => /overdue|late/i.test(a.title)) && /overdue|late/i.test(n.id)) s += 4;

    // Budget over limit
    if (data.budgets?.some((b) => b.spent > b.limit) && /high|expenses|over|alert|subs/i.test(n.id)) s += 2;

    // Goal close to completion (>= 70%)
    if (
      data.goals?.some((g) => g.target && g.saved / g.target >= 0.7 && g.saved / g.target < 1) &&
      /goal|emergency|phone|fund/i.test(n.id)
    )
      s += 2;

    return s;
  };
  return [...list].sort((a, b) => score(b) - score(a));
}

function isWithinDays(iso, days) {
  if (!iso) return false;
  const d = new Date(iso).getTime();
  const now = Date.now();
  return d - now < days * 86400000 && d - now > -86400000;
}

export default N;
