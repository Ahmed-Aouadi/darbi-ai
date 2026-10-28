'use client';

import { useState } from 'react';
import { LogIn, LogOut, Mail, X } from 'lucide-react';
import { useAuth } from './auth-context';
import styles from './auth-panel.module.css';

export default function AuthPanel() {
  const { session, loading, configured, signInWithEmail, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <button className={styles.button} disabled>جارٍ التحقق…</button>;
  if (session) return <button className={styles.button} onClick={() => void signOut()}><LogOut size={15}/> خروج</button>;
  return <>
    <button className={styles.button} onClick={() => { setOpen(true); setMessage(''); }}><LogIn size={15}/> دخول</button>
    {open && <div className={styles.backdrop} role="presentation" onClick={() => setOpen(false)}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={event => event.stopPropagation()}>
        <button className={styles.close} aria-label="إغلاق" onClick={() => setOpen(false)}><X size={18}/></button>
        <span className={styles.icon}><Mail size={23}/></span>
        <h2 id="auth-title">الدخول إلى سَطر</h2>
        <p>أرسل رابط دخول آمن إلى بريدك الإلكتروني، بلا كلمة مرور.</p>
        {!configured && <p className={styles.warning}>تسجيل الدخول غير مهيأ بعد. أضف متغيرات Supabase كما في ملف .env.example.</p>}
        <form onSubmit={async event => { event.preventDefault(); setBusy(true); setMessage(''); const result = await signInWithEmail(email); setMessage(result.error || 'إذا كان البريد مسموحًا، ستصلك رسالة فيها رابط الدخول.'); setBusy(false); }}>
          <label htmlFor="auth-email">البريد الإلكتروني</label>
          <input id="auth-email" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/>
          <button type="submit" disabled={busy || !configured}>{busy ? 'جارٍ الإرسال…' : 'أرسل رابط الدخول'}</button>
        </form>
        {message && <p className={styles.message} role="status">{message}</p>}
        <small>لا تشارك رابط الدخول مع أي شخص آخر.</small>
      </section>
    </div>}
  </>;
}
