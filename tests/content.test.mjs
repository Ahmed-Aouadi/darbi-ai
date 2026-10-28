import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const challenges = JSON.parse(await readFile(new URL('../content/challenges.json', import.meta.url), 'utf8'));

test('every challenge has a unique slug and a valid three-level hint ladder', () => {
  const slugs = new Set();
  for (const challenge of challenges) {
    assert.ok(challenge.slug);
    assert.equal(slugs.has(challenge.slug), false, `duplicate slug: ${challenge.slug}`);
    slugs.add(challenge.slug);
    assert.equal(challenge.hints?.length, 3, `${challenge.slug} needs three hints`);
    assert.ok(challenge.hints.every((hint) => typeof hint === 'string' && hint.trim()));
    assert.ok(challenge.editorial?.idea);
    assert.ok(Array.isArray(challenge.editorial?.steps) && challenge.editorial.steps.length > 0);
    assert.ok(challenge.concept_tag);
  }
});

test('every challenge has visible and hidden test cases and starter code for both languages', () => {
  for (const challenge of challenges) {
    assert.ok(challenge.tests.length > 0, challenge.slug);
    assert.ok(challenge.tests.some((item) => item.hidden === false), `${challenge.slug} needs a visible test`);
    assert.ok(challenge.tests.some((item) => item.hidden === true), `${challenge.slug} needs a hidden test`);
    assert.ok(challenge.starter?.javascript);
    assert.ok(challenge.reference_python);
    for (const item of challenge.tests) {
      assert.ok(Array.isArray(item.args));
      assert.ok(Object.hasOwn(item, 'expected'));
      assert.equal(typeof item.hidden, 'boolean');
    }
  }
});
