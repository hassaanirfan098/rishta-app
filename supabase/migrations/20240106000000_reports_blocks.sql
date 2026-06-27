create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete cascade,
  reported_id uuid references profiles(id) on delete cascade,
  reason text not null,
  created_at timestamptz default now(),
  unique(reporter_id, reported_id)
);

create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references profiles(id) on delete cascade,
  blocked_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_id)
);

alter table reports enable row level security;
alter table blocks enable row level security;

create policy "users can insert own reports" on reports for insert
  with check (auth.uid() = reporter_id);

create policy "users can view own reports" on reports for select
  using (auth.uid() = reporter_id);

create policy "users can manage own blocks" on blocks for all
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);
