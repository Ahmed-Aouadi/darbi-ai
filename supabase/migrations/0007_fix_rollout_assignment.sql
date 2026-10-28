create or replace function public.is_feature_enabled(p_key text, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((
    select enabled and (
      rollout_percent = 100 or (
        rollout_percent > 0 and
        mod(abs((('x' || substr(md5(coalesce(p_user_id::text, 'anonymous') || p_key), 1, 8))::bit(32)::bigint)), 100) < rollout_percent
      )
    )
    from public.feature_flags where key = p_key
  ), false);
$$;
revoke all on function public.is_feature_enabled(text, uuid) from public;
grant execute on function public.is_feature_enabled(text, uuid) to anon, authenticated;
