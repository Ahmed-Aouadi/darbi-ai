create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null check (event_name in (
    'quest_viewed','quest_claimed','gem_earned','streak_freeze_purchased','streak_repaired',
    'hint_revealed','editorial_opened','review_completed','skill_map_viewed',
    'custom_run_started','custom_run_completed','concept_card_opened','recommendation_opened'
  )),
  payload jsonb not null default '{}'::jsonb check (octet_length(payload::text) <= 2048),
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_user_created_idx on public.analytics_events(user_id, created_at desc);
alter table public.analytics_events enable row level security;
drop policy if exists analytics_events_no_client_read on public.analytics_events;
create policy analytics_events_no_client_read on public.analytics_events for select using (false);
revoke all on public.analytics_events from anon, authenticated;
grant insert on public.analytics_events to authenticated;

create or replace function public.record_analytics_event(p_event_name text, p_payload jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if p_event_name not in (
    'quest_viewed','quest_claimed','gem_earned','streak_freeze_purchased','streak_repaired',
    'hint_revealed','editorial_opened','review_completed','skill_map_viewed',
    'custom_run_started','custom_run_completed','concept_card_opened','recommendation_opened'
  ) then raise exception 'invalid event name' using errcode = '22023'; end if;
  if octet_length(coalesce(p_payload, '{}'::jsonb)::text) > 2048 then
    raise exception 'event payload too large' using errcode = '22023';
  end if;
  if (select count(*) from public.analytics_events where user_id = v_user and created_at > now() - interval '1 day') >= 500 then
    raise exception 'analytics event limit reached' using errcode = '54000';
  end if;
  insert into public.analytics_events(user_id, event_name, payload)
  values (v_user, p_event_name, coalesce(p_payload, '{}'::jsonb));
end;
$$;
revoke all on function public.record_analytics_event(text, jsonb) from public, anon;
grant execute on function public.record_analytics_event(text, jsonb) to authenticated;
