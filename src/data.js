/**
 * Masrafji — role + dashboard dummy data.
 *
 * All amounts are stored in USD and converted to the user's selected
 * display currency at render time using `convert(amount, currency)`.
 */

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', label: 'US Dollar', labelAr: 'دولار أمريكي', rate: 1 },
  ILS: { code: 'ILS', symbol: '₪', label: 'Israeli Shekel', labelAr: 'شيكل إسرائيلي', rate: 3.7 },
  JOD: { code: 'JOD', symbol: 'JD', label: 'Jordanian Dinar', labelAr: 'دينار أردني', rate: 0.71 },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro', labelAr: 'يورو', rate: 0.92 },
};

/**
 * Goal options shown in onboarding step 2. The actual labels are translated
 * via `t('goals.<id>')` in the i18n dictionary.
 */
export const FINANCIAL_GOALS = [
  { id: 'organize-expenses', icon: 'wallet' },
  { id: 'save-money', icon: 'piggy-bank' },
  { id: 'pay-bills', icon: 'file-text' },
  { id: 'manage-family', icon: 'users' },
  { id: 'manage-business', icon: 'briefcase' },
  { id: 'track-debts', icon: 'shield' },
  { id: 'emergency-fund', icon: 'heart' },
  { id: 'track-investments', icon: 'trending-up' },
];

/**
 * Income type options shown in onboarding step 3. Labels translated via
 * `t('incomeTypes.<id>')`.
 */
export const INCOME_TYPES = [
  { id: 'fixed-salary', icon: 'wallet' },
  { id: 'variable', icon: 'trending-up' },
  { id: 'allowance', icon: 'gift' },
  { id: 'business', icon: 'briefcase' },
  { id: 'multi', icon: 'layers' },
  { id: 'none', icon: 'compass' },
];

export const ROLES = [
  {
    id: 'family-parent',
    name: 'Family Parent',
    tagline: 'Run a household with confidence',
    description:
      'Manage household income, monthly bills, kids and a long-term family safety net — all in one place.',
    examples: ['Salary & rent', 'Bills & groceries', 'Kids & school fees'],
    accent: ['#3961fb', '#7c3aed'],
    icon: 'home',
  },
  {
    id: 'business',
    name: 'Business Owner',
    tagline: 'See cash flow at a glance',
    description:
      'Track revenue, expenses, payroll, invoices and tax — keep the company financially healthy.',
    examples: ['Revenue & P&L', 'Invoices & taxes', 'Payroll & equity'],
    accent: ['#0ea5e9', '#1d4ed8'],
    icon: 'briefcase',
  },
  {
    id: 'school-student',
    name: 'School Student',
    tagline: 'Allowance, savings, fun goals',
    description:
      'A friendly tracker for allowance, daily spending and saving up for the things you really want.',
    examples: ['Daily allowance', 'Save for a phone', 'Earn badges'],
    accent: ['#f97316', '#ec4899'],
    icon: 'sparkles',
  },
  {
    id: 'university-student',
    name: 'University Student',
    tagline: 'Live independently, smartly',
    description:
      'Balance allowance with part-time income, rent, books and weekly food — without breaking the budget.',
    examples: ['Allowance & part-time', 'Rent & food', 'Books & subs'],
    accent: ['#10b981', '#0d9488'],
    icon: 'graduation-cap',
  },
  {
    id: 'employee',
    name: 'Employee',
    tagline: 'Salary, bills, smart savings',
    description:
      'A clean salary-based plan with the 50/30/20 rule, an emergency fund and a financial health score.',
    examples: ['Monthly salary', 'Loans & rent', 'Investments'],
    accent: ['#6366f1', '#9333ea'],
    icon: 'wallet',
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
    tagline: 'Tame irregular income',
    description:
      'Track invoices, late-paying clients, business expenses and forecast cash for slower months.',
    examples: ['Invoices & clients', 'Tax buffer', 'Income forecast'],
    accent: ['#f59e0b', '#dc2626'],
    icon: 'rocket',
  },
  {
    id: 'general',
    name: 'General User',
    tagline: 'A flexible money OS',
    description:
      'A balanced dashboard for anyone — income, expenses, savings, bills, goals and smart insights.',
    examples: ['Balance & income', 'Bills & goals', 'Smart insights'],
    accent: ['#0f172a', '#475569'],
    icon: 'compass',
  },
];

export const ROLE_BY_ID = ROLES.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {});

const today = new Date(2026, 3, 30);
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const inDays = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

function cashflow(seedIn, seedOut, incomeVar = 80, expenseVar = 60) {
  return months.map((m, i) => ({
    month: m,
    income: Math.round(seedIn + Math.sin(i * 1.2) * incomeVar + i * 25),
    expenses: Math.round(seedOut + Math.cos(i * 0.9) * expenseVar + i * 18),
  }));
}

/**
 * Dummy data for each role.
 * `kpis`: balance, income, expenses, savings (USD); `delta` is %.
 * `cashflow`: 6 months of income/expenses (USD).
 * `categories`: spending breakdown.
 * `transactions`: ledger.
 * `goals`, `bills`, `alerts`, `budgets`: list cards.
 * `roleSpecific`: extra cards bound to the persona.
 */
export const DASHBOARD_DATA = {
  'family-parent': {
    user: { name: 'Layla H.', nameAr: 'ليلى ح.', initials: 'LH' },
    kpis: {
      balance: { value: 18420, delta: 4.2, sub: 'across 3 accounts', subAr: 'في ٣ حسابات' },
      income: { value: 6400, delta: 2.1, sub: 'salary + side gig', subAr: 'راتب + شغل جانبي' },
      expenses: { value: 4180, delta: 6.5, sub: 'higher utility bills', subAr: 'فواتير أعلى من المعتاد' },
      savings: { value: 14200, delta: 3.8, sub: 'family emergency fund', subAr: 'صندوق طوارئ الأسرة' },
    },
    cashflow: cashflow(6200, 4100, 600, 320),
    categories: [
      { name: 'Groceries', value: 920, color: '#10b981' },
      { name: 'Utilities', value: 480, color: '#0ea5e9' },
      { name: 'Children', value: 760, color: '#f59e0b' },
      { name: 'Rent', value: 1400, color: '#6366f1' },
      { name: 'Transport', value: 320, color: '#ec4899' },
      { name: 'Other', value: 300, color: '#94a3b8' },
    ],
    transactions: [
      { id: 't1', name: 'Carrefour', nameAr: 'كارفور', category: 'Groceries', amount: -142.5, date: daysAgo(0), icon: 'shopping-cart' },
      { id: 't2', name: 'Salary — Acme Co.', nameAr: 'الراتب — شركة Acme', category: 'Income', amount: 4200, date: daysAgo(1), icon: 'trending-up' },
      { id: 't3', name: 'School fees — Year 4', nameAr: 'رسوم مدرسة — الصف الرابع', category: 'Children', amount: -380, date: daysAgo(2), icon: 'graduation-cap' },
      { id: 't4', name: 'Carrefour', nameAr: 'كارفور', category: 'Groceries', amount: -142.5, date: daysAgo(3), icon: 'shopping-cart' },
      { id: 't5', name: 'Electricity bill', nameAr: 'فاتورة الكهرباء', category: 'Utilities', amount: -98.3, date: daysAgo(4), icon: 'zap' },
      { id: 't6', name: 'Pediatrician — Mira', nameAr: 'طبيبة الأطفال — ميرا', category: 'Children', amount: -55, date: daysAgo(5), icon: 'heart' },
      { id: 't7', name: 'Side project', nameAr: 'مشروع جانبي', category: 'Income', amount: 320, date: daysAgo(6), icon: 'briefcase' },
      { id: 't8', name: 'Pharmacy', nameAr: 'الصيدلية', category: 'Health', amount: -38.4, date: daysAgo(7), icon: 'plus' },
      { id: 't9', name: 'Netflix', nameAr: 'نتفليكس', category: 'Subs', amount: -14.99, date: daysAgo(2), icon: 'tv' },
      { id: 't10', name: 'Netflix', nameAr: 'نتفليكس', category: 'Subs', amount: -14.99, date: daysAgo(33), icon: 'tv' },
      { id: 't11', name: 'Netflix', nameAr: 'نتفليكس', category: 'Subs', amount: -14.99, date: daysAgo(63), icon: 'tv' },
      { id: 't12', name: 'Internet — Orange', nameAr: 'الإنترنت — أورنج', category: 'Utilities', amount: -42, date: daysAgo(8), icon: 'wifi' },
    ],
    goals: [
      { id: 'g1', name: 'Emergency fund', nameAr: 'صندوق الطوارئ', target: 18000, saved: 14200, deadline: 'Dec 2026', deadlineAr: 'كانون١ ٢٠٢٦', icon: 'shield' },
      { id: 'g2', name: 'Family vacation', nameAr: 'إجازة العائلة', target: 4500, saved: 1850, deadline: 'Jul 2026', deadlineAr: 'تموز ٢٠٢٦', icon: 'plane' },
      { id: 'g3', name: 'Kids college', nameAr: 'جامعة الأولاد', target: 30000, saved: 6200, deadline: '2032', deadlineAr: '٢٠٣٢', icon: 'graduation-cap' },
    ],
    bills: [
      { id: 'b1', name: 'Rent', nameAr: 'الإيجار', amount: 1400, due: inDays(2), status: 'upcoming', icon: 'home' },
      { id: 'b2', name: 'Electricity', nameAr: 'الكهرباء', amount: 98, due: inDays(5), status: 'upcoming', icon: 'zap' },
      { id: 'b3', name: 'Water', nameAr: 'الماء', amount: 32, due: inDays(7), status: 'upcoming', icon: 'droplets' },
      { id: 'b4', name: 'Internet & phone', nameAr: 'إنترنت + هاتف', amount: 64, due: inDays(11), status: 'upcoming', icon: 'wifi' },
      { id: 'b5', name: 'Netflix', nameAr: 'نتفليكس', amount: 14.99, due: inDays(14), status: 'upcoming', icon: 'tv' },
    ],
    alerts: [
      { severity: 'warning', title: 'Groceries 22% over plan', titleAr: 'المشتريات تجاوزت الخطة بـ ٢٢٪', body: "You've spent $920 of $750 budgeted for groceries this month.", bodyAr: 'صرفت ٩٢٠$ من أصل ٧٥٠$ مخصصة للمشتريات هذا الشهر.' },
      { severity: 'info', title: 'Rent due in 2 days', titleAr: 'الإيجار مستحق خلال يومين', body: 'Auto-pay is enabled. Make sure $1,400 is in your checking account.', bodyAr: 'الدفع التلقائي مفعّل. تأكد من وجود ١٤٠٠$ في حسابك.' },
      { severity: 'success', title: 'Emergency fund on track', titleAr: 'صندوق الطوارئ على المسار', body: "79% complete — you're 3 weeks ahead of schedule.", bodyAr: 'مكتمل ٧٩٪ — متقدم بـ ٣ أسابيع عن الجدول.' },
    ],
    budgets: [
      { category: 'Groceries', icon: 'shopping-cart', color: '#10b981', spent: 920, limit: 750 },
      { category: 'Children', icon: 'users', color: '#f59e0b', spent: 760, limit: 900 },
      { category: 'Utilities', icon: 'zap', color: '#0ea5e9', spent: 480, limit: 550 },
      { category: 'Transport', icon: 'car', color: '#ec4899', spent: 320, limit: 400 },
      { category: 'Dining', icon: 'utensils', color: '#a855f7', spent: 180, limit: 250 },
    ],
  },

  business: {
    user: { name: 'Omar K.', nameAr: 'عمر ك.', initials: 'OK' },
    kpis: {
      balance: { value: 142800, delta: 8.4, sub: 'company accounts', subAr: 'حسابات الشركة' },
      income: { value: 48200, delta: 12.5, sub: 'this month revenue', subAr: 'إيرادات هذا الشهر' },
      expenses: { value: 31650, delta: 4.8, sub: 'opex + payroll', subAr: 'مصاريف تشغيلية + رواتب' },
      savings: { value: 32000, delta: 6.2, sub: 'tax buffer', subAr: 'صندوق الضريبة' },
    },
    cashflow: cashflow(46000, 31000, 6500, 3200),
    categories: [
      { name: 'Payroll', value: 18000, color: '#6366f1' },
      { name: 'Marketing', value: 4200, color: '#ec4899' },
      { name: 'Tools & SaaS', value: 1800, color: '#0ea5e9' },
      { name: 'Office', value: 2400, color: '#f59e0b' },
      { name: 'Travel', value: 1450, color: '#10b981' },
      { name: 'Tax buffer', value: 3800, color: '#94a3b8' },
    ],
    transactions: [
      { id: 't1', name: 'Stripe payout', nameAr: 'دفعة Stripe', category: 'Revenue', amount: 12400, date: daysAgo(0), icon: 'trending-up' },
      { id: 't2', name: 'Payroll — Apr 2026', nameAr: 'رواتب — نيسان ٢٠٢٦', category: 'Payroll', amount: -18000, date: daysAgo(1), icon: 'users' },
      { id: 't3', name: 'AWS', nameAr: 'AWS', category: 'Tools', amount: -1240, date: daysAgo(2), icon: 'cloud' },
      { id: 't4', name: 'Invoice #INV-204 — Bayan Tech', nameAr: 'فاتورة INV-204 — بيان تك', category: 'Revenue', amount: 6800, date: daysAgo(3), icon: 'file' },
      { id: 't5', name: 'Google Ads', nameAr: 'إعلانات جوجل', category: 'Marketing', amount: -950, date: daysAgo(4), icon: 'megaphone' },
      { id: 't6', name: 'Office rent', nameAr: 'إيجار المكتب', category: 'Office', amount: -2400, date: daysAgo(5), icon: 'building' },
      { id: 't7', name: 'Notion + Linear', nameAr: 'Notion + Linear', category: 'Tools', amount: -198, date: daysAgo(6), icon: 'layers' },
      { id: 't8', name: 'Invoice #INV-203 — Studio Mira', nameAr: 'فاتورة INV-203 — استوديو ميرا', category: 'Revenue', amount: 3200, date: daysAgo(7), icon: 'file' },
    ],
    goals: [
      { id: 'g1', name: 'Q2 revenue target', nameAr: 'هدف إيرادات الربع الثاني', target: 150000, saved: 96400, deadline: 'Jun 2026', deadlineAr: 'حزيران ٢٠٢٦', icon: 'target' },
      { id: 'g2', name: 'Hire Senior Engineer', nameAr: 'توظيف مهندس أول', target: 12000, saved: 8200, deadline: 'May 2026', deadlineAr: 'أيار ٢٠٢٦', icon: 'user-plus' },
      { id: 'g3', name: 'Equipment refresh', nameAr: 'تجديد المعدات', target: 8000, saved: 2300, deadline: 'Aug 2026', deadlineAr: 'آب ٢٠٢٦', icon: 'monitor' },
    ],
    bills: [
      { id: 'b1', name: 'Office rent', nameAr: 'إيجار المكتب', amount: 2400, due: inDays(3), status: 'upcoming', icon: 'building' },
      { id: 'b2', name: 'Quarterly tax filing', nameAr: 'الإقرار الضريبي الربعي', amount: 5800, due: inDays(9), status: 'upcoming', icon: 'file-text' },
      { id: 'b3', name: 'AWS', nameAr: 'AWS', amount: 1240, due: inDays(14), status: 'upcoming', icon: 'cloud' },
      { id: 'b4', name: 'Linear', nameAr: 'Linear', amount: 96, due: inDays(20), status: 'upcoming', icon: 'layers' },
    ],
    alerts: [
      { severity: 'danger', title: 'Invoice INV-198 overdue', titleAr: 'الفاتورة INV-198 متأخرة', body: 'Bayan Tech is 12 days late on $6,800. Send a reminder?', bodyAr: 'بيان تك متأخرة ١٢ يوم على ٦٨٠٠$. ترسل تذكير؟' },
      { severity: 'warning', title: 'Marketing spend +28%', titleAr: 'مصاريف التسويق +٢٨٪', body: "You're trending $1,200 over plan. Consider pausing low-CTR ads.", bodyAr: 'متجاوز الخطة بـ ١٢٠٠$. فكر بإيقاف الإعلانات الضعيفة.' },
      { severity: 'success', title: 'Revenue +12.5% vs March', titleAr: 'الإيرادات +١٢٫٥٪ مقارنة بآذار', body: 'Strong month — your Q2 target is now within reach.', bodyAr: 'شهر قوي — هدف الربع الثاني صار قريب.' },
    ],
    budgets: [
      { category: 'Payroll', icon: 'users', color: '#6366f1', spent: 18000, limit: 18000 },
      { category: 'Marketing', icon: 'megaphone', color: '#ec4899', spent: 4200, limit: 3000 },
      { category: 'Tools & SaaS', icon: 'layers', color: '#0ea5e9', spent: 1800, limit: 2000 },
      { category: 'Office', icon: 'building', color: '#f59e0b', spent: 2400, limit: 2500 },
      { category: 'Travel', icon: 'plane', color: '#10b981', spent: 1450, limit: 2000 },
    ],
  },

  'school-student': {
    user: { name: 'Yara S.', nameAr: 'يارا س.', initials: 'YS' },
    kpis: {
      balance: { value: 138, delta: 12.4, sub: 'in your Hasala', subAr: 'في حصّالتك' },
      income: { value: 80, delta: 0, sub: 'weekly allowance', subAr: 'مصروف أسبوعي' },
      expenses: { value: 42, delta: -8.2, sub: 'this week', subAr: 'هذا الأسبوع' },
      savings: { value: 220, delta: 18.6, sub: 'PlayStation fund', subAr: 'صندوق البلايستيشن' },
    },
    cashflow: months.map((m, i) => ({
      month: m,
      income: 320 + i * 20,
      expenses: 180 + Math.round(Math.sin(i) * 30) + i * 14,
    })),
    categories: [
      { name: 'Food & snacks', value: 18, color: '#10b981' },
      { name: 'Transport', value: 8, color: '#0ea5e9' },
      { name: 'Entertainment', value: 10, color: '#ec4899' },
      { name: 'School', value: 6, color: '#f59e0b' },
    ],
    transactions: [
      { id: 't1', name: 'Cafeteria — chicken roll', nameAr: 'الكافتيريا — رول دجاج', category: 'Food', amount: -2.5, date: daysAgo(0), icon: 'utensils' },
      { id: 't2', name: 'Weekly allowance', nameAr: 'المصروف الأسبوعي', category: 'Income', amount: 20, date: daysAgo(1), icon: 'gift' },
      { id: 't3', name: 'Bus card top-up', nameAr: 'تعبئة كرت الباص', category: 'Transport', amount: -4, date: daysAgo(2), icon: 'bus' },
      { id: 't4', name: 'Cinema with friends', nameAr: 'سينما مع الأصحاب', category: 'Entertainment', amount: -7, date: daysAgo(3), icon: 'film' },
      { id: 't5', name: 'Notebook + pens', nameAr: 'دفاتر + أقلام', category: 'School', amount: -3.2, date: daysAgo(4), icon: 'book' },
      { id: 't6', name: 'Birthday from Khalti', nameAr: 'هدية عيد ميلاد من خالتي', category: 'Income', amount: 30, date: daysAgo(5), icon: 'gift' },
      { id: 't7', name: 'Ice cream', nameAr: 'بوظة', category: 'Food', amount: -1.8, date: daysAgo(6), icon: 'utensils' },
    ],
    goals: [
      { id: 'g1', name: 'New PlayStation 5', nameAr: 'بلايستيشن ٥', target: 500, saved: 220, deadline: 'Sep 2026', deadlineAr: 'أيلول ٢٠٢٦', icon: 'gamepad' },
      { id: 'g2', name: 'Mountain bike', nameAr: 'دراجة جبلية', target: 220, saved: 95, deadline: 'Jul 2026', deadlineAr: 'تموز ٢٠٢٦', icon: 'bike' },
      { id: 'g3', name: 'Football boots', nameAr: 'بسطار كرة قدم', target: 80, saved: 80, deadline: 'Done', deadlineAr: 'تم', icon: 'circle' },
    ],
    bills: [
      { id: 'b1', name: 'Bus card refill', nameAr: 'تعبئة كرت الباص', amount: 12, due: inDays(3), status: 'upcoming', icon: 'bus' },
      { id: 'b2', name: 'Spotify', nameAr: 'سبوتيفاي', amount: 4.99, due: inDays(8), status: 'upcoming', icon: 'music' },
    ],
    alerts: [
      { severity: 'success', title: '5-day saving streak!', titleAr: 'سلسلة ادخار ٥ أيام!', body: "You've put a little aside every day — keep it going for a 7-day badge.", bodyAr: 'وفّرت شي بسيط كل يوم — كمّل لتاخد شارة ٧ أيام.' },
      { severity: 'info', title: 'Phone goal: 36% there', titleAr: 'هدف التلفون: ٣٦٪', body: "At your current pace, you'll hit $600 by August.", bodyAr: 'بهاي السرعة، رح توصل لـ ٦٠٠$ بشهر آب.' },
      { severity: 'warning', title: 'Spent $7 on cinema', titleAr: 'صرفت ٧$ على السينما', body: "That's about a third of this week's fun budget. Stay aware!", bodyAr: 'هاد تقريباً ثلث ميزانية الترفيه هالأسبوع. خلّيك منتبه!' },
    ],
    budgets: [
      { category: 'Food & snacks', icon: 'utensils', color: '#10b981', spent: 18, limit: 25 },
      { category: 'Transport', icon: 'bus', color: '#0ea5e9', spent: 8, limit: 10 },
      { category: 'Entertainment', icon: 'film', color: '#ec4899', spent: 10, limit: 12 },
      { category: 'School', icon: 'book', color: '#f59e0b', spent: 6, limit: 10 },
    ],
  },

  'university-student': {
    user: { name: 'Sami J.', nameAr: 'سامي ج.', initials: 'SJ' },
    kpis: {
      balance: { value: 1240, delta: 3.4, sub: 'checking + cash', subAr: 'حساب + كاش' },
      income: { value: 1250, delta: 15.0, sub: 'allowance + side gigs', subAr: 'مصروف + شغل جانبي' },
      expenses: { value: 980, delta: 4.2, sub: 'this month', subAr: 'هذا الشهر' },
      savings: { value: 720, delta: 6.8, sub: 'rainy-day fund', subAr: 'صندوق طوارئ' },
    },
    cashflow: cashflow(1230, 940, 140, 110),
    categories: [
      { name: 'Rent / dorm', value: 380, color: '#6366f1' },
      { name: 'Groceries', value: 145, color: '#10b981' },
      { name: 'Eating out', value: 85, color: '#22c55e' },
      { name: 'Transport', value: 90, color: '#0ea5e9' },
      { name: 'Books', value: 130, color: '#f59e0b' },
      { name: 'Subs & fun', value: 95, color: '#ec4899' },
      { name: 'Other', value: 55, color: '#94a3b8' },
    ],
    transactions: [
      { id: 't0', name: 'Supermarket — weekly groceries', nameAr: 'مشتريات السوبرماركت', category: 'Groceries', amount: -82.64, date: daysAgo(0), icon: 'shopping-cart', scanned: true },
      { id: 't1', name: 'Tutoring — Math 1A', nameAr: 'دروس خصوصية — رياضيات', category: 'Income', amount: 60, date: daysAgo(0), icon: 'briefcase' },
      { id: 't2', name: 'Lunch — Bun & Co', nameAr: 'غداء — Bun & Co', category: 'Eating out', amount: -8.5, date: daysAgo(1), icon: 'utensils' },
      { id: 't3', name: 'Groceries — Carrefour Express', nameAr: 'مشتريات — كارفور إكسبرس', category: 'Groceries', amount: -38.4, date: daysAgo(1), icon: 'shopping-cart' },
      { id: 't4', name: 'Dorm fee — April', nameAr: 'سكن جامعي — نيسان', category: 'Rent', amount: -380, date: daysAgo(2), icon: 'home' },
      { id: 't5', name: 'Internet — Orange Home', nameAr: 'الإنترنت — أورنج', category: 'Bills', amount: -25, date: daysAgo(3), icon: 'wifi' },
      { id: 't6', name: 'Calculus textbook', nameAr: 'كتاب التفاضل', category: 'Books', amount: -45, date: daysAgo(3), icon: 'book' },
      { id: 't7', name: 'Family allowance', nameAr: 'مصروف الأهل', category: 'Income', amount: 600, date: daysAgo(4), icon: 'gift' },
      { id: 't8', name: 'Campus library shift', nameAr: 'دوام مكتبة الجامعة', category: 'Income', amount: 80, date: daysAgo(4), icon: 'briefcase' },
      { id: 't9', name: 'Bus pass', nameAr: 'اشتراك الباص', category: 'Transport', amount: -28, date: daysAgo(5), icon: 'bus' },
      { id: 't10', name: 'Spotify Premium (student)', nameAr: 'سبوتيفاي طلابي', category: 'Subs', amount: -4.99, date: daysAgo(6), icon: 'music' },
      { id: 't11', name: 'Coffee — study group', nameAr: 'قهوة — مجموعة الدراسة', category: 'Eating out', amount: -3.2, date: daysAgo(7), icon: 'utensils' },
      { id: 't12', name: 'Freelance gig — landing page', nameAr: 'فريلانس — صفحة هبوط', category: 'Income', amount: 110, date: daysAgo(7), icon: 'monitor' },
      { id: 't13', name: 'Visa · Amazon.com', nameAr: 'فيزا · Amazon.com', category: 'Subs', amount: -34.99, date: daysAgo(0), icon: 'shopping-bag' },
      { id: 't14', name: 'Visa · Amazon.com', nameAr: 'فيزا · Amazon.com', category: 'Subs', amount: -34.99, date: daysAgo(0), icon: 'shopping-bag' },
      { id: 't15', name: 'Spotify Premium (student)', nameAr: 'سبوتيفاي طلابي', category: 'Subs', amount: -4.99, date: daysAgo(36), icon: 'music' },
      { id: 't16', name: 'Spotify Premium (student)', nameAr: 'سبوتيفاي طلابي', category: 'Subs', amount: -4.99, date: daysAgo(66), icon: 'music' },
      { id: 't17', name: 'Internet — Orange Home', nameAr: 'الإنترنت — أورنج', category: 'Bills', amount: -25, date: daysAgo(33), icon: 'wifi' },
    ],
    goals: [
      { id: 'g1', name: 'New laptop', nameAr: 'لابتوب جديد', target: 1200, saved: 380, deadline: 'Sep 2026', deadlineAr: 'أيلول ٢٠٢٦', icon: 'monitor' },
      { id: 'g2', name: '3-month emergency buffer', nameAr: 'احتياطي ٣ شهور', target: 2400, saved: 720, deadline: 'Dec 2026', deadlineAr: 'كانون١ ٢٠٢٦', icon: 'shield' },
      { id: 'g3', name: 'Summer trip', nameAr: 'رحلة الصيف', target: 900, saved: 240, deadline: 'Jul 2026', deadlineAr: 'تموز ٢٠٢٦', icon: 'plane' },
    ],
    bills: [
      { id: 'b1', name: 'Dorm fee', nameAr: 'السكن الجامعي', amount: 380, due: inDays(4), status: 'upcoming', icon: 'home' },
      { id: 'b2', name: 'Internet — Orange Home', nameAr: 'الإنترنت — أورنج', amount: 25, due: inDays(6), status: 'upcoming', icon: 'wifi' },
      { id: 'b3', name: 'Phone plan', nameAr: 'باقة الهاتف', amount: 18, due: inDays(9), status: 'upcoming', icon: 'phone' },
      { id: 'b4', name: 'Spotify (student)', nameAr: 'سبوتيفاي طلابي', amount: 4.99, due: inDays(14), status: 'upcoming', icon: 'music' },
      { id: 'b5', name: 'Notion AI', nameAr: 'Notion AI', amount: 8, due: inDays(20), status: 'upcoming', icon: 'sparkles' },
    ],
    alerts: [
      {
        severity: 'warning',
        title: 'Only $25 left in Groceries this week',
        titleAr: 'بقي فقط ٢٥$ من ميزانية المشتريات لهذا الأسبوع',
        body: 'Snap a receipt with the Smart Receipt scanner — we\'ll suggest 3 cheap recipes from what you bought.',
        bodyAr: 'صوّر إيصال المشتريات بـ Smart Receipt — رح نقترحلك ٣ وصفات رخيصة من اللي اشتريته.',
        action: 'smartReceipt',
      },
      { severity: 'info', title: 'Side gigs: +$190 this week', titleAr: 'الشغل الجانبي: +١٩٠$ هذا الأسبوع', body: 'Tutoring + a freelance landing page covered ~16% of your monthly expenses.', bodyAr: 'الدروس + صفحة هبوط فريلانس غطّت تقريباً ١٦٪ من مصاريف الشهر.' },
      { severity: 'success', title: '3-month buffer: 30%', titleAr: 'احتياطي ٣ شهور: ٣٠٪', body: "You're on track to hit a 3-month safety net by December.", bodyAr: 'على المسار للوصول لاحتياطي ٣ شهور بحلول كانون الأول.' },
      { severity: 'info', title: 'Dorm fee due in 4 days', titleAr: 'دفعة السكن خلال ٤ أيام', body: '$380 will leave your account on Friday — make sure your balance covers it.', bodyAr: '٣٨٠$ رح ينخصموا الجمعة — تأكّد إنه رصيدك بيغطي.' },
    ],
    budgets: [
      { category: 'Groceries', icon: 'shopping-cart', color: '#10b981', spent: 145, limit: 170 },
      { category: 'Eating out', icon: 'utensils', color: '#22c55e', spent: 85, limit: 90 },
      { category: 'Rent', icon: 'home', color: '#6366f1', spent: 380, limit: 380 },
      { category: 'Transport', icon: 'bus', color: '#0ea5e9', spent: 90, limit: 100 },
      { category: 'Books', icon: 'book', color: '#f59e0b', spent: 130, limit: 150 },
      { category: 'Subs & fun', icon: 'music', color: '#ec4899', spent: 95, limit: 80 },
    ],
  },

  employee: {
    user: { name: 'Nadia A.', nameAr: 'نادية أ.', initials: 'NA' },
    kpis: {
      balance: { value: 9820, delta: 2.6, sub: 'checking + savings', subAr: 'حساب + ادخار' },
      income: { value: 4200, delta: 0, sub: 'monthly salary', subAr: 'الراتب الشهري' },
      expenses: { value: 2840, delta: 3.2, sub: 'this month', subAr: 'هذا الشهر' },
      savings: { value: 6400, delta: 5.4, sub: 'emergency + invest', subAr: 'طوارئ + استثمار' },
    },
    cashflow: cashflow(4150, 2700, 90, 220),
    categories: [
      { name: 'Rent', value: 1100, color: '#6366f1' },
      { name: 'Bills', value: 280, color: '#0ea5e9' },
      { name: 'Loan', value: 320, color: '#ef4444' },
      { name: 'Food', value: 410, color: '#10b981' },
      { name: 'Subs', value: 80, color: '#ec4899' },
      { name: 'Other', value: 650, color: '#94a3b8' },
    ],
    transactions: [
      { id: 't1', name: 'Salary — Inova LLC', nameAr: 'الراتب — شركة إنوفا', category: 'Income', amount: 4200, date: daysAgo(1), icon: 'trending-up' },
      { id: 't2', name: 'Rent — apartment', nameAr: 'إيجار الشقة', category: 'Rent', amount: -1100, date: daysAgo(2), icon: 'home' },
      { id: 't3', name: 'Car loan installment', nameAr: 'قسط قرض السيارة', category: 'Loan', amount: -320, date: daysAgo(3), icon: 'car' },
      { id: 't4', name: 'Electricity', nameAr: 'الكهرباء', category: 'Bills', amount: -84, date: daysAgo(4), icon: 'zap' },
      { id: 't5', name: 'Groceries — Spinneys', nameAr: 'مشتريات — Spinneys', category: 'Food', amount: -118, date: daysAgo(5), icon: 'shopping-cart' },
      { id: 't6', name: 'Index fund — VOO', nameAr: 'صندوق مؤشر — VOO', category: 'Invest', amount: -400, date: daysAgo(6), icon: 'trending-up' },
      { id: 't7', name: 'Gym membership', nameAr: 'اشتراك النادي', category: 'Health', amount: -45, date: daysAgo(7), icon: 'activity' },
      { id: 't8', name: 'Spotify', nameAr: 'سبوتيفاي', category: 'Subs', amount: -9.99, date: daysAgo(8), icon: 'music' },
      { id: 't9', name: 'Spotify', nameAr: 'سبوتيفاي', category: 'Subs', amount: -9.99, date: daysAgo(38), icon: 'music' },
      { id: 't10', name: 'Spotify', nameAr: 'سبوتيفاي', category: 'Subs', amount: -9.99, date: daysAgo(68), icon: 'music' },
      { id: 't11', name: 'Gym membership', nameAr: 'اشتراك النادي', category: 'Health', amount: -45, date: daysAgo(37), icon: 'activity' },
      { id: 't12', name: 'Groceries — Spinneys', nameAr: 'مشتريات — Spinneys', category: 'Food', amount: -118, date: daysAgo(2), icon: 'shopping-cart' },
    ],
    goals: [
      { id: 'g1', name: 'Emergency fund (6m)', nameAr: 'صندوق طوارئ (٦ شهور)', target: 12600, saved: 6400, deadline: 'Mar 2027', deadlineAr: 'آذار ٢٠٢٧', icon: 'shield' },
      { id: 'g2', name: 'House down payment', nameAr: 'دفعة أولى لبيت', target: 28000, saved: 4800, deadline: '2028', deadlineAr: '٢٠٢٨', icon: 'home' },
      { id: 'g3', name: 'New laptop', nameAr: 'لابتوب جديد', target: 1800, saved: 950, deadline: 'Aug 2026', deadlineAr: 'آب ٢٠٢٦', icon: 'monitor' },
    ],
    bills: [
      { id: 'b1', name: 'Rent', nameAr: 'الإيجار', amount: 1100, due: inDays(2), status: 'upcoming', icon: 'home' },
      { id: 'b2', name: 'Car loan', nameAr: 'قرض السيارة', amount: 320, due: inDays(6), status: 'upcoming', icon: 'car' },
      { id: 'b3', name: 'Electricity', nameAr: 'الكهرباء', amount: 84, due: inDays(9), status: 'upcoming', icon: 'zap' },
      { id: 'b4', name: 'Internet', nameAr: 'الإنترنت', amount: 38, due: inDays(13), status: 'upcoming', icon: 'wifi' },
      { id: 'b5', name: 'Gym', nameAr: 'النادي', amount: 45, due: inDays(20), status: 'upcoming', icon: 'activity' },
    ],
    alerts: [
      { severity: 'success', title: 'Health score: 82 / 100', titleAr: 'مؤشر الصحة المالية: ٨٢ / ١٠٠', body: 'Strong. Your savings rate (32%) beats the 20% target.', bodyAr: 'قوي. نسبة ادخارك (٣٢٪) أعلى من الهدف ٢٠٪.' },
      { severity: 'info', title: 'Investing $400 today', titleAr: 'استثمار ٤٠٠$ اليوم', body: 'Auto-invest into VOO is queued for tomorrow.', bodyAr: 'الاستثمار التلقائي في VOO مجدول لبكرا.' },
      { severity: 'warning', title: 'Subs creeping up', titleAr: 'الاشتراكات بدأت تتراكم', body: '5 subscriptions = $80/mo. Cancel one to free $40+ a year.', bodyAr: '٥ اشتراكات = ٨٠$ شهرياً. الغ واحد لتوفر ٤٠$ بالسنة.' },
    ],
    budgets: [
      { category: 'Rent', icon: 'home', color: '#6366f1', spent: 1100, limit: 1100 },
      { category: 'Food', icon: 'shopping-cart', color: '#10b981', spent: 410, limit: 500 },
      { category: 'Bills', icon: 'zap', color: '#0ea5e9', spent: 280, limit: 320 },
      { category: 'Loan', icon: 'car', color: '#ef4444', spent: 320, limit: 320 },
      { category: 'Subs', icon: 'music', color: '#ec4899', spent: 80, limit: 60 },
    ],
  },

  freelancer: {
    user: { name: 'Tareq M.', nameAr: 'طارق م.', initials: 'TM' },
    kpis: {
      balance: { value: 11240, delta: 5.8, sub: 'checking + tax buffer', subAr: 'حساب + احتياطي ضريبة' },
      income: { value: 5840, delta: -8.2, sub: 'paid this month', subAr: 'مدفوع هذا الشهر' },
      expenses: { value: 1980, delta: 2.4, sub: 'business + personal', subAr: 'شغل + شخصي' },
      savings: { value: 4200, delta: 1.2, sub: 'tax + buffer', subAr: 'ضريبة + احتياطي' },
    },
    cashflow: months.map((m, i) => ({
      month: m,
      income: Math.round(4200 + Math.sin(i * 1.7) * 1800 + i * 30),
      expenses: Math.round(1700 + Math.cos(i) * 200 + i * 20),
    })),
    categories: [
      { name: 'Software', value: 320, color: '#0ea5e9' },
      { name: 'Hardware', value: 280, color: '#6366f1' },
      { name: 'Health insurance', value: 240, color: '#ef4444' },
      { name: 'Coworking', value: 180, color: '#10b981' },
      { name: 'Personal', value: 760, color: '#f59e0b' },
      { name: 'Other', value: 200, color: '#94a3b8' },
    ],
    transactions: [
      { id: 't1', name: 'Invoice #042 — Bayan Tech', nameAr: 'فاتورة ٠٤٢ — بيان تك', category: 'Income', amount: 2400, date: daysAgo(0), icon: 'file' },
      { id: 't2', name: 'Figma + Linear', nameAr: 'Figma + Linear', category: 'Software', amount: -42, date: daysAgo(1), icon: 'layers' },
      { id: 't3', name: 'Health insurance', nameAr: 'تأمين صحي', category: 'Health', amount: -240, date: daysAgo(2), icon: 'plus' },
      { id: 't4', name: 'Coworking — Beit', nameAr: 'مساحة عمل — بيت', category: 'Coworking', amount: -180, date: daysAgo(3), icon: 'building' },
      { id: 't5', name: 'Invoice #041 — Studio Mira', nameAr: 'فاتورة ٠٤١ — استوديو ميرا', category: 'Income', amount: 1600, date: daysAgo(4), icon: 'file' },
      { id: 't6', name: 'Groceries', nameAr: 'مشتريات', category: 'Personal', amount: -98, date: daysAgo(5), icon: 'shopping-cart' },
      { id: 't7', name: 'External SSD', nameAr: 'هارد خارجي SSD', category: 'Hardware', amount: -180, date: daysAgo(6), icon: 'cpu' },
      { id: 't8', name: 'Tax buffer transfer', nameAr: 'تحويل لصندوق الضريبة', category: 'Tax', amount: -800, date: daysAgo(7), icon: 'shield' },
    ],
    goals: [
      { id: 'g1', name: 'Tax buffer (Q2)', nameAr: 'احتياطي الضريبة (ربع ٢)', target: 3500, saved: 2200, deadline: 'Jun 2026', deadlineAr: 'حزيران ٢٠٢٦', icon: 'shield' },
      { id: 'g2', name: '3-month income buffer', nameAr: 'احتياطي دخل ٣ شهور', target: 12000, saved: 4200, deadline: 'Oct 2026', deadlineAr: 'تشرين١ ٢٠٢٦', icon: 'wallet' },
      { id: 'g3', name: 'New iMac', nameAr: 'iMac جديد', target: 2200, saved: 600, deadline: 'Sep 2026', deadlineAr: 'أيلول ٢٠٢٦', icon: 'monitor' },
    ],
    bills: [
      { id: 'b1', name: 'Health insurance', nameAr: 'تأمين صحي', amount: 240, due: inDays(4), status: 'upcoming', icon: 'plus' },
      { id: 'b2', name: 'Coworking', nameAr: 'مساحة العمل', amount: 180, due: inDays(8), status: 'upcoming', icon: 'building' },
      { id: 'b3', name: 'Software stack', nameAr: 'اشتراكات البرمجيات', amount: 96, due: inDays(11), status: 'upcoming', icon: 'layers' },
      { id: 'b4', name: 'Quarterly tax', nameAr: 'الضريبة الربعية', amount: 1850, due: inDays(28), status: 'upcoming', icon: 'shield' },
    ],
    alerts: [
      { severity: 'danger', title: 'Invoice #038 overdue', titleAr: 'الفاتورة ٠٣٨ متأخرة', body: 'NorthLab is 18 days late on $1,800. Send a final reminder?', bodyAr: 'NorthLab متأخرة ١٨ يوم على ١٨٠٠$. ترسل تذكير أخير؟' },
      { severity: 'warning', title: 'Income -8% vs March', titleAr: 'الدخل -٨٪ مقارنة بآذار', body: 'Lighter month. Your buffer covers ~3 weeks at current spend.', bodyAr: 'شهر أخف. احتياطيك يغطي ٣ أسابيع بمعدل صرفك الحالي.' },
      { severity: 'info', title: 'Set aside 25% for tax', titleAr: 'خصص ٢٥٪ للضريبة', body: 'Auto-transfer is moving $800 to your tax buffer today.', bodyAr: 'التحويل التلقائي رح ينقل ٨٠٠$ لصندوق الضريبة اليوم.' },
    ],
    budgets: [
      { category: 'Software', icon: 'layers', color: '#0ea5e9', spent: 320, limit: 350 },
      { category: 'Hardware', icon: 'cpu', color: '#6366f1', spent: 280, limit: 200 },
      { category: 'Health', icon: 'plus', color: '#ef4444', spent: 240, limit: 240 },
      { category: 'Coworking', icon: 'building', color: '#10b981', spent: 180, limit: 200 },
      { category: 'Personal', icon: 'shopping-cart', color: '#f59e0b', spent: 760, limit: 900 },
    ],
  },

  general: {
    user: { name: 'Alex R.', nameAr: 'علي ر.', initials: 'AR' },
    kpis: {
      balance: { value: 7820, delta: 3.1, sub: 'across accounts', subAr: 'في كل الحسابات' },
      income: { value: 3200, delta: 1.4, sub: 'this month', subAr: 'هذا الشهر' },
      expenses: { value: 1980, delta: -2.3, sub: 'lower than March', subAr: 'أقل من آذار' },
      savings: { value: 4200, delta: 4.6, sub: 'general buffer', subAr: 'احتياطي عام' },
    },
    cashflow: cashflow(3150, 2050, 220, 180),
    categories: [
      { name: 'Housing', value: 880, color: '#6366f1' },
      { name: 'Food', value: 320, color: '#10b981' },
      { name: 'Transport', value: 180, color: '#0ea5e9' },
      { name: 'Bills', value: 220, color: '#f59e0b' },
      { name: 'Fun', value: 180, color: '#ec4899' },
      { name: 'Other', value: 200, color: '#94a3b8' },
    ],
    transactions: [
      { id: 't1', name: 'Salary', nameAr: 'الراتب', category: 'Income', amount: 3200, date: daysAgo(1), icon: 'trending-up' },
      { id: 't2', name: 'Rent', nameAr: 'الإيجار', category: 'Housing', amount: -880, date: daysAgo(2), icon: 'home' },
      { id: 't3', name: 'Groceries', nameAr: 'مشتريات', category: 'Food', amount: -82, date: daysAgo(3), icon: 'shopping-cart' },
      { id: 't4', name: 'Transit pass', nameAr: 'اشتراك المواصلات', category: 'Transport', amount: -38, date: daysAgo(4), icon: 'bus' },
      { id: 't5', name: 'Concert ticket', nameAr: 'تذكرة حفل', category: 'Fun', amount: -65, date: daysAgo(5), icon: 'music' },
      { id: 't6', name: 'Internet', nameAr: 'الإنترنت', category: 'Bills', amount: -42, date: daysAgo(6), icon: 'wifi' },
      { id: 't7', name: 'Coffee — week pass', nameAr: 'قهوة — اشتراك أسبوعي', category: 'Food', amount: -18, date: daysAgo(7), icon: 'utensils' },
    ],
    goals: [
      { id: 'g1', name: 'Emergency fund', nameAr: 'صندوق الطوارئ', target: 8000, saved: 4200, deadline: 'Dec 2026', deadlineAr: 'كانون١ ٢٠٢٦', icon: 'shield' },
      { id: 'g2', name: 'Travel — Tokyo', nameAr: 'سفر — طوكيو', target: 3500, saved: 1200, deadline: 'Nov 2026', deadlineAr: 'تشرين٢ ٢٠٢٦', icon: 'plane' },
      { id: 'g3', name: 'Course — design', nameAr: 'كورس تصميم', target: 600, saved: 240, deadline: 'Jul 2026', deadlineAr: 'تموز ٢٠٢٦', icon: 'palette' },
    ],
    bills: [
      { id: 'b1', name: 'Rent', nameAr: 'الإيجار', amount: 880, due: inDays(3), status: 'upcoming', icon: 'home' },
      { id: 'b2', name: 'Internet', nameAr: 'الإنترنت', amount: 42, due: inDays(7), status: 'upcoming', icon: 'wifi' },
      { id: 'b3', name: 'Phone plan', nameAr: 'باقة الهاتف', amount: 22, due: inDays(11), status: 'upcoming', icon: 'phone' },
      { id: 'b4', name: 'Streaming bundle', nameAr: 'باقة بث', amount: 18, due: inDays(15), status: 'upcoming', icon: 'tv' },
    ],
    alerts: [
      { severity: 'success', title: 'Spending below plan', titleAr: 'الصرف أقل من المخطط', body: "You're tracking $120 under your monthly budget — nice work.", bodyAr: 'متقدم بـ ١٢٠$ تحت الميزانية الشهرية — شغل ممتاز.' },
      { severity: 'info', title: 'Travel goal: 34%', titleAr: 'هدف السفر: ٣٤٪', body: 'Stay on pace and Tokyo is funded by November.', bodyAr: 'كمل بنفس السرعة وطوكيو رح تكون ممولة قبل تشرين الثاني.' },
      { severity: 'warning', title: 'Fun spend +$65 today', titleAr: 'مصاريف ترفيه +٦٥$ اليوم', body: 'Concert tickets pushed entertainment past 60% of plan.', bodyAr: 'تذاكر الحفل دفعت الترفيه فوق ٦٠٪ من الخطة.' },
    ],
    budgets: [
      { category: 'Housing', icon: 'home', color: '#6366f1', spent: 880, limit: 900 },
      { category: 'Food', icon: 'shopping-cart', color: '#10b981', spent: 320, limit: 360 },
      { category: 'Transport', icon: 'bus', color: '#0ea5e9', spent: 180, limit: 200 },
      { category: 'Bills', icon: 'zap', color: '#f59e0b', spent: 220, limit: 240 },
      { category: 'Fun', icon: 'music', color: '#ec4899', spent: 180, limit: 150 },
    ],
  },
};

/* Role-specific extra data not shared by every persona ---------------- */

export const ROLE_EXTRAS = {
  'family-parent': {
    children: [
      { name: 'Mira', nameAr: 'ميرا', age: 9, allowance: 60, spent: 38, color: '#ec4899' },
      { name: 'Adam', nameAr: 'آدم', age: 12, allowance: 80, spent: 71, color: '#0ea5e9' },
    ],
    monthCompare: [
      { label: 'Groceries', labelAr: 'المشتريات', now: 920, prev: 760 },
      { label: 'Utilities', labelAr: 'الفواتير', now: 480, prev: 420 },
      { label: 'Children', labelAr: 'الأطفال', now: 760, prev: 690 },
      { label: 'Dining', labelAr: 'مطاعم', now: 180, prev: 240 },
    ],
  },
  business: {
    invoices: [
      { id: 'INV-204', client: 'Bayan Tech', clientAr: 'بيان تك', amount: 6800, status: 'paid', date: daysAgo(3) },
      { id: 'INV-203', client: 'Studio Mira', clientAr: 'استوديو ميرا', amount: 3200, status: 'paid', date: daysAgo(7) },
      { id: 'INV-202', client: 'Acme Logistics', clientAr: 'Acme Logistics', amount: 4500, status: 'pending', date: daysAgo(2) },
      { id: 'INV-198', client: 'Bayan Tech', clientAr: 'بيان تك', amount: 6800, status: 'overdue', date: daysAgo(15) },
    ],
    kpiRow: [
      { labelKey: 'revenue', value: 48200, color: '#10b981', icon: 'trending-up' },
      { labelKey: 'profit', value: 16550, color: '#6366f1', icon: 'pie-chart' },
      { labelKey: 'expenses', value: 31650, color: '#f59e0b', icon: 'wallet' },
      { labelKey: 'growth', value: '+12.5%', color: '#0ea5e9', icon: 'zap', isText: true },
    ],
  },
  'school-student': {
    badges: [
      { key: 'streak', color: '#10b981', icon: 'flame', earned: true },
      { key: 'first100', color: '#6366f1', icon: 'star', earned: true },
      { key: 'noSpend', color: '#0ea5e9', icon: 'shield', earned: true },
      { key: 'phoneHalf', color: '#f59e0b', icon: 'gamepad', earned: false },
    ],
    parentMode: { enabled: true, parentName: 'Mom', parentNameAr: 'ماما' },
    piggyBank: {
      target: 500,
      saved: 220,
      goalKey: 'playstation',
      icon: 'gamepad',
      streakDays: 5,
      lastDeposit: 8,
      gradient: ['#fb7185', '#f97316', '#facc15'],
    },
    kidGoals: [
      { id: 'kg1', titleKey: 'playstation', icon: 'gamepad', target: 500, saved: 220, color: '#6366f1' },
      { id: 'kg2', titleKey: 'bike', icon: 'bike', target: 220, saved: 95, color: '#10b981' },
      { id: 'kg3', titleKey: 'boots', icon: 'circle', target: 80, saved: 80, color: '#f97316' },
    ],
  },
  'university-student': {
    sideIncome: [
      { source: 'Family allowance', sourceKey: 'srcAllowance', amount: 600, color: '#6366f1', icon: 'gift' },
      { source: 'Tutoring', sourceKey: 'srcTutoring', amount: 240, color: '#10b981', icon: 'graduation-cap' },
      { source: 'Campus job', sourceKey: 'srcCampus', amount: 220, color: '#0ea5e9', icon: 'briefcase' },
      { source: 'Freelance', sourceKey: 'srcFreelance', amount: 190, color: '#f59e0b', icon: 'monitor' },
    ],
    sideHustle: [
      { id: 'sh1', name: 'RTX 4070 GPU', nameAr: 'كرت شاشة RTX 4070', icon: 'cpu', color: '#10b981', bought: 580, market: 720 },
      { id: 'sh2', name: 'iPhone 13', nameAr: 'آيفون ١٣', icon: 'smartphone', color: '#6366f1', bought: 540, market: 410 },
      { id: 'sh3', name: 'AirPods Pro 2', nameAr: 'إيربودز برو ٢', icon: 'music', color: '#0ea5e9', bought: 230, market: 175 },
      { id: 'sh4', name: 'Mech keyboard', nameAr: 'كيبورد ميكانيكي', icon: 'monitor', color: '#f59e0b', bought: 140, market: 190 },
    ],
  },
  employee: {
    rule503020: { needs: 1820, wants: 580, savings: 800 },
    healthScore: 82,
    watchlist: [
      {
        id: 'gold',
        nameKey: 'gold',
        symbol: 'XAU',
        icon: 'coins',
        color: '#f59e0b',
        price: 2384.5,
        change: 1.4,
        spark: [2310, 2298, 2335, 2351, 2342, 2370, 2384.5],
      },
      {
        id: 'tech-etf',
        nameKey: 'techEtf',
        symbol: 'QQQ',
        icon: 'cpu',
        color: '#6366f1',
        price: 482.13,
        change: 2.6,
        spark: [462, 458, 471, 466, 475, 479, 482.13],
      },
      {
        id: 'reit',
        nameKey: 'realEstate',
        symbol: 'VNQ',
        icon: 'landmark',
        color: '#0ea5e9',
        price: 86.2,
        change: -0.8,
        spark: [88, 89.2, 88.4, 87.6, 87.1, 86.5, 86.2],
      },
    ],
  },
  freelancer: {
    clients: [
      { name: 'Bayan Tech', nameAr: 'بيان تك', revenue: 12400, share: 38 },
      { name: 'Studio Mira', nameAr: 'استوديو ميرا', revenue: 7200, share: 22 },
      { name: 'NorthLab', nameAr: 'NorthLab', revenue: 5800, share: 18 },
      { name: 'Solo projects', nameAr: 'مشاريع شخصية', revenue: 4200, share: 13 },
      { name: 'Other', nameAr: 'أخرى', revenue: 3000, share: 9 },
    ],
    forecast: months.map((m, i) => ({
      month: m,
      forecast: Math.round(4200 + Math.sin((i + 2) * 1.4) * 1500),
      lower: Math.round(2800 + Math.sin((i + 2) * 1.4) * 800),
      upper: Math.round(5800 + Math.sin((i + 2) * 1.4) * 2000),
    })),
  },
  general: {
    insights: [
      { icon: 'trending-down', title: '↘ Eating out -28%', titleAr: '↘ مطاعم -٢٨٪', body: 'You spent $80 less than March — keep going.', bodyAr: 'صرفت ٨٠$ أقل من آذار — كمّل.' },
      { icon: 'zap', title: 'Energy bill spiked', titleAr: 'فاتورة الكهرباء قفزت', body: 'Up 22% this month. Worth checking your last meter reading.', bodyAr: 'ارتفعت ٢٢٪ هذا الشهر. راجع آخر قراءة للعداد.' },
      { icon: 'star', title: 'Best saving week', titleAr: 'أفضل أسبوع ادخار', body: 'Last week was your most disciplined of the year.', bodyAr: 'الأسبوع الماضي كان الأكثر انضباطاً بالسنة.' },
    ],
  },
};
