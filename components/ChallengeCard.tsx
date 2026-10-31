import Link from 'next/link';
import { ArrowLeft, Award, Check, Clock3 } from 'lucide-react';
import styles from '../styles/site.module.css';
import ws from '../styles/workspace.module.css';
import type { ChallengeCardData } from '../lib/types';

const levelClass = (level: ChallengeCardData['level']) =>
  level === 'easy' ? styles.levelEasy : level === 'medium' ? styles.levelMedium : styles.levelHard;
const short = (text: string, max = 105) => (text.length > max ? `${text.slice(0, max).trim()}…` : text);

export default function ChallengeCard({ challenge: c, solved = false }: { challenge: ChallengeCardData; solved?: boolean }) {
  return (
    <article className={styles.challengeCard} style={{ position: 'relative' }}>
      {solved && <span className={ws.solvedMark}><Check size={14} /> حللته</span>}
      <div className={styles.challengeCardTop}>
        <span className={styles.challengeEmoji} aria-hidden="true">{c.icon}</span>
        <span className={levelClass(c.level)}>{c.levelLabel}</span>
      </div>
      <span className={styles.topic}>{c.topic}</span>
      <h3>{c.title}</h3>
      <p>{short(c.story)}</p>
      <div className={styles.cardMeta}>
        <span><Award size={15} />{c.points} نقطة</span>
        <span><Clock3 size={15} />{c.minutes} دقائق</span>
      </div>
      <Link href={`/challenges/${c.slug}`} className={styles.cardLink}>{solved ? 'راجع حلّك' : 'حلّ التحدّي'} <ArrowLeft size={15} /></Link>
    </article>
  );
}
