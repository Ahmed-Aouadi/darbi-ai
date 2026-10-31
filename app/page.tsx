import Link from 'next/link';
import { ArrowLeft, ArrowUpLeft, BookOpen, Check, Code2, Flame, Trophy, Users, Zap } from 'lucide-react';
import styles from '../styles/site.module.css';
import SiteShell from '../components/SiteShell';
import ChallengeCard from '../components/ChallengeCard';
import ChallengeWorkspace from '../components/ChallengeWorkspace';
import { getChallengeCards, getChallenges } from '../lib/challenges';

export default function HomePage() {
  const all = getChallenges();
  const demo = all.find((c) => c.slug === 'nearest-bus') ?? all[0];
  const featured = getChallengeCards().slice(0, 6);

  return (
    <SiteShell>
      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span className={styles.liveDot} /> البرمجة تبدأ من حيّك</div>
          <h1>عندك مشكلة في الحي؟<br /><em>برمج لها حلًّا.</em></h1>
          <p>تحديات برمجية مستوحاة من حياتنا اليومية في الجزائر. حلّها بكودك، وتعلّم خطوة بخطوة، وتنافس مع أصدقائك كل أسبوع.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryBtn} href="#try">جرّب أول تحدٍّ <ArrowLeft size={18} /></a>
            <Link className={styles.secondaryBtn} href="/challenges">كل التحديات <ArrowUpLeft size={17} /></Link>
          </div>
          <div className={styles.socialProof}>
            <div className={styles.avatars}><span>م</span><span>ي</span><span>س</span><span>+</span></div>
            <span><b>تعلّم بالتطبيق لا بالحفظ</b><small>مناسب للمبتدئين — بلا تسجيل</small></span>
          </div>
        </div>
        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.decorCircle} />
          <div className={styles.codeCard}>
            <div className={styles.codeTop}><span className={styles.windowDots}><i /><i /><i /></span><span>challenge.js</span><span className={styles.jsBadge}>JS</span></div>
            <div className={styles.codeBody}>
              <div><span className={styles.lineNo}>01</span><span className={styles.codePurple}>function</span> <span className={styles.codeBlue}>nextBus</span>(now, times) {'{'}</div>
              <div><span className={styles.lineNo}>02</span> &nbsp;<span className={styles.codeGray}>{'/* متى تصل الحافلة القادمة؟ */'}</span></div>
              <div><span className={styles.lineNo}>03</span> &nbsp;<span className={styles.codePurple}>return</span> findNearest(now, times);</div>
              <div><span className={styles.lineNo}>04</span>{'}'}</div>
            </div>
            <div className={styles.passCard}><span><Check size={16} /></span><div><b>اختبار ناجح!</b><small>الانتظار: 55 دقيقة</small></div></div>
          </div>
          <div className={styles.floatTag}><span>🚌</span><div><b>أقرب حافلة</b><small>من تحديات «سَطر»</small></div><span className={styles.tagArrow}><ArrowUpLeft size={16} /></span></div>
          <div className={styles.heroStat}><Zap size={17} /><span>نتيجة فورية</span></div>
        </div>
      </section>

      <section className={styles.statsStrip}>
        <div><span className={styles.statIcon}><Code2 /></span><p><b>{all.length} تحدّيًا</b><small>من واقعنا اليومي</small></p></div>
        <div><span className={styles.statIcon}><Users /></span><p><b>دوري الأصدقاء</b><small>قريبًا: نافس جماعتك كل أسبوع</small></p></div>
        <div><span className={styles.statIcon}><Flame /></span><p><b>خطوة بخطوة</b><small>من أول سطر حتى الاحتراف</small></p></div>
        <div><span className={styles.statIcon}><Trophy /></span><p><b>اجمع النقاط</b><small>وافتح شارات جديدة</small></p></div>
      </section>

      {demo && (
        <section className={styles.trySection} id="try">
          <div className={styles.sectionIntro}>
            <div><span className={styles.kicker}>جرّب بنفسك</span><h2>أول تحدٍّ في أقل من دقيقتين</h2><p>لا تحتاج حسابًا. عدّل الدالة واضغط «شغّل الأمثلة» لترى النتيجة.</p></div>
          </div>
          <ChallengeWorkspace challenge={demo} embedded />
        </section>
      )}

      <section className={styles.challengeSection} id="challenges">
        <div className={styles.sectionIntro}>
          <div><span className={styles.kicker}>اختر مشكلتك</span><h2>تحديات تشبه حياتنا</h2><p>كل تحدٍّ حكاية من الواقع، وكل حلّ يقرّبك من مستوى جديد.</p></div>
          <Link href="/challenges" className={styles.textLink}>عرض كل التحديات <ArrowLeft size={16} /></Link>
        </div>
        <div className={styles.challengeGrid}>{featured.map((c) => <ChallengeCard key={c.slug} challenge={c} />)}</div>
      </section>

      <section className={styles.howSection} id="how">
        <div className={styles.sectionIntro}><div><span className={styles.kicker}>بسيطة وواضحة</span><h2>ثلاث خطوات وتبدأ البرمجة</h2></div></div>
        <div className={styles.steps}>
          <article><span>01</span><BookOpen /><h3>افهم المشكلة</h3><p>اقرأ القصة والمطلوب والأمثلة، بلا تعقيد.</p></article>
          <article><span>02</span><Code2 /><h3>جرّب كودك</h3><p>اكتب JavaScript وشاهد النتيجة في ثوانٍ.</p></article>
          <article><span>03</span><Trophy /><h3>تقدّم وتنافس</h3><p>حلّ المزيد، وافتح الشارات، وتحدَّ أصدقاءك.</p></article>
        </div>
      </section>

      <section className={styles.leagueBanner} id="league">
        <div className={styles.leagueIcon}><Trophy size={30} /></div>
        <div><span>قريبًا — كل أسبوع حكاية جديدة</span><h2>من مبرمج الحيّ؟</h2><p>حلّ تحديات الأسبوع، واجمع النقاط، ونافس أصحابك بروح رياضية.</p></div>
        <Link className={styles.leagueLink} href="/progress">جرّب أدوات التعلّم <ArrowLeft size={17} /></Link>
        <div className={styles.leagueDecoration}>#01</div>
      </section>
    </SiteShell>
  );
}
