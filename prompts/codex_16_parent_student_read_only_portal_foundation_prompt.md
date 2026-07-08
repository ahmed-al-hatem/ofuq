# Codex Execution Prompt — 16 Parent and Student Read-Only Portal Foundation

## Phase

`16 - Parent and Student Read-Only Portal Foundation`

## Role

You are Codex acting as a senior full-stack engineer and security-focused product engineer.

You are working on **Ofuq | أُفُق**, an Arabic-first multi-tenant school management system built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style components / Base UI where applicable
- Supabase CLI / PostgreSQL / Supabase Auth
- Server Components and Server Actions
- fixed roles through `user_memberships`
- tenant/school context derived from authenticated active membership
- deterministic local Syrian demo dataset from Phase 14
- Vitest automated test foundation from Phase 15

This phase adds a **read-only parent/student portal foundation**.

It is an implementation phase, but it must remain limited and safe.

---

## Current Context

The project already has foundations for:

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
Automated test foundation
```

Phase 15 is closed and verified. Vitest and a manual DB smoke SQL workflow exist.

The fixed roles are:

```txt
system_admin
school_admin
teacher
parent
student
accountant
librarian
```

This phase should enable authenticated users with the `parent` or `student` role to view permitted student-related data in a separate portal area.

---

## Main Goal

Create a protected, Arabic RTL, read-only portal at:

```txt
/portal
```

For:

```txt
parent
student
```

The portal must show only data the authenticated user is allowed to see.

Parent access is based on:

```txt
student_guardians.guardian_user_id = current user profile id
```

Student access requires adding a minimal safe identity link:

```txt
students.student_user_id = current user profile id
```

Do not rely on email matching or display-name matching for access control.

---

## Critical Security Rules

All portal data must be scoped server-side by:

```txt
authenticated user
active membership
tenant_id
school_id
role
linked student ids
```

Never trust client-submitted:

```txt
tenant_id
school_id
role
user_id
guardian_user_id
student_user_id
student_id
```

All portal pages must derive access through server-side helpers.

The portal must not expose students outside the authenticated user's allowed set.

No page may query by `studentId` without verifying that the student belongs to the current portal context.

---

## Strict Read-Only Scope

### In Scope

You may add:

```txt
minimal schema link for student users
portal routes and layout
portal read-only pages
server-side portal context helpers
server-side read services
portal-specific navigation
portal routes constants
portal types
Vitest tests for portal routes/access/navigation
DB smoke SQL checks for parent/student links
docs and verification updates
```

### Out of Scope

Do not add:

```txt
absence excuse submission
payments or payment provider integration
manual payment from parent portal
complaint submission from parent/student portal
survey response from parent/student portal
parent/student messaging
profile editing
document upload/download
medical details beyond safe non-sensitive summary if already exposed elsewhere
health/discipline details
PDF generation
Playwright/E2E automation
full RBAC
RLS
external notifications
AI features
new communication providers
admin preview mode
```

Do not change existing admin dashboard behavior except where route constants/navigation tests require harmless additions.

---

## Required Reading Before Editing

Read these first:

```txt
AGENTS.md
package.json
docs/architecture.md
docs/codex-workflow.md
docs/database.md
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/security-model.md
docs/supabase-local.md
docs/testing.md
docs/verification-report.md
constants/routes.ts
constants/roles.ts
config/navigation.ts
lib/auth/session.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
types/database.ts
tests/db/local-demo-smoke.sql
supabase/config.toml
supabase/seed.sql
supabase/seeds/local_syrian_demo_00_helpers.sql
supabase/seeds/local_syrian_demo_01_create_stage_tables.sql
supabase/seeds/local_syrian_demo_02_stage_data.sql
supabase/seeds/local_syrian_demo_03_apply.sql
supabase/seeds/local_syrian_demo_04_cleanup.sql
supabase/seeds/auth_smoke_token_defaults.sql
```

Inspect relevant migrations for actual table columns and enum values before writing queries.

Do not guess schema fields.

---

## Precondition

Before implementation, run:

```bash
git status --short
```

If Windows safe-directory protection applies, use:

```bash
git -c safe.directory=D:/ofuq/ofuq status --short
```

If the working tree has unrelated uncommitted changes, stop and report them.

Phase 16 must start from a clean or clearly isolated Phase 16 working tree.

---

## Minimal Schema Change

A direct link is needed between an authenticated `student` user and the corresponding `students` row.

Create one migration:

```txt
supabase/migrations/<timestamp>_parent_student_read_only_portal_foundation.sql
```

Add:

```sql
alter table public.students
add column if not exists student_user_id uuid references public.user_profiles(id) on delete set null;

create unique index if not exists students_student_user_id_unique_idx
on public.students(student_user_id)
where student_user_id is not null;

create index if not exists students_student_user_id_idx
on public.students(student_user_id)
where student_user_id is not null;

create index if not exists students_tenant_school_student_user_id_idx
on public.students(tenant_id, school_id, student_user_id)
where student_user_id is not null;
```

Do not add additional schema unless absolutely necessary.

Do not add RLS.

Do not add RBAC tables.

After migration, regenerate types:

```bash
supabase gen types typescript --local > types/database.ts
```

---

## Seed Update

Update only the split Syrian demo seed apply file if needed:

```txt
supabase/seeds/local_syrian_demo_03_apply.sql
```

Link existing demo student users to real student rows using `students.student_user_id`.

Required links:

```txt
student.youssef@ofuq.local -> the intended Youssef student row
student.lana@ofuq.local -> the intended Lana student row
```

Use deterministic, explicit references from the existing staged demo data.

Do not change the split seed architecture.

Do not reintroduce:

```txt
supabase/seeds/local_syrian_demo_data.sql
```

Do not modify `auth_smoke_token_defaults.sql` unless a reset/token check proves it is needed.

`auth_smoke_token_defaults.sql` must remain the final seed file in `supabase/config.toml`.

---

## Portal Routes

Add portal route constants to:

```txt
constants/routes.ts
```

Recommended names:

```ts
portal: "/portal",
portalStudents: "/portal/students",
portalStudentDetails: (studentId: string) => `/portal/students/${studentId}`,
portalAttendance: "/portal/attendance",
portalGrades: "/portal/grades",
portalTimetable: "/portal/timetable",
portalFinance: "/portal/finance",
portalLibrary: "/portal/library",
portalAnnouncements: "/portal/announcements",
portalProfile: "/portal/profile",
```

Create a separate route group under:

```txt
app/(portal)/portal
```

Recommended routes:

```txt
app/(portal)/portal/layout.tsx
app/(portal)/portal/page.tsx
app/(portal)/portal/students/page.tsx
app/(portal)/portal/students/[studentId]/page.tsx
app/(portal)/portal/attendance/page.tsx
app/(portal)/portal/grades/page.tsx
app/(portal)/portal/timetable/page.tsx
app/(portal)/portal/finance/page.tsx
app/(portal)/portal/library/page.tsx
app/(portal)/portal/announcements/page.tsx
app/(portal)/portal/profile/page.tsx
```

The portal must have its own navigation and should not reuse admin dashboard navigation directly.

---

## Portal Navigation

Add:

```txt
config/portal-navigation.ts
```

Navigation labels must be Arabic and RTL-friendly.

Suggested items:

```txt
الرئيسية -> /portal
الأبناء / بياناتي -> /portal/students
الحضور -> /portal/attendance
الدرجات -> /portal/grades
الجدول -> /portal/timetable
المالية -> /portal/finance
المكتبة -> /portal/library
الإعلانات -> /portal/announcements
الملف الشخصي -> /portal/profile
```

If a page is not applicable to `student` users, handle it server-side with a clear Arabic empty/unauthorized state.

Do not expose admin dashboard links to parent/student users.

---

## Server-Side Portal Context

Add:

```txt
lib/portal/context.ts
```

Export a helper like:

```ts
requirePortalContext()
```

It must:

```txt
require an authenticated user
require active membership
allow only role parent or student
derive tenant_id and school_id from membership
compute linked_student_ids server-side
return profile, membership, role, tenant_id, school_id, linked students
redirect or notFound/forbid for unsupported roles
```

Parent linked students:

```sql
select student_id
from public.student_guardians
where guardian_user_id = current_user_id
  and tenant_id = current_tenant_id
  and school_id = current_school_id;
```

Student linked students:

```sql
select id
from public.students
where student_user_id = current_user_id
  and tenant_id = current_tenant_id
  and school_id = current_school_id;
```

Do not trust client-provided `studentId`.

Add a helper like:

```ts
assertPortalStudentAccess(context, studentId)
```

or ensure every query scopes with `student_id in linked_student_ids`.

---

## Portal Data Services

Add read-only service files:

```txt
lib/portal/students.ts
lib/portal/attendance.ts
lib/portal/grades.ts
lib/portal/timetable.ts
lib/portal/finance.ts
lib/portal/library.ts
lib/portal/announcements.ts
```

Optional shared types:

```txt
types/portal.ts
```

These services must only read data.

No mutations.

No Server Actions are required unless there is a harmless read-only helper, but prefer Server Components calling read services.

### Students

Return:

```txt
student identity
student number
class enrollment
class/grade information
guardian summary for parent context if safe
```

### Attendance

Return:

```txt
attendance sessions/records for linked students
status
date
class/subject if available
absence excuse status if available
```

No absence excuse submission.

### Grades

Return:

```txt
exams
exam_results
grade_entries
report_cards
```

No grade edits.

### Timetable

Return:

```txt
timetable slots for linked students' classes
subject
teacher if available
room
weekday/time
```

### Finance

For parent users:

```txt
student invoices
invoice items
payments
balance summaries
student discounts if available
```

For student users:

Either show a limited read-only summary or a clear Arabic note that financial details are available to the guardian only.

No payment creation.

### Library

Return:

```txt
book loans for linked students
book title
copy code
loan/return/due dates
status
```

### Announcements

Return:

```txt
published school announcements
school events if suitable
```

Scope by tenant/school and publication status.

---

## UI Requirements

Arabic-first and RTL.

Use existing design system patterns.

Use clean, simple cards and tables.

Recommended portal layout:

```txt
header with user name/role
sidebar or top navigation depending on existing shell style
main content area
clear read-only badges
empty states in Arabic
```

Every portal page should include a visible read-only cue where appropriate:

```txt
عرض فقط
```

Do not add forms for creating/updating records.

Do not add destructive buttons.

Do not add payment buttons.

Do not add complaint/survey submit buttons.

---

## Access Behavior

When a user with unsupported role reaches `/portal`:

```txt
redirect to /dashboard if admin/staff roles are supported there
or show a clear unauthorized page
```

Preferred:

- `parent` and `student` can access `/portal`.
- Staff/admin dashboard users should continue using `/dashboard`.
- Parent/student should not see admin dashboard navigation.

Do not break existing `/dashboard` access unless intentionally protected by existing role guards.

---

## Tests

Use the Phase 15 Vitest foundation.

Add tests such as:

```txt
tests/unit/portal-routes.test.ts
tests/unit/portal-navigation.test.ts
tests/unit/portal-access.test.ts
```

Test:

```txt
portal routes are stable and non-empty
portal navigation labels/hrefs are non-empty
portal navigation has no duplicate hrefs
only parent/student are portal roles
admin/staff roles are not portal roles
student access helper or pure predicate behaves correctly
```

If portal access logic is tightly coupled to Supabase, extract only tiny pure helpers for testability, such as:

```ts
isPortalRole(role)
canUseParentFinancialView(role)
```

Do not create complex Supabase mocks in this phase.

Update existing route/navigation tests if they expect a fixed route list.

---

## DB Smoke SQL Update

Update:

```txt
tests/db/local-demo-smoke.sql
```

Add checks for Phase 16:

```sql
select count(*) as students_linked_to_user_accounts
from public.students
where student_user_id is not null;
```

Expected:

```txt
>= 2
```

Add:

```sql
select count(*) as guardians_linked_to_user_accounts
from public.student_guardians
where guardian_user_id is not null;
```

Expected:

```txt
>= 2
```

Add anomaly checks:

```sql
select student_user_id, count(*)
from public.students
where student_user_id is not null
group by student_user_id
having count(*) > 1;
```

Expected:

```txt
0 rows
```

Add parent/student portal relationship check if useful:

```sql
select count(*) as linked_parent_students
from public.student_guardians sg
join public.students s on s.id = sg.student_id
where sg.guardian_user_id is not null
  and sg.tenant_id = s.tenant_id
  and sg.school_id = s.school_id;
```

Expected:

```txt
>= 2
```

Do not make the SQL destructive.

---

## Documentation Updates

Update:

```txt
docs/database.md
docs/security-model.md
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/verification-report.md
docs/testing.md
docs/supabase-local.md
```

Documentation must mention:

```txt
Portal is read-only
Parent access is based on student_guardians.guardian_user_id
Student access is based on students.student_user_id
students.student_user_id was added as a nullable identity link
No portal mutations in Phase 16
No payment submission
No absence excuse submission
No complaints/surveys from portal
No health/discipline details
Browser smoke not performed unless actually tested
```

If browser smoke is not performed, document it honestly.

---

## Verification Commands

After implementation, run:

```bash
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
npm run test
npm run lint
npm run build
npm run test:all
git diff --check
```

Run DB smoke SQL:

```powershell
$dbContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db*" } | Select-Object -First 1
Get-Content tests/db/local-demo-smoke.sql | docker exec -i $dbContainer psql -U postgres -d postgres
```

If local Supabase/Docker is unavailable, do not claim DB verification passed.

---

## Manual Browser Smoke Guidance

If browser access is available, test:

```txt
parent.hassan@ofuq.local
student.youssef@ofuq.local
```

Shared local password:

```txt
OfuqLocal123!
```

Check:

```txt
/portal opens for parent
/portal opens for student
parent sees only linked students
student sees only own linked student record
portal pages are read-only
no admin dashboard navigation appears in portal
finance page does not allow payment
attendance page does not allow excuse submission
```

If browser smoke is not performed, document it as not performed.

Do not claim Playwright/E2E coverage.

---

## Commit Rules

Stage only Phase 16 files.

Expected files may include:

```txt
supabase/migrations/<timestamp>_parent_student_read_only_portal_foundation.sql
supabase/seeds/local_syrian_demo_03_apply.sql
types/database.ts
types/portal.ts
constants/routes.ts
config/portal-navigation.ts
lib/portal/context.ts
lib/portal/students.ts
lib/portal/attendance.ts
lib/portal/grades.ts
lib/portal/timetable.ts
lib/portal/finance.ts
lib/portal/library.ts
lib/portal/announcements.ts
app/(portal)/portal/layout.tsx
app/(portal)/portal/page.tsx
app/(portal)/portal/students/page.tsx
app/(portal)/portal/students/[studentId]/page.tsx
app/(portal)/portal/attendance/page.tsx
app/(portal)/portal/grades/page.tsx
app/(portal)/portal/timetable/page.tsx
app/(portal)/portal/finance/page.tsx
app/(portal)/portal/library/page.tsx
app/(portal)/portal/announcements/page.tsx
app/(portal)/portal/profile/page.tsx
tests/unit/portal-routes.test.ts
tests/unit/portal-navigation.test.ts
tests/unit/portal-access.test.ts
tests/db/local-demo-smoke.sql
docs/database.md
docs/security-model.md
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/verification-report.md
docs/testing.md
docs/supabase-local.md
```

Before commit, run:

```bash
git diff --cached --name-only
git diff --cached --stat
git diff --check --cached
```

Suggested commit message:

```txt
feat: add parent student read only portal foundation
```

Do not commit if:

```txt
supabase db reset fails
type generation fails
unit tests fail
lint fails
build fails
test:all fails
DB smoke fails
unrelated files are staged
future phase files are staged
```

---

## Expected Final Response

After implementation, report:

1. Git status at start.
2. Schema migration added.
3. Seed updates and student/parent links.
4. Portal routes added.
5. Portal pages added.
6. Portal context/access model.
7. Read-only services added.
8. Tests added and results.
9. DB smoke updates and results.
10. Supabase reset/type generation results.
11. Lint/build/test:all/diff results.
12. Browser smoke status.
13. Docs updated.
14. Commit hash if committed.
15. Final Go/No-Go for the next phase.

---

## Success Criteria

Phase 16 succeeds only when:

- `/portal` exists and is protected.
- Only `parent` and `student` roles can use the portal.
- Parent users see only students linked through `student_guardians.guardian_user_id`.
- Student users see only their row linked through `students.student_user_id`.
- Portal pages are read-only.
- No mutation workflows are added.
- Minimal schema migration is applied successfully.
- Syrian demo seed links at least two student users and at least two parent users.
- `supabase db reset` passes.
- `types/database.ts` is regenerated successfully.
- DB smoke SQL passes.
- Vitest tests pass.
- Lint passes.
- Build passes.
- `npm run test:all` passes.
- `git diff --check` passes.
- Documentation is updated honestly.
- Browser smoke is not falsely claimed.

---

## Suggested Next Phase After Successful Completion

After Phase 16 is verified and committed, plan the next phase separately.

Potential Phase 17 options:

```txt
17 - Settings and Integrations Placeholders Foundation
or
17 - Browser Smoke / E2E Tests Foundation
or
17 - Parent/Student Portal Interaction Foundation
```

Do not start the next phase in this prompt.
