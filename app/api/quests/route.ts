import { NextRequest } from 'next/server';
import { isApiAuth, requireApiUser } from '../../../lib/api-auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (!isApiAuth(auth)) return auth;
  const { error: assignError } = await auth.userClient.rpc('ensure_daily_quests');
  if (assignError) return Response.json({ error: 'تعذّر تحميل مهام اليوم.' }, { status: 500 });
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Algiers', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const { data, error } = await auth.admin
    .from('user_quests')
    .select('quest_id,day,progress,claimed,claimed_at,quests(id,key,kind,title,target,reward,metric)')
    .eq('user_id', auth.user.id)
    .in('day', [day]);
  if (error) return Response.json({ error: 'تعذّر قراءة مهامك.' }, { status: 500 });
  return Response.json({ day, quests: data || [] }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (!isApiAuth(auth)) return auth;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: 'صيغة الطلب غير صالحة.' }, { status: 400 }); }
  const questId = (body as { questId?: unknown })?.questId;
  if (!Number.isInteger(questId) || Number(questId) < 1) return Response.json({ error: 'معرّف المهمة غير صالح.' }, { status: 400 });
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Algiers', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const { data, error } = await auth.userClient.rpc('claim_quest_reward', { p_quest_id: questId, p_day: day });
  if (error) return Response.json({ error: 'لم تكتمل المهمة بعد أو سبق استلام مكافأتها.' }, { status: 409 });
  return Response.json({ gems: data }, { headers: { 'Cache-Control': 'private, no-store' } });
}
