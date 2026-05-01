/**
 * Masrafji · Anomaly notification text generator (Gemini).
 *
 * Replaces hand-written notification copy for AI-detected anomalies
 * (duplicate charges, recurring subscriptions) with Gemini-generated
 * lines that read like a real banking app — natural Levantine Arabic
 * with correct grammar, no mechanical phrasing.
 *
 *   generateAnomalyText({ kind, merchant, amount, currency, lang })
 *     → Promise<{ title, body }>
 *
 * Caches by (kind|lang|merchant|amount) in-memory so we don't re-hit
 * the API on every notification render. Cache survives within page
 * lifetime, not across reloads.
 */
import { GEMINI_API_KEY, GEMINI_MODEL } from './cheerLLM.js';

const ENDPOINT = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

const PROMPTS = {
  duplicate: {
    en: (merchant, amount) =>
      `Write a SHORT bank-app notification (1 title + 1 body sentence) about a duplicate Visa charge.
Merchant: "${merchant}". Amount: $${amount}. The charge happened TWICE within seconds (typical card double-billing — NOT a 2-day repeat).
Tone: alerting but calm, like a real bank. Make the body urge a quick check.
Output STRICT JSON only — no markdown, no commentary:
{ "title": "<10-12 words max>", "body": "<1 sentence, max 22 words>" }`,
    ar: (merchant, amount) =>
      `اكتب إشعار تطبيق بنك قصير (عنوان + جملة وصف) عن خصم فيزا مكرّر.
التاجر: "${merchant}". المبلغ: ${amount} دولار. الخصم تم مرّتين خلال ثوانٍ (ازدواج بطاقة الائتمان النموذجي — وليس بفارق يومين).
النبرة: تنبيه هادئ مثل بنك حقيقي. الجملة تحثّ المستخدم على المراجعة السريعة.
مهم: راعِ القواعد العربية الصحيحة (الجنس والجمع). استخدم لهجة عربية فصحى ودودة قريبة للشامية.
أرجع JSON فقط — بدون ماركداون أو تعليقات:
{ "title": "<أقصى ١٠-١٢ كلمة>", "body": "<جملة واحدة، أقصى ٢٢ كلمة>" }`,
  },
  subscription: {
    en: (merchant, amount) =>
      `Write a SHORT bank-app notification (1 title + 1 body sentence) about a recurring subscription the user might have forgotten.
Merchant: "${merchant}". Monthly amount: $${amount}. Detected across multiple months.
Tone: friendly nudge — not alarming. Body should suggest cancelling if unused.
Output STRICT JSON only — no markdown, no commentary:
{ "title": "<10-12 words max>", "body": "<1 sentence, max 22 words>" }`,
    ar: (merchant, amount) =>
      `اكتب إشعار تطبيق بنك قصير (عنوان + جملة وصف) عن اشتراك شهري متكرّر يمكن أن يكون المستخدم نسيه.
التاجر: "${merchant}". المبلغ الشهري: ${amount} دولار. ظاهر بفواتير متعدّدة الأشهر.
النبرة: ودودة وغير مزعجة. الجملة تقترح بلطف إلغاءه إذا لم يُستعمل.
مهم: راعِ القواعد العربية الصحيحة. استخدم لهجة شامية ودودة.
أرجع JSON فقط — بدون ماركداون أو تعليقات:
{ "title": "<أقصى ١٠-١٢ كلمة>", "body": "<جملة واحدة، أقصى ٢٢ كلمة>" }`,
  },
};

// Two-layer cache:
//  1. In-memory Map (instant within page lifetime)
//  2. localStorage with a 30-day TTL (survives reloads, saves Gemini quota)
const memCache = new Map();
const STORAGE_PREFIX = 'masrafji-anom-llm-';
const STORAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function cacheKey({ kind, lang, merchant, amount }) {
  return `${kind}|${lang}|${merchant}|${amount}`;
}

function readPersistent(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.exp || Date.now() > parsed.exp) return null;
    return parsed.value || null;
  } catch {
    return null;
  }
}

function writePersistent(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_PREFIX + key,
      JSON.stringify({ exp: Date.now() + STORAGE_TTL_MS, value }),
    );
  } catch {
    /* quota or private mode — silently ignore */
  }
}

function extractJson(text) {
  if (!text) return null;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

function clean(text) {
  if (!text) return '';
  return String(text)
    .trim()
    .replace(/^["'«»“”‘’]+|["'«»“”‘’]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateAnomalyText({
  kind,
  merchant,
  amount,
  lang = 'en',
}) {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key missing');
  if (!kind || !merchant || amount == null) {
    throw new Error('Anomaly text needs kind + merchant + amount');
  }

  const key = cacheKey({ kind, lang, merchant, amount });
  if (memCache.has(key)) return memCache.get(key);
  const persisted = readPersistent(key);
  if (persisted) {
    memCache.set(key, persisted);
    return persisted;
  }

  const promptFn = PROMPTS[kind]?.[lang] || PROMPTS[kind]?.en;
  if (!promptFn) throw new Error(`No prompt for kind=${kind}`);
  const prompt = promptFn(merchant, amount);

  const res = await fetch(ENDPOINT(GEMINI_MODEL, GEMINI_API_KEY), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 200,
        topP: 0.9,
        responseMimeType: 'application/json',
      },
      safetySettings: [
        'HARM_CATEGORY_HARASSMENT',
        'HARM_CATEGORY_HATE_SPEECH',
        'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'HARM_CATEGORY_DANGEROUS_CONTENT',
      ].map((category) => ({ category, threshold: 'BLOCK_ONLY_HIGH' })),
    }),
  });

  if (!res.ok) throw new Error('Gemini HTTP ' + res.status);
  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const parsed = extractJson(raw);
  if (!parsed?.title || !parsed?.body) throw new Error('Gemini returned no JSON');

  const out = { title: clean(parsed.title), body: clean(parsed.body) };
  memCache.set(key, out);
  writePersistent(key, out);
  return out;
}
