-- Correct quest progress so users only advance quests actually assigned to them.
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
  v_increment integer;
begin
  if auth.uid() is not null and auth.uid() <> p_user_id and current_user <> 'service_role' then
    raise exception 'cannot update another user' using errcode = '42501';
  end if;
  if p_user_id is null or p_challenge_id is null or p_language not in ('javascript','python') or p_hint_level not between 0 and 3 then
    raise exception 'invalid solve event' using errcode = '22023';
  end if;
  v_week := date_trunc('week', v_day::timestamp)::date;

  for q in
    select uq.quest_id, uq.day, quests.metric, quests.kind
    from public.user_quests uq
    join public.quests on quests.id = uq.quest_id
    where uq.user_id = p_user_id and quests.active and (
      (quests.kind = 'daily' and uq.day = v_day) or
      (quests.kind = 'weekly' and uq.day = v_week)
    )
    for update of uq
  loop
    v_increment := case
      when q.metric = 'solves' then 1
      when q.metric = 'solves_without_hint' and p_hint_level = 0 then 1
      when q.metric = 'second_language_solves' and p_language <> coalesce((select preferred_lang from public.profiles where id = p_user_id), 'javascript') then 1
      else 0
    end;
    if v_increment > 0 then
      update public.user_quests set progress = progress + v_increment
      where user_id = p_user_id and quest_id = q.quest_id and day = q.day;
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
