-- Wave 1 hardening: enforce server-owned profile fields and make quest/review progress usable.
-- Additive migration only.

create or replace function public.guard_server_owned_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin') and (
    new.gems is distinct from old.gems or
    new.streak_freezes is distinct from old.streak_freezes or
    new.last_streak_repair_at is distinct from old.last_streak_repair_at or
    new.points is distinct from old.points or
    new.streak is distinct from old.streak or
    new.best_streak is distinct from old.best_streak or
    new.last_solved_on is distinct from old.last_solved_on or
    new.division is distinct from old.division
  ) then
    raise exception 'server-owned profile fields cannot be changed directly' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_server_fields on public.profiles;
create trigger profiles_guard_server_fields
before update on public.profiles
for each row execute function public.guard_server_owned_profile_fields();

-- Trusted submission processor calls this after a server-verified correct solve.
create or replace function public.record_verified_solve(
  p_user_id uuid,
  p_challenge_id uuid,
  p_language text,
  p_hint_level smallint,
  p_solved_on date default (now() at time zone 'Africa/Algiers')::date
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  q record;
  v_day date := coalesce(p_solved_on, (now() at time zone 'Africa/Algiers')::date);
  v_week date;
begin
  if auth.uid() is not null and auth.uid() <> p_user_id and current_user <> 'service_role' then
    raise exception 'cannot update another user' using errcode = '42501';
  end if;
  if p_user_id is null or p_challenge_id is null or p_language not in ('javascript','python') or p_hint_level not between 0 and 3 then
    raise exception 'invalid solve event' using errcode = '22023';
  end if;
  v_week := date_trunc('week', v_day::timestamp)::date;

  for q in select id, metric, kind, target from public.quests where active and (
    (kind = 'daily' and metric in ('solves','solves_without_hint','second_language_solves')) or
    (kind = 'weekly' and metric = 'solves')
  ) loop
    if q.kind = 'daily' then
      insert into public.user_quests(user_id, quest_id, day, progress)
      values (p_user_id, q.id, v_day,
        case when q.metric = 'solves' then 1
             when q.metric = 'solves_without_hint' and p_hint_level = 0 then 1
             when q.metric = 'second_language_solves' and p_language <> coalesce((select preferred_lang from public.profiles where id = p_user_id), 'javascript') then 1
             else 0 end)
      on conflict (user_id, quest_id, day) do update
        set progress = public.user_quests.progress + excluded.progress;
    else
      insert into public.user_quests(user_id, quest_id, day, progress)
      values (p_user_id, q.id, v_week, 1)
      on conflict (user_id, quest_id, day) do update
        set progress = public.user_quests.progress + 1;
    end if;
  end loop;

  insert into public.review_queue(user_id, challenge_id, due_on, stage, done, updated_at)
  values (p_user_id, p_challenge_id, v_day + 3, 1, false, now())
  on conflict (user_id, challenge_id) do update
    set due_on = excluded.due_on, stage = 1, done = false, updated_at = now();
end;
$$;
revoke all on function public.record_verified_solve(uuid, uuid, text, smallint, date) from public, anon, authenticated;
grant execute on function public.record_verified_solve(uuid, uuid, text, smallint, date) to service_role;

create or replace function public.purchase_streak_freeze()
returns smallint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := auth.uid(); v_freezes smallint;
begin
  if v_user is null then raise exception 'authentication required' using errcode = '28000'; end if;
  update public.profiles set gems = gems - 20, streak_freezes = streak_freezes + 1
   where id = v_user and gems >= 20 and streak_freezes < 2
   returning streak_freezes into v_freezes;
  if not found then raise exception 'not enough gems or freeze inventory full' using errcode = '22023'; end if;
  insert into public.gem_ledger(user_id, delta, reason, idempotency_key)
  values (v_user, -20, 'streak_freeze_purchase', 'freeze:' || gen_random_uuid()::text);
  return v_freezes;
end;
$$;
revoke all on function public.purchase_streak_freeze() from public, anon;
grant execute on function public.purchase_streak_freeze() to authenticated;

create or replace function public.repair_streak()
returns table(new_streak integer, freezes_left smallint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := auth.uid(); v_last date; v_freezes smallint; v_repaired timestamptz;
begin
  if v_user is null then raise exception 'authentication required' using errcode = '28000'; end if;
  select last_solved_on, streak_freezes, last_streak_repair_at into v_last, v_freezes, v_repaired
    from public.profiles where id = v_user for update;
  if not found then raise exception 'profile missing' using errcode = 'P0002'; end if;
  if v_freezes < 1 then raise exception 'no streak freezes available' using errcode = '22023'; end if;
  if v_repaired is not null and v_repaired > now() - interval '30 days' then
    raise exception 'streak repair is available once every 30 days' using errcode = '22023';
  end if;
  if v_last is null or v_last < ((now() at time zone 'Africa/Algiers')::date - 2) then
    raise exception 'streak is not eligible for repair' using errcode = '22023';
  end if;
  update public.profiles set streak_freezes = streak_freezes - 1, last_streak_repair_at = now()
    where id = v_user returning streak, streak_freezes into new_streak, freezes_left;
  return next;
end;
$$;
revoke all on function public.repair_streak() from public, anon;
grant execute on function public.repair_streak() to authenticated;

create or replace function public.complete_spaced_review(p_challenge_id uuid, p_passed boolean)
returns date
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := auth.uid(); v_stage smallint; v_due date;
begin
  if v_user is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if not p_passed then
    update public.review_queue set due_on = (now() at time zone 'Africa/Algiers')::date + 1,
      updated_at = now() where user_id = v_user and challenge_id = p_challenge_id and not done
      returning due_on into v_due;
    if not found then raise exception 'review not found' using errcode = 'P0002'; end if;
    return v_due;
  end if;
  select stage into v_stage from public.review_queue
    where user_id = v_user and challenge_id = p_challenge_id and not done for update;
  if not found then raise exception 'review not found' using errcode = 'P0002'; end if;
  if v_stage >= 3 then
    update public.review_queue set done = true, updated_at = now()
      where user_id = v_user and challenge_id = p_challenge_id;
    v_due := null;
  else
    v_due := (now() at time zone 'Africa/Algiers')::date + case v_stage when 1 then 14 else 45 end;
    update public.review_queue set stage = v_stage + 1, due_on = v_due, updated_at = now()
      where user_id = v_user and challenge_id = p_challenge_id;
  end if;
  return v_due;
end;
$$;
revoke all on function public.complete_spaced_review(uuid, boolean) from public, anon;
grant execute on function public.complete_spaced_review(uuid, boolean) to authenticated;

comment on function public.record_verified_solve(uuid, uuid, text, smallint, date) is 'Service-role-only hook for server-verified solve processing; do not call from browser code.';
