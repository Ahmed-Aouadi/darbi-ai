import { NextRequest } from 'next/server';
import { isApiAuth, requireApiUser } from '../../../lib/api-auth';

export const runtime = 'nodejs';

const allowedEvents = new Set([
  'quest_viewed','quest_claimed','gem_earned','streak_freeze_purchased','streak_repaired',
  'hint_revealed','editorial_opened','review_completed','skill_map_viewed',
  'custom_run_started','custom_run_completed','concept_card_opened','recommendation_opened',
]);

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (!isApiAuth(auth)) return auth;
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: 'صيغة الطلب غير صالحة.' }, { status: 400 }); }
  if (typeof body?.eventName !== 'string' || !allowedEvents.has(body.eventName)) {
    return Response.json({ error: 'نوع الحدث غير مسموح.' }, { status: 400 });
  }
  const payload = body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload) ? body.payload : {};
  if (JSON.stringify(payload).length > 1800) return Response.json({ error: 'بيانات الحدث كبيرة جدًا.' }, { status: 413 });
  const { error } = await auth.userClient.rpc('record_analytics_event', { p_event_name: body.eventName, p_payload: payload });
  if (error) return Response.json({ error: 'تعذّر تسجيل الحدث.' }, { status: 429 });
  return Response.json({ recorded: true }, { status: 202, headers: { 'Cache-Control': 'no-store' } });
}
