import { NextRequest } from 'next/server';
import { isApiAuth, requireApiUser } from '../../../lib/api-auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (!isApiAuth(auth)) return auth;
  const { data: enabled, error: flagError } = await auth.userClient.rpc('is_feature_enabled', { p_key: 'ff_spaced_review', p_user_id: auth.user.id });
  if (flagError || !enabled) return Response.json({ error: 'المراجعة المتباعدة غير مفعّلة لهذا الحساب.' }, { status: 404 });
  const { data, error } = await auth.admin.from('review_queue')
    .select('challenge_id,due_on,stage,done,challenges(slug,title,topic,level)')
    .eq('user_id', auth.user.id)
    .eq('done', false)
    .order('due_on', { ascending: true })
    .limit(100);
  if (error) return Response.json({ error: 'تعذّر تحميل المراجعات.' }, { status: 500 });
  return Response.json({ reviews: data || [] }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (!isApiAuth(auth)) return auth;
  const { data: enabled, error: flagError } = await auth.userClient.rpc('is_feature_enabled', { p_key: 'ff_spaced_review', p_user_id: auth.user.id });
  if (flagError || !enabled) return Response.json({ error: 'المراجعة المتباعدة غير مفعّلة لهذا الحساب.' }, { status: 404 });
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: 'صيغة الطلب غير صالحة.' }, { status: 400 }); }
  if (typeof body?.challengeId !== 'string' || body.challengeId.length > 64 || typeof body?.passed !== 'boolean') {
    return Response.json({ error: 'بيانات المراجعة غير صالحة.' }, { status: 400 });
  }
  const { data, error } = await auth.userClient.rpc('complete_spaced_review', {
    p_challenge_id: body.challengeId, p_passed: body.passed,
  });
  if (error) return Response.json({ error: 'تعذّر تحديث المراجعة.' }, { status: 409 });
  return Response.json({ dueOn: data }, { headers: { 'Cache-Control': 'private, no-store' } });
}
