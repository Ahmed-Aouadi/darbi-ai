import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const challenges = JSON.parse(fs.readFileSync(path.join(root, "content/challenges.json"), "utf8"));
const tracks = JSON.parse(fs.readFileSync(path.join(root, "content/tracks.json"), "utf8"));
const errors = [];
const slugs = new Set();

if (!Array.isArray(challenges) || challenges.length < 20) {
  errors.push(`Expected at least 20 challenges; received ${Array.isArray(challenges) ? challenges.length : "non-array"}.`);
}
for (const [index, challenge] of (Array.isArray(challenges) ? challenges : []).entries()) {
  const where = `challenge[${index}]`;
  for (const key of ["slug", "title", "topic", "level", "functionName", "starter", "tests", "reference_python", "hints", "editorial", "concept_tag"]) {
    if (!(key in challenge)) errors.push(`${where}: missing ${key}`);
  }
  if (challenge.slug && slugs.has(challenge.slug)) errors.push(`${where}: duplicate slug ${challenge.slug}`);
  if (challenge.slug) slugs.add(challenge.slug);
  if (!["easy", "medium", "hard"].includes(challenge.level)) errors.push(`${where}: invalid level ${challenge.level}`);
  if (!Array.isArray(challenge.tests) || challenge.tests.length === 0) errors.push(`${where}: tests must be a non-empty array`);
  if (!Array.isArray(challenge.hints) || challenge.hints.length !== 3 || challenge.hints.some((hint) => typeof hint !== "string" || !hint.trim())) {
    errors.push(`${where}: hints must contain exactly three non-empty levels`);
  }
  if (!challenge.editorial || typeof challenge.editorial !== "object" || typeof challenge.editorial.idea !== "string" || !Array.isArray(challenge.editorial.steps)) {
    errors.push(`${where}: editorial must include idea and steps`);
  }
  if (typeof challenge.concept_tag !== "string" || !challenge.concept_tag.trim()) errors.push(`${where}: concept_tag must be a non-empty string`);
  if (Array.isArray(challenge.tests)) {
    if (challenge.tests.length < 6) errors.push(`${where}: needs at least 6 tests (found ${challenge.tests.length})`);
    const hiddenCount = challenge.tests.filter((t) => t.hidden === true).length;
    if (hiddenCount < 2) errors.push(`${where}: needs at least 2 hidden tests (found ${hiddenCount})`);
    if (challenge.tests.length - hiddenCount < 1) errors.push(`${where}: needs at least 1 visible test`);
    const seen = new Set(challenge.tests.map((t) => JSON.stringify(t.args)));
    if (seen.size !== challenge.tests.length) errors.push(`${where}: duplicate test inputs`);
  }
  for (const [testIndex, test] of (challenge.tests || []).entries()) {
    if (!Array.isArray(test.args) || !("expected" in test) || typeof test.hidden !== "boolean") {
      errors.push(`${where}.tests[${testIndex}]: expected args, expected, and boolean hidden`);
    }
  }
}
for (const [track, items] of Object.entries(tracks || {})) {
  if (!Array.isArray(items)) errors.push(`track "${track}" must be an array`);
  for (const slug of items || []) if (!slugs.has(slug)) errors.push(`track "${track}" references unknown challenge "${slug}"`);
}
if (errors.length) {
  console.error("Satr content validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Satr content OK: ${challenges.length} challenges, ${Object.keys(tracks).length} tracks, ${challenges.reduce((n, c) => n + c.tests.length, 0)} tests.`);
