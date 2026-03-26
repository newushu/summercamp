-- Supabase admin/media setup for New England Wushu site
-- Safe to re-run.

begin;

-- 1) Extend admin settings table for multi-screenshot support
alter table public.camp_admin_settings
  add column if not exists level_up_screenshot_urls text[] not null default '{}',
  add column if not exists level_up_screenshot_size int not null default 100,
  add column if not exists welcome_logo_url text,
  add column if not exists survey_video_url text,
  add column if not exists survey_step1_flyer_url text,
  add column if not exists survey_mobile_bg_url text,
  add column if not exists survey_step_image_urls text[] not null default '{}',
  add column if not exists survey_step_image_positions jsonb not null default '[]'::jsonb,
  add column if not exists landing_carousel_image_positions jsonb not null default '[]'::jsonb,
  add column if not exists registration_step_image_urls text[] not null default '{}',
  add column if not exists burlington_facility_image_urls text[] not null default '{}',
  add column if not exists acton_facility_image_urls text[] not null default '{}',
  add column if not exists overnight_landing_image_urls text[] not null default '{}',
  add column if not exists overnight_gallery_image_urls text[] not null default '{}',
  add column if not exists overnight_registration_image_urls text[] not null default '{}',
  add column if not exists level_up_screenshot_positions jsonb not null default '[]'::jsonb,
  add column if not exists email_journey_templates jsonb not null default '[]'::jsonb,
  add column if not exists testimonials jsonb not null default '[]'::jsonb,
  add column if not exists camp_type_showcase jsonb not null default '{}'::jsonb,
  add column if not exists wechat_qr_url text,
  add column if not exists tuition_full_week numeric not null default 0,
  add column if not exists tuition_full_day numeric not null default 0,
  add column if not exists tuition_am_half numeric not null default 0,
  add column if not exists tuition_pm_half numeric not null default 0,
  add column if not exists tuition_overnight_week numeric not null default 1180,
  add column if not exists tuition_overnight_day numeric not null default 0,
  add column if not exists discount_full_week numeric not null default 0,
  add column if not exists discount_full_day numeric not null default 0,
  add column if not exists discount_am_half numeric not null default 0,
  add column if not exists discount_pm_half numeric not null default 0,
  add column if not exists bootcamp_tuition_full_week numeric not null default 0,
  add column if not exists bootcamp_tuition_full_day numeric not null default 0,
  add column if not exists bootcamp_tuition_am_half numeric not null default 0,
  add column if not exists bootcamp_tuition_pm_half numeric not null default 0,
  add column if not exists bootcamp_discount_full_week numeric not null default 0,
  add column if not exists bootcamp_discount_full_day numeric not null default 0,
  add column if not exists bootcamp_discount_am_half numeric not null default 0,
  add column if not exists bootcamp_discount_pm_half numeric not null default 0,
  add column if not exists discount_overnight_week numeric not null default 980,
  add column if not exists discount_overnight_day numeric not null default 0,
  add column if not exists discount_end_date date,
  add column if not exists discount_display_value text,
  add column if not exists discount_code text,
  add column if not exists invoice_business_name text,
  add column if not exists invoice_business_address text,
  add column if not exists lunch_price numeric not null default 14,
  add column if not exists bootcamp_premium_pct numeric not null default 25,
  add column if not exists sibling_discount_pct numeric not null default 10,
  add column if not exists general_acton_selected_weeks text[] not null default '{}';

-- Backfill array from legacy single URL where possible
update public.camp_admin_settings
set level_up_screenshot_urls = array[level_up_image_url]
where coalesce(array_length(level_up_screenshot_urls, 1), 0) = 0
  and level_up_image_url is not null
  and level_up_image_url <> '';

update public.camp_admin_settings
set overnight_gallery_image_urls = overnight_landing_image_urls
where coalesce(array_length(overnight_gallery_image_urls, 1), 0) = 0
  and coalesce(array_length(overnight_landing_image_urls, 1), 0) > 0;

update public.camp_admin_settings
set overnight_registration_image_urls =
  array[
    coalesce(overnight_gallery_image_urls[1], ''),
    coalesce(overnight_gallery_image_urls[2], ''),
    coalesce(overnight_gallery_image_urls[3], '')
  ]
where coalesce(array_length(overnight_registration_image_urls, 1), 0) = 0
  and coalesce(array_length(overnight_gallery_image_urls, 1), 0) > 0;

-- Clamp existing size values to app-supported range
update public.camp_admin_settings
set level_up_screenshot_size = greatest(40, least(140, coalesce(level_up_screenshot_size, 100)));

-- Move legacy competition-team premium default from 15% to 25%
update public.camp_admin_settings
set bootcamp_premium_pct = 25
where coalesce(bootcamp_premium_pct, 15) = 15;

update public.camp_admin_settings
set
  bootcamp_tuition_full_week = case
    when coalesce(bootcamp_tuition_full_week, 0) = 0 and coalesce(tuition_full_week, 0) > 0
      then round((tuition_full_week * (1 + coalesce(bootcamp_premium_pct, 25) / 100.0)) / 5.0) * 5
    else bootcamp_tuition_full_week
  end,
  bootcamp_tuition_full_day = case
    when coalesce(bootcamp_tuition_full_day, 0) = 0 and coalesce(tuition_full_day, 0) > 0
      then round((tuition_full_day * (1 + coalesce(bootcamp_premium_pct, 25) / 100.0)) / 5.0) * 5
    else bootcamp_tuition_full_day
  end,
  bootcamp_tuition_am_half = case
    when coalesce(bootcamp_tuition_am_half, 0) = 0 and coalesce(tuition_am_half, 0) > 0
      then round((tuition_am_half * (1 + coalesce(bootcamp_premium_pct, 25) / 100.0)) / 5.0) * 5
    else bootcamp_tuition_am_half
  end,
  bootcamp_tuition_pm_half = case
    when coalesce(bootcamp_tuition_pm_half, 0) = 0 and coalesce(tuition_pm_half, 0) > 0
      then round((tuition_pm_half * (1 + coalesce(bootcamp_premium_pct, 25) / 100.0)) / 5.0) * 5
    else bootcamp_tuition_pm_half
  end,
  bootcamp_discount_full_week = case
    when coalesce(bootcamp_discount_full_week, 0) = 0 and coalesce(discount_full_week, 0) > 0
      then round((discount_full_week * (1 + coalesce(bootcamp_premium_pct, 25) / 100.0)) / 5.0) * 5
    else bootcamp_discount_full_week
  end,
  bootcamp_discount_full_day = case
    when coalesce(bootcamp_discount_full_day, 0) = 0 and coalesce(discount_full_day, 0) > 0
      then round((discount_full_day * (1 + coalesce(bootcamp_premium_pct, 25) / 100.0)) / 5.0) * 5
    else bootcamp_discount_full_day
  end,
  bootcamp_discount_am_half = case
    when coalesce(bootcamp_discount_am_half, 0) = 0 and coalesce(discount_am_half, 0) > 0
      then round((discount_am_half * (1 + coalesce(bootcamp_premium_pct, 25) / 100.0)) / 5.0) * 5
    else bootcamp_discount_am_half
  end,
  bootcamp_discount_pm_half = case
    when coalesce(bootcamp_discount_pm_half, 0) = 0 and coalesce(discount_pm_half, 0) > 0
      then round((discount_pm_half * (1 + coalesce(bootcamp_premium_pct, 25) / 100.0)) / 5.0) * 5
    else bootcamp_discount_pm_half
  end,
  tuition_overnight_week = case when coalesce(tuition_overnight_week, 0) = 0 then 1180 else tuition_overnight_week end,
  discount_overnight_week = case when coalesce(discount_overnight_week, 0) = 0 then 980 else discount_overnight_week end,
  discount_end_date = coalesce(discount_end_date, date '2026-05-20'),
  discount_display_value = coalesce(nullif(discount_display_value, ''), '$200 off week 1 + extra $100 off week 2');

-- Ensure level up screenshot positions has exactly 5 {x,y,zoom} entries
update public.camp_admin_settings
set level_up_screenshot_positions = jsonb_build_array(
  jsonb_build_object(
    'x', coalesce((level_up_screenshot_positions->0->>'x')::numeric, 0),
    'y', coalesce((level_up_screenshot_positions->0->>'y')::numeric, 0),
    'zoom', greatest(80, least(140, coalesce((level_up_screenshot_positions->0->>'zoom')::numeric, 100)))
  ),
  jsonb_build_object(
    'x', coalesce((level_up_screenshot_positions->1->>'x')::numeric, 0),
    'y', coalesce((level_up_screenshot_positions->1->>'y')::numeric, 0),
    'zoom', greatest(80, least(140, coalesce((level_up_screenshot_positions->1->>'zoom')::numeric, 100)))
  ),
  jsonb_build_object(
    'x', coalesce((level_up_screenshot_positions->2->>'x')::numeric, 0),
    'y', coalesce((level_up_screenshot_positions->2->>'y')::numeric, 0),
    'zoom', greatest(80, least(140, coalesce((level_up_screenshot_positions->2->>'zoom')::numeric, 100)))
  ),
  jsonb_build_object(
    'x', coalesce((level_up_screenshot_positions->3->>'x')::numeric, 0),
    'y', coalesce((level_up_screenshot_positions->3->>'y')::numeric, 0),
    'zoom', greatest(80, least(140, coalesce((level_up_screenshot_positions->3->>'zoom')::numeric, 100)))
  ),
  jsonb_build_object(
    'x', coalesce((level_up_screenshot_positions->4->>'x')::numeric, 0),
    'y', coalesce((level_up_screenshot_positions->4->>'y')::numeric, 0),
    'zoom', greatest(80, least(140, coalesce((level_up_screenshot_positions->4->>'zoom')::numeric, 100)))
  )
);

-- Ensure survey step image array has at least 6 entries
update public.camp_admin_settings
set survey_step_image_urls =
  array[
    coalesce(survey_step_image_urls[1], ''),
    coalesce(survey_step_image_urls[2], ''),
    coalesce(survey_step_image_urls[3], ''),
    coalesce(survey_step_image_urls[4], ''),
    coalesce(survey_step_image_urls[5], ''),
    coalesce(survey_step_image_urls[6], '')
  ];

-- Ensure registration step image array has 4 entries
update public.camp_admin_settings
set registration_step_image_urls =
  array[
    coalesce(registration_step_image_urls[1], ''),
    coalesce(registration_step_image_urls[2], ''),
    coalesce(registration_step_image_urls[3], ''),
    coalesce(registration_step_image_urls[4], '')
  ];

-- Ensure Burlington facility image array has 6 entries
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

-- Ensure Acton facility image array has 6 entries
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

-- Ensure overnight landing image array has 6 entries
update public.camp_admin_settings
set overnight_landing_image_urls =
  array[
    coalesce(overnight_landing_image_urls[1], ''),
    coalesce(overnight_landing_image_urls[2], ''),
    coalesce(overnight_landing_image_urls[3], ''),
    coalesce(overnight_landing_image_urls[4], ''),
    coalesce(overnight_landing_image_urls[5], ''),
    coalesce(overnight_landing_image_urls[6], '')
  ];

-- Ensure survey step image positions has exactly 6 {x,y} entries
update public.camp_admin_settings
set survey_step_image_positions = jsonb_build_array(
  jsonb_build_object('x', coalesce((survey_step_image_positions->0->>'x')::numeric, 0), 'y', coalesce((survey_step_image_positions->0->>'y')::numeric, 0)),
  jsonb_build_object('x', coalesce((survey_step_image_positions->1->>'x')::numeric, 0), 'y', coalesce((survey_step_image_positions->1->>'y')::numeric, 0)),
  jsonb_build_object('x', coalesce((survey_step_image_positions->2->>'x')::numeric, 0), 'y', coalesce((survey_step_image_positions->2->>'y')::numeric, 0)),
  jsonb_build_object('x', coalesce((survey_step_image_positions->3->>'x')::numeric, 0), 'y', coalesce((survey_step_image_positions->3->>'y')::numeric, 0)),
  jsonb_build_object('x', coalesce((survey_step_image_positions->4->>'x')::numeric, 0), 'y', coalesce((survey_step_image_positions->4->>'y')::numeric, 0)),
  jsonb_build_object('x', coalesce((survey_step_image_positions->5->>'x')::numeric, 0), 'y', coalesce((survey_step_image_positions->5->>'y')::numeric, 0))
);

-- Ensure landing carousel image positions has exactly 4 {x,y,zoom} entries
update public.camp_admin_settings
set landing_carousel_image_positions = jsonb_build_array(
  jsonb_build_object(
    'x', coalesce((landing_carousel_image_positions->0->>'x')::numeric, 0),
    'y', coalesce((landing_carousel_image_positions->0->>'y')::numeric, 0),
    'zoom', greatest(80, least(140, coalesce((landing_carousel_image_positions->0->>'zoom')::numeric, 100)))
  ),
  jsonb_build_object(
    'x', coalesce((landing_carousel_image_positions->1->>'x')::numeric, 0),
    'y', coalesce((landing_carousel_image_positions->1->>'y')::numeric, 0),
    'zoom', greatest(80, least(140, coalesce((landing_carousel_image_positions->1->>'zoom')::numeric, 100)))
  ),
  jsonb_build_object(
    'x', coalesce((landing_carousel_image_positions->2->>'x')::numeric, 0),
    'y', coalesce((landing_carousel_image_positions->2->>'y')::numeric, 0),
    'zoom', greatest(80, least(140, coalesce((landing_carousel_image_positions->2->>'zoom')::numeric, 100)))
  ),
  jsonb_build_object(
    'x', coalesce((landing_carousel_image_positions->3->>'x')::numeric, 0),
    'y', coalesce((landing_carousel_image_positions->3->>'y')::numeric, 0),
    'zoom', greatest(80, least(140, coalesce((landing_carousel_image_positions->3->>'zoom')::numeric, 100)))
  )
);

update public.camp_admin_settings
set testimonials = coalesce(testimonials, '[]'::jsonb);

-- 1b) Lead capture table for "Learn More" survey email profiles
create table if not exists public.program_interest_profiles (
  id bigint generated always as identity primary key,
  email text not null,
  camper_count int,
  camper_ages int[] not null default '{}',
  profile_context jsonb not null default '{}'::jsonb,
  last_completed_step int not null default 1,
  source text not null default 'summer-camp-program-finder',
  created_at timestamptz not null default now()
);

alter table public.program_interest_profiles
  add column if not exists profile_context jsonb not null default '{}'::jsonb,
  add column if not exists last_completed_step int not null default 1;

create index if not exists idx_program_interest_profiles_email
  on public.program_interest_profiles (email);

with duplicate_rollup as (
  select
    lower(email) as email_key,
    min(id) as keeper_id,
    max(coalesce(camper_count, 1)) as merged_camper_count,
    max(coalesce(last_completed_step, 1)) as merged_last_completed_step
  from public.program_interest_profiles
  where email is not null
    and trim(email) <> ''
  group by lower(email)
  having count(*) > 1
),
duplicate_best_rows as (
  select distinct on (lower(p.email))
    lower(p.email) as email_key,
    p.camper_ages,
    p.profile_context,
    p.source
  from public.program_interest_profiles p
  where p.email is not null
    and trim(p.email) <> ''
  order by
    lower(p.email),
    coalesce(array_length(p.camper_ages, 1), 0) desc,
    coalesce(last_completed_step, 1) desc,
    created_at desc,
    id desc
)
update public.program_interest_profiles keeper
set
  camper_count = rollup.merged_camper_count,
  last_completed_step = rollup.merged_last_completed_step,
  camper_ages = coalesce(best.camper_ages, keeper.camper_ages, '{}'),
  profile_context = coalesce(keeper.profile_context, '{}'::jsonb) || coalesce(best.profile_context, '{}'::jsonb),
  source = coalesce(nullif(keeper.source, ''), nullif(best.source, ''), 'summer-camp-program-finder')
from duplicate_rollup rollup
join duplicate_best_rows best on best.email_key = rollup.email_key
where keeper.id = rollup.keeper_id;

delete from public.program_interest_profiles duplicate
using public.program_interest_profiles keeper
where lower(duplicate.email) = lower(keeper.email)
  and duplicate.id > keeper.id;

create unique index if not exists idx_program_interest_profiles_email_lower_unique
  on public.program_interest_profiles (lower(email));

alter table public.program_interest_profiles enable row level security;

drop policy if exists "anon insert program-interest-profiles" on public.program_interest_profiles;
create policy "anon insert program-interest-profiles"
on public.program_interest_profiles
for insert
to anon, authenticated
with check (email is not null and length(trim(email)) > 3);

drop policy if exists "auth read program-interest-profiles" on public.program_interest_profiles;
create policy "auth read program-interest-profiles"
on public.program_interest_profiles
for select
to authenticated
using (true);

create or replace function public.capture_program_interest_profile(
  p_email text,
  p_camper_count int default 1,
  p_camper_ages int[] default '{}',
  p_profile_context jsonb default '{}'::jsonb,
  p_last_completed_step int default 1,
  p_source text default 'summer-camp-program-finder'
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_existing_id bigint;
  v_existing_camper_count int;
  v_existing_camper_ages int[];
  v_existing_context jsonb;
  v_existing_last_completed_step int;
  v_existing_source text;
begin
  if v_email = '' or length(v_email) <= 3 then
    raise exception 'A valid email is required.';
  end if;

  select
    id,
    camper_count,
    camper_ages,
    profile_context,
    last_completed_step,
    source
  into
    v_existing_id,
    v_existing_camper_count,
    v_existing_camper_ages,
    v_existing_context,
    v_existing_last_completed_step,
    v_existing_source
  from public.program_interest_profiles
  where lower(email) = v_email
  order by created_at asc
  limit 1;

  if v_existing_id is not null then
    update public.program_interest_profiles
    set
      camper_count = greatest(coalesce(p_camper_count, 1), coalesce(v_existing_camper_count, 1)),
      camper_ages = case
        when coalesce(array_length(p_camper_ages, 1), 0) > 0 then p_camper_ages
        else coalesce(v_existing_camper_ages, '{}')
      end,
      profile_context = coalesce(v_existing_context, '{}'::jsonb) || coalesce(p_profile_context, '{}'::jsonb),
      last_completed_step = greatest(coalesce(p_last_completed_step, 1), coalesce(v_existing_last_completed_step, 1)),
      source = coalesce(nullif(v_existing_source, ''), nullif(p_source, ''), 'summer-camp-program-finder')
    where id = v_existing_id;

    return v_existing_id;
  end if;

  insert into public.program_interest_profiles (
    email,
    camper_count,
    camper_ages,
    profile_context,
    last_completed_step,
    source
  )
  values (
    v_email,
    greatest(coalesce(p_camper_count, 1), 1),
    coalesce(p_camper_ages, '{}'),
    coalesce(p_profile_context, '{}'::jsonb),
    greatest(coalesce(p_last_completed_step, 1), 1),
    coalesce(nullif(p_source, ''), 'summer-camp-program-finder')
  )
  returning id into v_existing_id;

  return v_existing_id;
end;
$$;

revoke all on function public.capture_program_interest_profile(text, int, int[], jsonb, int, text) from public;
grant execute on function public.capture_program_interest_profile(text, int, int[], jsonb, int, text) to anon, authenticated;

-- 1c) Email journey tracking tables
create table if not exists public.email_journey_runs (
  id bigint generated always as identity primary key,
  profile_id bigint references public.program_interest_profiles(id) on delete set null,
  email text not null,
  status text not null default 'queued',
  current_step int not null default 1,
  last_sent_at timestamptz,
  next_send_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_journey_events (
  id bigint generated always as identity primary key,
  run_id bigint references public.email_journey_runs(id) on delete cascade,
  profile_id bigint references public.program_interest_profiles(id) on delete set null,
  email text not null,
  step_number int,
  event_type text not null,
  provider_message_id text,
  subject text,
  body_preview text,
  event_payload jsonb not null default '{}'::jsonb,
  event_at timestamptz not null default now()
);

create table if not exists public.email_replies (
  id bigint generated always as identity primary key,
  run_id bigint references public.email_journey_runs(id) on delete set null,
  profile_id bigint references public.program_interest_profiles(id) on delete set null,
  email text not null,
  from_email text not null,
  provider_message_id text,
  provider_thread_id text,
  subject text,
  body_text text,
  body_html text,
  is_unread boolean not null default true,
  ai_status text not null default 'pending',
  ai_draft text,
  ai_generated_at timestamptz,
  ai_sent_at timestamptz,
  ai_error text,
  received_at timestamptz not null default now()
);

alter table public.email_replies
  add column if not exists ai_status text not null default 'pending',
  add column if not exists ai_draft text,
  add column if not exists ai_generated_at timestamptz,
  add column if not exists ai_sent_at timestamptz,
  add column if not exists ai_error text;

create index if not exists idx_email_journey_runs_email
  on public.email_journey_runs (email);
create index if not exists idx_email_journey_runs_created_at
  on public.email_journey_runs (created_at desc);

create index if not exists idx_email_journey_events_run
  on public.email_journey_events (run_id, event_at desc);
create index if not exists idx_email_journey_events_email
  on public.email_journey_events (email);

create index if not exists idx_email_replies_email
  on public.email_replies (email);
create index if not exists idx_email_replies_received_at
  on public.email_replies (received_at desc);
create index if not exists idx_email_replies_is_unread
  on public.email_replies (is_unread);

alter table public.email_journey_runs enable row level security;
alter table public.email_journey_events enable row level security;
alter table public.email_replies enable row level security;

drop policy if exists "auth read email-journey-runs" on public.email_journey_runs;
create policy "auth read email-journey-runs"
on public.email_journey_runs
for select
to authenticated
using (true);

drop policy if exists "auth insert email-journey-runs" on public.email_journey_runs;
create policy "auth insert email-journey-runs"
on public.email_journey_runs
for insert
to authenticated
with check (email is not null and length(trim(email)) > 3);

drop policy if exists "auth update email-journey-runs" on public.email_journey_runs;
create policy "auth update email-journey-runs"
on public.email_journey_runs
for update
to authenticated
using (true)
with check (email is not null and length(trim(email)) > 3);

drop policy if exists "auth read email-journey-events" on public.email_journey_events;
create policy "auth read email-journey-events"
on public.email_journey_events
for select
to authenticated
using (true);

drop policy if exists "auth insert email-journey-events" on public.email_journey_events;
create policy "auth insert email-journey-events"
on public.email_journey_events
for insert
to authenticated
with check (email is not null and length(trim(email)) > 3);

drop policy if exists "auth read email-replies" on public.email_replies;
create policy "auth read email-replies"
on public.email_replies
for select
to authenticated
using (true);

drop policy if exists "auth insert email-replies" on public.email_replies;
create policy "auth insert email-replies"
on public.email_replies
for insert
to authenticated
with check (email is not null and length(trim(email)) > 3);

drop policy if exists "auth update email-replies" on public.email_replies;
create policy "auth update email-replies"
on public.email_replies
for update
to authenticated
using (true)
with check (email is not null and length(trim(email)) > 3);

-- 2) Create public storage bucket for media if missing
insert into storage.buckets (id, name, public)
values ('camp-media', 'camp-media', true)
on conflict (id) do nothing;

-- 3) Storage RLS policies
-- NOTE: Postgres does not support "create policy if not exists"
-- so we drop then recreate.

drop policy if exists "public read camp-media" on storage.objects;
create policy "public read camp-media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'camp-media');

drop policy if exists "auth insert camp-media" on storage.objects;
create policy "auth insert camp-media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'camp-media');

drop policy if exists "auth update camp-media" on storage.objects;
create policy "auth update camp-media"
on storage.objects
for update
to authenticated
using (bucket_id = 'camp-media')
with check (bucket_id = 'camp-media');

drop policy if exists "auth delete camp-media" on storage.objects;
create policy "auth delete camp-media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'camp-media');

commit;
