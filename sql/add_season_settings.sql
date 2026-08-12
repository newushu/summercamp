-- Per-season (per-year) admin overrides: tuition, hero banner image, hero video.
-- Additive only; existing columns and rows are untouched. Safe to re-run.

begin;

alter table public.camp_admin_settings
  add column if not exists season_settings jsonb not null default '{}'::jsonb;

update public.camp_admin_settings
set season_settings = '{}'::jsonb
where season_settings is null;

commit;
