import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const challenges = JSON.parse(fs.readFileSync(path.join(root, "content/challenges.json"), "utf8"));
const tracks = JSON.parse(fs.readFileSync(path.join(root, "content/tracks.json"), "utf8"));
const errors = [];
const slugs = new Set();

if (!Array.isArray(challenges) || challenges.length !== 20) {
  errors.push(`Expected exactly 20 challenges; received ${Array.isArray(challenges) ? challenges.length : "non-array"}.`);
}
for (const [index, challenge] of (Array.isArray(challenges) ? challenges : []).entries()) {
  const where = `challenge[${index}]`;
  for (const key of ["slug", "title", "topic", "level", "functionName", "starter", "tests", "reference_python"]) {
    if (!(key in challenge)) errors.push(`${where}: missing ${key}`);
  }
  if (challenge.slug && slugs.has(challenge.slug)) errors.push(`${where}: duplicate slug ${challenge.slug}`);
  if (challenge.slug) slugs.add(challenge.slug);
  if (!["easy", "medium", "hard"].includes(challenge.level)) errors.push(`${where}: invalid level ${challenge.level}`);
  if (!Array.isArray(challenge.tests) || challenge.tests.length === 0) errors.push(`${where}: tests must be a non-empty array`);
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
