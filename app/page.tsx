'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlarmClock, ArrowDownLeft, ArrowLeft, ArrowUpLeft, BookOpen, Check, CheckCheck,
  ChevronLeft, CircleHelp, Coffee, Flame, Focus, Leaf, ListTodo, Menu, Pause,
  Play, Plus, RotateCcw, Sparkles, Target, Timer, Trophy, X, Zap
} from 'lucide-react';
import styles from './page.module.css';

type StudyTask = { id: string; title: string; subject: string; minutes: number; done: boolean };
type TimerMode = 'focus' | 'break';

const initialTasks: StudyTask[] = [
  { id: 't1', title: 'مراجعة درس الدوال', subject: 'رياضيات', minutes: 25, done: false },
  { id: 't2', title: 'حل 5 تمارين تطبيقية', subject: 'رياضيات', minutes: 20, done: false },
  { id: 't3', title: 'تلخيص درس المناعة', subject: 'علوم الطبيعة', minutes: 20, done: false },
  { id: 't4', title: 'مراجعة المصطلحات', subject: 'لغة عربية', minutes: 15, done: true },
];

const weekdays = [
  { short: 'س', label: 'السبت', value: 0 },
  { short: 'أ', label: 'الأحد', value: 1 },
  { short: 'إ', label: 'الإثنين', value: 2 },
  { short: 'ث', label: 'الثلاثاء', value: 3 },
  { short: 'أ', label: 'الأربعاء', value: 4 },
  { short: 'خ', label: 'الخميس', value: 5 },
  { short: 'ج', label: 'الجمعة', value: 6 },
];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return minutes + ':' + seconds;
}

export default function Home() {
  const [tasks, setTasks] = useState<StudyTask[]>(initialTasks);
  const [sessions, setSessions] = useState(0);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('t1');
  const [newTask, setNewTask] = useState('');
  const [newSubject, setNewSubject] = useState('دراسة عامة');
  const [showAddTask, setShowAddTask] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState('');

  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long' }).format(today);
  const greeting = today.getHours() < 12 ? 'صباح الخير' : today.getHours() < 18 ? 'مساء النشاط' : 'مساء الإنجاز';
  const doneCount = tasks.filter((task) => task.done).length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const selectedTask = tasks.find((task) => task.id === selectedTaskId && !task.done) || tasks.find((task) => !task.done);
  const timerTotal = mode === 'focus' ? 25 * 60 : 5 * 60;
  const timerProgress = Math.max(0, Math.min(100, (secondsLeft / timerTotal) * 100));
  const todayIndex = (today.getDay() + 6) % 7;
  const weekly = useMemo(() => weekdays.map((day, index) => ({ ...day, today: index === todayIndex, complete: index < todayIndex })), [todayIndex]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('minjaz-dashboard-v1');
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.tasks)) setTasks(data.tasks);
        if (Number.isFinite(data.sessions)) setSessions(data.sessions);
      }
    } catch { /* Keep the default plan if local storage is unavailable. */ }
    finally { setLoaded(true); }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem('minjaz-dashboard-v1', JSON.stringify({ tasks, sessions })); }
    catch { /* The app remains usable without persistence. */ }
  }, [tasks, sessions, loaded]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setRunning(false);
          if (mode === 'focus') {
            setSessions((count) => count + 1);
            setNotice('أحسنت! انتهت جلسة تركيز. خذ نفسًا عميقًا قبل المتابعة.');
          } else {
            setNotice('انتهت الاستراحة. أنت جاهز لجولة جديدة.');
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running, mode]);

  function changeMode(nextMode: TimerMode) {
    setRunning(false);
    setMode(nextMode);
    setSecondsLeft(nextMode === 'focus' ? 25 * 60 : 5 * 60);
    setNotice('');
  }

  function resetTimer() {
    setRunning(false);
    setSecondsLeft(timerTotal);
    setNotice('');
  }

  function addTask() {
    const title = newTask.trim();
    if (!title) return;
    const task: StudyTask = {
      id: `task-${Date.now()}`, title, subject: newSubject.trim() || 'دراسة عامة', minutes: 25, done: false,
    };
    setTasks((current) => [...current, task]);
    setSelectedTaskId(task.id);
    setNewTask('');
    setShowAddTask(false);
    setNotice('أُضيفت المهمة إلى خطتك. خطوة صغيرة تكفي للبداية.');
  }

  function toggleTask(id: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
    setNotice('');
  }

  function selectTask(task: StudyTask) {
    if (task.done) return;
    setSelectedTaskId(task.id);
    setMode('focus');
    setRunning(false);
    setSecondsLeft(25 * 60);
    setNotice(`الجلسة التالية: ${task.title}`);
  }

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="#home" aria-label="منجز - الرئيسية">
          <span className={styles.brandMark}><Zap size={22} fill="currentColor" /></span>
          <span><strong>مِنجَز</strong><small>خطوات صغيرة، نتائج كبيرة</small></span>
        </a>
        <div className={styles.sideCaption}>مساحة العمل</div>
        <a className={`${styles.sideLink} ${styles.sideLinkActive}`} href="#home"><span><Target size={18}/></span> لوحة اليوم</a>
        <a className={styles.sideLink} href="#tasks"><span><ListTodo size={18}/></span> مهامي الدراسية <i>{tasks.filter((task) => !task.done).length}</i></a>
        <a className={styles.sideLink} href="#focus"><span><Timer size={18}/></span> جلسة التركيز</a>
        <a className={styles.sideLink} href="#progress"><span><Trophy size={18}/></span> تقدّمي</a>
        <div className={styles.sidebarQuote}>
          <span className={styles.quoteIcon}><Leaf size={19}/></span>
          <strong>لا تنتظر الحماس</strong>
          <p>ابدأ بخمس دقائق فقط. غالبًا ما تأتي الرغبة في الاستمرار بعد البداية.</p>
          <span className={styles.quoteTag}>تذكير اليوم</span>
        </div>
        <div className={styles.sideBottom}><span className={styles.localDot}/> بياناتك محفوظة على جهازك</div>
      </aside>

      <section className={styles.main} id="home">
        <header className={styles.topbar}>
          <div className={styles.mobileBrand}><span className={styles.brandMark}><Zap size={18} fill="currentColor"/></span><strong>مِنجَز</strong></div>
          <div className={styles.dateLine}><span className={styles.dateIcon}><AlarmClock size={16}/></span>{dateLabel}</div>
          <button className={styles.profileButton} onClick={() => setNotice('أنت تستخدم مساحة دراسة شخصية. لا تحتاج إلى إنشاء حساب للبدء.')} aria-label="معلومات الحساب"><span className={styles.profileAvatar}>ط</span><span>مساحتي</span><ChevronLeft size={15}/></button>
        </header>

        <div className={styles.content}>
          <section className={styles.welcome}>
            <div className={styles.welcomeCopy}>
              <span className={styles.eyebrow}><Sparkles size={15}/> خطتك الدراسية تبدأ هنا</span>
              <h1>{greeting}، <span>أنت قادر عليها.</span></h1>
              <p>لا تحتاج إلى إنهاء كل شيء اليوم. اختر مهمة واحدة وامنحها تركيزك الكامل.</p>
              <a className={styles.welcomeCta} href="#focus">ابدأ جلسة تركيز <ArrowLeft size={16}/></a>
            </div>
            <div className={styles.welcomeArt} aria-hidden="true">
              <div className={styles.artSun}/><div className={styles.artBlob}/>
              <div className={styles.artBook}><BookOpen size={43}/><span>25</span></div>
              <span className={styles.artStar}><Sparkles size={19}/></span>
              <span className={styles.artPill}><Check size={13}/> خطوة اليوم</span>
            </div>
          </section>

          <section className={styles.statsGrid} aria-label="ملخص التقدم">
            <article className={styles.statCard}><span className={`${styles.statIcon} ${styles.statViolet}`}><CheckCheck size={19}/></span><div><small>المهام المنجزة</small><strong>{doneCount}<em> / {tasks.length}</em></strong></div><span className={styles.statFoot}>{progress}% من الخطة</span></article>
            <article className={styles.statCard}><span className={`${styles.statIcon} ${styles.statOrange}`}><Flame size={19}/></span><div><small>جلسات التركيز</small><strong>{sessions}<em> جلسة</em></strong></div><span className={styles.statFoot}>كل جلسة تصنع فرقًا</span></article>
            <article className={styles.statCard}><span className={`${styles.statIcon} ${styles.statGreen}`}><Target size={19}/></span><div><small>نسبة إنجاز اليوم</small><strong>{progress}<em>%</em></strong></div><span className={styles.statFoot}>{progress === 100 ? 'رائع! أكملت خطتك' : 'تقدّمك يتراكم'}</span></article>
          </section>

          <div className={styles.columns}>
            <div className={styles.leftColumn}>
              <section className={styles.panel} id="focus">
                <div className={styles.panelHeader}><div><span className={styles.panelKicker}>مساحة التركيز</span><h2>جلسة واحدة تغيّر يومك</h2></div><span className={styles.liveBadge}><i/> {running ? 'الجلسة جارية' : 'جاهز للبدء'}</span></div>
                <div className={styles.timerModes}>
                  <button className={mode === 'focus' ? styles.modeActive : ''} onClick={() => changeMode('focus')}><Target size={15}/> تركيز <small>25 د</small></button>
                  <button className={mode === 'break' ? styles.modeActive : ''} onClick={() => changeMode('break')}><Coffee size={15}/> استراحة <small>5 د</small></button>
                </div>
                <div className={styles.timerStage}>
                  <div className={styles.timerRing} style={{ background: `conic-gradient(var(--accent) ${timerProgress * 3.6}deg, #eeedf6 0deg)` }}>
                    <div className={styles.timerInner}><span className={styles.timerLabel}>{mode === 'focus' ? 'وقت التركيز' : 'وقت الراحة'}</span><strong>{formatTime(secondsLeft)}</strong><span className={styles.timerSub}>{running ? 'أبعد المشتتات' : 'خذ نفسًا وابدأ'}</span></div>
                  </div>
                  <div className={styles.timerTask}><span className={styles.timerTaskIcon}><BookOpen size={17}/></span><div><small>المهمة الحالية</small><strong>{mode === 'break' ? 'استرح قليلًا' : selectedTask?.title || 'اختر مهمة من القائمة'}</strong><span>{mode === 'break' ? 'ابتعد عن الشاشة إن استطعت' : selectedTask?.subject || 'أضف مهمة جديدة للبدء'}</span></div></div>
                </div>
                <div className={styles.timerControls}>
                  <button className={styles.resetButton} onClick={resetTimer} aria-label="إعادة ضبط المؤقت"><RotateCcw size={17}/></button>
                  <button className={styles.startButton} onClick={() => { if (secondsLeft === 0) setSecondsLeft(timerTotal); setRunning((value) => !value); setNotice(''); }}><span>{running ? <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}</span>{running ? 'إيقاف مؤقت' : secondsLeft === 0 ? 'ابدأ من جديد' : 'ابدأ التركيز'}</button>
                  <button className={styles.skipButton} onClick={() => changeMode(mode === 'focus' ? 'break' : 'focus')} aria-label="تبديل وضع المؤقت"><ArrowUpLeft size={18}/></button>
                </div>
                <p className={styles.timerHint}><span><Sparkles size={14}/></span> نصيحة: أغلق الإشعارات وحدّد هدفًا واحدًا قبل أن تبدأ.</p>
              </section>

              <section className={styles.panel} id="progress">
                <div className={styles.panelHeader}><div><span className={styles.panelKicker}>استمرارية هادئة</span><h2>رحلتك هذا الأسبوع</h2></div><span className={styles.weekTag}>هذا الأسبوع</span></div>
                <div className={styles.weekRow}>{weekly.map((day) => <div key={day.value} className={styles.weekDay}><span className={day.today ? styles.weekToday : day.complete ? styles.weekDone : ''}>{day.complete ? <Check size={15}/> : day.short}</span><small>{day.label}</small>{day.today && <i/>}</div>)}</div>
                <div className={styles.weekNote}><span className={styles.weekNoteIcon}><Trophy size={17}/></span><p><strong>التقدّم أهم من الكمال.</strong><br/>كل مرة تعود فيها إلى خطتك، فأنت تبني عادة أقوى.</p><span className={styles.weekDecoration}>✳</span></div>
              </section>
            </div>

            <div className={styles.rightColumn}>
              <section className={styles.panel} id="tasks">
                <div className={styles.panelHeader}><div><span className={styles.panelKicker}>قائمة اليوم</span><h2>ماذا ستنجز اليوم؟</h2></div><span className={styles.taskCount}>{doneCount}/{tasks.length}</span></div>
                <div className={styles.taskProgress}><span style={{ width: `${progress}%` }}/></div>
                <div className={styles.taskList}>
                  {tasks.map((task) => <article key={task.id} className={`${styles.taskRow} ${task.done ? styles.taskDone : ''} ${selectedTask?.id === task.id ? styles.taskSelected : ''}`}>
                    <button className={styles.taskCheck} onClick={() => toggleTask(task.id)} aria-label={task.done ? 'إلغاء إنجاز المهمة' : 'إنجاز المهمة'}>{task.done && <Check size={15}/>}</button>
                    <button className={styles.taskInfo} onClick={() => selectTask(task)} disabled={task.done}><strong>{task.title}</strong><span><i>{task.subject}</i><i><Timer size={12}/>{task.minutes} د</i></span></button>
                    {selectedTask?.id === task.id && <span className={styles.selectedMark}><Target size={15}/></span>}
                  </article>)}
                  {!tasks.length && <div className={styles.emptyTasks}><ListTodo size={25}/><strong>قائمتك تبدأ من هنا</strong><span>أضف أول مهمة دراسية صغيرة.</span></div>}
                </div>
                {showAddTask ? <form className={styles.addForm} onSubmit={(event) => { event.preventDefault(); addTask(); }}><input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="مثال: حل تمرينين في الفيزياء" aria-label="اسم المهمة" maxLength={100}/><input value={newSubject} onChange={(event) => setNewSubject(event.target.value)} placeholder="المادة" aria-label="المادة" maxLength={40}/><div><button type="button" className={styles.cancelAdd} onClick={() => setShowAddTask(false)}>إلغاء</button><button type="submit" className={styles.confirmAdd} disabled={!newTask.trim()}><Plus size={15}/> أضف المهمة</button></div></form> : <button className={styles.addTaskButton} onClick={() => setShowAddTask(true)}><Plus size={17}/> أضف مهمة جديدة</button>}
                <div className={styles.taskFooter}><span><CheckCheck size={14}/> خطتك محفوظة تلقائيًا</span><button onClick={() => { setTasks(initialTasks.map((task) => ({ ...task, id: `${task.id}-${Date.now()}` }))); setSelectedTaskId(''); setNotice('أُعيدت المهام النموذجية. يمكنك تعديلها لتناسب يومك.'); }}>إعادة المهام النموذجية</button></div>
              </section>

              <section className={styles.miniCard}>
                <div className={styles.miniCardIcon}><CircleHelp size={19}/></div><div><strong>هل تشعر بالتشتّت؟</strong><p>اكتب أصغر خطوة ممكنة في مهمتك، وابدأ بها فقط.</p></div><span className={styles.miniSpark}>✦</span>
              </section>
            </div>
          </div>

          {notice && <div className={styles.notice} role="status"><span><Check size={16}/></span>{notice}<button onClick={() => setNotice('')} aria-label="إغلاق التنبيه"><X size={15}/></button></div>}
          <footer className={styles.footer}><span><Zap size={15} fill="currentColor"/> مِنجَز</span><span>خطوة صغيرة اليوم، فرق كبير غدًا.</span><a href="#home">العودة للأعلى <ArrowUpLeft size={14}/></a></footer>
        </div>
      </section>
    </main>
  );
}
