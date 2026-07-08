-- ============================================================
-- Migration: add contact_phone to an EXISTING bureau_profiles table.
-- Run this once in your Supabase project's SQL Editor (SQL Editor → New
-- query → paste → Run). Safe to run even if the column already exists.
-- ============================================================

alter table bureau_profiles
  add column if not exists contact_phone text;
