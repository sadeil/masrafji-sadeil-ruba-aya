import { Logo, Wordmark } from './Brand.jsx';
import { useLang } from '../i18n.jsx';

/**
 * Phone frame wrapper.
 *
 *  - On large viewports (≥ 900px wide): shows the app inside a realistic
 *    iPhone-shaped device frame, centred on a soft gradient backdrop.
 *  - On small viewports: renders edge-to-edge as a real mobile app.
 *
 * The phone screen scrolls *inside* the frame; the page itself doesn't.
 */
export function PhoneFrame({ children }) {
  return (
    <div className="phone-stage">
      <div className="phone-stage-bg" aria-hidden="true">
        <div className="aurora-orb aurora-1" />
        <div className="aurora-orb aurora-2" />
        <div className="aurora-orb aurora-3" />
      </div>
      <div className="phone-stage-side">
        <PhoneSideCard />
      </div>
      <div className="phone-frame">
        <div className="phone-bezel">
          <div className="phone-notch" aria-hidden="true" />
          <div className="phone-screen">{children}</div>
          <div className="phone-home-indicator" aria-hidden="true" />
        </div>
      </div>
      <div className="phone-stage-side phone-stage-side--right">
        {/* Mirror for visual balance only on very wide screens */}
      </div>
    </div>
  );
}

function PhoneSideCard() {
  const { t, lang } = useLang();
  return (
    <div className="phone-side-card">
      <div className="flex items-center gap-3 mb-5">
        <Logo size={44} />
        <Wordmark size="lg" />
      </div>
      <h2 className="phone-side-title">
        {lang === 'ar' ? 'محفظتك الذكية' : 'Your smart wallet'}
      </h2>
      <p className="phone-side-body">
        {lang === 'ar'
          ? 'مصرفجي — رفيقك المالي اليومي. اختر نمطك، حدد هدفك، وتابع فلوسك بكل وضوح.'
          : 'Masrafji is the friendly money companion — pick your lifestyle, set a goal, and stay in control of every shekel, dinar and dollar.'}
      </p>

      <div className="phone-side-feature-list">
        <SideFeature
          title={lang === 'ar' ? 'لوحات شخصية' : 'Personalised dashboards'}
          body={lang === 'ar' ? 'لوحة مختلفة لكل نمط حياة' : 'A different dashboard for every lifestyle'}
        />
        <SideFeature
          title={lang === 'ar' ? 'عربي وإنجليزي' : 'Arabic & English'}
          body={lang === 'ar' ? 'بدلوا اللغة في أي وقت' : 'Switch the whole app at any time'}
        />
        <SideFeature
          title={lang === 'ar' ? 'بياناتك معك' : 'Your data, on-device'}
          body={lang === 'ar' ? 'لا نبيع أبداً معلوماتك' : 'We never sell your information'}
        />
      </div>

      <div className="phone-side-hint">
        {lang === 'ar' ? '←  جرّب التطبيق على الجهاز' : 'Try the live app →'}
      </div>
    </div>
  );
}

function SideFeature({ title, body }) {
  return (
    <div className="phone-side-feature">
      <div className="phone-side-feature-dot" />
      <div>
        <div className="phone-side-feature-title">{title}</div>
        <div className="phone-side-feature-body">{body}</div>
      </div>
    </div>
  );
}
