-- Satr V2 Wave 1: additive learning, quests, gems, reviews, hints, and flags.
-- Safe to apply after 0001_initial_schema.sql. No existing columns are removed or reinterpreted.

create table if not exists public.feature_flags (
  key text primary key check (key ~ '^ff_[a-z0-9_]+$'),
  enabled boolean not null default false,
  rollout_percent smallint not null default 0 check (rollout_percent between 0 and 100),
  updated_at timestamptz not null default now()
);

insert into public.feature_flags(key, enabled, rollout_percent) values
  ('ff_quests', false, 0),
  ('ff_streak_freeze', false, 0),
  ('ff_hint_ladder', false, 0),
  ('ff_editorial', false, 0),
  ('ff_spaced_review', false, 0),
  ('ff_skill_map', false, 0),
  ('ff_custom_run', false, 0),
  ('ff_concept_cards', false, 0)
on conflict (key) do nothing;

alter table public.profiles
  add column if not exists gems integer not null default 0 check (gems >= 0),
  add column if not exists streak_freezes smallint not null default 0 check (streak_freezes between 0 and 2),
  add column if not exists last_streak_repair_at timestamptz,
  add column if not exists division text not null default 'bronze'
    check (division in ('bronze','silver','gold','diamond'));

create table if not exists public.quests (
  id serial primary key,
  key text unique not null,
  kind text not null check (kind in ('daily','weekly')),
  title text not null,
  target integer not null check (target > 0),
  reward integer not null check (reward >= 0),
  metric text not null default 'solves',
  active boolean not null default true
);

create table if not exists public.user_quests (
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id integer not null references public.quests(id) on delete cascade,
  day date not null,
  progress integer not null default 0 check (progress >= 0),
  claimed boolean not null default false,
  claimed_at timestamptz,
  primary key (user_id, quest_id, day)
);
create index if not exists user_quests_user_day_idx on public.user_quests(user_id, day);

create table if not exists public.gem_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null check (delta <> 0),
  reason text not null check (char_length(reason) between 1 and 120),
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index if not exists gem_ledger_user_created_idx on public.gem_ledger(user_id, created_at desc);

create table if not exists public.review_queue (
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  due_on date not null,
  stage smallint not null default 1 check (stage between 1 and 3),
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);
create index if not exists review_queue_due_idx on public.review_queue(user_id, due_on) where not done;

alter table public.submissions
  add column if not exists hint_level smallint not null default 0 check (hint_level between 0 and 3);
alter table public.challenges
  add column if not exists editorial jsonb,
  add column if not exists concept_tag text;

-- Seed a small, stable quest catalogue. Daily assignment is selected by the server in
-- Africa/Algiers and persisted in user_quests; titles are localized in app translations.
insert into public.quests(key, kind, title, target, reward, metric) values
  ('daily_solve_one', 'daily', 'حلّ تحديًا واحدًا', 1, 5, 'solves'),
  ('daily_no_hint', 'daily', 'حلّ تحديًا دون تلميح', 1, 5, 'solves_without_hint'),
  ('daily_second_language', 'daily', 'حلّ تحديًا بلغتك الثانية', 1, 5, 'second_language_solves'),
  ('daily_custom_run_twice', 'daily', 'جرّب مدخلك الخاص مرتين', 2, 5, 'custom_runs'),
  ('daily_read_editorial', 'daily', 'اقرأ شرح حلّ', 1, 5, 'editorials_read'),
  ('weekly_four_topics', 'weekly', 'حلّ 4 تحديات من مواضيع مختلفة', 4, 20, 'distinct_topics')
on conflict (key) do nothing;

alter table public.feature_flags enable row level security;
alter table public.quests enable row level security;
alter table public.user_quests enable row level security;
alter table public.gem_ledger enable row level security;
alter table public.review_queue enable row level security;

drop policy if exists feature_flags_admin_read on public.feature_flags;
create policy feature_flags_admin_read on public.feature_flags for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
drop policy if exists quests_active_read on public.quests;
create policy quests_active_read on public.quests for select using (active);
drop policy if exists user_quests_own_read on public.user_quests;
create policy user_quests_own_read on public.user_quests for select using (auth.uid() = user_id);
drop policy if exists gem_ledger_own_read on public.gem_ledger;
create policy gem_ledger_own_read on public.gem_ledger for select using (auth.uid() = user_id);
drop policy if exists review_queue_own_read on public.review_queue;
create policy review_queue_own_read on public.review_queue for select using (auth.uid() = user_id);

-- No direct client writes to progress, balances, quest claims, review state, or feature flags.
revoke insert, update, delete on public.feature_flags from anon, authenticated;
revoke insert, update, delete on public.quests from anon, authenticated;
revoke insert, update, delete on public.user_quests from anon, authenticated;
revoke insert, update, delete on public.gem_ledger from anon, authenticated;
revoke insert, update, delete on public.review_queue from anon, authenticated;

-- A ledger append and profile balance update are atomic and idempotent.
create or replace function public.award_gems(
  p_user_id uuid,
  p_delta integer,
  p_reason text,
  p_idempotency_key text
) returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_balance integer;
begin
  if p_user_id is null or p_delta = 0 or p_reason is null or length(p_reason) not between 1 and 120
     or p_idempotency_key is null or length(p_idempotency_key) not between 1 and 160 then
    raise exception 'invalid gem ledger input' using errcode = '22023';
  end if;

  insert into public.gem_ledger(user_id, delta, reason, idempotency_key)
  values (p_user_id, p_delta, p_reason, p_idempotency_key)
  on conflict (user_id, idempotency_key) do nothing;

  if not found then
    select gems into v_balance from public.profiles where id = p_user_id;
    return coalesce(v_balance, 0);
  end if;

  update public.profiles
     set gems = gems + p_delta
   where id = p_user_id and gems + p_delta >= 0
   returning gems into v_balance;

  if not found then
    raise exception 'insufficient gems or profile missing' using errcode = '22023';
  end if;
  return v_balance;
end;
$$;

-- Called by trusted server code only; clients cannot award themselves gems.
revoke all on function public.award_gems(uuid, integer, text, text) from public, anon, authenticated;
grant execute on function public.award_gems(uuid, integer, text, text) to service_role;

-- Claiming requires completed progress and locks the quest row to prevent double claims.
create or replace function public.claim_quest_reward(p_quest_id integer, p_day date)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_reward integer;
  v_target integer;
  v_kind text;
  v_claimed boolean;
  v_balance integer;
  v_period_day date;
  v_key text;
begin
  if v_user is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if p_day is null or p_day <> (now() at time zone 'Africa/Algiers')::date then
    raise exception 'invalid quest day' using errcode = '22023';
  end if;

  select kind, reward, target into v_kind, v_reward, v_target
    from public.quests where id = p_quest_id and active;
  if not found then raise exception 'quest not found' using errcode = 'P0002'; end if;

  v_period_day := case when v_kind = 'weekly'
    then date_trunc('week', p_day::timestamp)::date else p_day end;

  insert into public.user_quests(user_id, quest_id, day, progress)
  values (v_user, p_quest_id, v_period_day, 0)
  on conflict (user_id, quest_id, day) do nothing;

  select progress, claimed into v_target, v_claimed
    from public.user_quests
   where user_id = v_user and quest_id = p_quest_id and day = v_period_day
   for update;

  if v_claimed then raise exception 'reward already claimed' using errcode = '23505'; end if;
  if v_target < (select target from public.quests where id = p_quest_id) then
    raise exception 'quest not completed' using errcode = '22023';
  end if;

  update public.user_quests set claimed = true, claimed_at = now()
   where user_id = v_user and quest_id = p_quest_id and day = v_period_day;

  v_key := 'quest:' || p_quest_id::text || ':' || v_period_day::text;
  v_balance := public.award_gems(v_user, v_reward, 'quest_reward', v_key);
  return v_balance;
end;
$$;
revoke all on function public.claim_quest_reward(integer, date) from public, anon;
grant execute on function public.claim_quest_reward(integer, date) to authenticated;

-- Admins alone can change rollout configuration.
create or replace function public.admin_set_feature_flag(p_key text, p_enabled boolean, p_rollout smallint)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'admin only' using errcode = '42501';
  end if;
  if p_key !~ '^ff_[a-z0-9_]+$' or p_rollout not between 0 and 100 then
    raise exception 'invalid feature flag' using errcode = '22023';
  end if;
  insert into public.feature_flags(key, enabled, rollout_percent, updated_at)
  values (p_key, p_enabled, p_rollout, now())
  on conflict (key) do update set enabled = excluded.enabled,
    rollout_percent = excluded.rollout_percent, updated_at = now();
end;
$$;
revoke all on function public.admin_set_feature_flag(text, boolean, smallint) from public, anon;
grant execute on function public.admin_set_feature_flag(text, boolean, smallint) to authenticated;

comment on table public.gem_ledger is 'Append-only source of truth for gem balance changes; writes only through trusted functions.';
comment on column public.submissions.hint_level is 'Highest hint level opened for this submission (0-3); legacy hint_used remains unchanged.';
comment on column public.challenges.editorial is 'Editorial content; never expose through the public challenge view before a successful solve.';
