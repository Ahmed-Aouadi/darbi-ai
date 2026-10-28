import { NextRequest } from 'next/server';
import { isApiAuth, requireApiUser } from '../../../lib/api-auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (!isApiAuth(auth)) return auth;
  const keys = ['ff_quests','ff_streak_freeze','ff_hint_ladder','ff_editorial','ff_spaced_review','ff_skill_map','ff_custom_run','ff_concept_cards'];
  const results = await Promise.all(keys.map(async key => {
    const { data, error } = await auth.userClient.rpc('is_feature_enabled', { p_key: key, p_user_id: auth.user.id });
    return [key, error ? false : Boolean(data)] as const;
  }));
  return Response.json({ flags: Object.fromEntries(results) }, { headers: { 'Cache-Control': 'private, no-store' } });
}
