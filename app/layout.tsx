import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'مِنجَز — خطط دراستك وأنجزها خطوة بخطوة',
  description: 'مساحة عربية لتنظيم مهامك الدراسية، جلسات التركيز، والاستراحات. خطتك محفوظة على جهازك دون حساب أو اشتراك.',
  applicationName: 'مِنجَز',
  keywords: ['تنظيم الدراسة', 'مؤقت تركيز', 'بومودورو', 'مهام دراسية', 'إنتاجية الطلاب'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
