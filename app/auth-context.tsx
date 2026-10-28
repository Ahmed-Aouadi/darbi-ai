'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '../lib/supabase-browser';

type AuthValue = {
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthValue>({
  session: null, loading: true, configured: false,
  signInWithEmail: async () => ({ error: 'إعداد تسجيل الدخول غير متوفر.' }),
  signOut: async () => undefined,
});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const client = getSupabaseBrowserClient();

  useEffect(() => {
    if (!client) { setLoading(false); return; }
    let alive = true;
    client.auth.getSession().then(({ data }) => {
      if (alive) { setSession(data.session); setLoading(false); }
    });
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (alive) { setSession(nextSession); setLoading(false); }
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, [client]);

  const signInWithEmail = async (email: string) => {
    if (!client) return { error: 'أضف متغيرات Supabase إلى إعدادات النشر أولًا.' };
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { error: 'أدخل بريدًا إلكترونيًا صحيحًا.' };
    const { error } = await client.auth.signInWithOtp({
      email: cleanEmail,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    });
    return error ? { error: 'تعذّر إرسال رابط الدخول. تحقق من إعدادات البريد في Supabase.' } : {};
  };
  const signOut = async () => { if (client) await client.auth.signOut(); };

  return <AuthContext.Provider value={{ session, loading, configured: Boolean(client), signInWithEmail, signOut }}>{children}</AuthContext.Provider>;
}
