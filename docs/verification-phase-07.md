# Phase 07 Verification Report

## Scope

Phase 07.5 verified the local smoke-data gap for the Phase 06 attendance and
Phase 07 grades/report-card foundations. No product features, migrations, schema
changes, dependencies, or test frameworks were added.

## Environment

- Workspace: Windows PowerShell at `D:\ofuq\ofuq`
- Date: 2026-07-07
- Supabase CLI local stack: running after elevated Docker access
- Browser automation: blocked; no in-app browser backend was available
- Local app route probing: attempted with a temporary dev server
- Secrets: local Supabase keys were not documented

## Smoke Dataset Strategy

The project now uses Option A: `supabase/seed.sql` creates a deterministic local
smoke dataset during `supabase db reset`.

This is appropriate for the current repo because the existing seed was already
local demo data and `supabase/config.toml` applies `./seed.sql` automatically
after migration replay.

## Local Smoke Data

Local-only credentials:

| Email | Password | Role |
| --- | --- | --- |
| `admin@ofuq.local` | `OfuqLocal123!` | `school_admin` |
| `teacher@ofuq.local` | `OfuqLocal123!` | `teacher` |

Seeded records:

| Area | Seeded data |
| --- | --- |
| Tenant | `Ofuq Demo Tenant` / `ofuq-demo` |
| School | `مدرسة أفق التجريبية` / `ofuq-demo-school` |
| Academic year | `2026-2027` |
| Term | `الفصل الأول` |
| Grade level | `الصف الأول` |
| Class | `الصف الأول / أ` |
| Subject | `الرياضيات` |
| Grade-level subject | Grade 1 + Mathematics |
| Student | `طالب تجريبي` with deterministic QR token |
| Enrollment | Active enrollment in Grade 1 / A |

Attendance sessions, attendance records, exams, exam results, grade entries, and
report cards are intentionally not seeded so smoke tests can create workflow
outputs through the application.

## Technical Verification Results

| Check | Command | Result | Notes |
| --- | --- | --- | --- |
| Git status | `git -c safe.directory=D:/ofuq/ofuq status --short` | Passed | Showed only the current seed/documentation edits. |
| Supabase status | `supabase status` | Passed after elevation | Non-elevated run failed with Docker pipe access denied; elevated run confirmed local Supabase was running. Local keys were not copied into this report. |
| Supabase database reset | `supabase db reset` | Passed | Replayed all migrations and applied the new deterministic smoke seed. |
| Supabase type generation | `supabase gen types typescript --local > types/database.ts` | Passed | Type generation connected to the local DB. No schema diff was kept. |
| Generated type diff | `git diff -- types/database.ts` | Passed | No content diff remained; only line-ending warnings appeared. |
| Lint | `npm run lint` | Passed | ESLint completed successfully. |
| Build | `npm run build` | Passed | Production build completed and included all attendance and grades routes. |
| Auth seed structure | SQL check against `auth.users` and `auth.identities` | Passed | Both smoke users are confirmed, have matching password hashes, and have email identities. |
| Direct Auth API sign-in | Supabase JS with local publishable key | Not verified | Reached local Auth but returned an empty error object with the publishable key. The anon key was not available without another elevated `supabase status` lookup after the environment rejected further elevated metadata reads. |
| Browser automation | Browser runtime discovery | Blocked | Browser runtime loaded, but `agent.browsers.list()` returned `[]`. |
| Dev server route probe | `npm run dev -- --hostname 127.0.0.1 --port 3000` plus HTTP probes | Failed | Temporary server was launched with quoted Supabase env parsing, causing middleware `Invalid supabaseUrl` errors. A corrected rerun was blocked by the environment approval limit. |

## Route Smoke Test

Build verification confirms these route files compile. Runtime HTTP probes were
attempted but failed because the temporary dev server was launched with invalid
Supabase env parsing.

| Route | Result | Notes |
| --- | --- | --- |
| `/` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/login` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/admissions` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/students` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/academic` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/academic/enrollments` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/attendance` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/attendance/sessions` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/attendance/sessions/new` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/attendance/excuses` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/grades` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/grades/exams` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/grades/exams/new` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/grades/entries` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |
| `/dashboard/grades/report-cards` | Failed | HTTP probe returned 500 from invalid temporary env; build passed. |

## Authenticated Workflow Smoke Test

### Auth and Access

- [ ] Login with local smoke admin/school admin user. Result: Blocked for browser UI; browser backend unavailable.
- [ ] Dashboard loads after login. Result: Blocked for browser UI.
- [ ] Protected routes render authenticated dashboard shell. Result: Blocked for browser UI.
- [ ] Sign out works. Result: Blocked for browser UI.

Database-side auth seed sanity passed: both local smoke users exist in
`auth.users`, are email-confirmed, have compatible password hashes for
`OfuqLocal123!`, and have email identities.

### Attendance Workflow

- [ ] Create attendance session for the smoke class. Result: Blocked by unavailable browser UI.
- [ ] Session appears in sessions list. Result: Blocked.
- [ ] Session details page opens. Result: Blocked.
- [ ] Enrolled smoke student appears in the session. Result: Blocked.
- [ ] Mark student `present` manually. Result: Blocked.
- [ ] Mark student `absent` manually. Result: Blocked.
- [ ] Mark student `late` manually. Result: Blocked.
- [ ] Re-recording same student/session does not create duplicates. Result: Not tested through UI; duplicate SQL check returned zero rows in empty workflow tables.
- [ ] Enter valid smoke student's QR token and record attendance. Result: Blocked.
- [ ] Invalid QR token returns a safe Arabic error. Result: Blocked for UI; code inspection in Phase 06 showed Arabic error mapping.
- [ ] QR token for non-enrolled student is rejected if such data exists. Result: Not tested; no non-enrolled smoke student is seeded.
- [ ] Close the attendance session. Result: Blocked.
- [ ] Closed session rejects further attendance changes. Result: Blocked.

### Grades Workflow

- [ ] Create exam for the smoke class and subject. Result: Blocked by unavailable browser UI.
- [ ] Exam appears in exams list. Result: Blocked.
- [ ] Exam details page opens. Result: Blocked.
- [ ] Smoke student appears for result entry. Result: Blocked.
- [ ] Save exam result for smoke student. Result: Blocked.
- [ ] Score above max score is rejected. Result: Blocked.
- [ ] Publish exam results as admin/school admin. Result: Blocked.
- [ ] Create non-exam grade entry. Result: Blocked.
- [ ] Invalid grade entry score is rejected. Result: Blocked.
- [ ] Generate report card for smoke student. Result: Blocked.
- [ ] Report card appears in report card list. Result: Blocked.
- [ ] Report card details page opens. Result: Blocked.
- [ ] Publish report card as admin/school admin. Result: Blocked.

## SQL Spot Checks

Read-only SQL checks were run after `supabase db reset`.

| Check | Result | Notes |
| --- | --- | --- |
| `public.user_profiles` count | Passed | Returned `2`. |
| `public.user_memberships` count | Passed | Returned `2`. |
| `public.students` count | Passed | Returned `1`. |
| `public.academic_years` count | Passed | Returned `1`. |
| `public.classes` count | Passed | Returned `1`. |
| `public.subjects` count | Passed | Returned `1`. |
| `public.grade_level_subjects` count | Passed | Returned `1`. |
| `public.class_enrollments` count | Passed | Returned `1`. |
| `public.attendance_sessions` count | Passed | Returned `0`; intentionally unseeded workflow output. |
| `public.attendance_records` count | Passed | Returned `0`; intentionally unseeded workflow output. |
| `public.exams` count | Passed | Returned `0`; intentionally unseeded workflow output. |
| `public.exam_results` count | Passed | Returned `0`; intentionally unseeded workflow output. |
| `public.grade_entries` count | Passed | Returned `0`; intentionally unseeded workflow output. |
| `public.report_cards` count | Passed | Returned `0`; intentionally unseeded workflow output. |
| Duplicate attendance records per session/student | Passed | Returned zero rows. |
| Duplicate exam results per exam/student | Passed | Returned zero rows. |
| Attendance records without class enrollment | Passed | Returned zero rows. |
| Exam results without class enrollment | Passed | Returned zero rows. |

## Findings

- The repeatable local smoke-data gap is now addressed by `supabase/seed.sql`.
- The seed creates Auth users, profiles, active memberships, academic data, one
  active student, and one active class enrollment after `supabase db reset`.
- Migration replay and seed application pass from scratch.
- Generated types remain in sync with the local database.
- Lint and production build pass.
- Browser-authenticated workflow smoke testing remains blocked by the lack of a
  browser backend in this session.
- Runtime HTTP route probing failed because the temporary dev server was started
  with incorrectly parsed Supabase env values. The build still confirms the
  route tree compiles.

## Known Issues

- Browser automation was unavailable, so authenticated UI workflows were not
  executed.
- Corrected route probing could not be rerun after the environment rejected
  further dev-server/metadata commands due an approval/usage limit.
- Direct Auth API sign-in was not verified with the local anon key after that
  same approval/usage limit blocked another safe env lookup.
- Full RLS remains deferred by design.
- There is no automated workflow test suite beyond lint/build verification.

## Deferred Items

- Interactive browser smoke for authenticated attendance workflows.
- Interactive browser smoke for authenticated grades/report-card workflows.
- Camera-based QR scanner.
- Beacon attendance.
- Advanced grading policies, GPA/ranking, report-card PDF, and advanced analytics.
- Full RLS and full RBAC.

## Go/No-Go Decision For Phase 08

Go with caution for Phase 08.

The original blocker, missing repeatable local smoke data after
`supabase db reset`, is addressed. Supabase reset, type generation, lint, build,
and SQL smoke-data checks pass. The caution is that authenticated browser
workflow smoke tests still need to be run manually or in a session with an
available browser backend before treating attendance and grades as fully
end-to-end verified.
