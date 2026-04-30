import { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RefreshCw,
  Mic,
  Send,
  Coffee,
  Utensils,
  ShoppingCart,
  Car,
  Zap,
  Home,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import { useLang } from '../i18n.jsx';
import {
  getCoachSummarySafe,
  getMockChatReply,
  chatWithCoach,
  speakSafe,
  speakWithBrowserOnly,
  cancelSpeaking,
  LLM_API_KEY,
} from '../aiCoach.js';

const TIP_ICONS = {
  coffee: Coffee,
  utensils: Utensils,
  'shopping-cart': ShoppingCart,
  car: Car,
  zap: Zap,
  home: Home,
  'piggy-bank': PiggyBank,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  sparkles: Sparkles,
};

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function AICoach({ role, transactions = [] }) {
  const { t, lang } = useLang();

  // Summary state
  const [summary, setSummary] = useState(null);
  const [source, setSource] = useState(null); // 'live' | 'mock' | null
  const [generating, setGenerating] = useState(false);

  // Playback state
  const [speaking, setSpeaking] = useState(false);
  const speakingRef = useRef(false);
  const audioRef = useRef(null);

  // Conversation state
  const [chatLog, setChatLog] = useState([]); // [{ role: 'user'|'coach', text }]
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [askVoiceState, setAskVoiceState] = useState('idle'); // idle|listening|processing|error
  const [askError, setAskError] = useState('');
  const recognitionRef = useRef(null);
  const askClickTimerRef = useRef(null);
  const playClickTimerRef = useRef(null);
  const generateClickTimerRef = useRef(null);
  const chatLogRef = useRef(null);
  const mockTurnRef = useRef(0);

  useEffect(() => () => {
    cancelSpeaking();
    try { recognitionRef.current?.stop?.(); } catch { /* noop */ }
    [askClickTimerRef, playClickTimerRef, generateClickTimerRef].forEach((r) => {
      if (r.current) clearTimeout(r.current);
    });
  }, []);

  useEffect(() => {
    // Auto-scroll the chat log to the bottom on new messages.
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatLog.length]);

  // ── Generate / refresh summary ────────────────────────────────────────────
  async function runGenerate(forceMock = false) {
    if (generating) return;
    setGenerating(true);
    try {
      const { summary: s, source: src } = await getCoachSummarySafe({
        role,
        transactions,
        lang,
        forceMock,
      });
      setSummary(s);
      setSource(src);
    } finally {
      setGenerating(false);
    }
  }

  function handleGenerateClick() {
    if (generateClickTimerRef.current) return;
    generateClickTimerRef.current = setTimeout(() => {
      generateClickTimerRef.current = null;
      runGenerate(false);
    }, 230);
  }

  function handleGenerateDoubleClick() {
    if (generateClickTimerRef.current) {
      clearTimeout(generateClickTimerRef.current);
      generateClickTimerRef.current = null;
    }
    runGenerate(true);
  }

  // ── Play / pause spoken summary ───────────────────────────────────────────
  async function runPlay({ forceBrowser = false } = {}) {
    if (!summary?.spoken) return;
    if (speakingRef.current) {
      cancelSpeaking();
      speakingRef.current = false;
      setSpeaking(false);
      return;
    }
    speakingRef.current = true;
    setSpeaking(true);
    try {
      // forceBrowser = double-click escape hatch → skip ElevenLabs entirely
      // and fall straight to native speechSynthesis (no network).
      const handle = forceBrowser
        ? speakWithBrowserOnly(summary.spoken, lang)
        : await speakSafe(summary.spoken, lang);
      audioRef.current = handle.audio || null;
      await handle.finished;
    } catch {
      /* ignore; UI just resets below */
    } finally {
      speakingRef.current = false;
      setSpeaking(false);
      audioRef.current = null;
    }
  }

  function handlePlayClick() {
    if (playClickTimerRef.current) return;
    // If already speaking, pause immediately (no defer needed — it's a stop, not a fire).
    if (speakingRef.current) {
      cancelSpeaking();
      speakingRef.current = false;
      setSpeaking(false);
      return;
    }
    playClickTimerRef.current = setTimeout(() => {
      playClickTimerRef.current = null;
      runPlay({ forceBrowser: false });
    }, 230);
  }

  function handlePlayDoubleClick() {
    if (playClickTimerRef.current) {
      clearTimeout(playClickTimerRef.current);
      playClickTimerRef.current = null;
    }
    cancelSpeaking();
    speakingRef.current = false;
    setSpeaking(false);
    // Defer one tick so React processes the cancel before we kick off again.
    setTimeout(() => runPlay({ forceBrowser: true }), 60);
  }

  // ── Conversational mode ───────────────────────────────────────────────────
  async function sendChat(userText, { forceMock = false } = {}) {
    const text = (userText || '').trim();
    if (!text || chatBusy) return;
    setChatLog((log) => [...log, { role: 'user', text }]);
    setChatInput('');
    setChatBusy(true);
    setAskError('');
    try {
      let reply;
      let spoken;
      if (forceMock || !LLM_API_KEY) {
        const mock = getMockChatReply(lang, mockTurnRef.current++);
        reply = mock.reply;
        spoken = mock.spoken;
      } else {
        const out = await chatWithCoach({
          role,
          transactions,
          lang,
          history: chatLog.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text })),
          userText: text,
        });
        reply = out.reply;
        spoken = out.spoken;
      }
      setChatLog((log) => [...log, { role: 'coach', text: reply }]);
      // Speak the reply (best-effort; fall back to browser TTS automatically).
      speakingRef.current = true;
      setSpeaking(true);
      try {
        const handle = await speakSafe(spoken, lang);
        audioRef.current = handle.audio || null;
        await handle.finished;
      } catch { /* noop */ }
      speakingRef.current = false;
      setSpeaking(false);
      audioRef.current = null;
    } catch {
      setAskError(t('coach.askErrorReply'));
    } finally {
      setChatBusy(false);
    }
  }

  // ── Voice input for the chat box ──────────────────────────────────────────
  function startAskMic() {
    const SR = getSpeechRecognition();
    if (!SR) {
      setAskError(t('coach.askErrorMic'));
      setAskVoiceState('error');
      return;
    }
    if (askVoiceState === 'listening') {
      try { recognitionRef.current?.stop?.(); } catch { /* noop */ }
      return;
    }
    try {
      const rec = new SR();
      rec.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (ev) => {
        const transcript = ev.results?.[0]?.[0]?.transcript || '';
        if (transcript) sendChat(transcript, { forceMock: false });
      };
      rec.onerror = (ev) => {
        const code = ev?.error || 'unknown';
        // 'aborted' = self-cancel (e.g. demo double-click); silent.
        if (code === 'aborted') return;
        // eslint-disable-next-line no-console
        console.warn('[coach] SpeechRecognition error:', code, ev);
        setAskVoiceState('error');
        setAskError(`${t('coach.askErrorMic')} (${code})`);
      };
      rec.onend = () => {
        setAskVoiceState((s) => (s === 'listening' ? 'idle' : s));
      };
      rec.start();
      recognitionRef.current = rec;
      setAskVoiceState('listening');
      setAskError('');
    } catch {
      setAskError(t('coach.askErrorMic'));
      setAskVoiceState('error');
    }
  }

  function handleAskMicClick() {
    // Synchronous start preserves the user-gesture context Chrome requires.
    startAskMic();
  }

  function handleAskMicDoubleClick() {
    try { recognitionRef.current?.stop?.(); } catch { /* noop */ }
    // Hidden demo: skip mic + LLM, push a canned exchange.
    const seed = lang === 'ar' ? 'وين عم تتسرّب فلوسي؟' : 'Where am I leaking money?';
    sendChat(seed, { forceMock: true });
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendChat(chatInput);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const playLabel = speaking ? t('coach.pause') : t('coach.play');

  return (
    <section className="coach-card" aria-label={t('coach.title')}>
      <header className="coach-head">
        <span className="coach-avatar"><Sparkles size={20} strokeWidth={2.2} /></span>
        <div className="flex-1 min-w-0">
          <div className="coach-title">{t('coach.title')}</div>
          <div className="coach-subtitle">{t('coach.subtitle')}</div>
        </div>
        {source && (
          <span className={`coach-source-pill ${source === 'live' ? 'is-live' : 'is-mock'}`}>
            {source === 'live' ? t('coach.sourceLive') : t('coach.sourceMock')}
          </span>
        )}
      </header>

      {!summary && !generating && (
        <div className="coach-empty">{t('coach.askEmpty')}</div>
      )}

      {summary && (
        <>
          <h3 className="coach-headline">{summary.headline}</h3>
          {summary.body && <p className="coach-body">{summary.body}</p>}

          {Array.isArray(summary.tips) && summary.tips.length > 0 && (
            <div className="coach-tips" aria-label={t('coach.tipsTitle')}>
              {summary.tips.map((tip, i) => {
                const Icon = TIP_ICONS[tip.icon] || Sparkles;
                return (
                  <div key={i} className="coach-tip">
                    <span className="coach-tip-icon">
                      <Icon size={15} strokeWidth={2.2} />
                    </span>
                    <span className="coach-tip-text">{tip.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="coach-actions">
        <button
          type="button"
          className={'coach-play-btn' + (speaking ? ' is-speaking' : '')}
          onClick={handlePlayClick}
          onDoubleClick={handlePlayDoubleClick}
          disabled={!summary?.spoken}
          aria-label={playLabel}
          title={t('coach.tooltipDemo')}
        >
          {speaking ? (
            <>
              <Pause size={14} strokeWidth={2.4} />
              <span className="coach-bars" aria-hidden="true">
                <span /><span /><span /><span /><span />
              </span>
              <span>{t('coach.speaking')}</span>
            </>
          ) : (
            <>
              <Play size={14} strokeWidth={2.4} />
              <span>{playLabel}</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="coach-secondary-btn"
          onClick={handleGenerateClick}
          onDoubleClick={handleGenerateDoubleClick}
          disabled={generating}
          title={t('coach.tooltipDemo')}
        >
          {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} strokeWidth={2.2} />}
          <span>{generating ? t('coach.generating') : (summary ? t('coach.regenerate') : t('coach.generate'))}</span>
        </button>
      </div>

      {/* ── Phase 2 — Conversational mode ─────────────────────────────────── */}
      <div className="coach-chat">
        <div className="coach-chat-title">{t('coach.askLabel')}</div>

        {chatLog.length > 0 && (
          <div className="coach-chat-log" ref={chatLogRef}>
            {chatLog.map((m, i) => (
              <div key={i} className={'coach-bubble ' + (m.role === 'user' ? 'is-user' : 'is-coach')}>
                <span className="coach-bubble-author">
                  {m.role === 'user' ? t('coach.youLabel') : t('coach.coachLabel')}
                </span>
                {m.text}
              </div>
            ))}
          </div>
        )}

        <form className="coach-input-row" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder={t('coach.askPlaceholder')}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={chatBusy}
          />
          <button
            type="button"
            className={
              'voice-mic' +
              (askVoiceState === 'listening' ? ' is-listening' : '') +
              (chatBusy ? ' is-processing' : '')
            }
            onClick={handleAskMicClick}
            onDoubleClick={handleAskMicDoubleClick}
            aria-label={t('coach.askMicHint')}
            aria-pressed={askVoiceState === 'listening'}
            title={t('coach.tooltipDemo')}
          >
            {chatBusy ? <Loader2 size={16} strokeWidth={2.2} /> : <Mic size={16} strokeWidth={2.2} />}
          </button>
          <button
            type="submit"
            className="coach-secondary-btn"
            disabled={!chatInput.trim() || chatBusy}
            aria-label={t('coach.askLabel')}
          >
            <Send size={14} strokeWidth={2.2} />
          </button>
        </form>

        {askError && (
          <div className="text-[11px] mt-2" style={{ color: '#ef4444' }}>{askError}</div>
        )}
      </div>
    </section>
  );
}
