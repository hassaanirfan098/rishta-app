-- ============================================================
-- City Marriage Bureau — Rishta Profile Tool shared database
--
-- Run this ONCE in a NEW, DEDICATED Supabase project's SQL Editor
-- (Project → SQL Editor → New query → paste this whole file → Run).
--
-- IMPORTANT: this repo already contains an unrelated Next.js app with
-- its own Supabase project and its own "profiles" table (member
-- signup/dating app). Do NOT run this against that project — create a
-- brand-new Supabase project for the bureau tool so the two never mix.
-- That's why every table/function here is prefixed "bureau_".
-- ============================================================

create table bureau_profiles (
  id text primary key,                          -- catalog id lowercased, e.g. 'm-01'
  catalog_id text not null unique,               -- e.g. 'M-01'
  source_type text not null default 'form',      -- 'form' | 'message' | 'customer'
  photo text,                                    -- base64 data URL
  name text not null,
  gender text not null check (gender in ('male','female')),
  age int,
  height_inches int,
  height_display text,
  marital_status text not null default 'single',
  disability text default 'No',
  education jsonb default '{}'::jsonb,
  job jsonb default '{}'::jsonb,
  religion jsonb default '{}'::jsonb,
  property jsonb default '{}'::jsonb,
  address jsonb default '{}'::jsonb,
  father text,
  mother text,
  siblings jsonb default '[]'::jsonb,
  requirements jsonb default '{}'::jsonb,
  raw_note text,
  created_at timestamptz default now()
);

create index bureau_profiles_gender_idx on bureau_profiles (gender);
create index bureau_profiles_created_idx on bureau_profiles (created_at desc);

-- Shared, atomic per-gender counters so catalog IDs (M-01, F-01, ...) never
-- collide across devices or simultaneous customer-form submissions.
create table bureau_counters (
  gender text primary key,
  count integer not null default 0
);
insert into bureau_counters (gender, count) values ('m', 0), ('f', 0);

create or replace function bureau_next_catalog_id(g text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update bureau_counters set count = count + 1 where gender = g returning count into new_count;
  if new_count is null then
    raise exception 'Unknown gender counter: %', g;
  end if;
  return upper(g) || '-' || lpad(new_count::text, 2, '0');
end;
$$;

grant execute on function bureau_next_catalog_id(text) to anon, authenticated;

-- ============================================================
-- Row Level Security
--   authenticated (your team, logged in via Supabase Auth) → full access
--   anon (the public customer-facing form)                 → insert-only,
--     and can never read, edit, or delete any profile — including their own
--     one right after submitting.
-- ============================================================
alter table bureau_profiles enable row level security;

create policy "team full access" on bureau_profiles
  for all to authenticated
  using (true) with check (true);

create policy "public insert only" on bureau_profiles
  for insert to anon
  with check (true);

-- bureau_counters itself is never touched directly by clients (only via the
-- function above, which runs as its owner), so RLS stays on with no policies —
-- this blocks all direct table access from anon/authenticated alike.
alter table bureau_counters enable row level security;

-- ============================================================
-- Shared settings (currently just the bureau's WhatsApp number) — readable by
-- the public customer form too, so its generated cards always show the
-- current number without needing a login. Only your team can change it.
-- ============================================================
create table bureau_settings (
  key text primary key,
  value text
);
insert into bureau_settings (key, value) values ('contact_no', '+92 321 2266621');

alter table bureau_settings enable row level security;

create policy "anyone can read settings" on bureau_settings
  for select to anon, authenticated
  using (true);

create policy "team can write settings" on bureau_settings
  for all to authenticated
  using (true) with check (true);
