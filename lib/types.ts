export type Level = 'easy' | 'medium' | 'hard';

export interface TestCase { args: unknown[]; expected: unknown }

/** ما يُسمح بوصوله إلى المتصفح. لا يحتوي الاختبارات المخفية ولا الحل المرجعي. */
export interface PublicChallenge {
  slug: string;
  title: string;
  topic: string;
  level: Level;
  levelLabel: string;
  points: number;
  minutes: number;
  icon: string;
  story: string;
  task: string;
  inputDesc: string;
  outputDesc: string;
  constraints: string[];
  examples: TestCase[];
  functionName: string;
  starter: { javascript: string };
  visibleTests: TestCase[];
  hints: string[];
  conceptTag: string;
  tags: string[];
}

export interface ProgressChallenge extends PublicChallenge {
  editorial: { idea: string; steps: string[]; complexity?: string } | null;
}

export type ChallengeCardData = Pick<PublicChallenge, 'slug' | 'title' | 'topic' | 'level' | 'levelLabel' | 'points' | 'minutes' | 'icon' | 'story'>;
