import type { Metadata } from 'next';
import Link from 'next/link';
import SiteShell from '../../components/SiteShell';
import ChallengeLibrary from '../../components/ChallengeLibrary';
import ws from '../../styles/workspace.module.css';
import { getChallengeCards } from '../../lib/challenges';

export const metadata: Metadata = { title: 'التحديات', description: 'مكتبة التحديات البرمجية العربية: اختر موضوعك ومستواك وابدأ الحلّ.' };

export default function ChallengesPage() {
  const cards = getChallengeCards();
  return (
    <SiteShell>
      <div className={ws.page}>
        <nav className={ws.crumbs} aria-label="مسار التنقل"><Link href="/">الرئيسية</Link><span aria-hidden="true">›</span><span>التحديات</span></nav>
        <div className={ws.pageHead}>
          <div><h1>مكتبة التحديات</h1><p>اختر تحدّيًا يناسب مستواك. كل تحدٍّ يبدأ بقصة من الواقع ثم مطلوب واضح وأمثلة تجرّب عليها حلّك.</p></div>
        </div>
        <ChallengeLibrary cards={cards} />
      </div>
    </SiteShell>
  );
}
