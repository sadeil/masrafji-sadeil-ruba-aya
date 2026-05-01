import {
  Home,
  ArrowRightLeft,
  Wallet,
  Target,
  ChartBar,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useT } from '../i18n.jsx';

/**
 * Bottom navigation — six fixed tabs visible on every screen of the app.
 * The order matches the request: Home, Transactions, Budget, Goals, Reports,
 * Settings.  All labels are pulled from the i18n dictionary.
 */
const NAV_ITEMS = [
  { id: 'overview', labelKey: 'nav.home', icon: Home },
  { id: 'transactions', labelKey: 'nav.transactions', icon: ArrowRightLeft },
  { id: 'budget', labelKey: 'nav.budget', icon: Wallet },
  { id: 'goals', labelKey: 'nav.goals', icon: Target },
  { id: 'reports', labelKey: 'nav.reports', icon: ChartBar },
  { id: 'settings', labelKey: 'nav.settings', icon: SettingsIcon },
];

export function getNavItem(id) {
  return NAV_ITEMS.find((n) => n.id === id);
}

export function getNavItems() {
  return NAV_ITEMS;
}

export function BottomNav({ activeTab, onTabChange }) {
  const t = useT();
  return (
    <nav className="bottom-nav flex" role="tablist" aria-label="Main">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`bottom-nav-item ${active ? 'is-active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="bottom-nav-icon">
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <span>{t(item.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* Sidebar kept as a no-op for backward compat; we no longer render it. */
export function Sidebar() {
  return null;
}
