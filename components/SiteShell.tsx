import type { ReactNode } from 'react';
import styles from '../styles/site.module.css';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/** الهيكل المشترك لكل الصفحات: رأس + محتوى رئيسي + تذييل. */
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.app}>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
