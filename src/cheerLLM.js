/**
 * Masrafji · Goal Cheer generator (Gemini).
 *
 * Generates a single warm, grammatically-correct encouragement line for the
 * Goal Cheer card on the Overview tab. Uses Gemini because it handles Arabic
 * gender/plural agreement noticeably better than rigid template strings —
 * "iMac" is masculine, "دراجة" is feminine, "Football boots" is plural; static
 * templates can't get all three right at once.
 *
 *   generateCheerLine({ name, goal, lang, band }) → Promise<string>
 *
 * Behaviour:
 *   - Returns a single sentence, no markdown, no numbers, no quotes.
 *   - Caches by (lang|band|name|goal) in-memory so we don't re-hit the API on
 *     every render. Cache survives within the page lifetime, not across reloads
 *     (good — fresh phrasing each session keeps the demo lively).
 *   - Throws on any failure; the caller is expected to fall back to a static
 *     template that is itself gender-neutral.
 */

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const GEMINI_API_KEY = ENV.VITE_GEMINI_API_KEY || '';
// gemini-2.5-flash-lite has the most generous free-tier quota and handles
// Arabic Levantine + gender agreement well enough for one-line greetings.
export const GEMINI_MODEL = ENV.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite';

const ENDPOINT = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

const PROMPTS = {
  en: {
    close: (name, goal) =>
      `Write ONE short, warm, motivating sentence (max 14 words) for ${name}. They are very close to their goal: "${goal}". Tone: friend pushing them across the finish line. No numbers, no percentages, no markdown, no quotes. Use one emoji at the end. Output only the sentence.`,
    mid: (name, goal) =>
      `Write ONE short, warm, motivating sentence (max 14 words) for ${name}. They are about halfway to their goal: "${goal}". Tone: friend keeping them going. No numbers, no percentages, no markdown, no quotes. Use one emoji at the end. Output only the sentence.`,
    start: (name, goal) =>
      `Write ONE short, warm, motivating sentence (max 14 words) for ${name}. They just started saving for: "${goal}". Tone: friend cheering them at the start. No numbers, no percentages, no markdown, no quotes. Use one emoji at the end. Output only the sentence.`,
    done: (name, goal) =>
      `Write ONE short, joyful sentence (max 14 words) for ${name}. They achieved their goal: "${goal}". Tone: friend celebrating with them. No numbers, no markdown, no quotes. Use one celebratory emoji at the end. Output only the sentence.`,
  },
  ar: {
    close: (name, goal) =>
      `اكتب جملة واحدة قصيرة (حد أقصى ١٤ كلمة) باللهجة العربية الشامية الودودة، موجّهة لـ${name}. هو/هي قريب جداً من تحقيق هدفه: "${goal}". النبرة: صاحب يشجّعه يكمّل الخطوة الأخيرة. مهم جداً: راعِ القواعد العربية بشكل صحيح — جنس الكلمة (مذكر/مؤنث) وجمعها. مثلاً "iMac" مذكر، "دراجة" مؤنث، "بسطار كرة قدم" مذكر مفرد. لا تستخدم أرقام أو نسب أو علامات اقتباس أو ماركداون. ضع إيموجي واحد في النهاية. أرجع الجملة فقط.`,
    mid: (name, goal) =>
      `اكتب جملة واحدة قصيرة (حد أقصى ١٤ كلمة) باللهجة العربية الشامية الودودة، موجّهة لـ${name}. هو/هي بنص الطريق نحو هدفه: "${goal}". النبرة: صاحب يشجّعه يستمر. مهم جداً: راعِ القواعد العربية بشكل صحيح — جنس الكلمة (مذكر/مؤنث) وجمعها. لا تستخدم أرقام أو نسب أو علامات اقتباس أو ماركداون. ضع إيموجي واحد في النهاية. أرجع الجملة فقط.`,
    start: (name, goal) =>
      `اكتب جملة واحدة قصيرة (حد أقصى ١٤ كلمة) باللهجة العربية الشامية الودودة، موجّهة لـ${name}. هو/هي للتو بدأ يدخّر لـ: "${goal}". النبرة: صاحب يشجّعه ببداية الرحلة. مهم جداً: راعِ القواعد العربية بشكل صحيح — جنس الكلمة (مذكر/مؤنث) وجمعها. لا تستخدم أرقام أو نسب أو علامات اقتباس أو ماركداون. ضع إيموجي واحد في النهاية. أرجع الجملة فقط.`,
    done: (name, goal) =>
      `اكتب جملة واحدة قصيرة (حد أقصى ١٤ كلمة) باللهجة العربية الشامية الفرحة، موجّهة لـ${name}. هو/هي حقّق هدفه: "${goal}". النبرة: صاحب يحتفل معه. مهم جداً: راعِ القواعد العربية بشكل صحيح — جنس الكلمة. لا تستخدم أرقام أو علامات اقتباس أو ماركداون. ضع إيموجي احتفال في النهاية. أرجع الجملة فقط.`,
  },
};

const cache = new Map(); // key → string

function cacheKey({ name, goal, lang, band }) {
  return `${lang}|${band}|${name}|${goal}`;
}

function clean(text) {
  if (!text) return '';
  return String(text)
    .trim()
    .replace(/^["'«»“”‘’]+|["'«»“”‘’]+$/g, '')
    .replace(/^\s*[-–—•]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateCheerLine({ name, goal, lang = 'en', band = 'mid' }) {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key missing');
  if (!name || !goal) throw new Error('Cheer needs name + goal');

  const key = cacheKey({ name, goal, lang, band });
  if (cache.has(key)) return cache.get(key);

  const promptFn = PROMPTS[lang]?.[band] || PROMPTS.en[band] || PROMPTS.en.mid;
  const prompt = promptFn(name, goal);

  const res = await fetch(ENDPOINT(GEMINI_MODEL, GEMINI_API_KEY), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 80,
        topP: 0.9,
      },
      // Loosest safety so Arabic emojis/colloquial don't get blocked.
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
  const out = clean(raw);
  if (!out) throw new Error('Gemini returned empty text');

  cache.set(key, out);
  return out;
}
