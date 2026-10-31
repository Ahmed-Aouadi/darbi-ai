import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAppCsp, buildSecurityHeaders, RUNNER_CSP, supabaseOrigin } from '../lib/security.mjs';

test('سياسة الموقع في الإنتاج لا تسمح بـ unsafe-eval وتحتفظ بالسكربتات المضمّنة لـ Next.js', () => {
  const csp = buildAppCsp({ isProd: true });
  assert.ok(!csp.includes("'unsafe-eval'"));
  assert.match(csp, /script-src 'self' 'unsafe-inline'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
});

test('سياسة التطوير تسمح بـ unsafe-eval فقط خارج الإنتاج', () => {
  assert.match(buildAppCsp({ isProd: false }), /'unsafe-eval'/);
});

test('connect-src محصور في الموقع وعنوان Supabase المحدد، لا https: عامًا', () => {
  const csp = buildAppCsp({ isProd: true, supabaseUrl: 'https://abc.supabase.co/' });
  assert.match(csp, /connect-src 'self' https:\/\/abc\.supabase\.co wss:\/\/abc\.supabase\.co/);
  assert.ok(!/connect-src[^;]*\shttps:(?!\/)/.test(csp));
});

test('supabaseOrigin يتسامح مع القيم الفارغة أو الخاطئة', () => {
  assert.equal(supabaseOrigin(''), '');
  assert.equal(supabaseOrigin('not a url'), '');
  assert.equal(supabaseOrigin('https://x.supabase.co/rest/v1'), 'https://x.supabase.co');
});

test('المنفّذ المعزول: لا شبكة ولا صور ولا أنماط، ويُضمَّن في الموقع فقط', () => {
  assert.match(RUNNER_CSP, /default-src 'none'/);
  assert.match(RUNNER_CSP, /connect-src 'none'/);
  assert.match(RUNNER_CSP, /frame-ancestors 'self'/);
  const h = buildSecurityHeaders({ pathname: '/runner', isProd: true });
  assert.equal(h['X-Frame-Options'], 'SAMEORIGIN');
  assert.equal(h['Content-Security-Policy'], RUNNER_CSP);
});

test('بقية الصفحات لا يمكن تضمينها في إطار', () => {
  const h = buildSecurityHeaders({ pathname: '/challenges/nearest-bus', isProd: true });
  assert.equal(h['X-Frame-Options'], 'DENY');
  assert.ok(h['Strict-Transport-Security']);
  assert.equal(buildSecurityHeaders({ pathname: '/', isProd: false })['Strict-Transport-Security'], undefined);
});
