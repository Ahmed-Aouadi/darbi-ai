import Link from 'next/link';
import SiteShell from '../components/SiteShell';
import styles from '../styles/site.module.css';
import ws from '../styles/workspace.module.css';

export default function NotFound() {
  return (
    <SiteShell>
      <div className={ws.centerPage}>
        <div>
          <span style={{ fontSize: 56 }} aria-hidden="true">🧭</span>
          <h1>لم نجد هذه الصفحة</h1>
          <p>ربما تغيّر الرابط أو لم يعد التحدّي موجودًا.</p>
          <Link className={styles.primaryBtn} href="/challenges">تصفّح التحديات</Link>
        </div>
      </div>
    </SiteShell>
  );
}
