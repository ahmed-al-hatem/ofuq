# Codex Execution Prompt — 05 Academic Structure Foundation

## Role

You are Codex acting as a senior full-stack Next.js engineer, Supabase/PostgreSQL engineer, product-minded school-system architect, and security-focused implementation partner.

You are working on **Ofuq | أُفُق**, a full-stack Arabic-first, RTL-first, multi-tenant school management system.

This task implements the fifth project slice:

```txt
05 - Academic Structure Foundation
```

This phase must build the academic structure foundation required for future attendance, grades, timetabling, and reporting.

Do not implement attendance, grades, exams, report cards, or timetable logic in this phase.

---

## Primary Objective

Build a clean, tenant-aware, school-scoped academic foundation for:

1. academic years
2. terms/semesters/quarters
3. grade levels
4. classes/sections
5. subjects
6. subject assignment to grade levels
7. student class enrollments
8. simple Arabic dashboard pages for managing the foundation

All tenant, school, and role decisions must come from the authenticated user's active membership context.

Never trust `tenant_id`, `school_id`, or `role` from client-submitted form values.

---

## Mandatory First Step

Before editing any file, read these files in this order:

```txt
AGENTS.md
docs/architecture.md
docs/database.md
docs/security-model.md
docs/supabase-local.md
docs/project-phases.md
docs/codex-workflow.md
package.json
proxy.ts
lib/auth/session.ts
lib/actions/auth.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
lib/students/context.ts
lib/students/students.ts
lib/students/admissions.ts
constants/roles.ts
constants/routes.ts
config/navigation.ts
types/auth.ts
types/tenant.ts
types/database.ts
types/students.ts
app/(dashboard)/layout.tsx
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/dashboard/students/page.tsx
app/(dashboard)/dashboard/admissions/page.tsx
components/app/app-shell.tsx
components/app/app-header.tsx
components/app/app-sidebar.tsx
components/shared/page-header.tsx
components/shared/empty-state.tsx
components/shared/status-badge.tsx
components/ui/button.tsx
components/ui/card.tsx
components/ui/input.tsx
components/ui/label.tsx
components/ui/field.tsx
components/ui/native-select.tsx
components/ui/textarea.tsx
supabase/migrations/20260706183000_students_admissions_foundation.sql
```

If a file does not exist, report it and continue with the closest existing structure.

Important: this repository currently uses root-level folders such as:

```txt
app/
lib/
types/
constants/
components/
docs/
supabase/
```

Do **not** assume a `src/` directory unless it already exists.

---

## Current Foundation You Must Preserve

The project already has:

- Supabase Auth foundation
- server-protected dashboard
- `getAuthenticatedUser()` in `lib/auth/session.ts`
- fixed roles through `public.user_memberships`
- membership-based tenant/school context
- generated `types/database.ts`
- students/admissions foundation from Phase 04
- `students` table with `tenant_id`, `school_id`, `student_number`, `qr_token`
- `student_admissions`, `student_guardians`, `student_documents`, and `student_status_history`
- `requireStudentContext()` pattern in `lib/students/context.ts`

Do not rebuild authentication.

Do not change the students/admissions flow unless absolutely required for class enrollments.

Do not replace the current membership model.

Do not introduce full RBAC.

---

## Current Architecture Assumptions

Use this model exactly:

```txt
Supabase Auth             -> identity source
public.user_profiles      -> app profile; id matches auth.users.id
public.user_memberships   -> tenant/school/role context
public.tenants            -> top-level organization boundary
public.schools            -> school boundary inside a tenant
public.students           -> official student records from Phase 04
public.audit_logs         -> security/workflow audit events
```

The new academic data must be tenant-aware and school-scoped from the beginning.

All new academic tables must include:

```txt
tenant_id
school_id
```

---

## Non-Negotiable Security Rules

Follow these rules strictly:

1. Never trust `tenant_id`, `school_id`, or `role` from forms or Client Components.
2. Resolve `tenant_id`, `school_id`, and `role` from `getAuthenticatedUser()` and active membership context.
3. All create/update/delete flows must be Server Actions or server-side services.
4. Sensitive reads must validate authentication, active membership, role, tenant context, and school context.
5. Use fixed role checks only. Do not implement full RBAC.
6. Do not expose `SUPABASE_SERVICE_ROLE_KEY` to Client Components.
7. Do not rely on full production RLS in this phase.
8. Do not log secrets, credentials, tokens, or raw private data.
9. User-facing validation and error messages must be Arabic.
10. Student enrollment must verify student/class/year ownership server-side before insert.

---

## Fixed Role Rules for Phase 05

Use these fixed roles only:

```txt
system_admin
school_admin
teacher
parent
student
accountant
librarian
```

### Allowed to mutate academic structure

```txt
system_admin
school_admin
```

### Optional read-only access

```txt
teacher
```

Teachers may read academic structure only if it is simple and useful. Do not build teacher-specific screens in this phase.

### No academic management permissions in this phase

```txt
parent
student
accountant
librarian
```

Do not create a permissions engine.

Do not add RBAC tables.

---

## In Scope

Implement a foundation slice only.

### Database

Create a new incremental migration for:

- `academic_years`
- `terms`
- `grade_levels`
- `classes`
- `subjects`
- `grade_level_subjects`
- `class_enrollments`
- optional enum types needed by these tables

### Backend / Server

Create server-side services and actions for:

- listing academic years
- creating academic years
- listing terms
- creating terms
- listing grade levels
- creating grade levels
- listing classes
- creating classes
- listing subjects
- creating subjects
- assigning subjects to grade levels
- listing class enrollments
- enrolling students in classes with strict server-side validation

### UI

Create simple Arabic dashboard pages for:

- academic overview
- academic years and terms
- grade levels
- classes
- subjects
- class enrollments

### Navigation and Routes

Update:

- `constants/routes.ts`
- `config/navigation.ts`

So that the academic module becomes a real route, not a placeholder.

### Docs

Update relevant docs minimally:

- `docs/database.md`
- `docs/project-phases.md`
- `docs/security-model.md` if needed
- `docs/codex-workflow.md` only if a reusable workflow rule is added

---

## Out of Scope

Do **not** implement:

- attendance
- QR attendance
- Beacon attendance
- timetable slots
- manual timetable conflict prevention
- automatic timetable generation
- exams
- grade entries
- report cards
- GPA or grading systems
- attendance reports
- academic performance reports
- teacher workload distribution
- full teacher assignments module
- student promotion workflow
- student transfer workflow
- student withdrawal workflow
- school holidays
- calendar events
- finance
- communication
- library
- health
- AI Query
- chatbot logic
- external integrations
- full RLS
- full RBAC
- `roles`, `permissions`, `role_permissions`, or `user_roles` tables
- changing old migrations

---

## Database Migration Requirements

Create a new migration under:

```txt
supabase/migrations/
```

Use a timestamped name similar to:

```txt
<timestamp>_academic_structure_foundation.sql
```

Do not edit previous migrations.

Do not rewrite existing schema history.

Use PostgreSQL conventions consistent with existing migrations.

Use `public.set_updated_at()` triggers for tables with `updated_at`, consistent with earlier phases.

---

## Suggested Enum Types

Create enum types only if they improve safety and match the project style.

Suggested enums:

```sql
public.academic_year_status
public.term_status
public.grade_level_stage
public.class_status
public.subject_type
public.subject_status
public.class_enrollment_status
```

Suggested values:

### `academic_year_status`

```txt
draft
active
closed
archived
```

### `term_status`

```txt
draft
active
closed
archived
```

### `grade_level_stage`

```txt
kindergarten
primary
middle
secondary
other
```

### `class_status`

```txt
active
inactive
archived
```

### `subject_type`

```txt
core
elective
activity
other
```

### `subject_status`

```txt
active
inactive
archived
```

### `class_enrollment_status`

```txt
active
transferred
withdrawn
completed
archived
```

Prefer enums because previous phases already use PostgreSQL enums.

---

## Required Tables

### 1. `public.academic_years`

Purpose: school-specific academic year.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
name text not null
code text not null
starts_on date not null
ends_on date not null
status academic_year_status not null default 'draft'
is_current boolean not null default false
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints/indexes:

```txt
name not blank
code not blank
starts_on < ends_on
unique (tenant_id, school_id, code)
unique current academic year per school where is_current = true
indexes on tenant_id, school_id, status, is_current, starts_on desc
```

Important:

- Do not create multiple current years per school.
- Do not implement automatic year closing.

---

### 2. `public.terms`

Purpose: term, semester, or quarter inside an academic year.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
academic_year_id uuid not null references public.academic_years(id) on delete cascade
name text not null
code text not null
term_order integer not null
starts_on date not null
ends_on date not null
status term_status not null default 'draft'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints/indexes:

```txt
name not blank
code not blank
term_order > 0
starts_on < ends_on
unique (academic_year_id, code)
unique (academic_year_id, term_order)
indexes on tenant_id, school_id, academic_year_id, status, term_order
```

Optional check:

- Term dates should fit within the academic year if practical.

Do not implement grading periods beyond this foundation.

---

### 3. `public.grade_levels`

Purpose: school grade levels such as Grade 1, Grade 2, etc.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
name text not null
code text not null
grade_order integer not null
stage grade_level_stage not null default 'other'
status class_status or separate grade_level_status if created
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Preferred:

Use a separate `grade_level_status` enum if needed:

```txt
active
inactive
archived
```

Constraints/indexes:

```txt
name not blank
code not blank
grade_order > 0
unique (tenant_id, school_id, code)
unique (tenant_id, school_id, grade_order)
indexes on tenant_id, school_id, stage, status, grade_order
```

Do not implement promotion logic now.

---

### 4. `public.classes`

Purpose: class/section inside an academic year and grade level.

Example: Grade 1 - Section A.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
academic_year_id uuid not null references public.academic_years(id) on delete cascade
grade_level_id uuid not null references public.grade_levels(id)
name text not null
section text not null
capacity integer null
homeroom_teacher_id uuid null references public.user_profiles(id)
room_name text null
status class_status not null default 'active'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints/indexes:

```txt
name not blank
section not blank
capacity is null or capacity > 0
unique (tenant_id, school_id, academic_year_id, grade_level_id, section)
indexes on tenant_id, school_id, academic_year_id, grade_level_id, status, homeroom_teacher_id
```

Important:

- `homeroom_teacher_id` is optional only.
- Do not build teacher assignment or workload distribution now.

---

### 5. `public.subjects`

Purpose: school subjects such as Arabic, Math, Science.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
name text not null
code text not null
description text null
subject_type subject_type not null default 'core'
status subject_status not null default 'active'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints/indexes:

```txt
name not blank
code not blank
unique (tenant_id, school_id, code)
indexes on tenant_id, school_id, subject_type, status
```

Do not implement grade weighting or exam configuration now.

---

### 6. `public.grade_level_subjects`

Purpose: assign subjects to grade levels for an academic year.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
academic_year_id uuid not null references public.academic_years(id) on delete cascade
grade_level_id uuid not null references public.grade_levels(id) on delete cascade
subject_id uuid not null references public.subjects(id) on delete cascade
is_required boolean not null default true
weekly_periods integer null
sort_order integer not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints/indexes:

```txt
weekly_periods is null or weekly_periods > 0
unique (tenant_id, school_id, academic_year_id, grade_level_id, subject_id)
indexes on tenant_id, school_id, academic_year_id, grade_level_id, subject_id, sort_order
```

Do not implement timetable generation from weekly periods now.

---

### 7. `public.class_enrollments`

Purpose: enroll students in a class for an academic year.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
academic_year_id uuid not null references public.academic_years(id) on delete cascade
class_id uuid not null references public.classes(id) on delete cascade
student_id uuid not null references public.students(id) on delete cascade
grade_level_id uuid not null references public.grade_levels(id)
status class_enrollment_status not null default 'active'
enrolled_on date not null default current_date
left_on date null
created_by_user_id uuid references public.user_profiles(id) on delete set null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints/indexes:

```txt
left_on is null or left_on >= enrolled_on
unique active enrollment per student per academic year
indexes on tenant_id, school_id, academic_year_id, class_id, student_id, grade_level_id, status
```

Critical rule:

Before enrolling a student, verify server-side that:

```txt
- the student belongs to the same tenant_id and school_id
- the class belongs to the same tenant_id and school_id
- the academic year belongs to the same tenant_id and school_id
- the grade level belongs to the same tenant_id and school_id
- the class belongs to the provided academic_year_id and grade_level_id
- the student has no other active enrollment in the same academic year
```

Do not rely only on client form values.

---

## Optional RPC Guidance

A narrow RPC for class enrollment is allowed only if it clearly reduces consistency risk.

Suggested name if used:

```txt
enroll_student_in_class
```

However, a simple Server Action with careful server-side checks is acceptable and preferred for this phase.

Do not create broad or overpowered RPC functions.

---

## Server-Side Context

Create an academic context helper similar to the Phase 04 student context pattern.

Suggested file:

```txt
lib/academic/context.ts
```

Suggested function:

```ts
requireAcademicContext(allowedRoles)
```

It should use:

- `requireActiveMembership()`
- `requireRole()`
- `requireSchoolContext()`

Return:

```ts
type AcademicModuleContext = {
  user_id: string
  role: UserRole
  tenant_id: string
  school_id: string
}
```

Allowed mutation roles:

```txt
system_admin
school_admin
```

Optional read roles:

```txt
system_admin
school_admin
teacher
```

---

## Server-Side Services

Create a focused server-side service layer.

Suggested files:

```txt
lib/academic/context.ts
lib/academic/academic-years.ts
lib/academic/terms.ts
lib/academic/grade-levels.ts
lib/academic/classes.ts
lib/academic/subjects.ts
lib/academic/enrollments.ts
```

If fewer files fit the project better, use:

```txt
lib/academic/academic-structure.ts
lib/academic/enrollments.ts
lib/academic/context.ts
```

Services should:

- use `createSupabaseServerClient()`
- receive trusted context from `requireAcademicContext()` or a caller that already resolved it
- filter by `tenant_id`
- filter by `school_id`
- avoid trusting raw tenant/school input
- return typed results
- keep queries simple

Suggested service functions:

```ts
listAcademicYears(context)
createAcademicYear(context, input)
listTerms(context)
createTerm(context, input)
listGradeLevels(context)
createGradeLevel(context, input)
listClasses(context)
createClass(context, input)
listSubjects(context)
createSubject(context, input)
assignSubjectToGradeLevel(context, input)
listClassEnrollments(context)
enrollStudentInClass(context, input)
```

Implement only what the UI uses, but keep names clear.

---

## Server Actions

Create Server Actions for form mutations.

Preferred file:

```txt
lib/actions/academic.ts
```

Required actions:

```ts
createAcademicYearAction
createTermAction
createGradeLevelAction
createClassAction
createSubjectAction
assignSubjectToGradeLevelAction
enrollStudentInClassAction
```

Rules:

- use `"use server"`
- call `requireAcademicContext()`
- validate active membership
- validate fixed role authorization
- validate tenant/school context server-side
- validate input with Zod
- return `ActionResult` or redirect/revalidate where appropriate
- call `revalidatePath()` after successful mutations
- never trust hidden form fields for tenant/school/role
- use Arabic user-facing errors

Do not add update/delete actions unless they are minimal and required by the UI.

Create-first foundation is enough.

---

## Forms and Validation

Keep forms simple and Arabic-first.

Use simple Server Action forms unless React Hook Form clearly reduces complexity.

### Academic Year Form

Fields:

```txt
name
code
starts_on
ends_on
is_current
```

Arabic validation examples:

```txt
اسم السنة الدراسية مطلوب
رمز السنة الدراسية مطلوب
تاريخ البداية مطلوب
تاريخ النهاية مطلوب
يجب أن يكون تاريخ البداية قبل تاريخ النهاية
```

### Term Form

Fields:

```txt
academic_year_id
name
code
term_order
starts_on
ends_on
```

### Grade Level Form

Fields:

```txt
name
code
grade_order
stage
```

### Class Form

Fields:

```txt
academic_year_id
grade_level_id
name
section
capacity
room_name
```

Do not require homeroom teacher in this phase.

### Subject Form

Fields:

```txt
name
code
subject_type
description
```

### Grade Level Subject Form

Fields:

```txt
academic_year_id
grade_level_id
subject_id
weekly_periods
is_required
sort_order
```

### Class Enrollment Form

Fields:

```txt
academic_year_id
class_id
student_id
enrolled_on
```

Important:

Do not include trusted `tenant_id` or `school_id` fields in forms.

---

## Pages to Create

Create simple Arabic dashboard pages.

### 1. Academic Overview

Path:

```txt
app/(dashboard)/dashboard/academic/page.tsx
```

Purpose:

- module overview
- cards linking to academic years, grade levels, classes, subjects, enrollments
- show simple counts if easy
- no complex charts

### 2. Academic Years and Terms

Path:

```txt
app/(dashboard)/dashboard/academic/years/page.tsx
```

Purpose:

- list academic years
- simple create academic year form
- list terms or include term creation linked to selected academic year if simple

If terms make the page too complex, create:

```txt
app/(dashboard)/dashboard/academic/terms/page.tsx
```

But avoid overbuilding.

### 3. Grade Levels

Path:

```txt
app/(dashboard)/dashboard/academic/grade-levels/page.tsx
```

Purpose:

- list grade levels
- create grade level form

### 4. Classes

Path:

```txt
app/(dashboard)/dashboard/academic/classes/page.tsx
```

Purpose:

- list classes
- create class form
- select academic year and grade level

### 5. Subjects

Path:

```txt
app/(dashboard)/dashboard/academic/subjects/page.tsx
```

Purpose:

- list subjects
- create subject form
- optionally assign subject to grade level if simple

### 6. Class Enrollments

Path:

```txt
app/(dashboard)/dashboard/academic/enrollments/page.tsx
```

Purpose:

- list active enrollments
- enroll a student in a class
- select student from current school students
- select academic year
- select class

Do not implement promotion or transfer workflow now.

---

## Routes Update

Update `constants/routes.ts` carefully.

Add routes such as:

```ts
academic: "/dashboard/academic",
academicYears: "/dashboard/academic/years",
academicGradeLevels: "/dashboard/academic/grade-levels",
academicClasses: "/dashboard/academic/classes",
academicSubjects: "/dashboard/academic/subjects",
academicEnrollments: "/dashboard/academic/enrollments",
```

Do not break existing route references.

---

## Navigation Update

Update `config/navigation.ts` so that:

```txt
الأكاديمي -> /dashboard/academic
```

Remove `placeholder: true` only from the academic item.

Do not activate attendance, grades, timetable, finance, communication, or reports.

---

## UI Component Rules

Use existing shared and shadcn/ui components when possible:

```txt
PageHeader
EmptyState
StatusBadge
Button
Card
Input
Label
Field
NativeSelect
Textarea
```

If a missing shadcn component is truly needed, add the minimum necessary component only.

Do not add a large data-table library.

Do not add complex state management.

Do not add Zustand.

Use server-rendered lists where possible.

Keep UI simple, Arabic, RTL, and dashboard-friendly.

---

## Types

Create or update:

```txt
types/academic.ts
```

Define useful app-level types for:

```txt
AcademicYearStatus
TermStatus
GradeLevelStage
ClassStatus
SubjectType
SubjectStatus
ClassEnrollmentStatus
AcademicYear
Term
GradeLevel
ClassSection
Subject
GradeLevelSubject
ClassEnrollment
```

Prefer deriving from generated `types/database.ts` where practical, similar to `types/students.ts`.

Add Arabic labels and status tones where useful.

After migration and local reset, regenerate:

```bash
supabase gen types typescript --local > types/database.ts
```

If Supabase local is unavailable, keep manual types safe and report it.

---

## Student Enrollment Rules

This is the most sensitive part of Phase 05.

Before enrolling a student, verify server-side:

```txt
1. current user has active membership
2. current role is system_admin or school_admin
3. current membership has school context
4. selected student belongs to same tenant_id and school_id
5. selected class belongs to same tenant_id and school_id
6. selected academic year belongs to same tenant_id and school_id
7. selected class belongs to selected academic_year_id
8. selected class belongs to a grade_level_id
9. enrollment grade_level_id is derived from the class, not trusted from client input
10. student has no other active enrollment in the same academic year
```

Do not trust form-provided `grade_level_id`; derive it from the selected class.

Do not trust form-provided `tenant_id` or `school_id`.

---

## Audit Logs

If practical, write audit logs for:

```txt
academic_year.created
term.created
grade_level.created
class.created
subject.created
grade_level_subject.assigned
student.enrolled
```

Use `public.audit_logs` server-side only.

Do not log secrets or unnecessary private data.

If audit logging adds too much complexity, leave a clear TODO and mention it in the final response.

---

## RLS Rules

Do not implement full production RLS in this phase.

Do not add broad or misleading policies.

Tenant isolation is enforced in this phase through server-side queries and action guards.

Keep schema ready for future RLS through tenant/school columns and indexes.

---

## Documentation Updates

Update `docs/database.md` with:

- Phase 05 tables
- purpose of `academic_years`
- purpose of `terms`
- purpose of `grade_levels`
- purpose of `classes`
- purpose of `subjects`
- purpose of `grade_level_subjects`
- purpose of `class_enrollments`
- reminder that attendance, exams, grades, timetable, and finance remain later phases

Update `docs/project-phases.md`:

- mark Phase 05 academic structure foundation as active/completed depending on implementation
- keep future items future

Update `docs/security-model.md` only if you add academic-specific security notes.

Update `docs/codex-workflow.md` only if a new reusable workflow rule is added.

Do not rewrite docs completely.

---

## Supabase Verification

After migration changes, run when available:

```bash
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
```

Important:

If `supabase db reset` exits with a storage/container health issue but migrations apply, report it exactly and rerun:

```bash
supabase status
```

Do not fake success.

Fix migration errors if they are caused by this phase.

---

## App Verification

Run the best available project checks:

```bash
npm run lint
npm run build
```

If additional scripts exist, use them only if relevant.

Do not hide failures.

If a command fails, report:

- command
- result
- concise error summary
- likely cause
- suggested fix

---

## Git Rules

Follow `AGENTS.md` and `docs/codex-workflow.md`.

If automatic commits are allowed and validation passes, commit only relevant files.

Suggested commit message:

```txt
feat: add academic structure foundation
```

If validation fails, do not commit unless explicitly requested.

---

## Suggested Implementation Order

Follow this order:

1. Inspect current project files and docs.
2. Create the new Supabase migration for academic structure.
3. Add/update `types/academic.ts`.
4. Add `lib/academic/context.ts`.
5. Add academic server-side services.
6. Add `lib/actions/academic.ts`.
7. Create academic overview and management pages.
8. Update routes and navigation.
9. Update documentation minimally.
10. Run Supabase verification.
11. Regenerate database types.
12. Run lint/build.
13. Commit if allowed and validation passes.
14. Summarize results.

---

## Final Response Requirements

When finished, respond with:

1. Summary of implemented Phase 05 foundation
2. Files created/modified
3. Database tables/enums added
4. How tenant/school context is enforced
5. Which roles can do what
6. How student class enrollment works
7. Validation results
8. Any skipped commands and why
9. Warnings/TODOs
10. Suggested next prompt for Phase 06

Keep the final response concise but complete.

---

## Strict Do Not Do List

Do not:

- implement attendance
- implement QR attendance
- implement timetable slots
- implement automatic timetable generation
- implement exams
- implement grades
- implement report cards
- implement finance
- implement communication
- implement holidays/calendar events
- implement teacher workload distribution
- implement student promotion/transfer workflow
- implement full RLS
- implement full RBAC
- create `roles`, `permissions`, `role_permissions`, or `user_roles`
- modify old migrations
- trust tenant/school/role from forms
- expose service-role key
- add unrelated dependencies
- perform broad refactors
- rename existing architecture folders
- bypass TypeScript errors with broad `any`
- hide failed validation commands

---

## Success Criteria

This task is successful when:

- New academic structure schema exists in a new migration.
- Existing migrations are not modified.
- `academic_years`, `terms`, `grade_levels`, `classes`, `subjects`, `grade_level_subjects`, and `class_enrollments` exist or are created by the new migration.
- `/dashboard/academic` works.
- `/dashboard/academic/years` works.
- `/dashboard/academic/grade-levels` works.
- `/dashboard/academic/classes` works.
- `/dashboard/academic/subjects` works.
- `/dashboard/academic/enrollments` works.
- Navigation link for academic module is active.
- Server Actions use authenticated membership context.
- Student enrollment verifies student/class/year ownership server-side.
- No client form can choose trusted tenant/school context.
- Fixed roles are enforced without RBAC.
- `npm run lint` passes or failures are clearly reported.
- `npm run build` passes or failures are clearly reported.
- Supabase verification is run or skipped with a clear reason.

---

## Next Phase Reminder

Do not start the next phase in this task.

Suggested next phase after this one:

```txt
06 - Attendance Manual + QR Foundation
```

Possible Phase 06 scope:

- attendance records
- manual attendance by teacher
- attendance sessions or daily class attendance context
- teacher scans student QR foundation
- absence excuses
- attendance dashboards

Only start Phase 06 after academic structure and class enrollments are stable.
