import { createClient, type User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type ApiAuth = { user: User; admin: ReturnType<typeof createClient>; userClient: ReturnType<typeof createClient> };

export async function requireApiUser(request: NextRequest): Promise<ApiAuth | Response> {
  if (!url || !anonKey || !serviceKey) {
    return Response.json({ error: 'الخدمة غير مهيأة بعد. أضف متغيرات Supabase على الخادم.' }, { status: 503 });
  }
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token || token.length > 4096) return Response.json({ error: 'يلزم تسجيل الدخول.' }, { status: 401 });

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) return Response.json({ error: 'جلسة غير صالحة أو منتهية.' }, { status: 401 });

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return { user: data.user, admin, userClient };
}

export function isApiAuth(value: ApiAuth | Response): value is ApiAuth {
  return !(value instanceof Response);
}
