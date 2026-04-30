/* ============================================================================
 * AI Money Coach
 *
 * Phase 1 — passive weekly/daily summaries:
 *   buildCoachPrompt(role, transactions, lang) → strict-JSON prompt
 *   generateCoachSummary({ role, transactions, lang }) → { headline, body, tips, spoken }
 *   speak(text, lang) → HTMLAudioElement (ElevenLabs TTS)
 *
 * Phase 2 — conversational mode:
 *   chatWithCoach({ role, transactions, lang, history, userText }) → { reply, spoken }
 *
 * Demo fallback — every entry point has a mock variant so the live demo never
 * fails on flaky Wi-Fi (used by the AICoach card's hidden double-click).
 * ========================================================================= */

// ──────────────────────────────────────────────────────────────────────────────
// CREDENTIALS — sourced from .env.local (Vite's import.meta.env).
// See .env.example for the full list of accepted variables.
// ──────────────────────────────────────────────────────────────────────────────

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {};

// LLM (OpenAI-compatible Chat Completions schema; works with OpenAI, Groq,
// OpenRouter, Together, etc. Swap URL/headers if you go elsewhere).
export const LLM_API_URL = ENV.VITE_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
export const LLM_API_KEY = ENV.VITE_LLM_API_KEY || '';
export const LLM_MODEL = ENV.VITE_LLM_MODEL || 'gpt-4o-mini';

// ElevenLabs (text-to-speech)
export const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
export const ELEVENLABS_API_KEY = ENV.VITE_ELEVENLABS_API_KEY || '';
export const ELEVENLABS_MODEL = 'eleven_multilingual_v2'; // handles EN + AR

// Voice IDs. A single VITE_ELEVENLABS_VOICE_ID is used for both languages by
// default; per-language overrides take precedence when set.
const DEFAULT_VOICE_ID = ENV.VITE_ELEVENLABS_VOICE_ID || '';
export const VOICE_ID_EN = ENV.VITE_ELEVENLABS_VOICE_ID_EN || DEFAULT_VOICE_ID;
export const VOICE_ID_AR = ENV.VITE_ELEVENLABS_VOICE_ID_AR || DEFAULT_VOICE_ID;

// ──────────────────────────────────────────────────────────────────────────────
// PROMPTS
// ──────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT_SUMMARY = `You are Masrafji's AI Money Coach — warm, concrete, and culturally aware.
You speak directly to the user about their own money, in a friendly tone (never preachy).
You will receive: the user's persona (role), their language (en or ar), and a JSON list
of recent transactions (positive amounts = income, negative = expense).

Output ONLY a single JSON object — no markdown, no commentary — exactly of this shape:
{
  "headline": "<6-10 word punchy summary in the user's language>",
  "body": "<2-3 sentences, plain language, addressed to 'you'>",
  "tips": [
    { "icon": "<one of: coffee | utensils | shopping-cart | car | zap | home | piggy-bank | trending-up | trending-down | sparkles>",
      "text": "<one specific actionable tip, <= 90 chars>" }
  ],
  "spoken": "<a clean spoken-word version of the summary + tips, 30-55 seconds when read aloud, in the user's language. No symbols, no markdown, no bullet points. Use natural sentences, contractions, and friendly phrasing. Mention concrete numbers when helpful. Do NOT say 'here is your summary' — speak like a friend.>"
}
Rules:
- Match the language exactly (en or ar). For Arabic, use natural Levantine-friendly MSA.
- Tips must reference real numbers/categories from the transactions when possible.
- Never invent transactions that aren't in the input.
- Keep tone supportive, not judgmental.`;

const SYSTEM_PROMPT_CHAT = `You are Masrafji's AI Money Coach speaking with the user in real time.
You will receive: the user's persona, language (en or ar), recent transactions (JSON),
prior conversation turns, and the user's latest message.

Output ONLY a single JSON object:
{
  "reply": "<your textual response in the user's language, 2-4 sentences, friendly and specific>",
  "spoken": "<a natural spoken version of the reply, no symbols/markdown, suitable for TTS>"
}
Rules:
- Stay grounded in the transactions provided. If data is insufficient, say so simply.
- Be direct and warm. Address the user as 'you'. Never lecture.
- For Arabic, use natural Levantine-friendly MSA.`;

// ──────────────────────────────────────────────────────────────────────────────
// CORE LLM CALL
// ──────────────────────────────────────────────────────────────────────────────

function extractJson(text) {
  if (!text) return null;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  return JSON.parse(candidate.slice(start, end + 1));
}

async function callLLM(systemPrompt, userPayload) {
  const res = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userPayload) },
      ],
    }),
  });
  if (!res.ok) throw new Error('LLM HTTP ' + res.status);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? '';
  const parsed = extractJson(raw);
  if (!parsed) throw new Error('LLM returned no JSON');
  return parsed;
}

// ──────────────────────────────────────────────────────────────────────────────
// PHASE 1 — WEEKLY/DAILY SUMMARY
// ──────────────────────────────────────────────────────────────────────────────

function compactTransactions(transactions = []) {
  // Send only what the model needs — avoids leaking icons/ids/etc.
  return transactions.slice(0, 30).map((tx) => ({
    name: tx.name,
    category: tx.category,
    amount: tx.amount,
    date: tx.date,
  }));
}

export async function generateCoachSummary({ role, transactions, lang }) {
  const payload = {
    persona: role,
    language: lang,
    transactions: compactTransactions(transactions),
  };
  const out = await callLLM(SYSTEM_PROMPT_SUMMARY, payload);
  return {
    headline: String(out.headline || ''),
    body: String(out.body || ''),
    tips: Array.isArray(out.tips) ? out.tips.slice(0, 4) : [],
    spoken: String(out.spoken || out.body || ''),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// PHASE 2 — CONVERSATIONAL MODE
// ──────────────────────────────────────────────────────────────────────────────

export async function chatWithCoach({ role, transactions, lang, history = [], userText }) {
  const payload = {
    persona: role,
    language: lang,
    transactions: compactTransactions(transactions),
    history: history.slice(-6), // last 3 turns each side
    userMessage: userText,
  };
  const out = await callLLM(SYSTEM_PROMPT_CHAT, payload);
  return {
    reply: String(out.reply || ''),
    spoken: String(out.spoken || out.reply || ''),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// ELEVENLABS — TEXT TO SPEECH
// ──────────────────────────────────────────────────────────────────────────────

let activeAudio = null;

export function stopSpeaking() {
  if (activeAudio) {
    try { activeAudio.pause(); } catch { /* noop */ }
    try { URL.revokeObjectURL(activeAudio.src); } catch { /* noop */ }
    activeAudio = null;
  }
}

/**
 * Speak the given text via ElevenLabs. Returns { audio, ready, finished } where:
 *   - audio: the HTMLAudioElement (caller can pause/resume)
 *   - ready: Promise<void> resolved when audio is buffered enough to play
 *   - finished: Promise<void> resolved when playback ends or errors
 */
export async function speak(text, lang = 'en') {
  stopSpeaking();
  const voiceId = lang === 'ar' ? VOICE_ID_AR : VOICE_ID_EN;
  const res = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: ELEVENLABS_MODEL,
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.75,
        style: 0.35,
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok) throw new Error('ElevenLabs HTTP ' + res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  activeAudio = audio;

  const ready = new Promise((resolve, reject) => {
    audio.addEventListener('canplay', () => resolve(), { once: true });
    audio.addEventListener('error', () => reject(new Error('audio error')), { once: true });
  });
  const finished = new Promise((resolve) => {
    const cleanup = () => {
      try { URL.revokeObjectURL(url); } catch { /* noop */ }
      if (activeAudio === audio) activeAudio = null;
      resolve();
    };
    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });
  });
  await ready;
  await audio.play();
  return { audio, ready, finished };
}

// ──────────────────────────────────────────────────────────────────────────────
// MOCK FALLBACKS — bilingual, per role. Used when:
//   • API key missing
//   • Network fails
//   • User double-clicks the play/refresh button (hidden demo escape hatch)
// ──────────────────────────────────────────────────────────────────────────────

const MOCK_SUMMARIES = {
  general: {
    en: {
      headline: 'You held the line this week — small wins add up',
      body: "Spending dipped 6% vs last week and you stayed under budget on groceries. The one soft spot is coffee — four trips, $18 total.",
      tips: [
        { icon: 'coffee', text: 'Brew at home twice a week to save about $15/month on coffee.' },
        { icon: 'utensils', text: 'Dining out is trending up — set a $40 weekly cap to keep it fun without the sting.' },
        { icon: 'piggy-bank', text: "You're $32 ahead of your savings pace — nice work, keep it rolling." },
      ],
      spoken:
        "Hey, quick check-in on your week. You actually trimmed your spending by about six percent compared to last week, which is a really nice rhythm. Groceries stayed under budget — that's a clean win. The one place that's quietly creeping up is coffee. Four café runs this week, eighteen dollars total. Not catastrophic, but if you grabbed a bag of beans and some milk, you could easily save fifteen dollars a month and still get your morning ritual. Dining out is also trending slightly higher — try a forty dollar weekly cap, just to keep it from snowballing. And here's the good news: you're thirty two dollars ahead of your savings pace this month. Keep it rolling.",
    },
    ar: {
      headline: 'أسبوعٌ محسوب — والمكاسب الصغيرة بتتجمّع',
      body: 'مصاريفك نزلت ٦٪ عن الأسبوع الماضي وضلّيت ضمن الميزانية بالمشتريات. النقطة الوحيدة اللي ممكن تنتبهلها هي القهوة — أربع مرّات، صرفت عليها ١٨ دولار.',
      tips: [
        { icon: 'coffee', text: 'حضّر القهوة بالبيت مرّتين بالأسبوع، رح توفّر تقريباً ١٥ دولار شهرياً.' },
        { icon: 'utensils', text: 'مصاريف المطاعم بتزيد — حدّد سقف ٤٠ دولار بالأسبوع وتضل تستمتع.' },
        { icon: 'piggy-bank', text: 'ادخارك متقدّم ٣٢ دولار عن المعدّل — خطوة ممتازة، كمّل عليها.' },
      ],
      spoken:
        'أهلاً، خلّيني أحكيلك بسرعة عن أسبوعك. مصاريفك نزلت تقريباً ستة بالمئة عن الأسبوع الماضي، وهاد إيقاع حلو كثير. المشتريات ضلّت ضمن الميزانية — هاد إنجاز نظيف. الشي الوحيد اللي عم يكبر بهدوء هي القهوة. أربع زيارات للكافيه هالأسبوع، ثمنطعش دولار إجمالاً. مش كارثة، بس لو جبت كيس بُن وحليب من السوبرماركت، فيك توفّر بسهولة خمسطعش دولار بالشهر وتحافظ على روتينك الصباحي. المطاعم كمان بتميل تزيد شوي — جرّب سقف أربعين دولار بالأسبوع لحتى ما تتراكم. والخبر الحلو: ادخارك متقدّم اثنين وثلاثين دولار عن خطّتك الشهرية. كمّل عليها.',
    },
  },
};

const MOCK_CHAT = {
  en: [
    { reply: "Sure — based on the last few weeks, your two biggest leaks are dining out and coffee. Trim either one a bit and you'll feel it within a month.", spoken: "Sure thing. Looking at the last few weeks, your two biggest leaks are dining out and coffee. If you trim either one even just a little, you'll feel it within a month." },
    { reply: "If you want, I'd start by capping dining at $40 per week — that alone could free up $60 a month for your emergency fund.", spoken: "If you want a starting point, try capping dining at forty dollars a week. That move alone could free up sixty dollars a month — straight into your emergency fund." },
  ],
  ar: [
    { reply: 'أكيد — من الأسابيع الأخيرة، أكبر تسرّبَين عندك هما المطاعم والقهوة. لو خفّفت من واحد منهم رح تحسّ بالفرق خلال شهر.', spoken: 'أكيد. من خلال آخر كم أسبوع، أكبر تسرّبَين عندك هما المطاعم والقهوة. لو خفّفت من واحد فيهم ولو شوي، رح تحسّ بالفرق خلال شهر.' },
    { reply: 'لو تحب نبلش، حدّد سقف ٤٠ دولار للمطاعم بالأسبوع — هالخطوة لحالها بتحرّر ٦٠ دولار شهرياً لصندوق الطوارئ.', spoken: 'لو تحب نبلش بخطوة، حدّد سقف أربعين دولار للمطاعم بالأسبوع. هالخطوة لحالها بتحرّر ستين دولار بالشهر — مباشرة لصندوق الطوارئ.' },
  ],
};

export function getMockSummary(roleId, lang) {
  const byRole = MOCK_SUMMARIES[roleId] ?? MOCK_SUMMARIES.general;
  return byRole[lang] ?? byRole.en;
}

export function getMockChatReply(lang, turnIndex = 0) {
  const list = MOCK_CHAT[lang] ?? MOCK_CHAT.en;
  return list[turnIndex % list.length];
}

// ──────────────────────────────────────────────────────────────────────────────
// HIGH-LEVEL HELPERS WITH MOCK FALLBACK
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Try real LLM, fall back to mock on any failure (missing key, network, parse).
 * Returns { summary, source: 'live' | 'mock' }.
 */
export async function getCoachSummarySafe({ role, transactions, lang, forceMock = false }) {
  if (forceMock || !LLM_API_KEY) {
    return { summary: getMockSummary(role?.id, lang), source: 'mock' };
  }
  try {
    const summary = await generateCoachSummary({ role, transactions, lang });
    return { summary, source: 'live' };
  } catch {
    return { summary: getMockSummary(role?.id, lang), source: 'mock' };
  }
}

/**
 * Try ElevenLabs, fall back to native speechSynthesis when key is missing or
 * the network fails. Returns the same { audio, ready, finished } shape (with
 * audio === null in the speechSynthesis path so callers can pause via
 * cancelSpeaking()).
 */
export async function speakSafe(text, lang = 'en') {
  if (ELEVENLABS_API_KEY) {
    try {
      return await speak(text, lang);
    } catch {
      /* fall through to native */
    }
  }
  return speakWithBrowser(text, lang);
}

export function speakWithBrowserOnly(text, lang = 'en') {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return { audio: null, ready: Promise.resolve(), finished: Promise.resolve() };
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
  utter.rate = 1.02;
  utter.pitch = 1.0;
  const finished = new Promise((resolve) => {
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
  });
  window.speechSynthesis.speak(utter);
  return { audio: null, ready: Promise.resolve(), finished, browserUtter: utter };
}

const speakWithBrowser = speakWithBrowserOnly;

export function cancelSpeaking() {
  stopSpeaking();
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
