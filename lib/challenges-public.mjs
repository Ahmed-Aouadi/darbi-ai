/**
 * إسقاط بيانات التحديات إلى ما يصلح للمتصفح.
 * القاعدة: الاختبارات المخفية والحل المرجعي لا يغادران الخادم أبدًا.
 */
export const LEVEL_LABEL = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' };
export const LEVEL_MINUTES = { easy: 3, medium: 5, hard: 8 };
const TOPIC_ICON = { 'نقل': '🚌', 'سوق': '🧺', 'مال': '💰', 'مدرسة': '📚', 'كشافة': '🏕️', 'وقت': '⏱️', 'منزل': '🏠' };

export const topicIcon = (topic) => TOPIC_ICON[topic] || '💡';

export function toPublicChallenge(c) {
  return {
    slug: c.slug,
    title: c.title,
    topic: c.topic,
    level: c.level,
    levelLabel: LEVEL_LABEL[c.level] || c.level,
    points: c.points,
    minutes: LEVEL_MINUTES[c.level] || 5,
    icon: topicIcon(c.topic),
    story: c.story,
    task: c.task,
    inputDesc: c.input_desc || '',
    outputDesc: c.output_desc || '',
    constraints: Array.isArray(c.constraints) ? c.constraints : [],
    examples: (c.examples || []).map(({ args, expected }) => ({ args, expected })),
    functionName: c.functionName,
    starter: { javascript: c.starter?.javascript || '' },
    visibleTests: (c.tests || []).filter((t) => t.hidden === false).map(({ args, expected }) => ({ args, expected })),
    hints: Array.isArray(c.hints) ? c.hints.slice(0, 3) : [],
    conceptTag: c.concept_tag || '',
    tags: Array.isArray(c.tags) ? c.tags : [],
  };
}

export function toProgressChallenge(c) {
  const e = c.editorial;
  return {
    ...toPublicChallenge(c),
    editorial: e && typeof e === 'object' ? { idea: e.idea, steps: e.steps || [], complexity: e.complexity } : null,
  };
}

export function toCard(c) {
  const { slug, title, topic, level, levelLabel, points, minutes, icon, story } = toPublicChallenge(c);
  return { slug, title, topic, level, levelLabel, points, minutes, icon, story };
}
