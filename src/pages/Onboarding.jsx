import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Compass,
  GraduationCap,
  Home,
  Rocket,
  Sparkles,
  Wallet,
  Check,
} from 'lucide-react';
import { Button, ThemeToggle } from '../components/UI.jsx';
import { ROLES, FINANCIAL_GOALS, INCOME_TYPES } from '../data.js';
import { Logo, Wordmark } from '../components/Brand.jsx';
import { useLang } from '../i18n.jsx';
import { getIcon } from '../components/Icons.jsx';

// Step layout:
//   0 → Welcome screen with a single "Begin" CTA
//   1 → Choose persona
//   2 → Choose financial goal
//   3 → Choose income type
const TOTAL_STEPS = 3;

const ROLE_ICON_MAP = {
  home: Home,
  briefcase: Briefcase,
  sparkles: Sparkles,
  'graduation-cap': GraduationCap,
  wallet: Wallet,
  rocket: Rocket,
  compass: Compass,
};

export default function Onboarding({
  theme,
  onToggleTheme,
  currency,
  onCurrencyChange,
  roleId,
  goalId,
  incomeType,
  onSelectRole,
  onSelectGoal,
  onSelectIncome,
}) {
  const { t, lang, setLang } = useLang();
  // Start at the welcome screen (step 0). If the user partially completed
  // the wizard before, jump straight to the first unanswered question.
  const [step, setStep] = useState(() => {
    if (roleId && !goalId) return 2;
    if (roleId && goalId && !incomeType) return 3;
    return 0;
  });

  const [pendingRole, setPendingRole] = useState(roleId || null);
  const [pendingGoal, setPendingGoal] = useState(goalId || null);
  const [pendingIncome, setPendingIncome] = useState(incomeType || null);

  const goNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (!pendingRole) return;
      onSelectRole(pendingRole);
      setStep(2);
    } else if (step === 2) {
      if (!pendingGoal) return;
      onSelectGoal(pendingGoal);
      setStep(3);
    } else if (step === 3) {
      if (!pendingIncome) return;
      onSelectIncome(pendingIncome);
      // App.jsx will detect all three are set and switch to dashboard
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isRTL = lang === 'ar';
  const isWelcome = step === 0;

  return (
    <div className="onboarding-shell">
      {/* Top bar with logo, language, theme */}
      <div className="onboarding-topbar">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <Wordmark size="sm" showTagline={false} />
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageToggle lang={lang} onChange={setLang} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>

      {/* Step indicator — hidden on the welcome screen */}
      {!isWelcome && (
        <div className="onboarding-stepper">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`step-dot ${n === step ? 'is-active' : n < step ? 'is-done' : ''}`}
            />
          ))}
        </div>
      )}

      <div className="onboarding-content">
        {step === 0 && (
          <Step0Welcome t={t} lang={lang} isRTL={isRTL} onBegin={goNext} />
        )}
        {step === 1 && (
          <Step1Roles
            t={t}
            lang={lang}
            selected={pendingRole}
            onSelect={setPendingRole}
          />
        )}
        {step === 2 && (
          <Step2Goal
            t={t}
            lang={lang}
            selected={pendingGoal}
            onSelect={setPendingGoal}
          />
        )}
        {step === 3 && (
          <Step3Income
            t={t}
            lang={lang}
            roleId={pendingRole}
            selected={pendingIncome}
            onSelect={setPendingIncome}
          />
        )}
      </div>

      {/* Bottom action bar — hidden on the welcome screen */}
      {!isWelcome && (
        <div className="onboarding-actions">
          {step > 1 ? (
            <button type="button" className="btn btn-ghost" onClick={goBack}>
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              <span>{t('common.back')}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="text-xs text-3 font-medium tabular-nums">
            {t('onboarding.step')} {step} {t('onboarding.of')} {TOTAL_STEPS}
          </div>

          <Button
            onClick={goNext}
            disabled={
              (step === 1 && !pendingRole) ||
              (step === 2 && !pendingGoal) ||
              (step === 3 && !pendingIncome)
            }
          >
            <span>{step === 3 ? t('onboarding.start') : t('common.continue')}</span>
            {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </Button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Language toggle pill                                                       */
/* -------------------------------------------------------------------------- */

function LanguageToggle({ lang, onChange }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button
        type="button"
        className={`lang-toggle-btn ${lang === 'en' ? 'is-active' : ''}`}
        onClick={() => onChange('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-toggle-btn ${lang === 'ar' ? 'is-active' : ''}`}
        onClick={() => onChange('ar')}
        aria-pressed={lang === 'ar'}
      >
        ع
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 0 — Welcome screen with the "Begin" CTA                               */
/* -------------------------------------------------------------------------- */

function Step0Welcome({ t, isRTL, onBegin }) {
  const features = [
    t('onboarding.welcomeFeature1'),
    t('onboarding.welcomeFeature2'),
    t('onboarding.welcomeFeature3'),
  ];
  return (
    <div className="welcome-screen">
      <div className="welcome-screen-art" aria-hidden="true">
        <Logo size={80} />
        <span className="welcome-screen-glow" />
      </div>

      <div className="welcome-screen-text">
        <div className="welcome-screen-tagline">
          <Sparkles size={12} strokeWidth={2.5} />
          <span>{t('onboarding.welcomeTagline')}</span>
        </div>
        <h1 className="welcome-screen-title">{t('onboarding.welcomeTitle')}</h1>
        <p className="welcome-screen-intro">{t('onboarding.welcomeIntro')}</p>
      </div>

      <ol className="welcome-screen-features">
        {features.map((label, i) => (
          <li key={label} className="welcome-screen-feature">
            <span className="welcome-screen-feature-num">{i + 1}</span>
            <span className="welcome-screen-feature-text">{label}</span>
          </li>
        ))}
      </ol>

      <div className="welcome-screen-cta">
        <Button onClick={onBegin} className="welcome-screen-button">
          <span>{t('onboarding.welcomeBegin')}</span>
          {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
        </Button>
        <div className="welcome-screen-meta">{t('onboarding.welcomeMeta')}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 1 — Persona / financial lifestyle                                     */
/* -------------------------------------------------------------------------- */

function Step1Roles({ t, lang, selected, onSelect }) {
  return (
    <>
      <div className="onboarding-hero">
        <div className="onboarding-eyebrow">
          <Sparkles size={12} strokeWidth={2.5} />
          <span>{t('common.welcome')}</span>
        </div>
        <h1 className="onboarding-title">{t('onboarding.step1Title')}</h1>
        <p className="onboarding-sub">{t('onboarding.step1Subtitle')}</p>
      </div>

      <div className="role-grid">
        {ROLES.map((r) => {
          const Icon = ROLE_ICON_MAP[r.icon] || Wallet;
          const isSelected = selected === r.id;
          const name = t(`role.${r.id}.name`);
          const tagline = t(`role.${r.id}.tagline`);
          const description = t(`role.${r.id}.description`);
          const examples = [
            t(`role.${r.id}.examples.0`),
            t(`role.${r.id}.examples.1`),
            t(`role.${r.id}.examples.2`),
          ];
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect(r.id)}
              className={`role-card ${isSelected ? 'is-selected' : ''}`}
              aria-pressed={isSelected}
            >
              <div className="role-card-head">
                <span
                  className="role-icon"
                  style={{
                    background: `linear-gradient(135deg, ${r.accent[0]}, ${r.accent[1]})`,
                  }}
                >
                  <Icon size={18} strokeWidth={2.2} />
                </span>
                {isSelected && (
                  <span className="role-card-check">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </div>
              <div className="role-card-body">
                <div className="role-card-name">{name}</div>
                <div className="role-card-tagline">{tagline}</div>
                <p className="role-card-desc">{description}</p>
              </div>
              <div className="role-card-examples">
                {examples
                  .filter((e) => e && !e.startsWith('role.'))
                  .map((ex) => (
                    <span key={ex} className="role-card-tag">
                      {ex}
                    </span>
                  ))}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 2 — Financial goal                                                    */
/* -------------------------------------------------------------------------- */

function Step2Goal({ t, lang, selected, onSelect }) {
  return (
    <>
      <div className="onboarding-hero">
        <div className="onboarding-eyebrow">
          <Wallet size={12} strokeWidth={2.5} />
          <span>{t('onboarding.step')} 2</span>
        </div>
        <h1 className="onboarding-title">{t('onboarding.step2Title')}</h1>
        <p className="onboarding-sub">{t('onboarding.step2Subtitle')}</p>
      </div>

      <div className="option-grid">
        {FINANCIAL_GOALS.map((g) => {
          const Icon = getIcon(g.icon);
          const isSelected = selected === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelect(g.id)}
              className={`option-card ${isSelected ? 'is-selected' : ''}`}
              aria-pressed={isSelected}
            >
              <span className="option-icon">
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <span className="option-label">{t(`goals.${g.id}`)}</span>
              {isSelected && (
                <span className="option-check">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 3 — Income type                                                       */
/* -------------------------------------------------------------------------- */

// Per-role allowed income types — keeps the list lifestyle-appropriate.
// School Student: only "allowance" (kids don't earn salaries).
// University Student: variable / allowance / multi / none.
// Employee: fixed-salary / variable / multi.
// Business / Freelancer: business / variable / multi.
// Family Parent / General: all.
const INCOME_TYPES_BY_ROLE = {
  'school-student': ['allowance'],
  'university-student': ['allowance', 'variable', 'multi', 'none'],
  employee: ['fixed-salary', 'variable', 'multi'],
  business: ['business', 'variable', 'multi'],
  freelancer: ['variable', 'business', 'multi'],
};

const DEFAULT_INCOME_BY_ROLE = {
  'school-student': 'allowance',
  'university-student': 'allowance',
  employee: 'fixed-salary',
  business: 'business',
  freelancer: 'variable',
  'family-parent': 'fixed-salary',
};

function Step3Income({ t, lang, roleId, selected, onSelect }) {
  // Auto-select a sensible default the first time this step renders for
  // a given role — the user can still tap to change it. Kids only see
  // "allowance" so this is essentially a confirmation step for them.
  useEffect(() => {
    if (selected) return;
    const def = DEFAULT_INCOME_BY_ROLE[roleId];
    if (def) onSelect(def);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId]);

  const allowedIds = INCOME_TYPES_BY_ROLE[roleId];
  const visibleTypes = allowedIds
    ? INCOME_TYPES.filter((it) => allowedIds.includes(it.id))
    : INCOME_TYPES;
  return (
    <>
      <div className="onboarding-hero">
        <div className="onboarding-eyebrow">
          <Sparkles size={12} strokeWidth={2.5} />
          <span>{t('onboarding.step')} 3</span>
        </div>
        <h1 className="onboarding-title">{t('onboarding.step3Title')}</h1>
        <p className="onboarding-sub">{t('onboarding.step3Subtitle')}</p>
      </div>

      <div className="option-grid">
        {visibleTypes.map((it) => {
          const Icon = getIcon(it.icon);
          const isSelected = selected === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onSelect(it.id)}
              className={`option-card ${isSelected ? 'is-selected' : ''}`}
              aria-pressed={isSelected}
            >
              <span className="option-icon">
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <span className="option-label">{t(`incomeTypes.${it.id}`)}</span>
              {isSelected && (
                <span className="option-check">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="onboarding-privacy">{t('onboarding.privacy')}</p>
    </>
  );
}
