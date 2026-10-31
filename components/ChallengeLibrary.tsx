'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import styles from '../styles/site.module.css';
import ws from '../styles/workspace.module.css';
import ChallengeCard from './ChallengeCard';
import { normalizeArabicSearch } from '../lib/wave1-core.mjs';
import type { ChallengeCardData } from '../lib/types';

const LEVELS = [['all', 'الكل'], ['easy', 'سهل'], ['medium', 'متوسط'], ['hard', 'صعب']] as const;

export default function ChallengeLibrary({ cards }: { cards: ChallengeCardData[] }) {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('الكل');
  const [level, setLevel] = useState<(typeof LEVELS)[number][0]>('all');
  const [solved, setSolved] = useState<string[]>([]);

  useEffect(() => {
    try { setSolved(JSON.parse(localStorage.getItem('satr:solved') || '[]')); } catch { setSolved([]); }
  }, []);

  const topics = useMemo(() => ['الكل', ...Array.from(new Set(cards.map((c) => c.topic)))], [cards]);
  const filtered = useMemo(() => {
    const q = normalizeArabicSearch(search);
    return cards.filter((c) =>
      (topic === 'الكل' || c.topic === topic) &&
      (level === 'all' || c.level === level) &&
      (!q || normalizeArabicSearch(`${c.title} ${c.topic} ${c.story}`).includes(q)));
  }, [cards, search, topic, level]);
  const dirty = search !== '' || topic !== 'الكل' || level !== 'all';

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن تحدٍّ بالاسم أو الموضوع…" aria-label="بحث عن تحدٍّ" type="search" />
        </div>
        <div className={styles.filterChips} role="group" aria-label="تصفية حسب الموضوع">
          {topics.map((t) => (
            <button key={t} type="button" className={topic === t ? styles.chipActive : styles.chip} onClick={() => setTopic(t)} aria-pressed={topic === t}>{t}</button>
          ))}
        </div>
      </div>
      <div className={ws.libraryTop}>
        <div className={ws.chipRow} role="group" aria-label="تصفية حسب المستوى">
          <span className={ws.chipLabel}>المستوى:</span>
          {LEVELS.map(([value, label]) => (
            <button key={value} type="button" className={level === value ? styles.chipActive : styles.chip} onClick={() => setLevel(value)} aria-pressed={level === value}>{label}</button>
          ))}
        </div>
        <span className={ws.count} aria-live="polite">{filtered.length} من {cards.length} تحدّيًا · حللتَ {solved.filter((s) => cards.some((c) => c.slug === s)).length}</span>
      </div>
      <div className={styles.challengeGrid}>
        {filtered.map((c) => <ChallengeCard key={c.slug} challenge={c} solved={solved.includes(c.slug)} />)}
      </div>
      {filtered.length === 0 && (
        <div className={styles.emptyState}>
          لا توجد تحديات بهذه المرشحات.{' '}
          {dirty && <button type="button" className={ws.resetBtn} onClick={() => { setSearch(''); setTopic('الكل'); setLevel('all'); }}>إعادة ضبط المرشحات</button>}
        </div>
      )}
    </>
  );
}
