# Summer Camp Site (Next.js + Supabase)

Marketing landing page + 3-step registration flow with Supabase backend storage.

## Stack

- Next.js (App Router)
- React
- Supabase JavaScript client

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment setup

1. Copy `.env.example` to `.env`.
2. Set these values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=info@newushu.com
AUTOMATION_CRON_SECRET=long-random-secret
AUTO_SEND_AI_REPLIES=false
```

Note: the app also accepts legacy `VITE_SUPABASE_*` variables for compatibility.
`SUPABASE_SERVICE_ROLE_KEY` is required for server-side email automation routes.

## Supabase table SQL

```sql
create table if not exists public.registrations (
  id bigint generated always as identity primary key,
  camper_first_name text not null,
  camper_last_name text not null,
  age int not null check (age between 3 and 17),
  experience_level text not null,
  guardian_name text not null,
  guardian_email text not null,
  guardian_phone text not null,
  emergency_contact text not null,
  medical_notes text,
  created_at timestamptz not null default now()
);
```

If RLS is enabled, allow anonymous inserts:

```sql
alter table public.registrations enable row level security;

create policy "allow anon insert registration"
on public.registrations
for insert
to anon
with check (true);
```

Also create the admin tables used by `/admin`:

- `camp_admin_settings`
- `camp_program_windows`
- `camp_program_selected_weeks`

Use the SQL script shared in chat for those tables/policies.

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm start` - run production server
- `npm run lint` - lint project
