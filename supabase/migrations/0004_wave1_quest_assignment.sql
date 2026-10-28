-- Wave 1 completion: deterministic quest assignment and bounded editorial activity tracking.
-- Run after 0003_wave1_integrity_and_progress.sql.

update public.quests set active = false where key = 'daily_custom_run_twice';

create or replace function public.ensure_daily_quests()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_day date := (now() at time zone 'Africa/Algiers')::date;
  q record;
begin
  if v_user is null then raise exception 'authentication required' using errcode = '28000'; end if;

  for q in
    select id from public.quests
    where active and kind = 'daily'
    order by md5(v_user::text || ':' || v_day::text || ':' || key)
    limit 3
  loop
    insert into public.user_quests(user_id, quest_id, day, progress)
    values (v_user, q.id, v_day, 0)
    on conflict (user_id, quest_id, day) do nothing;
  end loop;

  for q in
    select id from public.quests
    where active and kind = 'weekly'
    order by md5(v_user::text || ':' || date_trunc('week', v_day::timestamp)::date::text || ':' || key)
    limit 1
  loop
    insert into public.user_quests(user_id, quest_id, day, progress)
    values (v_user, q.id, date_trunc('week', v_day::timestamp)::date, 0)
    on conflict (user_id, quest_id, day) do nothing;
  end loop;
end;
$$;
revoke all on function public.ensure_daily_quests() from public, anon;
grant execute on function public.ensure_daily_quests() to authenticated;

create or replace function public.record_editorial_read(p_challenge_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_day date := (now() at time zone 'Africa/Algiers')::date;
  v_quest_id integer;
begin
  if v_user is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if not exists (
    select 1 from public.submissions
    where user_id = v_user and challenge_id = p_challenge_id and is_correct and verified
  ) then
    raise exception 'solve the challenge before reading its editorial' using errcode = '42501';
  end if;
  select id into v_quest_id from public.quests where key = 'daily_read_editorial' and active;
  if v_quest_id is not null then
    insert into public.user_quests(user_id, quest_id, day, progress)
    values (v_user, v_quest_id, v_day, 1)
    on conflict (user_id, quest_id, day) do update
      set progress = greatest(public.user_quests.progress, 1);
  end if;
end;
$$;
revoke all on function public.record_editorial_read(uuid) from public, anon;
grant execute on function public.record_editorial_read(uuid) to authenticated;

-- Repair restores a minimal active streak if the user's latest solve is within the repair window.
create or replace function public.repair_streak()
returns table(new_streak integer, freezes_left smallint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := auth.uid(); v_last date; v_freezes smallint; v_repaired timestamptz;
  v_today date := (now() at time zone 'Africa/Algiers')::date;
begin
  if v_user is null then raise exception 'authentication required' using errcode = '28000'; end if;
  select last_solved_on, streak_freezes, last_streak_repair_at into v_last, v_freezes, v_repaired
    from public.profiles where id = v_user for update;
  if not found then raise exception 'profile missing' using errcode = 'P0002'; end if;
  if v_freezes < 1 then raise exception 'no streak freezes available' using errcode = '22023'; end if;
  if v_repaired is not null and v_repaired > now() - interval '30 days' then
    raise exception 'streak repair is available once every 30 days' using errcode = '22023';
  end if;
  if v_last is null or v_last < (v_today - 2) then
    raise exception 'streak is not eligible for repair' using errcode = '22023';
  end if;
  update public.profiles
    set streak_freezes = streak_freezes - 1,
        last_streak_repair_at = now(),
        streak = greatest(streak, 1),
        best_streak = greatest(best_streak, streak, 1),
        last_solved_on = v_today - 1
    where id = v_user
    returning streak, streak_freezes into new_streak, freezes_left;
  return next;
end;
$$;
revoke all on function public.repair_streak() from public, anon;
grant execute on function public.repair_streak() to authenticated;
