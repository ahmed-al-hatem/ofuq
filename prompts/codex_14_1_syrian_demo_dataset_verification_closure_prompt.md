# Codex Execution Prompt — 14.1 Syrian Demo Dataset Verification Closure

## Phase

`14.1 - Syrian Demo Dataset Verification Closure`

## Role

You are Codex acting as a senior database verification engineer and release-closure maintainer.

You are working on **Ofuq | أُفُق**, an Arabic-first multi-tenant school management system using Next.js, TypeScript, Supabase Auth, Supabase PostgreSQL, local Supabase CLI, fixed roles, and server-side tenant/school membership context.

This task is a **verification and documentation closure** for Phase 14 only.

It is not a feature phase.

Do not start automated tests.

---

## Current Context

Phase 14 added a deterministic local Syrian demo dataset.

The original single-file seed approach was stabilized by splitting the demo seed into ordered helper, staging, apply, and cleanup files. The seed has been reported as working successfully after this split.

The purpose of this prompt is now to **close Phase 14 cleanly**:

1. Confirm the current split seed structure is in place.
2. Confirm `supabase db reset` has passed or re-run it if needed.
3. Confirm required SQL spot checks have passed or re-run them if needed.
4. Confirm Auth token/default safety for all `@ofuq.local` users.
5. Update documentation from `In Progress` / `Blocked` / `Pending` to `Done` / `Passed` if verification is already successful.
6. Commit only the Phase 14 closure documentation or minimal seed/config fixes if needed.
7. Report final Go/No-Go for `15 - Automated Tests Foundation`.

---

## Important Current Seed Architecture

The final Phase 14 seed architecture must use this split-file structure:

```txt
supabase/seeds/local_syrian_demo_00_helpers.sql
supabase/seeds/local_syrian_demo_01_create_stage_tables.sql
supabase/seeds/local_syrian_demo_02_stage_data.sql
supabase/seeds/local_syrian_demo_03_apply.sql
supabase/seeds/local_syrian_demo_04_cleanup.sql
supabase/seeds/auth_smoke_token_defaults.sql
```

Do **not** revert to the old single-file design.

Do **not** reintroduce these old files into `sql_paths`:

```txt
./seeds/local_syrian_demo_data.sql
./seeds/local_syrian_demo_01_stage.sql
./seeds/local_syrian_demo_02_apply.sql
./seeds/local_syrian_demo_03_cleanup.sql
```

The troubleshooting document explains why: Supabase CLI seed batching can fail when a large seed file creates a relation and uses it later inside the same seed file.

Practical rule:

```txt
Do not create a relation and use it later inside the same large seed file.
```

---

## Required Reading Before Editing

Read these first:

```txt
supabase/config.toml
supabase/seed.sql
supabase/seeds/local_syrian_demo_00_helpers.sql
supabase/seeds/local_syrian_demo_01_create_stage_tables.sql
supabase/seeds/local_syrian_demo_02_stage_data.sql
supabase/seeds/local_syrian_demo_03_apply.sql
supabase/seeds/local_syrian_demo_04_cleanup.sql
supabase/seeds/auth_smoke_token_defaults.sql
docs/phase-14-demo-seed-troubleshooting.md
docs/supabase-local.md
docs/project-status.md
docs/requirements-roadmap.md
docs/verification-report.md
```

Optional if already changed or useful for consistency:

```txt
docs/database.md
```

---

## Strict Scope

### In Scope

You may:

```txt
inspect Phase 14 split seed files
inspect docs for stale pending/blocked status
run or confirm Supabase reset and SQL checks
make minimal seed/config fixes only if verification proves they are still needed
update Phase 14 documentation from pending to passed when justified
commit the Phase 14 closure changes
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
modify generated types unless a real schema-related issue requires it
start Phase 15 tests
add automated tests
add new features
add RBAC
add RLS
change production behavior
replace the split seed architecture with a single file
commit unrelated files
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

Expected state:

- Either clean working tree after the seed-stabilization commit.
- Or only Phase 14 docs/seed/config closure files changed.

If unrelated files are present, stop and report them.

Do not stage unrelated files.

---

## Step 2 — Verify Current Seed Order

Open:

```txt
supabase/config.toml
```

Confirm seed order is exactly:

```toml
[db.seed]
enabled = true
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

Critical rule:

```txt
auth_smoke_token_defaults.sql must remain the final seed file.
```

If the order is already correct, do not modify it.

---

## Step 3 — Verify Auth Token Safety Seed

Open:

```txt
supabase/seeds/auth_smoke_token_defaults.sql
```

Confirm it targets all local demo users, not only the original two smoke users.

Preferred filter:

```sql
where email like '%@ofuq.local'
```

It must:

```txt
set token/default fields to non-null values where those columns exist
confirm local emails if needed
preserve support for admin@ofuq.local and teacher@ofuq.local
run safely after all demo users are created
```

Do not remove dynamic column-existence checks.

---

## Step 4 — Confirm or Run Supabase Reset

If `supabase db reset` has already been successfully run after the split seed fix, capture the exact reported result and continue to SQL checks.

Otherwise run:

```bash
supabase status
supabase db reset
```

If Docker/Supabase needs elevated permissions, use the same elevated workflow used in earlier phases.

If `supabase db reset` fails:

1. Capture the first meaningful SQL error.
2. Identify whether the failure is caused by one of the split seed files or token-default seed logic.
3. Make only minimal Phase 14 seed/config fixes.
4. Re-run `supabase db reset`.
5. Do not hide or skip errors.
6. Do not mark Phase 14 as closed until reset passes.

If reset passes, proceed to SQL checks.

---

## Step 5 — Required SQL Spot Checks

After reset passes, run these checks.

Use the local database connection method already used in this project.

### 5.1 Auth users list

```sql
select email
from auth.users
where email like '%@ofuq.local'
order by email;
```

At minimum, confirm these accounts exist:

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

Do not mark auth token safety as passed unless the checked count is `0`.

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

Higher counts are acceptable because the original smoke seed also runs.

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

## Step 8 — Documentation Closure

After reset and SQL checks pass, update docs from pending/in-progress to passed/done.

Update:

```txt
docs/verification-report.md
docs/project-status.md
docs/requirements-roadmap.md
docs/supabase-local.md
```

Optional if needed:

```txt
docs/database.md
```

Also preserve:

```txt
docs/phase-14-demo-seed-troubleshooting.md
```

Documentation must clearly mention:

```txt
supabase db reset passed with the split seed architecture
SQL spot checks passed
auth token null check returned 0
local Syrian demo dataset is verified
browser smoke was not performed unless actually tested
Phase 15 Automated Tests Foundation is Go after Phase 14 closure
```

Do not claim browser smoke passed unless it was actually performed.

---

## Step 9 — Commit Rules

Commit only after required verification passes.

Stage only Phase 14 closure files.

Expected files may include:

```txt
supabase/config.toml
supabase/seeds/local_syrian_demo_00_helpers.sql
supabase/seeds/local_syrian_demo_01_create_stage_tables.sql
supabase/seeds/local_syrian_demo_02_stage_data.sql
supabase/seeds/local_syrian_demo_03_apply.sql
supabase/seeds/local_syrian_demo_04_cleanup.sql
supabase/seeds/auth_smoke_token_defaults.sql
docs/phase-14-demo-seed-troubleshooting.md
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

Suggested commit message if only docs are updated:

```txt
docs: close syrian demo dataset verification
```

Suggested commit message if seed stabilization files are included:

```txt
chore: stabilize syrian demo seed dataset
```

Do not commit if:

```txt
supabase db reset failed
SQL spot checks were not run
auth token null check was not run or did not return 0
unrelated files are staged
Phase 15 test files are staged
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

Open major dashboards where role access allows it:

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

If browser smoke is not performed, document it honestly as not performed.

---

## Final Response Requirements

Report:

1. Git status at start.
2. Seed order confirmation.
3. Confirmation that the split seed architecture is preserved.
4. Whether `supabase db reset` passed.
5. Auth user/account check results.
6. Auth token null check result.
7. Core count results.
8. Module coverage count results.
9. Relationship sanity check results.
10. Lint/build/diff results.
11. Browser smoke status.
12. Docs updated.
13. Commit hash if committed.
14. Final Go/No-Go for `15 - Automated Tests Foundation`.

---

## Success Criteria

Phase 14.1 succeeds only when:

- The split seed architecture is preserved.
- `auth_smoke_token_defaults.sql` remains the final seed file.
- `supabase db reset` passes.
- All required SQL spot checks pass.
- Auth token null check returns `0` for checked fields.
- Core demo data counts meet minimum expected coverage.
- Module coverage counts are greater than `0`.
- Relationship sanity checks pass.
- `npm run lint` passes.
- `npm run build` passes.
- `git diff --check` passes.
- Docs are updated from Phase 14 pending/in-progress to done/passed.
- Browser smoke is not falsely claimed.

---

## Suggested Next Phase After Successful Completion

After Phase 14.1 is verified and committed, the next phase is:

```txt
15 - Automated Tests Foundation
```

Do not start tests in this prompt.
