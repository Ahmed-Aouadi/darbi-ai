'use client';

import styles from '../styles/site.module.css';
import ws from '../styles/workspace.module.css';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={styles.app}>
      <div className={ws.centerPage}>
        <div>
          <span style={{ fontSize: 56 }} aria-hidden="true">🛠️</span>
          <h1>حدث خطأ غير متوقع</h1>
          <p>لم تضع مسودتك: هي محفوظة على جهازك. جرّب إعادة المحاولة.</p>
          <button type="button" className={styles.primaryBtn} onClick={reset}>إعادة المحاولة</button>
        </div>
      </div>
    </div>
  );
}
