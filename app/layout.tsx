import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'دَرْبي AI — تعلّم بذكاء',
  description: 'منصتك التعليمية الذكية: لخّص دروسك، اختبر نفسك، وتعلّم بطريقتك.',
  applicationName: 'Darbi AI',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
