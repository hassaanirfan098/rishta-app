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
