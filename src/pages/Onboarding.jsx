import { useState } from 'react';
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
  const [step, setStep] = useState(roleId ? (goalId ? 3 : 2) : 1);

  const [pendingRole, setPendingRole] = useState(roleId || null);
  const [pendingGoal, setPendingGoal] = useState(goalId || null);
  const [pendingIncome, setPendingIncome] = useState(incomeType || null);

  const goNext = () => {
    if (step === 1) {
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

      {/* Step indicator */}
      <div className="onboarding-stepper">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`step-dot ${n === step ? 'is-active' : n < step ? 'is-done' : ''}`}
          />
        ))}
      </div>

      <div className="onboarding-content">
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
            selected={pendingIncome}
            onSelect={setPendingIncome}
          />
        )}
      </div>

      {/* Bottom action bar */}
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
          {t('onboarding.step')} {step} {t('onboarding.of')} 3
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

function Step3Income({ t, lang, selected, onSelect }) {
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
        {INCOME_TYPES.map((it) => {
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
