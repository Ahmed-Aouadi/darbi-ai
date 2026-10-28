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
  // These migration-defined RPCs are not yet represented in the generated Supabase Database type.
  const editorialClient = auth.userClient as unknown as {
    rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
  const { data: enabled, error: flagError } = await editorialClient.rpc('is_feature_enabled', {
    p_key: 'ff_editorial', p_user_id: auth.user.id,
  });
  if (flagError || enabled !== true) return Response.json({ error: 'الشرح التحريري غير متاح حاليًا.' }, { status: 404 });
  const { error } = await editorialClient.rpc('record_editorial_read', { p_challenge_id: body.challengeId });
  if (error) return Response.json({ error: 'يجب اجتياز التحدي أولًا قبل تسجيل قراءة الشرح.' }, { status: 403 });
  return Response.json({ recorded: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
