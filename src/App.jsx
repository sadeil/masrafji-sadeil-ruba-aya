import { useEffect, useState } from 'react';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { LangProvider } from './i18n.jsx';
import { PhoneFrame } from './components/PhoneFrame.jsx';

const STORAGE = {
  role: 'masrafji-role',
  theme: 'masrafji-theme',
  currency: 'masrafji-currency',
  goal: 'masrafji-goal',
  income: 'masrafji-income',
  monthlyIncome: 'masrafji-monthly-income',
  notifications: 'masrafji-notifications',
};

const LEGACY_STORAGE = {
  role: 'masrafhi-role',
  theme: 'masrafhi-theme',
  currency: 'masrafhi-currency',
  goal: 'masrafhi-goal',
  income: 'masrafhi-income',
  monthlyIncome: 'masrafhi-monthly-income',
  notifications: 'masrafhi-notifications',
};

/* One-time migration of old `masrafhi-*` localStorage keys → `masrafji-*`. */
if (typeof window !== 'undefined') {
  try {
    for (const k of Object.keys(STORAGE)) {
      const newKey = STORAGE[k];
      const legacyKey = LEGACY_STORAGE[k];
      if (
        window.localStorage.getItem(newKey) === null &&
        window.localStorage.getItem(legacyKey) !== null
      ) {
        window.localStorage.setItem(newKey, window.localStorage.getItem(legacyKey));
        window.localStorage.removeItem(legacyKey);
      }
    }
  } catch {
    /* ignore */
  }
}

function readLS(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = window.localStorage.getItem(key);
    if (v === null) return fallback;
    return v;
  } catch {
    return fallback;
  }
}
function writeLS(key, value) {
  if (typeof window === 'undefined') return;
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}

function getInitialTheme() {
  const saved = readLS(STORAGE.theme);
  if (saved === 'light' || saved === 'dark') return saved;
  if (typeof window !== 'undefined') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function getInitialCurrency() {
  const saved = readLS(STORAGE.currency);
  if (saved && ['USD', 'ILS', 'JOD', 'EUR'].includes(saved)) return saved;
  return 'USD';
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [roleId, setRoleId] = useState(() => readLS(STORAGE.role));
  const [currency, setCurrency] = useState(getInitialCurrency);
  const [goalId, setGoalId] = useState(() => readLS(STORAGE.goal));
  const [incomeType, setIncomeType] = useState(() => readLS(STORAGE.income));
  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    const v = readLS(STORAGE.monthlyIncome);
    return v ? Number(v) : null;
  });
  const [notificationsOn, setNotificationsOn] = useState(() => {
    const v = readLS(STORAGE.notifications);
    return v === null ? true : v === 'true';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeLS(STORAGE.theme, theme);
  }, [theme]);

  useEffect(() => writeLS(STORAGE.role, roleId), [roleId]);
  useEffect(() => writeLS(STORAGE.currency, currency), [currency]);
  useEffect(() => writeLS(STORAGE.goal, goalId), [goalId]);
  useEffect(() => writeLS(STORAGE.income, incomeType), [incomeType]);
  useEffect(() => writeLS(STORAGE.monthlyIncome, monthlyIncome), [monthlyIncome]);
  useEffect(() => writeLS(STORAGE.notifications, String(notificationsOn)), [notificationsOn]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const resetAll = () => {
    setRoleId(null);
    setGoalId(null);
    setIncomeType(null);
    setMonthlyIncome(null);
  };

  const onboardingComplete = Boolean(roleId && goalId && incomeType);

  return (
    <LangProvider>
      <PhoneFrame>
        {!onboardingComplete ? (
          <Onboarding
            theme={theme}
            onToggleTheme={toggleTheme}
            currency={currency}
            onCurrencyChange={setCurrency}
            roleId={roleId}
            goalId={goalId}
            incomeType={incomeType}
            onSelectRole={setRoleId}
            onSelectGoal={setGoalId}
            onSelectIncome={setIncomeType}
          />
        ) : (
          <Dashboard
            roleId={roleId}
            currency={currency}
            theme={theme}
            goalId={goalId}
            incomeType={incomeType}
            monthlyIncome={monthlyIncome}
            notificationsOn={notificationsOn}
            onCurrencyChange={setCurrency}
            onToggleTheme={toggleTheme}
            onChangeRole={setRoleId}
            onChangeGoal={setGoalId}
            onChangeIncome={setIncomeType}
            onChangeMonthlyIncome={setMonthlyIncome}
            onChangeNotifications={setNotificationsOn}
            onReset={resetAll}
          />
        )}
      </PhoneFrame>
    </LangProvider>
  );
}
