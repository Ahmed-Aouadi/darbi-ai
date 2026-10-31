import type { Metadata } from 'next';
import Link from 'next/link';
import SiteShell from '../../components/SiteShell';
import Wave1Panel from '../../components/Wave1Panel';
import ws from '../../styles/workspace.module.css';
import { getProgressChallenges } from '../../lib/challenges';

export const metadata: Metadata = { title: 'تقدّمي وأدوات التعلّم', description: 'أدوات المراجعة والتلميحات والمهام اليومية (نسخة تجريبية محلية).' };

export default function ProgressPage() {
  return (
    <SiteShell>
      <div className={ws.page}>
        <nav className={ws.crumbs} aria-label="مسار التنقل"><Link href="/">الرئيسية</Link><span aria-hidden="true">›</span><span>تقدّمي</span></nav>
      </div>
      <Wave1Panel challenges={getProgressChallenges()} />
    </SiteShell>
  );
}
