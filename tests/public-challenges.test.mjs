import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { toPublicChallenge, toProgressChallenge, toCard } from '../lib/challenges-public.mjs';

const raw = JSON.parse(fs.readFileSync(new URL('../content/challenges.json', import.meta.url), 'utf8'));

test('الإسقاط العام لا يحتوي اختبارات مخفية ولا حلًّا مرجعيًا', () => {
  for (const c of raw) {
    const pub = toPublicChallenge(c);
    const hidden = c.tests.filter((t) => t.hidden);
    assert.ok(hidden.length >= 2, `${c.slug}: يجب أن يكون لكل تحدٍّ اختباران مخفيان على الأقل`);
    assert.equal(pub.visibleTests.length, c.tests.length - hidden.length);
    const serialized = JSON.stringify(pub);
    assert.ok(!serialized.includes('reference_python'), `${c.slug}: تسرّب الحل المرجعي`);
    assert.ok(!('tests' in pub), `${c.slug}: تسرّب مفتاح tests`);
    for (const t of hidden) {
      // لا يجوز ظهور مدخلات اختبار مخفي (وليست ضمن الأمثلة العلنية) في الحمولة العامة.
      const isPublicExample = c.examples.some((e) => JSON.stringify(e.args) === JSON.stringify(t.args));
      if (!isPublicExample) assert.ok(!serialized.includes(JSON.stringify(t.args)), `${c.slug}: تسرّبت مدخلات اختبار مخفي`);
    }
  }
});

test('إسقاط التقدّم يحتفظ بالشرح دون الحل المرجعي', () => {
  const p = toProgressChallenge(raw[0]);
  assert.ok(p.editorial && typeof p.editorial.idea === 'string');
  assert.ok(!JSON.stringify(p).includes('reference_python'));
});

test('بطاقة التحدي تحوي الحقول المعروضة فقط', () => {
  const card = toCard(raw[0]);
  assert.deepEqual(Object.keys(card).sort(), ['icon', 'level', 'levelLabel', 'minutes', 'points', 'slug', 'story', 'title', 'topic']);
});
