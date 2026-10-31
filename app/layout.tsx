import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../components/AuthProvider';
import { BRAND } from '../lib/brand';

const fontUi = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-ui' });
const fontCode = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-code' });

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: { default: `${BRAND.name} — ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: ['برمجة', 'تحديات برمجية', 'تعلم JavaScript', 'الجزائر', 'سطر'],
  openGraph: { title: `${BRAND.name} — ${BRAND.tagline}`, description: BRAND.description, locale: 'ar_DZ', type: 'website' },
};

export const viewport: Viewport = { themeColor: BRAND.themeColor, width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${fontUi.variable} ${fontCode.variable}`}>
      <body>
        <a className="skip-link" href="#main">تخطَّ إلى المحتوى</a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
