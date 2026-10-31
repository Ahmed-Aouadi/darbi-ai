/** عميل المنفّذ المعزول: يشغّل كود المستخدم داخل iframe sandbox على /runner ويعيد تقريرًا. */
export interface RunTest { args: unknown[]; expected?: unknown; compare?: boolean }
export interface TestOutcome { index: number; ok: boolean; actual?: string; error?: string; ms: number }
export interface RunReport {
  status: 'done' | 'fatal' | 'timeout' | 'error';
  message?: string;
  outcomes: TestOutcome[];
  logs: string[];
  timedOutIndex?: number;
}

export function runInSandbox(options: { code: string; fn: string; tests: RunTest[]; timeoutMs?: number }): Promise<RunReport> {
  const { code, fn, tests, timeoutMs = 3000 } = options;
  return new Promise((resolve) => {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.title = 'بيئة تشغيل معزولة';
    iframe.tabIndex = -1;
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
    iframe.src = '/runner';

    const outcomes: TestOutcome[] = [];
    let finished = false;
    let guard: ReturnType<typeof setTimeout>;

    const finish = (report: Omit<RunReport, 'outcomes' | 'logs'> & { logs?: string[] }) => {
      if (finished) return;
      finished = true;
      clearTimeout(guard);
      window.removeEventListener('message', onMessage);
      iframe.remove();
      resolve({ ...report, outcomes, logs: report.logs || [] });
    };

    function onMessage(event: MessageEvent) {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'ready') {
        clearTimeout(guard);
        guard = setTimeout(() => finish({ status: 'timeout', message: 'انتهت مهلة التشغيل.' }), tests.length * timeoutMs + 3000);
        iframe.contentWindow?.postMessage({ type: 'run', id, code, fn, tests, timeoutMs }, '*');
        return;
      }
      if (data.id !== id) return;
      if (data.type === 'test') outcomes.push(data.test as TestOutcome & { kind?: string });
      else if (data.type === 'done') finish({ status: 'done', logs: Array.isArray(data.logs) ? data.logs : [] });
      else if (data.type === 'fatal') finish({ status: 'fatal', message: String(data.error) });
      else if (data.type === 'timeout') finish({ status: 'timeout', timedOutIndex: Number(data.index) || outcomes.length });
      else if (data.type === 'error') finish({ status: 'error', message: String(data.error) });
    }

    window.addEventListener('message', onMessage);
    guard = setTimeout(() => finish({ status: 'error', message: 'تعذّر تحميل بيئة التشغيل. تحقق من اتصالك.' }), 8000);
    document.body.appendChild(iframe);
  });
}
