import { RUNNER_HTML } from '../../lib/runner-html.mjs';

/** صفحة المنفّذ المعزول. تُضبط ترويسات CSP الخاصة بها في middleware.ts. */
export const dynamic = 'force-static';

export function GET() {
  return new Response(RUNNER_HTML, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
