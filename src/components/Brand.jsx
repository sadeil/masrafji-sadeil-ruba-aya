import { useLang } from '../i18n.jsx';

/**
 * Masrafji · مصرفجي — premium brand mark.
 *
 * The logo is a rounded squircle with the brand gradient. Inside, a clean
 * stylised "M" — built from two ascending strokes — that doubles as an
 * upward growth sparkline, with a tiny coin/dot on the peak.
 *
 * The mark scales from 24px (favicon-ish) up to 96px (settings hero) and
 * stays crisp at every size by using viewBox-relative geometry.
 */
export function Logo({ size = 40, className = '', glow = true, tone = 'gradient' }) {
  const radius = Math.round(size * 0.28);

  return (
    <span
      className={`brand-logo ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        boxShadow: glow ? '0 10px 22px -10px rgba(57,97,251,0.55), 0 2px 6px rgba(57,97,251,0.18)' : 'none',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="masrafji-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5a86ff" />
            <stop offset="55%" stopColor="#3961fb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="masrafji-shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Squircle background */}
        <rect
          x="0"
          y="0"
          width="64"
          height="64"
          rx="18"
          ry="18"
          fill={tone === 'mono' ? 'currentColor' : 'url(#masrafji-bg)'}
        />

        {/* Top highlight for depth */}
        <rect
          x="0"
          y="0"
          width="64"
          height="64"
          rx="18"
          ry="18"
          fill="url(#masrafji-shine)"
          pointerEvents="none"
        />

        {/* Stylised "M" / upward sparkline. Mathematically symmetrical so it
            reads cleanly at any size. */}
        <path
          d="M14 46 L14 22 L24 36 L32 26 L40 36 L50 22 L50 46"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Coin / growth dot at the peak of the stroke */}
        <circle cx="32" cy="26" r="3" fill="#ffffff" />
      </svg>
    </span>
  );
}

/**
 * Wordmark — name + tagline, switches between English and Arabic typography.
 */
export function Wordmark({ size = 'md', showTagline = true, className = '' }) {
  const { t, lang } = useLang();
  const sizes = {
    xs: { name: 13, tag: 9 },
    sm: { name: 15, tag: 10 },
    md: { name: 18, tag: 11 },
    lg: { name: 22, tag: 12 },
    xl: { name: 28, tag: 13 },
  };
  const s = sizes[size] || sizes.md;
  return (
    <div className={`leading-tight ${className}`}>
      <div
        className="brand-wordmark-name"
        style={{
          fontSize: s.name,
          letterSpacing: lang === 'ar' ? '0' : '-0.022em',
          fontFamily:
            lang === 'ar'
              ? "'Tajawal', 'Noto Kufi Arabic', system-ui, sans-serif"
              : "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
        }}
      >
        {t('appName')}
      </div>
      {showTagline && (
        <div
          className="brand-wordmark-tag"
          style={{
            fontSize: s.tag,
            letterSpacing: lang === 'ar' ? '0' : '0.06em',
            textTransform: lang === 'ar' ? 'none' : 'uppercase',
            fontFamily:
              lang === 'ar'
                ? "'Tajawal', 'Noto Kufi Arabic', system-ui, sans-serif"
                : "'Inter', system-ui, sans-serif",
          }}
        >
          {t('tagline')}
        </div>
      )}
    </div>
  );
}

/**
 * Convenience: logo + wordmark in a flex row.
 */
export function BrandLockup({ size = 'md', showTagline = true, className = '' }) {
  const logoSizes = { xs: 24, sm: 30, md: 36, lg: 44, xl: 56 };
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={logoSizes[size] || 36} />
      <Wordmark size={size} showTagline={showTagline} />
    </div>
  );
}
