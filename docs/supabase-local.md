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

## Local seed data

`supabase db reset` now applies local seed files in this order:

```toml
sql_paths = [
  "./seed.sql",
  "./seeds/local_syrian_demo_data.sql",
  "./seeds/auth_smoke_token_defaults.sql"
]
```

This preserves the original minimal smoke dataset and adds a deterministic
local-only Syrian demo dataset with fictional Arabic names and cross-module data.

All local demo Auth users share the same password:

| Password | Scope |
| --- | --- |
| `OfuqLocal123!` | Every local `@ofuq.local` account |

Preserved smoke accounts:

| Email | Role |
| --- | --- |
| `admin@ofuq.local` | `school_admin` |
| `teacher@ofuq.local` | `teacher` |

Syrian demo accounts:

| Email | Role |
| --- | --- |
| `system.admin@ofuq.local` | `system_admin` |
| `school.admin@ofuq.local` | `school_admin` |
| `teacher.arabic@ofuq.local` | `teacher` |
| `teacher.math@ofuq.local` | `teacher` |
| `teacher.science@ofuq.local` | `teacher` |
| `teacher.english@ofuq.local` | `teacher` |
| `teacher.physics@ofuq.local` | `teacher` |
| `teacher.social@ofuq.local` | `teacher` |
| `accountant@ofuq.local` | `accountant` |
| `librarian@ofuq.local` | `librarian` |
| `parent.hassan@ofuq.local` | `parent` |
| `parent.rana@ofuq.local` | `parent` |
| `student.youssef@ofuq.local` | `student` |
| `student.lana@ofuq.local` | `student` |

The Syrian demo dataset is fictional and local-only. Do not use these records or
credentials in production, hosted Supabase projects, screenshots, or shared
environments.

The richer local dataset adds:

- Demo tenant: `Ofuq Syrian Demo Tenant`
- Demo school: `مدرسة أفق النموذجية الخاصة`
- Demo city context: `دمشق، سوريا`
- Academic year `2026-2027` with `الفصل الأول` and `الفصل الثاني`
- Grade levels `G01` through `G12`
- Syrian-style classes, subjects, enrollments, attendance, grades, report cards,
  timetable, finance, communication, library, student-care, and feedback data

The final seed `auth_smoke_token_defaults.sql` still runs last so all local
`@ofuq.local` Auth users keep non-null token/default fields where those local
GoTrue columns exist, and all local emails remain email-confirmed.

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
- `supabase/seeds/local_syrian_demo_data.sql`
- `supabase/seeds/auth_smoke_token_defaults.sql`
