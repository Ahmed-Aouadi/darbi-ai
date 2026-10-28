/** Pure, deterministic helpers for Satr V2 Wave 1. No user data or browser globals. */

export const ALGERIA_TIME_ZONE = "Africa/Algiers";

export function hintPenalty(level) {
  if (!Number.isInteger(level) || level < 0 || level > 3) {
    throw new RangeError("hint level must be an integer from 0 to 3");
  }
  return [0, 0.05, 0.10, 0.15][level];
}

export function scoreFactor({ fails = 0, hintLevel = 0 } = {}) {
  if (!Number.isInteger(fails) || fails < 0) {
    throw new RangeError("fails must be a non-negative integer");
  }
  return Math.max(0, 1 - Math.min(0.4, 0.1 * fails) - hintPenalty(hintLevel));
}

export function normalizeArabicSearch(value = "") {
  return String(value)
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function validateCustomArgs(raw) {
  let parsed;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return { ok: false, error: "أدخل JSON صالحًا، مثل: [3, [1, 2]]" };
  }
  if (!Array.isArray(parsed)) {
    return { ok: false, error: "يجب أن تكون المدخلات مصفوفة args." };
  }
  if (JSON.stringify(parsed).length > 10_000) {
    return { ok: false, error: "حجم المدخلات أكبر من الحد المسموح." };
  }
  if (!parsed.every(isJsonValue)) {
    return { ok: false, error: "تحتوي المدخلات على قيمة غير مدعومة." };
  }
  return { ok: true, args: parsed };
}

function isJsonValue(value) {
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
    return typeof value !== "number" || Number.isFinite(value);
  }
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value === "object") {
    return Object.getPrototypeOf(value) === Object.prototype &&
      Object.values(value).every(isJsonValue);
  }
  return false;
}

export function reviewDueDate(firstSolvedOn, stage) {
  if (!Number.isInteger(stage) || stage < 1 || stage > 3) {
    throw new RangeError("stage must be 1, 2, or 3");
  }
  const date = new Date(`${firstSolvedOn}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new TypeError("invalid first solve date");
  date.setUTCDate(date.getUTCDate() + [3, 14, 45][stage - 1]);
  return date.toISOString().slice(0, 10);
}

export function selectDailyQuests(questKeys, dateKey, count = 3) {
  if (!Array.isArray(questKeys) || questKeys.length < count) {
    throw new RangeError("not enough quests to select from");
  }
  // Stable daily shuffle; production assignment must persist selected IDs server-side.
  let seed = 2166136261;
  for (const char of String(dateKey)) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const pool = [...questKeys];
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
