/**
 * Masrafji · Demo shortcut notifications.
 *
 * A richer, role-specific list used by the "press 1" demo trick. Each press
 * of the "1" key picks the next notification for the active user/role and
 * shows it as a smart toast — so the app feels intelligent and personal in a
 * presentation setting.
 *
 * Each item is bilingual, has a category tag and a relevant icon. The
 * rotation cursor lives in module-scope so each role gets a fresh next-item
 * every time the user presses "1" within the session.
 */

const SHORTCUTS = {
  /* -------------------------------------------------------------------- */
  /*                       Family Parent                                  */
  /* -------------------------------------------------------------------- */
  'family-parent': [
    {
      id: 'sc-fp-electric',
      category: 'bill',
      severity: 'warning',
      icon: 'zap',
      tab: 'budget',
      title: { en: 'Electricity bill due in 2 days', ar: 'فاتورة الكهرباء بعد يومين' },
      body: {
        en: 'Your ₪240 electricity bill is due Friday — add a reminder?',
        ar: 'فاتورة الكهرباء بقيمة ₪240 مستحقة الجمعة — تضيف تذكير؟',
      },
      action: { en: 'Add reminder', ar: 'إضافة تذكير' },
    },
    {
      id: 'sc-fp-fuel',
      category: 'budget',
      severity: 'warning',
      icon: 'fuel',
      tab: 'budget',
      title: { en: 'Fuel budget almost finished', ar: 'ميزانية الوقود قربت تخلص' },
      body: {
        en: "You've used 92% of your fuel budget — only ₪65 left.",
        ar: 'استخدمت 92% من ميزانية الوقود — ضل ₪65 فقط.',
      },
      action: { en: 'View budget', ar: 'عرض الميزانية' },
    },
    {
      id: 'sc-fp-food',
      category: 'budget',
      severity: 'info',
      icon: 'shopping-cart',
      tab: 'budget',
      title: { en: 'Food budget at 80%', ar: 'ميزانية الأكل وصلت 80%' },
      body: {
        en: "You've used 80% of this month's food budget — pace yourself.",
        ar: 'استهلكت 80% من ميزانية الأكل لهاد الشهر — هدّي شوي.',
      },
      action: { en: 'See spending', ar: 'عرض الإنفاق' },
    },
    {
      id: 'sc-fp-salary',
      category: 'income',
      severity: 'success',
      icon: 'banknote',
      tab: 'transactions',
      title: { en: 'Salary received successfully', ar: 'تم استلام الراتب' },
      body: {
        en: '₪9,200 deposited to your main account ✓',
        ar: 'تم إيداع ₪9,200 في حسابك الرئيسي ✓',
      },
      action: { en: 'View transaction', ar: 'عرض العملية' },
    },
    {
      id: 'sc-fp-tesla',
      category: 'investment',
      severity: 'info',
      icon: 'trending-up',
      tab: 'reports',
      title: { en: 'Tesla stock moved today', ar: 'حركة على سهم Tesla اليوم' },
      body: {
        en: 'TSLA is up +3.4% today — your watchlist gained ₪140.',
        ar: 'سهم TSLA ارتفع +3.4% اليوم — قائمة المتابعة كسبت ₪140.',
      },
      action: { en: 'Open report', ar: 'عرض التقرير' },
    },
    {
      id: 'sc-fp-school',
      category: 'reminder',
      severity: 'info',
      icon: 'graduation-cap',
      tab: 'budget',
      title: { en: "Kids' school payment in 7 days", ar: 'دفعة مدرسة الأطفال خلال ٧ أيام' },
      body: {
        en: 'Term 3 fees of ₪1,400 are due next week — plan ahead.',
        ar: 'رسوم الفصل الثالث ₪1,400 مستحقة الأسبوع الجاي — خطّط من هلأ.',
      },
      action: { en: 'View bill', ar: 'عرض الفاتورة' },
    },
    {
      id: 'sc-fp-emergency',
      category: 'goal',
      severity: 'success',
      icon: 'shield',
      tab: 'goals',
      title: { en: 'Emergency fund grew today', ar: 'صندوق الطوارئ نما اليوم' },
      body: {
        en: '+₪320 added — you’re now 78% to the family goal.',
        ar: 'أضفت ₪320 — وصلت 78% من هدف العيلة.',
      },
      action: { en: 'See goal', ar: 'عرض الهدف' },
    },
  ],

  /* -------------------------------------------------------------------- */
  /*                       Employee  (main adult)                         */
  /* -------------------------------------------------------------------- */
  employee: [
    {
      id: 'sc-emp-electric',
      category: 'bill',
      severity: 'warning',
      icon: 'zap',
      tab: 'budget',
      title: { en: 'Electricity bill due in 2 days', ar: 'فاتورة الكهرباء بعد يومين' },
      body: {
        en: 'Your ₪185 electricity bill is due Friday.',
        ar: 'فاتورة الكهرباء بقيمة ₪185 مستحقة يوم الجمعة.',
      },
      action: { en: 'Pay now', ar: 'ادفع الآن' },
    },
    {
      id: 'sc-emp-fuel',
      category: 'budget',
      severity: 'warning',
      icon: 'fuel',
      tab: 'budget',
      title: { en: 'Fuel budget almost finished', ar: 'ميزانية الوقود قربت تخلص' },
      body: {
        en: "You've used 88% of your fuel budget this month.",
        ar: 'استخدمت 88% من ميزانية الوقود هاد الشهر.',
      },
      action: { en: 'View budget', ar: 'عرض الميزانية' },
    },
    {
      id: 'sc-emp-food80',
      category: 'budget',
      severity: 'info',
      icon: 'shopping-cart',
      tab: 'budget',
      title: { en: 'You used 80% of your food budget', ar: 'استخدمت 80% من ميزانية الأكل' },
      body: {
        en: 'Pace your dining and groceries to stay on track.',
        ar: 'وزع المطاعم والمشتريات حتى تظل على الميزانية.',
      },
      action: { en: 'View details', ar: 'عرض التفاصيل' },
    },
    {
      id: 'sc-emp-salary',
      category: 'income',
      severity: 'success',
      icon: 'banknote',
      tab: 'transactions',
      title: { en: 'Salary received successfully', ar: 'تم استلام الراتب' },
      body: {
        en: '₪7,500 has just been deposited to your account ✓',
        ar: 'تم إيداع ₪7,500 في حسابك ✓',
      },
      action: { en: 'View transaction', ar: 'عرض العملية' },
    },
    {
      id: 'sc-emp-tesla',
      category: 'investment',
      severity: 'info',
      icon: 'trending-up',
      tab: 'reports',
      title: { en: 'Tesla stock moved today', ar: 'حركة على سهم Tesla' },
      body: {
        en: 'TSLA +3.4% today — a stock in your watchlist gained today.',
        ar: 'TSLA +3.4% اليوم — سهم في قائمة متابعتك ارتفع.',
      },
      action: { en: 'Open report', ar: 'عرض التقرير' },
    },
    {
      id: 'sc-emp-50-30-20',
      category: 'tip',
      severity: 'brand',
      icon: 'sparkles',
      tab: 'reports',
      title: { en: 'Tip: 50/30/20 looking healthy', ar: 'نصيحة: نسبة 50/30/20 تمام' },
      body: {
        en: 'Needs 48% · Wants 30% · Save 22% — well balanced this month.',
        ar: 'ضروريات 48% · رغبات 30% · ادخار 22% — موزّعة منيح هاد الشهر.',
      },
      action: { en: 'See report', ar: 'عرض التقرير' },
    },
    {
      id: 'sc-emp-savings',
      category: 'saving',
      severity: 'success',
      icon: 'piggy-bank',
      tab: 'goals',
      title: { en: 'Auto-save just ran', ar: 'تم تنفيذ الادخار التلقائي' },
      body: {
        en: '+₪450 moved to your emergency fund automatically.',
        ar: 'تم تحويل ₪450 لصندوق الطوارئ تلقائياً.',
      },
      action: { en: 'See goal', ar: 'عرض الهدف' },
    },
  ],

  /* -------------------------------------------------------------------- */
  /*                       University Student                             */
  /* -------------------------------------------------------------------- */
  'university-student': [
    {
      id: 'sc-us-uni',
      category: 'bill',
      severity: 'warning',
      icon: 'graduation-cap',
      tab: 'budget',
      title: { en: 'University payment reminder', ar: 'تذكير دفعة الجامعة' },
      body: {
        en: 'Tuition payment of ₪3,500 is due in 5 days.',
        ar: 'دفعة الرسوم الجامعية ₪3,500 مستحقة بعد ٥ أيام.',
      },
      action: { en: 'View bill', ar: 'عرض الفاتورة' },
    },
    {
      id: 'sc-us-internet',
      category: 'subscription',
      severity: 'info',
      icon: 'wifi',
      tab: 'transactions',
      title: { en: 'Internet subscription renews soon', ar: 'اشتراك الإنترنت قريب يتجدد' },
      body: {
        en: 'Your ₪120 internet plan renews in 3 days.',
        ar: 'اشتراك الإنترنت ₪120 رح يتجدد بعد ٣ أيام.',
      },
      action: { en: 'Manage', ar: 'إدارة' },
    },
    {
      id: 'sc-us-transport',
      category: 'budget',
      severity: 'warning',
      icon: 'bus',
      tab: 'budget',
      title: { en: 'Transport budget almost finished', ar: 'ميزانية المواصلات قربت تخلص' },
      body: {
        en: 'Only ₪35 left for transport this month.',
        ar: 'ضل ₪35 فقط لمصاريف المواصلات هاد الشهر.',
      },
      action: { en: 'View budget', ar: 'عرض الميزانية' },
    },
    {
      id: 'sc-us-spent-more',
      category: 'budget',
      severity: 'danger',
      icon: 'trending-up',
      tab: 'reports',
      title: { en: 'You spent more than usual this week', ar: 'صرفت أكثر من المعتاد هاد الأسبوع' },
      body: {
        en: 'Daily spending is 32% higher than your average.',
        ar: 'صرفك اليومي أعلى من معدلك بنسبة 32%.',
      },
      action: { en: 'See where', ar: 'وين راحت' },
    },
    {
      id: 'sc-us-coffee',
      category: 'tip',
      severity: 'brand',
      icon: 'utensils',
      tab: 'budget',
      title: { en: 'Coffee tip', ar: 'نصيحة قهوة' },
      body: {
        en: '5 coffees this week = ₪70. Brewing at home would save ₪50/week.',
        ar: '٥ قهاوي هاد الأسبوع = ₪70. لو حضرت بالبيت توفر ₪50/أسبوع.',
      },
      action: { en: 'Open budget', ar: 'فتح الميزانية' },
    },
    {
      id: 'sc-us-laptop',
      category: 'goal',
      severity: 'success',
      icon: 'smartphone',
      tab: 'goals',
      title: { en: 'Laptop saving goal — 65%', ar: 'هدف اللابتوب — 65%' },
      body: {
        en: 'Only ₪1,200 to go — keep it up!',
        ar: 'ضل عليك ₪1,200 — كمل بنفس الطريقة!',
      },
      action: { en: 'See goal', ar: 'عرض الهدف' },
    },
    {
      id: 'sc-us-books',
      category: 'reminder',
      severity: 'info',
      icon: 'book',
      tab: 'budget',
      title: { en: 'New semester books soon', ar: 'كتب الفصل الجديد قريباً' },
      body: {
        en: 'Set aside ~₪400 for next semester’s books.',
        ar: 'حضر ~₪400 لكتب الفصل الجاي.',
      },
      action: { en: 'Plan budget', ar: 'خطط الميزانية' },
    },
  ],

  /* -------------------------------------------------------------------- */
  /*                       School Student  (child)                        */
  /* -------------------------------------------------------------------- */
  'school-student': [
    {
      id: 'sc-ss-netflix',
      category: 'subscription',
      severity: 'warning',
      icon: 'tv',
      tab: 'transactions',
      title: { en: 'Netflix renews tomorrow', ar: 'اشتراك Netflix يتجدد بكرا' },
      body: {
        en: 'Your Netflix subscription will renew tomorrow at ₪55.',
        ar: 'اشتراك Netflix رح يتجدد بكرا بقيمة ₪55.',
      },
      action: { en: 'Manage', ar: 'إدارة' },
    },
    {
      id: 'sc-ss-school',
      category: 'bill',
      severity: 'info',
      icon: 'graduation-cap',
      tab: 'budget',
      title: { en: 'School payment reminder', ar: 'تذكير دفعة المدرسة' },
      body: {
        en: 'Term payment of ₪900 is due in 6 days.',
        ar: 'دفعة الفصل ₪900 مستحقة بعد ٦ أيام.',
      },
      action: { en: 'Show bill', ar: 'عرض الفاتورة' },
    },
    {
      id: 'sc-ss-fun',
      category: 'budget',
      severity: 'warning',
      icon: 'film',
      tab: 'budget',
      title: { en: 'Entertainment budget close to limit', ar: 'ميزانية الترفيه قربت من الحد' },
      body: {
        en: 'You used 86% of your entertainment budget this month.',
        ar: 'استخدمت 86% من ميزانية الترفيه هاد الشهر.',
      },
      action: { en: 'View budget', ar: 'عرض الميزانية' },
    },
    {
      id: 'sc-ss-allowance',
      category: 'budget',
      severity: 'info',
      icon: 'wallet',
      tab: 'budget',
      title: { en: 'Allowance week summary', ar: 'ملخص مصروف الأسبوع' },
      body: {
        en: '₪48 left of this week’s allowance — spend wisely.',
        ar: 'ضل معك ₪48 من مصروف الأسبوع — اصرف بحكمة.',
      },
      action: { en: 'See spending', ar: 'عرض الإنفاق' },
    },
    {
      id: 'sc-ss-streak',
      category: 'saving',
      severity: 'brand',
      icon: 'sparkles',
      tab: 'goals',
      title: { en: '7-day saving streak!', ar: 'سلسلة ادخار ٧ أيام!' },
      body: {
        en: 'You saved a little every day this week — earn the badge.',
        ar: 'كل يوم هاد الأسبوع وفرت شي بسيط — اكسب الشارة.',
      },
      action: { en: 'Open badges', ar: 'فتح الشارات' },
    },
    {
      id: 'sc-ss-phone-goal',
      category: 'goal',
      severity: 'success',
      icon: 'smartphone',
      tab: 'goals',
      title: { en: 'Phone goal at 70%', ar: 'هدف الموبايل 70%' },
      body: {
        en: 'Only a few weeks of saving and you’ll get there!',
        ar: 'كم أسبوع ادخار وبتوصل!',
      },
      action: { en: 'View goal', ar: 'عرض الهدف' },
    },
    {
      id: 'sc-ss-spotify',
      category: 'subscription',
      severity: 'info',
      icon: 'music',
      tab: 'transactions',
      title: { en: 'Spotify renews in 4 days', ar: 'Spotify يتجدد بعد ٤ أيام' },
      body: {
        en: 'Family plan ₪25 — switch to a yearly plan to save 16%.',
        ar: 'باقة العيلة ₪25 — حول للسنوي لتوفر 16%.',
      },
      action: { en: 'See plan', ar: 'عرض الباقة' },
    },
  ],

  /* -------------------------------------------------------------------- */
  /*                       Business Owner  (investor-ish)                 */
  /* -------------------------------------------------------------------- */
  business: [
    {
      id: 'sc-bz-tesla',
      category: 'investment',
      severity: 'success',
      icon: 'trending-up',
      tab: 'reports',
      title: { en: 'Tesla moved up today', ar: 'سهم Tesla ارتفع اليوم' },
      body: {
        en: 'TSLA +3.4% today — your watchlist gained ₪420.',
        ar: 'TSLA +3.4% اليوم — قائمة المتابعة كسبت ₪420.',
      },
      action: { en: 'View market', ar: 'عرض السوق' },
    },
    {
      id: 'sc-bz-apple',
      category: 'investment',
      severity: 'info',
      icon: 'arrow-up-right',
      tab: 'reports',
      title: { en: 'Apple stock price changed', ar: 'سعر سهم Apple تغير' },
      body: {
        en: 'AAPL +1.1% in the last hour — small but steady.',
        ar: 'AAPL +1.1% بآخر ساعة — حركة بسيطة لكن ثابتة.',
      },
      action: { en: 'See chart', ar: 'عرض الرسم' },
    },
    {
      id: 'sc-bz-watchlist',
      category: 'market',
      severity: 'brand',
      icon: 'bar-chart-3',
      tab: 'reports',
      title: { en: 'Your watchlist has updates', ar: 'تحديثات على قائمة المتابعة' },
      body: {
        en: '4 of 7 stocks moved >1% today — open the report.',
        ar: '4 من أصل 7 أسهم تحركت أكثر من 1% — افتح التقرير.',
      },
      action: { en: 'Open watchlist', ar: 'فتح القائمة' },
    },
    {
      id: 'sc-bz-market',
      category: 'market',
      severity: 'warning',
      icon: 'alert-circle',
      tab: 'reports',
      title: { en: 'Market movement alert', ar: 'تنبيه حركة السوق' },
      body: {
        en: 'Tech sector down -1.8% — review exposure.',
        ar: 'قطاع التكنولوجيا نزل -1.8% — راجع نسبتك.',
      },
      action: { en: 'View report', ar: 'عرض التقرير' },
    },
    {
      id: 'sc-bz-overdue',
      category: 'bill',
      severity: 'danger',
      icon: 'file-text',
      tab: 'transactions',
      title: { en: 'Client invoice overdue', ar: 'فاتورة عميل متأخرة' },
      body: {
        en: 'Invoice #1042 (₪5,200) is overdue by 5 days.',
        ar: 'فاتورة #1042 (₪5,200) متأخرة ٥ أيام.',
      },
      action: { en: 'View invoice', ar: 'عرض الفاتورة' },
    },
    {
      id: 'sc-bz-tax',
      category: 'saving',
      severity: 'brand',
      icon: 'shield',
      tab: 'goals',
      title: { en: 'Tax buffer auto-saved', ar: 'صندوق الضريبة تم تحويله' },
      body: {
        en: '+₪1,200 moved to your quarterly tax buffer.',
        ar: 'تم تحويل ₪1,200 لصندوق الضريبة الربعي.',
      },
      action: { en: 'See buffer', ar: 'عرض الصندوق' },
    },
    {
      id: 'sc-bz-revenue',
      category: 'income',
      severity: 'success',
      icon: 'banknote',
      tab: 'transactions',
      title: { en: 'New revenue received', ar: 'دخل جديد وصل' },
      body: {
        en: 'Client payment of ₪3,800 cleared today ✓',
        ar: 'تم استلام دفعة العميل ₪3,800 اليوم ✓',
      },
      action: { en: 'See deposit', ar: 'عرض الإيداع' },
    },
  ],

  /* -------------------------------------------------------------------- */
  /*                       Freelancer                                     */
  /* -------------------------------------------------------------------- */
  freelancer: [
    {
      id: 'sc-fl-late',
      category: 'bill',
      severity: 'danger',
      icon: 'file-text',
      tab: 'transactions',
      title: { en: 'Client payment overdue', ar: 'دفعة عميل متأخرة' },
      body: {
        en: 'Invoice from Aurora Studio is overdue by 7 days.',
        ar: 'فاتورة Aurora Studio متأخرة ٧ أيام.',
      },
      action: { en: 'View invoice', ar: 'عرض الفاتورة' },
    },
    {
      id: 'sc-fl-target',
      category: 'goal',
      severity: 'warning',
      icon: 'target',
      tab: 'goals',
      title: { en: 'Income target — 30% behind', ar: 'هدف الدخل — متأخر 30%' },
      body: {
        en: 'You’re 30% below this month’s revenue target.',
        ar: 'دخلك أقل بنسبة 30% من هدف الشهر.',
      },
      action: { en: 'See projects', ar: 'عرض المشاريع' },
    },
    {
      id: 'sc-fl-paid',
      category: 'income',
      severity: 'success',
      icon: 'banknote',
      tab: 'transactions',
      title: { en: 'Invoice just paid', ar: 'فاتورة تم دفعها' },
      body: {
        en: 'Client paid ₪2,400 — funds will land tomorrow.',
        ar: 'العميل دفع ₪2,400 — رح توصل الفلوس بكرا.',
      },
      action: { en: 'See invoice', ar: 'عرض الفاتورة' },
    },
    {
      id: 'sc-fl-tax',
      category: 'saving',
      severity: 'brand',
      icon: 'shield',
      tab: 'goals',
      title: { en: 'Tax buffer reminder', ar: 'تذكير صندوق الضريبة' },
      body: {
        en: 'Set aside 25% of this week’s income for tax.',
        ar: 'احفظ 25% من دخل الأسبوع للضريبة.',
      },
      action: { en: 'Add saving', ar: 'إضافة ادخار' },
    },
    {
      id: 'sc-fl-watchlist',
      category: 'investment',
      severity: 'info',
      icon: 'trending-up',
      tab: 'reports',
      title: { en: 'Your stock watchlist updated', ar: 'تحديثات على قائمة الأسهم' },
      body: {
        en: '3 watchlist stocks moved >1% today.',
        ar: '٣ من أسهم قائمتك تحركت أكثر من 1% اليوم.',
      },
      action: { en: 'See market', ar: 'عرض السوق' },
    },
  ],

  /* -------------------------------------------------------------------- */
  /*                       General User                                   */
  /* -------------------------------------------------------------------- */
  general: [
    {
      id: 'sc-gn-bill',
      category: 'bill',
      severity: 'warning',
      icon: 'zap',
      tab: 'budget',
      title: { en: 'Electricity bill in 3 days', ar: 'فاتورة الكهرباء بعد ٣ أيام' },
      body: {
        en: 'Your ₪165 electricity bill is due Sunday.',
        ar: 'فاتورة الكهرباء ₪165 مستحقة الأحد.',
      },
      action: { en: 'Pay', ar: 'دفع' },
    },
    {
      id: 'sc-gn-food',
      category: 'budget',
      severity: 'info',
      icon: 'shopping-cart',
      tab: 'budget',
      title: { en: 'Food budget at 80%', ar: 'ميزانية الأكل وصلت 80%' },
      body: {
        en: 'You used most of this month’s food budget already.',
        ar: 'استخدمت معظم ميزانية الأكل لهاد الشهر.',
      },
      action: { en: 'View budget', ar: 'عرض الميزانية' },
    },
    {
      id: 'sc-gn-salary',
      category: 'income',
      severity: 'success',
      icon: 'banknote',
      tab: 'transactions',
      title: { en: 'Income just received', ar: 'دخل جديد' },
      body: {
        en: '₪3,200 has just landed in your account ✓',
        ar: 'وصل ₪3,200 لحسابك ✓',
      },
      action: { en: 'View transaction', ar: 'عرض العملية' },
    },
    {
      id: 'sc-gn-stock',
      category: 'investment',
      severity: 'info',
      icon: 'trending-up',
      tab: 'reports',
      title: { en: 'Tesla moved today', ar: 'حركة على Tesla' },
      body: {
        en: 'TSLA +3.4% — a stock from your watchlist gained.',
        ar: 'TSLA +3.4% — سهم في قائمتك ارتفع.',
      },
      action: { en: 'Open report', ar: 'عرض التقرير' },
    },
    {
      id: 'sc-gn-tip',
      category: 'tip',
      severity: 'brand',
      icon: 'sparkles',
      tab: 'budget',
      title: { en: 'Tip: set a daily limit', ar: 'نصيحة: حدّد سقف يومي' },
      body: {
        en: 'A daily limit makes it easier to keep your monthly budget on track.',
        ar: 'سقف يومي بيسهّل عليك الالتزام بميزانية الشهر.',
      },
      action: { en: 'Open budget', ar: 'فتح الميزانية' },
    },
    {
      id: 'sc-gn-streak',
      category: 'saving',
      severity: 'success',
      icon: 'piggy-bank',
      tab: 'goals',
      title: { en: 'Savings on track', ar: 'الادخار على المسار' },
      body: {
        en: 'You added 4.6% to your savings this month — keep it up.',
        ar: 'زدت ادخارك بنسبة 4.6% هاد الشهر — استمر.',
      },
      action: { en: 'View goals', ar: 'عرض الأهداف' },
    },
  ],
};

/* ----- Rotation cursor (per-role, in-memory) -------------------------- */

const cursors = new Map();

/**
 * Pick the next demo notification for the given role/lang. Rotates through
 * the role-specific list so each "1" press shows a fresh, relevant alert.
 *
 * @param {string} roleId
 * @param {'en' | 'ar'} lang
 * @returns {object|null} Localized notification with category + tab, ready
 *                       for the SmartNotification component, or null if no
 *                       data is available for the role.
 */
export function pickShortcutNotification(roleId, lang = 'en') {
  const list = SHORTCUTS[roleId] || SHORTCUTS.general;
  if (!list || list.length === 0) return null;
  const idx = (cursors.get(roleId) ?? -1) + 1;
  const safeIdx = idx % list.length;
  cursors.set(roleId, safeIdx);

  const n = list[safeIdx];
  return {
    id: `${n.id}-${Date.now()}`,
    category: n.category,
    severity: n.severity,
    icon: n.icon,
    tab: n.tab,
    title: n.title[lang] || n.title.en,
    body: n.body[lang] || n.body.en,
    action: n.action?.[lang] || n.action?.en,
    /* Marks the notification as a shortcut-triggered toast so the component
       can render the optional category chip + "Shortcut" affordance. */
    shortcut: true,
  };
}

export default SHORTCUTS;
