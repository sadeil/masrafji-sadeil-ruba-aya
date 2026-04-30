import { useEffect, useState } from 'react';
import { X, Plus, Wallet, TrendingUp, FileText, Target, Check, ArrowRight } from 'lucide-react';
import { ROLES, ROLE_BY_ID } from '../data.js';
import { Button, Chip } from './UI.jsx';
import { getIcon } from './Icons.jsx';
import { useLang } from '../i18n.jsx';

function Backdrop({ onClose, children }) {
  useEffect(() => {
    const handle = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handle);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handle);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Add transaction / income / bill / goal                                     */
/* -------------------------------------------------------------------------- */

const ADD_TYPES = [
  {
    id: 'expense',
    icon: Wallet,
    color: '#ef4444',
    titleKey: 'addSheet.newExpense',
    descKey: 'addSheet.logExpense',
    saveKey: 'addSheet.saveExpense',
    typeLabelKey: 'addSheet.types.expense',
    nameLabelKey: 'addSheet.description',
    nameHintKey: 'addSheet.placeholderExpense',
  },
  {
    id: 'income',
    icon: TrendingUp,
    color: '#10b981',
    titleKey: 'addSheet.newIncome',
    descKey: 'addSheet.logIncome',
    saveKey: 'addSheet.saveIncome',
    typeLabelKey: 'addSheet.types.income',
    nameLabelKey: 'addSheet.source',
    nameHintKey: 'addSheet.placeholderIncome',
  },
  {
    id: 'bill',
    icon: FileText,
    color: '#3961fb',
    titleKey: 'addSheet.newBill',
    descKey: 'addSheet.trackBill',
    saveKey: 'addSheet.saveBill',
    typeLabelKey: 'addSheet.types.bill',
    nameLabelKey: 'addSheet.billName',
    nameHintKey: 'addSheet.placeholderBill',
  },
  {
    id: 'goal',
    icon: Target,
    color: '#7c3aed',
    titleKey: 'addSheet.newGoal',
    descKey: 'addSheet.planGoal',
    saveKey: 'addSheet.saveGoal',
    typeLabelKey: 'addSheet.types.goal',
    nameLabelKey: 'addSheet.goalName',
    nameHintKey: 'addSheet.placeholderGoal',
    amountLabelKey: 'addSheet.target',
  },
];

export function AddSheet({ initialType = 'expense', onClose, onSubmit }) {
  const { t } = useLang();
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const config = ADD_TYPES.find((x) => x.id === type) || ADD_TYPES[0];
  const Icon = config.icon;

  function submit(e) {
    e.preventDefault();
    onSubmit?.({ type, amount: parseFloat(amount) || 0, name, note });
    onClose();
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white"
            style={{ background: config.color }}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-base font-semibold text-1">{t(config.titleKey)}</div>
            <div className="text-xs text-3">{t(config.descKey)}</div>
          </div>
        </div>
        <button type="button" className="btn-icon" onClick={onClose} aria-label={t('common.close')}>
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {ADD_TYPES.map((tt) => {
          const TIcon = tt.icon;
          const active = tt.id === type;
          return (
            <button
              key={tt.id}
              type="button"
              onClick={() => setType(tt.id)}
              className="p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition"
              style={{
                borderColor: active ? tt.color : 'var(--border)',
                background: active ? `${tt.color}1a` : 'var(--surface-2)',
                color: active ? tt.color : 'var(--text-2)',
              }}
            >
              <TIcon size={16} strokeWidth={2.2} />
              <span className="text-[10px] font-semibold leading-tight text-center">
                {t(tt.typeLabelKey)}
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-2 uppercase tracking-wide">
            {config.amountLabelKey ? t(config.amountLabelKey) : t('addSheet.amount')}
          </span>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            className="input mt-1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-2 uppercase tracking-wide">
            {t(config.nameLabelKey)}
          </span>
          <input
            className="input mt-1"
            placeholder={t(config.nameHintKey)}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {type !== 'goal' && (
          <label className="block">
            <span className="text-xs font-semibold text-2 uppercase tracking-wide">
              {t('addSheet.note')}
            </span>
            <input
              className="input mt-1"
              placeholder={t('addSheet.optional')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={!amount}>
            <Plus size={16} strokeWidth={2.4} />
            {t(config.saveKey)}
          </Button>
        </div>
      </form>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Toast (super simple inline notification)                                   */
/* -------------------------------------------------------------------------- */

export function Toast({ message, onClose }) {
  useEffect(() => {
    const tm = setTimeout(onClose, 2400);
    return () => clearTimeout(tm);
  }, [onClose]);
  return (
    <div className="toast" role="status" aria-live="polite">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
      >
        <Check size={14} strokeWidth={2.5} />
      </div>
      <span className="text-1 truncate">{message}</span>
      <ArrowRight size={14} className="text-3 icon-flip-rtl flex-shrink-0" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Legacy SettingsSheet kept for backward compat (no longer rendered).        */
/* The full Settings page lives in `Settings.jsx` and is shown as a tab.      */
/* -------------------------------------------------------------------------- */

export function SettingsSheet({ roleId, onClose, onChangeRole }) {
  const { t } = useLang();
  const [picked, setPicked] = useState(roleId);
  const role = ROLE_BY_ID[picked];

  return (
    <Backdrop onClose={onClose}>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="text-base font-semibold text-1">{t('settings.changePersona')}</div>
          <div className="text-xs text-3">{t('settings.changePersonaSub')}</div>
        </div>
        <button type="button" className="btn-icon" onClick={onClose} aria-label={t('common.close')}>
          <X size={18} />
        </button>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {ROLES.map((r) => {
          const Icon = getIcon(r.icon);
          const active = picked === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setPicked(r.id)}
              className="settings-persona-row"
              style={{
                borderColor: active ? 'var(--brand-500)' : 'var(--border)',
                boxShadow: active ? '0 0 0 3px rgba(57,97,251,0.18)' : 'none',
              }}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${r.accent[0]}, ${r.accent[1]})` }}
              >
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <span className="flex-1 min-w-0 text-start">
                <span className="block text-sm font-semibold text-1 truncate">
                  {t(`role.${r.id}.name`)}
                </span>
                <span className="block text-[11px] text-3 truncate">
                  {t(`role.${r.id}.tagline`)}
                </span>
              </span>
              {active && <Chip tone="brand">{t('common.selected')}</Chip>}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
        <Button
          disabled={picked === roleId}
          onClick={() => {
            onChangeRole(picked);
            onClose();
          }}
        >
          <Check size={16} strokeWidth={2.4} />
          {t('common.apply')}
        </Button>
      </div>
    </Backdrop>
  );
}
