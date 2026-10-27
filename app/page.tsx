'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Check, ChevronLeft, CircleHelp, Clock3, Eye, FileText, Fingerprint, LockKeyhole, MessageSquareText, Search, ShieldAlert, Sparkles, Target, X } from 'lucide-react';
import styles from './page.module.css';

type Clue = { id: string; title: string; kind: string; text: string; icon: string };
type Suspect = { id: string; name: string; role: string; statement: string; secret: string };

const cases = [
  {
    id: 'museum', level: 'متوسط', duration: '10–15 دقيقة', category: 'سرقة غامضة',
    title: 'سرقة الجوهرة الزرقاء', location: 'متحف المدينة — قاعة المقتنيات', time: '21:40',
    intro: 'اختفت جوهرة نادرة من صندوق زجاجي مغلق أثناء انقطاع الكهرباء لمدة 90 ثانية. لم يُكسر الزجاج، ولم يغادر أي شخص المبنى.',
    report: 'عُثر على الصندوق مفتوحًا عند عودة الإضاءة. سجلّ الباب لم يُظهر أي دخول أو خروج خلال فترة الانقطاع.',
    clues: [
      { id: 'c1', title: 'تقرير الكهرباء', kind: 'دليل تقني', text: 'انقطع التيار عن القاعة لمدة 90 ثانية. لكن كاميرا الممر استمرت في التسجيل بفضل بطاريتها الاحتياطية.', icon: '⚡' },
      { id: 'c2', title: 'بطاقة الدخول', kind: 'سجلّ أمني', text: 'استُخدمت بطاقة أمين المعرض قبل الانقطاع بدقيقتين، ولم تُسجّل أي بطاقة أخرى بعدها.', icon: '🪪' },
      { id: 'c3', title: 'أثر أزرق', kind: 'أثر مادي', text: 'وُجد مسحوق أزرق دقيق على طرف قفاز قرب الصندوق. الجوهرة نفسها لا تترك مسحوقًا.', icon: '🧤' },
      { id: 'c4', title: 'توقيت الكاميرا', kind: 'تسجيل مصوّر', text: 'أظهرت الكاميرا شخصًا يحمل مظلة طويلة قبل انقطاع الكهرباء، رغم أن الطقس كان جافًا.', icon: '📹' },
      { id: 'c5', title: 'فاتورة الترميم', kind: 'وثيقة', text: 'اشترى فنيّ الترميم مسحوقًا أزرق يُستخدم في تلوين النسخ الجبسية قبل يومين.', icon: '🧾' },
    ],
    suspects: [
      { id: 's1', name: 'آدم مراد', role: 'أمين المعرض', statement: 'كنت في مكتب الأرشيف أراجع السجلات. بطاقتي غالبًا بقيت في الدرج.', secret: 'أخفى أنه أعطى بطاقته الاحتياطية لشخص آخر صباحًا.' },
      { id: 's2', name: 'ليلى بن سالم', role: 'مرمّمة القطع', statement: 'كنت في غرفة الترميم أجهّز نسخة تدريبية. لم أقترب من القاعة.', secret: 'استخدمت مسحوقًا أزرق لصنع نسخة تدريبية من الجوهرة.' },
      { id: 's3', name: 'سامي قادري', role: 'حارس الأمن', statement: 'تابعت المدخل الرئيسي طوال الليل. لم يدخل أو يخرج أحد.', secret: 'كان يعلم أن كاميرا الممر تعمل ببطارية احتياطية.' },
      { id: 's4', name: 'نور شريف', role: 'مرشدة المتحف', statement: 'غادرت القاعة قبل الإغلاق، ولم أعد إليها.', secret: 'رأت مظلة طويلة في غرفة الموظفين لكنها لم تذكر ذلك.' },
    ],
    solution: 's2',
    explanation: 'ليلى هي الأقرب إلى الأدلة: مسحوق الترميم الأزرق، والنسخة التدريبية، وتوقيت الانقطاع الذي استُغلّ لاستبدال الجوهرة. المظلة الطويلة كانت تمويهًا لإخفاء الأداة المستخدمة في فتح الصندوق.',
  },
  {
    id: 'studio', level: 'سهل', duration: '8–12 دقيقة', category: 'اختفاء غريب',
    title: 'الرسالة التي اختفت', location: 'استوديو البث — الطابق الثالث', time: '18:15',
    intro: 'اختفت رسالة ورقية مهمة من غرفة مغلقة قبل بث مباشر بدقائق. ثلاثة أشخاص دخلوا الاستوديو، وكل واحد يقول إنه لم يرَ الرسالة.',
    report: 'لم تُفتح النوافذ، والباب لا يعمل إلا ببطاقة. على المكتب كوب ماء بارد وورقة ممزقة من دفتر الملاحظات.',
    clues: [
      { id: 'd1', title: 'كوب الماء', kind: 'أثر مادي', text: 'الكوب بارد جدًا، لكن حلقة الماء حوله جافة تقريبًا. يبدو أنه وُضع على المكتب قبل وقت طويل.', icon: '🥛' },
      { id: 'd2', title: 'سجلّ الباب', kind: 'سجلّ أمني', text: 'دخلت مريم عند 18:02، ثم يوسف عند 18:08، ثم رامي عند 18:12. لم يسجل الباب أي خروج حتى 18:20.', icon: '🚪' },
      { id: 'd3', title: 'الورقة الممزقة', kind: 'وثيقة', text: 'تحتوي الورقة على نصف جملة: «...النسخة الأصلية في درج الصوت».', icon: '📄' },
      { id: 'd4', title: 'صندوق الصوت', kind: 'دليل تقني', text: 'درج جهاز الصوت يحتوي على مساحة فارغة بحجم ظرف الرسالة، وبقايا شريط لاصق جديد.', icon: '🎙️' },
      { id: 'd5', title: 'ملاحظة المخرج', kind: 'شهادة', text: 'قال المخرج إن رامي طلب قبل البث بدقائق أن يختبر جهاز الصوت وحده.', icon: '🗒️' },
    ],
    suspects: [
      { id: 's1', name: 'مريم عادل', role: 'معدة البرنامج', statement: 'وضعت أوراقي على الطاولة ثم خرجت لجلب القهوة.', secret: 'نسيت دفترها مفتوحًا قرب الرسالة.' },
      { id: 's2', name: 'يوسف ناصر', role: 'المذيع', statement: 'كنت أراجع النص أمام المرآة ولم ألمس المكتب.', secret: 'كان يعرف أن الرسالة تحتوي على معلومة قد تغيّر موضوع الحلقة.' },
      { id: 's3', name: 'رامي فوزي', role: 'مهندس الصوت', statement: 'اختبرت الميكروفون فقط، ولم أفتح أي درج.', secret: 'طلب وقتًا منفردًا مع جهاز الصوت قبل البث.' },
    ],
    solution: 's3',
    explanation: 'رامي طلب الانفراد بجهاز الصوت، وتطابق حجم الدرج مع الظرف، ووجود الشريط اللاصق يدعم إخفاء الرسالة داخله. الورقة الممزقة كانت تلميحًا إلى مكانها.',
  },
  {
    id: 'lighthouse', level: 'صعب', duration: '15–20 دقيقة', category: 'لغز مغلق',
    title: 'سرّ المنارة الصامتة', location: 'منارة رأس الضباب', time: '00:07',
    intro: 'توقفت المنارة عن إرسال إشارتها في ليلة عاصفة، واختفى دفتر الملاحة. لا توجد آثار أقدام في الخارج، والباب كان موصدًا من الداخل.',
    report: 'وجد فريق الإنقاذ مصباحًا زيتيًا مشتعلًا، وساعة متوقفة، وثلاث قطرات ماء على الأرض رغم أن النوافذ محكمة الإغلاق.',
    clues: [
      { id: 'e1', title: 'الساعة المتوقفة', kind: 'دليل زمني', text: 'توقفت الساعة عند 23:47، لكن سجلّ المولد يثبت أن الكهرباء انقطعت عند 00:07 بالضبط.', icon: '🕰️' },
      { id: 'e2', title: 'قطرات الماء', kind: 'أثر مادي', text: 'قطرات الماء مالحة، وتوجد على الأرض أسفل فتحة تهوية ضيقة تؤدي إلى مخزن الحبال.', icon: '💧' },
      { id: 'e3', title: 'دفتر الصيانة', kind: 'وثيقة', text: 'سُجّلت صيانة فتحة التهوية قبل يوم واحد، وكتب الفني: «يمكن فتحها من جهة المخزن».', icon: '📘' },
      { id: 'e4', title: 'المصباح الزيتي', kind: 'أثر مادي', text: 'المصباح حديث الاشتعال، لكن الفتيل قصير جدًا؛ استُخدم على الأرجح لوقت قصير لا طوال الليل.', icon: '🪔' },
      { id: 'e5', title: 'رسالة لاسلكية', kind: 'تسجيل', text: 'وصلت رسالة مقتضبة قبل الانقطاع: «الطريق آمن، أطفئوا الإشارة». لم يحدد المرسل اسمه.', icon: '📻' },
    ],
    suspects: [
      { id: 's1', name: 'جلال منصور', role: 'حارس المنارة', statement: 'لم أغادر غرفة المراقبة طوال الليل.', secret: 'يعرف أن فتحة التهوية تصل إلى مخزن الحبال.' },
      { id: 's2', name: 'هدى كمال', role: 'فنية الصيانة', statement: 'أنهيت الصيانة نهارًا، ولم أعد بعد ذلك.', secret: 'هي من كتبت ملاحظة فتحة التهوية في دفتر الصيانة.' },
      { id: 's3', name: 'بشير طاهر', role: 'صياد محلي', statement: 'كنت في البحر ولم أقترب من المنارة.', secret: 'يستخدم عادةً رسالة لاسلكية قصيرة مع الحارس.' },
    ],
    solution: 's1',
    explanation: 'جلال يعرف فتحة التهوية التي تفسّر قطرات الماء المالحة وطريقة الدخول والخروج دون فتح الباب. الساعة المتوقفة كانت تضليلًا، بينما انقطاع المولد يحدد وقت تعطيل الإشارة.',
  },
];

export default function Home() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [screen, setScreen] = useState<'home' | 'case' | 'result'>('home');
  const [tab, setTab] = useState<'evidence' | 'suspects' | 'notes'>('evidence');
  const [found, setFound] = useState<string[]>([]);
  const [questioned, setQuestioned] = useState<string[]>([]);
  const [selectedSuspect, setSelectedSuspect] = useState('');
  const [notes, setNotes] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [showVerdict, setShowVerdict] = useState(false);
  const [toast, setToast] = useState('');
  const current = cases[caseIndex];
  const progress = Math.round(((found.length + questioned.length) / (current.clues.length + current.suspects.length)) * 100);
  const currentSuspect = useMemo(() => current.suspects.find((s) => s.id === selectedSuspect), [current, selectedSuspect]);

  const startCase = (index: number) => {
    setCaseIndex(index); setFound([]); setQuestioned([]); setSelectedSuspect(''); setNotes(''); setTab('evidence'); setShowReport(false); setShowVerdict(false); setScreen('case');
  };
  const finishCase = () => {
    if (found.length < 2 || questioned.length < 1) {
      setToast('افحص دليلين على الأقل واستجوب مشتبهًا واحدًا قبل توجيه الاتهام');
      return;
    }
    setShowVerdict(false);
    setSelectedSuspect('');
    setScreen('result');
  };
  const clueFound = (id: string) => {
    if (found.includes(id)) return;
    setFound((items) => [...items, id]);
    setToast('تمت إضافة الدليل إلى ملف القضية');
  };

  return (
    <main className={styles.app} dir="rtl">
      <header className={styles.topbar}>
        <button className={styles.brand} onClick={() => setScreen('home')} aria-label="العودة للرئيسية"><span className={styles.brandMark}><Fingerprint size={24} /></span><span><strong>ملف 404</strong><small>غرفة التحقيق</small></span></button>
        <div className={styles.topCenter}><span className={styles.statusDot} /> أرشيف القضايا <span className={styles.topDivider}>/</span> <span>القسم الجنائي</span></div>
        <button className={styles.topButton} onClick={() => setShowReport(true)}><CircleHelp size={16} /> كيف ألعب؟</button>
      </header>

      {screen === 'home' && <section className={styles.home}>
        <div className={styles.hero}>
          <div className={styles.heroGrid} />
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span /> ملفات سرية — مصنّف 404</div>
            <h1>كل دليل يحكي قصة.<br /><em>هل ستكتشف الحقيقة؟</em></h1>
            <p>ادخل غرفة التحقيق، افحص الأدلة، استجوب المشتبه بهم، واكشف ما حدث فعلًا. كل قضية تنتظر عينًا لا يفوتها شيء.</p>
            <button className={styles.primaryCta} onClick={() => startCase(0)}>ابدأ أول تحقيق <ArrowLeft size={18} /></button>
            <div className={styles.heroMeta}><span><LockKeyhole size={14} /> قضايا خيالية</span><span><Clock3 size={14} /> 8–20 دقيقة</span><span><Target size={14} /> اختبر ملاحظتك</span></div>
          </div>
          <div className={styles.caseArt} aria-hidden="true">
            <div className={styles.fileCard}><div className={styles.fileTop}><span>CASE FILE</span><span>404-{String(caseIndex + 21).padStart(3, '0')}</span></div><div className={styles.fingerprint}><Fingerprint size={94} strokeWidth={1.1} /></div><div className={styles.redStamp}>سري للغاية</div><div className={styles.fileLines}><i /><i /><i /></div><div className={styles.fileBottom}>ARCHIVE / EVIDENCE UNIT</div></div>
            <span className={styles.artPin} /><span className={styles.artString} /><span className={styles.artLabel}>NO. 004 / ACTIVE</span>
          </div>
        </div>
        <div className={styles.sectionHead}><div><span className={styles.sectionKicker}>اختر ملفك</span><h2>قضايا تنتظر الحل</h2><p>كل قضية مستقلة، بأدلة وشخصيات ونهاية خاصة.</p></div><span className={styles.caseCount}>03 ملفات متاحة</span></div>
        <div className={styles.caseGrid}>
          {cases.map((item, index) => <article className={styles.caseCard} key={item.id}>
            <div className={styles.caseThumb + ' ' + styles['thumb' + index]}><span className={styles.caseNumber}>CASE / 0{index + 1}</span><span className={styles.thumbIcon}>{index === 0 ? '◆' : index === 1 ? '◉' : '☼'}</span><span className={styles.caseLevel}>{item.level}</span></div>
            <div className={styles.caseCardBody}><div className={styles.caseType}>{item.category}</div><h3>{item.title}</h3><p>{item.intro}</p><div className={styles.caseCardFoot}><span><Clock3 size={14} /> {item.duration}</span><button onClick={() => startCase(index)}>فتح الملف <ChevronLeft size={16} /></button></div></div>
          </article>)}
        </div>
        <div className={styles.homeFoot}><ShieldAlert size={16} /><span>جميع القضايا والشخصيات خيالية، صُممت لاختبار المنطق والانتباه.</span><span className={styles.footCode}>404 / ARCHIVE</span></div>
      </section>}

      {screen === 'case' && <section className={styles.workspace}>
        <div className={styles.workspaceTop}><button className={styles.backButton} onClick={() => setScreen('home')}><ArrowRight size={17} /> كل القضايا</button><div className={styles.caseCrumb}>ملف <b>404-{String(caseIndex + 21).padStart(3, '0')}</b><span>/</span>{current.category}</div><div className={styles.caseTimer}><span className={styles.statusDot} /> التحقيق جارٍ</div></div>
        <div className={styles.caseBanner}><div><span className={styles.sectionKicker}>ملف القضية / {current.location}</span><h1>{current.title}</h1><p>{current.intro}</p></div><div className={styles.bannerSeal}><Fingerprint size={36} /><span>قيد التحقيق</span></div></div>
        <div className={styles.progressRow}><div><span>تقدم التحقيق</span><b>{progress}%</b></div><div className={styles.progressTrack}><span style={{ width: progress + '%' }} /></div><span>{found.length + questioned.length} / {current.clues.length + current.suspects.length} عناصر مفحوصة</span></div>
        <div className={styles.workGrid}>
          <section className={styles.panel}>
            <div className={styles.panelTabs}>
              <button className={tab === 'evidence' ? styles.activeTab : ''} onClick={() => setTab('evidence')}><Search size={16} /> الأدلة <span>{found.length}/{current.clues.length}</span></button>
              <button className={tab === 'suspects' ? styles.activeTab : ''} onClick={() => setTab('suspects')}><Eye size={16} /> المشتبه بهم <span>{questioned.length}/{current.suspects.length}</span></button>
              <button className={tab === 'notes' ? styles.activeTab : ''} onClick={() => setTab('notes')}><FileText size={16} /> ملاحظاتي</button>
            </div>
            {tab === 'evidence' && <div className={styles.evidenceList}>{current.clues.map((clue) => <article key={clue.id} className={styles.evidenceCard}><div className={styles.evidenceIcon}>{clue.icon}</div><div className={styles.evidenceBody}><div className={styles.evidenceMeta}><span>{clue.kind}</span>{found.includes(clue.id) && <span className={styles.examined}><Check size={12} /> تمت المعاينة</span>}</div><h3>{clue.title}</h3><p>{found.includes(clue.id) ? clue.text : 'افتح هذا الدليل لفحص التفاصيل واكتشاف ما قد يخفيه.'}</p>{!found.includes(clue.id) && <button className={styles.inspectButton} onClick={() => clueFound(clue.id)}>فحص الدليل <ArrowLeft size={14} /></button>}</div></article>)}</div>}
            {tab === 'suspects' && <div className={styles.suspectList}>{current.suspects.map((suspect) => <article className={styles.suspectCard} key={suspect.id}><div className={styles.suspectAvatar}>{suspect.name.slice(0, 1)}</div><div className={styles.suspectBody}><div className={styles.evidenceMeta}><span>{suspect.role}</span>{questioned.includes(suspect.id) && <span className={styles.examined}><Check size={12} /> تم الاستجواب</span>}</div><h3>{suspect.name}</h3><p>{questioned.includes(suspect.id) ? suspect.statement : 'ملف الشهادة مغلق. ابدأ الاستجواب لتسجيل أقواله.'}</p>{questioned.includes(suspect.id) ? <div className={styles.statement}><MessageSquareText size={14} /> معلومة متضاربة: {suspect.secret}</div> : <button className={styles.inspectButton} onClick={() => setQuestioned((items) => items.includes(suspect.id) ? items : [...items, suspect.id])}>استجواب المشتبه به <ArrowLeft size={14} /></button>}</div></article>)}</div>}
            {tab === 'notes' && <div className={styles.notesPane}><div className={styles.notesTitle}><FileText size={18} /><div><strong>دفتر المحقق</strong><span>ملاحظاتك خاصة بهذه الجلسة</span></div></div><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="دوّن التناقضات، اربط الأدلة ببعضها، واكتب فرضيتك هنا..." /><div className={styles.notesHint}>تلميح: قارن التوقيت مع الأدلة المادية قبل توجيه الاتهام.</div></div>}
          </section>
          <aside className={styles.sidePanel}>
            <div className={styles.sidePanelHead}><span className={styles.miniIcon}><BookOpen size={17} /></span><div><h3>ملخص القضية</h3><p>المعلومات الأولية</p></div></div>
            <div className={styles.briefRow}><span>الموقع</span><strong>{current.location}</strong></div><div className={styles.briefRow}><span>وقت الحادث</span><strong>{current.time}</strong></div><div className={styles.briefRow}><span>مستوى الصعوبة</span><strong>{current.level}</strong></div>
            <div className={styles.reportBox}><span><ShieldAlert size={15} /> تقرير أولي</span><p>{current.report}</p></div>
            <div className={styles.readyBox}><div className={styles.readyIcon}><Target size={18} /></div><strong>هل كوّنت فرضيتك؟</strong><p>راجع الأدلة وأقوال الجميع قبل اختيار المتهم.</p><button onClick={finishCase}>توجيه الاتهام <ArrowLeft size={15} /></button></div>
            <button className={styles.hintButton} onClick={() => setShowReport(true)}><CircleHelp size={15} /> طريقة اللعب والتلميحات</button>
          </aside>
        </div>
      </section>}

      {screen === 'result' && <section className={styles.resultScreen}>
        <div className={styles.resultCard}><div className={styles.resultSeal}><Target size={35} /></div><span className={styles.sectionKicker}>المرحلة الأخيرة / توجيه الاتهام</span><h1>من تعتقد أنه المسؤول؟</h1><p>اختر الشخص الذي ترى أن الأدلة تشير إليه. فكّر جيدًا، فليس كل من يخفي سرًا هو الجاني.</p>
          <div className={styles.accusationList}>{current.suspects.map((suspect) => <button key={suspect.id} className={selectedSuspect === suspect.id ? styles.selectedAccusation : styles.accusationOption} onClick={() => setSelectedSuspect(suspect.id)}><span className={styles.accusationAvatar}>{suspect.name.slice(0, 1)}</span><span><strong>{suspect.name}</strong><small>{suspect.role}</small></span><span className={styles.radioMark}>{selectedSuspect === suspect.id ? <Check size={14} /> : null}</span></button>)}</div>
          <button className={styles.primaryCta + ' ' + styles.submitAccusation} disabled={!selectedSuspect} onClick={() => setShowVerdict(true)}>كشف الحقيقة <ArrowLeft size={17} /></button>
          {showVerdict && selectedSuspect && <div className={styles.verdict}><div className={selectedSuspect === current.solution ? styles.verdictGood : styles.verdictBad}>{selectedSuspect === current.solution ? <BadgeCheck size={23} /> : <ShieldAlert size={23} />}<strong>{selectedSuspect === current.solution ? 'أحسنت! اتهام صحيح' : 'اتهام غير صحيح'}</strong></div><p>{current.explanation}</p><div className={styles.trueCulprit}>المسؤول في هذه القضية: <b>{current.suspects.find((s) => s.id === current.solution)?.name}</b></div><button className={styles.secondaryCta} onClick={() => startCase(caseIndex)}>إعادة التحقيق <ArrowRight size={15} /></button><button className={styles.secondaryCta} onClick={() => setScreen('home')}>العودة إلى الأرشيف <ArrowLeft size={15} /></button></div>}
        </div>
      </section>}

      {showReport && <div className={styles.modalOverlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowReport(false); }}><section className={styles.helpModal}><button className={styles.modalClose} onClick={() => setShowReport(false)}><X size={18} /></button><span className={styles.helpModalIcon}><CircleHelp size={25} /></span><span className={styles.sectionKicker}>دليل المحقق</span><h2>كيف تلعب ملف 404؟</h2><div className={styles.helpStep}><span>01</span><div><strong>افحص الأدلة</strong><p>افتح كل دليل واقرأ تفاصيله. قد تكون معلومة صغيرة هي مفتاح الحل.</p></div></div><div className={styles.helpStep}><span>02</span><div><strong>استجوب المشتبه بهم</strong><p>اقرأ أقوالهم والأسرار التي قد تتعارض مع الأدلة.</p></div></div><div className={styles.helpStep}><span>03</span><div><strong>دوّن فرضيتك</strong><p>استخدم دفتر المحقق لربط التوقيت والدوافع والآثار.</p></div></div><div className={styles.helpStep}><span>04</span><div><strong>وجّه الاتهام</strong><p>اختر الشخص الذي تفسر الأدلة تصرفاته، ثم اكشف الحقيقة.</p></div></div><button className={styles.primaryCta} onClick={() => setShowReport(false)}>فهمت، لنحقق! <ArrowLeft size={16} /></button></section></div>}
      {toast && <div className={styles.toast}><Check size={16} /> {toast}<button onClick={() => setToast('')}><X size={14} /></button></div>}
    </main>
  );
}
