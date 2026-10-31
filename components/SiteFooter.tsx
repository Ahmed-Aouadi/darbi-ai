import Link from 'next/link';
import styles from '../styles/site.module.css';
import BrandMark from './BrandMark';
import { BRAND } from '../lib/brand';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Link className={styles.brand} href="/" aria-label={`${BRAND.plainName} — الصفحة الرئيسية`}>
        <span className={styles.brandMark}><BrandMark size={22} /></span>
        <span><b>{BRAND.name}</b><small>{BRAND.tagline}</small></span>
      </Link>
      <span>تعلّم البرمجة من واقعك اليومي.</span>
      <span>صُنع بحبّ في الجزائر 🇩🇿</span>
    </footer>
  );
}
