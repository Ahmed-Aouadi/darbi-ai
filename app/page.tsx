'use client';

import { useRef, useState } from 'react';
import { BookOpen, BrainCircuit, CalendarDays, Check, ChevronLeft, CircleHelp, Clock3, FileText, GraduationCap, Layers3, Lightbulb, LoaderCircle, Menu, MessageCircle, Sparkles, Target, Upload, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import styles from './page.module.css';

// PDF.js worker is loaded from the same installed package version.
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

type Task = 'summary' | 'quiz' | 'explain' | 'flashcards';
type QuizQuestion = { question: string; options: string[]; answer: number; explanation: string };
type Flashcard = { question: string; answer: string };
type Result = { task: Task; title: string; text: string; quiz?: QuizQuestion[]; cards?: Flashcard[] };

const taskLabels: Record<Task, string> = { summary: 'تلخيص الدرس', quiz: 'إنشاء اختبار', explain: 'شرح مبسّط', flashcards: 'بطاقات المراجعة' };

export default function Home() {
  const [lesson, setLesson] = useState('');
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeTask, setActiveTask] = useState<Task>('summary');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function extractPdf(file: File) {
    const buffer = await file.arrayBuffer();
    const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = '';
    for (let pageNo = 1; pageNo <= Math.min(pdf.numPages, 80); pageNo++) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n\n';
    }
    if (!text.trim()) throw new Error('لم أتمكن من استخراج النص. قد يكون الملف ممسوحًا ضوئيًا كصور؛ انسخ النص أو استخدم ملفًا يحتوي على نص قابل للتحديد.');
    return text;
  }

  async function onFileChange(file?: File) {
    if (!file) return;
    setError(''); setFileName(file.name);
    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) text = await extractPdf(file);
      else if (file.type.startsWith('text/') || /\.(txt|md|csv)$/i.test(file.name)) text = await file.text();
      else throw new Error('الملفات المدعومة حاليًا هي PDF وTXT وMD وCSV.');
      setLesson(text.slice(0, 50000));
      setResult(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذرت قراءة الملف.'); setFileName(''); }
  }

  function makeLocalResult(task: Task, source: string): string {
    const clean = source.replace(/\s+/g, ' ').trim();
    const sentences = (source.match(/[^.!؟?\n]+[.!؟?]?/g) || [])
      .map((s) => s.trim())
      .filter((s) => s.length > 25);
    const chunks = sentences.length ? sentences : clean.split(/[،؛,;]/).map((s) => s.trim()).filter((s) => s.length > 20);
    const words = clean.match(/[\p{L}\p{N}]{4,}/gu) || [];
    const stop = new Set(['التي','الذي','الذين','على','إلى','إليها','عليها','هذا','هذه','ذلك','تلك','هناك','حيث','عند','بين','منها','فيها','كان','تكون','يمكن','يكون','كما','وهي','وهو','أنها','أنه','إنها','إنه','بعد','قبل','أكثر','أقل','جميع','بعض','كل','عن','مع','من','إلى','في','ما','لا','لم','لن','ثم','قد','هو','هي','هم','هن','هذا','هذه','the','and','that','with','from','this','have','are','for','was','were','into','their','they','which','what','when','where','your','you']);
    const frequency = new Map<string, number>();
    words.forEach((word) => {
      const key = word.toLowerCase();
      if (!stop.has(key)) frequency.set(key, (frequency.get(key) || 0) + 1);
    });
    const keywords = [...frequency.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([word]) => word);
    const take = (count: number) => chunks.slice(0, count);
    if (task === 'summary') {
      const selected = chunks.length > 6
        ? [...chunks].sort((a, b) => b.length - a.length).slice(0, Math.min(6, chunks.length))
        : chunks;
      return 'ملخص من النص الذي أدخلته\n\n' + (selected.length
        ? selected.map((s, i) => `${i + 1}. ${s}`).join('\n\n')
        : clean) + (keywords.length ? '\n\nمصطلحات متكررة في الدرس: ' + keywords.slice(0, 8).join('، ') : '');
    }
    if (task === 'quiz') {
      const candidates = chunks.filter((s) => s.split(/\s+/).length >= 6).slice(0, 8);
      if (!candidates.length) return 'النص قصير جدًا لإنشاء أسئلة مناسبة. أضف فقرات أخرى إلى الدرس ثم حاول مجددًا.';
      return 'اختبر فهمك — حاول الإجابة قبل إظهار الإجابة النموذجية\n\n' + candidates.map((s, i) => {
        const term = keywords.find((word) => s.toLowerCase().includes(word.toLowerCase()));
        const termIndex = term ? s.toLowerCase().indexOf(term.toLowerCase()) : -1;
        const answer = termIndex >= 0 ? s.slice(0, termIndex) + '________' + s.slice(termIndex + term!.length) : s.split(/\s+/).slice(0, Math.max(3, Math.floor(s.split(/\s+/).length / 2))).join(' ') + ' ________';
        return `س${i + 1}: أكمل العبارة التالية: ${answer}\nالإجابة النموذجية: ${s}`;
      }).join('\n\n');
    }
    if (task === 'explain') {
      return 'شرح منظّم اعتمادًا على نص الدرس\n\n' +
        'الفكرة العامة: ' + (chunks[0] || clean.slice(0, 350)) + '\n\n' +
        'الأفكار الأساسية:\n' + take(5).map((s, i) => `${i + 1}. ${s}`).join('\n\n') +
        (keywords.length ? '\n\nمصطلحات يجدر بك فهمها: ' + keywords.slice(0, 8).join('، ') : '') +
        '\n\nطريقة المراجعة: اقرأ كل فكرة، ثم أعد شرحها بكلماتك، واكتب مثالًا من عندك قبل الانتقال إلى الفكرة التالية.';
    }
    const cards = (chunks.length ? chunks : [clean]).slice(0, 10);
    return 'بطاقات المراجعة — غطِّ الإجابة وحاول تذكّرها\n\n' + cards.map((s, i) => {
      const term = keywords.find((word) => s.toLowerCase().includes(word.toLowerCase()));
      const question = term ? `ما الفكرة أو المعلومة المتعلقة بـ «${term}»؟` : `ما الفكرة الأساسية في الجزء ${i + 1} من الدرس؟`;
      return `البطاقة ${i + 1}\nالسؤال: ${question}\nالإجابة: ${s}`;
    }).join('\n\n────────────\n\n');
  }

  function splitLesson(source: string): string[] {
    return source.split(/(?<=[.!؟?])\\s+|\\n+/).map((part) => part.trim()).filter((part) => part.length > 25);
  }

  function buildQuiz(source: string): QuizQuestion[] {
    const chunks = splitLesson(source);
    if (chunks.length < 2) return [];
    return chunks.slice(0, Math.min(8, chunks.length)).map((sentence, index) => {
      const options = [sentence];
      for (let step = 1; step < chunks.length && options.length < 4; step++) {
        const candidate = chunks[(index + step) % chunks.length];
        if (!options.includes(candidate)) options.push(candidate);
      }
      const answer = (index * 3 + 1) % options.length;
      const shuffled = [...options];
      [shuffled[0], shuffled[answer]] = [shuffled[answer], shuffled[0]];
      return {
        question: `أيّ عبارة وردت في الدرس؟`,
        options: shuffled,
        answer,
        explanation: sentence
      };
    });
  }

  function buildFlashcards(source: string): Flashcard[] {
    const chunks = splitLesson(source);
    const words = source.match(/[\\p{L}\\p{N}]{4,}/gu) || [];
    const frequency = new Map<string, number>();
    const stop = new Set(['التي','الذي','الذين','على','إلى','هذا','هذه','ذلك','تلك','هناك','حيث','عند','بين','منها','فيها','كان','تكون','يمكن','يكون','كما','وهي','وهو','بعد','قبل','أكثر','أقل','جميع','بعض','كل','عن','مع','في','ما','لا','لم','لن','ثم','قد','هو','هي','هم','هن']);
    words.forEach((word) => { const key = word.toLowerCase(); if (!stop.has(key)) frequency.set(key, (frequency.get(key) || 0) + 1); });
    const keywords = [...frequency.entries()].sort((a,b) => b[1]-a[1]).map(([word]) => word);
    return (chunks.length ? chunks : [source.trim()]).slice(0, 12).map((sentence, index) => {
      const term = keywords.find((word) => sentence.toLowerCase().includes(word.toLowerCase()));
      return {
        question: term ? `ما المعلومة الأساسية المتعلقة بـ «${term}»؟` : `ما الفكرة الأساسية في الجزء ${index + 1}؟`,
        answer: sentence
      };
    });
  }


  async function runTask(task: Task) {
    setActiveTask(task); setError('');
    if (lesson.trim().length < 30) { setError('أضف نص الدرس أو ارفع ملفًا أولًا (30 حرفًا على الأقل).'); return; }
    setBusy(true); setResult(null); setQuizAnswers({}); setQuizSubmitted(false); setFlashIndex(0); setFlashFlipped(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 120));
      if (task === 'quiz') {
        const quiz = buildQuiz(lesson);
        if (quiz.length < 2) { setError('أضف فقرتين أو أكثر لإنشاء اختبار متنوع.'); return; }
        setResult({ task, title: taskLabels[task], text: '', quiz });
      } else if (task === 'flashcards') {
        const cards = buildFlashcards(lesson);
        setResult({ task, title: taskLabels[task], text: '', cards });
      } else {
        const output = makeLocalResult(task, lesson);
        setResult({ task, title: taskLabels[task], text: output });
      }
    } catch {
      setError('تعذّر تجهيز النتيجة. حاول تقليل طول النص أو تقسيم الدرس إلى أجزاء.');
    } finally { setBusy(false); }
  }

  return <main className={styles.app}>
    <aside className={styles.sidebar}>
      <a className={styles.brand} href="#home"><span className={styles.brandIcon}><GraduationCap size={25}/></span><span><b>دَرْبي</b><small>تعلّم بذكاء</small></span><span className={styles.aiTag}>AI</span></a>
      <div className={styles.sideLabel}>مساحة التعلّم</div>
      <a className={`${styles.navItem} ${styles.navActive}`} href="#home"><Layers3 size={18}/> لوحة التعلّم</a>
      <a className={styles.navItem} href="#workspace"><BookOpen size={18}/> مساعد الدروس</a>
      <button className={styles.navItem} onClick={() => runTask('quiz')}><CircleHelp size={18}/> اختبار من درسي</button>
      <button className={styles.navItem} onClick={() => runTask('flashcards')}><Target size={18}/> بطاقات المراجعة</button>
      <div className={styles.sideLabel}>حسابك</div>
      <a className={styles.navItem} href="#plan"><CalendarDays size={18}/> خطة المراجعة</a>
      <div className={styles.sidebarBottom}><div className={styles.tipIcon}><Lightbulb size={18}/></div><b>خطوة صغيرة كل يوم</b><p>راجع درسًا واحدًا اليوم، وستقترب من هدفك أكثر.</p><span className={styles.tipProgress}><i/></span><small>ابدأ بأول درس لك</small></div>
      <div className={styles.sideFooter}>نسخة تجريبية · دَرْبي AI</div>
    </aside>

    <section className={styles.main} id="home">
      <header className={styles.topbar}><button className={styles.mobileMenu} aria-label="القائمة"><Menu size={21}/></button><div className={styles.breadcrumb}>مساحة التعلّم <ChevronLeft size={15}/> <b>الرئيسية</b></div><div className={styles.topRight}><span className={styles.onlineDot}/> مساحة تعلّمك جاهزة <div className={styles.avatar}>ط</div></div></header>
      <div className={styles.content}>
        <section className={styles.welcome}><div><div className={styles.eyebrow}><Sparkles size={15}/> تعلّم بطريقة أذكى</div><h1>كل درس، فرصة جديدة <span>للنجاح.</span></h1><p>أدوات مراجعة تعمل مباشرة على جهازك، دون مفتاح API أو اشتراك.</p></div><div className={styles.heroArt}><div className={styles.heroGlow}/><div className={styles.heroBook}><BookOpen size={51}/><Sparkles className={styles.sparkleOne} size={20}/><span className={styles.heroOrbit}>AI</span></div><div className={styles.floatCard}><Check size={15}/> تعلّمك يتقدّم</div></div></section>

        <div className={styles.sectionHeading}><div><h2>ابدأ جلسة تعلّم</h2><p>أدخل درسًا، واختر كيف تريد أن تتعلّمه.</p></div><span className={styles.stepPill}><span>01</span> اختر الدرس</span></div>
        <section className={styles.workspace} id="workspace">
          <div className={styles.inputHead}><div className={styles.inputTitleIcon}><FileText size={20}/></div><div><h3>ما الدرس الذي تراجعه اليوم؟</h3><p>الصق نص الدرس أو ارفع ملفًا. تتم المعالجة محليًا في متصفحك.</p></div><span className={styles.secureLabel}><Check size={13}/> تحكّم في ملفاتك</span></div>
          <textarea className={styles.lessonInput} value={lesson} onChange={e => {setLesson(e.target.value); setResult(null);}} placeholder={'الصق نص الدرس هنا...\n\nمثال: يُعرَّف التمثيل الضوئي بأنه العملية التي تستخدم فيها النباتات ضوء الشمس لتحويل الماء وثاني أكسيد الكربون إلى سكريات وأكسجين.'} maxLength={50000} aria-label="نص الدرس"/>
          <div className={styles.inputFooter}><div className={styles.fileActions}><button className={styles.uploadBtn} onClick={() => fileInput.current?.click()}><Upload size={16}/> رفع ملف PDF أو نص</button><input ref={fileInput} type="file" accept=".pdf,.txt,.md,.csv,text/plain,application/pdf" hidden onChange={e => onFileChange(e.target.files?.[0])}/>{fileName && <span className={styles.fileName}><FileText size={13}/>{fileName}<button aria-label="إزالة الملف" onClick={() => {setFileName('');setLesson('');if(fileInput.current)fileInput.current.value='';}}><X size={13}/></button></span>}</div><span className={styles.charCount}>{lesson.length.toLocaleString('ar')} / ٥٠٬٠٠٠</span></div>
          <div className={styles.actionDivider}/><div className={styles.actionHead}><span>ماذا تريد أن تفعل بالدرس؟</span><span className={styles.languageSelect}>لغة النتيجة: العربية · معالجة محلية</span></div>
          <div className={styles.taskGrid}>
            <button className={`${styles.taskCard} ${activeTask === 'summary' ? styles.taskSelected : ''}`} onClick={() => runTask('summary')} disabled={busy}><span className={`${styles.taskIcon} ${styles.purple}`}><FileText size={20}/></span><span><b>لخّص الدرس</b><small>أهم الأفكار في نقاط</small></span><ChevronLeft size={17} className={styles.taskArrow}/></button>
            <button className={`${styles.taskCard} ${activeTask === 'quiz' ? styles.taskSelected : ''}`} onClick={() => runTask('quiz')} disabled={busy}><span className={`${styles.taskIcon} ${styles.orange}`}><CircleHelp size={20}/></span><span><b>اختبر نفسك</b><small>أسئلة مع تصحيح وشرح</small></span><ChevronLeft size={17} className={styles.taskArrow}/></button>
            <button className={`${styles.taskCard} ${activeTask === 'explain' ? styles.taskSelected : ''}`} onClick={() => runTask('explain')} disabled={busy}><span className={`${styles.taskIcon} ${styles.green}`}><MessageCircle size={20}/></span><span><b>اشرح لي ببساطة</b><small>فهم تدريجي وأمثلة</small></span><ChevronLeft size={17} className={styles.taskArrow}/></button>
            <button className={`${styles.taskCard} ${activeTask === 'flashcards' ? styles.taskSelected : ''}`} onClick={() => runTask('flashcards')} disabled={busy}><span className={`${styles.taskIcon} ${styles.blue}`}><Layers3 size={20}/></span><span><b>بطاقات المراجعة</b><small>سؤال وجواب للحفظ</small></span><ChevronLeft size={17} className={styles.taskArrow}/></button>
          </div>
          {error && <div className={styles.errorBox} role="alert"><CircleHelp size={18}/><span>{error}</span><button onClick={() => setError('')} aria-label="إغلاق"><X size={16}/></button></div>}
          {busy && <div className={styles.loadingBox}><LoaderCircle className={styles.spinner} size={22}/><div><b>نحضّر لك تجربة التعلّم...</b><p>نرتّب محتوى الدرس محليًا دون اتصال بخدمة ذكاء اصطناعي.</p></div></div>}
        </section>

        {result && <section className={styles.resultCard} aria-live="polite">
          <div className={styles.resultHeader}><div className={styles.resultBadge}><Sparkles size={17}/></div><div><h3>{result.title}</h3><p>{result.task === 'quiz' ? 'أجب عن الأسئلة ثم اعرض التصحيح' : result.task === 'flashcards' ? 'اقلب البطاقة لتكشف الإجابة' : 'تم الإنشاء اعتمادًا على نص درسك'}</p></div>
          {result.text && <button className={styles.copyButton} onClick={() => navigator.clipboard?.writeText(result.text).then(() => setError('تم نسخ النتيجة إلى الحافظة.')).catch(() => setError('تعذر النسخ تلقائيًا؛ حدّد النص وانسخه.'))}>نسخ النتيجة</button>}
          </div>
          {result.task === 'quiz' && result.quiz && <div className={styles.quizArea}>
            <div className={styles.quizSummary}><span>اختبار قصير</span><b>{Object.keys(quizAnswers).length} / {result.quiz.length} إجابات</b></div>
            <div className={styles.quizProgress}><i style={{width: `${Object.keys(quizAnswers).length / result.quiz.length * 100}%`}} /></div>
            {result.quiz.map((question, index) => <article className={styles.questionCard} key={index}>
              <div className={styles.questionMeta}><span>السؤال {index + 1}</span><span>اختيار من متعدد</span></div>
              <h4>{question.question}</h4>
              <div className={styles.optionsList}>{question.options.map((option, optionIndex) => {
                const selected = quizAnswers[index] === optionIndex;
                const correct = question.answer === optionIndex;
                const optionClass = quizSubmitted ? (correct ? styles.optionCorrect : selected ? styles.optionWrong : '') : selected ? styles.optionSelected : '';
                return <button key={optionIndex} className={`${styles.quizOption} ${optionClass}`} disabled={quizSubmitted} onClick={() => setQuizAnswers((current) => ({...current, [index]: optionIndex}))}><span className={styles.optionLetter}>{['أ','ب','ج','د'][optionIndex]}</span><span>{option}</span>{quizSubmitted && correct && <Check size={17}/>}</button>;
              })}</div>
              {quizSubmitted && <p className={styles.explanation}><b>التفسير:</b> {question.explanation}</p>}
            </article>)}
            <div className={styles.quizFooter}>{quizSubmitted ? <><b>نتيجتك: {result.quiz.filter((q, i) => quizAnswers[i] === q.answer).length} من {result.quiz.length}</b><button className={styles.primaryAction} onClick={() => {setQuizAnswers({});setQuizSubmitted(false);}}>أعد الاختبار</button></> : <button className={styles.primaryAction} onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length !== result.quiz.length}>تصحيح الإجابات</button>}</div>
          </div>}
          {result.task === 'flashcards' && result.cards && <div className={styles.flashArea}>
            <div className={styles.flashTop}><span>بطاقاتك التعليمية</span><b>{flashIndex + 1} <small>/ {result.cards.length}</small></b></div>
            <button className={`${styles.flashCard} ${flashFlipped ? styles.flashBack : ''}`} onClick={() => setFlashFlipped((value) => !value)} aria-label={flashFlipped ? 'إظهار السؤال' : 'إظهار الإجابة'}>
              <span className={styles.flashKicker}>{flashFlipped ? 'الإجابة' : 'سؤال للمراجعة'}</span>
              <span className={styles.flashMain}>{flashFlipped ? result.cards[flashIndex].answer : result.cards[flashIndex].question}</span>
              <span className={styles.flashHint}><Layers3 size={15}/>{flashFlipped ? 'اضغط للعودة إلى السؤال' : 'اضغط على البطاقة لكشف الإجابة'}</span>
            </button>
            <div className={styles.flashControls}><button disabled={flashIndex === 0} onClick={() => {setFlashIndex((i) => i - 1);setFlashFlipped(false);}}>السابق</button><div className={styles.flashDots}>{result.cards.map((_, i) => <button key={i} aria-label={`البطاقة ${i+1}`} className={i === flashIndex ? styles.flashDotActive : ''} onClick={() => {setFlashIndex(i);setFlashFlipped(false);}} />)}</div><button disabled={flashIndex === result.cards!.length - 1} onClick={() => {setFlashIndex((i) => i + 1);setFlashFlipped(false);}}>التالي <ChevronLeft size={15}/></button></div>
          </div>}
          {result.text && <div className={styles.resultText}>{result.text}</div>}
        </section>}

        <div className={styles.sectionHeading} id="plan"><div><h2>طريقة مذاكرة فعّالة</h2><p>خطوات بسيطة تساعدك على الاستفادة من كل جلسة.</p></div></div>
        <section className={styles.stepsGrid}><article className={styles.stepCard}><span className={styles.stepNumber}>١</span><div className={styles.stepIcon}><BookOpen size={19}/></div><h3>افهم أولًا</h3><p>ابدأ بملخص أو شرح مبسّط، ولا تحفظ ما لم تفهمه.</p></article><article className={styles.stepCard}><span className={styles.stepNumber}>٢</span><div className={styles.stepIcon}><BrainCircuit size={19}/></div><h3>اختبر نفسك</h3><p>أجب عن الأسئلة دون الرجوع إلى الدرس، ثم راجع أخطاءك.</p></article><article className={styles.stepCard}><span className={styles.stepNumber}>٣</span><div className={styles.stepIcon}><Clock3 size={19}/></div><h3>راجع لاحقًا</h3><p>عد إلى الأفكار الصعبة في اليوم التالي ثم بعد عدة أيام.</p></article></section>
        <footer className={styles.footer}><span>دَرْبي AI</span><span>تعلّم بذكاء، وتقدّم بخطوات ثابتة.</span><a href="#home">العودة للأعلى ↑</a></footer>
      </div>
    </section>
  </main>;
}
