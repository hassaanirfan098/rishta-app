-- ============================================================
-- Public proposal intake — mirrors the standalone bureau intake
-- tool's fields so proposals submitted through the app land in
-- the same directory_profiles table used by Browse.
-- ============================================================

alter table directory_profiles
  add column if not exists height_display text,
  add column if not exists disability text,
  add column if not exists institution text,
  add column if not exists work_location text,
  add column if not exists future_plans text,
  add column if not exists income text,
  add column if not exists religion text default 'Islam',
  add column if not exists nationality text default 'Pakistani',
  add column if not exists property_ownership text,
  add column if not exists property_size text,
  add column if not exists vehicle text,
  add column if not exists property_additional text,
  add column if not exists locality text,
  add column if not exists father_occupation text,
  add column if not exists mother_occupation text,
  add column if not exists siblings jsonb default '[]',
  add column if not exists pref_age_min int,
  add column if not exists pref_age_max int,
  add column if not exists pref_height_min text,
  add column if not exists pref_city text,
  add column if not exists pref_caste text,
  add column if not exists pref_sect text,
  add column if not exists pref_qualification text,
  add column if not exists pref_habits text,
  add column if not exists pref_divorced_widowed text,
  add column if not exists pref_working_woman text,
  add column if not exists pref_other text,
  add column if not exists raw_note text;

-- Let phone be optional at the DB level; the API route enforces it —
-- some legacy directory rows may have been added without one.
alter table directory_profiles alter column phone drop not null;

-- ============================================================
-- Reference / catalog code generator (M-001, F-001, ...)
-- ============================================================
create table if not exists directory_catalog_counters (
  gender text primary key,
  counter int not null default 0
);

create or replace function bureau_next_catalog_id(g text)
returns text as $$
declare
  n int;
  prefix text;
begin
  prefix := case when g = 'male' then 'M' when g = 'female' then 'F' else 'X' end;
  insert into directory_catalog_counters(gender, counter) values (g, 1)
    on conflict (gender) do update set counter = directory_catalog_counters.counter + 1
    returning counter into n;
  return prefix || '-' || lpad(n::text, 3, '0');
end;
$$ language plpgsql security definer;

-- ============================================================
-- Storage bucket for directory/proposal photos (public read;
-- writes only via the service role from the server route)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('directory-photos', 'directory-photos', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'public can view directory photos'
  ) then
    create policy "public can view directory photos"
      on storage.objects for select
      using (bucket_id = 'directory-photos');
  end if;
end $$;
