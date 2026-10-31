'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Clock3, Lightbulb, Play, RotateCcw, Sparkles, X } from 'lucide-react';
import site from '../styles/site.module.css';
import ws from '../styles/workspace.module.css';
import { runInSandbox, type RunReport } from '../lib/runner-client';
import type { ChallengeCardData, PublicChallenge } from '../lib/types';

const SOLVED_KEY = 'satr:solved';
const draftKey = (slug: string) => `satr:draft:${slug}`;
const fmt = (value: unknown) => { try { return JSON.stringify(value); } catch { return String(value); } };
const fmtArgs = (args: unknown[]) => args.map(fmt).join(', ');

function readSolved(): string[] {
  try { return JSON.parse(localStorage.getItem(SOLVED_KEY) || '[]'); } catch { return []; }
}
function rememberSolved(slug: string) {
  try {
    const list = readSolved();
    if (!list.includes(slug)) localStorage.setItem(SOLVED_KEY, JSON.stringify([...list, slug]));
  } catch { /* التخزين المحلي غير متاح: لا بأس */ }
}

interface Props {
  challenge: PublicChallenge;
  prev?: ChallengeCardData;
  next?: ChallengeCardData;
  /** داخل الصفحة الرئيسية: بلا أزرار التنقل وبرابط إلى صفحة التحدّي الكاملة. */
  embedded?: boolean;
}

export default function ChallengeWorkspace({ challenge, prev, next, embedded = false }: Props) {
  const { slug, visibleTests } = challenge;
  const [code, setCode] = useState(challenge.starter.javascript);
  const [report, setReport] = useState<RunReport | null>(null);
  const [running, setRunning] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [solved, setSolved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const numsRef = useRef<HTMLDivElement>(null);

  // استرجاع المسودة وحالة الحل بعد التحميل (تجنّب اختلاف الترطيب).
  useEffect(() => {
    try { const draft = localStorage.getItem(draftKey(slug)); if (draft !== null) setCode(draft); } catch { /* ignore */ }
    setSolved(readSolved().includes(slug));
    setLoaded(true);
  }, [slug]);

  // حفظ تلقائي للمسودة.
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => { try { localStorage.setItem(draftKey(slug), code); } catch { /* ignore */ } }, 400);
    return () => clearTimeout(timer);
  }, [code, loaded, slug]);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setReport(null);
    const result = await runInSandbox({
      code,
      fn: challenge.functionName,
      tests: visibleTests.map((t) => ({ args: t.args, expected: t.expected })),
    });
    setReport(result);
    setRunning(false);
    if (result.status === 'done' && visibleTests.length > 0 && result.outcomes.length === visibleTests.length && result.outcomes.every((o) => o.ok)) {
      rememberSolved(slug);
      setSolved(true);
    }
  }, [code, running, challenge.functionName, visibleTests, slug]);

  const reset = () => {
    setCode(challenge.starter.javascript);
    setReport(null);
    try { localStorage.removeItem(draftKey(slug)); } catch { /* ignore */ }
    areaRef.current?.focus();
  };

  const passed = report ? report.outcomes.filter((o) => o.ok).length : 0;
  const allPassed = report?.status === 'done' && visibleTests.length > 0 && passed === visibleTests.length;
  const levelClass = challenge.level === 'easy' ? site.levelEasy : challenge.level === 'medium' ? site.levelMedium : site.levelHard;
  const lineCount = Math.max(code.split('\n').length, 6);
  const hintsShown = challenge.hints.slice(0, hintLevel);

  const summary = (() => {
    if (!report) return null;
    if (report.status === 'fatal' || report.status === 'error') return { ok: false, title: 'تعذّر تشغيل الكود', text: report.message || '' };
    if (report.status === 'timeout') {
      return { ok: false, title: 'استغرق حلّك وقتًا طويلًا', text: `توقف التشغيل عند المثال ${(report.timedOutIndex ?? 0) + 1} بعد أكثر من 3 ثوانٍ. جرّب طريقة أسرع أو تأكد من عدم وجود حلقة لا تنتهي.` };
    }
    return allPassed
      ? { ok: true, title: 'اجتزت كل الأمثلة الظاهرة!', text: next ? 'ممتاز! انتقل إلى التحدّي التالي.' : 'ممتاز! أنهيت آخر تحدٍّ في القائمة.' }
      : { ok: false, title: `اجتزت ${passed} من ${visibleTests.length}`, text: 'راجع المثال الذي فشل ثم جرّب مجددًا.' };
  })();

  return (
    <div>
      <div className={site.tryGrid}>
        <article className={site.problemPanel}>
          <div className={site.panelLabel}>
            <span aria-hidden="true">{challenge.icon}</span><span>{challenge.topic}</span>
            <span className={levelClass}>{challenge.levelLabel} · {challenge.points} نقطة</span>
          </div>
          <h3>{challenge.title}</h3>
          <p>{challenge.story}</p>
          <div className={site.taskBox}><b>المطلوب</b><p>{challenge.task}</p></div>
          {challenge.examples.map((ex, i) => (
            <div className={site.exampleBox} key={i}>
              <div><span>المدخل</span><code>{fmtArgs(ex.args)}</code></div>
              <ArrowLeft size={17} aria-hidden="true" />
              <div><span>الناتج المتوقع</span><code>{fmt(ex.expected)}</code></div>
            </div>
          ))}
          {(challenge.inputDesc || challenge.outputDesc || challenge.constraints.length > 0) && (
            <div className={ws.spec}>
              {challenge.inputDesc && <div><b>المدخلات</b>{challenge.inputDesc}</div>}
              {challenge.outputDesc && <div><b>المخرجات</b>{challenge.outputDesc}</div>}
              {challenge.constraints.length > 0 && <div><b>ملاحظات</b><ul>{challenge.constraints.map((c) => <li key={c}>{c}</li>)}</ul></div>}
            </div>
          )}
          {challenge.hints.length > 0 && (
            <div className={ws.hints}>
              {hintsShown.map((hint, i) => (
                <div className={site.tip} key={i}><Sparkles size={17} aria-hidden="true" /><span><b>تلميح {i + 1}:</b> {hint}</span></div>
              ))}
              {hintLevel < challenge.hints.length && (
                <button type="button" className={ws.hintBtn} onClick={() => setHintLevel((l) => l + 1)}>
                  <Lightbulb size={16} aria-hidden="true" /> {hintLevel === 0 ? 'أحتاج تلميحًا' : 'تلميح إضافي'} ({hintLevel}/{challenge.hints.length})
                </button>
              )}
              <p className={ws.hintNote}>عند التصحيح الرسمي، كل مستوى تلميح يخصم جزءًا صغيرًا من نقاط التحدي.</p>
            </div>
          )}
        </article>

        <article className={site.editorPanel}>
          <div className={site.editorHead}>
            <div><span className={site.editorDot} /><b>محرّر الكود</b></div>
            <div className={ws.toolbar}>
              {solved && <span className={ws.solvedBadge}><Check size={14} aria-hidden="true" /> حللته</span>}
              <button type="button" className={ws.ghostBtn} onClick={reset}><RotateCcw size={14} aria-hidden="true" /> الكود الابتدائي</button>
            </div>
          </div>
          <div className={site.editorWrap}>
            <div className={site.lineNums} ref={numsRef} aria-hidden="true">
              {Array.from({ length: lineCount }, (_, i) => <span key={i}>{i + 1}<br /></span>)}
            </div>
            <textarea
              ref={areaRef}
              aria-label="محرر JavaScript"
              spellCheck={false}
              dir="ltr"
              value={code}
              onChange={(e) => { setCode(e.target.value); setReport(null); }}
              onScroll={(e) => { if (numsRef.current) numsRef.current.scrollTop = e.currentTarget.scrollTop; }}
              onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); void run(); } }}
            />
          </div>
          <div className={site.editorFoot}><span><span className={site.statusDot} /> JavaScript</span><span>تُحفظ مسودتك تلقائيًا على جهازك</span></div>
          <div className={site.runRow}>
            <button type="button" className={site.runBtn} onClick={() => void run()} disabled={running}>
              <Play size={16} fill="currentColor" aria-hidden="true" /> {running ? 'جارٍ التشغيل…' : 'شغّل الأمثلة'}
            </button>
            <span><span className={ws.kbd}>Ctrl</span> + <span className={ws.kbd}>Enter</span></span>
          </div>

          <div className={ws.results} aria-live="polite">
            {summary && (
              <div className={`${ws.summary} ${summary.ok ? ws.summaryOk : ws.summaryBad}`}>
                <span>{summary.ok ? <Check size={18} aria-hidden="true" /> : <Clock3 size={18} aria-hidden="true" />}</span>
                <div><b>{summary.title}</b><p>{summary.text}</p></div>
              </div>
            )}
            {report && report.outcomes.length > 0 && (
              <ul className={ws.tests}>
                {report.outcomes.map((o) => {
                  const t = visibleTests[o.index];
                  return (
                    <li key={o.index} className={`${ws.test} ${o.ok ? ws.ok : ws.bad}`}>
                      <div className={ws.testHead}>{o.ok ? <Check size={15} aria-hidden="true" /> : <X size={15} aria-hidden="true" />} المثال {o.index + 1}{o.ok ? ' — نجح' : ' — فشل'}</div>
                      {!o.ok && t && (
                        <>
                          <div className={ws.row}><span>المدخل</span><code>{fmtArgs(t.args)}</code></div>
                          <div className={ws.row}><span>المتوقع</span><code>{fmt(t.expected)}</code></div>
                          <div className={ws.row}><span>الفعلي</span><code>{o.error ? `خطأ: ${o.error}` : o.actual ?? 'undefined'}</code></div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {report && report.logs.length > 0 && <div className={ws.logs}>{report.logs.join('\n')}</div>}
          </div>
        </article>
      </div>

      <p className={ws.note}>
        هذا التشغيل يجرّب <b>الأمثلة الظاهرة فقط</b> داخل بيئة معزولة في متصفحك، وبلا أي اتصال بالإنترنت. التصحيح الرسمي بالاختبارات المخفية سيكون على الخادم.
      </p>

      {embedded ? (
        <Link className={ws.embedLink} href={`/challenges/${slug}`}>افتح صفحة التحدّي الكاملة <ArrowLeft size={16} aria-hidden="true" /></Link>
      ) : (
        <nav className={ws.pager} aria-label="التنقل بين التحديات">
          {prev ? <Link className={ws.pagerLink} href={`/challenges/${prev.slug}`}><ArrowRight size={18} aria-hidden="true" /><span><small>السابق</small>{prev.title}</span></Link> : <span />}
          {next ? <Link className={ws.pagerLink} href={`/challenges/${next.slug}`}><span><small>التالي</small>{next.title}</span><ArrowLeft size={18} aria-hidden="true" /></Link> : <span />}
        </nav>
      )}
    </div>
  );
}
