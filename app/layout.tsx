import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ملف 404 — غرفة التحقيق',
  description: 'افحص الأدلة، استجوب المشتبه بهم، واكشف الحقيقة في قضايا غامضة تفاعلية.',
  applicationName: 'ملف 404',
  keywords: ['ألغاز', 'تحقيق', 'قضايا غامضة', 'ألعاب ذكاء', 'غرفة التحقيق'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
