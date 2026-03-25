begin;

alter table public.camp_admin_settings
  add column if not exists general_wellesley_selected_weeks text[] not null default '{}';

update public.camp_admin_settings
set general_wellesley_selected_weeks = '{}'
where general_wellesley_selected_weeks is null;

commit;
