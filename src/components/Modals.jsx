import { useEffect, useRef, useState } from 'react';
import {
  X,
  Plus,
  Wallet,
  TrendingUp,
  FileText,
  Target,
  Check,
  ArrowRight,
  Mic,
  Loader2,
  ScanLine,
  ChefHat,
  Clock,
  Sparkles,
  Tag,
  PiggyBank,
} from 'lucide-react';
import { ROLES, ROLE_BY_ID } from '../data.js';
import { Button, Chip } from './UI.jsx';
import { getIcon } from './Icons.jsx';
import { useLang } from '../i18n.jsx';
import { fmtMoney } from '../format.js';
import { readReceiptImageSafe } from '../visionLLM.js';

/* -------------------------------------------------------------------------- */
/* Voice-to-Expense — Web Speech API + LLM parser                             */
/* -------------------------------------------------------------------------- */

// LLM credentials are read from .env.local via Vite's import.meta.env.
// Default endpoint follows the OpenAI-compatible Chat Completions schema
// (works with OpenAI, Groq, OpenRouter, Together, etc.).
const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const LLM_API_URL = ENV.VITE_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
const LLM_API_KEY = ENV.VITE_LLM_API_KEY || '';
const LLM_MODEL = ENV.VITE_LLM_MODEL || 'gpt-4o-mini';

// Demo voice payload — single tap on the mic plays a fake listening + parsing
// sequence and fills the form with this. Bulletproof for the pitch — no mic
// permission, no LLM call, no network. Works every time.
const VOICE_MOCK = {
  amount: 9,
  category: 'Eating out',
  description: 'Coffee',
  descriptionAr: 'قهوة',
};

const VOICE_PROMPT = `You are a strict JSON extractor for a personal-finance app.
Given a short user utterance (English or Arabic) describing a single expense,
output ONLY a JSON object exactly of this shape — no commentary, no markdown:
{ "amount": <number>, "category": <string>, "description": <string> }
Rules:
- amount: positive number, no currency symbol or units.
- category: one short label, ideally from this hint list:
  Groceries, Dining, Transport, Utilities, Health, Children,
  Entertainment, Shopping, Rent, Subscriptions, Other.
- description: a brief human label (<= 40 chars) summarising the expense.`;

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function extractJson(text) {
  if (!text) return null;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  return JSON.parse(candidate.slice(start, end + 1));
}

async function parseTranscriptWithLLM(transcript, lang) {
  const res = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0,
      messages: [
        { role: 'system', content: VOICE_PROMPT },
        { role: 'user', content: `Language: ${lang}\nUtterance: "${transcript}"` },
      ],
    }),
  });
  if (!res.ok) throw new Error('LLM HTTP ' + res.status);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? '';
  const parsed = extractJson(raw);
  if (!parsed) throw new Error('LLM returned no JSON');
  return {
    amount: Number(parsed.amount) || 0,
    category: String(parsed.category || ''),
    description: String(parsed.description || ''),
  };
}

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

export function AddSheet({
  initialType = 'expense',
  autoScanReceipt = false,
  autoVoice = false,
  autoFocusName = false,
  onClose,
  onSubmit,
}) {
  const { t, lang } = useLang();
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');

  // Voice state: 'idle' | 'listening' | 'processing' | 'success' | 'error'
  const [voiceState, setVoiceState] = useState('idle');
  const [voiceMessage, setVoiceMessage] = useState('');
  const recognitionRef = useRef(null);
  const clickTimerRef = useRef(null);

  // Smart Receipt state
  // 'idle' | 'processing' | 'done' | 'error'
  const [scanState, setScanState] = useState('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [recipeSource, setRecipeSource] = useState(null); // 'live' | 'mock'
  const fileInputRef = useRef(null);
  const scanTimerRef = useRef(null);

  const config = ADD_TYPES.find((x) => x.id === type) || ADD_TYPES[0];
  const Icon = config.icon;

  useEffect(() => () => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    try { recognitionRef.current?.stop?.(); } catch { /* noop */ }
  }, []);

  // Auto-trigger the file picker when AddSheet was opened from the Smart
  // Receipt CTA (e.g. from the Uni dashboard alert).
  useEffect(() => {
    if (!autoScanReceipt) return;
    const id = setTimeout(() => fileInputRef.current?.click(), 80);
    return () => clearTimeout(id);
  }, [autoScanReceipt]);

  // Auto-start voice capture when opened from the AI Logger voice chip.
  useEffect(() => {
    if (!autoVoice) return;
    const id = setTimeout(() => startVoice(), 120);
    return () => clearTimeout(id);
  }, [autoVoice]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus the description field when opened from the SMS/Email paste chip.
  const nameInputRef = useRef(null);
  useEffect(() => {
    if (!autoFocusName) return;
    const id = setTimeout(() => nameInputRef.current?.focus(), 120);
    return () => clearTimeout(id);
  }, [autoFocusName]);

  function applyParsed({ amount: amt, category: cat, description }, viaMock) {
    if (amt != null && amt !== '') setAmount(String(amt));
    if (description) setName(description);
    if (cat) setCategory(cat);
    setVoiceState('success');
    setVoiceMessage(t(viaMock ? 'addSheet.voiceFilledDemo' : 'addSheet.voiceFilled'));
  }

  function startVoice() {
    const SR = getSpeechRecognition();
    if (!SR) {
      setVoiceState('error');
      setVoiceMessage(t('addSheet.voiceUnsupported'));
      return;
    }
    if (voiceState === 'listening') {
      try { recognitionRef.current?.stop?.(); } catch { /* noop */ }
      return;
    }
    try {
      const rec = new SR();
      rec.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = async (ev) => {
        const transcript = ev.results?.[0]?.[0]?.transcript || '';
        if (!transcript) {
          setVoiceState('error');
          setVoiceMessage(t('addSheet.voiceErrorParse'));
          return;
        }
        setVoiceState('processing');
        setVoiceMessage(t('addSheet.voiceProcessing'));
        try {
          const parsed = await parseTranscriptWithLLM(transcript, lang);
          applyParsed(parsed, false);
        } catch {
          setVoiceState('error');
          setVoiceMessage(t('addSheet.voiceErrorParse'));
        }
      };
      rec.onerror = (ev) => {
        const code = ev?.error || 'unknown';
        // 'aborted' = we stopped it ourselves (e.g. demo double-click) — not a real failure.
        if (code === 'aborted') return;
        // eslint-disable-next-line no-console
        console.warn('[voice] SpeechRecognition error:', code, ev);
        setVoiceState('error');
        setVoiceMessage(`${t('addSheet.voiceErrorMic')} (${code})`);
      };
      rec.onend = () => {
        setVoiceState((s) => (s === 'listening' ? 'idle' : s));
      };
      rec.start();
      recognitionRef.current = rec;
      setVoiceState('listening');
      setVoiceMessage(t('addSheet.voiceListening'));
    } catch {
      setVoiceState('error');
      setVoiceMessage(t('addSheet.voiceErrorMic'));
    }
  }

  // DEMO MODE — single tap on the mic plays a believable listening +
  // parsing sequence, then fills the form with VOICE_MOCK. No real Web
  // Speech, no LLM call, no microphone permission. Bulletproof for the
  // pitch. Double-click still triggers the real speech recognition path
  // (kept available in case you want to demo live voice later).
  function handleMicClick() {
    if (voiceState === 'listening' || voiceState === 'processing') return;
    setVoiceState('listening');
    setVoiceMessage(t('addSheet.voiceListening'));
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setVoiceState('processing');
      setVoiceMessage(t('addSheet.voiceProcessing'));
      clickTimerRef.current = setTimeout(() => {
        const desc = lang === 'ar' ? VOICE_MOCK.descriptionAr : VOICE_MOCK.description;
        applyParsed({ ...VOICE_MOCK, description: desc }, true);
        clickTimerRef.current = null;
      }, 700);
    }, 1500);
  }

  function handleMicDoubleClick() {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    try { recognitionRef.current?.stop?.(); } catch { /* noop */ }
    setVoiceState('idle');
    startVoice();
  }

  // ── Smart Receipt — Vision LLM with mock fallback ────────────────────────
  function applyReceipt(receipt, source) {
    setAmount(String(receipt.amount ?? ''));
    // Bill type → "Bills" category, no recipes (irrelevant for utilities).
    // Expense type → "Groceries" category + recipe suggestions.
    setCategory(type === 'bill' ? 'Bills' : 'Groceries');
    setRecipes(type === 'bill' ? [] : (Array.isArray(receipt.recipes) ? receipt.recipes : []));
    setRecipeSource(source);
    setScanState('done');
    setScanMessage(t(source === 'mock' ? 'addSheet.scanFilledDemo' : 'addSheet.scanFilled'));
  }

  async function runScan(file, { forceMock = false } = {}) {
    setScanState('processing');
    setScanMessage(t('addSheet.scanProcessing'));
    try {
      const { receipt, source } = await readReceiptImageSafe(file, lang, { forceMock });
      applyReceipt(receipt, source);
    } catch {
      setScanState('error');
      setScanMessage(t('addSheet.scanError'));
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    runScan(file, { forceMock: false });
  }

  // Plain click → file picker (deferred 220 ms so a double-click can preempt).
  // Shift-click OR double-click → hidden demo fallback (mock data, no network).
  function handleScanClick(e) {
    if (e.shiftKey) {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
      runScan(null, { forceMock: true });
      return;
    }
    if (scanTimerRef.current) return;
    scanTimerRef.current = setTimeout(() => {
      scanTimerRef.current = null;
      fileInputRef.current?.click();
    }, 220);
  }

  function handleScanDoubleClick() {
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    scanTimerRef.current = null;
    runScan(null, { forceMock: true });
  }

  const scanClass =
    'voice-mic' +
    (scanState === 'processing' ? ' is-processing' : '');

  const micClass =
    'voice-mic' +
    (voiceState === 'listening' ? ' is-listening' : '') +
    (voiceState === 'processing' ? ' is-processing' : '');

  const statusClass =
    'voice-mic-status' +
    (voiceState === 'listening' ? ' is-listening' : '') +
    (voiceState === 'error' ? ' is-error' : '') +
    (voiceState === 'success' ? ' is-success' : '');

  const statusText =
    voiceState === 'idle' ? t('addSheet.voiceStart') : voiceMessage;

  function submit(e) {
    e.preventDefault();
    onSubmit?.({ type, amount: parseFloat(amount) || 0, name, note, category });
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
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className={micClass}
            onClick={handleMicClick}
            onDoubleClick={handleMicDoubleClick}
            aria-label={t('addSheet.voiceStart')}
            aria-pressed={voiceState === 'listening'}
            disabled={voiceState === 'processing'}
          >
            {voiceState === 'processing' ? (
              <Loader2 size={18} strokeWidth={2.2} />
            ) : (
              <Mic size={18} strokeWidth={2.2} />
            )}
          </button>

          {(type === 'expense' || type === 'bill') && (
            <button
              type="button"
              className={scanClass}
              onClick={handleScanClick}
              onDoubleClick={handleScanDoubleClick}
              aria-label={t('addSheet.scanReceipt')}
              disabled={scanState === 'processing'}
              title={t('addSheet.scanHint')}
            >
              {scanState === 'processing' ? (
                <Loader2 size={18} strokeWidth={2.2} />
              ) : (
                <ScanLine size={18} strokeWidth={2.2} />
              )}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <span className={statusClass} role="status" aria-live="polite">
            {scanState !== 'idle' ? scanMessage : statusText}
          </span>
        </div>

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
            ref={nameInputRef}
            className="input mt-1"
            placeholder={t(config.nameHintKey)}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {category && (
            <div className="mt-2 flex items-center gap-1.5">
              <Chip tone="brand">{category}</Chip>
              <button
                type="button"
                className="btn-icon"
                style={{ width: 22, height: 22 }}
                onClick={() => setCategory('')}
                aria-label={t('common.close')}
              >
                <X size={12} />
              </button>
            </div>
          )}
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

        {recipes.length > 0 && (
          <div className="recipes-card" role="region" aria-label={t('addSheet.recipesTitle')}>
            <div className="recipes-head">
              <span className="recipes-icon"><ChefHat size={16} strokeWidth={2.2} /></span>
              <div className="flex-1 min-w-0">
                <div className="recipes-title">{t('addSheet.recipesTitle')}</div>
                <div className="recipes-sub">{t('addSheet.recipesSub')}</div>
              </div>
              {recipeSource && (
                <span
                  className={
                    'recipes-source-pill ' + (recipeSource === 'live' ? 'is-live' : 'is-mock')
                  }
                >
                  {recipeSource === 'live' ? t('addSheet.scanLive') : t('addSheet.scanDemo')}
                </span>
              )}
            </div>

            <ul className="recipes-list">
              {recipes.map((r, i) => (
                <li key={i} className="recipe-item">
                  <div className="recipe-item-head">
                    <span className="recipe-name">{r.name}</span>
                    {r.time && (
                      <span className="recipe-time">
                        <Clock size={11} strokeWidth={2.4} />
                        <span>{r.time}</span>
                      </span>
                    )}
                  </div>
                  {Array.isArray(r.ingredients) && r.ingredients.length > 0 && (
                    <div className="recipe-ingredients">
                      {r.ingredients.map((ing, j) => (
                        <span key={j} className="recipe-chip">{ing}</span>
                      ))}
                    </div>
                  )}
                  {(r.estimatedCost > 0 || r.savings > 0) && (
                    <div className="recipe-money-row">
                      {r.estimatedCost > 0 && (
                        <span className="recipe-cost-pill">
                          <Tag size={11} strokeWidth={2.4} />
                          <span>
                            {t('addSheet.recipeCost')} ~{fmtMoney(r.estimatedCost, 'USD')}
                          </span>
                        </span>
                      )}
                      {r.savings > 0 && (
                        <span className="recipe-savings-pill">
                          <PiggyBank size={11} strokeWidth={2.4} />
                          <span>
                            {t('addSheet.recipeSaves', {
                              amount: fmtMoney(r.savings, 'USD'),
                            })}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {(() => {
              const totalSavings = recipes.reduce((s, r) => s + (Number(r.savings) || 0), 0);
              const totalCost = recipes.reduce((s, r) => s + (Number(r.estimatedCost) || 0), 0);
              if (totalSavings <= 0) {
                return (
                  <div className="recipes-foot">
                    <Sparkles size={12} strokeWidth={2.4} className="opacity-70" />
                    <span>{t('addSheet.recipesFooter')}</span>
                  </div>
                );
              }
              return (
                <div className="recipes-savings-banner">
                  <PiggyBank size={16} strokeWidth={2.2} />
                  <div className="flex-1 min-w-0">
                    <div className="recipes-savings-title">
                      {t('addSheet.totalSavingsTitle', {
                        amount: fmtMoney(totalSavings, 'USD'),
                      })}
                    </div>
                    <div className="recipes-savings-sub">
                      {t('addSheet.totalSavingsSub', {
                        cost: fmtMoney(totalCost, 'USD'),
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
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
