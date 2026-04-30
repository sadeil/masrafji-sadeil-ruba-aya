import { useEffect, useRef, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { getIcon } from './Icons.jsx';
import { useLang, useT } from '../i18n.jsx';

/**
 * Premium opening notification banner.
 *
 * - Slides in from the top of the phone screen.
 * - Auto-hides after `autoHideMs` (default 10s) with a thin progress bar.
 * - Pauses the timer while the user hovers / focuses inside it.
 * - Can be dismissed by tapping the close button.
 * - Optional action button calls `onAction` (which usually navigates to the
 *   relevant tab in the dashboard).
 *
 * Severity tones drive colour: info, success, warning, danger, brand.
 *
 * Containment: the banner uses `position: absolute` inside a wrapper that
 * is itself fixed/absolute relative to `.phone-screen`, so it can never
 * leak outside the device frame.
 */
export default function SmartNotification({
  notification,
  onAction,
  onDismiss,
  autoHideMs = 10_000,
}) {
  const { dir } = useLang();
  const t = useT();
  const [phase, setPhase] = useState('enter'); // enter | visible | leave | gone
  const [progress, setProgress] = useState(100);
  const startedAt = useRef(null);
  const elapsedBeforePause = useRef(0);
  const rafId = useRef(null);
  const hideTimer = useRef(null);
  const paused = useRef(false);

  const Icon = getIcon(notification?.icon || 'bell');
  const severity = notification?.severity || 'info';
  const ArrowIcon = dir === 'rtl' ? ArrowLeftLike : ArrowRight;
  const categoryLabel = notification?.category
    ? t(`notifCategory.${notification.category}`)
    : null;

  /* Mount → enter animation → visible → schedule auto-hide. */
  useEffect(() => {
    if (!notification) return undefined;
    setPhase('enter');
    const enterT = setTimeout(() => setPhase('visible'), 60);
    return () => clearTimeout(enterT);
  }, [notification]);

  /* Auto-hide timer + progress bar. */
  useEffect(() => {
    if (!notification) return undefined;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (paused.current) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      const now = performance.now();
      const total = elapsedBeforePause.current + (now - (startedAt.current ?? now));
      const remaining = Math.max(0, autoHideMs - total);
      setProgress((remaining / autoHideMs) * 100);
      if (remaining <= 0) {
        leave();
        return;
      }
      rafId.current = requestAnimationFrame(tick);
    };

    startedAt.current = performance.now();
    elapsedBeforePause.current = 0;
    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification?.id, autoHideMs]);

  function leave() {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    setPhase('leave');
    hideTimer.current = setTimeout(() => {
      setPhase('gone');
      onDismiss?.();
    }, 220);
  }

  function handlePauseStart() {
    if (paused.current) return;
    paused.current = true;
    elapsedBeforePause.current += performance.now() - (startedAt.current ?? performance.now());
  }

  function handlePauseEnd() {
    if (!paused.current) return;
    paused.current = false;
    startedAt.current = performance.now();
  }

  function handleAction() {
    onAction?.(notification);
    leave();
  }

  function handleDismiss() {
    leave();
  }

  if (!notification || phase === 'gone') return null;

  return (
    <div className="smart-notification-layer" aria-hidden={phase === 'leave'}>
      <div
        className={`smart-notification smart-notification--${severity} smart-notification--${phase} ${
          notification.shortcut ? 'smart-notification--shortcut' : ''
        }`}
        role="status"
        aria-live="polite"
        onMouseEnter={handlePauseStart}
        onMouseLeave={handlePauseEnd}
        onFocus={handlePauseStart}
        onBlur={handlePauseEnd}
      >
        <div className="smart-notification-icon" aria-hidden="true">
          <Icon size={18} strokeWidth={2.2} />
          <span className="smart-notification-icon-dot" aria-hidden="true" />
        </div>

        <div className="smart-notification-body">
          {categoryLabel && (
            <span className={`smart-notification-chip smart-notification-chip--${severity}`}>
              {categoryLabel}
            </span>
          )}
          <div className="smart-notification-title">{notification.title}</div>
          <div className="smart-notification-message">{notification.body}</div>
        </div>

        <div className="smart-notification-actions">
          {notification.action && onAction && (
            <button
              type="button"
              className="smart-notification-action"
              onClick={handleAction}
            >
              <span>{notification.action}</span>
              <ArrowIcon size={13} strokeWidth={2.4} />
            </button>
          )}
          <button
            type="button"
            className="smart-notification-close"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X size={14} strokeWidth={2.4} />
          </button>
        </div>

        <div className="smart-notification-progress" aria-hidden="true">
          <div
            className="smart-notification-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* Tiny shim so we don't have to import another lucide icon for RTL. */
function ArrowLeftLike(props) {
  return <ArrowRight {...props} style={{ transform: 'scaleX(-1)' }} />;
}
