-- Fix camp_program_selected_weeks validation to support:
-- - general + bootcamp: Monday -> Friday (5-day blocks)
-- - overnight: Sunday -> Saturday (7-day blocks)
--
-- Run in Supabase SQL editor once.

begin;

alter table if exists public.camp_program_selected_weeks
  drop constraint if exists camp_program_selected_weeks_check;

alter table if exists public.camp_program_selected_weeks
  add constraint camp_program_selected_weeks_check
  check (
    (
      program_key in ('general', 'bootcamp')
      and extract(isodow from week_start::date) = 1
      and week_end::date = (week_start::date + 4)
    )
    or
    (
      program_key = 'overnight'
      and extract(isodow from week_start::date) = 7
      and week_end::date = (week_start::date + 6)
    )
  );

commit;

