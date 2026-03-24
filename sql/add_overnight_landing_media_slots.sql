-- Adds overnight landing media slots to admin settings.
-- Safe to re-run.

begin;

alter table public.camp_admin_settings
  add column if not exists overnight_landing_image_urls text[] not null default '{}';

update public.camp_admin_settings
set overnight_landing_image_urls =
  array[
    coalesce(overnight_landing_image_urls[1], ''),
    coalesce(overnight_landing_image_urls[2], ''),
    coalesce(overnight_landing_image_urls[3], ''),
    coalesce(overnight_landing_image_urls[4], '')
  ];

commit;
