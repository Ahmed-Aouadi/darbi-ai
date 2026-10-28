import { NextRequest } from 'next/server';
import { isApiAuth, requireApiUser } from '../../../lib/api-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (!isApiAuth(auth)) return auth;
  let action: unknown;
  try { action = (await request.json())?.action; } catch { return Response.json({ error: 'صيغة الطلب غير صالحة.' }, { status: 400 }); }
  const { data: enabled, error: flagError } = await auth.userClient.rpc('is_feature_enabled', { p_key: 'ff_streak_freeze', p_user_id: auth.user.id });
  if (flagError || !enabled) return Response.json({ error: 'حماية السلسلة غير مفعّلة لهذا الحساب.' }, { status: 404 });
  const rpc = action === 'purchase' ? 'purchase_streak_freeze' : action === 'repair' ? 'repair_streak' : null;
  if (!rpc) return Response.json({ error: 'الإجراء غير معروف.' }, { status: 400 });
  const { data, error } = await auth.userClient.rpc(rpc);
  if (error) return Response.json({ error: action === 'purchase' ? 'لا تملك جواهر كافية أو مخزون الحماية ممتلئ.' : 'لا يمكن إصلاح السلسلة الآن.' }, { status: 409 });
  return Response.json({ result: data }, { headers: { 'Cache-Control': 'private, no-store' } });
}
