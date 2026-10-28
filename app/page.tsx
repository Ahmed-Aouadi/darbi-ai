'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpLeft, Award, BookOpen, Check, ChevronDown, Clock3, Code2, Flame, Menu, Play, Search, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import styles from './page.module.css';
import challengeData from '../content/challenges.json';
import Wave1Panel from './wave1-panel';
import AuthPanel from './auth-panel';

const challenges = challengeData.map((challenge, index) => ({
  id: index + 1,
  slug: challenge.slug,
  title: challenge.title,
  topic: challenge.topic,
  level: ({ easy: 'سهل', medium: 'متوسط', hard: 'صعب' } as const)[challenge.level as 'easy' | 'medium' | 'hard'],
  points: challenge.points,
  time: challenge.level === 'easy' ? '3 دقائق' : challenge.level === 'medium' ? '5 دقائق' : '8 دقائق',
  icon: ({ 'نقل': '🚌', 'سوق': '🧺', 'مال': '💰', 'مدرسة': '📚', 'كشافة': '🏕️', 'وقت': '⏱️', 'منزل': '🏠' } as Record<string, string>)[challenge.topic] || '💡',
  desc: challenge.story,
}));

const starter = challengeData[0].starter.javascript;

export default function Home() {
  const [tab, setTab] = useState('الكل');
  const [search, setSearch] = useState('');
  const [code, setCode] = useState(starter);
  const [ran, setRan] = useState(false);
  const [solved, setSolved] = useState(false);
  const [runMessage, setRunMessage] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const filtered = useMemo(() => challenges.filter(c => (tab === 'الكل' || c.topic === tab) && (c.title + c.desc + c.topic).includes(search)), [tab, search]);
  const runCode = () => {
    setRan(false);
    setSolved(false);
    setRunMessage('');
    const visibleTests = challengeData[0].tests.filter(test => !test.hidden);
    const workerSource = `
      self.onmessage = ({ data }) => {
        const { code, fnName, tests } = data;
        try {
          const fn = new Function(code + "\\n; return typeof " + fnName + " === 'function' ? " + fnName + " : null;")();
          if (typeof fn !== 'function') throw new Error('لم أجد دالة باسم ' + fnName);
          const equal = (a, b) => {
            if (Object.is(a, b)) return true;
            if (typeof a !== typeof b || a === null || b === null) return false;
            if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => equal(v, b[i]));
            if (typeof a === 'object') {
              const ak = Object.keys(a).sort(), bk = Object.keys(b).sort();
              return ak.length === bk.length && ak.every((k, i) => k === bk[i] && equal(a[k], b[k]));
            }
            return false;
          };
          self.postMessage({ results: tests.map(test => {
            const actual = fn(...structuredClone(test.args));
            return { ok: equal(actual, test.expected), actual };
          }) });
        } catch (error) {
          self.postMessage({ error: String(error && error.message || error) });
        }
      };
    `;
    const blobUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
    const worker = new Worker(blobUrl);
    const timeout = window.setTimeout(() => {
      worker.terminate(); URL.revokeObjectURL(blobUrl);
      setRan(true); setRunMessage('انتهت مهلة التشغيل (3 ثوانٍ). جرّب حلًا أسرع.');
    }, 3000);
    worker.onmessage = event => {
      window.clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(blobUrl);
      setRan(true);
      if (event.data.error) { setSolved(false); setRunMessage('خطأ في الحل: ' + event.data.error); return; }
      const passed = event.data.results.filter((result: { ok: boolean }) => result.ok).length;
      setSolved(passed === visibleTests.length);
      setRunMessage(passed === visibleTests.length
        ? `نجحت في ${passed} من ${visibleTests.length} اختبار ظاهر.`
        : `اجتزت ${passed} من ${visibleTests.length} اختبارات ظاهرة. راجع الحل وحاول مجددًا.`);
    };
    worker.onerror = () => {
      window.clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(blobUrl);
      setRan(true); setRunMessage('تعذّر تشغيل الكود. تحقق من صياغته ثم أعد المحاولة.');
    };
    worker.postMessage({ code, fnName: challengeData[0].functionName, tests: visibleTests });
  };

  return <main className={styles.app}>
    <header className={styles.topbar}>
      <a className={styles.brand} href="#top" aria-label="سطر - الرئيسية"><span className={styles.brandMark}><Code2 size={22}/></span><span><b>سَطر</b><small>برمج مشاكل حيّك</small></span></a>
      <nav className={mobileMenu ? styles.navOpen : styles.nav}>
        <a className={styles.activeNav} href="#challenges">التحديات</a><a href="#how">كيف تعمل؟</a><a href="#league">دوري الأسبوع</a>
      </nav>
      <div className={styles.topActions}><span className={styles.login}><AuthPanel /></span><a className={styles.startBtn} href="#try">جرّب مجانًا <ArrowLeft size={16}/></a></div>
      <button className={styles.menuBtn} onClick={() => setMobileMenu(!mobileMenu)} aria-label="فتح القائمة"><Menu/></button>
    </header>

    <section className={styles.hero} id="top">
      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}><span className={styles.liveDot}/> البرمجة تبدأ من حومتك</div>
        <h1>عندك مشكلة في الحي؟<br/><em>برمج لها حلّ.</em></h1>
        <p>تحديات برمجية مستوحاة من حياتنا في الجزائر. حلّها بكودك، تعلّم خطوة بخطوة، وتحدّى صحابك كل أسبوع.</p>
        <div className={styles.heroActions}><a className={styles.primaryBtn} href="#try">ابدأ أول تحدٍّ <ArrowLeft size={18}/></a><a className={styles.secondaryBtn} href="#challenges">اكتشف التحديات <ArrowUpLeft size={17}/></a></div>
        <div className={styles.socialProof}><div className={styles.avatars}><span>م</span><span>ي</span><span>س</span><span>+ </span></div><span><b>تعلّم بالتطبيق، مش بالحفظ</b><small>مناسب للمبتدئين — بلا تسجيل</small></span></div>
      </div>
      <div className={styles.heroVisual}>
        <div className={styles.decorCircle}/><div className={styles.codeCard}>
          <div className={styles.codeTop}><span className={styles.windowDots}><i/><i/><i/></span><span>challenge.js</span><span className={styles.jsBadge}>JS</span></div>
          <div className={styles.codeBody}><div><span className={styles.lineNo}>01</span><span className={styles.codePurple}>function</span> <span className={styles.codeBlue}>nextBus</span>(now, times) {'{'}</div><div><span className={styles.lineNo}>02</span> &nbsp;<span className={styles.codeGray}>{/* وقتاش تجي الحافلة؟ */}</span></div><div><span className={styles.lineNo}>03</span> &nbsp;<span className={styles.codePurple}>return</span> findNearest(now, times);</div><div><span className={styles.lineNo}>04</span>{'}'}</div></div>
          <div className={styles.passCard}><span><Check size={16}/></span><div><b>اختبار ناجح!</b><small>الانتظار: ٥٥ دقيقة</small></div><strong>+١٠ XP</strong></div>
        </div>
        <div className={styles.floatTag}><span>🚌</span><div><b>أقرب حافلة</b><small>تحدّي الأسبوع</small></div><span className={styles.tagArrow}><ArrowUpLeft size={16}/></span></div>
        <div className={styles.heroStat}><Zap size={17}/><span>تصحيح فوري</span></div>
      </div>
    </section>

    <section className={styles.statsStrip}>
      <div><span className={styles.statIcon}><Code2/></span><p><b>15+</b><small>تحديًا من واقعنا</small></p></div><div><span className={styles.statIcon}><Users/></span><p><b>دوري الأصدقاء</b><small>نافس جماعتك كل أسبوع</small></p></div><div><span className={styles.statIcon}><Flame/></span><p><b>خطوة بخطوة</b><small>من أول سطر حتى الاحتراف</small></p></div><div><span className={styles.statIcon}><Trophy/></span><p><b>اجمع النقاط</b><small>وافتح شارات جديدة</small></p></div>
    </section>

    <Wave1Panel />

    <section className={styles.trySection} id="try">
      <div className={styles.sectionIntro}><div><span className={styles.kicker}>جرّب بنفسك</span><h2>أول تحدٍّ في أقل من دقيقتين</h2><p>ما تحتاجش حساب. عدّل الدالة واضغط شغّل باش تجرب.</p></div><span className={styles.challengeNumber}>التحدّي 01 <b>من {challenges.length}</b></span></div>
      <div className={styles.tryGrid}>
        <article className={styles.problemPanel}><div className={styles.panelLabel}><span>🚌</span><span>النقل</span><span className={styles.levelEasy}>سهل · 10 نقاط</span></div><h3>أقرب حافلة</h3><p>راك تستنّى الحافلة في محطة وسط المدينة. عندك جدول المواعيد وحاب تعرف أقرب حافلة ووقتاش توصل.</p><div className={styles.taskBox}><b>المطلوب</b><p>اكتب دالة <code>nextBus(now, times)</code> ترجع موعد الحافلة القادمة وعدد دقائق الانتظار.</p></div><div className={styles.exampleBox}><div><span>المدخل</span><code>"08:20", ["06:30", "09:15"]</code></div><ArrowLeft size={17}/><div><span>الناتج المتوقع</span><code>["09:15", 55]</code></div></div><div className={styles.tip}><Sparkles size={17}/><span><b>تلميح:</b> حوّل الوقت إلى دقائق منذ منتصف الليل لتسهّل المقارنة.</span></div></article>
        <article className={styles.editorPanel}><div className={styles.editorHead}><div><span className={styles.editorDot}/><b>محرّر الكود</b></div><button className={styles.languageBtn}>JavaScript <ChevronDown size={14}/></button></div><div className={styles.editorWrap}><div className={styles.lineNums}>1<br/>2<br/>3<br/>4</div><textarea aria-label="محرر JavaScript" spellCheck={false} dir="ltr" value={code} onChange={e => {setCode(e.target.value);setRan(false);setSolved(false);setRunMessage('')}}/></div><div className={styles.editorFoot}><span><span className={styles.statusDot}/> JavaScript</span><span>تُحفظ مسودتك محليًا</span></div><div className={styles.runRow}><button className={styles.runBtn} onClick={runCode}><Play size={16} fill="currentColor"/> شغّل الاختبارات</button><span>⏱ 3 ثوانٍ كحد أقصى</span></div>{ran && <div className={solved ? styles.resultSuccess : styles.resultFail}><span>{solved ? <Check size={18}/> : <Clock3 size={18}/>}</span><div><b>{solved ? 'اجتزت الاختبار الظاهر!' : 'ما زال الحل يحتاج تعديلًا'}</b><p>{runMessage || (solved ? 'ممتاز! يمكنك الآن الانتقال إلى التحدّي التالي.' : 'غيّر الكود ثم جرّب مجددًا.')}</p></div></div>}</article>
      </div>
      <p className={styles.disclaimer}>التشغيل يختبر الأمثلة الظاهرة داخل عامل منفصل. لا تُرسل الاختبارات المخفية إلى المتصفح في وضع التجربة.</p>
    </section>

    <section className={styles.challengeSection} id="challenges"><div className={styles.sectionIntro}><div><span className={styles.kicker}>اختار مشكلتك</span><h2>تحديات تشبه حياتنا</h2><p>كل تحدٍّ حكاية من الواقع، وكل حلّ يقرّبك من مستوى جديد.</p></div><a href="#try" className={styles.textLink}>ابدأ من السهل <ArrowLeft size={16}/></a></div>
      <div className={styles.filters}><div className={styles.searchBox}><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن تحدٍّ..." aria-label="بحث عن تحدٍّ"/></div><div className={styles.filterChips}>{['الكل', ...Array.from(new Set(challenges.map(c => c.topic)))].map(t => <button key={t} className={tab === t ? styles.chipActive : styles.chip} onClick={() => setTab(t)}>{t}</button>)}</div></div>
      <div className={styles.challengeGrid}>{filtered.map(c => <article className={styles.challengeCard} key={c.id}><div className={styles.challengeCardTop}><span className={styles.challengeEmoji}>{c.icon}</span><span className={c.level === 'سهل' ? styles.levelEasy : c.level === 'متوسط' ? styles.levelMedium : styles.levelHard}>{c.level}</span></div><span className={styles.topic}>{c.topic}</span><h3>{c.title}</h3><p>{c.desc}</p><div className={styles.cardMeta}><span><Award size={15}/>{c.points} نقطة</span><span><Clock3 size={15}/>{c.time}</span></div><a href="#try" className={styles.cardLink}>حلّ التحدّي <ArrowLeft size={15}/></a></article>)}</div>
      {filtered.length === 0 && <div className={styles.emptyState}>ما لقيناش تحديات بهذه الكلمات. جرّب بحثًا آخر.</div>}
    </section>

    <section className={styles.howSection} id="how"><div className={styles.sectionIntro}><div><span className={styles.kicker}>بسيطة كيما لازم</span><h2>ثلاث خطوات وتولي تبرمج</h2></div></div><div className={styles.steps}><article><span>01</span><BookOpen/><h3>افهم المشكل</h3><p>اقرأ القصة والمطلوب والأمثلة، بلا تعقيد.</p></article><article><span>02</span><Code2/><h3>جرّب كودك</h3><p>اكتب JavaScript وشوف النتيجة في ثوانٍ.</p></article><article><span>03</span><Trophy/><h3>اجمع النقاط</h3><p>حلّ أكثر، افتح الشارات، وتحدّى صحابك.</p></article></div></section>

    <section className={styles.leagueBanner} id="league"><div className={styles.leagueIcon}><Trophy size={30}/></div><div><span>كل أسبوع حكاية جديدة</span><h2>واشكون مبرمج الحومة؟</h2><p>حلّ تحديات الأسبوع، اجمع النقاط، ونافس أصحابك بروح رياضية.</p></div><button onClick={() => alert('دوري الأسبوع وغرف الأصدقاء ضمن المراحل القادمة.')}>اكتشف الدوري <ArrowLeft size={17}/></button><div className={styles.leagueDecoration}>#01</div></section>
    <footer className={styles.footer}><a className={styles.brand} href="#top"><span className={styles.brandMark}><Code2 size={20}/></span><span><b>سَطر</b><small>برمج مشاكل حيّك</small></span></a><span>تعلّم البرمجة من واقعك اليومي.</span><span>صُنع بحبّ في الجزائر 🇩🇿</span></footer>
  </main>;
}
