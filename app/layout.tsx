import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'سوقي — كتالوجك التجاري في مكان واحد',
  description: 'أنشئ كتالوج منتجاتك، نظّم الأسعار والمخزون، واستقبل طلبات زبائنك عبر واتساب.',
  applicationName: 'سوقي',
  keywords: ['كتالوج منتجات', 'إدارة متجر', 'مشاريع صغيرة', 'بيع عبر واتساب', 'تجارة إلكترونية'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
