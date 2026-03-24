-- Base registrations table required by:
-- - /register public submission flow
-- - /overnight public submission flow
-- - /admin registration accounting
--
-- Safe to re-run.

begin;

create table if not exists public.registrations (
  id bigint generated always as identity primary key,
  camper_first_name text,
  camper_last_name text,
  age int,
  experience_level text,
  guardian_name text not null default '',
  guardian_email text not null default '',
  guardian_phone text,
  emergency_contact text,
  medical_notes text,
  accounting_entries jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_registrations_created_at
  on public.registrations (created_at desc);

create index if not exists idx_registrations_guardian_email
  on public.registrations (guardian_email);

alter table public.registrations enable row level security;

drop policy if exists "anon insert registrations" on public.registrations;
create policy "anon insert registrations"
on public.registrations
for insert
to anon, authenticated
with check (guardian_email is not null and length(trim(guardian_email)) > 3);

drop policy if exists "auth read registrations" on public.registrations;
create policy "auth read registrations"
on public.registrations
for select
to authenticated
using (true);

drop policy if exists "auth update registrations" on public.registrations;
create policy "auth update registrations"
on public.registrations
for update
to authenticated
using (true)
with check (true);

commit;
