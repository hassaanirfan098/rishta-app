-- ============================================================
-- Force-once proposal intake gate + link submissions to accounts
-- ============================================================

alter table profiles
  add column if not exists own_proposal_submitted boolean default false,
  add column if not exists intake_skipped boolean default false;

alter table directory_profiles
  add column if not exists user_id uuid references profiles(id) on delete set null;
