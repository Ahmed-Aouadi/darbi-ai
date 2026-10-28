import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './auth-context';

export const metadata: Metadata = {
  title: 'سَطر — برمج مشاكل حيّك',
  description: 'تحديات برمجية عربية من واقع الحياة في الجزائر. حلّها بكودك وتنافس مع أصدقائك كل أسبوع.',
  applicationName: 'سَطر',
  keywords: ['برمجة', 'تحديات برمجية', 'تعلم JavaScript', 'الجزائر', 'سطر'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
