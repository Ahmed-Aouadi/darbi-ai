'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpLeft, Award, BookOpen, Check, ChevronDown, Clock3, Code2, Flame, Menu, Play, Search, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import styles from './page.module.css';

const challenges = [
  { id: 1, slug: 'nearest-bus', title: 'أقرب حافلة', topic: 'النقل', level: 'سهل', points: 10, time: 'دقيقتان', icon: '🚌', desc: 'احسب أقرب موعد للحافلة ومدة الانتظار.' },
  { id: 2, slug: 'market-basket', title: 'ميزان السوق', topic: 'السوق', level: 'سهل', points: 10, time: '3 دقائق', icon: '🧺', desc: 'اجمع ثمن المشتريات وطبّق الخصم المناسب.' },
  { id: 3, slug: 'class-average', title: 'معدّل الفصل', topic: 'المدرسة', level: 'متوسط', points: 25, time: '5 دقائق', icon: '📚', desc: 'احسب المعدل الموزون حسب معاملات المواد.' },
  { id: 4, slug: 'wedding-meal', title: 'قدر الوليمة', topic: 'الأعراس', level: 'متوسط', points: 25, time: '6 دقائق', icon: '🍲', desc: 'قدّر عدد القدور التي تكفي الضيوف.' },
  { id: 5, slug: 'electricity-bill', title: 'فاتورة الكهرباء', topic: 'المنزل', level: 'سهل', points: 10, time: '4 دقائق', icon: '💡', desc: 'احسب الفاتورة وفق شرائح الاستهلاك.' },
  { id: 6, slug: 'neighborhood-route', title: 'طريق الحي', topic: 'النقل', level: 'صعب', points: 50, time: '10 دقائق', icon: '🗺️', desc: 'ابحث عن أقصر طريق بين حيّين.' },
];

const starter = 'function nextBus(now, times) {\n  // اكتب حلّك هنا\n  return ["09:15", 55];\n}';

export default function Home() {
  const [tab, setTab] = useState('الكل');
  const [search, setSearch] = useState('');
  const [code, setCode] = useState(starter);
  const [ran, setRan] = useState(false);
  const [solved, setSolved] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const filtered = useMemo(() => challenges.filter(c => (tab === 'الكل' || c.topic === tab) && (c.title + c.desc + c.topic).includes(search)), [tab, search]);
  const runCode = () => {
    setRan(true);
    const hasFunction = /function\s+nextBus\s*\(/.test(code);
    const hasReturn = /return\s*\[/.test(code);
    const looksStarter = code.includes('// اكتب حلّك هنا');
    setSolved(hasFunction && hasReturn && !looksStarter);
  };

  return <main className={styles.app}>
    <header className={styles.topbar}>
      <a className={styles.brand} href="#top" aria-label="سطر - الرئيسية"><span className={styles.brandMark}><Code2 size={22}/></span><span><b>سَطر</b><small>برمج مشاكل حيّك</small></span></a>
      <nav className={mobileMenu ? styles.navOpen : styles.nav}>
        <a className={styles.activeNav} href="#challenges">التحديات</a><a href="#how">كيف تعمل؟</a><a href="#league">دوري الأسبوع</a>
      </nav>
      <div className={styles.topActions}><button className={styles.login} onClick={() => alert('تسجيل الحساب سيكون متاحًا في المرحلة الثانية.')}>دخول</button><a className={styles.startBtn} href="#try">جرّب مجانًا <ArrowLeft size={16}/></a></div>
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
          <div className={styles.codeBody}><div><span className={styles.lineNo}>01</span><span className={styles.codePurple}>function</span> <span className={styles.codeBlue}>nextBus</span>(now, times) {'{'}</div><div><span className={styles.lineNo}>02</span> &nbsp;<span className={styles.codeGray}>// وقتاش تجي الحافلة؟</span></div><div><span className={styles.lineNo}>03</span> &nbsp;<span className={styles.codePurple}>return</span> findNearest(now, times);</div><div><span className={styles.lineNo}>04</span>{'}'}</div></div>
          <div className={styles.passCard}><span><Check size={16}/></span><div><b>اختبار ناجح!</b><small>الانتظار: ٥٥ دقيقة</small></div><strong>+١٠ XP</strong></div>
        </div>
        <div className={styles.floatTag}><span>🚌</span><div><b>أقرب حافلة</b><small>تحدّي الأسبوع</small></div><span className={styles.tagArrow}><ArrowUpLeft size={16}/></span></div>
        <div className={styles.heroStat}><Zap size={17}/><span>تصحيح فوري</span></div>
      </div>
    </section>

    <section className={styles.statsStrip}>
      <div><span className={styles.statIcon}><Code2/></span><p><b>15+</b><small>تحديًا من واقعنا</small></p></div><div><span className={styles.statIcon}><Users/></span><p><b>دوري الأصدقاء</b><small>نافس جماعتك كل أسبوع</small></p></div><div><span className={styles.statIcon}><Flame/></span><p><b>خطوة بخطوة</b><small>من أول سطر حتى الاحتراف</small></p></div><div><span className={styles.statIcon}><Trophy/></span><p><b>اجمع النقاط</b><small>وافتح شارات جديدة</small></p></div>
    </section>

    <section className={styles.trySection} id="try">
      <div className={styles.sectionIntro}><div><span className={styles.kicker}>جرّب بنفسك</span><h2>أول تحدٍّ في أقل من دقيقتين</h2><p>ما تحتاجش حساب. عدّل الدالة واضغط شغّل باش تجرب.</p></div><span className={styles.challengeNumber}>التحدّي 01 <b>من 15</b></span></div>
      <div className={styles.tryGrid}>
        <article className={styles.problemPanel}><div className={styles.panelLabel}><span>🚌</span><span>النقل</span><span className={styles.levelEasy}>سهل · 10 نقاط</span></div><h3>أقرب حافلة</h3><p>راك تستنّى الحافلة في محطة وسط المدينة. عندك جدول المواعيد وحاب تعرف أقرب حافلة ووقتاش توصل.</p><div className={styles.taskBox}><b>المطلوب</b><p>اكتب دالة <code>nextBus(now, times)</code> ترجع موعد الحافلة القادمة وعدد دقائق الانتظار.</p></div><div className={styles.exampleBox}><div><span>المدخل</span><code>"08:20", ["06:30", "09:15"]</code></div><ArrowLeft size={17}/><div><span>الناتج المتوقع</span><code>["09:15", 55]</code></div></div><div className={styles.tip}><Sparkles size={17}/><span><b>تلميح:</b> حوّل الوقت إلى دقائق منذ منتصف الليل لتسهّل المقارنة.</span></div></article>
        <article className={styles.editorPanel}><div className={styles.editorHead}><div><span className={styles.editorDot}/><b>محرّر الكود</b></div><button className={styles.languageBtn}>JavaScript <ChevronDown size={14}/></button></div><div className={styles.editorWrap}><div className={styles.lineNums}>1<br/>2<br/>3<br/>4</div><textarea aria-label="محرر JavaScript" spellCheck={false} dir="ltr" value={code} onChange={e => {setCode(e.target.value);setRan(false);setSolved(false)}}/></div><div className={styles.editorFoot}><span><span className={styles.statusDot}/> JavaScript</span><span>تُحفظ مسودتك محليًا</span></div><div className={styles.runRow}><button className={styles.runBtn} onClick={runCode}><Play size={16} fill="currentColor"/> شغّل الاختبارات</button><span>⏱ 3 ثوانٍ كحد أقصى</span></div>{ran && <div className={solved ? styles.resultSuccess : styles.resultFail}><span>{solved ? <Check size={18}/> : <Clock3 size={18}/>}</span><div><b>{solved ? 'اجتزت الاختبار الظاهر!' : 'ما زال الحل يحتاج تعديلًا'}</b><p>{solved ? 'ممتاز! يمكنك الآن الانتقال إلى التحدّي التالي.' : 'تأكد من كتابة دالة nextBus وإرجاع مصفوفة. غيّر الكود ثم جرّب مجددًا.'}</p></div></div>}</article>
      </div>
      <p className={styles.disclaimer}>نسخة تجريبية للواجهة — التصحيح هنا يفحص بنية الحل فقط، وسيُستبدل بمشغّل اختبارات معزول في استكمال المرحلة الأولى.</p>
    </section>

    <section className={styles.challengeSection} id="challenges"><div className={styles.sectionIntro}><div><span className={styles.kicker}>اختار مشكلتك</span><h2>تحديات تشبه حياتنا</h2><p>كل تحدٍّ حكاية من الواقع، وكل حلّ يقرّبك من مستوى جديد.</p></div><a href="#try" className={styles.textLink}>ابدأ من السهل <ArrowLeft size={16}/></a></div>
      <div className={styles.filters}><div className={styles.searchBox}><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن تحدٍّ..." aria-label="بحث عن تحدٍّ"/></div><div className={styles.filterChips}>{['الكل','النقل','السوق','المدرسة','الأعراس','المنزل'].map(t => <button key={t} className={tab === t ? styles.chipActive : styles.chip} onClick={() => setTab(t)}>{t}</button>)}</div></div>
      <div className={styles.challengeGrid}>{filtered.map(c => <article className={styles.challengeCard} key={c.id}><div className={styles.challengeCardTop}><span className={styles.challengeEmoji}>{c.icon}</span><span className={c.level === 'سهل' ? styles.levelEasy : c.level === 'متوسط' ? styles.levelMedium : styles.levelHard}>{c.level}</span></div><span className={styles.topic}>{c.topic}</span><h3>{c.title}</h3><p>{c.desc}</p><div className={styles.cardMeta}><span><Award size={15}/>{c.points} نقطة</span><span><Clock3 size={15}/>{c.time}</span></div><a href="#try" className={styles.cardLink}>حلّ التحدّي <ArrowLeft size={15}/></a></article>)}</div>
      {filtered.length === 0 && <div className={styles.emptyState}>ما لقيناش تحديات بهذه الكلمات. جرّب بحثًا آخر.</div>}
    </section>

    <section className={styles.howSection} id="how"><div className={styles.sectionIntro}><div><span className={styles.kicker}>بسيطة كيما لازم</span><h2>ثلاث خطوات وتولي تبرمج</h2></div></div><div className={styles.steps}><article><span>01</span><BookOpen/><h3>افهم المشكل</h3><p>اقرأ القصة والمطلوب والأمثلة، بلا تعقيد.</p></article><article><span>02</span><Code2/><h3>جرّب كودك</h3><p>اكتب JavaScript وشوف النتيجة في ثوانٍ.</p></article><article><span>03</span><Trophy/><h3>اجمع النقاط</h3><p>حلّ أكثر، افتح الشارات، وتحدّى صحابك.</p></article></div></section>

    <section className={styles.leagueBanner} id="league"><div className={styles.leagueIcon}><Trophy size={30}/></div><div><span>كل أسبوع حكاية جديدة</span><h2>واشكون مبرمج الحومة؟</h2><p>حلّ تحديات الأسبوع، اجمع النقاط، ونافس أصحابك بروح رياضية.</p></div><button onClick={() => alert('دوري الأسبوع وغرف الأصدقاء ضمن المراحل القادمة.')}>اكتشف الدوري <ArrowLeft size={17}/></button><div className={styles.leagueDecoration}>#01</div></section>
    <footer className={styles.footer}><a className={styles.brand} href="#top"><span className={styles.brandMark}><Code2 size={20}/></span><span><b>سَطر</b><small>برمج مشاكل حيّك</small></span></a><span>تعلّم البرمجة من واقعك اليومي.</span><span>صُنع بحبّ في الجزائر 🇩🇿</span></footer>
  </main>;
}
