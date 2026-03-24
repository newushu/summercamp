begin;

alter table public.registrations
  add column if not exists accounting_entries jsonb not null default '[]'::jsonb;

update public.registrations
set accounting_entries = '[]'::jsonb
where accounting_entries is null;

commit;
