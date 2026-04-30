import { useState } from 'react';
import {
  ChevronRight,
  User,
  Languages,
  DollarSign,
  Wallet,
  Bell,
  Moon,
  Sun,
  Cloud,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { ROLES, ROLE_BY_ID, CURRENCIES } from '../data.js';
import { Card, Chip, Button, Progress } from './UI.jsx';
import { Logo, Wordmark } from './Brand.jsx';
import { getIcon } from './Icons.jsx';
import { fmtMoney, pick } from '../format.js';

/**
 * In-app Settings tab. Renders six sections:
 *   1) Account     — change persona
 *   2) Language    — switch EN ↔ AR
 *   3) Currency    — USD / ILS / JOD / EUR
 *   4) Income      — edit monthly income
 *   5) Notifications + Dark mode (preferences)
 *   6) Data        — backup (soon) / reset
 *
 * All controls are wired to the parent state passed through props.
 */
export default function Settings({
  roleId,
  currency,
  theme,
  monthlyIncome,
  notificationsOn,
  onChangeRole,
  onCurrencyChange,
  onToggleTheme,
  onChangeMonthlyIncome,
  onChangeNotifications,
  onReset,
}) {
  const { t, lang, setLang } = useLang();
  const [openSheet, setOpenSheet] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const role = ROLE_BY_ID[roleId];
  const cur = CURRENCIES[currency] || CURRENCIES.USD;

  const localizedCurrencyLabel = lang === 'ar' && cur.labelAr ? cur.labelAr : cur.label;

  return (
    <div className="space-y-5 pb-2">
      {/* Brand header */}
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Logo size={48} />
          <div className="min-w-0 flex-1">
            <Wordmark size="lg" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-3">{t('settings.about')}</span>
          <Chip tone="default">{t('settings.version')} 1.0</Chip>
        </div>
      </Card>

      {/* Account */}
      <SettingsSection title={t('settings.account')}>
        <SettingsRow
          icon={User}
          label={t('settings.changePersona')}
          sub={role ? t(`role.${roleId}.name`) : t('settings.changePersonaSub')}
          onClick={() => setOpenSheet('persona')}
        />
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title={t('settings.preferences')}>
        <SettingsRow
          icon={Languages}
          label={t('settings.language')}
          sub={t('settings.languageSub')}
          right={
            <SegmentedToggle
              options={[
                { id: 'en', label: 'EN' },
                { id: 'ar', label: 'ع' },
              ]}
              value={lang}
              onChange={setLang}
            />
          }
        />
        <SettingsRow
          icon={DollarSign}
          label={t('settings.currency')}
          sub={`${cur.code} · ${localizedCurrencyLabel}`}
          onClick={() => setOpenSheet('currency')}
          rightText={cur.symbol === 'JD' ? 'JD' : cur.symbol}
        />
        <SettingsRow
          icon={Wallet}
          label={t('settings.monthlyIncome')}
          sub={
            monthlyIncome
              ? fmtMoney(monthlyIncome, currency)
              : t('settings.monthlyIncomeSub')
          }
          onClick={() => setOpenSheet('income')}
        />
        <SettingsRow
          icon={Bell}
          label={t('settings.notifications')}
          sub={t('settings.notificationsSub')}
          right={
            <Toggle
              checked={notificationsOn}
              onChange={onChangeNotifications}
              ariaLabel={t('settings.notifications')}
            />
          }
        />
        <SettingsRow
          icon={theme === 'dark' ? Sun : Moon}
          label={t('settings.darkMode')}
          sub={t('settings.darkModeSub')}
          right={
            <Toggle
              checked={theme === 'dark'}
              onChange={() => onToggleTheme()}
              ariaLabel={t('settings.darkMode')}
            />
          }
        />
      </SettingsSection>

      {/* Data */}
      <SettingsSection title={t('settings.data')}>
        <SettingsRow
          icon={Cloud}
          label={t('settings.backup')}
          sub={t('settings.backupSub')}
          right={<Chip tone="default">{t('common.comingSoon')}</Chip>}
          disabled
        />
        <SettingsRow
          icon={RefreshCw}
          label={t('settings.reset')}
          sub={t('settings.resetSub')}
          onClick={() => setConfirmReset(true)}
          danger
        />
      </SettingsSection>

      {/* Sheets */}
      {openSheet === 'persona' && (
        <SheetPicker
          title={t('settings.changePersona')}
          onClose={() => setOpenSheet(null)}
        >
          <PersonaList
            current={roleId}
            onPick={(id) => {
              onChangeRole(id);
              setOpenSheet(null);
            }}
          />
        </SheetPicker>
      )}

      {openSheet === 'currency' && (
        <SheetPicker title={t('settings.currency')} onClose={() => setOpenSheet(null)}>
          <CurrencyList
            current={currency}
            onPick={(code) => {
              onCurrencyChange(code);
              setOpenSheet(null);
            }}
          />
        </SheetPicker>
      )}

      {openSheet === 'income' && (
        <SheetPicker
          title={t('settings.monthlyIncome')}
          onClose={() => setOpenSheet(null)}
        >
          <MonthlyIncomeForm
            initial={monthlyIncome}
            currency={currency}
            onSave={(v) => {
              onChangeMonthlyIncome(v);
              setOpenSheet(null);
            }}
          />
        </SheetPicker>
      )}

      {confirmReset && (
        <ResetConfirm
          onClose={() => setConfirmReset(false)}
          onConfirm={() => {
            onReset();
            setConfirmReset(false);
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section + row primitives                                                   */
/* -------------------------------------------------------------------------- */

function SettingsSection({ title, children }) {
  return (
    <div>
      <div className="settings-section-title">{title}</div>
      <Card className="p-1">
        <div className="settings-list">{children}</div>
      </Card>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  sub,
  right,
  rightText,
  onClick,
  danger = false,
  disabled = false,
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`settings-row ${onClick ? 'is-actionable' : ''} ${
        danger ? 'is-danger' : ''
      } ${disabled ? 'is-disabled' : ''}`}
      disabled={disabled || !onClick}
    >
      <span
        className="settings-row-icon"
        style={
          danger
            ? { background: 'var(--danger-soft)', color: 'var(--danger)' }
            : undefined
        }
      >
        <Icon size={16} strokeWidth={2.2} />
      </span>
      <span className="flex-1 min-w-0 text-start">
        <span className="settings-row-label">{label}</span>
        {sub && <span className="settings-row-sub">{sub}</span>}
      </span>
      {right ? (
        <span className="flex-shrink-0">{right}</span>
      ) : rightText ? (
        <span className="text-sm font-semibold text-2 tabular-nums">{rightText}</span>
      ) : onClick ? (
        <ChevronRight size={16} className="text-3 icon-flip-rtl" />
      ) : null}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* Toggle + segmented switches                                                */
/* -------------------------------------------------------------------------- */

export function Toggle({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`toggle ${checked ? 'is-on' : ''}`}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

export function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`segmented-btn ${value === o.id ? 'is-active' : ''}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bottom sheet wrapper                                                       */
/* -------------------------------------------------------------------------- */

function SheetPicker({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-base font-semibold text-1">{title}</div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[58vh] overflow-y-auto -mx-1 px-1">{children}</div>
      </div>
    </div>
  );
}

/* Persona list ------------------------------------------------------------- */

function PersonaList({ current, onPick }) {
  const { t, lang } = useLang();
  return (
    <div className="space-y-2">
      {ROLES.map((r) => {
        const Icon = getIcon(r.icon);
        const active = current === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(r.id)}
            className="settings-persona-row"
            style={{
              borderColor: active ? 'var(--brand-500)' : 'var(--border)',
              boxShadow: active ? '0 0 0 3px rgba(57,97,251,0.18)' : 'none',
              background: active
                ? `linear-gradient(180deg, ${r.accent[0]}14, transparent)`
                : 'var(--surface)',
            }}
          >
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${r.accent[0]}, ${r.accent[1]})`,
              }}
            >
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <span className="flex-1 min-w-0 text-start">
              <span className="block text-sm font-semibold text-1 truncate">
                {t(`role.${r.id}.name`)}
              </span>
              <span className="block text-xs text-3 truncate">
                {t(`role.${r.id}.tagline`)}
              </span>
            </span>
            {active && (
              <span className="text-[var(--brand-500)] flex-shrink-0">
                <Check size={18} strokeWidth={2.4} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* Currency list ------------------------------------------------------------ */

function CurrencyList({ current, onPick }) {
  const { lang } = useLang();
  return (
    <div className="space-y-1">
      {Object.values(CURRENCIES).map((c) => {
        const active = current === c.code;
        const label = lang === 'ar' && c.labelAr ? c.labelAr : c.label;
        return (
          <button
            key={c.code}
            type="button"
            onClick={() => onPick(c.code)}
            className="settings-row is-actionable"
            style={{
              background: active ? 'var(--brand-50)' : 'transparent',
              border: '1px solid transparent',
              borderColor: active ? 'var(--brand-500)' : 'transparent',
            }}
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
              style={{ background: 'var(--gradient-brand)' }}
            >
              {c.code === 'JOD' ? 'JD' : c.symbol}
            </span>
            <span className="flex-1 min-w-0 text-start">
              <span className="block text-sm font-semibold text-1">{c.code}</span>
              <span className="block text-xs text-3 truncate">{label}</span>
            </span>
            {active && (
              <Check size={16} className="text-[var(--brand-500)]" strokeWidth={2.4} />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* Monthly income form ------------------------------------------------------ */

function MonthlyIncomeForm({ initial, currency, onSave }) {
  const { t } = useLang();
  const [value, setValue] = useState(initial ? String(initial) : '');
  const cur = CURRENCIES[currency] || CURRENCIES.USD;
  const symbol = cur.code === 'JOD' ? 'JD' : cur.symbol;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseFloat(value);
        if (!isNaN(n) && n >= 0) onSave(n);
      }}
      className="space-y-3"
    >
      <label className="block">
        <span className="text-xs font-semibold text-2 uppercase tracking-wide">
          {t('addSheet.amount')} ({symbol})
        </span>
        <input
          type="number"
          step="any"
          inputMode="decimal"
          placeholder="0.00"
          className="input mt-1.5"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      </label>
      <p className="text-xs text-3 leading-relaxed">
        {t('settings.monthlyIncomeSub')}
      </p>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" disabled={!value}>
          <Check size={16} strokeWidth={2.4} /> {t('common.save')}
        </Button>
      </div>
    </form>
  );
}

/* Reset confirmation ------------------------------------------------------- */

function ResetConfirm({ onClose, onConfirm }) {
  const { t } = useLang();
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}
          >
            <AlertTriangle size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-1">
              {t('settings.resetConfirmTitle')}
            </div>
            <p className="text-sm text-3 mt-1 leading-relaxed">
              {t('settings.resetConfirmBody')}
            </p>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn"
            style={{
              background: 'var(--danger)',
              color: '#fff',
              borderColor: 'var(--danger)',
            }}
          >
            <RefreshCw size={16} strokeWidth={2.4} /> {t('settings.resetConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
