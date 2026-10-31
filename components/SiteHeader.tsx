'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Menu, X } from 'lucide-react';
import styles from '../styles/site.module.css';
import AuthPanel from './AuthPanel';
import BrandMark from './BrandMark';
import { BRAND, NAV_LINKS } from '../lib/brand';

export default function SiteHeader() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const isActive = (href: string) => !href.includes('#') && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className={styles.topbar}>
      <Link className={styles.brand} href="/" aria-label={`${BRAND.plainName} — الصفحة الرئيسية`}>
        <span className={styles.brandMark}><BrandMark size={24} /></span>
        <span><b>{BRAND.name}</b><small>{BRAND.tagline}</small></span>
      </Link>
      <nav id="main-nav" className={open ? styles.navOpen : styles.nav} aria-label="القائمة الرئيسية">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={isActive(link.href) ? styles.activeNav : undefined} aria-current={isActive(link.href) ? 'page' : undefined}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className={styles.topActions}>
        <AuthPanel />
        <Link className={styles.startBtn} href="/challenges">ابدأ الآن <ArrowLeft size={16} /></Link>
      </div>
      <button className={styles.menuBtn} onClick={() => setOpen((v) => !v)} aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={open} aria-controls="main-nav">
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
