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
  "./seeds/local_syrian_demo_00_helpers.sql",
  "./seeds/local_syrian_demo_01_create_stage_tables.sql",
  "./seeds/local_syrian_demo_02_stage_data.sql",
  "./seeds/local_syrian_demo_03_apply.sql",
  "./seeds/local_syrian_demo_04_cleanup.sql",
  "./seeds/auth_smoke_token_defaults.sql"
]
```

This preserves the original minimal smoke dataset and adds a deterministic
local-only Syrian demo dataset with fictional Arabic names and cross-module data
through a split seed pipeline that avoids Supabase CLI batch-order failures.

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

Phase 16 closure verification on `2026-07-08` confirmed the local seed and
portal identity links through `supabase start`, `supabase status`, local type
generation, and `tests/db/local-demo-smoke.sql`. Direct `supabase db reset`
exit was still intermittently unstable on this Windows Docker setup after local
container restarts, so browser smoke remains unclaimed.

Phase 18 closure verification on `2026-07-09` confirmed the new settings seed
records through `supabase status`, successful `supabase db reset`, local type
generation, `tests/db/local-demo-smoke.sql`, and Playwright browser smoke for
the settings/integrations placeholder routes.

The richer local dataset adds:

- Demo tenant: `Ofuq Syrian Demo Tenant`
- Demo school: `مدرسة أفق النموذجية الخاصة`
- Demo city context: `دمشق، سوريا`
- Academic year `2026-2027` with `الفصل الأول` and `الفصل الثاني`
- Grade levels `G01` through `G12`
- Syrian-style classes, subjects, enrollments, attendance, grades, report cards,
  timetable, finance, communication, library, student-care, and feedback data
- Parent demo links through `student_guardians.guardian_user_id`
- Student demo links through `students.student_user_id`
- One `school_settings` row, nine `integration_settings` rows, and seeded
  `message_templates` for the demo school

The final seed `auth_smoke_token_defaults.sql` still runs last so all local
`@ofuq.local` Auth users keep non-null token/default fields where those local
GoTrue columns exist, and all local emails remain email-confirmed.

## Local workflow

1. Start Supabase locally with `supabase start`.
2. Add incremental migrations under `supabase/migrations/`.
3. Reset the local database with `supabase db reset` when you need a clean replay and the local Docker/Supabase stack is healthy.
4. If `supabase db reset` is unstable in this Windows environment, recover the stack with `supabase start`, confirm `supabase status`, then run local smoke SQL and regenerate types.
5. Regenerate `types/database.ts` after schema changes when the local stack is available.

## Current schema files

- `supabase/config.toml`
- `supabase/migrations/20260706120000_initial_foundations.sql`
- `supabase/migrations/20260706143000_core_schema_refinement.sql`
- `supabase/migrations/20260706183000_students_admissions_foundation.sql`
- `supabase/migrations/20260706200000_academic_structure_foundation.sql`
- `supabase/migrations/20260706213000_attendance_manual_qr_foundation.sql`
- `supabase/migrations/20260707010000_grades_report_cards_foundation.sql`
- `supabase/migrations/20260707120000_manual_timetable_conflict_prevention.sql`
- `supabase/migrations/20260707140000_finance_basics_foundation.sql`
- `supabase/migrations/20260707160000_communication_ready_made_reports_foundation.sql`
- `supabase/migrations/20260707180000_library_foundation.sql`
- `supabase/migrations/20260707200000_student_care_foundation.sql`
- `supabase/migrations/20260708010000_feedback_foundation.sql`
- `supabase/migrations/20260708120000_parent_student_read_only_portal_foundation.sql`
- `supabase/migrations/20260709120000_settings_integrations_placeholders_foundation.sql`
- `supabase/seed.sql`
- `supabase/seeds/local_syrian_demo_00_helpers.sql`
- `supabase/seeds/local_syrian_demo_01_create_stage_tables.sql`
- `supabase/seeds/local_syrian_demo_02_stage_data.sql`
- `supabase/seeds/local_syrian_demo_03_apply.sql`
- `supabase/seeds/local_syrian_demo_04_cleanup.sql`
- `supabase/seeds/auth_smoke_token_defaults.sql`
