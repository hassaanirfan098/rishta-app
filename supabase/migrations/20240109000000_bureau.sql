-- ============================================================
-- Bureau model: Directory + Personalized Service
-- ============================================================

-- Directory proposals get an Instagram reference code + featured flag + gender
alter table directory_profiles
  add column if not exists reference_code text,
  add column if not exists is_featured boolean default false,
  add column if not exists gender text;

create index if not exists directory_reference_code_idx on directory_profiles(reference_code);

-- Concierge / personalized matchmaking requests
create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  full_name text,
  phone text,
  looking_for text,          -- 'male' | 'female'
  age_range text,
  city text,
  sect text,
  requirements text,
  package text,              -- 'basic' | 'standard' | 'premium'
  status text default 'new', -- 'new' | 'in_progress' | 'matched' | 'closed'
  created_at timestamptz default now()
);

alter table service_requests enable row level security;

create policy "users manage own service requests"
  on service_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- "Express interest" on a directory proposal (lands in admin inbox)
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  directory_profile_id uuid references directory_profiles(id) on delete cascade,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

alter table inquiries enable row level security;

create policy "users insert own inquiries"
  on inquiries for insert
  with check (auth.uid() = user_id);

create policy "users read own inquiries"
  on inquiries for select
  using (auth.uid() = user_id);
