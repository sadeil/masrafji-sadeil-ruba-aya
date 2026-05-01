import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Bell, BellRing, Check, CheckCheck, Sparkles, X } from 'lucide-react';
import { getIcon } from './Icons.jsx';
import { useLang, useT } from '../i18n.jsx';
import { formatRelativeShort, groupByDay } from '../notificationFeed.js';
import { generateAnomalyText } from '../anomalyLLM.js';

/**
 * Apple-style Notification Center.
 *
 * Slides in from the top of the phone screen, takes the full screen height
 * inside the frame, and shows the user's personalized inbox with filters,
 * date grouping, severity rails and inline actions.
 *
 * The component is fully controlled by the parent; this keeps unread/dismiss
 * persistence in one place (Dashboard) and lets the bell badge stay in sync.
 */
export default function NotificationCenter({
  open,
  feed,
  unreadIds,
  onClose,
  onMarkAllRead,
  onMarkRead,
  onDismiss,
  onAction,
  onSecondaryAction,
}) {
  const t = useT();
  const { dir } = useLang();
  const [filter, setFilter] = useState('all');
  const [phase, setPhase] = useState('closed'); // closed | enter | visible | leave
  const sheetRef = useRef(null);

  const FILTERS = useMemo(
    () => [
      { id: 'all', label: t('notifCenter.filterAll') },
      { id: 'unread', label: t('notifCenter.filterUnread') },
      { id: 'bills', label: t('notifCenter.filterBills') },
      { id: 'goals', label: t('notifCenter.filterGoals') },
      { id: 'budget', label: t('notifCenter.filterBudget') },
      { id: 'tips', label: t('notifCenter.filterTips') },
    ],
    [t],
  );

  /* ----- enter / leave animation orchestration ---------------------------- */
  useEffect(() => {
    if (open) {
      setPhase('enter');
      const id = setTimeout(() => setPhase('visible'), 30);
      return () => clearTimeout(id);
    }
    if (phase !== 'closed') {
      setPhase('leave');
      const id = setTimeout(() => setPhase('closed'), 240);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Close on Escape. */
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  /* Reset filter when reopened so users always start fresh. */
  useEffect(() => {
    if (open) setFilter('all');
  }, [open]);

  if (phase === 'closed') return null;

  const unreadCount = unreadIds?.size ?? 0;

  const visible = feed.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return unreadIds.has(n.id);
    return n.category === filter;
  });

  const groups = groupByDay(visible);

  return (
    <div
      className={`notif-center notif-center--${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('notifCenter.title')}
    >
      <div className="notif-center-backdrop" onClick={onClose} />

      <div className="notif-center-sheet" ref={sheetRef}>
        {/* Drag handle for visual affordance. */}
        <div className="notif-center-handle" aria-hidden="true" />

        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}
        <header className="notif-center-header">
          <div className="notif-center-title-block">
            <div className="notif-center-title-row">
              <div className="notif-center-title-icon" aria-hidden="true">
                {unreadCount > 0 ? (
                  <BellRing size={16} strokeWidth={2.2} />
                ) : (
                  <Bell size={16} strokeWidth={2.2} />
                )}
              </div>
              <h2 className="notif-center-title">{t('notifCenter.title')}</h2>
            </div>
            <div className="notif-center-subtitle">
              {unreadCount > 0
                ? t('notifCenter.unreadCount', { n: unreadCount })
                : t('notifCenter.allCaughtUp')}
            </div>
          </div>

          <div className="notif-center-header-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-center-mark-all"
                onClick={onMarkAllRead}
                aria-label={t('notifCenter.markAllRead')}
                title={t('notifCenter.markAllRead')}
              >
                <CheckCheck size={14} strokeWidth={2.4} />
                <span>{t('notifCenter.markAllRead')}</span>
              </button>
            )}
            <button
              type="button"
              className="notif-center-close"
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <X size={16} strokeWidth={2.4} />
            </button>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Filter tabs                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="notif-center-filters" role="tablist">
          {FILTERS.map((f) => {
            const isActive = filter === f.id;
            const count =
              f.id === 'all'
                ? feed.length
                : f.id === 'unread'
                ? unreadCount
                : feed.filter((n) => n.category === f.id).length;
            if (f.id !== 'all' && f.id !== 'unread' && count === 0) return null;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`notif-center-filter ${isActive ? 'is-active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                <span>{f.label}</span>
                {count > 0 && <span className="notif-center-filter-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* List                                                              */}
        {/* ---------------------------------------------------------------- */}
        <div className="notif-center-list" role="list">
          {visible.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <>
              {groups.today.length > 0 && (
                <Section label={t('notifCenter.groupToday')}>
                  {groups.today.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notif={n}
                      unread={unreadIds.has(n.id)}
                      dir={dir}
                      onMarkRead={onMarkRead}
                      onAction={onAction}
                      onSecondaryAction={onSecondaryAction}
                      onDismiss={onDismiss}
                    />
                  ))}
                </Section>
              )}
              {groups.yesterday.length > 0 && (
                <Section label={t('notifCenter.groupYesterday')}>
                  {groups.yesterday.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notif={n}
                      unread={unreadIds.has(n.id)}
                      dir={dir}
                      onMarkRead={onMarkRead}
                      onAction={onAction}
                      onSecondaryAction={onSecondaryAction}
                      onDismiss={onDismiss}
                    />
                  ))}
                </Section>
              )}
              {groups.earlier.length > 0 && (
                <Section label={t('notifCenter.groupEarlier')}>
                  {groups.earlier.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notif={n}
                      unread={unreadIds.has(n.id)}
                      dir={dir}
                      onMarkRead={onMarkRead}
                      onAction={onAction}
                      onSecondaryAction={onSecondaryAction}
                      onDismiss={onDismiss}
                    />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function Section({ label, children }) {
  return (
    <div className="notif-center-section">
      <div className="notif-center-section-label">{label}</div>
      <div className="notif-center-section-items">{children}</div>
    </div>
  );
}

function NotificationItem({ notif, unread, dir, onMarkRead, onAction, onSecondaryAction, onDismiss }) {
  const t = useT();
  const { lang } = useLang();
  const Icon = getIcon(notif.icon || 'bell');
  const ArrowIcon = dir === 'rtl' ? ArrowLeftLike : ArrowRight;

  // For AI-detected anomalies (duplicate / subscription), swap the static
  // copy with a Gemini-generated line that reads naturally in the user's
  // language (handles Arabic gender + grammar). Static text stays visible
  // until the LLM responds; if it fails, the static text stays.
  const [aiCopy, setAiCopy] = useState(null);
  useEffect(() => {
    if (!notif.anomalyKind || !notif.merchant || notif.amount == null) return;
    let cancelled = false;
    generateAnomalyText({
      kind: notif.anomalyKind,
      merchant: notif.merchant,
      amount: notif.amount,
      lang,
    })
      .then((out) => {
        if (!cancelled && out?.title && out?.body) setAiCopy(out);
      })
      .catch(() => { /* keep static fallback */ });
    return () => { cancelled = true; };
  }, [notif.anomalyKind, notif.merchant, notif.amount, lang]);

  const displayTitle = aiCopy?.title || notif.title;
  const displayBody = aiCopy?.body || notif.body;

  function handleAction() {
    onMarkRead?.(notif.id);
    onAction?.(notif);
  }

  function handleSecondary() {
    onMarkRead?.(notif.id);
    onSecondaryAction?.(notif);
  }

  function handleClick(e) {
    // Tap anywhere on the row marks as read (but not the dismiss button).
    if (e.target.closest('.notif-item-dismiss')) return;
    if (unread) onMarkRead?.(notif.id);
  }

  return (
    <article
      className={`notif-item notif-item--${notif.severity} ${unread ? 'is-unread' : ''}`}
      role="listitem"
      onClick={handleClick}
    >
      <div className="notif-item-rail" aria-hidden="true" />

      <div className="notif-item-icon" aria-hidden="true">
        <Icon size={16} strokeWidth={2.2} />
      </div>

      <div className="notif-item-body">
        <div className="notif-item-row">
          <h3 className="notif-item-title">{displayTitle}</h3>
          <div className="notif-item-meta">
            {unread && (
              <span
                className="notif-item-dot"
                aria-label={t('notifCenter.unreadDot')}
                title={t('notifCenter.unreadDot')}
              />
            )}
            <time className="notif-item-time">{formatRelativeShort(notif.time, t)}</time>
          </div>
        </div>
        <p className="notif-item-message">{displayBody}</p>

        {(notif.action || notif.secondaryAction) && (
          <div className="notif-item-actions-row">
            {notif.action && onAction && (
              <button
                type="button"
                className={`notif-item-action notif-item-action--${notif.severity}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction();
                }}
              >
                <span>{notif.action}</span>
                <ArrowIcon size={12} strokeWidth={2.6} />
              </button>
            )}
            {notif.secondaryAction && onSecondaryAction && (
              <button
                type="button"
                className="notif-item-action notif-item-action--ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSecondary();
                }}
              >
                <span>{notif.secondaryAction}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className="notif-item-dismiss"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss?.(notif.id);
        }}
        aria-label={t('notifCenter.dismiss')}
        title={t('notifCenter.dismiss')}
      >
        <X size={14} strokeWidth={2.4} />
      </button>
    </article>
  );
}

function EmptyState({ filter }) {
  const t = useT();
  if (filter === 'unread') {
    return (
      <div className="notif-center-empty">
        <div className="notif-center-empty-icon" aria-hidden="true">
          <Check size={22} strokeWidth={2.4} />
        </div>
        <div className="notif-center-empty-title">{t('notifCenter.allCaughtUp')}</div>
        <div className="notif-center-empty-body">{t('notifCenter.emptyBody')}</div>
      </div>
    );
  }
  if (filter === 'all') {
    return (
      <div className="notif-center-empty">
        <div className="notif-center-empty-icon" aria-hidden="true">
          <Sparkles size={22} strokeWidth={2.4} />
        </div>
        <div className="notif-center-empty-title">{t('notifCenter.empty')}</div>
        <div className="notif-center-empty-body">{t('notifCenter.emptyBody')}</div>
      </div>
    );
  }
  return (
    <div className="notif-center-empty">
      <div className="notif-center-empty-icon" aria-hidden="true">
        <Bell size={22} strokeWidth={2.4} />
      </div>
      <div className="notif-center-empty-title">{t('notifCenter.emptyFiltered')}</div>
      <div className="notif-center-empty-body">{t('notifCenter.emptyFilteredBody')}</div>
    </div>
  );
}

function ArrowLeftLike(props) {
  return <ArrowRight {...props} style={{ transform: 'scaleX(-1)' }} />;
}
