import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Landmark,
  Briefcase,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  ScanLine,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  Button,
  Chip,
  Progress,
  StatCard,
  IconButton,
  ThemeToggle,
  EmptyState,
  NotifBell,
} from '../components/UI.jsx';
import { CashflowChart, CategoryDonut } from '../components/Charts.jsx';
import { BottomNav, getNavItem } from '../components/Sidebar.jsx';
import { CategoryIcon, getIcon } from '../components/Icons.jsx';
import { RoleSpecificSections, AILoggerCard, AssetWatchlist, FXRateCard } from '../components/RoleSections.jsx';
import { AddSheet, Toast } from '../components/Modals.jsx';
import AICoach from '../components/AICoach.jsx';
import { Logo, Wordmark } from '../components/Brand.jsx';
import Settings from '../components/Settings.jsx';
import SmartNotification from '../components/SmartNotification.jsx';
import NotificationCenter from '../components/NotificationCenter.jsx';
import { DASHBOARD_DATA, ROLE_BY_ID, ROLE_EXTRAS } from '../data.js';
import { fmtMoney, fmtRelative, pick } from '../format.js';
import { useLang, useT, useCategoryLabel } from '../i18n.jsx';
import { pickNotification } from '../notifications.js';
import { buildNotificationFeed } from '../notificationFeed.js';
import { pickShortcutNotification } from '../shortcutNotifications.js';
import { generateCheerLine, GEMINI_API_KEY } from '../cheerLLM.js';

export default function Dashboard({
  roleId,
  currency,
  theme,
  monthlyIncome,
  notificationsOn,
  onCurrencyChange,
  onToggleTheme,
  onChangeRole,
  onChangeMonthlyIncome,
  onChangeNotifications,
  onReset,
}) {
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [addType, setAddType] = useState(null);
  const [autoScanReceipt, setAutoScanReceipt] = useState(false);
  const [autoVoice, setAutoVoice] = useState(false);
  const [autoFocusName, setAutoFocusName] = useState(false);
  const [toast, setToast] = useState(null);
  const [notification, setNotification] = useState(null);

  function openSmartReceipt() {
    setAutoScanReceipt(true);
    setAddType('expense');
  }

  function openVoiceLogger() {
    setAutoVoice(true);
    setAddType('expense');
  }

  function openPasteLogger() {
    setAutoFocusName(true);
    setAddType('expense');
  }

  /* ---- Notification Center state -------------------------------------- */
  const [centerOpen, setCenterOpen] = useState(false);
  const [feed, setFeed] = useState([]);
  const [unreadIds, setUnreadIds] = useState(() => new Set());

  const t = useT();
  const { lang } = useLang();

  // Transactions added via the AddSheet during this session. Stored in state
  // (not localStorage) so a fresh reload returns to a clean demo baseline.
  // Keyed by roleId so switching personas keeps each persona's additions
  // separate and clears them when switching back & forth.
  const [addedTxByRole, setAddedTxByRole] = useState({});

  const baseData = DASHBOARD_DATA[roleId] || DASHBOARD_DATA.general;
  const data = useMemo(() => {
    const extras = addedTxByRole[roleId] || [];
    if (extras.length === 0) return baseData;
    return { ...baseData, transactions: [...extras, ...baseData.transactions] };
  }, [baseData, addedTxByRole, roleId]);

  const role = ROLE_BY_ID[roleId];

  /* Show ONE smart notification 5 seconds after the dashboard first mounts.
     After that, auto-pops are suppressed — the only way to surface another
     notification is the hidden "1" key shortcut below. This keeps the demo
     calm while the user explores, and lets us trigger fresh notifications
     on demand during a pitch. */
  const hasShownInitialNotifRef = useRef(false);
  useEffect(() => {
    if (!roleId) return undefined;
    if (notificationsOn === false) {
      setNotification(null);
      return undefined;
    }
    if (hasShownInitialNotifRef.current) return undefined;
    const id = setTimeout(() => {
      hasShownInitialNotifRef.current = true;
      const next = pickNotification(roleId, lang, data);
      if (next) setNotification(next);
    }, 5000);
    return () => clearTimeout(id);
  }, [roleId, lang, notificationsOn]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------------------------------------------ */
  /* Hidden demo shortcut: pressing the "1" key triggers a personalized */
  /* smart toast for the current user. Each press cycles through a      */
  /* role-specific list of realistic notifications.                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!roleId) return undefined;

    function isTypingTarget(el) {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (el.isContentEditable) return true;
      const role = el.getAttribute?.('role');
      if (role === 'textbox' || role === 'combobox' || role === 'searchbox') return true;
      return false;
    }

    function onKeyDown(e) {
      // Only react to plain "1" — ignore numpad combos and modified keys.
      if (e.key !== '1') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (notificationsOn === false) return;

      const next = pickShortcutNotification(roleId, lang);
      if (!next) return;
      e.preventDefault();
      // Setting a fresh object (id includes timestamp) re-mounts the toast
      // even when the user mashes "1" repeatedly, restarting the timer.
      setNotification(next);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [roleId, lang, notificationsOn]);

  /* Build the personalized inbox feed whenever role / language / currency
     changes. Persist read/dismissed state per role so the badge feels alive. */
  useEffect(() => {
    if (!roleId) return;
    const built = buildNotificationFeed(roleId, lang, data, currency);

    // Read persisted state.
    const readKey = `masrafji-notif-read-${roleId}`;
    const dismissKey = `masrafji-notif-dismissed-${roleId}`;
    let read = new Set();
    let dismissed = new Set();
    try {
      const r = JSON.parse(window.localStorage.getItem(readKey) || '[]');
      const d = JSON.parse(window.localStorage.getItem(dismissKey) || '[]');
      read = new Set(Array.isArray(r) ? r : []);
      dismissed = new Set(Array.isArray(d) ? d : []);
    } catch {
      /* ignore */
    }

    // Demo-guaranteed notifications (id prefix `demo-`) ignore the dismissed
    // set so an accidental tap on the X doesn't kill them for the rest of the
    // demo. The user can still dismiss them in-session — they just come back
    // on reload.
    const visible = built.filter(
      (n) => n.id.startsWith('demo-') || !dismissed.has(n.id),
    );
    const unread = new Set(visible.filter((n) => !read.has(n.id)).map((n) => n.id));

    setFeed(visible);
    setUnreadIds(unread);
  }, [roleId, lang, currency]); // eslint-disable-line react-hooks/exhaustive-deps

  function persistRead(nextRead) {
    try {
      window.localStorage.setItem(
        `masrafji-notif-read-${roleId}`,
        JSON.stringify(Array.from(nextRead)),
      );
    } catch {
      /* ignore */
    }
  }

  function persistDismissed(nextDismissed) {
    try {
      window.localStorage.setItem(
        `masrafji-notif-dismissed-${roleId}`,
        JSON.stringify(Array.from(nextDismissed)),
      );
    } catch {
      /* ignore */
    }
  }

  function handleNotificationAction(n) {
    if (n?.tab) setTab(n.tab);
    if (n?.id && unreadIds.has(n.id)) {
      const next = new Set(unreadIds);
      next.delete(n.id);
      setUnreadIds(next);
      // Read set is the inverse: union of all-feed-ids minus unread.
      const readSet = new Set(feed.map((x) => x.id).filter((id) => !next.has(id)));
      persistRead(readSet);
    }
  }

  function handleCenterAction(n) {
    handleNotificationAction(n);
    setCenterOpen(false);
  }

  // Secondary action on anomaly notifications — Dispute / Cancel sub /
  // Contact bank etc. We don't actually file anything (this is a demo);
  // we surface a toast that completes the user flow visually.
  function handleSecondaryAction(n) {
    const kind = n?.anomalyKind;
    let key = 'toasts.actionFiled';
    if (kind === 'duplicate') {
      // Either "Dispute charge" (primary) or "Contact bank" (secondary).
      key = n.action === n.title ? 'toasts.bankContacted' : 'toasts.disputeFiled';
      // Heuristic: secondaryAction was the one tapped, so always bank-contact.
      key = 'toasts.bankContacted';
    } else if (kind === 'subscription') {
      key = 'toasts.subscriptionKept';
    }
    setToast(t(key));
    if (n?.id && unreadIds.has(n.id)) {
      const next = new Set(unreadIds);
      next.delete(n.id);
      setUnreadIds(next);
      const readSet = new Set(feed.map((x) => x.id).filter((id) => !next.has(id)));
      persistRead(readSet);
    }
  }

  // Primary action on anomaly notifications. For "Dispute charge" /
  // "Cancel subscription" we want a toast, not a tab switch.
  function handleAnomalyPrimary(n) {
    const kind = n?.anomalyKind;
    if (kind === 'duplicate') {
      setToast(t('toasts.disputeFiled'));
    } else if (kind === 'subscription') {
      setToast(t('toasts.subscriptionCancelled'));
    } else {
      handleNotificationAction(n);
      return;
    }
    if (n?.id && unreadIds.has(n.id)) {
      const next = new Set(unreadIds);
      next.delete(n.id);
      setUnreadIds(next);
      const readSet = new Set(feed.map((x) => x.id).filter((id) => !next.has(id)));
      persistRead(readSet);
    }
  }

  function markRead(id) {
    if (!unreadIds.has(id)) return;
    const next = new Set(unreadIds);
    next.delete(id);
    setUnreadIds(next);
    const readSet = new Set(feed.map((x) => x.id).filter((fid) => !next.has(fid)));
    persistRead(readSet);
  }

  function markAllRead() {
    setUnreadIds(new Set());
    const readSet = new Set(feed.map((x) => x.id));
    persistRead(readSet);
  }

  function dismissNotif(id) {
    const nextFeed = feed.filter((n) => n.id !== id);
    setFeed(nextFeed);
    if (unreadIds.has(id)) {
      const nextUnread = new Set(unreadIds);
      nextUnread.delete(id);
      setUnreadIds(nextUnread);
    }
    try {
      const dismissKey = `masrafji-notif-dismissed-${roleId}`;
      const existing = JSON.parse(window.localStorage.getItem(dismissKey) || '[]');
      const merged = new Set([...(Array.isArray(existing) ? existing : []), id]);
      persistDismissed(merged);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="app-shell">
      <Topbar
        user={data.user}
        roleId={roleId}
        currency={currency}
        theme={theme}
        activeTab={tab}
        unreadCount={unreadIds.size}
        centerOpen={centerOpen}
        onOpenCenter={() => setCenterOpen(true)}
        onCurrencyChange={onCurrencyChange}
        onToggleTheme={onToggleTheme}
        onAdd={(typ) => setAddType(typ)}
        search={search}
        onSearch={setSearch}
      />

      <SmartNotification
        notification={notification}
        onAction={handleNotificationAction}
        onDismiss={() => setNotification(null)}
        autoHideMs={notification?.shortcut ? 7000 : 10000}
      />

      <NotificationCenter
        open={centerOpen}
        feed={feed}
        unreadIds={unreadIds}
        onClose={() => setCenterOpen(false)}
        onMarkAllRead={markAllRead}
        onMarkRead={markRead}
        onDismiss={dismissNotif}
        onAction={(n) => {
          if (n?.anomalyKind) {
            handleAnomalyPrimary(n);
            setCenterOpen(false);
          } else {
            handleCenterAction(n);
          }
        }}
        onSecondaryAction={(n) => {
          handleSecondaryAction(n);
          setCenterOpen(false);
        }}
      />

      <main className="dashboard-main">
        <div key={tab} className="tab-fade-in">
          {tab === 'overview' && (
            <OverviewTab
              data={data}
              role={role}
              currency={currency}
              onAdd={(typ) => setAddType(typ)}
              onOpenSmartReceipt={openSmartReceipt}
              onOpenVoice={openVoiceLogger}
              onOpenPaste={openPasteLogger}
              onAskCoach={() => setTab('reports')}
            />
          )}
          {tab === 'transactions' && (
            <TransactionsTab
              data={data}
              currency={currency}
              search={search}
              onSearch={setSearch}
              filter={filter}
              onFilter={setFilter}
              onAdd={() => setAddType('expense')}
            />
          )}
          {tab === 'budget' && <BudgetTab data={data} currency={currency} />}
          {tab === 'goals' && (
            <GoalsTab data={data} currency={currency} onAdd={() => setAddType('goal')} />
          )}
          {tab === 'reports' && (
            <ReportsTab
              data={data}
              currency={currency}
              role={role}
              onOpenSmartReceipt={openSmartReceipt}
            />
          )}
          {tab === 'settings' && (
            <Settings
              roleId={roleId}
              currency={currency}
              theme={theme}
              monthlyIncome={monthlyIncome}
              notificationsOn={notificationsOn}
              onChangeRole={(id) => {
                onChangeRole(id);
                setToast(t('settings.switchedTo', { name: t(`role.${id}.name`) }));
              }}
              onCurrencyChange={onCurrencyChange}
              onToggleTheme={onToggleTheme}
              onChangeMonthlyIncome={onChangeMonthlyIncome}
              onChangeNotifications={onChangeNotifications}
              onReset={onReset}
            />
          )}
        </div>
      </main>

      <BottomNav activeTab={tab} onTabChange={setTab} />

      {addType && (
        <AddSheet
          initialType={addType}
          autoScanReceipt={autoScanReceipt}
          autoVoice={autoVoice}
          autoFocusName={autoFocusName}
          onClose={() => {
            setAddType(null);
            setAutoScanReceipt(false);
            setAutoVoice(false);
            setAutoFocusName(false);
          }}
          onSubmit={(payload) => {
            const typeLabel = t(`addSheet.types.${payload.type}`);
            setToast(t('addSheet.saved', { type: typeLabel }));

            // Only mirror expense/income into the ledger — bills and goals
            // belong on their own tabs, not the transactions feed.
            if (payload.type === 'expense' || payload.type === 'income') {
              const isIncome = payload.type === 'income';
              const amt = Math.abs(Number(payload.amount) || 0);
              // Match the demo "today" the rest of the app's data uses, so
              // fmtRelative renders "Today / اليوم" instead of "X days ago".
              const demoToday = new Date(2026, 3, 30).toISOString();
              const newTx = {
                id: `user-${Date.now()}`,
                name: payload.name || (isIncome ? 'Income' : 'Expense'),
                nameAr: payload.name || (isIncome ? 'دخل' : 'مصروف'),
                category: payload.category || (isIncome ? 'Income' : 'Other'),
                amount: isIncome ? amt : -amt,
                date: demoToday,
                icon: isIncome ? 'trending-up' : 'utensils',
              };
              setAddedTxByRole((prev) => ({
                ...prev,
                [roleId]: [newTx, ...(prev[roleId] || [])],
              }));
            }
          }}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Topbar                                                                     */
/* -------------------------------------------------------------------------- */

function Topbar({
  user,
  roleId,
  currency,
  theme,
  activeTab,
  unreadCount = 0,
  centerOpen = false,
  onOpenCenter,
  onCurrencyChange,
  onToggleTheme,
  onAdd,
  search,
  onSearch,
}) {
  const t = useT();
  const { lang } = useLang();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('common.goodMorning');
    if (hour < 18) return t('common.goodAfternoon');
    return t('common.goodEvening');
  }, [t, lang]);

  const userFirst = useMemo(() => {
    if (lang === 'ar' && user.nameAr) return user.nameAr.split(' ')[0];
    return user.name.split(' ')[0];
  }, [lang, user]);

  if (activeTab === 'settings') {
    return (
      <header className="topbar">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Logo size={30} />
          <div className="min-w-0 flex-1">
            <Wordmark size="sm" showTagline={false} />
            <div className="text-[10.5px] text-3 font-medium leading-tight">
              {t('nav.settings')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <NotifBell
            unreadCount={unreadCount}
            onClick={onOpenCenter}
            label={t('notifCenter.open')}
            active={centerOpen}
          />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>
    );
  }

  return (
    <header className="topbar">
      <div className="flex-1 min-w-0 me-2">
        <div className="text-[11px] font-medium text-3 truncate">
          {greeting},{' '}
          <span className="font-semibold text-2">{userFirst}</span>
        </div>
        <div className="font-display text-lg font-bold text-1 truncate mt-0.5 leading-tight">
          {t(`nav.${navKeyFromTab(activeTab)}`)}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <NotifBell
          unreadCount={unreadCount}
          onClick={onOpenCenter}
          label={t('notifCenter.open')}
          active={centerOpen}
        />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          type="button"
          onClick={() => onAdd('expense')}
          className="btn btn-primary"
          style={{ width: 36, height: 36, padding: 0, borderRadius: 11 }}
          aria-label={t('common.add')}
        >
          <Plus size={16} strokeWidth={2.4} />
        </button>
      </div>
    </header>
  );
}

function navKeyFromTab(t) {
  const map = {
    overview: 'home',
    transactions: 'transactions',
    budget: 'budget',
    goals: 'goals',
    reports: 'reports',
    settings: 'settings',
  };
  return map[t] || 'home';
}

/* -------------------------------------------------------------------------- */
/* Overview tab                                                               */
/* -------------------------------------------------------------------------- */

function OverviewTab({ data, role, currency, onAdd, onOpenSmartReceipt, onOpenVoice, onOpenPaste, onAskCoach }) {
  const t = useT();
  const { lang } = useLang();
  const catLabel = useCategoryLabel();
  const { kpis, cashflow, categories, transactions, goals, bills, alerts } = data;
  const totalCategories = categories.reduce((s, c) => s + c.value, 0);

  // Persona-tuned savings icon — Hasala for kids, Landmark for grown-ups,
  // Briefcase for business owners (savings reads as "tax buffer / reserve").
  const savingsIcon =
    role.id === 'school-student'
      ? PiggyBank
      : role.id === 'business' || role.id === 'freelancer'
      ? Briefcase
      : Landmark;

  return (
    <div className="space-y-4">
      {/* AI greeting — warm, personalised, supportive */}
      <GoalCheerCard user={data.user} goals={data.goals} lang={lang} />

      {/* KPIs — phone-friendly 2-column grid */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard
          label={t('dashboard.totalBalance')}
          value={fmtMoney(kpis.balance.value, currency)}
          delta={kpis.balance.delta}
          sub={pick(kpis.balance, 'sub', lang)}
          icon={Wallet}
          feature
        />
        <StatCard
          label={t('dashboard.income')}
          value={fmtMoney(kpis.income.value, currency)}
          delta={kpis.income.delta}
          sub={pick(kpis.income, 'sub', lang)}
          icon={TrendingUp}
          iconBg="rgba(16, 185, 129, 0.12)"
          iconColor="var(--success)"
        />
        <StatCard
          label={t('dashboard.expenses')}
          value={fmtMoney(kpis.expenses.value, currency)}
          delta={kpis.expenses.delta}
          sub={pick(kpis.expenses, 'sub', lang)}
          icon={TrendingDown}
          iconBg="rgba(239, 68, 68, 0.12)"
          iconColor="var(--danger)"
          invertDelta
        />
        <StatCard
          label={t('dashboard.savings')}
          value={fmtMoney(kpis.savings.value, currency)}
          delta={kpis.savings.delta}
          sub={pick(kpis.savings, 'sub', lang)}
          icon={savingsIcon}
          iconBg="rgba(57, 97, 251, 0.12)"
          iconColor="var(--brand-600)"
        />
      </section>

      {/* AI Logger — persona-tuned capture surface */}
      <AILoggerCard
        roleId={role.id}
        onOpenVoice={onOpenVoice}
        onOpenScan={onOpenSmartReceipt}
        onOpenPaste={onOpenPaste}
      />

      {/* Ask the Coach — surfaces the chat-with-data feature on Overview */}
      <AskCoachCTA onAskCoach={onAskCoach} />

      {/* Employee-only: surface investments + currency exchange near the top
          so users don't have to scroll to see live market data. */}
      {role.id === 'employee' && (
        <>
          <AssetWatchlist
            assets={ROLE_EXTRAS.employee.watchlist}
            currency={currency}
          />
          <FXRateCard />
        </>
      )}

      {/* Quick actions */}
      <Card className="p-4">
        <CardHeader title={t('quickActions.title')} />
        <div className="quick-actions-grid mt-3">
          <QuickAction
            icon={TrendingDown}
            label={t('quickActions.addExpense')}
            color="#ef4444"
            onClick={() => onAdd('expense')}
          />
          <QuickAction
            icon={TrendingUp}
            label={t('quickActions.addIncome')}
            color="#10b981"
            onClick={() => onAdd('income')}
          />
          <QuickAction
            icon={Bell}
            label={t('quickActions.addBill')}
            color="#3961fb"
            onClick={() => onAdd('bill')}
          />
          <QuickAction
            icon={Sparkles}
            label={t('quickActions.addGoal')}
            color="#7c3aed"
            onClick={() => onAdd('goal')}
          />
        </div>
      </Card>

      {/* Cashflow chart */}
      <Card className="p-4">
        <CardHeader
          title={t('dashboard.cashFlow')}
          subtitle={t('dashboard.cashFlowSub')}
        />
        <div className="mt-3 flex items-center gap-3 text-[11px] text-2 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="dot" style={{ background: 'var(--success)' }} /> {t('dashboard.income')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="dot" style={{ background: 'var(--brand-500)' }} /> {t('dashboard.expenses')}
          </span>
        </div>
        <div className="mt-2">
          <CashflowChart data={cashflow} currency={currency} />
        </div>
      </Card>

      {/* Categories donut */}
      <Card className="p-4">
        <CardHeader
          title={t('dashboard.spendingByCategory')}
          subtitle={t('common.thisMonth')}
        />
        <div className="mt-3">
          <CategoryDonut
            data={categories.map((c) => ({ ...c, name: catLabel(c.name) }))}
            currency={currency}
            total={totalCategories}
          />
        </div>
        <div className="mt-3 space-y-1">
          {categories.slice(0, 4).map((c) => (
            <div key={c.name} className="flex items-center justify-between text-xs py-1">
              <span className="flex items-center gap-2 text-2">
                <span className="dot" style={{ background: c.color }} />
                {catLabel(c.name)}
              </span>
              <span className="font-semibold tabular-nums text-1">
                {fmtMoney(c.value, currency)}
              </span>
            </div>
          ))}
          {categories.length > 4 && (
            <div className="text-[11px] text-3 pt-1">
              {t('dashboard.moreCategories', { count: categories.length - 4 })}
            </div>
          )}
        </div>
      </Card>

      {/* Recent transactions */}
      <Card className="p-4">
        <CardHeader
          title={t('dashboard.recentTransactions')}
          subtitle={t('dashboard.last7Days')}
          action={
            <Button size="sm" variant="ghost" onClick={() => onAdd('expense')}>
              <Plus size={14} strokeWidth={2.4} />
              {t('common.add')}
            </Button>
          }
        />
        <div className="mt-3 space-y-1">
          {transactions.slice(0, 5).map((tx) => (
            <TransactionRow key={tx.id} tx={tx} currency={currency} />
          ))}
        </div>
      </Card>

      {/* Goals snapshot */}
      <Card className="p-4">
        <CardHeader
          title={t('dashboard.goalsCard')}
          subtitle={t('dashboard.longTermWins')}
          action={<Chip tone="brand">{goals.length}</Chip>}
        />
        <div className="mt-3 space-y-3">
          {goals.map((g) => (
            <GoalRow key={g.id} goal={g} currency={currency} />
          ))}
        </div>
      </Card>

      {/* Budgets */}
      <Card className="p-4">
        <CardHeader
          title={t('dashboard.budgetCategories')}
          subtitle={t('dashboard.trackingMonthlyLimits')}
        />
        <div className="mt-3 space-y-3">
          {data.budgets.slice(0, 4).map((b) => {
            const pct = (b.spent / b.limit) * 100;
            const tone = pct >= 100 ? 'danger' : pct >= 85 ? 'warning' : 'success';
            return (
              <div key={b.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${b.color}20`, color: b.color }}
                    >
                      {(() => {
                        const Icon = getIcon(b.icon);
                        return <Icon size={14} strokeWidth={2.2} />;
                      })()}
                    </span>
                    <span className="text-sm font-semibold text-1 truncate">
                      {catLabel(b.category)}
                    </span>
                  </div>
                  <div className="text-[11px] tabular-nums text-2 ltr-numbers">
                    <span className="font-semibold text-1">
                      {fmtMoney(b.spent, currency)}
                    </span>
                    <span className="text-3"> / {fmtMoney(b.limit, currency)}</span>
                  </div>
                </div>
                <Progress value={Math.min(pct, 100)} tone={tone} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bills */}
      <Card className="p-4">
        <CardHeader title={t('dashboard.upcomingBills')} subtitle={t('common.next30d')} />
        <div className="mt-3 space-y-1">
          {data.bills.slice(0, 4).map((b) => (
            <BillRow key={b.id} bill={b} currency={currency} />
          ))}
        </div>
      </Card>

      {/* Alerts */}
      <Card className="p-4">
        <CardHeader
          title={t('dashboard.smartAlerts')}
          subtitle={t('dashboard.smartAlertsSub')}
        />
        <div className="mt-3 space-y-2">
          {alerts.slice(0, 3).map((a, i) => (
            <AlertRow key={i} alert={a} />
          ))}
        </div>
      </Card>

      {/* Role-specific sections (e.g. children, invoices, badges, …) */}
      <RoleSpecificSections
        roleId={role.id}
        currency={currency}
        onOpenSmartReceipt={onOpenSmartReceipt}
      />
    </div>
  );
}

function QuickAction({ icon: Icon, label, color, onClick }) {
  return (
    <button type="button" className="quick-action" onClick={onClick}>
      <span
        className="quick-action-icon"
        style={{ background: `${color}1f`, color }}
      >
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <span className="quick-action-label">{label}</span>
    </button>
  );
}

// Goals like "Tax buffer", "Emergency fund", "3-month buffer" are real, but
// they're not dreams — they're admin. The cheer card skips them whenever there
// is at least one aspirational goal (a thing you can hold, visit, or play).
const BORING_GOAL_RX = /(buffer|reserve|emergency|tax|hire|payroll|q[1-4]|target|equipment|refresh|احتياطي|طوارئ|ضريبة|راتب|توظيف|ربع|هدف الإيرادات|تجديد|معدّات)/i;

function isAspirational(g) {
  const en = String(g?.name || '');
  const ar = String(g?.nameAr || '');
  if (BORING_GOAL_RX.test(en) || BORING_GOAL_RX.test(ar)) return false;
  return true;
}

function GoalCheerCard({ user, goals = [], lang }) {
  const t = useT();

  const firstName = (lang === 'ar' && user.nameAr ? user.nameAr : user.name).split(' ')[0];

  const { band, goalLabel } = useMemo(() => {
    const enriched = (goals || [])
      .filter((g) => g && g.target > 0)
      .map((g) => ({ ...g, pct: (g.saved / g.target) * 100 }));
    const aspirational = enriched.filter(isAspirational);
    const pool = aspirational.length > 0 ? aspirational : enriched;
    const inProg = pool.filter((g) => g.pct < 100).sort((a, b) => b.pct - a.pct);
    const done = pool.filter((g) => g.pct >= 100);

    if (inProg.length > 0) {
      const g = inProg[0];
      return {
        band: g.pct >= 70 ? 'close' : g.pct >= 30 ? 'mid' : 'start',
        goalLabel: pick(g, 'name', lang),
      };
    }
    if (done.length > 0) {
      return { band: 'done', goalLabel: pick(done[0], 'name', lang) };
    }
    return { band: 'noGoal', goalLabel: '' };
  }, [goals, lang]);

  // Static fallback — gender-neutral phrasing that works for any noun. Shown
  // immediately while Gemini is generating, and remains the final text if the
  // API call fails (no key, offline, throttled).
  const fallback = t(`cheer.${band}`, { name: firstName, goal: goalLabel });

  const [message, setMessage] = useState(fallback);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setMessage(fallback);

    if (!GEMINI_API_KEY || band === 'noGoal' || !goalLabel) return undefined;

    (async () => {
      try {
        const line = await generateCheerLine({
          name: firstName,
          goal: goalLabel,
          lang,
          band,
        });
        if (!cancelledRef.current && line) setMessage(line);
      } catch {
        // Keep the static fallback already on screen.
      }
    })();

    return () => {
      cancelledRef.current = true;
    };
  }, [firstName, goalLabel, lang, band, fallback]);

  return (
    <div className="cheer-card" role="status" aria-live="polite">
      <span className="cheer-avatar" aria-hidden="true">
        <Sparkles size={18} strokeWidth={2.4} />
      </span>
      <div className="cheer-body">
        <span className="cheer-text">{message}</span>
      </div>
    </div>
  );
}

function AskCoachCTA({ onAskCoach }) {
  const t = useT();
  const examples = [
    t('askCoach.example1'),
    t('askCoach.example2'),
    t('askCoach.example3'),
  ];
  return (
    <button type="button" className="ask-coach-cta" onClick={onAskCoach}>
      <span className="ask-coach-icon">
        <MessageCircle size={20} strokeWidth={2.2} />
      </span>
      <span className="ask-coach-body">
        <span className="ask-coach-eyebrow">
          <Sparkles size={11} strokeWidth={2.6} />
          {t('askCoach.eyebrow')}
        </span>
        <span className="ask-coach-title">{t('askCoach.title')}</span>
        <span className="ask-coach-examples">
          {examples.map((ex, i) => (
            <span key={i} className="ask-coach-example">"{ex}"</span>
          ))}
        </span>
      </span>
      <ArrowRight size={16} strokeWidth={2.4} className="ask-coach-arrow" />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Transactions tab                                                           */
/* -------------------------------------------------------------------------- */

function TransactionsTab({ data, currency, search, onSearch, filter, onFilter, onAdd }) {
  const t = useT();
  const { lang } = useLang();
  const catLabel = useCategoryLabel();

  const filters = [
    { id: 'all', label: t('transactions.filterAll') },
    { id: 'income', label: t('transactions.filterIncome') },
    { id: 'expense', label: t('transactions.filterExpense') },
  ];

  const visible = data.transactions.filter((tx) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'income' && tx.amount > 0) ||
      (filter === 'expense' && tx.amount < 0);
    const haystack = [
      tx.name,
      tx.nameAr || '',
      tx.category,
      catLabel(tx.category),
    ]
      .join(' ')
      .toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="search-bar">
            <Search size={16} strokeWidth={2} />
            <input
              className="input"
              placeholder={t('transactions.placeholder')}
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 justify-between">
            <div className="flex p-1 rounded-xl gap-1" style={{ background: 'var(--surface-2)' }}>
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFilter(f.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg transition"
                  style={{
                    background: filter === f.id ? 'var(--surface)' : 'transparent',
                    color: filter === f.id ? 'var(--text-1)' : 'var(--text-3)',
                    boxShadow: filter === f.id ? 'var(--shadow-soft)' : 'none',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={onAdd}>
              <Plus size={14} strokeWidth={2.4} /> {t('common.add')}
            </Button>
          </div>
        </div>

        <hr className="divider my-4" />

        {visible.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t('transactions.empty')}
            body={t('transactions.emptyBody')}
            action={
              <Button variant="ghost" size="sm" onClick={() => onSearch('')}>
                {t('transactions.clearSearch')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-1">
            {visible.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} currency={currency} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Budget tab                                                                 */
/* -------------------------------------------------------------------------- */

function BudgetTab({ data, currency }) {
  const t = useT();
  const catLabel = useCategoryLabel();
  const totalSpent = data.budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = data.budgets.reduce((s, b) => s + b.limit, 0);
  const overall = (totalSpent / totalLimit) * 100;
  const overallTone = overall >= 100 ? 'danger' : overall >= 85 ? 'warning' : 'success';

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide font-semibold text-3">
              {t('dashboard.monthlyBudget')}
            </div>
            <div className="font-display text-2xl font-bold tabular-nums text-1 mt-1 ltr-numbers">
              {fmtMoney(totalSpent, currency)}
            </div>
            <div className="text-xs text-3 mt-0.5 tabular-nums ltr-numbers">
              {t('common.of')} {fmtMoney(totalLimit, currency)}
            </div>
          </div>
          <Chip tone={overallTone}>{Math.round(overall)}%</Chip>
        </div>
        <div className="mt-3">
          <Progress value={Math.min(overall, 100)} tone={overallTone} />
        </div>
        <div className="text-[11px] text-3 mt-1.5">{t('dashboard.resetEachMonth')}</div>
      </Card>

      <Card className="p-4">
        <CardHeader title={t('dashboard.budgetCategories')} />
        <div className="mt-3 space-y-3.5">
          {data.budgets.map((b) => {
            const pct = (b.spent / b.limit) * 100;
            const tone = pct >= 100 ? 'danger' : pct >= 85 ? 'warning' : 'success';
            const Icon = getIcon(b.icon);
            const left = Math.max(0, b.limit - b.spent);
            const status =
              b.spent > b.limit
                ? `${t('common.overBy')} ${fmtMoney(b.spent - b.limit, currency)}`
                : b.spent === b.limit
                ? t('common.fullyUsed')
                : `${fmtMoney(left, currency)} ${t('common.left')}`;
            return (
              <div key={b.category}>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${b.color}20`, color: b.color }}
                    >
                      <Icon size={16} strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-1 truncate">
                        {catLabel(b.category)}
                      </div>
                      <div className="text-[11px] text-3 truncate ltr-numbers">{status}</div>
                    </div>
                  </div>
                  <div className="text-end ltr-numbers">
                    <div className="text-sm font-semibold text-1 tabular-nums">
                      {fmtMoney(b.spent, currency)}
                    </div>
                    <div className="text-[11px] text-3 tabular-nums">
                      / {fmtMoney(b.limit, currency)}
                    </div>
                  </div>
                </div>
                <Progress value={Math.min(pct, 100)} tone={tone} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Goals tab                                                                  */
/* -------------------------------------------------------------------------- */

function GoalsTab({ data, currency, onAdd }) {
  const t = useT();
  const { lang } = useLang();
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <CardHeader
          title={t('dashboard.yourGoals')}
          subtitle={t('dashboard.yourGoalsSub')}
          action={
            <Button size="sm" onClick={onAdd}>
              <Plus size={14} strokeWidth={2.4} /> {t('common.newGoal')}
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-3 mt-4">
          {data.goals.map((g) => {
            const Icon = getIcon(g.icon);
            const pct = Math.min(100, (g.saved / g.target) * 100);
            const done = pct >= 100;
            return (
              <div
                key={g.id}
                className="p-4 rounded-2xl border card-hover"
                style={{
                  borderColor: 'var(--border)',
                  background: done ? 'rgba(16,185,129,0.08)' : 'var(--surface-2)',
                }}
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                      style={{
                        background: done
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'var(--gradient-brand)',
                      }}
                    >
                      <Icon size={18} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-1 text-base truncate">
                        {pick(g, 'name', lang)}
                      </div>
                      <div className="text-[11px] text-3 mt-0.5">
                        {t('common.due')}: {pick(g, 'deadline', lang)}
                      </div>
                    </div>
                  </div>
                  {done && <Chip tone="success">{t('common.achieved')}</Chip>}
                </div>
                <div className="flex items-baseline justify-between mb-1.5 ltr-numbers">
                  <div className="font-display text-lg font-bold tabular-nums text-1">
                    {fmtMoney(g.saved, currency)}
                  </div>
                  <div className="text-[11px] text-3 tabular-nums">
                    {t('common.of')} {fmtMoney(g.target, currency)}
                  </div>
                </div>
                <Progress value={pct} tone={done ? 'success' : 'brand'} />
                <div className="text-[11px] text-3 mt-2">
                  {Math.round(pct)}% {t('common.complete')}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reports tab                                                                */
/* -------------------------------------------------------------------------- */

function ReportsTab({ data, currency, role, onOpenSmartReceipt }) {
  const t = useT();
  const totalIncome = data.cashflow.reduce((s, m) => s + m.income, 0);
  const totalExpenses = data.cashflow.reduce((s, m) => s + m.expenses, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = (savings / totalIncome) * 100;

  return (
    <div className="space-y-4">
      <AICoach role={role} transactions={data.transactions || []} />

      <section className="grid grid-cols-2 gap-3">
        <StatCard
          label={t('dashboard.sixMonthIncome')}
          value={fmtMoney(totalIncome, currency)}
          icon={TrendingUp}
          sub={t('dashboard.acrossSources')}
          iconBg="rgba(16, 185, 129, 0.12)"
          iconColor="var(--success)"
        />
        <StatCard
          label={t('dashboard.sixMonthExpenses')}
          value={fmtMoney(totalExpenses, currency)}
          icon={TrendingDown}
          sub={t('dashboard.allCategories')}
          iconBg="rgba(239, 68, 68, 0.12)"
          iconColor="var(--danger)"
        />
      </section>

      <Card className="p-4">
        <CardHeader
          title={t('dashboard.savingsRate')}
          subtitle={`${fmtMoney(savings, currency)} ${t('dashboard.kept')}`}
          action={<Chip tone="success">{savingsRate.toFixed(1)}%</Chip>}
        />
        <div className="mt-3">
          <Progress value={Math.max(0, Math.min(100, savingsRate))} tone="success" />
        </div>
      </Card>

      <Card className="p-4">
        <CardHeader
          title={t('dashboard.sixMonthReport')}
          subtitle={t('dashboard.sixMonthReportSub')}
        />
        <div className="mt-3">
          <CashflowChart data={data.cashflow} currency={currency} height={280} />
        </div>
      </Card>

      {/* Role-specific reports */}
      <RoleSpecificSections
        roleId={role.id}
        currency={currency}
        onOpenSmartReceipt={onOpenSmartReceipt}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable rows                                                              */
/* -------------------------------------------------------------------------- */

function TransactionRow({ tx, currency }) {
  const { lang } = useLang();
  const catLabel = useCategoryLabel();
  const t = useT();
  const isIncome = tx.amount > 0;
  return (
    <div className="list-row">
      <CategoryIcon
        name={tx.icon}
        bg={isIncome ? 'rgba(16,185,129,0.12)' : 'var(--surface-2)'}
        color={isIncome ? 'var(--success)' : 'var(--text-2)'}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-1 truncate flex items-center gap-1.5">
          <span className="truncate">{pick(tx, 'name', lang)}</span>
          {tx.scanned && (
            <span className="tx-scanned-badge" title={t('transactions.scanned')}>
              <ScanLine size={10} strokeWidth={2.6} />
              <span>{t('transactions.scanned')}</span>
            </span>
          )}
        </div>
        <div className="text-[11px] text-3 truncate">
          {catLabel(tx.category)} · {fmtRelative(tx.date, t)}
        </div>
      </div>
      <div className="text-end ltr-numbers">
        <div
          className={`text-sm font-bold tabular-nums ${isIncome ? 'text-success' : 'text-1'}`}
        >
          {isIncome ? '+' : '-'}
          {fmtMoney(Math.abs(tx.amount), currency)}
        </div>
      </div>
    </div>
  );
}

function GoalRow({ goal, currency }) {
  const { lang } = useLang();
  const t = useT();
  const Icon = getIcon(goal.icon);
  const pct = Math.min(100, (goal.saved / goal.target) * 100);
  return (
    <div>
      <div className="flex items-center gap-3 mb-1.5">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <Icon size={16} strokeWidth={2.2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-1 truncate">
            {pick(goal, 'name', lang)}
          </div>
          <div className="text-[11px] text-3 truncate">
            {t('common.due')}: {pick(goal, 'deadline', lang)}
          </div>
        </div>
        <div className="text-end ltr-numbers">
          <div className="text-sm font-semibold tabular-nums text-1">
            {fmtMoney(goal.saved, currency)}
          </div>
          <div className="text-[11px] text-3 tabular-nums">
            {t('common.of')} {fmtMoney(goal.target, currency)}
          </div>
        </div>
      </div>
      <Progress value={pct} />
    </div>
  );
}

function BillRow({ bill, currency }) {
  const { lang } = useLang();
  const t = useT();
  const Icon = getIcon(bill.icon);
  return (
    <div className="list-row">
      <span
        className="list-icon"
        style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}
      >
        <Icon size={16} strokeWidth={2.2} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-1 truncate">
          {pick(bill, 'name', lang)}
        </div>
        <div className="text-[11px] text-3">{fmtRelative(bill.due, t)}</div>
      </div>
      <div className="text-sm font-semibold tabular-nums text-1 ltr-numbers">
        {fmtMoney(bill.amount, currency)}
      </div>
    </div>
  );
}

function AlertRow({ alert }) {
  const { lang } = useLang();
  const tone = alert.severity;
  const Icon =
    tone === 'success'
      ? CheckCircle2
      : tone === 'warning'
      ? AlertTriangle
      : tone === 'danger'
      ? XCircle
      : Info;
  const colorVar =
    tone === 'success'
      ? 'var(--success)'
      : tone === 'warning'
      ? 'var(--warning)'
      : tone === 'danger'
      ? 'var(--danger)'
      : 'var(--info)';
  const bg =
    tone === 'success'
      ? 'var(--success-soft)'
      : tone === 'warning'
      ? 'var(--warning-soft)'
      : tone === 'danger'
      ? 'var(--danger-soft)'
      : 'var(--info-soft)';
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: bg }}>
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: colorVar, color: '#fff' }}
      >
        <Icon size={14} strokeWidth={2.4} />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-1 leading-tight">
          {pick(alert, 'title', lang)}
        </div>
        <div className="text-xs text-2 mt-0.5 leading-relaxed">
          {pick(alert, 'body', lang)}
        </div>
      </div>
    </div>
  );
}
