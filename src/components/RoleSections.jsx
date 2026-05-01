import { LineChart, Line, ResponsiveContainer } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
  Zap,
  Star,
  Flame,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HeartHandshake,
  Gift,
  GraduationCap,
  Briefcase,
  Monitor,
  Wifi,
  Home,
  Shield,
  Sparkles,
  ScanLine,
  PiggyBank,
  Coins,
  Plus,
  Gamepad2,
  Bike,
  Cpu,
  Music,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Mic,
} from 'lucide-react';
import { Card, CardHeader, Chip, Progress } from './UI.jsx';
import { CategoryDonut, ForecastChart } from './Charts.jsx';
import { DASHBOARD_DATA, ROLE_EXTRAS } from '../data.js';
import { fmtMoney, fmtPct, pick } from '../format.js';
import { useLang, useT } from '../i18n.jsx';

const WATCHLIST_ICONS = { gold: Coins, 'tech-etf': Cpu, reit: Landmark };
const SIDE_HUSTLE_ICONS = { cpu: Cpu, smartphone: Smartphone, music: Music, monitor: Monitor };
const KID_GOAL_ICONS = { gamepad: Gamepad2, bike: Bike, circle: Star };

const UNI_SOURCE_ICONS = {
  srcAllowance: Gift,
  srcTutoring: GraduationCap,
  srcCampus: Briefcase,
  srcFreelance: Monitor,
};

/* -------------------------------------------------------------------------- */
/* Family Parent                                                              */
/* -------------------------------------------------------------------------- */

function FamilySections({ currency }) {
  const t = useT();
  const { lang } = useLang();
  const { children, monthCompare } = ROLE_EXTRAS['family-parent'];
  return (
    <>
      <Card className="p-4">
        <CardHeader
          title={t('sections.family.children')}
          subtitle={t('sections.family.childrenSub')}
        />
        <div className="grid grid-cols-1 gap-3 mt-3">
          {children.map((c) => {
            const pct = (c.spent / c.allowance) * 100;
            const tone = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'success';
            const displayName = pick(c, 'name', lang);
            return (
              <div
                key={c.name}
                className="p-4 rounded-2xl border"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: c.color }}
                    >
                      {displayName[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-1">{displayName}</div>
                      <div className="text-[11px] text-3">
                        {c.age} {t('sections.family.years')}
                      </div>
                    </div>
                  </div>
                  <Chip tone={tone}>{Math.round(pct)}%</Chip>
                </div>
                <div className="text-[11px] text-3 mb-1.5 flex items-center justify-between ltr-numbers">
                  <span>
                    {fmtMoney(c.spent, currency)} {t('sections.family.spent')}
                  </span>
                  <span>
                    {fmtMoney(c.allowance, currency)} {t('sections.family.allowance')}
                  </span>
                </div>
                <Progress value={c.spent} max={c.allowance} tone={tone} />
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <CardHeader
          title={t('sections.family.compare')}
          subtitle={t('sections.family.compareSub')}
        />
        <div className="space-y-3 mt-3">
          {monthCompare.map((row) => {
            const delta = ((row.now - row.prev) / row.prev) * 100;
            const positive = delta > 0;
            const label = pick(row, 'label', lang);
            return (
              <div key={row.label} className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-1 truncate">{label}</div>
                <div className="flex items-center gap-2 ltr-numbers">
                  <span className="text-[11px] tabular-nums text-2">
                    {fmtMoney(row.now, currency)}
                  </span>
                  <Chip tone={positive ? 'danger' : 'success'}>
                    {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {fmtPct(delta, { sign: true })}
                  </Chip>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Business                                                                   */
/* -------------------------------------------------------------------------- */

function BusinessSections({ currency }) {
  const t = useT();
  const { lang } = useLang();
  const { invoices, kpiRow } = ROLE_EXTRAS.business;
  const stats = kpiRow.map((k) => ({
    ...k,
    value: k.isText ? k.value : fmtMoney(k.value, currency),
  }));
  return (
    <>
      <Card className="p-4">
        <CardHeader
          title={t('sections.business.kpis')}
          subtitle={t('sections.business.kpisSub')}
        />
        <div className="grid grid-cols-2 gap-2 mt-3">
          {stats.map((k) => (
            <div
              key={k.labelKey}
              className="p-3 rounded-2xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                style={{ background: `${k.color}1f`, color: k.color }}
              >
                {k.icon === 'trending-up' && <TrendingUp size={16} />}
                {k.icon === 'pie-chart' && <PieChart size={16} />}
                {k.icon === 'wallet' && <Wallet size={16} />}
                {k.icon === 'zap' && <Zap size={16} />}
              </div>
              <div className="text-[11px] text-3 font-semibold uppercase tracking-wide">
                {t(`sections.business.${k.labelKey}`)}
              </div>
              <div className="font-display font-bold text-base tabular-nums text-1 mt-1 ltr-numbers">
                {k.value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <CardHeader
          title={t('sections.business.invoices')}
          subtitle={t('sections.business.invoicesSub')}
        />
        <div className="mt-3 space-y-1">
          {invoices.map((inv) => {
            const tone =
              inv.status === 'paid'
                ? 'success'
                : inv.status === 'pending'
                ? 'warning'
                : 'danger';
            const Icon =
              inv.status === 'paid'
                ? CheckCircle2
                : inv.status === 'pending'
                ? Clock
                : AlertTriangle;
            return (
              <div
                key={inv.id}
                className="flex items-center gap-3 py-2 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `var(--${
                      inv.status === 'paid'
                        ? 'success'
                        : inv.status === 'pending'
                        ? 'warning'
                        : 'danger'
                    }-soft)`,
                    color:
                      inv.status === 'paid'
                        ? 'var(--success)'
                        : inv.status === 'pending'
                        ? 'var(--warning)'
                        : 'var(--danger)',
                  }}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-1 truncate">
                    {pick(inv, 'client', lang)}
                  </div>
                  <div className="text-[11px] text-3">{inv.id}</div>
                </div>
                <div className="text-end ltr-numbers">
                  <div className="text-sm font-semibold text-1 tabular-nums">
                    {fmtMoney(inv.amount, currency)}
                  </div>
                  <Chip tone={tone} className="mt-0.5">
                    {t(`common.${inv.status}`)}
                  </Chip>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* School student                                                             */
/* -------------------------------------------------------------------------- */

function SchoolSections({ currency }) {
  const t = useT();
  const { lang } = useLang();
  const { badges, parentMode, piggyBank, kidGoals } = ROLE_EXTRAS['school-student'];
  const parentName = pick(parentMode, 'parentName', lang);
  return (
    <>
      <PiggyBankCard
        target={piggyBank.target}
        saved={piggyBank.saved}
        goalLabel={t(`sections.school.kidGoals.${piggyBank.goalKey}`)}
        streakDays={piggyBank.streakDays}
        lastDeposit={piggyBank.lastDeposit}
        gradient={piggyBank.gradient}
        currency={currency}
      />

      <Card className="p-4">
        <CardHeader
          title={t('sections.school.kidGoals.title')}
          subtitle={t('sections.school.kidGoals.subtitle')}
        />
        <div className="grid grid-cols-1 gap-3 mt-3">
          {kidGoals.map((g) => {
            const Icon = KID_GOAL_ICONS[g.icon] || Star;
            const pct = Math.min(100, (g.saved / g.target) * 100);
            const done = pct >= 100;
            return (
              <div
                key={g.id}
                className="p-3 rounded-2xl border flex items-center gap-3"
                style={{
                  borderColor: done ? `${g.color}55` : 'var(--border)',
                  background: done ? `${g.color}14` : 'var(--surface-2)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${g.color}, ${g.color}cc)`,
                  }}
                >
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-semibold text-1 text-sm truncate">
                      {t(`sections.school.kidGoals.${g.titleKey}`)}
                    </div>
                    {done ? (
                      <Chip tone="success">{t('common.achieved')}</Chip>
                    ) : (
                      <span className="text-[11px] font-bold tabular-nums text-2 ltr-numbers">
                        {Math.round(pct)}%
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-3 mb-1.5 ltr-numbers">
                    {fmtMoney(g.saved, currency)} / {fmtMoney(g.target, currency)}
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--surface-3)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${g.color}, ${g.color}cc)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <CardHeader
          title={t('sections.school.achievements')}
          subtitle={t('sections.school.achievementsSub')}
        />
        <div className="grid grid-cols-2 gap-3 mt-3">
          {badges.map((b) => {
            const Icon =
              b.icon === 'flame'
                ? Flame
                : b.icon === 'star'
                ? Star
                : b.icon === 'shield'
                ? ShieldCheck
                : b.icon === 'gamepad'
                ? Gamepad2
                : Smartphone;
            return (
              <div
                key={b.key}
                className="p-3 rounded-2xl border flex flex-col items-center text-center gap-2"
                style={{
                  borderColor: 'var(--border)',
                  background: b.earned ? `${b.color}14` : 'var(--surface-2)',
                  opacity: b.earned ? 1 : 0.6,
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: b.earned ? b.color : 'var(--surface-3)',
                    color: b.earned ? '#fff' : 'var(--text-3)',
                  }}
                >
                  <Icon size={20} strokeWidth={2.4} />
                </div>
                <div className="text-xs font-semibold text-1 leading-tight">
                  {t(`sections.school.badges.${b.key}`)}
                </div>
                <div className="text-[10px] text-3 uppercase tracking-wide">
                  {b.earned ? t('common.earned') : t('common.locked')}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {parentMode.enabled && (
        <Card className="p-4 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ec4899, #6366f1)' }}
          >
            <HeartHandshake size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-1 text-sm">
              {t('sections.school.parent', { name: parentName })}
            </div>
            <div className="text-[11px] text-3 mt-0.5 leading-relaxed">
              {t('sections.school.parentSub', { name: parentName })}
            </div>
          </div>
          <Chip tone="success">{t('common.on')}</Chip>
        </Card>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* PiggyBankCard — Kids piggy bank widget (Hasala حصالة)                      */
/* -------------------------------------------------------------------------- */

export function PiggyBankCard({
  target = 500,
  saved = 0,
  goalLabel = 'New PlayStation 5',
  streakDays = 0,
  lastDeposit = 0,
  gradient = ['#fb7185', '#f97316', '#facc15'],
  currency = 'USD',
}) {
  const t = useT();
  const pct = Math.max(0, Math.min(100, (saved / target) * 100));
  const remaining = Math.max(0, target - saved);
  const full = pct >= 100;
  const [grad1, grad2, grad3] = gradient;

  return (
    <div className="piggy-card">
      <div className="piggy-card-head">
        <div className="min-w-0">
          <div className="piggy-card-eyebrow">{t('sections.school.piggy.title')}</div>
          <div className="piggy-card-title">{t('sections.school.piggy.subtitle')}</div>
        </div>
        {streakDays > 0 && (
          <span className="piggy-streak">
            <Flame size={12} strokeWidth={2.6} />
            {t('sections.school.piggy.streakDays', { n: streakDays })}
          </span>
        )}
      </div>

      <div className="piggy-stage">
        <div
          className="piggy-fill"
          style={{
            height: `${pct}%`,
            background: `linear-gradient(180deg, ${grad3} 0%, ${grad2} 60%, ${grad1} 100%)`,
          }}
        >
          <div className="piggy-fill-shine" />
        </div>
        <div className="piggy-coins" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="piggy-coin"
              style={{
                left: `${15 + i * 16}%`,
                animationDelay: `${i * 0.4}s`,
              }}
            >
              <Coins size={14} strokeWidth={2.4} />
            </span>
          ))}
        </div>
        <div className="piggy-icon-wrap">
          <PiggyBank size={88} strokeWidth={1.8} />
        </div>
        <div className="piggy-pct">
          <span className="piggy-pct-num tabular-nums ltr-numbers">{Math.round(pct)}%</span>
          <span className="piggy-pct-lbl">{t('sections.school.piggy.gradLabel')}</span>
        </div>
      </div>

      <div className="piggy-card-foot">
        <div className="min-w-0">
          <div className="piggy-foot-label">{t('sections.school.piggy.saving')}</div>
          <div className="piggy-foot-goal truncate">{goalLabel}</div>
        </div>
        <div className="text-end ltr-numbers min-w-0">
          <div className="piggy-foot-amount tabular-nums">
            {fmtMoney(saved, currency)}
          </div>
          <div className="piggy-foot-meta">
            {full
              ? t('sections.school.piggy.fullDone')
              : t('sections.school.piggy.fullIn', { amount: fmtMoney(remaining, currency).replace(/^[^\d-]+/, '') })}
          </div>
        </div>
      </div>

      {lastDeposit > 0 && (
        <div className="piggy-last-deposit">
          <Plus size={11} strokeWidth={2.6} />
          {t('sections.school.piggy.lastDeposit', {
            amount: fmtMoney(lastDeposit, currency).replace(/^[^\d-]+/, ''),
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* University student                                                         */
/* -------------------------------------------------------------------------- */

function UniSections({ currency, onOpenSmartReceipt }) {
  const t = useT();
  const { lang } = useLang();
  const { sideIncome, sideHustle } = ROLE_EXTRAS['university-student'];
  const data = DASHBOARD_DATA['university-student'];
  const total = sideIncome.reduce((s, r) => s + r.amount, 0);

  const donutData = sideIncome.map((row) => ({
    name: t(`sections.uni.${row.sourceKey}`),
    value: row.amount,
    color: row.color,
  }));

  const laptopGoal = data.goals.find((g) => g.id === 'g1') || data.goals[0];
  const bufferGoal = data.goals.find((g) => g.id === 'g2') || data.goals[1];
  const dormBill = data.bills.find((b) => b.id === 'b1');
  const internetBill = data.bills.find((b) => b.id === 'b2');
  const groceriesBudget = data.budgets.find((b) => b.category === 'Groceries');
  const groceriesLeft = groceriesBudget ? groceriesBudget.limit - groceriesBudget.spent : 0;

  return (
    <>
      {/* ── Income Sources (pie chart + legend) ──────────────────────────── */}
      <Card className="p-4">
        <CardHeader
          title={t('sections.uni.sources')}
          subtitle={t('sections.uni.sourcesSub')}
          action={<Chip tone="brand">{fmtMoney(total, currency)}</Chip>}
        />
        <div className="mt-3 space-y-4">
          <div className="min-w-0">
            <CategoryDonut
              data={donutData}
              currency={currency}
              total={total}
              label={t('sections.uni.totalLabel')}
            />
          </div>
          <ul className="space-y-2 min-w-0">
            {sideIncome.map((row) => {
              const Icon = UNI_SOURCE_ICONS[row.sourceKey] || Wallet;
              const pct = (row.amount / total) * 100;
              return (
                <li
                  key={row.source}
                  className="flex items-center gap-3 p-2.5 rounded-xl border"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: row.color }}
                  >
                    <Icon size={15} strokeWidth={2.2} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-1 truncate">
                      {t(`sections.uni.${row.sourceKey}`)}
                    </div>
                    <div className="text-[10.5px] text-3">{fmtPct(pct, 0)}</div>
                  </div>
                  <div className="text-[12.5px] font-bold tabular-nums text-1 ltr-numbers">
                    {fmtMoney(row.amount, currency)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Card>

      {/* ── Student snapshot — laptop, buffer, dorm fee, internet ───────── */}
      <Card className="p-4">
        <CardHeader
          title={t('sections.uni.snapshot')}
          subtitle={t('sections.uni.snapshotSub')}
        />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <UniSnapshotGoal
            icon={Monitor}
            tone="#7c3aed"
            label={t('sections.uni.laptopFund')}
            value={fmtMoney(laptopGoal.saved, currency)}
            sub={`${fmtMoney(laptopGoal.target, currency)} · ${pick(laptopGoal, 'deadline', lang)}`}
            pct={(laptopGoal.saved / laptopGoal.target) * 100}
          />
          <UniSnapshotGoal
            icon={Shield}
            tone="#10b981"
            label={t('sections.uni.bufferFund')}
            value={fmtMoney(bufferGoal.saved, currency)}
            sub={`${fmtMoney(bufferGoal.target, currency)} · ${pick(bufferGoal, 'deadline', lang)}`}
            pct={(bufferGoal.saved / bufferGoal.target) * 100}
          />
          <UniSnapshotBill
            icon={Home}
            tone="#6366f1"
            label={t('sections.uni.dormFee')}
            value={fmtMoney(dormBill?.amount || 0, currency)}
            sub={t('sections.uni.dueIn', { n: 4 })}
          />
          <UniSnapshotBill
            icon={Wifi}
            tone="#0ea5e9"
            label={t('sections.uni.internet')}
            value={fmtMoney(internetBill?.amount || 0, currency)}
            sub={t('sections.uni.dueIn', { n: 6 })}
          />
        </div>
      </Card>

      {/* ── Side-Hustle tracker ─────────────────────────────────────────── */}
      <SideHustleTracker items={sideHustle} currency={currency} lang={lang} />

      {/* ── Smart Receipt CTA ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onOpenSmartReceipt}
        className="uni-receipt-cta w-full text-start"
        aria-label={t('sections.uni.receiptCtaTitle')}
      >
        <span className="uni-receipt-cta-icon">
          <ScanLine size={20} strokeWidth={2.2} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold">
            {t('sections.uni.receiptCtaTitle')}
          </span>
          <span className="block text-[11.5px] opacity-80 mt-0.5 leading-tight">
            {t('sections.uni.receiptCtaBody', { n: Math.max(0, Math.round(groceriesLeft)) })}
          </span>
        </span>
        <Sparkles size={16} strokeWidth={2.2} className="opacity-80 flex-shrink-0" />
      </button>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* SideHustleTracker — Stuff a uni student might flip                          */
/* -------------------------------------------------------------------------- */

export function SideHustleTracker({ items = [], currency = 'USD', lang = 'en' }) {
  const t = useT();
  const totalProfit = items.reduce((s, i) => s + (i.market - i.bought), 0);
  const positiveTotal = totalProfit >= 0;

  return (
    <Card className="p-4">
      <CardHeader
        title={t('sections.uni.sideHustle')}
        subtitle={t('sections.uni.sideHustleSub')}
        action={
          <Chip tone={positiveTotal ? 'success' : 'danger'}>
            {positiveTotal ? '+' : ''}
            {fmtMoney(totalProfit, currency)}
          </Chip>
        }
      />

      <div className="mt-3 space-y-2.5">
        {items.map((item) => {
          const Icon = SIDE_HUSTLE_ICONS[item.icon] || Cpu;
          const profit = item.market - item.bought;
          const positive = profit >= 0;
          return (
            <div
              key={item.id}
              className="p-3 rounded-2xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              {/* Row 1: icon + item name (full width) */}
              <div className="flex items-center gap-2.5 mb-3 min-w-0">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)` }}
                >
                  <Icon size={17} strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-1 truncate">
                    {pick(item, 'name', lang)}
                  </div>
                  <div className="text-[10.5px] text-3 uppercase tracking-wide font-semibold mt-0.5">
                    {positive
                      ? `+${fmtPct((profit / item.bought) * 100, { sign: false })}`
                      : fmtPct((profit / item.bought) * 100, { sign: false })}
                  </div>
                </div>
              </div>

              {/* Row 2: 3 mini stat tiles */}
              <div className="grid grid-cols-3 gap-2">
                <SideHustleStat
                  label={t('sections.uni.sideHustleBought')}
                  value={fmtMoney(item.bought, currency)}
                />
                <SideHustleStat
                  label={t('sections.uni.sideHustleMarket')}
                  value={fmtMoney(item.market, currency)}
                  emphasis
                />
                <div className="rounded-xl px-2.5 py-2 text-center" style={{
                  background: positive
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(244, 63, 94, 0.12)',
                }}>
                  <div className={`text-[10px] font-bold uppercase tracking-wide ${
                    positive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                  }`}>
                    {t('sections.uni.sideHustleProfit')}
                  </div>
                  <div className={`text-[12.5px] font-bold tabular-nums ltr-numbers mt-0.5 inline-flex items-center gap-0.5 justify-center ${
                    positive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                  }`}>
                    {positive ? (
                      <ArrowUpRight size={11} strokeWidth={2.6} />
                    ) : (
                      <ArrowDownRight size={11} strokeWidth={2.6} />
                    )}
                    {positive ? '+' : ''}
                    {fmtMoney(profit, currency)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-3 pt-3 flex items-center justify-between text-xs"
        style={{ borderTop: '1px dashed var(--border)' }}
      >
        <span className="text-3 font-semibold uppercase tracking-wide">
          {t('sections.uni.sideHustleTotal')}
        </span>
        <span
          className={`font-bold tabular-nums ltr-numbers ${
            positiveTotal ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {positiveTotal ? '+' : ''}
          {fmtMoney(totalProfit, currency)}
        </span>
      </div>
    </Card>
  );
}

function SideHustleStat({ label, value, emphasis = false }) {
  return (
    <div
      className="rounded-xl px-2.5 py-2 text-center"
      style={{ background: 'var(--surface)' }}
    >
      <div className="text-[10px] font-bold uppercase tracking-wide text-3">
        {label}
      </div>
      <div
        className={`text-[12.5px] tabular-nums ltr-numbers mt-0.5 ${
          emphasis ? 'font-bold text-1' : 'font-semibold text-2'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function UniSnapshotGoal({ icon: Icon, tone, label, value, sub, pct }) {
  return (
    <div
      className="p-3 rounded-2xl border"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ background: tone }}
        >
          <Icon size={14} strokeWidth={2.2} />
        </span>
        <span className="text-[11px] font-semibold text-3 uppercase tracking-wide">{label}</span>
      </div>
      <div className="font-display text-sm font-bold tabular-nums text-1 ltr-numbers">{value}</div>
      <div className="text-[10.5px] text-3 mt-0.5 truncate">{sub}</div>
      <div className="mt-2">
        <Progress value={Math.max(0, Math.min(100, pct))} tone="brand" />
      </div>
    </div>
  );
}

function UniSnapshotBill({ icon: Icon, tone, label, value, sub }) {
  return (
    <div
      className="p-3 rounded-2xl border"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ background: tone }}
        >
          <Icon size={14} strokeWidth={2.2} />
        </span>
        <span className="text-[11px] font-semibold text-3 uppercase tracking-wide">{label}</span>
      </div>
      <div className="font-display text-sm font-bold tabular-nums text-1 ltr-numbers">{value}</div>
      <div className="text-[10.5px] text-3 mt-0.5">{sub}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Employee                                                                   */
/* -------------------------------------------------------------------------- */

function EmployeeSections({ currency }) {
  const t = useT();
  const { rule503020, healthScore } = ROLE_EXTRAS.employee;
  const total = rule503020.needs + rule503020.wants + rule503020.savings;
  const pct = (k) => Math.round((rule503020[k] / total) * 100);
  return (
    <>
      <Card className="p-4">
        <CardHeader
          title={t('sections.employee.rule')}
          subtitle={t('sections.employee.ruleSub')}
        />
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { key: 'needs', labelKey: 'sections.employee.needs', color: '#6366f1', target: 50 },
            { key: 'wants', labelKey: 'sections.employee.wants', color: '#ec4899', target: 30 },
            { key: 'savings', labelKey: 'sections.employee.savings', color: '#10b981', target: 20 },
          ].map((b) => (
            <div
              key={b.key}
              className="p-3 rounded-2xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] text-3 uppercase font-semibold">
                  {t(b.labelKey)}
                </div>
                <Chip tone={pct(b.key) > b.target + 5 ? 'warning' : 'success'}>
                  {pct(b.key)}%
                </Chip>
              </div>
              <div className="font-display text-sm font-bold tabular-nums text-1 ltr-numbers">
                {fmtMoney(rule503020[b.key], currency)}
              </div>
              <div className="text-[10px] text-3 mt-0.5">
                {t('common.target')} {b.target}%
              </div>
              <div className="mt-2">
                <Progress
                  value={pct(b.key)}
                  max={100}
                  tone={pct(b.key) > b.target + 5 ? 'warning' : 'success'}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <CardHeader
          title={t('sections.employee.score')}
          subtitle={t('sections.employee.scoreSub')}
        />
        <div className="flex items-center gap-4 mt-3">
          <ScoreRing value={healthScore} />
          <div className="flex-1 space-y-2">
            <ScoreRow
              label={t('sections.employee.savingsRate')}
              value={t('sections.employee.scoreStrong')}
              tone="success"
            />
            <ScoreRow
              label={t('sections.employee.debtLoad')}
              value={t('sections.employee.scoreLow')}
              tone="success"
            />
            <ScoreRow
              label={t('sections.employee.subBloat')}
              value={t('sections.employee.scoreWatch')}
              tone="warning"
            />
          </div>
        </div>
      </Card>
    </>
  );
}

function ScoreRing({ value }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative w-[100px] h-[100px] flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 50 50)"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display font-bold text-xl tabular-nums text-1">{value}</div>
        <div className="text-[10px] uppercase tracking-wide text-3">/ 100</div>
      </div>
    </div>
  );
}

function ScoreRow({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-2">{label}</span>
      <Chip tone={tone}>{value}</Chip>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* AssetWatchlist — Investor watchlist with sparklines                        */
/* -------------------------------------------------------------------------- */

export function AssetWatchlist({ assets = [], currency = 'USD' }) {
  const t = useT();
  return (
    <Card className="p-4">
      <CardHeader
        title={t('sections.employee.watchlist')}
        subtitle={t('sections.employee.watchlistSub')}
        action={
          <Chip tone="brand">
            <TrendingUp size={11} strokeWidth={2.5} />
            {assets.length}
          </Chip>
        }
      />
      <div className="mt-3 space-y-2.5">
        {assets.map((a) => {
          const Icon = WATCHLIST_ICONS[a.id] || Wallet;
          const positive = a.change >= 0;
          const sparkColor = positive ? '#10b981' : '#ef4444';
          const sparkData = a.spark.map((v, i) => ({ i, v }));
          return (
            <div
              key={a.id}
              className="p-3 rounded-2xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              {/* Row 1: identity + price */}
              <div className="flex items-center gap-3 mb-2.5">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${a.color}, ${a.color}cc)` }}
                >
                  <Icon size={18} strokeWidth={2.2} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-1 truncate">
                    {t(`sections.employee.${a.nameKey}`)}
                  </div>
                  <div className="text-[10.5px] text-3 tabular-nums uppercase tracking-wider font-semibold mt-0.5">
                    {a.symbol}
                  </div>
                </div>

                <div className="text-end ltr-numbers flex-shrink-0">
                  <div className="text-base font-bold tabular-nums text-1 leading-tight">
                    {fmtMoney(a.price, currency)}
                  </div>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10.5px] font-bold px-1.5 py-0.5 rounded-full mt-1 tabular-nums ${
                      positive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {positive ? (
                      <ArrowUpRight size={10} strokeWidth={2.6} />
                    ) : (
                      <ArrowDownRight size={10} strokeWidth={2.6} />
                    )}
                    {fmtPct(a.change, { sign: true })}
                  </span>
                </div>
              </div>

              {/* Row 2: full-width sparkline */}
              <div className="h-10 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <defs>
                      <linearGradient id={`spark-${a.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={sparkColor} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={sparkColor} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={sparkColor}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Freelancer                                                                 */
/* -------------------------------------------------------------------------- */

function FreelancerSections({ currency }) {
  const t = useT();
  const { lang } = useLang();
  const { clients, forecast } = ROLE_EXTRAS.freelancer;
  return (
    <>
      <Card className="p-4">
        <CardHeader
          title={t('sections.freelancer.forecast')}
          subtitle={t('sections.freelancer.forecastSub')}
        />
        <div className="mt-3">
          <ForecastChart data={forecast} currency={currency} />
        </div>
        <div className="text-[11px] text-3 mt-2 leading-relaxed">
          {t('sections.freelancer.forecastNote')}
        </div>
      </Card>

      <Card className="p-4">
        <CardHeader
          title={t('sections.freelancer.byClient')}
          subtitle={t('sections.freelancer.byClientSub')}
        />
        <div className="space-y-3 mt-3">
          {clients.map((c) => (
            <div key={c.name}>
              <div className="flex items-center justify-between text-sm mb-1.5 gap-2">
                <span className="text-1 font-medium truncate">
                  {pick(c, 'name', lang)}
                </span>
                <span className="text-2 tabular-nums ltr-numbers">
                  {fmtMoney(c.revenue, currency)}
                </span>
              </div>
              <Progress value={c.share} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* General                                                                    */
/* -------------------------------------------------------------------------- */

function GeneralSections() {
  const t = useT();
  const { lang } = useLang();
  const { insights } = ROLE_EXTRAS.general;
  return (
    <Card className="p-4">
      <CardHeader
        title={t('sections.general.insights')}
        subtitle={t('sections.general.insightsSub')}
      />
      <div className="grid grid-cols-1 gap-2 mt-3">
        {insights.map((ins, idx) => {
          const Icon =
            ins.icon === 'trending-down' ? TrendingDown : ins.icon === 'zap' ? Zap : Star;
          return (
            <div
              key={idx}
              className="p-3 rounded-2xl border flex items-start gap-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
              >
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-1 text-sm">
                  {pick(ins, 'title', lang)}
                </div>
                <div className="text-[11px] text-3 mt-0.5 leading-relaxed">
                  {pick(ins, 'body', lang)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* FXRateCard — USD exchange rates with a hold/exchange advisory               */
/* -------------------------------------------------------------------------- */

const FX_PAIRS = [
  { code: 'ILS', flag: '🇮🇱', symbol: '₪', rate: 3.74, delta: 0.6 },
  { code: 'JOD', flag: '🇯🇴', symbol: 'JD', rate: 0.708, delta: -0.1 },
  { code: 'EUR', flag: '🇪🇺', symbol: '€', rate: 0.928, delta: 0.4 },
];

export function FXRateCard() {
  const t = useT();
  return (
    <Card className="p-4">
      <CardHeader
        title={t('sections.employee.fxTitle')}
        subtitle={t('sections.employee.fxSub')}
        action={
          <Chip tone="brand">
            <span className="text-[11px] font-bold tabular-nums">USD</span>
          </Chip>
        }
      />
      <div className="mt-3 space-y-2">
        {FX_PAIRS.map((p) => {
          const positive = p.delta >= 0;
          return (
            <div
              key={p.code}
              className="flex items-center gap-3 p-3 rounded-2xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              <span className="text-2xl flex-shrink-0" aria-hidden="true">{p.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-1">
                  {`USD / ${p.code}`}
                </div>
                <div className="text-[10.5px] text-3 uppercase tracking-wider font-semibold mt-0.5">
                  {`1 USD = ${p.symbol}${p.rate}`}
                </div>
              </div>
              <div className="text-end ltr-numbers flex-shrink-0">
                <div className="text-base font-bold tabular-nums text-1 leading-tight">
                  {`${p.symbol}${p.rate}`}
                </div>
                <span
                  className={`inline-flex items-center gap-0.5 text-[10.5px] font-bold px-1.5 py-0.5 rounded-full mt-1 tabular-nums ${
                    positive
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {positive ? (
                    <ArrowUpRight size={10} strokeWidth={2.6} />
                  ) : (
                    <ArrowDownRight size={10} strokeWidth={2.6} />
                  )}
                  {fmtPct(p.delta, { sign: true })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-3 flex items-start gap-2.5 p-3 rounded-2xl"
        style={{
          background: 'var(--warning-soft)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
        }}
      >
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--warning)', color: '#fff' }}
        >
          <AlertTriangle size={14} strokeWidth={2.4} />
        </span>
        <div className="min-w-0">
          <div className="text-[12.5px] font-bold text-1 leading-tight">
            {t('sections.employee.fxAdviceTitle')}
          </div>
          <div className="text-[11px] text-2 mt-0.5 leading-relaxed">
            {t('sections.employee.fxAdviceBody')}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* AILoggerCard — One-stop AI capture surface tuned per persona               */
/* -------------------------------------------------------------------------- */

const AI_LOGGER_CONFIG = {
  'school-student': {
    bodyKey: 'kid',
    gradient: 'linear-gradient(135deg, #fb7185 0%, #f97316 50%, #facc15 100%)',
    shadow: '0 14px 32px -14px rgba(251, 113, 133, 0.55)',
    chips: [
      { id: 'voice', icon: Mic, color: '#fff', textKey: 'voice' },
      { id: 'scan', icon: ScanLine, color: '#fff', textKey: 'snap' },
    ],
  },
  'university-student': {
    bodyKey: 'uni',
    gradient: 'linear-gradient(135deg, #10b981 0%, #0d9488 60%, #0ea5e9 100%)',
    shadow: '0 14px 32px -14px rgba(16, 185, 129, 0.55)',
    chips: [
      { id: 'scan', icon: ScanLine, textKey: 'receipt' },
      { id: 'voice', icon: Mic, textKey: 'voice' },
    ],
  },
  'family-parent': {
    bodyKey: 'family',
    gradient: 'linear-gradient(135deg, #3961fb 0%, #6366f1 50%, #7c3aed 100%)',
    shadow: '0 14px 32px -14px rgba(99, 102, 241, 0.55)',
    chips: [
      { id: 'scan', icon: ScanLine, textKey: 'receipt' },
      { id: 'voice', icon: Mic, textKey: 'voice' },
    ],
  },
  employee: {
    bodyKey: 'employee',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
    shadow: '0 14px 32px -14px rgba(124, 58, 237, 0.55)',
    chips: [
      { id: 'voice', icon: Mic, textKey: 'voice' },
      { id: 'scan', icon: ScanLine, textKey: 'receipt' },
    ],
  },
  business: {
    bodyKey: 'business',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2447ec 60%, #1d36c9 100%)',
    shadow: '0 14px 32px -14px rgba(36, 71, 236, 0.55)',
    chips: [
      { id: 'scan', icon: ScanLine, textKey: 'invoice' },
      { id: 'voice', icon: Mic, textKey: 'voice' },
    ],
  },
  freelancer: {
    bodyKey: 'freelancer',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #dc2626 100%)',
    shadow: '0 14px 32px -14px rgba(245, 158, 11, 0.55)',
    chips: [
      { id: 'scan', icon: ScanLine, textKey: 'receipt' },
      { id: 'voice', icon: Mic, textKey: 'voice' },
    ],
  },
  general: {
    bodyKey: 'general',
    gradient: 'linear-gradient(135deg, #5a86ff 0%, #3961fb 60%, #6d28d9 100%)',
    shadow: '0 14px 32px -14px rgba(57, 97, 251, 0.55)',
    chips: [
      { id: 'voice', icon: Mic, textKey: 'voice' },
      { id: 'scan', icon: ScanLine, textKey: 'receipt' },
    ],
  },
};

export function AILoggerCard({ roleId = 'general', onOpenVoice, onOpenScan, onOpenPaste }) {
  const t = useT();
  const cfg = AI_LOGGER_CONFIG[roleId] || AI_LOGGER_CONFIG.general;

  function dispatch(chipId) {
    if (chipId === 'voice') return onOpenVoice?.();
    if (chipId === 'scan') return onOpenScan?.();
    if (chipId === 'sms' || chipId === 'email') return onOpenPaste?.(chipId);
    return null;
  }

  return (
    <div
      className="ai-logger-card"
      style={{ background: cfg.gradient, boxShadow: cfg.shadow }}
    >
      <div className="ai-logger-head">
        <div className="ai-logger-badge">
          <Sparkles size={12} strokeWidth={2.6} />
          {t('aiLogger.badge')}
        </div>
        <div className="ai-logger-title">{t(`aiLogger.${cfg.bodyKey}.title`)}</div>
        <div className="ai-logger-sub">{t(`aiLogger.${cfg.bodyKey}.sub`)}</div>
      </div>

      <div className="ai-logger-chips" data-count={cfg.chips.length}>
        {cfg.chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              type="button"
              className="ai-logger-chip"
              onClick={() => dispatch(chip.id)}
              aria-label={t(`aiLogger.chip.${chip.textKey}`)}
            >
              <span className="ai-logger-chip-icon">
                <Icon size={18} strokeWidth={2.3} />
              </span>
              <span className="ai-logger-chip-label">
                {t(`aiLogger.chip.${chip.textKey}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Router                                                                     */
/* -------------------------------------------------------------------------- */

export function RoleSpecificSections({ roleId, currency, onOpenSmartReceipt }) {
  switch (roleId) {
    case 'family-parent':
      return <FamilySections currency={currency} />;
    case 'business':
      return <BusinessSections currency={currency} />;
    case 'school-student':
      return <SchoolSections currency={currency} />;
    case 'university-student':
      return <UniSections currency={currency} onOpenSmartReceipt={onOpenSmartReceipt} />;
    case 'employee':
      return <EmployeeSections currency={currency} />;
    case 'freelancer':
      return <FreelancerSections currency={currency} />;
    default:
      return <GeneralSections />;
  }
}
