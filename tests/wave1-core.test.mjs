import test from "node:test";
import assert from "node:assert/strict";
import {
  hintPenalty, scoreFactor, normalizeArabicSearch, validateCustomArgs,
  reviewDueDate, selectDailyQuests
} from "../lib/wave1-core.mjs";

test("hint ladder applies only the highest unlocked level penalty", () => {
  assert.equal(hintPenalty(0), 0);
  assert.equal(hintPenalty(1), 0.05);
  assert.equal(hintPenalty(2), 0.10);
  assert.equal(hintPenalty(3), 0.15);
  assert.equal(scoreFactor({ fails: 2, hintLevel: 3 }), 0.65);
  assert.equal(scoreFactor({ fails: 10, hintLevel: 3 }), 0.45);
  assert.throws(() => hintPenalty(4), RangeError);
});

test("Arabic search normalization removes diacritics and normalizes letter variants", () => {
  assert.equal(normalizeArabicSearch("  إِعْلَامــة  "), "اعلامه");
  assert.equal(normalizeArabicSearch("فتى"), "فتي");
});

test("custom args accepts only a JSON array with safe JSON values", () => {
  assert.deepEqual(validateCustomArgs("[3, [1, 2], null]").args, [3, [1, 2], null]);
  assert.equal(validateCustomArgs('{"x":1}').ok, false);
  assert.equal(validateCustomArgs("[NaN]").ok, false);
  assert.equal(validateCustomArgs("not-json").ok, false);
});

test("spaced review uses 3, 14, and 45 day intervals", () => {
  assert.equal(reviewDueDate("2026-01-01", 1), "2026-01-04");
  assert.equal(reviewDueDate("2026-01-01", 2), "2026-01-15");
  assert.equal(reviewDueDate("2026-01-01", 3), "2026-02-15");
});

test("daily quest selection is stable per day and changes for another day", () => {
  const keys = ["a", "b", "c", "d", "e"];
  assert.deepEqual(selectDailyQuests(keys, "2026-10-28"), selectDailyQuests(keys, "2026-10-28"));
  assert.equal(selectDailyQuests(keys, "2026-10-28").length, 3);
  assert.notDeepEqual(selectDailyQuests(keys, "2026-10-28"), selectDailyQuests(keys, "2026-10-29"));
});
