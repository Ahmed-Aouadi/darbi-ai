import { NextRequest } from 'next/server';
import { isApiAuth, requireApiUser } from '../../../../lib/api-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (!isApiAuth(auth)) return auth;
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: 'صيغة الطلب غير صالحة.' }, { status: 400 }); }
  if (typeof body?.challengeId !== 'string' || body.challengeId.length > 64) {
    return Response.json({ error: 'معرّف التحدي غير صالح.' }, { status: 400 });
  }
  const { data: enabled, error: flagError } = await auth.userClient.rpc('is_feature_enabled', {
    p_key: 'ff_editorial', p_user_id: auth.user.id,
  });
  if (flagError || !enabled) return Response.json({ error: 'الشرح التحريري غير متاح حاليًا.' }, { status: 404 });
  const { error } = await auth.userClient.rpc('record_editorial_read', { p_challenge_id: body.challengeId });
  if (error) return Response.json({ error: 'يجب اجتياز التحدي أولًا قبل تسجيل قراءة الشرح.' }, { status: 403 });
  return Response.json({ recorded: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
