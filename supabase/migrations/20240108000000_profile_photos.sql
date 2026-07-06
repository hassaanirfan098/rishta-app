-- Photo gallery for member profiles (onboarding + settings write here;
-- profile pages read from here). The app referenced this table before a
-- migration existed — create it so photos actually persist.
create table if not exists profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  url text not null,
  order_index int default 0,
  created_at timestamptz default now()
);

create index if not exists profile_photos_profile_idx on profile_photos(profile_id);

alter table profile_photos enable row level security;

-- Any authenticated user can view photos (member galleries aren't secret)
create policy "authenticated can view photos"
  on profile_photos for select
  using (auth.role() = 'authenticated');

-- Users manage only their own photos
create policy "users manage own photos"
  on profile_photos for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
