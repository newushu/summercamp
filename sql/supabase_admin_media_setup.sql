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
  add column if not exists registration_step_image_urls text[] not null default '{}',
  add column if not exists email_journey_templates jsonb not null default '[]'::jsonb,
  add column if not exists testimonials jsonb not null default '[]'::jsonb,
  add column if not exists wechat_qr_url text,
  add column if not exists tuition_full_week numeric not null default 0,
  add column if not exists tuition_full_day numeric not null default 0,
  add column if not exists tuition_am_half numeric not null default 0,
  add column if not exists tuition_pm_half numeric not null default 0,
  add column if not exists tuition_overnight_week numeric not null default 0,
  add column if not exists tuition_overnight_day numeric not null default 0,
  add column if not exists discount_full_week numeric not null default 0,
  add column if not exists discount_full_day numeric not null default 0,
  add column if not exists discount_am_half numeric not null default 0,
  add column if not exists discount_pm_half numeric not null default 0,
  add column if not exists discount_overnight_week numeric not null default 0,
  add column if not exists discount_overnight_day numeric not null default 0,
  add column if not exists discount_end_date date,
  add column if not exists discount_display_value text,
  add column if not exists discount_code text,
  add column if not exists lunch_price numeric not null default 14,
  add column if not exists bootcamp_premium_pct numeric not null default 15,
  add column if not exists sibling_discount_pct numeric not null default 10;

-- Backfill array from legacy single URL where possible
update public.camp_admin_settings
set level_up_screenshot_urls = array[level_up_image_url]
where coalesce(array_length(level_up_screenshot_urls, 1), 0) = 0
  and level_up_image_url is not null
  and level_up_image_url <> '';

-- Clamp existing size values to app-supported range
update public.camp_admin_settings
set level_up_screenshot_size = greatest(40, least(140, coalesce(level_up_screenshot_size, 100)));

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

alter table public.program_interest_profiles enable row level security;

drop policy if exists "anon insert program-interest-profiles" on public.program_interest_profiles;
create policy "anon insert program-interest-profiles"
on public.program_interest_profiles
for insert
to anon, authenticated
with check (email is not null and length(trim(email)) > 3);

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
