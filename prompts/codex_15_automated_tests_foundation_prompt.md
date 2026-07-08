# Codex Execution Prompt — 15 Automated Tests Foundation

## Phase

`15 - Automated Tests Foundation`

## Role

You are Codex acting as a senior quality engineer and full-stack TypeScript test architect.

You are working on **Ofuq | أُفُق**, an Arabic-first multi-tenant school management system built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase CLI / PostgreSQL / Supabase Auth
- Server Components and Server Actions
- fixed roles through `user_memberships`
- tenant/school context derived from authenticated membership
- deterministic local Syrian demo dataset from Phase 14

This is a **quality foundation phase**.

It is not a feature phase.

Do not add new product features.

---

## Current Context

The project already has implementation slices for:

```txt
Auth + fixed roles
Students and admissions
Academic structure
Attendance
Grades and report cards
Manual timetable
Finance
Communication
Ready-made reports
Library
Student care
Complaints and surveys
Syrian local demo dataset
```

Phase 14 is closed and verified. The split Syrian demo seed architecture is working and verified through successful `supabase db reset`, SQL spot checks, and Auth token/default null checks.

Phase 15 must add an initial automated testing foundation so future work can be checked consistently.

---

## Main Goal

Add a minimal but useful automated test foundation covering:

1. Test framework setup.
2. Unit tests for stable pure logic and constants.
3. Route and navigation consistency tests.
4. Fixed-role sanity tests.
5. Validation/helper tests where existing pure functions/schemas allow it.
6. Database smoke SQL checks for the verified local demo seed.
7. Documentation for running tests locally.
8. Verification report updates.

Keep the scope small, safe, and incremental.

---

## Required Reading Before Editing

Before editing, inspect:

```txt
AGENTS.md
package.json
package-lock.json
docs/architecture.md
docs/codex-workflow.md
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/verification-report.md
docs/supabase-local.md
docs/phase-14-demo-seed-troubleshooting.md
constants/routes.ts
config/navigation.ts
lib/auth/session.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
types/database.ts
types/student-care.ts
types/feedback.ts
supabase/config.toml
supabase/seeds/auth_smoke_token_defaults.sql
```

Also inspect existing services/actions only when choosing a safe test target.

Do not introduce a parallel project structure.

---

## Strict Scope

### In Scope

You may:

```txt
install test dev dependencies
add Vitest configuration
add a test setup file
add unit tests for route constants/navigation/fixed roles/helpers
add database smoke SQL file for local demo seed checks
add docs/testing.md
update package.json scripts
update package-lock.json
update verification/project docs
run verification commands
```

### Out of Scope

Do not:

```txt
add new features
modify database schema
add migrations
modify old migrations
modify seed files unless a test-only documentation reference requires it
modify app routes or UI behavior
refactor large services/actions
add Playwright full E2E in this phase
add browser automation claims
add hosted Supabase dependencies
add CI/CD workflow unless explicitly minimal and requested
add RLS
add RBAC
change production behavior
```

Small refactors are allowed only if they extract pure testable constants/helpers without changing behavior.

Prefer tests that do not require refactoring.

---

## Recommended Test Stack

Use Vitest as the first test framework.

Recommended dev dependencies:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

If the project does not need React component tests in this phase, still keep setup simple and ready for later UI tests.

Do not add Playwright in Phase 15 unless explicitly justified and very small. Prefer deferring Playwright to a later phase.

---

## package.json Scripts

Add scripts similar to:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:unit": "vitest run tests/unit",
  "test:all": "npm run lint && npm run test && npm run build"
}
```

Keep existing scripts unchanged:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

Do not add a brittle `test:db` script unless you can make it portable and reliable across Windows/PowerShell/local Docker.

Prefer documenting DB smoke execution in `docs/testing.md` for now.

---

## Files to Add

Recommended new files:

```txt
vitest.config.ts
tests/setup.ts
tests/unit/routes.test.ts
tests/unit/navigation.test.ts
tests/unit/roles.test.ts
tests/db/local-demo-smoke.sql
docs/testing.md
```

Optional only if useful:

```txt
tests/unit/action-result.test.ts
tests/unit/validation.test.ts
```

Do not add excessive test files in this phase.

---

## Unit Test Targets

### 1. Routes

Create:

```txt
tests/unit/routes.test.ts
```

Test route constants/helpers from:

```txt
constants/routes.ts
```

Check that important implemented modules have stable non-empty routes:

```txt
/dashboard
/dashboard/students
/dashboard/academic
/dashboard/attendance
/dashboard/grades
/dashboard/timetable
/dashboard/finance
/dashboard/communication
/dashboard/reports
/dashboard/library
/dashboard/student-care
/dashboard/feedback
```

If routes are functions, test with safe dummy IDs.

Avoid snapshot-heavy tests.

---

### 2. Navigation

Create:

```txt
tests/unit/navigation.test.ts
```

Test:

```txt
navigation items have non-empty Arabic labels
navigation items have non-empty hrefs
no duplicate hrefs among active navigation entries
implemented modules are represented where expected
future placeholder modules are not incorrectly activated
```

Use the actual `config/navigation.ts` shape.

Do not rewrite navigation just to make tests pass.

---

### 3. Fixed Roles

Create:

```txt
tests/unit/roles.test.ts
```

Test that the fixed role set used by the project contains or supports:

```txt
system_admin
school_admin
teacher
parent
student
accountant
librarian
```

Do not add RBAC.

If roles are not exported as a constant, test the safest existing role-related helpers or exported role arrays. If no safe export exists, create a tiny pure constant only if it does not change runtime behavior.

---

### 4. Validation / Helpers

Add only a small number of tests for already-existing pure logic.

Good candidates:

```txt
route helper functions
status display helpers
amount/number formatting helpers
simple Zod schemas if exported and not tied to Server Actions
```

Avoid testing Server Actions directly in Phase 15 if they depend heavily on request/session/Supabase runtime.

Do not introduce complex mocks for Supabase yet.

---

## Database Smoke SQL

Create:

```txt
tests/db/local-demo-smoke.sql
```

This file should contain SQL checks that can be run manually after:

```bash
supabase db reset
```

The SQL file should be readable and grouped into sections.

### Required Checks

Auth users:

```sql
select email
from auth.users
where email like '%@ofuq.local'
order by email;
```

Auth token null safety:

```sql
select count(*) as users_with_null_token_fields
from auth.users
where email like '%@ofuq.local'
  and (
    confirmation_token is null
    or recovery_token is null
    or email_change_token_new is null
    or email_change_token_current is null
    or email_change is null
    or phone_change_token is null
    or phone_change is null
    or reauthentication_token is null
  );
```

Expected:

```txt
0
```

Core counts:

```sql
select 'user_profiles' as table_name, count(*) from public.user_profiles
union all select 'user_memberships', count(*) from public.user_memberships
union all select 'grade_levels', count(*) from public.grade_levels
union all select 'classes', count(*) from public.classes
union all select 'subjects', count(*) from public.subjects
union all select 'students', count(*) from public.students
union all select 'student_guardians', count(*) from public.student_guardians
union all select 'class_enrollments', count(*) from public.class_enrollments;
```

Module coverage counts:

```sql
select 'attendance_sessions' as table_name, count(*) from public.attendance_sessions
union all select 'attendance_records', count(*) from public.attendance_records
union all select 'exams', count(*) from public.exams
union all select 'exam_results', count(*) from public.exam_results
union all select 'timetable_slots', count(*) from public.timetable_slots
union all select 'invoices', count(*) from public.invoices
union all select 'payments', count(*) from public.payments
union all select 'messages', count(*) from public.messages
union all select 'book_loans', count(*) from public.book_loans
union all select 'health_records', count(*) from public.health_records
union all select 'complaints', count(*) from public.complaints
union all select 'surveys', count(*) from public.surveys
union all select 'survey_responses', count(*) from public.survey_responses;
```

Relationship sanity checks:

```sql
select count(*) as orphan_class_enrollments
from public.class_enrollments ce
left join public.students s on s.id = ce.student_id
where s.id is null;

select count(*) as orphan_attendance_records
from public.attendance_records ar
left join public.students s on s.id = ar.student_id
where s.id is null;

select count(*) as orphan_exam_results
from public.exam_results er
left join public.students s on s.id = er.student_id
where s.id is null;

select copy_id, count(*)
from public.book_loans
where status = 'active'
group by copy_id
having count(*) > 1;

select survey_id, respondent_user_id, count(*)
from public.survey_responses
group by survey_id, respondent_user_id
having count(*) > 1;

select student_id, count(*)
from public.health_records
where status = 'active'
group by student_id
having count(*) > 1;
```

Document expected results in SQL comments.

Do not make the SQL file destructive.

Do not mutate data in `tests/db/local-demo-smoke.sql`.

---

## docs/testing.md

Create:

```txt
docs/testing.md
```

Document:

```txt
how to run unit tests
how to run all local quality checks
how to run database smoke checks after supabase db reset
what is currently covered
what is intentionally deferred
browser smoke is not automated yet
Playwright/E2E is deferred
```

Include commands:

```bash
npm run test
npm run test:watch
npm run test:unit
npm run test:all
supabase db reset
```

For DB SQL smoke, document a Windows/PowerShell-friendly example using Docker `psql` if that is the pattern already used in docs:

```powershell
$dbContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db*" } | Select-Object -First 1
Get-Content tests/db/local-demo-smoke.sql | docker exec -i $dbContainer psql -U postgres -d postgres
```

Make clear that DB smoke assumes local Supabase is running and seeded.

---

## Documentation Updates

Update:

```txt
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/verification-report.md
```

Add references to:

```txt
docs/testing.md
tests/db/local-demo-smoke.sql
Vitest foundation
Phase 15 status
```

Do not mark Phase 15 as Done until verification commands pass.

---

## Verification Commands

After implementation, run:

```bash
npm run test
npm run lint
npm run build
git diff --check
```

Also run:

```bash
npm run test:all
```

For DB smoke, run:

```bash
supabase status
supabase db reset
```

Then run the SQL smoke file according to `docs/testing.md`.

If DB smoke cannot be run because Docker/Supabase is unavailable, document it honestly as not performed and do not claim DB smoke passed.

---

## Expected Test Results

Unit tests should pass.

Lint should pass.

Build should pass.

Diff check should pass.

DB smoke should pass if local Supabase is available.

Browser smoke remains not performed unless actually done.

Do not claim Playwright/E2E coverage.

---

## Commit Rules

Stage only Phase 15 test foundation and documentation files.

Expected files may include:

```txt
package.json
package-lock.json
vitest.config.ts
tests/setup.ts
tests/unit/routes.test.ts
tests/unit/navigation.test.ts
tests/unit/roles.test.ts
tests/db/local-demo-smoke.sql
docs/testing.md
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/verification-report.md
```

Optional only if deliberately added:

```txt
tests/unit/action-result.test.ts
tests/unit/validation.test.ts
```

Before commit, run:

```bash
git diff --cached --name-only
git diff --cached --stat
git diff --check --cached
```

Suggested commit message:

```txt
test: add automated tests foundation
```

Do not commit if:

```txt
unit tests fail
lint fails
build fails
diff check fails
unrelated files are staged
Phase 16 or future feature files are staged
```

---

## Expected Final Response

After implementation, report:

1. Git status at start.
2. Test dependencies added.
3. Scripts added.
4. Test config files added.
5. Unit tests added and what they cover.
6. DB smoke SQL file added and what it checks.
7. Docs updated.
8. Verification results for `npm run test`.
9. Verification results for `npm run test:all`.
10. Supabase reset and DB smoke status.
11. Lint/build/diff check results.
12. Browser smoke status.
13. Commit hash if committed.
14. Final Go/No-Go for the next phase.

---

## Success Criteria

Phase 15 succeeds only when:

- Vitest test foundation is configured.
- `npm run test` passes.
- `npm run test:all` passes.
- Route/navigation/role unit tests exist and pass.
- DB smoke SQL file exists and is documented.
- No schema or migrations are changed.
- No application feature behavior is changed.
- `npm run lint` passes.
- `npm run build` passes.
- `git diff --check` passes.
- Docs explain how to run tests.
- Verification report is updated honestly.
- Browser smoke is not falsely claimed.

---

## Suggested Next Phase After Successful Completion

After Phase 15 is verified and committed, plan the next phase separately.

Potential next phase options:

```txt
16 - Parent and Student Read-Only Portal Foundation
or
16 - Settings and Integrations Placeholders Foundation
or
16 - Browser Smoke / E2E Tests Foundation
```

Do not start the next phase in this prompt.
