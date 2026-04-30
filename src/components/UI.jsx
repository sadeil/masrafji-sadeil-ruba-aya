import { useEffect, useRef, useState } from 'react';
import {
  Moon,
  Sun,
  Check,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Bell,
  BellRing,
} from 'lucide-react';
import { CURRENCIES } from '../data.js';
import { fmtPct } from '../format.js';

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

export function Card({ className = '', glass = false, children, ...rest }) {
  return (
    <div className={`${glass ? 'card-glass' : 'card'} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`card-header ${className}`}>
      <div className="min-w-0">
        <h3 className="card-header-title">{title}</h3>
        {subtitle && <p className="card-header-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Button                                                                     */
/* -------------------------------------------------------------------------- */

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}) {
  const sizes = { sm: 'text-xs px-3 py-1.5', md: '', lg: 'text-base px-5 py-3' };
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${sizes[size] || ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, label, onClick, className = '', active = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`btn-icon ${className} ${active ? 'is-active' : ''}`}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Chip                                                                       */
/* -------------------------------------------------------------------------- */

export function Chip({ tone = 'default', className = '', children }) {
  const cls = tone === 'default' ? 'chip' : `chip chip-${tone}`;
  return <span className={`${cls} ${className}`}>{children}</span>;
}

export function DeltaChip({ value, suffix = '%', invert = false }) {
  if (value === 0 || value === null || value === undefined) {
    return (
      <span className="chip chip-info">
        <span className="dot" style={{ background: 'currentColor' }} />0{suffix}
      </span>
    );
  }
  const positive = invert ? value < 0 : value > 0;
  const Icon = value > 0 ? TrendingUp : TrendingDown;
  return (
    <span className={`chip ${positive ? 'chip-success' : 'chip-danger'}`}>
      <Icon size={12} strokeWidth={2.5} />
      {fmtPct(value, { sign: true })}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

export function Progress({ value, max = 100, tone = 'brand', className = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fillCls =
    tone === 'success'
      ? 'progress-fill-success'
      : tone === 'warning'
      ? 'progress-fill-warning'
      : tone === 'danger'
      ? 'progress-fill-danger'
      : '';
  return (
    <div className={`progress-track ${className}`}>
      <div className={`progress-fill ${fillCls}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Theme toggle                                                               */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Notification bell button                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Premium bell button with a live unread badge.
 *
 * - Pulses softly when there are unread items.
 * - Switches to a `BellRing` icon when unread > 0 for a cute animated cue.
 * - Renders a count badge (1–9, or "9+" beyond that).
 * - Uses the same `.btn-icon` base style so it lines up with siblings.
 */
export function NotifBell({ unreadCount = 0, onClick, label = 'Notifications', active = false }) {
  const has = unreadCount > 0;
  const Icon = has ? BellRing : Bell;
  const display = unreadCount > 9 ? '9+' : String(unreadCount);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`btn-icon notif-bell ${has ? 'has-unread' : ''} ${active ? 'is-active' : ''}`}
      aria-haspopup="dialog"
      aria-expanded={active}
    >
      <Icon size={18} strokeWidth={2} />
      {has && (
        <>
          <span className="notif-bell-pulse" aria-hidden="true" />
          <span className="notif-bell-badge" aria-hidden="true">
            {display}
          </span>
        </>
      )}
    </button>
  );
}

export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="btn-icon"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Currency picker                                                            */
/* -------------------------------------------------------------------------- */

export function CurrencyPicker({ value, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const cur = CURRENCIES[value] || CURRENCIES.USD;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-bold">{cur.symbol === 'JD' ? 'JD' : cur.symbol}</span>
        <span className="hidden sm:inline">{cur.code}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-2xl border bg-[var(--surface)] shadow-[var(--shadow-lift)] p-1.5 z-50"
          style={{ borderColor: 'var(--border)' }}
          role="listbox"
        >
          {Object.values(CURRENCIES).map((c) => {
            const selected = c.code === value;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-[var(--surface-2)] transition text-sm"
                role="option"
                aria-selected={selected}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px]"
                    style={{
                      background: selected ? 'var(--gradient-brand)' : 'var(--surface-2)',
                      color: selected ? '#fff' : 'var(--text-2)',
                    }}
                  >
                    {c.code === 'JOD' ? 'JD' : c.symbol}
                  </span>
                  <span className="flex flex-col items-start">
                    <span className="font-semibold text-1 leading-tight">{c.code}</span>
                    <span className="text-[11px] text-3 leading-tight">{c.label}</span>
                  </span>
                </span>
                {selected && <Check size={16} className="text-[var(--brand-500)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat card                                                                  */
/* -------------------------------------------------------------------------- */

export function StatCard({
  label,
  value,
  delta,
  sub,
  icon: Icon,
  feature = false,
  iconColor,
  iconBg,
  invertDelta = false,
}) {
  return (
    <div className={`stat-card ${feature ? 'stat-card-feature' : ''}`}>
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="min-w-0 flex-1">
          <div className="stat-label truncate">{label}</div>
          <div className="stat-value tabular-nums ltr-numbers mt-1">{value}</div>
        </div>
        {Icon && (
          <div
            className="stat-icon"
            style={{
              background: feature ? undefined : iconBg || 'var(--surface-2)',
              color: feature ? undefined : iconColor || 'var(--brand-600)',
            }}
          >
            <Icon size={16} strokeWidth={2.2} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 relative z-10">
        {sub ? (
          <div className={`stat-sub truncate ${feature ? 'text-white/75' : ''}`}>{sub}</div>
        ) : (
          <div />
        )}
        {delta !== undefined && delta !== null && (
          <DeltaChip value={delta} invert={invertDelta} />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6 gap-3">
      {Icon && (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
        >
          <Icon size={24} />
        </div>
      )}
      <div className="text-sm font-semibold text-1">{title}</div>
      {body && <div className="text-xs text-3 max-w-xs">{body}</div>}
      {action}
    </div>
  );
}
