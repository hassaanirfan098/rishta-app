-- ============================================================
-- Migration: support multiple labelled contacts per profile (e.g. Father,
-- Mother, Me), replacing the single contact_phone field with a jsonb array.
-- Run this once in your Supabase project's SQL Editor (SQL Editor → New
-- query → paste → Run). Safe to run even if the column already exists.
--
-- The old contact_phone column (added by migration_002) is left in place —
-- the app now reads/writes the new "contacts" column and only falls back
-- to contact_phone for profiles saved before this migration.
-- ============================================================

alter table bureau_profiles
  add column if not exists contacts jsonb default '[]'::jsonb;
