# Codex Execution Prompt — 14 Syrian Demo Dataset Foundation

## Phase

`14 - Syrian Demo Dataset Foundation`

## Role

You are Codex acting as a senior database engineer and product-quality seed-data designer.

You are working on **Ofuq | أُفُق**, an Arabic-first multi-tenant school management system built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase CLI / PostgreSQL / Supabase Auth
- Server Components and Server Actions
- fixed roles through `user_memberships`
- tenant/school context derived from authenticated membership

This phase must add a rich **local Syrian demo dataset** that looks realistic and covers the existing implemented modules.

This is not a feature phase.

Do not add schema, UI, services, routes, or new functionality.

---

## Important Precondition

Before implementing this phase, confirm Phase 13 is committed or otherwise clearly isolated.

Run:

```bash
git status --short
```

If the working tree contains uncommitted Phase 13 implementation files, stop and report:

```txt
No-Go: Phase 13 must be committed before Phase 14 demo seed implementation.
```

Do not mix feedback implementation changes with demo seed changes.

---

## Main Goal

Add a deterministic local-only Syrian demo dataset with realistic fictional Arabic names and relationships.

The dataset should cover:

```txt
all fixed user roles
students
parents/guardians
grades from first grade to third secondary
classes/sections
Syrian-style subjects
attendance
grades/exams/report cards
timetable
finance
communication
reports source data
library
student care
feedback complaints and surveys
```

The dataset should not be huge. It should be complete, relationally consistent, and useful for manual browser smoke testing and future automated tests.

---

## Data Privacy Rule

Use realistic fictional Syrian names and school data.

Do not use real personal data of real people.

All emails must be local-only and end with:

```txt
@ofuq.local
```

All demo users must use the same password:

```txt
OfuqLocal123!
```

---

## Required Reading Before Editing

Before editing, inspect:

```txt
AGENTS.md
docs/architecture.md
docs/codex-workflow.md
docs/database.md
docs/project-phases.md
docs/project-status.md
docs/requirements-roadmap.md
docs/security-model.md
docs/supabase-local.md
docs/verification-report.md
supabase/config.toml
supabase/seed.sql
supabase/seeds/auth_smoke_token_defaults.sql
types/database.ts
```

Also inspect the latest migrations for table names, enum values, required fields, and constraints before inserting data.

Do not guess schema fields.

Use the actual schema from migrations and generated types.

---

## Strict Scope

### In Scope

You may:

```txt
add a new local demo seed file
update supabase/config.toml seed order
update auth_smoke_token_defaults.sql safely
update docs for local demo credentials/data
run reset and verification
```

Expected new file:

```txt
supabase/seeds/local_syrian_demo_data.sql
```

Expected updated files:

```txt
supabase/config.toml
supabase/seeds/auth_smoke_token_defaults.sql
docs/supabase-local.md
docs/project-status.md
docs/requirements-roadmap.md
docs/verification-report.md
```

Optional docs update if useful:

```txt
docs/database.md
```

### Out of Scope

Do not:

```txt
modify old migrations
add new migrations
modify application code
modify routes/navigation
modify UI
modify lib services/actions
modify types except if type generation is run and produces a real schema-related diff
add RLS
add RBAC
add production-like secrets
use real emails
use real personal data
add external integrations
add features
start automated tests phase
```

---

## Seed File Strategy

Prefer not to expand `supabase/seed.sql` heavily.

Create a separate file:

```txt
supabase/seeds/local_syrian_demo_data.sql
```

Then update `supabase/config.toml` seed order from:

```toml
sql_paths = ["./seed.sql", "./seeds/auth_smoke_token_defaults.sql"]
```

to:

```toml
sql_paths = [
  "./seed.sql",
  "./seeds/local_syrian_demo_data.sql",
  "./seeds/auth_smoke_token_defaults.sql"
]
```

Critical rule:

`auth_smoke_token_defaults.sql` must remain the final seed file.

---

## Auth Token Safety Rule

This project previously had local Supabase Auth smoke-login issues because token/default fields in `auth.users` were left `NULL`.

Do not repeat that problem.

Update:

```txt
supabase/seeds/auth_smoke_token_defaults.sql
```

so it fixes token/default fields for all local demo users, not only two emails.

Recommended filter:

```sql
where email like '%@ofuq.local'
```

This final seed must ensure all local demo `auth.users` have non-null token/default fields where those columns exist.

It should still confirm local emails are email-confirmed.

Do not remove support for existing smoke users:

```txt
admin@ofuq.local
teacher@ofuq.local
```

---

## Idempotency and Determinism

The demo seed must be idempotent.

Use:

```txt
stable deterministic UUIDs
on conflict do update / do nothing
clear natural unique keys where possible
safe inserts that can be replayed by supabase db reset
```

Do not use random UUIDs for core demo rows.

Do not use `now()` where deterministic dates are better for demo data, except for auth/users metadata where acceptable.

Recommended academic year:

```txt
2026-2027
```

Recommended school:

```txt
مدرسة أفق النموذجية الخاصة
```

Recommended city/context:

```txt
دمشق، سوريا
```

---

## Demo Users

Create `auth.users`, `auth.identities`, `public.user_profiles`, and `public.user_memberships` for all fixed roles.

All demo users:

```txt
must be confirmed
must use password OfuqLocal123!
must have @ofuq.local emails
must have non-null auth token/default fields after final seed
```

Required roles:

```txt
system_admin
school_admin
teacher
parent
student
accountant
librarian
```

Recommended demo accounts:

```txt
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

Keep existing smoke accounts working:

```txt
admin@ofuq.local
teacher@ofuq.local
```

Suggested fictional Syrian Arabic names:

```txt
سامر الخطيب
نور الهدى الحلبي
محمود العلي
رنا الشامي
حسن دياب
يوسف الأحمد
لانا منصور
ليان الحمصي
عمر الخطيب
شام الرفاعي
كريم العلي
سارة الدروبي
مالك الشامي
جنى الحلبي
```

---

## Tenant and School

Add or update a demo tenant and school.

Recommended values:

```txt
tenant name: Ofuq Syrian Demo Tenant
tenant slug: ofuq-syrian-demo
school name: مدرسة أفق النموذجية الخاصة
school slug: ofuq-syrian-demo-school
status: active
locale: ar
direction: rtl
```

Use the existing schema fields only.

If the `schools` table does not support city/address fields, do not add them.

Document the city in docs only.

---

## Academic Year and Terms

Create:

```txt
academic year: 2026-2027
term 1: الفصل الأول
term 2: الفصل الثاني
```

Use real-looking dates, for example:

```txt
2026-09-01 to 2027-06-30
الفصل الأول: 2026-09-01 to 2027-01-15
الفصل الثاني: 2027-02-01 to 2027-06-15
```

---

## Grade Levels

Create grade levels from first grade to third secondary:

```txt
الصف الأول
الصف الثاني
الصف الثالث
الصف الرابع
الصف الخامس
الصف السادس
الصف السابع
الصف الثامن
الصف التاسع
الأول الثانوي
الثاني الثانوي
الثالث الثانوي
```

Use stable codes, for example:

```txt
G01
G02
G03
G04
G05
G06
G07
G08
G09
G10
G11
G12
```

Use the actual enum values for grade stage from the database.

Do not invent enum values.

---

## Classes / Sections

Create enough sections to test real workflows without huge data.

Recommended:

```txt
Section A for all grades G01-G12
Section B for grades G07-G12
```

Expected approximate count:

```txt
18 classes
```

Examples:

```txt
الصف الأول / أ
الصف السابع / أ
الصف السابع / ب
الأول الثانوي / أ
الثالث الثانوي / ب
```

Assign homeroom teachers where schema supports it.

Avoid timetable conflicts.

---

## Syrian-Style Subjects

Use subject names aligned with common Syrian school curriculum naming.

Recommended subjects:

```txt
اللغة العربية
الرياضيات
العلوم العامة
الدراسات الاجتماعية
اللغة الإنجليزية
اللغة الفرنسية
التربية الوطنية
التربية الدينية
التربية الفنية
التربية الرياضية
الفيزياء
الكيمياء
علم الأحياء
التاريخ
الجغرافيا
الفلسفة
```

Recommended distribution:

Grades 1-6:

```txt
اللغة العربية
الرياضيات
العلوم العامة
الدراسات الاجتماعية
اللغة الإنجليزية
التربية الوطنية
التربية الدينية
التربية الفنية
التربية الرياضية
```

Grades 7-9:

```txt
اللغة العربية
الرياضيات
العلوم العامة
اللغة الإنجليزية
اللغة الفرنسية
التاريخ
الجغرافيا
التربية الوطنية
التربية الدينية
```

Grades 10-12:

```txt
اللغة العربية
الرياضيات
الفيزياء
الكيمياء
علم الأحياء
اللغة الإنجليزية
اللغة الفرنسية
التاريخ
الجغرافيا
الفلسفة
التربية الوطنية
```

Create `grade_level_subjects` according to existing schema.

---

## Students and Guardians

Add a small but relationally complete set.

Recommended count:

```txt
24 students
2 students per grade level
```

For each student:

```txt
student record
student number
qr_token
class enrollment
guardian record
```

For selected students also create `student` role auth users.

For selected guardians also create `parent` role auth users.

Use fictional Syrian names.

Examples:

```txt
يوسف الأحمد
لانا منصور
عمر الخطيب
شام الرفاعي
كريم العلي
ليان الحمصي
آدم الحسن
سارة الدروبي
مالك الشامي
جنى الحلبي
```

Guardian examples:

```txt
حسن الأحمد
رنا منصور
محمود الخطيب
نور الرفاعي
```

If the current schema does not link guardians to `user_profiles` directly, link by guardian email/name only.

Do not add schema.

---

## Module Coverage Requirements

The seed should include enough records to make dashboard pages meaningful.

### Academic

Cover:

```txt
academic_years
terms
grade_levels
classes
subjects
grade_level_subjects
class_enrollments
```

### Attendance

Add:

```txt
3 attendance sessions
attendance records for enrolled students in selected classes
absence excuses for some absent records
```

Cover statuses such as:

```txt
present
absent
late
excused
```

Use actual enum values from schema.

### Grades

Add:

```txt
4 exams
exam_results
grade_entries
2 report_cards
```

Example exams:

```txt
اختبار رياضيات قصير
مذاكرة لغة عربية
اختبار علوم
اختبار لغة إنجليزية
```

Use varied scores, for example:

```txt
95
87
76
62
```

Use actual schema fields and enum values.

### Timetable

Add:

```txt
5 rooms
8 teacher_subject_assignments
20 timetable_slots
```

Use school days:

```txt
الأحد
الاثنين
الثلاثاء
الأربعاء
الخميس
```

Avoid class/teacher/room conflicts.

Use actual day enum/format from the existing timetable schema.

### Finance

Add enough data for finance pages:

```txt
fee_structures
fee_items
discount_types
student_discounts
invoices
invoice_items
payments
```

Cover scenarios:

```txt
issued invoice
partially paid invoice
paid invoice
discount applied
```

Use realistic Syrian-style school fees, but keep amounts simple and not excessive.

### Communication

Add:

```txt
messages
message_recipients
announcements
notification_logs
school_events
```

Examples:

```txt
إعلان بداية الفصل
رسالة من الإدارة إلى المعلمين
اجتماع أولياء الأمور
```

### Reports

No special report tables are needed.

Reports should become useful from the existing seeded module data.

### Library

Add:

```txt
book_catalog
book_copies
book_loans
```

Suggested books:

```txt
كتاب اللغة العربية - الصف التاسع
كتاب الرياضيات - الأول الثانوي
كتاب الفيزياء - الثاني الثانوي
كتاب العلوم العامة - الصف السادس
```

Cover:

```txt
available copy
loaned copy
active loan
returned loan
overdue loan
```

### Student Care

Add:

```txt
health_records
vaccinations
clinic_visits
discipline_records
achievements
```

Cover:

```txt
basic health record
completed vaccination
closed clinic visit
discipline note/review
published achievement
```

Do not insert diagnosis-like details or sensitive medical payloads.

### Feedback

Add:

```txt
complaints
complaint_updates
surveys
survey_questions
survey_responses
```

Cover:

```txt
resolved complaint
complaint in review
published survey
text question
choice question
one response per user
```

Do not insert anonymous public responses.

---

## SQL Design Guidance

The file may use CTEs, temporary helper tables, or explicit insert blocks.

Keep the file readable.

Prefer sections like:

```txt
-- 01 Demo constants
-- 02 Auth users and memberships
-- 03 Academic structure
-- 04 Students and guardians
-- 05 Attendance
-- 06 Grades
-- 07 Timetable
-- 08 Finance
-- 09 Communication
-- 10 Library
-- 11 Student care
-- 12 Feedback
-- 13 Summary
```

Use stable IDs and stable business keys.

Avoid data that depends on execution time except where harmless.

---

## Local Auth Insert Guidance

When inserting into `auth.users`, include at least the columns currently used by `supabase/seed.sql`:

```txt
instance_id
id
aud
role
email
encrypted_password
email_confirmed_at
raw_app_meta_data
raw_user_meta_data
created_at
updated_at
```

Use:

```sql
crypt('OfuqLocal123!', gen_salt('bf'))
```

Also insert matching `auth.identities` records for provider `email`.

After this seed, `auth_smoke_token_defaults.sql` must run last and make token fields non-null for all `@ofuq.local` users.

---

## Documentation Updates

Update:

```txt
docs/supabase-local.md
docs/project-status.md
docs/requirements-roadmap.md
docs/verification-report.md
```

Optional:

```txt
docs/database.md
```

Documentation must mention:

```txt
local Syrian demo dataset exists
all demo emails end with @ofuq.local
shared local password is OfuqLocal123!
seed order includes local_syrian_demo_data.sql before auth_smoke_token_defaults.sql
auth token/default safety is preserved
browser smoke may use the demo accounts
data is fictional and local-only
```

Do not document real secrets or production credentials.

---

## Verification Commands

After implementation, run:

```bash
git status
supabase status
supabase db reset
npm run lint
npm run build
git diff --check
```

Because this phase should not change schema, type generation is optional.

If you run:

```bash
supabase gen types typescript --local > types/database.ts
```

only keep the resulting diff if it is a real useful change. Do not commit line-ending-only changes.

If `supabase db reset` fails, stop and report clearly.

Do not mark Phase 14 verified until reset, lint, build, diff check, and SQL spot checks pass.

---

## Required SQL Spot Checks

### Auth users list

```sql
select email
from auth.users
where email like '%@ofuq.local'
order by email;
```

### Auth token null safety

Check token/default fields using the columns that exist in the local GoTrue schema.

At minimum, verify expected token fields are not null for all local users.

Suggested query if all columns exist:

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

Expected result:

```txt
0
```

If a column does not exist in the local schema, adjust the query safely and document it.

### Core counts

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

### Module coverage counts

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

### Relationship sanity checks

Add practical checks such as:

```sql
select count(*)
from public.class_enrollments ce
left join public.students s on s.id = ce.student_id
where s.id is null;
```

Expected:

```txt
0
```

Also check duplicate active constraints where relevant, for example active loans and survey responses.

---

## Manual Smoke Test Guidance

If browser access is available, test login with these users:

```txt
system.admin@ofuq.local
school.admin@ofuq.local
teacher.arabic@ofuq.local
accountant@ofuq.local
librarian@ofuq.local
parent.hassan@ofuq.local
student.youssef@ofuq.local
```

Password for all:

```txt
OfuqLocal123!
```

Then open major dashboards:

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

Confirm pages show meaningful demo data where role access allows it.

If browser/authenticated smoke is unavailable, document it honestly.

Do not mark browser workflows as passed unless actually tested.

---

## Commit Rules

Stage only Phase 14 demo seed and documentation files.

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

Do not stage unrelated application files.

Do not stage Phase 13 implementation files if they are still uncommitted.

Suggested commit message:

```txt
chore: add syrian demo dataset seed
```

---

## Expected Final Response

After implementation, report:

1. Precondition result: whether Phase 13 was committed or cleanly isolated.
2. Files created/modified.
3. Seed order before/after.
4. Demo user accounts added.
5. Shared local password.
6. Dataset coverage summary by module.
7. Auth token/default safety summary.
8. Seed/config handling summary.
9. Verification command results.
10. SQL spot check results.
11. Browser smoke status.
12. Documentation updates.
13. Commit hash if committed.
14. Final Go/No-Go for automated tests phase.

---

## Success Criteria

Phase 14 succeeds only when:

- Phase 13 implementation files are not mixed into the Phase 14 commit.
- `local_syrian_demo_data.sql` exists and is local-only.
- `supabase/config.toml` seed order is correct.
- `auth_smoke_token_defaults.sql` remains last and covers all `@ofuq.local` users.
- All demo auth users can share `OfuqLocal123!`.
- No auth token/default fields remain `NULL` for local users where checked.
- Demo data covers all major implemented modules.
- Data is deterministic and idempotent.
- No migrations are changed.
- No schema is changed.
- No application behavior is changed.
- `supabase db reset` passes.
- SQL spot checks pass.
- `npm run lint` passes.
- `npm run build` passes.
- `git diff --check` passes.
- Docs are updated.

---

## Suggested Next Phase After Successful Completion

After Phase 14 is verified and committed, plan the next phase separately.

Recommended next phase:

```txt
15 - Automated Tests Foundation
```

Do not start tests in this prompt.
