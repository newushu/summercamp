begin;

update public.program_interest_profiles
set email = lower(trim(email))
where email is not null;

delete from public.program_interest_profiles a
using public.program_interest_profiles b
where lower(trim(a.email)) = lower(trim(b.email))
  and a.id < b.id;

create unique index if not exists idx_program_interest_profiles_email_unique
  on public.program_interest_profiles (email);

drop policy if exists "anon update program-interest-profiles" on public.program_interest_profiles;
create policy "anon update program-interest-profiles"
on public.program_interest_profiles
for update
to anon, authenticated
using (email is not null and length(trim(email)) > 3)
with check (email is not null and length(trim(email)) > 3);

commit;
