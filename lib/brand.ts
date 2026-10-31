/** هوية المنصة في مكان واحد. غيّر الاسم أو الوصف هنا فيتغير في كل الموقع. */
export const BRAND = {
  name: 'سَطر',
  plainName: 'سطر',
  tagline: 'برمج مشاكل حيّك',
  description: 'تحديات برمجية عربية من واقع الحياة في الجزائر. حلّها بكودك، تعلّم خطوة بخطوة، وتنافس مع أصدقائك كل أسبوع.',
  themeColor: '#0f9d76',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const;

export const NAV_LINKS = [
  { href: '/challenges', label: 'التحديات' },
  { href: '/progress', label: 'تقدّمي' },
  { href: '/#how', label: 'كيف تعمل؟' },
  { href: '/#league', label: 'دوري الأسبوع' },
] as const;
