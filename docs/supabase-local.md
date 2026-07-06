# Supabase Local

## Environment

Copy the variables from `.env.example` and provide local values without committing secrets:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- `NEXT_PUBLIC_*` values are browser-safe.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be imported into Client Components.

## Common commands

```bash
supabase start
supabase status
supabase db reset
supabase migration new <name>
supabase gen types typescript --local > types/database.ts
```

## Local smoke seed

`supabase db reset` applies `supabase/seed.sql`, which creates a deterministic
local-only smoke dataset for authenticated workflow checks.

Local-only users:

| Email | Password | Role |
| --- | --- | --- |
| `admin@ofuq.local` | `OfuqLocal123!` | `school_admin` |
| `teacher@ofuq.local` | `OfuqLocal123!` | `teacher` |

These credentials are demo data for local smoke testing only. Do not use them in
production, screenshots, shared environments, or hosted Supabase projects.

The reset seed also creates:

- Tenant: `Ofuq Demo Tenant`
- School: `مدرسة أفق التجريبية`
- Academic year: `2026-2027`
- Term: `الفصل الأول`
- Grade level: `الصف الأول`
- Class: `الصف الأول / أ`
- Subject: `الرياضيات`
- Student: `طالب تجريبي`
- Active class enrollment for the smoke student

The smoke seed intentionally does not create attendance sessions, attendance
records, exams, grade entries, or report cards. Those records should be created
through the UI or Server Actions during workflow smoke testing.

## Local workflow

1. Start Supabase locally with `supabase start`.
2. Add incremental migrations under `supabase/migrations/`.
3. Reset the local database with `supabase db reset` when you need a clean replay.
4. Regenerate `types/database.ts` after schema changes when the local stack is available.

## Current schema files

- `supabase/config.toml`
- `supabase/migrations/20260706120000_initial_foundations.sql`
- `supabase/migrations/20260706143000_core_schema_refinement.sql`
- `supabase/migrations/20260706183000_students_admissions_foundation.sql`
- `supabase/migrations/20260706200000_academic_structure_foundation.sql`
- `supabase/seed.sql`
