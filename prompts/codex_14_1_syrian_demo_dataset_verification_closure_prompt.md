# Codex Execution Prompt — 14.1 Syrian Demo Dataset Verification Closure

## Phase

`14.1 - Syrian Demo Dataset Verification Closure`

## Role

You are Codex acting as a senior database verification engineer and release-closure maintainer.

You are working on **Ofuq | أُفُق**, an Arabic-first multi-tenant school management system using Next.js, TypeScript, Supabase Auth, Supabase PostgreSQL, local Supabase CLI, fixed roles, and server-side tenant/school membership context.

This task is a **verification closure** for Phase 14 only.

It is not a new feature phase.

Do not start automated tests.

---

## Current Context

Phase 14 added a local Syrian demo dataset seed, but verification was not completed because the elevated `supabase db reset` command was blocked by an external session usage limit.

Reported current state:

```txt
Phase 14 = implemented locally
Phase 14 = not fully verified
Phase 14 = not committed
Phase 15 Automated Tests = No-Go until this closure passes
```

Known Phase 14 changes:

```txt
supabase/seeds/local_syrian_demo_data.sql
supabase/config.toml
supabase/seeds/auth_smoke_token_defaults.sql
docs/supabase-local.md
docs/project-status.md
docs/requirements-roadmap.md
docs/verification-report.md
```

Optional documentation change may include:

```txt
docs/database.md
```

---

## Main Goal

Complete verification for the local Syrian demo dataset.

Specifically:

1. Confirm the working tree contains only expected Phase 14 seed/docs changes.
2. Run `supabase db reset` successfully.
3. Run required SQL spot checks.
4. Verify all `@ofuq.local` users have non-null token/default fields where checked.
5. Verify the demo dataset covers implemented modules.
6. Run lint, build, and diff checks.
7. Update verification documentation from pending to passed.
8. Commit Phase 14 only if verification succeeds.
9. Report final Go/No-Go for Phase 15 Automated Tests Foundation.

---

## Strict Scope

### In Scope

You may:

```txt
inspect Phase 14 seed files
run Supabase reset and SQL checks
make minimal fixes to Phase 14 seed files if reset fails because of seed SQL/data issues
make minimal fixes to auth token safety seed if token checks fail
update Phase 14 verification documentation
commit Phase 14 seed/docs changes after successful verification
```

Expected files that may be changed:

```txt
supabase/seeds/local_syrian_demo_data.sql
supabase/seeds/auth_smoke_token_defaults.sql
supabase/config.toml
docs/supabase-local.md
docs/project-status.md
docs/requirements-roadmap.md
docs/verification-report.md
```

Optional only if already changed or obviously needed:

```txt
docs/database.md
```

### Out of Scope

Do not:

```txt
add new migrations
modify old migrations
modify application code
modify UI
modify routes/navigation
modify services/actions
modify generated types unless explicitly justified by a real schema-related issue
start Phase 15 tests
add automated tests
add new features
add RBAC
add RLS
change production behavior
commit unrelated files
commit Phase 13 implementation files if somehow still present
```

---

## Required Reading Before Editing

Read these first:

```txt
supabase/config.toml
supabase/seed.sql
supabase/seeds/local_syrian_demo_data.sql
supabase/seeds/auth_smoke_token_defaults.sql
docs/supabase-local.md
docs/project-status.md
docs/requirements-roadmap.md
docs/verification-report.md
```

If present, also read:

```txt
docs/database.md
```

---

## Step 1 — Inspect Git Status

Run:

```bash
git status --short
```

If Windows ownership requires a safe directory override, use:

```bash
git -c safe.directory=D:/ofuq/ofuq status --short
```

Expected uncommitted files should be limited to Phase 14 seed/docs files.

If unrelated files are present, stop and report them.

Do not stage or overwrite unrelated files.

---

## Step 2 — Verify Seed Order

Open:

```txt
supabase/config.toml
```

Confirm seed order is exactly:

```toml
sql_paths = [
  "./seed.sql",
  "./seeds/local_syrian_demo_data.sql",
  "./seeds/auth_smoke_token_defaults.sql"
]
```

Critical rule:

```txt
auth_smoke_token_defaults.sql must remain the final seed file.
```

If the order is wrong, fix it before reset.

---

## Step 3 — Verify Auth Token Safety Seed

Open:

```txt
supabase/seeds/auth_smoke_token_defaults.sql
```

Confirm it targets all local demo users, not only the original smoke users.

Preferred filter:

```sql
where email like '%@ofuq.local'
```

It must:

```txt
set token/default fields to non-null values where those columns exist
confirm local emails if needed
preserve support for admin@ofuq.local and teacher@ofuq.local
run safely after local_syrian_demo_data.sql
```

Do not remove the dynamic column-existence checks.

---

## Step 4 — Run Supabase Reset

Run:

```bash
supabase status
supabase db reset
```

If Docker/Supabase needs elevated permissions, use the same elevated workflow used in earlier phases.

If `supabase db reset` fails:

1. Capture the first meaningful SQL error.
2. Identify whether the failure is caused by `local_syrian_demo_data.sql` or token-default seed logic.
3. Make only minimal Phase 14 seed fixes.
4. Re-run `supabase db reset`.
5. Do not hide or skip errors.
6. Do not commit until reset passes.

If reset fails because of environment permissions or external usage limits, report No-Go and stop.

---

## Step 5 — SQL Spot Checks

After reset passes, run all checks below.

Use the local database connection method already used in this project.

### 5.1 Auth users list

```sql
select email
from auth.users
where email like '%@ofuq.local'
order by email;
```

Expected:

```txt
All original and demo local accounts appear.
```

At minimum, confirm these exist:

```txt
admin@ofuq.local
teacher@ofuq.local
system.admin@ofuq.local
school.admin@ofuq.local
teacher.arabic@ofuq.local
teacher.math@ofuq.local
teacher.science@ofuq.local
teacher.english@ofuq.local
teacher.physics@ofuq.local
teacher.social@ofuq.local
accountant@ofuq.local
librarian@ofuq.local
parent.hassan@ofuq.local
parent.rana@ofuq.local
student.youssef@ofuq.local
student.lana@ofuq.local
```

### 5.2 Auth token null safety

Run this query if all columns exist:

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

If a column does not exist in the current local GoTrue schema, adapt the check safely and document which columns were checked.

Do not mark auth token safety as passed unless the count is `0` for checked token fields.

### 5.3 Core counts

Run:

```sql
select count(*) from public.user_profiles;
select count(*) from public.user_memberships;
select count(*) from public.grade_levels;
select count(*) from public.classes;
select count(*) from public.subjects;
select count(*) from public.students;
select count(*) from public.student_guardians;
select count(*) from public.class_enrollments;
```

Expected minimums:

```txt
user_profiles >= 16
user_memberships >= 16
grade_levels >= 12
classes >= 18
subjects >= 16
students >= 24
student_guardians >= 24
class_enrollments >= 24
```

If counts differ because existing smoke rows are also present, that is acceptable as long as they are not lower than the intended demo coverage.

### 5.4 Module coverage counts

Run:

```sql
select count(*) from public.attendance_sessions;
select count(*) from public.attendance_records;
select count(*) from public.exams;
select count(*) from public.exam_results;
select count(*) from public.timetable_slots;
select count(*) from public.invoices;
select count(*) from public.payments;
select count(*) from public.messages;
select count(*) from public.book_loans;
select count(*) from public.health_records;
select count(*) from public.complaints;
select count(*) from public.surveys;
select count(*) from public.survey_responses;
```

Expected:

```txt
all counts > 0
```

### 5.5 Relationship sanity checks

Run:

```sql
select count(*) as orphan_class_enrollments
from public.class_enrollments ce
left join public.students s on s.id = ce.student_id
where s.id is null;
```

Expected:

```txt
0
```

Run:

```sql
select count(*) as orphan_attendance_records
from public.attendance_records ar
left join public.students s on s.id = ar.student_id
where s.id is null;
```

Expected:

```txt
0
```

Run:

```sql
select count(*) as orphan_exam_results
from public.exam_results er
left join public.students s on s.id = er.student_id
where s.id is null;
```

Expected:

```txt
0
```

Run:

```sql
select copy_id, count(*)
from public.book_loans
where status = 'active'
group by copy_id
having count(*) > 1;
```

Expected:

```txt
0 rows
```

Run:

```sql
select survey_id, respondent_user_id, count(*)
from public.survey_responses
group by survey_id, respondent_user_id
having count(*) > 1;
```

Expected:

```txt
0 rows
```

Run:

```sql
select student_id, count(*)
from public.health_records
where status = 'active'
group by student_id
having count(*) > 1;
```

Expected:

```txt
0 rows
```

---

## Step 6 — App Verification Commands

Run:

```bash
npm run lint
npm run build
git diff --check
```

If Windows line-ending warnings appear but exit code is 0, document them as warnings only.

Do not mark passed if the command exits non-zero.

---

## Step 7 — Optional Type Generation

This phase should not change schema.

Do not regenerate `types/database.ts` unless necessary.

If you run:

```bash
supabase gen types typescript --local > types/database.ts
```

only keep the resulting diff if it is a real useful change.

Do not commit line-ending-only type changes.

---

## Step 8 — Documentation Update

Update verification docs from pending to passed only after reset and SQL checks pass.

Update:

```txt
docs/verification-report.md
docs/project-status.md
docs/requirements-roadmap.md
docs/supabase-local.md
```

Optional:

```txt
docs/database.md
```

Documentation must clearly mention:

```txt
supabase db reset passed
SQL spot checks passed
auth token null check returned 0
local Syrian demo dataset is verified
browser smoke was not performed unless actually tested
Phase 15 Automated Tests Foundation is Go after Phase 14 closure
```

Do not claim browser smoke passed unless it was actually performed.

---

## Step 9 — Commit Rules

Commit only after all required verification passes.

Stage only Phase 14 files.

Expected files:

```txt
supabase/seeds/local_syrian_demo_data.sql
supabase/seeds/auth_smoke_token_defaults.sql
supabase/config.toml
docs/supabase-local.md
docs/project-status.md
docs/requirements-roadmap.md
docs/verification-report.md
```

Optional:

```txt
docs/database.md
```

Before commit, run:

```bash
git diff --cached --name-only
git diff --cached --stat
git diff --check --cached
```

If using safe-directory override:

```bash
git -c safe.directory=D:/ofuq/ofuq diff --check --cached
```

Suggested commit message:

```txt
chore: add verified syrian demo dataset seed
```

Do not commit if:

```txt
supabase db reset failed
SQL spot checks were not run
auth token null check was not run or did not return 0
unrelated files are staged
Phase 13 implementation files are staged
```

---

## Manual Browser Smoke

Browser smoke is optional.

If browser access is available, test login with:

```txt
system.admin@ofuq.local
school.admin@ofuq.local
teacher.arabic@ofuq.local
accountant@ofuq.local
librarian@ofuq.local
parent.hassan@ofuq.local
student.youssef@ofuq.local
```

Shared password:

```txt
OfuqLocal123!
```

Open major dashboards where role access allows:

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

If browser smoke is not performed, document:

```txt
Browser smoke: not performed, not claimed as passed.
```

---

## Expected Final Response

Report:

1. Initial git status.
2. Seed order status.
3. Auth token safety seed status.
4. `supabase status` result.
5. `supabase db reset` result.
6. Any seed fixes made, if any.
7. Auth users list summary.
8. Auth token null check result.
9. Core count results.
10. Module coverage count results.
11. Relationship sanity check results.
12. Lint/build/diff-check results.
13. Browser smoke status.
14. Documentation updates.
15. Files staged and committed.
16. Commit hash if committed.
17. Final Go/No-Go for Phase 15 Automated Tests Foundation.

---

## Success Criteria

Phase 14.1 succeeds only when:

```txt
supabase db reset passes
all required SQL spot checks pass
auth token null check returns 0 for checked columns
local demo users exist
module coverage counts are non-zero where expected
relationship sanity checks return 0 or 0 rows as expected
lint passes
build passes
diff check passes
docs are updated
Phase 14 is committed cleanly
browser smoke is not falsely claimed
```

Final state after success:

```txt
Phase 14 = Done
Syrian Demo Dataset = Verified + Committed
Phase 15 Automated Tests Foundation = Go
```

If any required verification remains blocked:

```txt
Phase 14 = No-Go
Phase 15 = No-Go
```

Report the exact blocker.
