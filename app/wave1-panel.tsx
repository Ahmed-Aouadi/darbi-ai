'use client';

import { useEffect, useMemo, useState } from 'react';
import { Award, BookOpen, Flame, Gem, Lightbulb, Play, RotateCcw, ShieldCheck, Sparkles, Target } from 'lucide-react';
import challengeData from '../content/challenges.json';
import styles from './wave1-panel.module.css';

type Challenge = (typeof challengeData)[number];
type SavedState = { gems: number; streak: number; freezes: number; solved: string[]; hints: Record<string, number>; reviewed: string[]; questDay: string; questClaims: string[] };

const initialState: SavedState = { gems: 0, streak: 1, freezes: 1, solved: [], hints: {}, reviewed: [], questDay: '', questClaims: [] };
const questTemplates = [
  { id: 'solve', title: 'حلّ تحديًا واحدًا', goal: 1, reward: 5 },
  { id: 'hintless', title: 'حلّ تحديًا دون تلميح', goal: 1, reward: 5 },
  { id: 'review', title: 'راجع تحديًا سابقًا', goal: 1, reward: 5 },
];
const hintsFor = (challenge: Challenge) => {
  const original = (challenge as any).hint || 'قسّم المسألة إلى خطوات صغيرة، ثم اختبر كل خطوة على مثال بسيط.';
  return [
    'ابدأ بتحديد شكل المدخلات والمخرجات، ثم اكتب مثالًا صغيرًا بيدك.',
    original,
    'اكتب الحل على مراحل: عالج الحالات الخاصة أولًا، ثم طبّق الفكرة الأساسية، وأخيرًا أعد النتيجة المطلوبة.',
  ];
};
const conceptFor = (challenge: Challenge) => ({
  title: challenge.topic,
  explanation: `الفكرة هنا هي تحويل مشكلة من الحياة اليومية إلى خطوات واضحة يمكن للحاسوب تنفيذها. في تحدي «${challenge.title}»، حدّد البيانات أولًا ثم اختر العملية المناسبة.`,
  example: 'مدخلات واضحة ← معالجة خطوة بخطوة ← نتيجة يمكن اختبارها',
});

export default function Wave1Panel() {
  const [selected, setSelected] = useState(0);
  const [state, setState] = useState<SavedState>(initialState);
  const [hintLevel, setHintLevel] = useState(0);
  const [showEditorial, setShowEditorial] = useState(false);
  const [showConcept, setShowConcept] = useState(false);
  const [customArgs, setCustomArgs] = useState('["08:20", ["06:30", "09:15"]]');
  const [customResult, setCustomResult] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customRunning, setCustomRunning] = useState(false);
  const [notice, setNotice] = useState('');
  const challenge = challengeData[selected] as Challenge;
  const hints = useMemo(() => hintsFor(challenge), [challenge]);
  const concept = useMemo(() => conceptFor(challenge), [challenge]);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Algiers', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

  useEffect(() => {
    try {
      const saved = localStorage.getItem('satr-wave1-demo');
      if (saved) setState({ ...initialState, ...JSON.parse(saved) });
    } catch { /* Ignore invalid local demo state. */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem('satr-wave1-demo', JSON.stringify(state)); } catch { /* Storage may be unavailable. */ }
  }, [state]);
  useEffect(() => {
    if (state.questDay !== today) setState(previous => ({ ...previous, questDay: today, questClaims: [] }));
  }, [today, state.questDay]);

  const completed = state.solved.includes(challenge.slug);
  const currentHint = state.hints[challenge.slug] || 0;
  const hintPenalty = currentHint === 0 ? 0 : currentHint * 5;
  const markSolved = () => {
    if (completed) { setNotice('هذا التحدي مسجل كمكتمل في هذه التجربة.'); return; }
    setState(previous => ({ ...previous, solved: [...previous.solved, challenge.slug], gems: previous.gems + Math.max(1, challenge.points - hintPenalty) }));
    setNotice('سُجّل الحل في التجربة المحلية وأضيفت الجواهر التجريبية.');
  };
  const revealHint = () => {
    if (currentHint >= 3) return;
    setState(previous => ({ ...previous, hints: { ...previous.hints, [challenge.slug]: currentHint + 1 } }));
    setHintLevel(currentHint + 1);
  };
  const claimQuest = (id: string, reward: number) => {
    if (state.questClaims.includes(id)) return;
    setState(previous => ({ ...previous, questClaims: [...previous.questClaims, id], gems: previous.gems + reward }));
    setNotice('تمت إضافة مكافأة المهمة إلى رصيد التجربة المحلية.');
  };
  const useFreeze = () => {
    if (state.freezes < 1) { setNotice('لا توجد حماية متاحة في التجربة.'); return; }
    setState(previous => ({ ...previous, freezes: previous.freezes - 1, streak: Math.max(1, previous.streak) }));
    setNotice('استخدمت حماية السلسلة التجريبية. لا تُخصم الجواهر.');
  };
  const markReviewed = () => {
    if (!state.reviewed.includes(challenge.slug)) setState(previous => ({ ...previous, reviewed: [...previous.reviewed, challenge.slug], gems: previous.gems + 2 }));
    setNotice('تم تسجيل المراجعة التجريبية.');
  };
  const runCustom = () => {
    setCustomResult('');
    let args: unknown;
    try {
      if (customArgs.length > 10000) throw new Error('المدخلات أكبر من 10 كيلوبايت.');
      args = JSON.parse(customArgs);
      if (!Array.isArray(args)) throw new Error('يجب أن تكون المدخلات مصفوفة JSON.');
      const serialized = JSON.stringify(args);
      if (serialized.length > 10000) throw new Error('المدخلات أكبر من 10 كيلوبايت.');
      if (/(?:__proto__|prototype|constructor)/i.test(serialized)) throw new Error('هذا النوع من المدخلات غير مسموح.');
    } catch (error) { setCustomResult(error instanceof Error ? error.message : 'JSON غير صالح.'); return; }
    setCustomRunning(true);
    const source = `self.onmessage=({data})=>{try{const fn=new Function(data.code+"\\n; return typeof "+data.name+"==='function'?"+data.name+":null;")();if(typeof fn!=='function')throw new Error('لم أجد الدالة '+data.name);const result=fn(...data.args);self.postMessage({ok:true,result});}catch(e){self.postMessage({ok:false,error:String(e&&e.message||e)})}}`;
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    const worker = new Worker(url);
    const timeout = window.setTimeout(() => { worker.terminate(); URL.revokeObjectURL(url); setCustomRunning(false); setCustomResult('انتهت مهلة التشغيل بعد 3 ثوانٍ.'); }, 3000);
    worker.onmessage = event => { window.clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(url); setCustomRunning(false); setCustomResult(event.data.ok ? JSON.stringify(event.data.result, null, 2) : event.data.error); };
    worker.onerror = () => { window.clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(url); setCustomRunning(false); setCustomResult('تعذّر تشغيل الكود.'); };
    worker.postMessage({ code: customCode || challenge.starter.javascript, name: challenge.functionName, args });
  };

  return <section className={styles.section} id="learning-tools" dir="rtl">
    <div className={styles.heading}><span className={styles.kicker}>مزايا التعلّم — نسخة تجريبية محلية</span><h2>تعلّم، راجع، واجمع الجواهر</h2><p>تعمل هذه الواجهة داخل متصفحك دون حساب. لا تُعدّ النقاط أو الجواهر المحلية سجلًا رسميًا.</p></div>
    <div className={styles.stats}>
      <div><Gem /><span><b>{state.gems}</b><small>جوهرة تجريبية</small></span></div>
      <div><Flame /><span><b>{state.streak}</b><small>أيام السلسلة</small></span></div>
      <div><ShieldCheck /><span><b>{state.freezes}/2</b><small>حماية السلسلة</small></span><button onClick={useFreeze} disabled={!state.freezes}>استخدم</button></div>
      <div><Award /><span><b>{state.solved.length}/{challengeData.length}</b><small>تحديات مكتملة</small></span></div>
    </div>
    <div className={styles.layout}>
      <article className={styles.card}>
        <div className={styles.cardTitle}><Target /><h3>خطة اليوم</h3></div>
        {questTemplates.map(q => <div className={styles.quest} key={q.id}><div><b>{q.title}</b><small>المكافأة: {q.reward} جواهر</small></div><button onClick={() => claimQuest(q.id, q.reward)} disabled={state.questClaims.includes(q.id)}>{state.questClaims.includes(q.id) ? 'تم الاستلام' : 'استلام'}</button></div>)}
        <p className={styles.smallNote}>المهام والمكافآت محفوظة على هذا الجهاز فقط في هذه النسخة.</p>
      </article>
      <article className={styles.card}>
        <div className={styles.cardTitle}><BookOpen /><h3>خريطة المهارات والمراجعة</h3></div>
        <div className={styles.skillRow}><span>حل المشكلات</span><div><i style={{ width: `${Math.min(100, state.solved.length / challengeData.length * 100)}%` }} /></div><b>{Math.round(state.solved.length / challengeData.length * 100)}%</b></div>
        <div className={styles.skillRow}><span>المراجعة المتباعدة</span><div><i style={{ width: `${Math.min(100, state.reviewed.length / challengeData.length * 100)}%` }} /></div><b>{Math.round(state.reviewed.length / challengeData.length * 100)}%</b></div>
        <label className={styles.label}>اختر تحديًا</label><select value={selected} onChange={e => { setSelected(Number(e.target.value)); setHintLevel(0); setShowEditorial(false); setShowConcept(false); setCustomResult(''); }} className={styles.select}>{challengeData.map((item, i) => <option key={item.slug} value={i}>{i + 1}. {item.title}</option>)}</select>
        <div className={styles.challengeInfo}><b>{challenge.title}</b><span>{challenge.topic} · {challenge.level === 'easy' ? 'سهل' : challenge.level === 'medium' ? 'متوسط' : 'صعب'}</span><p>{challenge.task}</p></div>
        <div className={styles.actions}><button onClick={markSolved} disabled={completed}>{completed ? 'مكتمل ✓' : 'سجّل الحل التجريبي'}</button><button className={styles.secondary} onClick={markReviewed}><RotateCcw size={15}/> راجعت التحدي</button></div>
      </article>
      <article className={styles.card}>
        <div className={styles.cardTitle}><Lightbulb /><h3>تلميحات متدرجة</h3></div>
        <p>كشف التلميح يقلل نقاط الحل التجريبي بنسبة {hintPenalty}%.</p>
        {currentHint > 0 && <div className={styles.hintBox}><b>التلميح {currentHint} من 3</b><p>{hints[currentHint - 1]}</p></div>}
        <button onClick={revealHint} disabled={currentHint >= 3} className={styles.primary}>{currentHint >= 3 ? 'كشفت كل التلميحات' : `اكشف التلميح ${currentHint + 1}`}</button>
        <div className={styles.divider} />
        <div className={styles.cardTitle}><Sparkles /><h3>بطاقة المفهوم</h3></div>
        <p>ملخص سريع للفكرة التي تحتاجها لحل هذا النوع من المسائل.</p>
        <button className={styles.secondary} onClick={() => setShowConcept(!showConcept)}>{showConcept ? 'إخفاء البطاقة' : 'عرض بطاقة المفهوم'}</button>
        {showConcept && <div className={styles.hintBox}><b>{concept.title}</b><p>{concept.explanation}</p><small>{concept.example}</small></div>}
        <div className={styles.divider} />
        <div className={styles.cardTitle}><BookOpen /><h3>الشرح التحريري</h3></div>
        <p>يظهر بعد تسجيل الحل في هذه التجربة.</p>
        <button className={styles.secondary} disabled={!completed} onClick={() => setShowEditorial(!showEditorial)}>{showEditorial ? 'إخفاء الشرح' : 'افتح الشرح بعد الحل'}</button>
        {showEditorial && <div className={styles.hintBox}><b>الفكرة</b><p>{hints[1]}</p><p>حلّل المدخلات، تعامل مع الحالات الحدّية، ثم اختبر النتيجة على الأمثلة المتاحة. لا تعتمد على المثال الواحد فقط.</p><pre>{challenge.reference_python || 'اكتب الحل على مراحل واختبر كل مرحلة.'}</pre></div>}
      </article>
      <article className={styles.card}>
        <div className={styles.cardTitle}><Play /><h3>تشغيل مدخلاتك الخاصة</h3></div>
        <p>هذا التشغيل لا يمنح نقاطًا ولا يقارن النتيجة بإجابة متوقعة.</p>
        <label className={styles.label}>كود JavaScript (يمكنك تعديله)</label><textarea className={styles.code} dir="ltr" spellCheck={false} value={customCode || challenge.starter.javascript} onChange={e => setCustomCode(e.target.value)} />
        <label className={styles.label}>المدخلات بصيغة JSON — مصفوفة معاملات الدالة</label><textarea className={styles.args} dir="ltr" value={customArgs} onChange={e => setCustomArgs(e.target.value)} />
        <button className={styles.primary} onClick={runCustom} disabled={customRunning}><Play size={15}/>{customRunning ? 'جارٍ التشغيل…' : 'شغّل المدخلات'}</button>
        {customResult && <pre className={styles.output} dir="ltr">{customResult}</pre>}
      </article>
    </div>
    {notice && <p role="status" className={styles.notice}>{notice}</p>}
    <p className={styles.securityNote}>تنبيه أمني: عامل المتصفح يعزل التنفيذ عن واجهة الصفحة ويضع مهلة زمنية، لكنه ليس بيئة تنفيذ آمنة ضد الشيفرات العدائية. لا تُدخل شيفرات غير موثوقة؛ التشغيل الرسمي يجب أن يكون على خادم معزول.</p>
  </section>;
}
