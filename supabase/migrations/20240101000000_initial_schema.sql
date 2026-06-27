-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  type text check (type in ('member','directory')) default 'member',
  full_name text,
  date_of_birth date,
  gender text check (gender in ('male','female')),
  city text,
  country text,
  sect text,
  ethnicity text,
  language text,
  religiosity text,
  caste text,
  height_cm int,
  education text,
  profession text,
  marital_status text,
  about_me text,
  phone text,
  avatar_url text,
  is_verified boolean default false,
  is_approved boolean default false,
  verification_selfie_url text,
  onboarding_step int default 0,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

-- ============================================================
-- DIRECTORY PROFILES
-- ============================================================
create table directory_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  age int,
  city text,
  country text default 'Pakistan',
  sect text,
  ethnicity text,
  caste text,
  education text,
  profession text,
  marital_status text,
  about_me text,
  phone text not null,
  avatar_url text,
  is_active boolean default true,
  consent_captured boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- UNLOCKS
-- ============================================================
create table unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  directory_profile_id uuid references directory_profiles(id) on delete cascade,
  payment_id text,
  amount_pkr int,
  created_at timestamptz default now(),
  unique(user_id, directory_profile_id)
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  tier text check (tier in ('gold','platinum')),
  status text check (status in ('active','cancelled','expired')),
  started_at timestamptz,
  expires_at timestamptz,
  payment_id text,
  amount_pkr int,
  created_at timestamptz default now()
);

-- ============================================================
-- LIKES
-- ============================================================
create table likes (
  id uuid primary key default gen_random_uuid(),
  liker_id uuid references profiles(id) on delete cascade,
  liked_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(liker_id, liked_id)
);

-- ============================================================
-- MATCHES (created when both like each other)
-- ============================================================
create table matches (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid references profiles(id) on delete cascade,
  user2_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user1_id, user2_id)
);

-- Trigger: create match when mutual like exists
create or replace function create_match_on_mutual_like()
returns trigger as $$
declare
  reverse_like_exists boolean;
begin
  select exists(
    select 1 from likes
    where liker_id = new.liked_id and liked_id = new.liker_id
  ) into reverse_like_exists;

  if reverse_like_exists then
    insert into matches (user1_id, user2_id)
    values (least(new.liker_id, new.liked_id), greatest(new.liker_id, new.liked_id))
    on conflict do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_like_created
  after insert on likes
  for each row execute procedure create_match_on_mutual_like();

-- ============================================================
-- MESSAGES
-- ============================================================
create table messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text,
  media_url text,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- REPORTS
-- ============================================================
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete cascade,
  reported_id uuid references profiles(id) on delete cascade,
  reason text,
  details text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ============================================================
-- BLOCKS
-- ============================================================
create table blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references profiles(id) on delete cascade,
  blocked_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table directory_profiles enable row level security;
alter table unlocks enable row level security;
alter table subscriptions enable row level security;
alter table likes enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;
alter table reports enable row level security;
alter table blocks enable row level security;

-- Helper: is the requesting user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and type = 'directory' -- repurpose type or add admin column; for now use a separate approach
  );
$$ language sql security definer;

-- PROFILES policies
create policy "users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Helper to get current user's gender without triggering RLS recursion
create or replace function get_my_gender()
returns text as $$
  select gender from public.profiles where id = auth.uid();
$$ language sql security definer set search_path = public;

create policy "users can read approved opposite-gender profiles"
  on profiles for select
  using (
    is_approved = true
    and gender != get_my_gender()
  );

create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- DIRECTORY PROFILES policies (phone column never sent via RLS — use server fn)
create policy "authenticated users can read directory profiles"
  on directory_profiles for select
  using (auth.role() = 'authenticated' and is_active = true);

-- UNLOCKS policies
create policy "users can read own unlocks"
  on unlocks for select
  using (auth.uid() = user_id);

create policy "service role can insert unlocks"
  on unlocks for insert
  with check (auth.role() = 'service_role');

-- SUBSCRIPTIONS policies
create policy "users can read own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

-- LIKES policies
create policy "users can read own likes"
  on likes for select
  using (auth.uid() = liker_id or auth.uid() = liked_id);

create policy "users can insert own likes"
  on likes for insert
  with check (auth.uid() = liker_id);

create policy "users can delete own likes"
  on likes for delete
  using (auth.uid() = liker_id);

-- MATCHES policies
create policy "users can read own matches"
  on matches for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- MESSAGES policies
create policy "users can read messages for own matches"
  on messages for select
  using (
    exists (
      select 1 from matches
      where id = match_id
      and (user1_id = auth.uid() or user2_id = auth.uid())
    )
  );

create policy "users can insert messages for own matches"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from matches
      where id = match_id
      and (user1_id = auth.uid() or user2_id = auth.uid())
    )
  );

create policy "users can update own messages (mark read)"
  on messages for update
  using (auth.uid() = sender_id);

-- REPORTS policies
create policy "users can insert reports"
  on reports for insert
  with check (auth.uid() = reporter_id);

create policy "users can read own reports"
  on reports for select
  using (auth.uid() = reporter_id);

-- BLOCKS policies
create policy "users can read own blocks"
  on blocks for select
  using (auth.uid() = blocker_id);

create policy "users can insert blocks"
  on blocks for insert
  with check (auth.uid() = blocker_id);

create policy "users can delete own blocks"
  on blocks for delete
  using (auth.uid() = blocker_id);

-- ============================================================
-- SERVER FUNCTION: reveal phone after unlock check
-- ============================================================
create or replace function get_directory_phone(p_profile_id uuid)
returns text as $$
declare
  v_phone text;
  v_has_unlock boolean;
begin
  -- Check if the user has an unlock for this profile
  select exists(
    select 1 from unlocks
    where user_id = auth.uid()
    and directory_profile_id = p_profile_id
  ) into v_has_unlock;

  if not v_has_unlock then
    raise exception 'No unlock found for this profile';
  end if;

  select phone into v_phone
  from directory_profiles
  where id = p_profile_id;

  return v_phone;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Additional profile fields (Wave 1 extended)
-- ============================================================
alter table profiles
  add column if not exists marriage_readiness text,
  add column if not exists referral_source text,
  add column if not exists referral_detail text,
  add column if not exists nationality text,
  add column if not exists grew_up_in text,
  add column if not exists faith_values text,
  add column if not exists diet text,
  add column if not exists smoking text,
  add column if not exists drinking text,
  add column if not exists has_children text,
  add column if not exists wants_children text,
  add column if not exists relocation text,
  add column if not exists born_religion text,
  add column if not exists interests text,
  add column if not exists personality_traits text,
  add column if not exists knowing_timeline text,
  add column if not exists marriage_timeline text,
  add column if not exists face_verified boolean default false,
  add column if not exists notifications_enabled boolean default false;
