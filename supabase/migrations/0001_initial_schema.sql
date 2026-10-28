create extension if not exists pgcrypto;

do $$ begin
  create type public.level_t as enum ('easy','medium','hard');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text check (char_length(display_name) <= 40),
  bio text check (char_length(bio) <= 160),
  avatar_color text not null default '#0F9D76',
  preferred_lang text not null default 'javascript' check (preferred_lang in ('javascript','python')),
  weekly_goal int not null default 4 check (weekly_goal in (2,4,7)),
  is_private boolean not null default false,
  role text not null default 'user' check (role in ('user','admin')),
  points int not null default 0,
  streak int not null default 0,
  best_streak int not null default 0,
  last_solved_on date,
  created_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  topic text not null,
  level public.level_t not null,
  points int not null check (points > 0),
  content jsonb not null,
  tests jsonb not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id serial primary key,
  title text not null,
  description text not null default '',
  position int not null unique
);
create table if not exists public.track_items (
  track_id int not null references public.tracks(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  position int not null,
  primary key (track_id, challenge_id),
  unique (track_id, position)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id),
  language text not null check (language in ('javascript','python')),
  code text not null check (char_length(code) <= 20000),
  passed int not null check (passed >= 0),
  total int not null check (total > 0 and passed <= total),
  is_correct boolean not null,
  runtime_ms int check (runtime_ms is null or runtime_ms >= 0),
  hint_used boolean not null default false,
  attempt_no int not null check (attempt_no > 0),
  verified boolean not null default false,
  week_id int,
  created_at timestamptz not null default now()
);
create index if not exists submissions_user_challenge_created_idx on public.submissions(user_id, challenge_id, created_at);

create table if not exists public.weeks (
  id serial primary key,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  challenge_ids uuid[] not null,
  status text not null default 'scheduled' check (status in ('scheduled','open','closed')),
  check (ends_at > starts_at)
);
alter table public.submissions drop constraint if exists submissions_week_id_fkey;
alter table public.submissions add constraint submissions_week_id_fkey foreign key (week_id) references public.weeks(id);

create table if not exists public.week_scores (
  week_id int not null references public.weeks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  points int not null default 0,
  solved int not null default 0,
  total_ms bigint not null default 0,
  attempts int not null default 0,
  last_solved_at timestamptz,
  primary key (week_id, user_id)
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 40),
  code text unique not null check (code ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$'),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);
create table if not exists public.duels (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id),
  a_user uuid not null references public.profiles(id) on delete cascade,
  b_user uuid not null references public.profiles(id) on delete cascade,
  deadline timestamptz not null,
  winner uuid references public.profiles(id),
  status text not null default 'open' check (status in ('open','finished','cancelled')),
  created_at timestamptz not null default now(),
  check (a_user <> b_user)
);
create table if not exists public.badges (
  id serial primary key,
  key text unique not null,
  title text not null,
  description text not null,
  icon text not null default 'award'
);
create table if not exists public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id int not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id text not null,
  reason text not null check (char_length(reason) <= 1000),
  status text not null default 'open' check (status in ('open','reviewing','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(title) <= 120),
  story text not null check (char_length(story) <= 3000),
  created_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- The public view exposes visible examples only; hidden tests are never included.
create or replace view public.challenges_public with (security_invoker = true) as
select id, slug, title, topic, level, points, content, is_published,
  (select coalesce(jsonb_agg(t), '[]'::jsonb)
   from jsonb_array_elements(tests) t
   where coalesce((t->>'hidden')::boolean, false) = false) as visible_tests
from public.challenges where is_published = true;

alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.tracks enable row level security;
alter table public.track_items enable row level security;
alter table public.submissions enable row level security;
alter table public.weeks enable row level security;
alter table public.week_scores enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.room_messages enable row level security;
alter table public.duels enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.reports enable row level security;
alter table public.suggestions enable row level security;
alter table public.notifications enable row level security;

-- Profiles: public profiles can be viewed; private profiles only by their owner.
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (not is_private or auth.uid() = id);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id and role = 'user');
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = 'user');

-- Content is read through published view; only service-role/admin server actions mutate it.
drop policy if exists tracks_read on public.tracks;
create policy tracks_read on public.tracks for select using (true);
drop policy if exists track_items_read on public.track_items;
create policy track_items_read on public.track_items for select using (true);
drop policy if exists challenges_admin_read on public.challenges;
create policy challenges_admin_read on public.challenges for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists submissions_own_read on public.submissions;
create policy submissions_own_read on public.submissions for select using (auth.uid() = user_id);
drop policy if exists submissions_own_insert on public.submissions;
create policy submissions_own_insert on public.submissions for insert with check (auth.uid() = user_id);
drop policy if exists submissions_others_read on public.submissions;
create policy submissions_others_read on public.submissions for select using (
  is_correct and exists (select 1 from public.submissions s where s.user_id = auth.uid() and s.challenge_id = submissions.challenge_id and s.is_correct)
);

drop policy if exists weeks_read on public.weeks;
create policy weeks_read on public.weeks for select using (true);
drop policy if exists week_scores_read on public.week_scores;
create policy week_scores_read on public.week_scores for select using (true);
drop policy if exists week_scores_own_insert on public.week_scores;
create policy week_scores_own_insert on public.week_scores for insert with check (auth.uid() = user_id);
drop policy if exists week_scores_own_update on public.week_scores;
create policy week_scores_own_update on public.week_scores for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists rooms_members_read on public.rooms;
create policy rooms_members_read on public.rooms for select using (
  owner_id = auth.uid() or exists (select 1 from public.room_members m where m.room_id = id and m.user_id = auth.uid())
);
drop policy if exists rooms_owner_insert on public.rooms;
create policy rooms_owner_insert on public.rooms for insert with check (owner_id = auth.uid());
drop policy if exists rooms_owner_update on public.rooms;
create policy rooms_owner_update on public.rooms for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists room_members_read on public.room_members;
create policy room_members_read on public.room_members for select using (
  user_id = auth.uid() or exists (select 1 from public.room_members m where m.room_id = room_id and m.user_id = auth.uid())
);
drop policy if exists room_members_join_self on public.room_members;
create policy room_members_join_self on public.room_members for insert with check (user_id = auth.uid());
drop policy if exists room_members_leave_self on public.room_members;
create policy room_members_leave_self on public.room_members for delete using (user_id = auth.uid());

drop policy if exists room_messages_members_read on public.room_messages;
create policy room_messages_members_read on public.room_messages for select using (
  exists (select 1 from public.room_members m where m.room_id = room_id and m.user_id = auth.uid())
);
drop policy if exists room_messages_members_insert on public.room_messages;
create policy room_messages_members_insert on public.room_messages for insert with check (
  auth.uid() = user_id and exists (select 1 from public.room_members m where m.room_id = room_id and m.user_id = auth.uid())
);

drop policy if exists duels_members_read on public.duels;
create policy duels_members_read on public.duels for select using (
  auth.uid() in (a_user,b_user) and exists (select 1 from public.room_members m where m.room_id = room_id and m.user_id = auth.uid())
);
drop policy if exists duels_participant_insert on public.duels;
create policy duels_participant_insert on public.duels for insert with check (
  auth.uid() = a_user and exists (select 1 from public.room_members m where m.room_id = room_id and m.user_id = auth.uid())
);

drop policy if exists badges_read on public.badges;
create policy badges_read on public.badges for select using (true);
drop policy if exists user_badges_read on public.user_badges;
create policy user_badges_read on public.user_badges for select using (true);
drop policy if exists user_badges_own_insert on public.user_badges;
create policy user_badges_own_insert on public.user_badges for insert with check (auth.uid() = user_id);

drop policy if exists reports_own_read on public.reports;
create policy reports_own_read on public.reports for select using (auth.uid() = user_id);
drop policy if exists reports_own_insert on public.reports;
create policy reports_own_insert on public.reports for insert with check (auth.uid() = user_id);

drop policy if exists suggestions_read on public.suggestions;
create policy suggestions_read on public.suggestions for select using (auth.uid() = user_id);
drop policy if exists suggestions_insert on public.suggestions;
create policy suggestions_insert on public.suggestions for insert with check (auth.uid() = user_id);

drop policy if exists notifications_own_read on public.notifications;
create policy notifications_own_read on public.notifications for select using (auth.uid() = user_id);
drop policy if exists notifications_own_update on public.notifications;
create policy notifications_own_update on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
