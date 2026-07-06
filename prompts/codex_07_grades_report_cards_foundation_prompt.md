# Codex Execution Prompt — 07 Grades and Report Cards Foundation

## Phase

`07 - Grades and Report Cards Foundation`

## Role

You are Codex acting as a senior full-stack software engineer working on **Ofuq | أُفُق**, a full-stack Arabic-first, RTL, multi-tenant school management system.

Your task is to implement the grades and report cards foundation as one focused vertical slice.

This phase must build:

- Exams foundation
- Exam results foundation
- Grade entries foundation
- Basic report card foundation
- Arabic RTL dashboard pages
- Server-side tenant/school/role/enrollment validation
- Documentation updates
- Full local verification after schema changes

This phase must **not** implement advanced analytics, GPA ranking, certificate design, PDF generation, parent notifications, AI, drag-and-drop report builder, finance, timetable logic, or external integrations.

---

## Required Pre-Read

Before editing, read these files carefully:

```txt
AGENTS.md
docs/architecture.md
docs/database.md
docs/security-model.md
docs/supabase-local.md
docs/project-phases.md
docs/codex-workflow.md
docs/project-status.md
docs/verification-report.md
docs/verification-phase-06.md
docs/requirements-roadmap.md
package.json
constants/routes.ts
config/navigation.ts
lib/auth/session.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
lib/academic/context.ts
lib/academic/academic-structure.ts
lib/actions/academic.ts
lib/attendance/context.ts
lib/actions/attendance.ts
types/database.ts
types/academic.ts
types/attendance.ts
types/students.ts
supabase/migrations/20260706200000_academic_structure_foundation.sql
supabase/migrations/20260706213000_attendance_manual_qr_foundation.sql
```

If any file is missing, report it clearly and continue only with the available project state.

---

## Current Project Context

The project already has:

- Supabase Auth email/password login.
- Protected dashboard.
- Fixed roles through `user_memberships`.
- Multi-tenant tenant/school context from the authenticated active membership.
- Students and admissions foundation.
- Student records and class enrollments.
- Academic years, terms, grade levels, classes, subjects, grade-level subject assignments, and class enrollments.
- Attendance manual + QR-token foundation.
- Phase 06.5 verification.

Important verification note from Phase 06.5:

> Authenticated end-to-end smoke testing may be blocked by missing local seed data. Do not mark browser workflows as passed unless actually tested.

If workflow testing is blocked by missing auth users, students, academic years, classes, subjects, or enrollments, document it honestly. Do not claim browser or authenticated workflows passed unless you actually tested them.

---

## Core Architecture Rules

Follow these rules strictly:

1. Use Server Components by default.
2. Use Client Components only for forms and interactive grade-entry UI.
3. Use Server Actions and server-side services for create/update/publish flows.
4. Never trust `tenant_id`, `school_id`, `role`, or user identity from forms.
5. Resolve tenant/school/role from authenticated active membership only.
6. Use fixed roles, not RBAC tables.
7. Do not enable full RLS in this phase.
8. Do not modify old migrations.
9. Add a new migration under `supabase/migrations/` only.
10. Keep Arabic-first RTL UI.
11. Avoid broad dependencies.
12. Keep the slice scoped to grades and basic report cards only.

---

## Trusted Context Rule

All grade and report card actions must derive trusted context from server-side membership.

Create a context helper similar to `lib/academic/context.ts` and `lib/attendance/context.ts`:

```txt
lib/grades/context.ts
```

Suggested function:

```ts
requireGradesContext(allowedRoles)
```

It should rely on existing helpers:

- `requireActiveMembership()`
- `requireRole()`
- `requireSchoolContext()`

Return:

```ts
{
  user_id: string
  role: UserRole
  tenant_id: string
  school_id: string
}
```

Allowed roles for this phase:

```txt
system_admin
school_admin
teacher
```

Suggested permissions:

| Role | Foundation behavior |
| --- | --- |
| `system_admin` | Manage grades and report cards within resolved tenant/school context. |
| `school_admin` | Create exams, review/publish grades, generate/publish report cards. |
| `teacher` | Create exams and enter grades within current school context. Teacher assignment scoping can be added later when teacher-class/subject assignments exist. |
| `parent` | No grades portal in this phase. |
| `student` | No student grades portal in this phase. |
| `accountant` | No access. |
| `librarian` | No access. |

Do not introduce permissions tables or full RBAC.

---

## Database Scope

Create a new migration, for example:

```txt
supabase/migrations/<timestamp>_grades_report_cards_foundation.sql
```

Do not modify previous migrations.

### Required Enums

Create these enums if they do not exist:

```sql
exam_status:
  draft
  scheduled
  completed
  published
  cancelled

exam_result_status:
  draft
  entered
  published
  absent
  excused

grade_entry_category:
  quiz
  assignment
  homework
  project
  participation
  behavior
  other

grade_entry_status:
  draft
  entered
  published

report_card_status:
  draft
  published
  archived
```

Use the project's existing safe enum creation pattern.

---

## Required Tables

### 1. `exams`

Purpose: stores exam/assessment definitions for a class, subject, academic year, and optional term.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid()
tenant_id uuid not null references public.tenants(id) on delete cascade
school_id uuid not null references public.schools(id) on delete cascade
academic_year_id uuid not null references public.academic_years(id) on delete cascade
term_id uuid references public.terms(id) on delete set null
class_id uuid not null references public.classes(id) on delete cascade
grade_level_id uuid not null references public.grade_levels(id)
subject_id uuid not null references public.subjects(id) on delete cascade
title text not null
exam_date date
max_score numeric(6,2) not null default 100
weight numeric(5,2)
status public.exam_status not null default 'draft'
created_by_user_id uuid references public.user_profiles(id) on delete set null
notes text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Recommended checks:

```sql
btrim(title) <> ''
max_score > 0
weight is null or (weight > 0 and weight <= 100)
```

Recommended indexes:

```sql
exams_tenant_id_idx
exams_school_id_idx
exams_academic_year_id_idx
exams_term_id_idx
exams_class_id_idx
exams_grade_level_id_idx
exams_subject_id_idx
exams_status_idx
exams_exam_date_idx
exams_created_by_user_id_idx
exams_tenant_school_year_class_subject_idx
```

Add `updated_at` trigger using existing `public.set_updated_at()`.

---

### 2. `exam_results`

Purpose: stores one student's result for one exam.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid()
tenant_id uuid not null references public.tenants(id) on delete cascade
school_id uuid not null references public.schools(id) on delete cascade
exam_id uuid not null references public.exams(id) on delete cascade
academic_year_id uuid not null references public.academic_years(id) on delete cascade
term_id uuid references public.terms(id) on delete set null
class_id uuid not null references public.classes(id) on delete cascade
subject_id uuid not null references public.subjects(id) on delete cascade
student_id uuid not null references public.students(id) on delete cascade
class_enrollment_id uuid not null references public.class_enrollments(id) on delete cascade
score numeric(6,2)
status public.exam_result_status not null default 'draft'
entered_by_user_id uuid references public.user_profiles(id) on delete set null
entered_at timestamptz not null default now()
published_at timestamptz
notes text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Required uniqueness:

```sql
unique (exam_id, student_id)
```

Recommended checks:

```sql
score is null or score >= 0
```

Score upper-bound validation must also happen server-side against the related `exams.max_score`.

Recommended indexes:

```sql
exam_results_tenant_id_idx
exam_results_school_id_idx
exam_results_exam_id_idx
exam_results_academic_year_id_idx
exam_results_term_id_idx
exam_results_class_id_idx
exam_results_subject_id_idx
exam_results_student_id_idx
exam_results_class_enrollment_id_idx
exam_results_status_idx
exam_results_entered_at_desc_idx
```

Add `updated_at` trigger.

---

### 3. `grade_entries`

Purpose: stores non-exam grade components such as quizzes, assignments, homework, projects, participation, and other teacher-entered marks.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid()
tenant_id uuid not null references public.tenants(id) on delete cascade
school_id uuid not null references public.schools(id) on delete cascade
academic_year_id uuid not null references public.academic_years(id) on delete cascade
term_id uuid references public.terms(id) on delete set null
class_id uuid not null references public.classes(id) on delete cascade
subject_id uuid not null references public.subjects(id) on delete cascade
student_id uuid not null references public.students(id) on delete cascade
class_enrollment_id uuid not null references public.class_enrollments(id) on delete cascade
category public.grade_entry_category not null default 'other'
title text not null
score numeric(6,2) not null
max_score numeric(6,2) not null default 100
weight numeric(5,2)
status public.grade_entry_status not null default 'entered'
recorded_on date not null default current_date
entered_by_user_id uuid references public.user_profiles(id) on delete set null
notes text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Recommended checks:

```sql
btrim(title) <> ''
score >= 0
max_score > 0
score <= max_score
weight is null or (weight > 0 and weight <= 100)
```

Recommended indexes:

```sql
grade_entries_tenant_id_idx
grade_entries_school_id_idx
grade_entries_academic_year_id_idx
grade_entries_term_id_idx
grade_entries_class_id_idx
grade_entries_subject_id_idx
grade_entries_student_id_idx
grade_entries_class_enrollment_id_idx
grade_entries_category_idx
grade_entries_status_idx
grade_entries_recorded_on_desc_idx
```

Add `updated_at` trigger.

---

### 4. `report_cards`

Purpose: stores a basic report card snapshot for one student, class, academic year, and optional term.

This is a foundation only. Do not implement advanced PDF rendering, certificate design, custom templates, or report builder logic.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid()
tenant_id uuid not null references public.tenants(id) on delete cascade
school_id uuid not null references public.schools(id) on delete cascade
academic_year_id uuid not null references public.academic_years(id) on delete cascade
term_id uuid references public.terms(id) on delete set null
class_id uuid not null references public.classes(id) on delete cascade
student_id uuid not null references public.students(id) on delete cascade
class_enrollment_id uuid not null references public.class_enrollments(id) on delete cascade
status public.report_card_status not null default 'draft'
summary jsonb not null default '{}'::jsonb
teacher_remarks text
admin_notes text
generated_by_user_id uuid references public.user_profiles(id) on delete set null
generated_at timestamptz not null default now()
published_at timestamptz
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Recommended uniqueness:

```sql
unique (tenant_id, school_id, academic_year_id, term_id, student_id)
```

Important: PostgreSQL unique constraints treat `null` values as distinct. If you need uniqueness for no-term report cards, use an expression/partial unique index carefully. If that adds complexity, use a simpler unique index for term-based records and document no-term handling as a TODO.

Recommended indexes:

```sql
report_cards_tenant_id_idx
report_cards_school_id_idx
report_cards_academic_year_id_idx
report_cards_term_id_idx
report_cards_class_id_idx
report_cards_student_id_idx
report_cards_class_enrollment_id_idx
report_cards_status_idx
report_cards_generated_at_desc_idx
```

Add `updated_at` trigger.

---

## Critical Server-Side Validation

### Shared validations

For every create/update/publish action, verify server-side:

- Authenticated user exists.
- Active membership exists.
- Role is allowed.
- `tenant_id` and `school_id` come from membership context only.
- IDs submitted from forms belong to the current tenant/school.
- Do not trust `tenant_id`, `school_id`, `role`, `created_by_user_id`, `entered_by_user_id`, or `generated_by_user_id` from forms.

### Academic relationship validation

Before creating exams or grade entries, verify:

- `academic_year_id` belongs to current tenant/school.
- `class_id` belongs to current tenant/school.
- `class.academic_year_id === academic_year_id`.
- `grade_level_id` is derived from `classes.grade_level_id`, not trusted from form values.
- `subject_id` belongs to current tenant/school.
- If `grade_level_subjects` exists for the grade/year, verify the subject is assigned to the class grade level for that academic year.
- If `term_id` is provided, it belongs to current tenant/school and academic year.

### Student/enrollment validation

Before creating exam results, grade entries, or report cards, verify:

- Student belongs to current tenant/school.
- Student status is active when available.
- Student has active `class_enrollments` row for the target `class_id` and `academic_year_id`.
- Use the active `class_enrollment_id` resolved server-side.
- Do not let `student_id` or `class_enrollment_id` bypass enrollment checks.

### Score validation

Before writing scores:

- `score >= 0`.
- `max_score > 0`.
- Exam result score must be `<= exams.max_score` unless status is `absent` or `excused` and score is null.
- Grade entry score must be `<= max_score`.
- Do not allow invalid numeric input to reach the database.

### Publish validation

Before publishing exam results or report cards:

- Role must be `system_admin` or `school_admin`, unless the existing project rules explicitly allow teacher publishing.
- The record belongs to current tenant/school.
- Required student/class/year relationships are valid.
- Set `published_at` server-side.

---

## Services to Create

Create server-only service files:

```txt
lib/grades/context.ts
lib/grades/exams.ts
lib/grades/exam-results.ts
lib/grades/grade-entries.ts
lib/grades/report-cards.ts
```

Use `import "server-only"` in server-side service/context files.

Suggested responsibilities:

### `lib/grades/exams.ts`

- List exams for current school.
- Get exam details.
- Create exam.
- Update exam status.
- Load exam students from active class enrollments.

### `lib/grades/exam-results.ts`

- List results for an exam.
- Upsert result for one student.
- Bulk save results if simple and safe.
- Publish results if allowed.
- Validate score against exam max score.

### `lib/grades/grade-entries.ts`

- List grade entries by class/subject/student.
- Create grade entry.
- Update grade entry status.
- Validate active enrollment.

### `lib/grades/report-cards.ts`

- Build basic report card summary from exam results and grade entries.
- Generate or update report card snapshot.
- List report cards.
- Get report card details.
- Publish report card if allowed.

Keep all queries tenant/school scoped.

---

## Server Actions

Create:

```txt
lib/actions/grades.ts
```

Suggested actions:

```ts
createExamAction
saveExamResultAction
saveBulkExamResultsAction
publishExamResultsAction
createGradeEntryAction
generateReportCardAction
publishReportCardAction
```

If bulk result saving becomes too large, implement safe single-student result saving first and document bulk entry as a TODO.

Use Zod validation with Arabic user-facing messages where practical.

Use existing `ActionResult` helpers.

Do not expose raw database errors directly to the user.

---

## Audit Logs

Write audit logs where practical, following the existing audit log pattern.

Suggested events:

```txt
grades.exam.created
grades.exam.status_updated
grades.exam_result.saved
grades.exam_results.published
grades.grade_entry.created
grades.report_card.generated
grades.report_card.published
```

Rules:

- Do not store secrets.
- Do not store excessive grade payloads.
- Keep metadata operational and minimal.
- Include ids such as exam id, class id, subject id, student id, and report card id where useful.

If audit logging would significantly complicate the slice, implement it for core events only and add TODOs for the rest.

---

## Types

Create:

```txt
types/grades.ts
```

Include lightweight UI/domain types for:

- Exam status labels
- Exam result status labels
- Grade entry category labels
- Grade entry status labels
- Report card status labels
- Basic report card summary shape

Do not duplicate generated database types unnecessarily.

After migration, regenerate:

```bash
supabase gen types typescript --local > types/database.ts
```

Inspect `types/database.ts`. Avoid committing line-ending-only changes unless schema changes are genuinely reflected.

---

## Routes

Update `constants/routes.ts` with grades routes.

Suggested routes:

```ts
grades: "/dashboard/grades",
gradesExams: "/dashboard/grades/exams",
newGradesExam: "/dashboard/grades/exams/new",
gradesExamDetails: (examId: string) => `/dashboard/grades/exams/${examId}`,
gradeEntries: "/dashboard/grades/entries",
reportCards: "/dashboard/grades/report-cards",
reportCardDetails: (reportCardId: string) =>
  `/dashboard/grades/report-cards/${reportCardId}`,
```

Preserve existing route helpers.

---

## Navigation

Update `config/navigation.ts`:

- Turn the grades/results item from placeholder into an active link to `/dashboard/grades` if it exists as a placeholder.
- If no grades nav item exists, add a single active Arabic item under the academic/learning section.
- Do not activate unrelated placeholder modules.
- Do not implement finance, reports, communication, timetable, or AI navigation beyond existing placeholders.

Suggested Arabic label:

```txt
الدرجات والتقارير
```

or:

```txt
الدرجات
```

Use whichever better matches the existing navigation style.

---

## Pages to Implement

Create Arabic RTL dashboard pages:

```txt
app/(dashboard)/dashboard/grades/page.tsx
app/(dashboard)/dashboard/grades/exams/page.tsx
app/(dashboard)/dashboard/grades/exams/new/page.tsx
app/(dashboard)/dashboard/grades/exams/[examId]/page.tsx
app/(dashboard)/dashboard/grades/entries/page.tsx
app/(dashboard)/dashboard/grades/report-cards/page.tsx
app/(dashboard)/dashboard/grades/report-cards/[reportCardId]/page.tsx
```

Keep pages simple and functional.

### `/dashboard/grades`

Purpose: grades overview.

Show:

- Total exams count if easy.
- Recent exams.
- Recent grade entries.
- Recent report cards.
- Quick links to exams, entries, and report cards.

No advanced charts required.

### `/dashboard/grades/exams`

Purpose: list exams.

Show:

- title
- academic year
- term if available
- class
- subject
- exam date
- max score
- status
- link to details

### `/dashboard/grades/exams/new`

Purpose: create exam.

Form fields:

```txt
academic_year_id
term_id optional
class_id
subject_id
title
exam_date optional
max_score
weight optional
notes optional
```

Do not include tenant/school fields.

### `/dashboard/grades/exams/[examId]`

Purpose: exam details and result entry.

Show:

- Exam summary.
- Enrolled students list from active `class_enrollments`.
- Existing results.
- Score entry form per student or simple result entry form.
- Publish results action for admin roles if implemented.

For the foundation phase, simple per-student save actions are acceptable.

### `/dashboard/grades/entries`

Purpose: non-exam grade entries.

Show:

- Filters or simple selection for academic year/class/subject/student.
- Form to create a grade entry.
- List of recent entries.

Keep it simple.

### `/dashboard/grades/report-cards`

Purpose: list and generate basic report cards.

Show:

- student
- class
- academic year
- term
- status
- generated date
- actions to generate/view/publish if allowed

### `/dashboard/grades/report-cards/[reportCardId]`

Purpose: basic report card details.

Show:

- Student summary.
- Class/year/term summary.
- Subject summaries from stored `summary` JSON.
- Teacher remarks.
- Admin notes.
- Status.

Do not generate PDF in this phase.

---

## Report Card Foundation Rules

This phase implements basic report card snapshots only.

Report card summary may be generated from:

- published or entered `exam_results`
- published or entered `grade_entries`
- class enrollment metadata
- subject metadata

Keep calculations simple:

- score percentage per subject if enough data exists
- total/max per subject
- optional overall percentage
- no ranking
- no GPA scale unless trivial and clearly documented
- no advanced grading policy engine

The `summary` JSON should be stable enough for display, but do not over-engineer it.

Suggested summary shape:

```ts
{
  subjects: Array<{
    subject_id: string
    subject_name: string
    total_score: number
    max_score: number
    percentage: number | null
  }>
  overall?: {
    total_score: number
    max_score: number
    percentage: number | null
  }
}
```

---

## UI Requirements

- Arabic-first copy.
- RTL layout.
- Use existing dashboard shell and shared components.
- Use shadcn-style UI primitives already in the project.
- Use accessible labels.
- Use clear empty states.
- Keep forms simple.
- Do not overuse animation.
- Do not introduce broad UI libraries.

---

## Documentation Updates

Update these docs after implementation:

```txt
docs/database.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/project-status.md
docs/security-model.md
```

Document that Phase 07 added:

- `exams`
- `exam_results`
- `grade_entries`
- `report_cards`
- exam result entry foundation
- grade entry foundation
- basic report card snapshot/view foundation

Also document that the following remain deferred:

- advanced grading policies
- GPA/ranking
- PDF generation
- certificate/report template designer
- parent/student grade portal
- parent notifications
- advanced analytics
- full RLS
- full RBAC

Do not update `docs/codex-workflow.md` unless a genuinely reusable workflow rule changes.

---

## Validation Commands

Run these commands after implementation:

```bash
git status
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
npm run lint
npm run build
```

If Supabase commands need elevated Docker access on Windows, report that clearly.

If `supabase db reset` has a transient container restart or upstream error, rerun once if safe and document both attempts.

If type generation only changes line endings, restore the file or avoid committing formatting-only changes.

If any command fails:

- report the command
- report the failure summary
- explain likely cause
- do not hide it
- do not make random unrelated changes to silence it

---

## Smoke Testing Guidance

Authenticated end-to-end smoke testing may be blocked by missing local seed data. Do not mark browser workflows as passed unless actually tested.

Try to verify as much as possible:

- Public routes still load.
- Protected routes redirect unauthenticated users to `/login`.
- Grades routes are included in build output.
- If authenticated user and academic/student/class/enrollment data exist, test creating an exam and entering at least one result.
- If data is missing, document it clearly as `Blocked`, not `Passed`.

Do not add a large seed system in this phase. If a tiny safe local smoke dataset is already supported by existing seed patterns and does not require secrets, you may document how to use it, but do not turn this phase into a seeding project.

---

## Git Rules

If validation passes and project instructions allow committing, commit the completed slice.

Suggested commit message:

```txt
feat: add grades report cards foundation
```

Stage only files related to Phase 07.

Do not commit local secrets or invalid generated types.

---

## Strict Do Not Do List

Do not:

- implement advanced analytics
- implement AI grading
- implement AI Query
- implement Chatbot
- implement PDF generation
- implement certificate designer
- implement drag-and-drop report builder
- implement parent notifications
- implement parent/student grade portal unless only a harmless placeholder already exists
- implement timetable integration
- implement finance
- implement communication module
- implement full RLS
- implement full RBAC
- create permissions/role_permissions tables
- trust tenant_id or school_id from forms
- trust student_id or class_enrollment_id without server-side validation
- allow scores outside valid ranges
- modify old migrations
- add broad dependencies
- add testing frameworks
- refactor unrelated modules

---

## Success Criteria

This phase is successful when:

1. A new grades/report-cards migration exists and replays successfully.
2. `exams`, `exam_results`, `grade_entries`, and `report_cards` exist.
3. Tables are tenant/school scoped.
4. Exam creation validates class/year/subject relationships server-side.
5. Exam result entry validates active student enrollment server-side.
6. Grade entry creation validates score ranges and active enrollment server-side.
7. Report card generation creates or updates a basic snapshot.
8. Grades dashboard pages exist and are Arabic RTL.
9. Navigation and routes are updated.
10. Documentation is updated.
11. `supabase db reset` passes.
12. `types/database.ts` is regenerated safely.
13. `npm run lint` passes.
14. `npm run build` passes.
15. Final response summarizes files, validation, warnings, smoke testing status, and next recommended phase.

---

## Final Response Required

When finished, respond with:

1. Summary of implementation.
2. Files created/modified.
3. Database objects added.
4. Grades/report card workflow implemented.
5. Security/tenant/enrollment validation summary.
6. Validation command results.
7. Smoke testing status, including any blocked authenticated workflows.
8. Skipped items with reasons.
9. TODOs.
10. Suggested next prompt.

Suggested next phase after successful Phase 07:

```txt
08 - Manual Timetable with Conflict Prevention Foundation
```
