begin;

alter table public.camp_admin_settings
  add column if not exists burlington_facility_image_urls text[] not null default '{}',
  add column if not exists acton_facility_image_urls text[] not null default '{}';

update public.camp_admin_settings
set burlington_facility_image_urls =
  array[
    coalesce(burlington_facility_image_urls[1], ''),
    coalesce(burlington_facility_image_urls[2], ''),
    coalesce(burlington_facility_image_urls[3], ''),
    coalesce(burlington_facility_image_urls[4], ''),
    coalesce(burlington_facility_image_urls[5], ''),
    coalesce(burlington_facility_image_urls[6], '')
  ];

update public.camp_admin_settings
set acton_facility_image_urls =
  array[
    coalesce(acton_facility_image_urls[1], ''),
    coalesce(acton_facility_image_urls[2], ''),
    coalesce(acton_facility_image_urls[3], ''),
    coalesce(acton_facility_image_urls[4], ''),
    coalesce(acton_facility_image_urls[5], ''),
    coalesce(acton_facility_image_urls[6], '')
  ];

commit;
