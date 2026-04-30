/* ============================================================================
 * Smart Receipt — Vision LLM extractor
 *
 *   readReceiptImage(file, lang)  → { amount, recipes }
 *   readReceiptImageSafe(...)     → falls back to a hardcoded mock if the API
 *                                   key is missing OR the network/API fails.
 *   getMockReceipt(lang)          → bilingual mock used by the hidden demo
 *                                   escape hatch (Shift-click / double-click).
 *
 *  Returned shape:
 *    {
 *      amount: number,                       // total spent on the receipt
 *      recipes: [
 *        { name: string, time: string, ingredients: string[] },
 *        ...
 *      ]
 *    }
 *
 *  Default endpoint follows the OpenAI gpt-4o vision schema (Chat Completions
 *  with image_url content blocks). Swap URL/headers/model for any other
 *  vision-capable LLM.
 * ========================================================================= */

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const VISION_API_URL =
  ENV.VITE_VISION_API_URL || ENV.VITE_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
export const VISION_API_KEY =
  ENV.VITE_VISION_API_KEY || ENV.VITE_LLM_API_KEY || '';
export const VISION_MODEL =
  ENV.VITE_VISION_MODEL || 'gpt-4o-mini';

const PROMPT_EN = `Extract the total amount from this grocery receipt. Then, read the ingredients and generate 3 cheap, quick student recipes using them.
For EACH recipe also estimate:
- estimatedCost (USD): the cost to cook ONE serving using items from this receipt
- savings (USD): how much the user saves compared to ordering the SAME dish from a typical takeout/restaurant
Return strictly a single JSON object — no commentary, no markdown:
{ "amount": number, "recipes": [{"name": string, "time": string, "ingredients": string[], "estimatedCost": number, "savings": number}] }.`;

const PROMPT_AR = `استخرج المبلغ الإجمالي من فاتورة المشتريات. ثم اقرأ المكوّنات وأنشئ ٣ وصفات طلابية رخيصة وسريعة باستخدامها.
لكل وصفة احسب أيضاً:
- estimatedCost (بالدولار): تكلفة طبخ حصّة واحدة باستخدام المكوّنات من نفس الفاتورة
- savings (بالدولار): كم سيوفّر المستخدم مقارنة بطلب نفس الطبق من مطعم أو ديليفري عادي
أرجع كائن JSON واحد فقط بدون أي شرح أو ماركداون:
{ "amount": number, "recipes": [{"name": string, "time": string, "ingredients": string[], "estimatedCost": number, "savings": number}] }.`;

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('file read failed'));
    r.readAsDataURL(file);
  });
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

function normalizeReceipt(raw) {
  const recipes = Array.isArray(raw?.recipes) ? raw.recipes.slice(0, 3) : [];
  return {
    amount: Number(raw?.amount) || 0,
    recipes: recipes.map((r) => ({
      name: String(r?.name || ''),
      time: String(r?.time || ''),
      ingredients: Array.isArray(r?.ingredients)
        ? r.ingredients.map((s) => String(s)).filter(Boolean)
        : [],
      estimatedCost: Number(r?.estimatedCost) || 0,
      savings: Number(r?.savings) || 0,
    })),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Real Vision API call
// ──────────────────────────────────────────────────────────────────────────────

export async function readReceiptImage(file, lang = 'en') {
  if (!VISION_API_KEY) throw new Error('Vision API key missing');
  const dataUrl = await fileToDataUrl(file);
  const prompt = lang === 'ar' ? PROMPT_AR : PROMPT_EN;

  const res = await fetch(VISION_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${VISION_API_KEY}`,
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.4,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error('Vision LLM HTTP ' + res.status);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? '';
  const parsed = extractJson(raw);
  if (!parsed) throw new Error('Vision LLM returned no JSON');
  return normalizeReceipt(parsed);
}

// ──────────────────────────────────────────────────────────────────────────────
// Mock fallback — bilingual, demo-ready
// ──────────────────────────────────────────────────────────────────────────────

// Mocks aligned with the demo receipt (Tan Hung Asian Grocery, $22.73, 13 items)
// so the offline fallback matches what's on screen during the live demo.
const MOCKS = {
  en: {
    amount: 22.73,
    recipes: [
      {
        name: 'Veggie stir-fry with rice noodles',
        time: '15 min',
        ingredients: ['Rice noodles', 'Red capsicum', 'Yellow capsicum', 'Chinese broccoli', 'Beans shoots', 'Chives'],
        estimatedCost: 2.40,
        savings: 9.60,
      },
      {
        name: 'Japanese pumpkin soba bowl',
        time: '20 min',
        ingredients: ['Soba noodles', 'Japanese pumpkin', 'Herb mint', 'Soy sauce', 'Chives'],
        estimatedCost: 2.10,
        savings: 8.90,
      },
      {
        name: 'Zucchini & celery chow mein',
        time: '12 min',
        ingredients: ['Japanese noodles', 'Zucchini', 'Celery', 'Capsicum', 'Garlic'],
        estimatedCost: 2.60,
        savings: 9.40,
      },
    ],
  },
  ar: {
    amount: 22.73,
    recipes: [
      {
        name: 'خضار سوتيه مع نودلز الأرز',
        time: '١٥ دقيقة',
        ingredients: ['نودلز أرز', 'فلفل أحمر', 'فلفل أصفر', 'بروكلي صيني', 'برعم فاصولياء', 'ثوم أخضر'],
        estimatedCost: 2.40,
        savings: 9.60,
      },
      {
        name: 'بولة سوبا مع القرع الياباني',
        time: '٢٠ دقيقة',
        ingredients: ['نودلز سوبا', 'قرع ياباني', 'نعناع', 'صلصة صويا', 'ثوم أخضر'],
        estimatedCost: 2.10,
        savings: 8.90,
      },
      {
        name: 'تشاو ميين مع الكوسا والكرفس',
        time: '١٢ دقيقة',
        ingredients: ['نودلز يابانية', 'كوسا', 'كرفس', 'فلفل ملوّن', 'ثوم'],
        estimatedCost: 2.60,
        savings: 9.40,
      },
    ],
  },
};

export function getMockReceipt(lang = 'en') {
  return MOCKS[lang] || MOCKS.en;
}

export async function readReceiptImageSafe(file, lang = 'en', { forceMock = false } = {}) {
  if (forceMock || !VISION_API_KEY) {
    return { receipt: getMockReceipt(lang), source: 'mock' };
  }
  try {
    const receipt = await readReceiptImage(file, lang);
    return { receipt, source: 'live' };
  } catch {
    return { receipt: getMockReceipt(lang), source: 'mock' };
  }
}
