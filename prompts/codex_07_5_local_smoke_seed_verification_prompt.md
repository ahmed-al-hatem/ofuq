# Codex Execution Prompt — 07.5 Local Smoke Seed + Grades/Attendance Workflow Verification

## Phase

`07.5 - Local Smoke Seed + Grades/Attendance Workflow Verification`

## Role

You are Codex acting as a senior full-stack engineer and QA-minded technical reviewer for **Ofuq | أُفُق**, a full-stack Arabic-first, RTL, multi-tenant school management system.

Your task is to create or document a repeatable local smoke dataset and use it to verify the authenticated workflows that were blocked after Phase 06 and Phase 07.

This is a **quality gate + local smoke data phase only**.

Do not implement new product features.
Do not add migrations.
Do not modify schema.
Do not start Phase 08.
Do not add testing frameworks.

---

## Main Objective

Phase 06.5 and Phase 07 both reported that authenticated browser/workflow smoke testing was blocked by missing local data after `supabase db reset`:

- no seeded auth user
- no seeded active membership for login
- no seeded student
- no seeded academic year
- no seeded class
- no seeded subject
- no seeded active class enrollment

This phase must solve or clearly document that local smoke-test gap without changing production architecture.

You must:

1. Inspect current seed and auth/membership patterns.
2. Create or document a safe repeatable local smoke dataset.
3. Verify attendance workflows if the environment allows authenticated access.
4. Verify grades/report-card workflows if the environment allows authenticated access.
5. Fix stale documentation such as any remaining “No grades, exams, or report cards yet” limitation.
6. Create a Phase 07 verification document.
7. Give a clear Go/No-Go decision for Phase 08.

---

## Required Pre-Read

Before making changes, read these files:

```txt
AGENTS.md
docs/architecture.md
docs/codex-workflow.md
docs/security-model.md
docs/database.md
docs/project-phases.md
docs/project-status.md
docs/verification-report.md
docs/verification-phase-06.md
docs/requirements-roadmap.md
package.json
.env.example
supabase/config.toml
supabase/seed.sql
constants/routes.ts
config/navigation.ts
lib/auth/session.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
lib/attendance/context.ts
lib/actions/attendance.ts
lib/grades/context.ts
lib/actions/grades.ts
types/database.ts
types/attendance.ts
types/grades.ts
supabase/migrations/20260706183000_students_admissions_foundation.sql
supabase/migrations/20260706200000_academic_structure_foundation.sql
supabase/migrations/20260706213000_attendance_manual_qr_foundation.sql
supabase/migrations/20260707010000_grades_report_cards_foundation.sql
```

If any listed file is missing, report it clearly and continue with the available project state.

---

## Current Expected State

The project should already have:

- Supabase Auth email/password login.
- Protected dashboard.
- Fixed roles through `user_memberships`.
- Multi-tenant tenant/school context from authenticated active membership.
- Students/admissions foundation.
- Student QR token foundation via `students.qr_token`.
- Academic years, terms, grade levels, classes, subjects, grade-level subject assignments, and class enrollments.
- Attendance foundation:
  - `attendance_sessions`
  - `attendance_records`
  - `absence_excuses`
- Grades/report cards foundation:
  - `exams`
  - `exam_results`
  - `grade_entries`
  - `report_cards`

Known issue to address:

```txt
Authenticated attendance and grades workflow smoke testing has been blocked by missing repeatable local smoke data.
```

---

## Strict Scope

### In Scope

You may:

- Inspect current `supabase/seed.sql`.
- Add safe local smoke data if it fits the existing seed workflow.
- Alternatively create a separate local-only smoke seed SQL file if modifying `supabase/seed.sql` is risky.
- Create a clear document explaining how to apply smoke seed data.
- Run verification commands.
- Attempt authenticated workflow smoke tests if local credentials and browser access are available.
- Create `docs/verification-phase-07.md`.
- Update `docs/project-status.md`.
- Update `docs/requirements-roadmap.md` only if inaccurate.
- Update `docs/supabase-local.md` if smoke seed instructions are needed.
- Update `docs/verification-report.md` only with a short pointer if useful.

### Out of Scope

Do not:

- Implement Phase 08.
- Add timetable tables or routes.
- Add finance, communication, reports, AI, or integrations.
- Add migrations.
- Modify existing migrations.
- Modify schema definitions.
- Add Playwright, Jest, Vitest, Cypress, or CI.
- Add new dependencies.
- Add production secrets.
- Add real external auth providers.
- Add full RLS.
- Add full RBAC.
- Refactor unrelated modules.

If you discover a critical bug, document it first. Only make a tiny scoped fix if it blocks lint/build and is clearly unrelated to product expansion.

---

## Local Smoke Dataset Strategy

Your first task is to inspect what `supabase/seed.sql` currently creates.

### Preferred Options

Use one of these approaches, choosing the safest for the current repo:

#### Option A — Update `supabase/seed.sql`

Use this only if it is safe and consistent with existing seed patterns.

The seed should create repeatable local data after `supabase db reset`:

- tenant
- school
- local admin or school admin auth user if safe
- user profile
- user membership
- optional teacher auth/profile/membership if safe
- academic year
- term
- grade level
- class
- subject
- grade-level subject assignment
- active student
- guardian if useful
- active class enrollment

#### Option B — Create a Local-Only Smoke Seed File

If seeding `auth.users` directly inside `supabase/seed.sql` is risky, create a separate local-only SQL file, for example:

```txt
supabase/smoke/phase_07_smoke_seed.sql
```

Then document how to apply it after local reset.

Example documentation target:

```txt
docs/supabase-local.md
```

Include commands such as:

```bash
supabase db reset
# then apply local smoke seed according to the available local database connection workflow
```

Do not include raw local Supabase service keys in docs.

#### Option C — Document Manual Data Setup

If neither A nor B is safe, document the exact manual setup steps and mark authenticated smoke as blocked until the dataset is prepared.

Do not fake passed tests.

---

## Smoke Data Requirements

The dataset should be minimal and deterministic.

### Required Local Smoke Users

At minimum, the project needs one local user able to log in and perform admin/school admin workflows.

Suggested local-only identity:

```txt
Email: admin@ofuq.local
Role: school_admin or system_admin
```

If a teacher workflow can be safely tested, add:

```txt
Email: teacher@ofuq.local
Role: teacher
```

Important rules:

- Do not commit production credentials.
- If a local password is documented, label it clearly as local-only demo data.
- Avoid real personal information.
- Do not expose Supabase service role keys.
- Make seed inserts idempotent where practical.

### Required Academic Smoke Data

Create or document data for:

```txt
Tenant: Ofuq Demo Tenant
School: Ofuq Demo School
Academic year: 2026-2027
Term: Term 1
Grade level: Grade 1
Class: Grade 1 / A
Subject: Mathematics
Grade-level subject assignment: Grade 1 + Mathematics
Student: Demo Student
Class enrollment: active enrollment for Demo Student in Grade 1 / A
```

Use Arabic names in user-facing fields where practical, while keeping technical identifiers stable.

### Optional Smoke Data

If useful and safe, add:

- one attendance session
- one attendance record
- one exam
- one exam result
- one grade entry
- one draft report card

However, prefer testing actions/UI to create these records instead of pre-seeding all workflow outputs.

---

## Auth Seeding Guidance

Supabase Auth users are sensitive and can be tricky to seed.

Before inserting into `auth.users` or `auth.identities`, inspect current project patterns and Supabase local behavior.

If direct auth seeding is implemented:

- Keep it local-only.
- Use deterministic UUIDs.
- Use a safe local-only password hash pattern compatible with Supabase local Auth.
- Make sure login works through the normal `/login` page.
- Do not store real secrets.
- Document that the credentials are for local smoke testing only.

If direct auth seeding is not safe:

- Do not force it.
- Document manual signup/user creation steps.
- Keep the final Go/No-Go honest.

---

## Required Verification Commands

Run these commands from the project root:

```bash
git status
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
npm run lint
npm run build
```

If a smoke seed file is separate from `supabase/seed.sql`, also run and document the command used to apply it.

If Windows/Docker requires elevation, report that clearly.

If `supabase db reset` has a transient container restart or upstream error, rerun it once if safe and document both attempts.

If `types/database.ts` changes only because of line endings or formatting, restore the file and document that no schema diff was kept.

Do not commit invalid generated types.

---

## Required Route Smoke Tests

If browser or HTTP route probing is available, verify:

```txt
/
/login
/dashboard
/dashboard/admissions
/dashboard/students
/dashboard/academic
/dashboard/academic/enrollments
/dashboard/attendance
/dashboard/attendance/sessions
/dashboard/attendance/sessions/new
/dashboard/attendance/excuses
/dashboard/grades
/dashboard/grades/exams
/dashboard/grades/exams/new
/dashboard/grades/entries
/dashboard/grades/report-cards
```

For each route, mark one of:

```txt
Passed
Failed
Blocked
Not tested
```

Protected routes may pass unauthenticated smoke by redirecting to `/login`, but authenticated rendering must not be marked as passed unless actually tested after login.

---

## Required Authenticated Workflow Smoke Tests

Authenticated end-to-end smoke testing may be blocked by missing local seed data. Do not mark browser workflows as passed unless actually tested.

### Auth + Access

- [ ] Login with local smoke admin/school admin user.
- [ ] Dashboard loads after login.
- [ ] Protected routes render authenticated dashboard shell.
- [ ] Sign out works.

### Attendance Workflow

- [ ] Create attendance session for the smoke class.
- [ ] Session appears in sessions list.
- [ ] Session details page opens.
- [ ] Enrolled smoke student appears in the session.
- [ ] Mark student `present` manually.
- [ ] Mark student `absent` manually.
- [ ] Mark student `late` manually.
- [ ] Re-recording same student/session does not create duplicates.
- [ ] Enter valid smoke student's QR token and record attendance.
- [ ] Invalid QR token returns a safe Arabic error.
- [ ] QR token for non-enrolled student is rejected if such data exists.
- [ ] Close the attendance session.
- [ ] Closed session rejects further attendance changes.

### Grades Workflow

- [ ] Create exam for the smoke class and subject.
- [ ] Exam appears in exams list.
- [ ] Exam details page opens.
- [ ] Smoke student appears for result entry.
- [ ] Save exam result for smoke student.
- [ ] Score above max score is rejected.
- [ ] Publish exam results as admin/school admin.
- [ ] Create non-exam grade entry.
- [ ] Invalid grade entry score is rejected.
- [ ] Generate report card for smoke student.
- [ ] Report card appears in report card list.
- [ ] Report card details page opens.
- [ ] Publish report card as admin/school admin.

If browser testing is blocked, record it honestly and do not mark these as passed.

---

## SQL Spot Checks

Run read-only SQL checks if SQL access is available.

Do not expose local service keys or secrets in docs.

Suggested checks:

```sql
select count(*) from public.user_profiles;
select count(*) from public.user_memberships;
select count(*) from public.students;
select count(*) from public.academic_years;
select count(*) from public.classes;
select count(*) from public.subjects;
select count(*) from public.grade_level_subjects;
select count(*) from public.class_enrollments;
select count(*) from public.attendance_sessions;
select count(*) from public.attendance_records;
select count(*) from public.exams;
select count(*) from public.exam_results;
select count(*) from public.grade_entries;
select count(*) from public.report_cards;
```

Duplicate/relationship checks:

```sql
select attendance_session_id, student_id, count(*)
from public.attendance_records
group by attendance_session_id, student_id
having count(*) > 1;

select exam_id, student_id, count(*)
from public.exam_results
group by exam_id, student_id
having count(*) > 1;

select ar.id
from public.attendance_records ar
left join public.class_enrollments ce on ce.id = ar.class_enrollment_id
where ce.id is null;

select er.id
from public.exam_results er
left join public.class_enrollments ce on ce.id = er.class_enrollment_id
where ce.id is null;
```

Expected duplicate/orphan results: zero rows.

---

## Required Document to Create

Create:

```txt
docs/verification-phase-07.md
```

Use this structure:

```md
# Phase 07 Verification Report

## Scope

## Environment

## Smoke Dataset Strategy

## Local Smoke Data

## Technical Verification Results

| Check | Command | Result | Notes |
| --- | --- | --- | --- |

## Route Smoke Test

| Route | Result | Notes |
| --- | --- | --- |

## Authenticated Workflow Smoke Test

### Auth and Access

### Attendance Workflow

### Grades Workflow

## SQL Spot Checks

## Findings

## Known Issues

## Deferred Items

## Go/No-Go Decision For Phase 08
```

Be honest. If something was blocked or not tested, mark it as `Blocked` or `Not tested`, not `Passed`.

---

## Documentation Updates

### `docs/project-status.md`

Update if needed:

- Fix stale limitation text.
- Remove or correct any statement such as:

```txt
No grades, exams, or report cards yet.
```

because Phase 07 has implemented grades/report-card foundation.

- Add `docs/verification-phase-07.md` to the documentation list.
- Update last completed quality phase if this phase completes:

```txt
07.5 Local Smoke Seed + Grades/Attendance Workflow Verification
```

- Keep current phase as:

```txt
Ready for 08 Manual Timetable with Conflict Prevention Foundation
```

unless blockers are found.

### `docs/requirements-roadmap.md`

Update only if inaccurate.

It should keep:

```txt
08 - Manual Timetable with Conflict Prevention Foundation
```

as the planned next phase if no blockers are found.

### `docs/supabase-local.md`

Update only if smoke seed instructions are added.

Include:

- how to reset local DB
- how smoke data is applied
- local-only credentials if applicable
- warning not to use local smoke credentials in production

### `docs/verification-report.md`

Optional: add a short pointer to `docs/verification-phase-07.md`.

Do not rewrite the old 05.5 report broadly.

---

## Git Rules

After verification:

1. Run `git status`.
2. Stage only relevant files.
3. Do not stage unrelated generated changes.
4. Do not stage invalid generated types.
5. Do not commit secrets.

Suggested commit message:

```txt
docs: add phase 07 smoke verification
```

If you add or update local smoke seed files, this commit message is also acceptable:

```txt
chore: add local smoke seed verification
```

---

## Success Criteria

This phase is successful when:

1. No product features are added.
2. No migrations are added or modified.
3. Schema is unchanged.
4. A repeatable local smoke dataset is created or clearly documented.
5. Phase 07 stale documentation is corrected.
6. Technical verification commands are run and documented.
7. Authenticated attendance workflow is tested or honestly marked blocked.
8. Authenticated grades workflow is tested or honestly marked blocked.
9. SQL spot checks are run if available.
10. `docs/verification-phase-07.md` exists.
11. Go/No-Go for Phase 08 is explicit.

---

## Final Response Required

When finished, respond with:

1. Summary of Phase 07.5 verification.
2. Files created/modified.
3. Local smoke dataset strategy.
4. Technical command results.
5. Authenticated attendance workflow smoke status.
6. Authenticated grades workflow smoke status.
7. SQL spot check results.
8. Any blockers or known issues.
9. Go/No-Go for Phase 08.
10. Suggested next prompt file name.

Suggested next prompt after successful verification:

```txt
prompts/codex_08_manual_timetable_conflict_prevention_prompt.md
```
