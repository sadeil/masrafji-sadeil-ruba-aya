import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, LineChart, Line,
} from 'recharts';
import {
  Mic, TrendingUp, Sparkles, Wallet, Bot, Heart, Wifi,
  BatteryFull, Signal, AlertTriangle, ShieldCheck, Crown,
  Trophy, Lock, Brain, ChevronRight, Flame, Home as HomeIcon,
  Shield, Car, Coins, Receipt, Scissors, Users, ArrowUpRight,
  ArrowDownRight, MapPin, Volume2, VolumeX, CalendarDays, Zap,
  Sun, MessageCircleHeart, Cloud, Camera, GraduationCap,
  Send, Pause, Thermometer, Waves, BookOpen, Eye, X,
} from 'lucide-react';

/* =========================================================
   PRIMITIVES
   ========================================================= */

function GlowCard({ children, glow = 'purple', className = '', style }) {
  const tones = {
    purple: 'ds-card--purple',
    emerald: 'ds-card--emerald',
    rose: 'ds-card--rose',
    slate: 'ds-card--slate',
    amber: 'ds-card--amber',
    indigo: 'ds-card--indigo',
    teal: 'ds-card--teal',
    fuchsia: 'ds-card--fuchsia',
  };
  return (
    <div
      style={style}
      className={`ds-card rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 ${tones[glow]} ${className}`}
    >
      {children}
    </div>
  );
}

function VoiceWave({ bars = 14, color = 'bg-emerald-400' }) {
  return (
    <div className="flex items-center gap-[2px] h-4">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`w-[2px] rounded-full ${color} animate-wave`}
          style={{
            height: `${30 + ((i * 17) % 70)}%`,
            animationDelay: `${(i * 0.07).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
}

function Sparkline({ data, color = '#10b981', height = 36 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Pill({ children, tone = 'purple', icon: Icon }) {
  const tones = {
    purple: 'ds-pill--purple',
    emerald: 'ds-pill--emerald',
    rose: 'ds-pill--rose',
    amber: 'ds-pill--amber',
    slate: 'ds-pill--slate',
    indigo: 'ds-pill--indigo',
    teal: 'ds-pill--teal',
    fuchsia: 'ds-pill--fuchsia',
  };
  return (
    <span className={`ds-pill inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border backdrop-blur-md transition-all duration-300 hover:scale-105 ${tones[tone]}`}>
      {Icon && (
        <span className="ds-pill-icon">
          <Icon className="w-3.5 h-3.5" />
        </span>
      )}
      {children}
    </span>
  );
}

function DashboardModalShell({ title, open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="dashboard-modal-overlay is-open" onClick={onClose}>
      <div
        className="dashboard-modal-sheet is-open"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="dashboard-modal-header">
          <h3 className="dashboard-modal-title font-arabic" dir="rtl">{title}</h3>
          <button type="button" className="dashboard-modal-close" onClick={onClose} aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="dashboard-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function SubscriptionsModal({ open, onClose }) {
  const normalizedCategories = ['الكل', 'ترفيه', 'ألعاب', 'تعليم', 'تطبيقات', 'خدمات'];
  const [activeCategory, setActiveCategory] = useState('الكل');

  const sections = useMemo(
    () => [
      {
        title: 'ترفيه ومشاهدة',
        icon: '🎬',
        items: [
          { icon: '🟥', name: 'Netflix', category: 'ترفيه', price: 42, renewal: '04 مايو', status: 'نشط' },
          { icon: '🟩', name: 'Shahid', category: 'ترفيه', price: 28, renewal: '12 مايو', status: 'نشط' },
          { icon: '🔴', name: 'YouTube Premium', category: 'ترفيه', price: 24, renewal: '09 مايو', status: 'قريب التجديد' },
        ],
      },
      {
        title: 'موسيقى وصوتيات',
        icon: '🎧',
        items: [
          { icon: '🟢', name: 'Spotify', category: 'ترفيه', price: 20, renewal: '07 مايو', status: 'نشط' },
          { icon: '🟣', name: 'Anghami', category: 'ترفيه', price: 16, renewal: '22 مايو', status: 'نشط' },
          { icon: '⚪', name: 'Apple Music', category: 'ترفيه', price: 24, renewal: '15 مايو', status: 'متوقف' },
        ],
      },
      {
        title: 'ألعاب',
        icon: '🎮',
        items: [
          { icon: '🔵', name: 'PlayStation Plus', category: 'ألعاب', price: 35, renewal: '18 مايو', status: 'نشط' },
          { icon: '🟩', name: 'Xbox Game Pass', category: 'ألعاب', price: 33, renewal: '27 مايو', status: 'نشط' },
          { icon: '⚫', name: 'Steam', category: 'ألعاب', price: 18, renewal: '03 مايو', status: 'قريب التجديد' },
          { icon: '🪖', name: 'PUBG', category: 'ألعاب', price: 12, renewal: '14 مايو', status: 'نشط' },
          { icon: '🧱', name: 'Roblox', category: 'ألعاب', price: 10, renewal: '20 مايو', status: 'نشط' },
          { icon: '💎', name: 'In-game purchases', category: 'ألعاب', price: 25, renewal: 'مرن', status: 'نشط' },
        ],
      },
      {
        title: 'تعليم وإنتاجية',
        icon: '📚',
        items: [
          { icon: '🎨', name: 'Canva Pro', category: 'تطبيقات', price: 22, renewal: '06 مايو', status: 'نشط' },
          { icon: '✨', name: 'ChatGPT', category: 'تطبيقات', price: 75, renewal: '25 مايو', status: 'نشط' },
          { icon: '📘', name: 'Coursera', category: 'تعليم', price: 34, renewal: '11 مايو', status: 'نشط' },
          { icon: '📗', name: 'Udemy', category: 'تعليم', price: 18, renewal: 'مرن', status: 'نشط' },
          { icon: '📝', name: 'Notion', category: 'تطبيقات', price: 19, renewal: '17 مايو', status: 'نشط' },
          { icon: '☁️', name: 'Google Drive', category: 'خدمات', price: 8, renewal: '30 مايو', status: 'نشط' },
        ],
      },
      {
        title: 'خدمات رقمية',
        icon: '🛡️',
        items: [
          { icon: '🍎', name: 'iCloud', category: 'خدمات', price: 12, renewal: '08 مايو', status: 'نشط' },
          { icon: '🔐', name: 'VPN', category: 'خدمات', price: 16, renewal: '05 مايو', status: 'قريب التجديد' },
          { icon: '🧬', name: 'Antivirus', category: 'خدمات', price: 14, renewal: '16 مايو', status: 'نشط' },
          { icon: '📱', name: 'App subscriptions', category: 'تطبيقات', price: 22, renewal: 'متعدد', status: 'نشط' },
        ],
      },
    ],
    []
  );

  const allItems = useMemo(() => sections.flatMap((section) => section.items), [sections]);
  const filteredSections = useMemo(
    () => sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => activeCategory === 'الكل' || item.category === activeCategory),
      }))
      .filter((section) => section.items.length > 0),
    [activeCategory, sections]
  );

  const activeSubscriptions = allItems.filter((item) => item.status !== 'متوقف');
  const totalMonthly = activeSubscriptions.reduce((sum, item) => sum + item.price, 0);

  return (
    <DashboardModalShell title="اشتراكاتي هذا الشهر" open={open} onClose={onClose}>
      <div className="dashboard-modal-grid-3">
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-label font-arabic" dir="rtl">الاشتراكات النشطة</div>
          <div className="dashboard-kpi-value">{activeSubscriptions.length}</div>
        </div>
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-label font-arabic" dir="rtl">إجمالي شهري</div>
          <div className="dashboard-kpi-value">{totalMonthly}₪</div>
        </div>
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-label font-arabic" dir="rtl">أقرب تجديد</div>
          <div className="dashboard-kpi-value text-[15px]">03 مايو</div>
        </div>
      </div>

      <div className="dashboard-chip-row">
        {normalizedCategories.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveCategory(label)}
            className={`dashboard-chip font-arabic ${activeCategory === label ? 'is-active' : ''}`}
            dir="rtl"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="dashboard-sections">
        {filteredSections.map((section) => (
          <div key={section.title} className="dashboard-section-card">
            <div className="dashboard-section-title-wrap">
              <span className="dashboard-section-emoji" aria-hidden="true">{section.icon}</span>
              <h4 className="dashboard-section-title font-arabic" dir="rtl">{section.title}</h4>
            </div>
            <div className="dashboard-item-list">
              {section.items.map((item) => (
                <div key={`${section.title}-${item.name}`} className="dashboard-item-row">
                  <div className="dashboard-item-main">
                    <span className="dashboard-item-icon" aria-hidden="true">{item.icon}</span>
                    <div className="dashboard-item-copy">
                      <div className="dashboard-item-name">{item.name}</div>
                      <div className="dashboard-item-meta font-arabic" dir="rtl">{item.renewal} · {item.category}</div>
                    </div>
                  </div>
                  <div className="dashboard-item-side">
                    <div className="dashboard-item-price">{item.price}₪</div>
                    <span className={`dashboard-status-pill font-arabic ${
                      item.status === 'نشط' ? 'is-good' : item.status === 'متوقف' ? 'is-off' : 'is-warn'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-insight-card">
        <div className="dashboard-insight-title font-arabic" dir="rtl">
          <Brain className="w-4 h-4" />
          نظرة ذكية
        </div>
        <p className="dashboard-insight-copy font-arabic" dir="rtl">
          أعلى استنزاف عندك هو الباقات الترفيهية والألعاب. إذا جمّدت اشتراكين غير مستخدمين هذا الشهر،
          ممكن توفّري <span className="text-emerald-300 font-semibold">٧٤₪</span> مباشرة.
        </p>
      </div>

      <div className="dashboard-actions-row">
        <button type="button" className="dashboard-action-btn is-primary font-arabic" dir="rtl">
          <span>إضافة اشتراك</span>
          <span className="dashboard-btn-icon"><Zap className="w-3.5 h-3.5" /></span>
        </button>
        <button type="button" className="dashboard-action-btn font-arabic" dir="rtl">
          <CalendarDays className="w-4 h-4" />
          تذكير قبل التجديد
        </button>
        <button type="button" className="dashboard-action-btn font-arabic" dir="rtl">
          <Shield className="w-4 h-4" />
          إدارة الاشتراكات
        </button>
      </div>
    </DashboardModalShell>
  );
}

function SavingsModal({ open, onClose }) {
  const savedAmount = 460;
  const monthlyGoal = 1000;
  const progress = Math.round((savedAmount / monthlyGoal) * 100);

  return (
    <DashboardModalShell title="خطة التوفير" open={open} onClose={onClose}>
      <div className="dashboard-modal-grid-3">
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-label font-arabic" dir="rtl">المحفوظ هذا الشهر</div>
          <div className="dashboard-kpi-value">{savedAmount}₪</div>
        </div>
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-label font-arabic" dir="rtl">الهدف الشهري</div>
          <div className="dashboard-kpi-value">{monthlyGoal}₪</div>
        </div>
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-label font-arabic" dir="rtl">نسبة التقدم</div>
          <div className="dashboard-kpi-value">{progress}%</div>
        </div>
      </div>

      <div className="dashboard-progress-card">
        <div className="dashboard-progress-top">
          <span className="font-arabic" dir="rtl">التقدم نحو الهدف</span>
          <span>{progress}%</span>
        </div>
        <div className="dashboard-progress-track">
          <div className="dashboard-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section-card">
          <div className="dashboard-section-title-wrap">
            <span className="dashboard-section-emoji">🎯</span>
            <h4 className="dashboard-section-title font-arabic" dir="rtl">أهدافي</h4>
          </div>
          <div className="dashboard-tags-wrap">
            {['صندوق الطوارئ', 'الدراسة', 'السفر', 'مشروع التخرج', 'شراء لابتوب'].map((goal) => (
              <span key={goal} className="dashboard-mini-tag font-arabic" dir="rtl">{goal}</span>
            ))}
          </div>
        </div>

        <div className="dashboard-section-card">
          <div className="dashboard-section-title-wrap">
            <span className="dashboard-section-emoji">💡</span>
            <h4 className="dashboard-section-title font-arabic" dir="rtl">فرص توفير</h4>
          </div>
          <div className="dashboard-item-list">
            {[
              'إلغاء Spotify هذا الشهر = +20₪',
              'تخفيض مصروف الألعاب إلى النصف = +24₪',
              'دمج منصات المشاهدة إلى باقة واحدة = +28₪',
            ].map((item) => (
              <div key={item} className="dashboard-simple-row font-arabic" dir="rtl">{item}</div>
            ))}
          </div>
        </div>

        <div className="dashboard-section-card">
          <div className="dashboard-section-title-wrap">
            <span className="dashboard-section-emoji">🔥</span>
            <h4 className="dashboard-section-title font-arabic" dir="rtl">تحديات التوفير</h4>
          </div>
          <div className="dashboard-tags-wrap">
            {['10 ₪ يوميًا', 'بدون قهوة', 'بدون طلبات أكل', 'تقليل الألعاب'].map((challenge) => (
              <span key={challenge} className="dashboard-mini-tag font-arabic" dir="rtl">{challenge}</span>
            ))}
          </div>
        </div>

        <div className="dashboard-section-card">
          <div className="dashboard-section-title-wrap">
            <span className="dashboard-section-emoji">🧾</span>
            <h4 className="dashboard-section-title font-arabic" dir="rtl">مصادر التوفير</h4>
          </div>
          <div className="dashboard-item-list dashboard-source-grid">
            {['اشتراكات', 'أكل', 'تسوق', 'مواصلات', 'مصروف إضافي'].map((source) => (
              <div key={source} className="dashboard-source-pill font-arabic" dir="rtl">{source}</div>
            ))}
          </div>
        </div>

        <div className="dashboard-insight-card">
          <div className="dashboard-insight-title font-arabic" dir="rtl">
            <Sparkles className="w-4 h-4" />
            نصيحة ذكية من مصرفجي
          </div>
          <p className="dashboard-insight-copy font-arabic" dir="rtl">
            ثبّتي تحويل تلقائي أسبوعي بقيمة <span className="text-emerald-300 font-semibold">115₪</span>.
            بهالطريقة بتحققي هدف الشهر بنسبة أعلى من 100% بدون ضغط آخر الأسبوع.
          </p>
        </div>
      </div>
    </DashboardModalShell>
  );
}

/* =========================================================
   1. HOME
   ========================================================= */

function HomeView() {
  const [activeModal, setActiveModal] = useState(null);
  const weekly = [
    { day: 'أحد', level: 0.35 },
    { day: 'اثنين', level: 0.45 },
    { day: 'ثلاثا', level: 0.6 },
    { day: 'أربعا', level: 0.52 },
    { day: 'خميس', level: 0.95, hot: true },
    { day: 'جمعة', level: 0.85, hot: true },
    { day: 'سبت', level: 0.58 },
  ];

  const tips = [
    'بدّلي قهوة وحدة بقهوة بيت = +٣٥ ش اليوم',
    'فعّلي تنبيه قبل أي مصروف فوق ٥٠ ش',
    'جمّدي اشتراك غير مستخدم أسبوعين للتجربة',
  ];
  const waterDueSoon = true;
  const fxToJod = {
    USD: 0.709,
    EUR: 0.768,
    JOD: 1,
  };
  const currencyBalances = [
    { code: 'USD', label: 'رصيدي بالدولار USD', icon: '🇺🇸', amount: 500, symbol: '$' },
    { code: 'EUR', label: 'رصيدي باليورو EUR', icon: '🇪🇺', amount: 300, symbol: '€' },
    { code: 'JOD', label: 'رصيدي بالدينار JOD', icon: '🇯🇴', amount: 200, symbol: 'د.أ' },
  ];
  const currencyCards = currencyBalances.map((balance) => ({
    ...balance,
    convertedJod: balance.amount * fxToJod[balance.code],
  }));
  const totalCashJod = currencyCards.reduce((sum, balance) => sum + balance.convertedJod, 0);

  const goldHolding = {
    grams: 250,
    pricePerGramJod: 54.8,
  };
  const goldValueJod = goldHolding.grams * goldHolding.pricePerGramJod;

  const investments = [
    {
      name: 'أسهم في شركة Apple',
      shares: 12,
      pricePerShare: 198.4,
      currencyCode: 'USD',
      currencySymbol: '$',
      change: 2.1,
      icon: '🍎',
      sparkline: [{ v: 54 }, { v: 58 }, { v: 57 }, { v: 60 }, { v: 64 }, { v: 66 }],
    },
    {
      name: 'أسهم في شركة Tesla',
      shares: 7,
      pricePerShare: 173.2,
      currencyCode: 'USD',
      currencySymbol: '$',
      change: -1.4,
      icon: '⚡',
      sparkline: [{ v: 66 }, { v: 61 }, { v: 59 }, { v: 60 }, { v: 57 }, { v: 56 }],
    },
    {
      name: 'أسهم في شركة محلية',
      shares: 900,
      pricePerShare: 1.31,
      currencyCode: 'JOD',
      currencySymbol: 'د.أ',
      change: 1.3,
      icon: '🏛️',
      sparkline: [{ v: 30 }, { v: 32 }, { v: 34 }, { v: 36 }, { v: 35 }, { v: 37 }],
    },
    {
      name: 'أي استثمار آخر',
      shares: 15,
      pricePerShare: 24.7,
      currencyCode: 'EUR',
      currencySymbol: '€',
      change: 0.8,
      icon: '📈',
      sparkline: [{ v: 42 }, { v: 44 }, { v: 43 }, { v: 45 }, { v: 47 }, { v: 49 }],
    },
  ];
  const investmentCards = investments.map((investment) => {
    const totalNative = investment.shares * investment.pricePerShare;
    const convertedJod = totalNative * fxToJod[investment.currencyCode];
    return {
      ...investment,
      totalNative,
      convertedJod,
    };
  });
  const totalInvestmentsJod = investmentCards.reduce((sum, investment) => sum + investment.convertedJod, 0);
  const grandTotalJod = totalCashJod + goldValueJod + totalInvestmentsJod;
  const updatedAt = useMemo(
    () => new Intl.DateTimeFormat('ar-JO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
    []
  );
  const formatNumber = (value, options = {}) => new Intl.NumberFormat('ar-JO', options).format(value);
  const formatJod = (value) => `${formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.أ`;

  useEffect(() => {
    const onEsc = (event) => {
      if (event.key === 'Escape') setActiveModal(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <div className="ds-screen">
      <div className="home-hero animate-fade-in-up">
        <div className="home-hero-copy">
          <div className="home-hero-greeting text-slate-400 font-arabic" dir="rtl">صباح الخير رُبى</div>
          <h1 className="home-hero-title text-slate-100">Masrafji Dashboard</h1>
        </div>
        <button
          type="button"
          className="home-ai-toggle"
          aria-label="AI assistant enabled"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI ON</span>
        </button>
      </div>

      <div className="assets-overview animate-fade-in-up" style={{ animationDelay: '0.02s' }}>
        <GlowCard glow="emerald" className="assets-grand-card p-4 relative overflow-hidden">
          <div className="absolute inset-0 shimmer animate-shimmer pointer-events-none rounded-2xl" />
          <div className="assets-grand-top">
            <div>
              <div className="assets-eyebrow font-arabic" dir="rtl">
                <Wallet className="w-3.5 h-3.5" />
                إجمالي ما أملك
              </div>
              <div className="assets-grand-value-wrap">
                <span className="assets-grand-value">{formatJod(grandTotalJod)}</span>
              </div>
              <div className="assets-last-update font-arabic" dir="rtl">
                آخر تحديث: {updatedAt}
              </div>
            </div>
            <Pill tone="emerald" icon={ShieldCheck}>My Assets Overview</Pill>
          </div>
          <div className="assets-grand-kpis">
            <div className="assets-kpi-item">
              <div className="assets-kpi-label font-arabic" dir="rtl">الأرصدة النقدية</div>
              <div className="assets-kpi-value">{formatJod(totalCashJod)}</div>
            </div>
            <div className="assets-kpi-item">
              <div className="assets-kpi-label font-arabic" dir="rtl">الذهب</div>
              <div className="assets-kpi-value">{formatJod(goldValueJod)}</div>
            </div>
            <div className="assets-kpi-item">
              <div className="assets-kpi-label font-arabic" dir="rtl">الاستثمارات</div>
              <div className="assets-kpi-value">{formatJod(totalInvestmentsJod)}</div>
            </div>
          </div>
        </GlowCard>

        <GlowCard glow="teal" className="assets-section-card p-3.5">
          <div className="assets-section-header">
            <h3 className="assets-section-title font-arabic" dir="rtl">الأرصدة النقدية</h3>
            <span className="assets-section-meta font-arabic" dir="rtl">حسب سعر الصرف الحالي</span>
          </div>
          <div className="assets-currency-grid">
            {currencyCards.map((balance) => (
              <div key={balance.code} className="assets-currency-item">
                <div className="assets-currency-top">
                  <div className="assets-currency-icon" aria-hidden="true">{balance.icon}</div>
                  <div className="assets-currency-title-wrap">
                    <div className="assets-currency-title font-arabic" dir="rtl">{balance.label}</div>
                    <div className="assets-currency-amount">
                      {formatNumber(balance.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{balance.symbol}
                    </div>
                  </div>
                </div>
                <div className="assets-converted-row">
                  <span className="assets-converted-label font-arabic" dir="rtl">القيمة بالدينار</span>
                  <span className="assets-converted-value">{formatJod(balance.convertedJod)}</span>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>

        <GlowCard glow="amber" className="assets-section-card p-3.5">
          <div className="assets-section-header">
            <h3 className="assets-section-title font-arabic" dir="rtl">الذهب</h3>
            <span className="assets-section-meta font-arabic" dir="rtl">تقييم تقديري</span>
          </div>
          <div className="assets-gold-card">
            <div className="assets-gold-icon-wrap" aria-hidden="true">
              <Crown className="w-4 h-4" />
            </div>
            <div className="assets-gold-main">
              <div className="assets-gold-title font-arabic" dir="rtl">250 غرام ذهب</div>
              <div className="assets-gold-sub font-arabic" dir="rtl">
                سعر الغرام الحالي {formatJod(goldHolding.pricePerGramJod)}
              </div>
            </div>
            <div className="assets-gold-value-wrap">
              <div className="assets-gold-value">{formatJod(goldValueJod)}</div>
              <div className="assets-gold-sub font-arabic" dir="rtl">القيمة الإجمالية المقدّرة</div>
            </div>
          </div>
        </GlowCard>

        <GlowCard glow="indigo" className="assets-section-card p-3.5">
          <div className="assets-section-header">
            <h3 className="assets-section-title font-arabic" dir="rtl">الاستثمارات والأسهم</h3>
            <span className="assets-section-meta font-arabic" dir="rtl">تحديث مباشر للسوق</span>
          </div>
          <div className="assets-investments-list">
            {investmentCards.map((investment) => (
              <div key={investment.name} className="assets-investment-item">
                <div className="assets-investment-head">
                  <div className="assets-investment-company">
                    <span className="assets-investment-icon" aria-hidden="true">{investment.icon}</span>
                    <span className="font-arabic" dir="rtl">{investment.name}</span>
                  </div>
                  <div className={`assets-investment-change ${investment.change >= 0 ? 'is-up' : 'is-down'}`}>
                    {investment.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {formatNumber(Math.abs(investment.change), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                  </div>
                </div>
                <div className="assets-investment-meta">
                  <span className="font-arabic" dir="rtl">عدد الأسهم: {formatNumber(investment.shares)}</span>
                  <span>
                    سعر السهم: {formatNumber(investment.pricePerShare, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {investment.currencySymbol}
                  </span>
                  <span className="font-arabic" dir="rtl">
                    الإجمالي: {formatNumber(investment.totalNative, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {investment.currencySymbol}
                  </span>
                </div>
                <div className="assets-investment-foot">
                  <div className="assets-sparkline-wrap">
                    <Sparkline data={investment.sparkline} color={investment.change >= 0 ? '#34d399' : '#f87171'} height={30} />
                  </div>
                  <div className="assets-converted-value">{formatJod(investment.convertedJod)}</div>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      <GlowCard glow="purple" className="home-goal-card goal-focus-card p-4 relative animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 grid place-items-center shrink-0">
            <Car className="w-5 h-5 text-purple-200" />
          </div>
          <div className="flex-1">
            <div className="goal-focus-card__header">
              <div className="goal-focus-card__title text-sm text-slate-100 font-semibold font-arabic" dir="rtl">هدفك: قسط السيارة</div>
              <div
                className="goal-focus-card__deadline text-purple-200 font-arabic"
                dir="rtl"
              >
                <span className="goal-focus-card__deadline-icon">
                  <CalendarDays className="w-3.5 h-3.5 text-purple-100" strokeWidth={2} />
                </span>
                <span className="goal-focus-card__deadline-text">باقي ٨ أيام</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-arabic" dir="rtl">المطلوب ٢٠٠٠ ش · المتوفر ١٤٠٠ ش</div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-300 shadow-[0_0_12px_rgba(168,85,247,0.6)]" style={{ width: '70%' }} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <div className="text-[11px] text-slate-300 font-arabic" dir="rtl">ماشي ممتاز 👏</div>
              <div className="text-[12px] text-emerald-300 font-bold">70%</div>
            </div>
          </div>
        </div>
      </GlowCard>

      <div className="grid grid-cols-3 gap-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <GlowCard glow="rose" className="p-2.5">
          <div className="flex items-center gap-1 text-[9px] text-slate-500 font-arabic" dir="rtl"><Wallet className="w-3 h-3" /> صرف اليوم</div>
          <div className="text-lg font-bold text-slate-100 mt-0.5">٢٥٠ ش</div>
          <div className="text-[9px] text-rose-300" dir="rtl">+١٥٪ عن المعتاد</div>
        </GlowCard>
        <GlowCard glow="amber" className="p-2.5">
          <div className="flex items-center gap-1 text-[9px] text-slate-500 font-arabic" dir="rtl"><TrendingUp className="w-3 h-3" /> المعدل</div>
          <div className="text-lg font-bold text-slate-100 mt-0.5">١٨٠ ش</div>
          <div className="text-[9px] text-amber-300" dir="rtl">اليومي</div>
        </GlowCard>
        <GlowCard glow="emerald" className="p-2.5">
          <div className="flex items-center gap-1 text-[9px] text-slate-500 font-arabic" dir="rtl"><ShieldCheck className="w-3 h-3" /> التوفير</div>
          <div className="text-lg font-bold text-emerald-300 mt-0.5">+٩٠ ش</div>
          <div className="text-[9px] text-emerald-300" dir="rtl">هذا الأسبوع</div>
        </GlowCard>
      </div>

      <div className="grid grid-cols-2 gap-2 animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
        <button
          type="button"
          className="dashboard-launch-card dashboard-launch-card--subscription"
          onClick={() => setActiveModal('subscriptions')}
        >
          <div className="dashboard-launch-icon">📦</div>
          <div className="dashboard-launch-copy">
            <div className="dashboard-launch-title font-arabic" dir="rtl">الاشتراكات</div>
            <div className="dashboard-launch-sub font-arabic" dir="rtl">إدارة وتجديدات الشهر</div>
          </div>
          <ChevronRight className="w-4 h-4 dashboard-launch-chevron" />
        </button>
        <button
          type="button"
          className="dashboard-launch-card dashboard-launch-card--savings"
          onClick={() => setActiveModal('savings')}
        >
          <div className="dashboard-launch-icon">💰</div>
          <div className="dashboard-launch-copy">
            <div className="dashboard-launch-title font-arabic" dir="rtl">التوفير</div>
            <div className="dashboard-launch-sub font-arabic" dir="rtl">تقدّم الأهداف والفرص</div>
          </div>
          <ChevronRight className="w-4 h-4 dashboard-launch-chevron" />
        </button>
      </div>

      <GlowCard glow="amber" className="p-3.5 animate-fade-in-up" style={{ animationDelay: '0.14s' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 grid place-items-center shrink-0">
            <Thermometer className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">تنبيه ذكي: فاتورة الكهرباء</div>
              <Pill tone="amber">٣٨°</Pill>
            </div>
            <p className="text-[12px] text-slate-300 leading-snug mt-1 font-arabic" dir="rtl">
              استهلاكك مرتفع بسبب الحر. المتوقع انتهاء الرصيد <span className="text-amber-300 font-semibold">بكرا ٩:٤٠</span>.
            </p>
            <button className="mt-2 w-full py-2 rounded-lg bg-amber-500/20 border border-amber-500/35 text-amber-200 text-[11px] font-arabic hover:bg-amber-500/25 transition" dir="rtl">
              اشحن الآن + فعّل تذكير واتساب
            </button>
          </div>
        </div>
      </GlowCard>

      <GlowCard glow="teal" className="p-3.5 animate-fade-in-up" style={{ animationDelay: '0.17s' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 grid place-items-center shrink-0 border border-cyan-500/30">
            <Waves className="w-5 h-5 text-cyan-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">فاتورة المي</div>
              <Pill tone={waterDueSoon ? 'amber' : 'teal'}>
                {waterDueSoon ? 'قريب الاستحقاق' : 'لسا في وقت'}
              </Pill>
            </div>

            <div className="mt-1 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-950/55 border border-slate-700/60 p-2">
                <div className="text-[9px] text-slate-500 font-arabic" dir="rtl">المبلغ</div>
                <div className="text-[13px] text-cyan-300 font-semibold">١٣٥ ش</div>
              </div>
              <div className={`rounded-lg p-2 border ${waterDueSoon ? 'bg-amber-500/10 border-amber-500/35' : 'bg-slate-950/55 border-slate-700/60'}`}>
                <div className="text-[9px] text-slate-500 font-arabic" dir="rtl">موعد الدفع</div>
                <div className={`text-[13px] font-semibold ${waterDueSoon ? 'text-amber-300' : 'text-slate-200'}`}>بعد يومين</div>
              </div>
            </div>

            <p className="text-[12px] text-slate-300 leading-snug mt-2 font-arabic" dir="rtl">
              لا تخلّي فاتورة المي تتراكم 💧 خلّصها اليوم وارتاح!
            </p>

            <div className="mt-1.5 text-[11px] text-cyan-200/90 font-arabic" dir="rtl">
              خطوة صغيرة اليوم، راحة كبيرة بعدين 💙
            </div>

            <button
              className="mt-2 w-full py-2 rounded-lg bg-cyan-500/18 border border-cyan-500/35 text-cyan-200 text-[11px] font-semibold font-arabic hover:bg-cyan-500/24 transition"
              dir="rtl"
            >
              ادفع الآن
            </button>
          </div>
        </div>
      </GlowCard>

      <GlowCard glow="indigo" className="p-3.5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">رؤية AI للأسبوع</div>
          <Pill tone="indigo" icon={Brain}>Pattern</Pill>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekly.map((w) => (
            <div key={w.day} className="flex flex-col items-center gap-1">
              <div
                className={`w-full aspect-square rounded-md ${
                  w.hot
                    ? 'bg-gradient-to-br from-rose-400 to-orange-400 shadow-[0_0_10px_rgba(244,63,94,0.45)]'
                    : 'bg-emerald-500/30 border border-emerald-500/30'
                }`}
                style={{ opacity: 0.4 + w.level * 0.6 }}
              />
              <div className="text-[9px] text-slate-400 font-arabic">{w.day}</div>
            </div>
          ))}
        </div>
        <div className="mt-2.5 text-[12px] text-slate-300 leading-snug font-arabic" dir="rtl">
          الخميس والجمعة هم أعلى أيام صرف. جرّبي خطة <span className="text-indigo-300 font-semibold">حد يومي ١٧٠ ش</span>.
        </div>
      </GlowCard>

      <GlowCard glow="teal" className="p-3.5 animate-fade-in-up" style={{ animationDelay: '0.26s' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">توصيات اليوم</div>
          <Pill tone="teal" icon={Zap}>Smart Tips</Pill>
        </div>
        <div className="space-y-1.5">
          {tips.map((tip, i) => (
            <button
              key={i}
              className="w-full text-right rounded-lg bg-slate-950/55 border border-slate-700/60 px-2.5 py-2 text-[11px] text-slate-200 hover:border-teal-400/35 hover:-translate-y-0.5 transition font-arabic"
              dir="rtl"
            >
              {tip}
            </button>
          ))}
        </div>
      </GlowCard>

      <SubscriptionsModal open={activeModal === 'subscriptions'} onClose={() => setActiveModal(null)} />
      <SavingsModal open={activeModal === 'savings'} onClose={() => setActiveModal(null)} />
    </div>
  );
}

/* =========================================================
   2. COACH — supportive, not preachy
   ========================================================= */

function CoachView() {
  const [whisper, setWhisper] = useState(false);
  const [showTherapy, setShowTherapy] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('قهوة اليوم');

  useEffect(() => {
    const t = setTimeout(() => setShowTherapy(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const quickPrompts = [
    'قهوة اليوم',
    'كيف أوفّر ١٠٠ شيكل؟',
    'بدّي خطة ٣ أيام',
    'شو أهم مصروف لازم أوقفه؟',
  ];

  const sceneByPrompt = {
    'قهوة اليوم': { mood: 'هادية', save: '٧٠٠ ش/شهر', color: 'from-emerald-400 to-teal-300' },
    'كيف أوفّر ١٠٠ شيكل؟': { mood: 'مركزة', save: '١١٥ ش/أسبوع', color: 'from-indigo-400 to-purple-300' },
    'بدّي خطة ٣ أيام': { mood: 'سريعة', save: '٢٣٠ ش/٣ أيام', color: 'from-amber-400 to-orange-300' },
    'شو أهم مصروف لازم أوقفه؟': { mood: 'حازمة', save: '٣٢٠ ش/شهر', color: 'from-rose-400 to-fuchsia-400' },
  };
  const activeScene = sceneByPrompt[selectedPrompt];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-2 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-purple-300/90 font-arabic" dir="rtl">
          <Sparkles className="w-3.5 h-3.5" />
          {whisper ? 'وضع الهمس · بدون صوت' : 'مصرفجي عم يسمعك'}
        </div>
        <button
          onClick={() => setWhisper(s => !s)}
          className={`text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 transition ${
            whisper
              ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
              : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          {whisper ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          <span dir="rtl" className="font-arabic">{whisper ? 'الهمس' : 'فعّل الهمس'}</span>
        </button>
      </div>

      <div className="px-4 pb-2">
        <GlowCard glow="fuchsia" className="p-3 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-fuchsia-500/20 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-teal-400/15 blur-2xl" />
          <div className="flex items-center justify-between relative">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-300/80">Coach Studio</div>
              <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">جلسة سريعة · قرار أوفر</div>
            </div>
            <div className={`px-2 py-1 rounded-full text-[10px] border border-white/20 bg-gradient-to-r ${activeScene.color} text-slate-900 font-semibold font-arabic`}>
              مزاج {activeScene.mood}
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 relative">
            <div className="rounded-lg bg-slate-950/55 border border-slate-700/60 p-2.5">
              <div className="text-[10px] text-slate-400 font-arabic" dir="rtl">توفير متوقّع</div>
              <div className="text-sm text-emerald-300 font-semibold mt-0.5">{activeScene.save}</div>
            </div>
            <div className="rounded-lg bg-slate-950/55 border border-slate-700/60 p-2.5">
              <div className="text-[10px] text-slate-400 font-arabic" dir="rtl">طاقة الجلسة</div>
              <div className="flex items-center gap-1 mt-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= 4 ? 'bg-emerald-400/90' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>
          </div>
        </GlowCard>
      </div>

      <div className="px-4 pb-2">
        <GlowCard glow="teal" className="p-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] text-slate-100 font-semibold font-arabic" dir="rtl">ابدأي بسرعة</div>
            <div className="text-[10px] text-slate-500 font-arabic" dir="rtl">اختاري سؤال جاهز</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setSelectedPrompt(prompt)}
                className={`px-2 py-1 rounded-full text-[10px] border font-arabic transition ${
                  selectedPrompt === prompt
                    ? 'bg-gradient-to-r from-teal-400/20 to-indigo-400/20 text-teal-100 border-teal-400/50 shadow-[0_0_14px_rgba(45,212,191,0.25)]'
                    : 'bg-slate-900/70 text-slate-300 border-slate-700/70 hover:text-slate-100 hover:border-slate-500'
                }`}
                dir="rtl"
              >
                {prompt}
              </button>
            ))}
          </div>
        </GlowCard>
      </div>

      <div className="flex-1 px-4 pt-1 pb-2 space-y-3 overflow-y-auto no-scrollbar">
        <GlowCard glow="emerald" className="p-2.5 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-100 font-semibold font-arabic" dir="rtl">الوضع الحالي</div>
            <Pill tone="emerald" icon={Sparkles}>جاهز للمساعدة</Pill>
          </div>
          <p className="text-[11px] text-slate-300 mt-1.5 leading-snug font-arabic" dir="rtl">
            اخترتي: <span className="text-emerald-300 font-semibold">{selectedPrompt}</span> ·
            رح أجاوبك بخطوات عملية + رقم التوفير المتوقع.
          </p>
        </GlowCard>

        {/* user 1 — coffee */}
        <div className="flex justify-end animate-fade-in-up">
          <div className="max-w-[85%]">
            <GlowCard glow="slate" className="px-3.5 py-2.5 rounded-tr-sm bg-slate-800/80">
              {!whisper && (
                <div className="flex items-center gap-2 mb-1.5">
                  <VoiceWave color="bg-emerald-400" bars={14} />
                  <span className="text-[10px] text-slate-400">0:06</span>
                </div>
              )}
              <p dir="rtl" className="text-[14px] leading-relaxed text-slate-100 font-arabic">
                يا مصرفجي اليوم طارت ٥٠ شيكل عالقهوة من كافي لاب وبدي كمان وحدة
              </p>
            </GlowCard>
          </div>
        </div>

        {/* AI 1 — supportive coffee coach */}
        <div className="flex justify-start animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="max-w-[92%] w-full">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 grid place-items-center shadow-[0_0_15px_rgba(168,85,247,0.55)]">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-purple-300 font-arabic">مصرفجي</span>
              <Pill tone="purple" icon={Brain}>وضع المدرّب</Pill>
            </div>

            <GlowCard glow="purple" className="px-4 py-3 rounded-tl-sm">
              <p dir="rtl" className="text-[14px] leading-relaxed text-slate-100 font-arabic">
                تاج راسك اشربي ☕ القهوة من حقّك.
                <br />
                بس خلّيني قلّك إشي صغير: ٥٠ شيكل كل يوم بصير{' '}
                <span className="text-rose-300 font-semibold">١٥٠٠ بالشهر</span>
                {' '}— يعني تلت قسط السيارة.
                <br />
                شو رايك يومين كافي لاب ويومين قهوة عملتيها انتي بالبيت؟
                <br />
                <span className="text-emerald-300 font-semibold">هيك بنوفّر ٧٠٠ شيكل وانتي مبسوطة 🚗</span>
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-950/60 border border-slate-700/60 p-2">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400" dir="rtl">رح توفّري</div>
                  <div className="text-base font-bold text-emerald-300 mt-0.5">+٧٠٠ <span className="text-[10px] text-slate-500">ش/شهر</span></div>
                </div>
                <div className="rounded-lg bg-slate-950/60 border border-slate-700/60 p-2">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400" dir="rtl">القسط بيلحقك</div>
                  <div className="text-base font-bold text-purple-300 mt-0.5">يوم ٢٢ <span className="text-[10px] text-slate-500">/ ٣٠</span></div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5">
                <button className="flex-1 py-1.5 rounded-md bg-emerald-500 text-slate-900 font-semibold text-[11px] font-arabic">
                  ثبّتي الخطة
                </button>
                <button className="px-2.5 py-1.5 rounded-md bg-slate-900/70 border border-slate-700 text-[11px] text-slate-300 font-arabic">
                  بديل أرخص
                </button>
              </div>
            </GlowCard>
          </div>
        </div>

        {/* user 2 — therapy trigger */}
        <div className="flex justify-end animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="max-w-[80%]">
            <GlowCard glow="slate" className="px-3.5 py-2.5 rounded-tr-sm bg-slate-800/80">
              {!whisper && (
                <div className="flex items-center gap-2 mb-1.5">
                  <VoiceWave color="bg-rose-400" bars={10} />
                  <span className="text-[10px] text-slate-400">0:03</span>
                </div>
              )}
              <p dir="rtl" className="text-[14px] leading-relaxed text-slate-100 font-arabic">
                بس صراحة انخنقت من الديون 😔
              </p>
            </GlowCard>
          </div>
        </div>

        {/* AI 2 — supportive therapy mode */}
        {showTherapy && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="max-w-[92%] w-full">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shadow-[0_0_15px_rgba(129,140,248,0.55)]">
                  <MessageCircleHeart className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-indigo-200 font-arabic">مصرفجي · جنبك</span>
                <Pill tone="indigo" icon={Heart}>وضع الدعم</Pill>
              </div>

              <GlowCard glow="indigo" className="px-4 py-3 rounded-tl-sm bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-slate-900/80">
                <p dir="rtl" className="text-[14px] leading-relaxed text-slate-100 font-arabic">
                  حبيبتي، حسّيت فيكي ❤️ ما تخافي، أنا معك.
                  <br />
                  مجموع ديونك <span className="text-emerald-300 font-semibold">٨٣٠ شيكل</span> — صدقيني هاد رقم نقدر نتجاوزه سوا.
                  <br />
                  بنبلش بأصغر دين الأسبوع — لما تخلصيه رح تحسّي بفرق نفسي حقيقي. الباقي بييجي وراه.
                </p>

                <div className="mt-3 space-y-1.5">
                  {[
                    { name: 'كريم · تصليح تلفون', amt: 80,  pct: 100, label: 'هالأسبوع' },
                    { name: 'تانت سلمى',         amt: 250, pct: 60,  label: 'الشهر الجاي' },
                    { name: 'ماما',              amt: 500, pct: 20,  label: 'بعد شهرين' },
                  ].map((d, i) => (
                    <div key={i} className="rounded-lg bg-slate-950/60 border border-slate-700/60 p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[12px] text-slate-200 font-arabic" dir="rtl">{d.name}</div>
                        <div className="text-[11px] text-emerald-300 font-semibold">{d.amt} ش</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-300"
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-indigo-200 font-arabic w-20 text-right" dir="rtl">{d.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-[12px] text-indigo-200/95 font-arabic leading-relaxed" dir="rtl">
                  وأهم إشي: <span className="text-emerald-300 font-semibold">ما تخسري نومك</span>. الفلوس بترجع، انتي الأهم 🤍
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="py-1.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-100 text-[11px] font-arabic">
                    خطة هادئة لليوم
                  </button>
                  <button className="py-1.5 rounded-md bg-emerald-500 text-slate-900 text-[11px] font-semibold font-arabic">
                    بلّشي خطوة أولى
                  </button>
                </div>
              </GlowCard>
            </div>
          </div>
        )}

        <div className="h-28" />
      </div>

      {/* Floating mic */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-10 w-[86%] max-w-[330px]">
        <div className="rounded-2xl border border-purple-400/30 bg-slate-950/75 backdrop-blur-xl p-2.5 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <div className="flex items-center gap-2">
            <button
              className="relative w-14 h-14 rounded-xl grid place-items-center
                bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-700
                ring-2 ring-purple-500/20 transition-transform active:scale-95
                animate-pulse-glow shrink-0"
            >
              <span className="absolute inset-0 rounded-xl bg-purple-500/25 animate-ping" />
              <Mic className="w-6 h-6 text-white drop-shadow" strokeWidth={2.2} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-purple-200 font-semibold font-arabic" dir="rtl">
                {whisper ? 'وضع الكتابة السريعة' : 'احكي مع مصرفجي هلق'}
              </div>
              <div className="text-[10px] text-slate-400 font-arabic" dir="rtl">
                رد فوري + خطة صغيرة مباشرة
              </div>
            </div>
            <button className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-900 text-[10px] font-semibold font-arabic">
              ابدأ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   3. FORECAST — story + Triage Mode
   ========================================================= */

function ForecastView({ isLight }) {
  const [triageOn, setTriageOn] = useState(false);
  const [mode, setMode] = useState('balanced');

  const data = useMemo(() => {
    const out = [];
    let current, plan;
    for (let d = 0; d <= 30; d++) {
      current = 1400 - d * 65 + Math.sin(d / 2) * 25;
      plan    = 1400 - d * 38 + Math.cos(d / 3) * 18;
      out.push({
        day: d,
        current: Math.round(current),
        plan: Math.round(plan),
      });
    }
    return out;
  }, []);

  const danger = data.find(d => d.current <= 0);
  const dangerDay = danger ? danger.day : 30;

  const playbooks = {
    safe: {
      title: 'وضع آمن',
      subtitle: 'تقليل صرف يومي + حماية الفواتير',
      save: '+٣٥٠ ش',
      runway: 'حتى يوم ٢٩',
      chip: 'from-emerald-400 to-teal-300',
    },
    balanced: {
      title: 'وضع موزون',
      subtitle: 'حياة طبيعية مع توفير ذكي',
      save: '+٢٦٠ ش',
      runway: 'حتى يوم ٢٧',
      chip: 'from-indigo-400 to-purple-300',
    },
    bold: {
      title: 'وضع هجومي',
      subtitle: 'شدّة عالية لمدة ٧ أيام',
      save: '+٤٨٠ ش',
      runway: 'حتى الراتب + زيادة',
      chip: 'from-amber-400 to-orange-300',
    },
  };
  const selectedPlaybook = playbooks[mode];

  const arLabel = (d) => {
    if (d === 0)  return 'هلأ';
    if (d === 7)  return 'أسبوع';
    if (d === 14) return 'أسبوعين';
    if (d === 21) return '٣ أسابيع';
    if (d === 30) return 'الراتب';
    return '';
  };

  const chartPalette = isLight
    ? {
      planStroke: '#059669',
      currentStroke: '#e11d48',
      goalLine: '#7c3aed',
      axisLine: '#94a3b8',
      gridLine: 'rgba(100, 116, 139, 0.28)',
      xTick: '#475569',
      yTick: '#64748b',
      tooltipBg: 'rgba(255,255,255,0.98)',
      tooltipBorder: 'rgba(124,58,237,0.34)',
      tooltipText: '#0f172a',
      tooltipShadow: '0 14px 30px rgba(15,23,42,0.18)',
      dangerLabel: '#be123c',
      goalLabel: '#6d28d9',
      activeDotStroke: '#ffffff',
    }
    : {
      planStroke: '#10b981',
      currentStroke: '#f43f5e',
      goalLine: '#a855f7',
      axisLine: '#1e293b',
      gridLine: '#1e293b',
      xTick: '#94a3b8',
      yTick: '#64748b',
      tooltipBg: 'rgba(2,6,23,0.95)',
      tooltipBorder: 'rgba(168,85,247,0.4)',
      tooltipText: '#e2e8f0',
      tooltipShadow: '0 0 20px rgba(168,85,247,0.25)',
      dangerLabel: '#fda4af',
      goalLabel: '#d8b4fe',
      activeDotStroke: '#0f172a',
    };

  return (
    <div className="ds-screen">
      <GlowCard glow="fuchsia" className="p-3.5 animate-fade-in-up relative overflow-hidden forecast-wow-card">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-fuchsia-500/15 blur-2xl" />
        <div className="absolute inset-0 forecast-wow-aurora pointer-events-none" />
        <div className="flex items-center justify-between mb-2 relative">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-300/80">Money Radar</div>
            <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">اختاري سيناريو الشهر</div>
          </div>
          <span className={`px-2 py-1 rounded-full text-[10px] text-slate-900 font-semibold bg-gradient-to-r ${selectedPlaybook.chip}`}>
            {selectedPlaybook.title}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'safe', label: 'آمن' },
            { id: 'balanced', label: 'موزون' },
            { id: 'bold', label: 'هجومي' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`py-1.5 rounded-lg text-[11px] border font-arabic transition ${
                mode === m.id
                  ? 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/40'
                  : 'bg-slate-950/60 border-slate-700/60 text-slate-300'
              }`}
              dir="rtl"
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="mt-2 rounded-lg bg-slate-950/60 border border-slate-700/60 p-2.5 forecast-wow-mini">
          <div className="text-[11px] text-slate-200 font-arabic" dir="rtl">{selectedPlaybook.subtitle}</div>
          <div className="mt-1 flex items-center justify-between text-[10px]">
            <span className="text-emerald-300 font-semibold">{selectedPlaybook.save}</span>
            <span className="text-slate-400 font-arabic" dir="rtl">{selectedPlaybook.runway}</span>
          </div>
        </div>
      </GlowCard>

      <GlowCard glow="rose" className="p-4 animate-fade-in-up">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 grid place-items-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-rose-300/80 font-arabic" dir="rtl">
              تنبيه · بكرا شو رح يصير
            </div>
            <p className="text-[14px] text-slate-100 leading-relaxed mt-1 font-arabic" dir="rtl">
              إذا كملتي تصرفي بنفس الطريقة،<br />
              <span className="text-rose-300 font-semibold">رح يخلص معاشك يوم ٢٤</span> ·{' '}
              يعني <span className="text-rose-300 font-semibold">٥ أيام قبل ما تيجي السيارة</span>.
            </p>
          </div>
        </div>
      </GlowCard>

      <div className="grid grid-cols-3 gap-2 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
        <GlowCard glow="rose" className="p-2.5 forecast-kpi-card">
          <div className="text-[9px] text-slate-500 font-arabic" dir="rtl">يوم الخطر</div>
          <div className="text-lg text-rose-300 font-bold mt-0.5">٢٤</div>
          <div className="text-[9px] text-slate-400 font-arabic" dir="rtl">بدون خطة</div>
        </GlowCard>
        <GlowCard glow="emerald" className="p-2.5 forecast-kpi-card">
          <div className="text-[9px] text-slate-500 font-arabic" dir="rtl">مع الخطة</div>
          <div className="text-lg text-emerald-300 font-bold mt-0.5">+٢٦٠</div>
          <div className="text-[9px] text-slate-400 font-arabic" dir="rtl">آخر الشهر</div>
        </GlowCard>
        <GlowCard glow="amber" className="p-2.5 forecast-kpi-card">
          <div className="text-[9px] text-slate-500 font-arabic" dir="rtl">ثقة التنفيذ</div>
          <div className="text-lg text-amber-300 font-bold mt-0.5">٨٨٪</div>
          <div className="text-[9px] text-slate-400 font-arabic" dir="rtl">جاهزية عالية</div>
        </GlowCard>
      </div>

      {/* Chart */}
      <GlowCard glow="purple" className="p-3 pb-1 animate-fade-in-up forecast-wow-card" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-purple-300/70 font-arabic" dir="rtl">
              فلوسك من اليوم لحد الراتب
            </div>
            <div className="text-[11px] text-slate-400 font-arabic" dir="rtl">المسار الحالي مقابل خطة مصرفجي</div>
          </div>
        </div>

        <div className="h-52 -ml-2 forecast-chart-shell">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="gPlan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={chartPalette.planStroke} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={chartPalette.planStroke} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={chartPalette.currentStroke} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={chartPalette.currentStroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke={chartPalette.gridLine} vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: chartPalette.xTick, fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: chartPalette.axisLine }}
                ticks={[0, 7, 14, 21, 30]}
                tickFormatter={arLabel}
              />
              <YAxis
                tick={{ fill: chartPalette.yTick, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: chartPalette.tooltipBg,
                  border: `1px solid ${chartPalette.tooltipBorder}`,
                  borderRadius: 12,
                  fontSize: 12,
                  color: chartPalette.tooltipText,
                  boxShadow: chartPalette.tooltipShadow,
                }}
                labelFormatter={(v) => `يوم ${v}`}
                formatter={(v, n) => [`${v} ش`, n === 'current' ? 'الحالي' : 'الخطة']}
              />
              <ReferenceLine y={0} stroke={chartPalette.currentStroke} strokeOpacity={0.6} strokeDasharray="3 3"
                label={{ value: 'فاضي', fill: chartPalette.dangerLabel, fontSize: 10, position: 'insideBottomRight' }} />
              <ReferenceLine y={2000} stroke={chartPalette.goalLine} strokeOpacity={0.5} strokeDasharray="2 4"
                label={{ value: '🚗 قسط السيارة', fill: chartPalette.goalLabel, fontSize: 10, position: 'insideTopLeft' }} />
              <ReferenceLine x={dangerDay} stroke={chartPalette.currentStroke} strokeOpacity={0.5}
                label={{ value: '⚠ منطقة الخطر', fill: chartPalette.dangerLabel, fontSize: 10, position: 'insideTopRight' }} />
              <Area type="monotone" dataKey="current" stroke={chartPalette.currentStroke} strokeWidth={2}
                strokeDasharray="5 4" fill="url(#gCurrent)" dot={false}
                activeDot={{ r: 4, fill: chartPalette.currentStroke, stroke: chartPalette.activeDotStroke, strokeWidth: 2 }} />
              <Area type="monotone" dataKey="plan" stroke={chartPalette.planStroke} strokeWidth={2.5}
                fill="url(#gPlan)" dot={false}
                activeDot={{ r: 4, fill: chartPalette.planStroke, stroke: chartPalette.activeDotStroke, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="px-1 pb-2 flex items-center gap-3 text-[10px] font-arabic" dir="rtl">
          <span className="inline-flex items-center gap-1.5 text-rose-300">
            <span className="inline-block w-4 h-[2px] bg-rose-400 rounded-full" /> طريقتك الحالية
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <span className="inline-block w-4 h-[2px] bg-emerald-400 rounded-full" /> اللي بنصحك فيه
          </span>
        </div>
      </GlowCard>

      {/* Story timeline */}
      <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <GlowCard glow="amber" className="p-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 grid place-items-center shrink-0">
            <Sun className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-amber-300 font-semibold font-arabic" dir="rtl">بعد أسبوع</div>
            <p className="text-[12px] text-slate-200 leading-snug font-arabic" dir="rtl">
              رح يضل معك حوالي <span className="text-slate-100 font-semibold">٩٤٠ شيكل</span> — لسا تمام.
            </p>
          </div>
        </GlowCard>

        <GlowCard glow="rose" className="p-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/15 grid place-items-center shrink-0">
            <Cloud className="w-4 h-4 text-rose-300" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-rose-300 font-semibold font-arabic" dir="rtl">بعد ٣ أسابيع</div>
            <p className="text-[12px] text-slate-200 leading-snug font-arabic" dir="rtl">
              فلوسك بتقرّب من <span className="text-rose-300 font-semibold">صفر</span>، ولسا ما دفعتي القسط.
            </p>
          </div>
        </GlowCard>

        <GlowCard glow="emerald" className="p-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 grid place-items-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-emerald-300 font-semibold font-arabic" dir="rtl">إذا مشيت بخطتي</div>
            <p className="text-[12px] text-slate-200 leading-snug font-arabic" dir="rtl">
              بتدفعي القسط <span className="text-emerald-300 font-semibold">وبيضل معك ٢٦٠ شيكل</span> لآخر الشهر.
            </p>
          </div>
        </GlowCard>
      </div>

      <GlowCard glow="indigo" className="p-3 animate-fade-in-up forecast-wow-card" style={{ animationDelay: '0.24s' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">٣ قرارات فورية</div>
          <Pill tone="indigo" icon={Brain}>Decision Pack</Pill>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { t: 'قفلي طلبات الأكل', s: '+١٢٠ ش' },
            { t: 'خفضي القهوة', s: '+٩٠ ش' },
            { t: 'تجميد اشتراك', s: '+٥٠ ش' },
          ].map((d, i) => (
            <button key={i} className="rounded-lg bg-slate-950/60 border border-slate-700/60 p-2 text-right hover:border-indigo-400/40 transition forecast-wow-mini" dir="rtl">
              <div className="text-[11px] text-slate-200 font-arabic leading-tight">{d.t}</div>
              <div className="text-[10px] text-emerald-300 mt-1 font-semibold">{d.s}</div>
            </button>
          ))}
        </div>
      </GlowCard>

      {/* TRIAGE MODE — actively manages the crisis */}
      <GlowCard glow="rose" className="p-3.5 animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '0.28s' }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl" />
        <div className="flex items-center justify-between mb-2 relative">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg grid place-items-center ${triageOn ? 'bg-rose-500/25 animate-pulse-glow' : 'bg-rose-500/15'}`}>
              <Shield className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">وضع الطوارئ</div>
              <div className="text-[10px] text-slate-500 font-arabic" dir="rtl">مصرفجي بياخد إجراء — مش بس ينبّه</div>
            </div>
          </div>
          <button
            onClick={() => setTriageOn(s => !s)}
            className={`text-[10px] px-2.5 py-1 rounded-full border font-arabic transition ${
              triageOn
                ? 'bg-rose-500 text-white border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {triageOn ? 'مفعّل' : 'فعّل'}
          </button>
        </div>

        {triageOn && (
          <div className="space-y-2 animate-fade-in-up">
            <div className="rounded-lg bg-slate-950/60 border border-emerald-500/20 p-2">
              <div className="text-[10px] text-emerald-300 mb-1 font-arabic" dir="rtl">✓ تم تلقائياً</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-200">
                  <Pause className="w-3 h-3 text-emerald-400" />
                  <span dir="rtl" className="font-arabic">جمّدت Netflix</span>
                  <span className="text-slate-500 mr-auto">٤٠ ش/شهر</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-200">
                  <Pause className="w-3 h-3 text-emerald-400" />
                  <span dir="rtl" className="font-arabic">جمّدت Spotify</span>
                  <span className="text-slate-500 mr-auto">٢٠ ش/شهر</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-200">
                  <Pause className="w-3 h-3 text-emerald-400" />
                  <span dir="rtl" className="font-arabic">وقّفت ادخار العيد مؤقتاً</span>
                  <span className="text-slate-500 mr-auto">١٥٠ ش/شهر</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-950/60 border border-emerald-500/30 p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-300 font-semibold font-arabic" dir="rtl">رسالة جاهزة لأبو خالد (مالك البيت)</span>
              </div>
              <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[12px] text-slate-100 leading-relaxed font-arabic" dir="rtl">
                "السلام عليكم أبو خالد 🌷
                <br />
                هذا الشهر مرّيت بظرف صعب وما رح أقدر أدفع كامل الإيجار.
                <br />
                ممكن أأجّل ٣٠٪ منه (٤٥٠ ش) للشهر الجاي؟ ملتزمة وما رح أفوّت عليكم 🙏"
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <button className="flex-1 py-1.5 rounded-md bg-emerald-500 text-slate-900 font-semibold text-[11px] font-arabic flex items-center justify-center gap-1">
                  <Send className="w-3 h-3" /> ارسلي عواتساب
                </button>
                <button className="px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-arabic">
                  عدّلي
                </button>
              </div>
            </div>
          </div>
        )}

        {!triageOn && (
          <p className="text-[11px] text-slate-400 leading-snug font-arabic" dir="rtl">
            لو وصلتي لوضع طوارئ، مصرفجي بيجمّد الاشتراكات تلقائياً وبيكتبلك رسالة لمالك البيت يأجّل جزء من الإيجار.
          </p>
        )}
      </GlowCard>

      <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900 font-semibold shadow-[0_0_25px_rgba(16,185,129,0.45)] active:scale-[0.99] transition flex items-center justify-center gap-2 animate-fade-in-up font-arabic" style={{ animationDelay: '0.35s' }} dir="rtl">
        <ShieldCheck className="w-5 h-5" />
        فعّل خطة النجاة
      </button>
    </div>
  );
}

/* =========================================================
   4. VAULT — Wajeb Engine + Levant kit
   ========================================================= */

function VaultView() {
  const usdSpark = useMemo(
    () => [3.78, 3.76, 3.74, 3.72, 3.70, 3.68, 3.66, 3.65].map((v, i) => ({ i, v })),
    []
  );
  const goldSpark = useMemo(
    () => [232, 235, 239, 241, 240, 244, 245, 247].map((v, i) => ({ i, v })),
    []
  );

  const debts = [
    { name: 'أحمد', sub: 'تصليح تلفون',  amt: 150, days: 12, owed: true  },
    { name: 'لينا', sub: 'هدية عيد ميلاد', amt: 80,  days: 4,  owed: true  },
    { name: 'ماما', sub: 'صيدلية',       amt: 500, days: 22, owed: false },
  ];

  return (
    <div className="ds-screen">
      <div className="vault-screen-head flex items-center justify-between px-1 animate-fade-in-up">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-purple-300/80" dir="rtl">صندوقك</div>
          <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">حماية فلوسك</div>
        </div>
        <Pill tone="emerald" icon={Shield}>محلي</Pill>
      </div>

      {/* ⭐ WAJEB ENGINE — the killer cultural feature */}
      <GlowCard glow="fuchsia" className="vault-card vault-card--hero p-4 animate-fade-in-up relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="vault-card__head relative">
          <div className="vault-card__intro">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-purple-500/30 border border-fuchsia-500/30 grid place-items-center">
              <BookOpen className="w-5 h-5 text-fuchsia-300" />
            </div>
            <div>
              <div className="vault-card__title text-sm text-slate-100 font-semibold font-arabic" dir="rtl">محرّك الواجبات الاجتماعية</div>
              <div className="vault-card__sub text-[10px] text-fuchsia-300/80 font-arabic" dir="rtl">من دفتر تيتة لميزانيتك · Wajeb Engine</div>
            </div>
          </div>
          <Pill tone="fuchsia" icon={Camera}>OCR</Pill>
        </div>

        {/* Notebook → digital banner */}
        <div className="rounded-lg bg-slate-950/60 border border-fuchsia-500/20 p-2.5 flex items-center gap-2.5 relative">
          <div className="w-9 h-9 rounded-md bg-amber-500/15 grid place-items-center text-lg">📓</div>
          <div className="flex-1">
            <div className="text-[11px] text-slate-200 font-arabic" dir="rtl">صوّرتي دفتر النقّوط الورقي</div>
            <div className="text-[10px] text-emerald-300 font-arabic" dir="rtl">✓ ٤٧ نقّوط محفوظين رقمياً</div>
          </div>
          <ChevronRight className="w-4 h-4 text-fuchsia-400" />
        </div>

        {/* The killer scenario */}
        <div className="mt-3 rounded-xl bg-gradient-to-br from-fuchsia-950/50 to-slate-950/60 border border-fuchsia-500/30 p-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-400 to-purple-500 grid place-items-center text-slate-900 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-slate-100 font-semibold font-arabic" dir="rtl">محمود (ابن خالك)</div>
                <Pill tone="fuchsia">بعد ٢٧ يوم</Pill>
              </div>
              <div className="text-[11px] text-fuchsia-200/90 font-arabic" dir="rtl">🎓 تخرّج · ٢٤ مايو</div>

              <div className="mt-2 space-y-1 text-[11px]" dir="rtl">
                <div className="flex items-center justify-between font-arabic">
                  <span className="text-slate-400">نقّط على عرسك ٢٠١٨</span>
                  <span className="text-slate-200">٥٠٠ ش</span>
                </div>
                <div className="flex items-center justify-between font-arabic">
                  <span className="text-slate-400">+ تضخّم ٧ سنين</span>
                  <span className="text-slate-200">+١٢٥ ش</span>
                </div>
                <div className="flex items-center justify-between font-arabic">
                  <span className="text-slate-400">+ المكانة الاجتماعية</span>
                  <span className="text-slate-200">+١٢٥ ش</span>
                </div>
                <div className="flex items-center justify-between border-t border-fuchsia-500/20 pt-1 mt-1 font-arabic">
                  <span className="text-fuchsia-300 font-semibold">المبلغ المقترح</span>
                  <span className="text-fuchsia-300 font-bold">٧٥٠ ش</span>
                </div>
              </div>

              <div className="mt-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-1.5 text-[11px] text-emerald-300 font-arabic flex items-center gap-1.5" dir="rtl">
                <ShieldCheck className="w-3.5 h-3.5" />
                حجزتلك ٧٥٠ ش بميزانية الشهر الجاي
              </div>
            </div>
          </div>
        </div>

        {/* Other upcoming */}
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-950/60 border border-slate-700/60 p-2">
            <div className="text-[10px] text-slate-400 font-arabic" dir="rtl">عرس سارة</div>
            <div className="text-[11px] text-slate-200 font-arabic" dir="rtl">١٠ يونيو</div>
            <div className="text-[12px] text-fuchsia-300 font-bold mt-0.5">٨٠٠ ش</div>
          </div>
          <div className="rounded-lg bg-slate-950/60 border border-slate-700/60 p-2">
            <div className="text-[10px] text-slate-400 font-arabic" dir="rtl">مولد بنت تانت</div>
            <div className="text-[11px] text-slate-200 font-arabic" dir="rtl">٥ يوليو</div>
            <div className="text-[12px] text-fuchsia-300 font-bold mt-0.5">٢٠٠ ش</div>
          </div>
        </div>
      </GlowCard>

      {/* Gold & FX */}
      <GlowCard glow="amber" className="vault-card p-3 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 grid place-items-center">
              <Coins className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">الذهب والدولار</div>
              <div className="text-[10px] text-slate-500 font-arabic" dir="rtl">أحسن وقت للبيع والشراء</div>
            </div>
          </div>
          <Pill tone="emerald" icon={Zap}>وقت الشراء</Pill>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-950/60 border border-slate-700/60 p-2.5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-slate-400">USD / شيكل</div>
              <span className="text-[10px] text-emerald-300 inline-flex items-center gap-0.5">
                <ArrowDownRight className="w-2.5 h-2.5" /> ٢٫١٪
              </span>
            </div>
            <div className="text-base font-bold text-slate-100 mt-0.5">٣٫٦٥</div>
            <div className="-mx-1 -mb-1 mt-1">
              <Sparkline data={usdSpark} color="#10b981" height={28} />
            </div>
            <div className="text-[9px] text-emerald-300 mt-0.5 font-arabic" dir="rtl">اشتري قبل الجمعة</div>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-700/60 p-2.5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-slate-400">ذهب ٢٤ · غ</div>
              <span className="text-[10px] text-rose-300 inline-flex items-center gap-0.5">
                <ArrowUpRight className="w-2.5 h-2.5" /> ٤٫٧٪
              </span>
            </div>
            <div className="text-base font-bold text-slate-100 mt-0.5">₪٢٤٧</div>
            <div className="-mx-1 -mb-1 mt-1">
              <Sparkline data={goldSpark} color="#f59e0b" height={28} />
            </div>
            <div className="text-[9px] text-amber-300 mt-0.5 font-arabic" dir="rtl">وقت بيع كويس</div>
          </div>
        </div>
      </GlowCard>

      {/* Price gouging */}
      <GlowCard glow="rose" className="vault-card p-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 grid place-items-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">سعر مبالغ فيه</div>
              <Pill tone="rose">٢× المعدل</Pill>
            </div>
            <p className="text-[12px] text-slate-300 leading-snug mt-0.5 font-arabic" dir="rtl">
              🥖 سجلتي <span className="text-rose-300 font-semibold">٢٠ شيكل</span> خبز من فرن المدينة.
              معدل حارتك: <span className="text-emerald-300 font-semibold">١٠ شيكل</span> بس.
            </p>
            <div className="mt-2 rounded-lg bg-slate-950/60 border border-slate-700/60 p-2 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <div className="text-[11px] text-slate-300 flex-1 font-arabic" dir="rtl">
                فرن أبو خالد · شارعين · <span className="text-emerald-300 font-medium">١٢ شيكل</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>
      </GlowCard>

      {/* Debt ledger */}
      <GlowCard glow="emerald" className="vault-card p-3 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 grid place-items-center">
              <Receipt className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">تفقيد الدين</div>
              <div className="text-[10px] text-slate-500 font-arabic" dir="rtl">مين عليه إلك ومين إلك عليه</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-400 font-arabic" dir="rtl">الصافي</div>
            <div className="text-sm font-bold text-emerald-300">+٢٠٠ ش</div>
          </div>
        </div>
        <div className="space-y-1.5">
          {debts.map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg bg-slate-950/60 border border-slate-700/60 px-2.5 py-2"
            >
              <div className={`w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold font-arabic
                ${d.owed
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}`}>
                {d.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0" dir="rtl">
                <div className="text-[12px] text-slate-100 leading-tight font-arabic">{d.name}</div>
                <div className="text-[10px] text-slate-500 leading-tight font-arabic">{d.sub} · من {d.days} يوم</div>
              </div>
              <div className={`text-[12px] font-semibold ${d.owed ? 'text-emerald-300' : 'text-amber-300'}`}>
                {d.owed ? '+' : '−'}{d.amt}
              </div>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Reverse subscriptions */}
      <GlowCard glow="indigo" className="p-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 grid place-items-center shrink-0">
            <Scissors className="w-5 h-5 text-indigo-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">اشتراكات منسية</div>
              <Pill tone="indigo">٢ موجودة</Pill>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug font-arabic" dir="rtl">
              مصاري بتنسحب من حسابك بدون ما تستعمليها
            </p>

            <div className="mt-2 space-y-1.5">
              <div className="rounded-lg bg-slate-950/60 border border-slate-700/60 p-2 flex items-center gap-2.5">
                <div className="text-lg">🏋️</div>
                <div className="flex-1 min-w-0" dir="rtl">
                  <div className="text-[12px] text-slate-100 leading-tight font-arabic">اشتراك الجيم</div>
                  <div className="text-[10px] text-slate-500 font-arabic">ما استعملتيه ٤ شهور · ٦٠٠ ش/سنة</div>
                </div>
                <button className="text-[10px] px-2 py-1 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition font-arabic">
                  ألغي
                </button>
              </div>
              <div className="rounded-lg bg-slate-950/60 border border-slate-700/60 p-2 flex items-center gap-2.5">
                <div className="text-lg">🎬</div>
                <div className="flex-1 min-w-0" dir="rtl">
                  <div className="text-[12px] text-slate-100 leading-tight font-arabic">باقة Netflix</div>
                  <div className="text-[10px] text-slate-500 font-arabic">ما استعملتيها شهرين · ٢٤٠ ش/سنة</div>
                </div>
                <button className="text-[10px] px-2 py-1 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition font-arabic">
                  ألغي
                </button>
              </div>
            </div>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

/* =========================================================
   5. WINS — better Levantine titles
   ========================================================= */

function WinsView() {
  const streak = useMemo(
    () => [
      1, 2, 1, 1, 2, 1, 1,
      2, 1, 1, 2, 1, 1, 2,
      1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 3,
    ],
    []
  );

  // Real Levantine compliments — what Arabs actually call each other
  const badges = [
    {
      name: 'موزونة',
      sub: 'Has it together',
      icon: Crown,
      unlocked: true,
      glow: 'from-amber-400 to-yellow-300',
      shadow: 'shadow-[0_0_22px_rgba(245,158,11,0.55)]',
    },
    {
      name: 'بنت الحلال',
      sub: 'Made it to payday',
      icon: ShieldCheck,
      unlocked: true,
      glow: 'from-emerald-400 to-teal-300',
      shadow: 'shadow-[0_0_22px_rgba(16,185,129,0.55)]',
    },
    {
      name: 'ما بتنخدع',
      sub: 'Spots overpriced shops',
      icon: Eye,
      unlocked: false,
      glow: 'from-slate-700 to-slate-800',
      shadow: '',
    },
    {
      name: 'أم الخطّة',
      sub: 'Master planner',
      icon: Trophy,
      unlocked: false,
      glow: 'from-slate-700 to-slate-800',
      shadow: '',
    },
  ];

  const family = [
    { name: 'بابا', amt: 500, color: 'from-purple-400 to-fuchsia-400', initial: 'ب' },
    { name: 'أنا',  amt: 320, color: 'from-emerald-400 to-teal-300',   initial: 'ر', me: true },
    { name: 'ليلى', amt: 200, color: 'from-amber-400 to-orange-300',   initial: 'ل' },
  ];
  const total = family.reduce((s, f) => s + f.amt, 0);
  const goal = 1500;

  return (
    <div className="ds-screen">
      {/* Streak hero */}
      <GlowCard glow="amber" className="p-4 relative overflow-hidden animate-fade-in-up">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="flex items-start justify-between relative">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-amber-300/80 font-arabic" dir="rtl">سلسلة التوفير</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                ١٢
              </span>
              <span className="text-amber-300 font-semibold text-sm font-arabic" dir="rtl">يوم 🔥</span>
            </div>
            <div className="text-[10px] text-slate-400 font-arabic" dir="rtl">أحسن سلسلة عملتيها: ٢٣ يوم</div>
          </div>
          <Pill tone="amber" icon={Flame}>متّقدة</Pill>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {streak.map((s, i) => {
            const cls = s === 3
              ? 'bg-gradient-to-br from-amber-300 to-orange-400 ring-2 ring-amber-300/60 animate-pulse text-slate-900'
              : s === 2 ? 'bg-rose-500/30 border border-rose-500/40'
              : s === 1 ? 'bg-emerald-500/25 border border-emerald-500/30'
              : 'bg-slate-800/60 border border-slate-700';
            return (
              <div
                key={i}
                className={`aspect-square rounded-md text-[8px] grid place-items-center font-bold ${cls}`}
              >
                {s === 3 ? '★' : ''}
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-amber-500/15">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <div className="inline-flex items-center gap-1 font-arabic" dir="rtl">
              <CalendarDays className="w-3 h-3" /> تحدّي الشهر · وفّري ١٠٪ زيادة
            </div>
            <span className="text-emerald-300 font-semibold">٦٨٪</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_10px_rgba(16,185,129,0.6)]" style={{ width: '68%' }} />
          </div>
        </div>
      </GlowCard>

      {/* Family pool */}
      <GlowCard glow="purple" className="vault-card p-3.5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 grid place-items-center">
              <Users className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <div className="text-sm text-slate-100 font-semibold font-arabic" dir="rtl">صندوق العيلة · العيد</div>
              <div className="text-[10px] text-slate-500 font-arabic" dir="rtl">عم تجمعوا لعيد الأضحى</div>
            </div>
          </div>
          <Pill tone="purple">٣ أعضاء</Pill>
        </div>

        <div className="rounded-xl bg-slate-950/60 border border-slate-700/60 p-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-100">
              {total.toLocaleString('ar')}
              <span className="text-sm text-slate-500 font-arabic mr-1"> / {goal.toLocaleString('ar')} ش</span>
            </div>
            <div className="text-emerald-300 font-bold text-lg">٦٨٪</div>
          </div>
          <div className="h-2 mt-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-400 shadow-[0_0_10px_rgba(168,85,247,0.6)]" style={{ width: `${(total / goal) * 100}%` }} />
          </div>

          <div className="mt-3 space-y-2">
            {family.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold text-slate-900 bg-gradient-to-br ${f.color} ${f.me ? 'ring-2 ring-emerald-300/60' : ''}`}>
                  {f.initial}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-[12px] text-slate-200 font-arabic flex items-center gap-1.5" dir="rtl">
                      {f.name}
                      {f.me && <span className="text-[9px] text-emerald-300 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">أنا</span>}
                    </div>
                    <div className="text-[11px] text-slate-300 font-semibold">{f.amt} ش</div>
                  </div>
                  <div className="h-1 mt-1 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${f.color}`} style={{ width: `${(f.amt / goal) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-[11px] text-purple-200/90 italic font-arabic text-center" dir="rtl">
            "بابا متقدّم — يلا نلحقه قبل العيد 💪"
          </div>
        </div>
      </GlowCard>

      {/* Badges */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.18s' }}>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-xs text-slate-300 font-medium tracking-wide font-arabic" dir="rtl">
            ألقابك
          </div>
          <div className="text-[10px] text-purple-300">٢ / ٨</div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.name}
                className={`relative rounded-2xl p-2.5 border ${
                  b.unlocked
                    ? 'border-amber-500/30 bg-slate-900/70'
                    : 'border-slate-700/60 bg-slate-900/50'
                } ${b.shadow}`}
              >
                <div className={`w-11 h-11 rounded-xl grid place-items-center bg-gradient-to-br ${b.glow} mb-1.5 ${b.unlocked ? 'animate-float' : ''}`}>
                  <Icon className={`w-5 h-5 ${b.unlocked ? 'text-slate-900' : 'text-slate-500'}`} />
                </div>
                <div className={`text-[14px] font-semibold font-arabic leading-tight ${b.unlocked ? 'text-amber-200' : 'text-slate-300'}`} dir="rtl">
                  {b.name}
                </div>
                <div className={`text-[10px] mt-0.5 ${b.unlocked ? 'text-slate-400' : 'text-slate-600'}`}>{b.sub}</div>
                {!b.unlocked && (
                  <div className="absolute top-1.5 right-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                )}
                {b.unlocked && (
                  <div className="absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-arabic">
                    جديد
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Neighborhood rank */}
      <GlowCard glow="indigo" className="p-3 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 grid place-items-center text-slate-900 font-bold text-sm shadow-[0_0_15px_rgba(129,140,248,0.5)]">
            #٣
          </div>
          <div className="flex-1">
            <div className="text-[12px] text-slate-100 font-semibold font-arabic" dir="rtl">ترتيبك بالحارة</div>
            <div className="text-[11px] text-slate-400 font-arabic" dir="rtl">
              بتوفّري أكتر من <span className="text-emerald-300 font-semibold">٧٣٪</span> من جيرانك
            </div>
          </div>
          <Pill tone="indigo" icon={Eye}>مجهول</Pill>
        </div>
      </GlowCard>
    </div>
  );
}

/* =========================================================
   PHONE SHELL
   ========================================================= */

const TABS = [
  { id: 'home',     ar: 'الرئيسية', icon: HomeIcon },
  { id: 'coach',    ar: 'المدرّب',   icon: Mic },
  { id: 'forecast', ar: 'بكرا',      icon: TrendingUp },
  { id: 'vault',    ar: 'الصندوق',   icon: Shield },
  { id: 'wins',     ar: 'إنجازاتي',  icon: Trophy },
];

const TITLES = {
  home:     { en: 'Masrafji',  ar: 'مصرفجي',  sub: 'صاحبك بالفلوس' },
  coach:    { en: 'Coach',     ar: 'المدرّب', sub: 'صوت + دعم نفسي' },
  forecast: { en: 'Tomorrow',  ar: 'بكرا',    sub: 'شو رح يصير بفلوسك' },
  vault:    { en: 'Vault',     ar: 'الصندوق', sub: 'حماية + واجبات + ذهب' },
  wins:     { en: 'Wins',      ar: 'إنجازاتي', sub: 'سلسلة + عيلة + ألقاب' },
};

const THEME_KEY = 'masrafji-theme';

function StatusBar() {
  return (
    <div className="ds-statusbar flex items-center justify-between px-6 pt-3 pb-1 text-[11px] text-slate-300 theme-status">
      <span className="font-medium tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal className="w-3 h-3" />
        <Wifi   className="w-3 h-3" />
        <BatteryFull className="w-4 h-4" />
      </div>
    </div>
  );
}

function ThemeToggle({ theme, setTheme }) {
  const isLight = theme === 'light';
  const nextTheme = isLight ? 'dark' : 'light';

  return (
    <button
      type="button"
      className={`theme-switch ${isLight ? 'theme-switch-light' : 'theme-switch-dark'}`}
      role="switch"
      aria-checked={!isLight}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={() => setTheme(nextTheme)}
    >
      <span className={`theme-switch-track ${isLight ? 'is-light' : 'is-dark'}`} />
      <span className={`theme-switch-knob ${isLight ? 'is-light' : 'is-dark'}`}>
        <span className="theme-switch-emoji" aria-hidden="true">{isLight ? '🌞' : '🌙'}</span>
      </span>
    </button>
  );
}

function Header({ tab, theme, setTheme }) {
  const t = TITLES[tab];
  return (
    <div className="ds-header px-5 pt-2.5 pb-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="ds-brand-lockup" aria-label="Masrafji logo">
            <div className="ds-brand-icon-wrap" aria-hidden="true">
              <div className="ds-brand-icon-core">
                <TrendingUp className="w-3.5 h-3.5 ds-brand-icon-trend" strokeWidth={2.1} />
              </div>
            </div>
            <div className="ds-brand-copy">
              <span className="ds-brand-wordmark">Masrafji</span>
              <span className="ds-brand-ar font-arabic" dir="rtl">مصرفجي</span>
            </div>
          </div>
          <div className="ds-subtitle text-[10px] mt-0.5 font-arabic" dir="rtl">{t.sub}</div>
        </div>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </div>
  );
}

function AmbientBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden theme-ambient">
      <div className="absolute inset-0 theme-ambient-layer bg-[radial-gradient(circle_at_15%_10%,rgba(168,85,247,0.2),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(45,212,191,0.15),transparent_38%),radial-gradient(circle_at_50%_85%,rgba(251,146,60,0.12),transparent_42%)]" />
      <div className="absolute top-24 left-[12%] w-44 h-44 rounded-full bg-fuchsia-500/15 blur-3xl animate-blob-slow" />
      <div className="absolute bottom-20 right-[10%] w-52 h-52 rounded-full bg-emerald-400/15 blur-3xl animate-blob-slow-delayed" />
      <div className="absolute top-[45%] right-[25%] w-36 h-36 rounded-full bg-indigo-400/15 blur-3xl animate-blob-slow" />
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#94a3b8_1px,transparent_1px),linear-gradient(to_bottom,#94a3b8_1px,transparent_1px)] bg-[size:48px_48px] theme-ambient-grid" />
    </div>
  );
}

function SideShowcase() {
  return null;
}

function BottomNav({ tab, setTab }) {
  return (
    <div className="absolute bottom-3 left-3 right-3 z-20">
      <div className="ds-bottom-nav rounded-2xl backdrop-blur-xl border px-1.5 py-1.5 flex items-center justify-between">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`ds-nav-item relative flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition
                ${active ? 'ds-nav-item-active' : 'text-slate-500 hover:text-slate-300 hover:-translate-y-0.5'}`}
            >
              {active && (
                <span className="ds-nav-active-bg absolute inset-0 rounded-xl animate-tab-glow" />
              )}
              <Icon className={`w-4 h-4 relative ${active ? 'ds-nav-icon-active' : ''}`} />
              <span className="text-[9px] relative font-medium tracking-wide font-arabic" dir="rtl">{t.ar}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const [tab, setTab] = useState('home');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });
  const isLight = theme === 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className={`min-h-screen w-full bg-mesh flex items-center justify-center p-4 sm:p-8 relative theme-root ${isLight ? 'theme-root-light' : 'theme-root-dark'}`}>
      <AmbientBackdrop />
      <SideShowcase />

      <div className={`relative w-full max-w-[420px] h-[860px] rounded-[3rem] border overflow-hidden before:absolute before:inset-0 before:rounded-[3rem] before:border before:pointer-events-none after:absolute after:-inset-[1px] after:rounded-[3rem] after:bg-[linear-gradient(140deg,rgba(168,85,247,0.35),rgba(45,212,191,0.18),rgba(251,146,60,0.2))] after:opacity-25 after:pointer-events-none animate-phone-float theme-phone ${isLight ? 'theme-phone-light' : 'theme-phone-dark'}`}>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 rounded-full z-30 border theme-notch" />
        <div className={`absolute inset-1.5 rounded-[2.6rem] bg-mesh overflow-hidden flex flex-col theme-phone-inner ${isLight ? 'theme-phone-inner-light' : 'theme-phone-inner-dark'}`}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,transparent_20%,rgba(255,255,255,0.05)_45%,transparent_65%)] animate-scan-sheen" />
          <div className="pointer-events-none absolute -top-24 -left-24 w-52 h-52 rounded-full bg-fuchsia-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-52 h-52 rounded-full bg-emerald-500/15 blur-3xl" />
          <StatusBar />
          <Header tab={tab} theme={theme} setTheme={setTheme} />

          <div key={tab} className="relative flex-1 overflow-hidden animate-fade-in-up">
            {tab === 'home'     && <HomeView />}
            {tab === 'coach'    && <CoachView />}
            {tab === 'forecast' && <ForecastView isLight={isLight} />}
            {tab === 'vault'    && <VaultView />}
            {tab === 'wins'     && <WinsView />}
          </div>

          <BottomNav tab={tab} setTab={setTab} />
        </div>
      </div>

    </div>
  );
}
