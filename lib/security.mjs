/** سياسات الأمان — دوال نقية يستعملها middleware.ts وتختبرها tests/security.test.mjs. */

export function supabaseOrigin(url) {
  try { return url ? new URL(url).origin : ''; } catch { return ''; }
}

export function buildAppCsp({ isProd = true, supabaseUrl = '' } = {}) {
  const sb = supabaseOrigin(supabaseUrl);
  const connect = ["'self'"];
  if (sb) connect.push(sb, sb.replace(/^https:/, 'wss:'));
  if (!isProd) connect.push('ws://localhost:*', 'http://localhost:*');
  // Next.js يحقن سكربتات مضمّنة لبيانات التهيئة، فلا بد من 'unsafe-inline' ما لم نعتمد nonce.
  // 'unsafe-eval' للتطوير فقط: تشغيل كود المستخدم يتم في /runner المعزول لا في الصفحة.
  const script = ["'self'", "'unsafe-inline'"];
  if (!isProd) script.push("'unsafe-eval'");
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    `script-src ${script.join(' ')}`,
    "worker-src 'self'",
    "frame-src 'self'",
    `connect-src ${connect.join(' ')}`,
  ].join('; ');
}

/** المنفّذ المعزول: لا شبكة، ولا صور، ولا أنماط؛ فقط سكربت مضمّن وعامل blob. */
export const RUNNER_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline' 'unsafe-eval'",
  'worker-src blob:',
  "connect-src 'none'",
  "img-src 'none'",
  "style-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
].join('; ');

export function buildSecurityHeaders({ pathname = '/', isProd = true, supabaseUrl = '' } = {}) {
  const isRunner = pathname === '/runner' || pathname.startsWith('/runner/');
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Content-Security-Policy': isRunner ? RUNNER_CSP : buildAppCsp({ isProd, supabaseUrl }),
    'X-Frame-Options': isRunner ? 'SAMEORIGIN' : 'DENY',
  };
  if (isProd) headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains';
  return headers;
}
