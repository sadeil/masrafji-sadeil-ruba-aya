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
} from 'lucide-react';
import { Card, CardHeader, Chip, Progress } from './UI.jsx';
import { CategoryDonut, ForecastChart } from './Charts.jsx';
import { DASHBOARD_DATA, ROLE_EXTRAS } from '../data.js';
import { fmtMoney, fmtPct, pick } from '../format.js';
import { useLang, useT } from '../i18n.jsx';

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

function SchoolSections() {
  const t = useT();
  const { lang } = useLang();
  const { badges, parentMode } = ROLE_EXTRAS['school-student'];
  const parentName = pick(parentMode, 'parentName', lang);
  return (
    <>
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
/* University student                                                         */
/* -------------------------------------------------------------------------- */

function UniSections({ currency, onOpenSmartReceipt }) {
  const t = useT();
  const { lang } = useLang();
  const { sideIncome } = ROLE_EXTRAS['university-student'];
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 items-center">
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
/* Router                                                                     */
/* -------------------------------------------------------------------------- */

export function RoleSpecificSections({ roleId, currency, onOpenSmartReceipt }) {
  switch (roleId) {
    case 'family-parent':
      return <FamilySections currency={currency} />;
    case 'business':
      return <BusinessSections currency={currency} />;
    case 'school-student':
      return <SchoolSections />;
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
