import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteShell from '../../../components/SiteShell';
import ChallengeWorkspace from '../../../components/ChallengeWorkspace';
import ws from '../../../styles/workspace.module.css';
import { getChallenge, getChallenges, getNeighbors } from '../../../lib/challenges';

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return getChallenges().map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const challenge = getChallenge(params.slug);
  return challenge ? { title: challenge.title, description: challenge.story } : { title: 'تحدٍّ غير موجود' };
}

export default function ChallengePage({ params }: Props) {
  const challenge = getChallenge(params.slug);
  if (!challenge) notFound();
  const { prev, next } = getNeighbors(challenge.slug);
  return (
    <SiteShell>
      <div className={ws.page}>
        <nav className={ws.crumbs} aria-label="مسار التنقل">
          <Link href="/">الرئيسية</Link><span aria-hidden="true">›</span>
          <Link href="/challenges">التحديات</Link><span aria-hidden="true">›</span>
          <span>{challenge.title}</span>
        </nav>
        <div className={ws.pageHead}>
          <div><h1>{challenge.title}</h1><p>{challenge.topic} · {challenge.levelLabel} · تقريبًا {challenge.minutes} دقائق</p></div>
        </div>
        <ChallengeWorkspace key={challenge.slug} challenge={challenge} prev={prev} next={next} />
      </div>
    </SiteShell>
  );
}
