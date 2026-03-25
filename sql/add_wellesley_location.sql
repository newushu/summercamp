begin;

-- Wellesley facility photo URLs
alter table public.camp_admin_settings
  add column if not exists wellesley_facility_image_urls text[] not null default '{}';

-- Location addresses (street, city, state, zip per location as JSONB)
alter table public.camp_admin_settings
  add column if not exists location_addresses jsonb not null default '{}';

update public.camp_admin_settings
set
  wellesley_facility_image_urls = '{}',
  location_addresses = '{}'
where
  wellesley_facility_image_urls is null
  or location_addresses is null;

commit;
