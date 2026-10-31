import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPARE_FN_SOURCE, RUNNER_HTML, WORKER_SOURCE } from '../lib/runner-html.mjs';

const same = new Function(`${COMPARE_FN_SOURCE}; return same;`)();

test('مقارنة صارمة بين القيم', () => {
  assert.equal(same(1, 1), true);
  assert.equal(same(true, 1), false);
  assert.equal(same(null, undefined), false);
  assert.equal(same(NaN, NaN), false);
  assert.equal(same(-0, 0), true);
  assert.equal(same('1', 1), false);
});

test('مقارنة القوائم والقواميس', () => {
  assert.equal(same([1, [2, { x: null }]], [1, [2, { x: null }]]), true);
  assert.equal(same([1, 2], [2, 1]), false);
  assert.equal(same([1], [1, 2]), false);
  assert.equal(same({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
  assert.equal(same({ a: 1 }, { a: 1, b: 2 }), false);
  assert.equal(same([], {}), false);
});

test('صفحة المنفّذ لا تحتوي أي طلب شبكة ولا تحمّل موارد خارجية', () => {
  assert.ok(!/<script[^>]+src=/i.test(RUNNER_HTML));
  assert.ok(!/<link|<img|<iframe/i.test(RUNNER_HTML));
  assert.ok(!RUNNER_HTML.includes('</script><script'));
  assert.ok(WORKER_SOURCE.includes('self.fetch=undefined'));
});
