# Codex Execution Prompt — 06 Attendance Manual + QR Foundation

## Phase

`06 - Attendance Manual + QR Foundation`

## Role

You are Codex acting as a senior full-stack software engineer working on **Ofuq | أُفُق**, a full-stack Arabic-first school management system.

Your task is to implement the attendance foundation as one focused vertical slice.

This phase must build:

- Manual attendance
- Teacher scans/enters student QR token foundation
- Attendance sessions
- Attendance records
- Absence excuses foundation
- Arabic RTL dashboard pages
- Server-side tenant/school/role/enrollment validation

This phase must **not** implement Beacon, timetable integration, notifications, grades, report cards, or advanced reports.

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
types/database.ts
types/academic.ts
types/students.ts
supabase/migrations/20260706183000_students_admissions_foundation.sql
supabase/migrations/20260706200000_academic_structure_foundation.sql
```

The project is already verified as ready for Phase 06. Do not redo Phase 05.5 documentation work except for required updates after this phase.

---

## Current Project Context

The project already has:

- Supabase Auth email/password login
- Protected dashboard
- Fixed roles through `user_memberships`
- Multi-Tenant tenant/school context from the authenticated active membership
- Students and admissions foundation
- `students.qr_token` foundation
- Academic years, terms, grade levels, classes, subjects, and class enrollments
- `class_enrollments` as the source of active student/class/year assignment
- Supabase local reset and type generation recovered and verified

Use existing patterns and do not rewrite them.

---

## Core Architecture Rules

Follow these rules strictly:

1. Use Server Components by default.
2. Use Client Components only for forms and interactive UI.
3. Use Server Actions and server-side services for mutations.
4. Never trust `tenant_id`, `school_id`, `role`, or user identity from forms.
5. Resolve tenant/school/role from authenticated active membership only.
6. Use fixed roles, not RBAC tables.
7. Do not enable full RLS in this phase.
8. Do not modify old migrations.
9. Add a new migration under `supabase/migrations/` only.
10. Keep Arabic-first RTL UI.
11. Avoid broad dependencies.
12. Keep the slice scoped to attendance only.

---

## Trusted Context Rule

All attendance actions must derive trusted context from server-side membership.

Create a context helper similar to `lib/academic/context.ts`:

```txt
lib/attendance/context.ts
```

Suggested function:

```ts
requireAttendanceContext(allowedRoles)
```

It should rely on existing helpers:

- `requireActiveMembership()`
- `requireRole()`
- `requireSchoolContext()`

Return an object similar to:

```ts
{
  user_id: string
  role: UserRole
  tenant_id: string
  school_id: string
}
```

Allowed management roles for this phase:

```txt
system_admin
school_admin
teacher
```

Only `system_admin`, `school_admin`, and `teacher` may create sessions or record attendance.

For absence excuse review, allow:

```txt
system_admin
school_admin
```

For parent-submitted excuses, either implement a narrow foundation if it fits cleanly, or keep it as schema + admin review placeholder. Do not build a full parent portal.

---

## Database Scope

Create a new migration, for example:

```txt
supabase/migrations/<timestamp>_attendance_manual_qr_foundation.sql
```

Do not modify previous migrations.

### Required Enums

Create these enums if they do not exist:

```sql
attendance_session_method:
  manual
  qr

attendance_session_status:
  open
  closed
  cancelled

attendance_status:
  present
  absent
  late
  excused

attendance_record_method:
  manual
  qr
  system

absence_excuse_status:
  pending
  approved
  rejected
  cancelled
```

Use the project's existing safe enum creation pattern if available.

---

## Required Tables

### 1. `attendance_sessions`

Purpose: represents an attendance session for one class on one date.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid()
tenant_id uuid not null references public.tenants(id) on delete cascade
school_id uuid not null references public.schools(id) on delete cascade
academic_year_id uuid not null references public.academic_years(id) on delete cascade
term_id uuid references public.terms(id) on delete set null
class_id uuid not null references public.classes(id) on delete cascade
taken_by_user_id uuid references public.user_profiles(id) on delete set null
session_date date not null
starts_at time
ends_at time
method public.attendance_session_method not null default 'manual'
status public.attendance_session_status not null default 'open'
notes text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Recommended checks:

```sql
starts_at is null or ends_at is null or starts_at < ends_at
```

Recommended indexes:

```sql
attendance_sessions_tenant_id_idx
attendance_sessions_school_id_idx
attendance_sessions_academic_year_id_idx
attendance_sessions_term_id_idx
attendance_sessions_class_id_idx
attendance_sessions_session_date_idx
attendance_sessions_status_idx
attendance_sessions_method_idx
attendance_sessions_taken_by_user_id_idx
attendance_sessions_tenant_school_date_idx
```

Do not add an overly restrictive unique constraint on `(class_id, session_date)` because future phases may need multiple sessions per day. If you add a duplicate-prevention rule, enforce it carefully in Server Actions instead of hard-locking the schema too early.

Add `updated_at` trigger using existing `public.set_updated_at()`.

---

### 2. `attendance_records`

Purpose: one student's attendance status inside one session.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid()
tenant_id uuid not null references public.tenants(id) on delete cascade
school_id uuid not null references public.schools(id) on delete cascade
attendance_session_id uuid not null references public.attendance_sessions(id) on delete cascade
academic_year_id uuid not null references public.academic_years(id) on delete cascade
class_id uuid not null references public.classes(id) on delete cascade
student_id uuid not null references public.students(id) on delete cascade
class_enrollment_id uuid not null references public.class_enrollments(id) on delete cascade
status public.attendance_status not null default 'present'
method public.attendance_record_method not null default 'manual'
recorded_by_user_id uuid references public.user_profiles(id) on delete set null
recorded_at timestamptz not null default now()
notes text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Required uniqueness:

```sql
unique (attendance_session_id, student_id)
```

Recommended indexes:

```sql
attendance_records_tenant_id_idx
attendance_records_school_id_idx
attendance_records_attendance_session_id_idx
attendance_records_academic_year_id_idx
attendance_records_class_id_idx
attendance_records_student_id_idx
attendance_records_class_enrollment_id_idx
attendance_records_status_idx
attendance_records_method_idx
attendance_records_recorded_at_desc_idx
```

Add `updated_at` trigger.

---

### 3. `absence_excuses`

Purpose: store absence excuse requests for attendance records.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid()
tenant_id uuid not null references public.tenants(id) on delete cascade
school_id uuid not null references public.schools(id) on delete cascade
attendance_record_id uuid not null references public.attendance_records(id) on delete cascade
student_id uuid not null references public.students(id) on delete cascade
submitted_by_user_id uuid references public.user_profiles(id) on delete set null
reviewed_by_user_id uuid references public.user_profiles(id) on delete set null
status public.absence_excuse_status not null default 'pending'
reason text not null
review_notes text
submitted_at timestamptz not null default now()
reviewed_at timestamptz
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Recommended checks:

```sql
btrim(reason) <> ''
```

Recommended uniqueness:

```sql
unique (attendance_record_id)
```

This keeps one current excuse per attendance record in the foundation phase.

Recommended indexes:

```sql
absence_excuses_tenant_id_idx
absence_excuses_school_id_idx
absence_excuses_attendance_record_id_idx
absence_excuses_student_id_idx
absence_excuses_status_idx
absence_excuses_submitted_at_desc_idx
```

Add `updated_at` trigger.

---

## Critical Server-Side Validation

### Before creating an attendance session

Verify server-side:

- Authenticated user exists.
- Active membership exists.
- Role is `system_admin`, `school_admin`, or `teacher`.
- `class_id` belongs to the current `tenant_id` and `school_id`.
- `academic_year_id` belongs to the current `tenant_id` and `school_id`.
- `class.academic_year_id === academic_year_id`.
- If `term_id` is provided, it belongs to the same tenant/school/year.
- Do not trust tenant/school from form values.

### Before recording manual attendance

Verify server-side:

- Attendance session belongs to current tenant/school.
- Attendance session status is `open`.
- Student belongs to current tenant/school.
- Student status is active when available.
- Student has an active `class_enrollments` row for the session's `class_id` and `academic_year_id`.
- The provided `student_id` and `class_enrollment_id`, if provided, cannot bypass server checks.
- Upsert or insert safely without creating duplicate records for the same student/session.

### Before recording QR attendance

Verify server-side:

- Attendance session belongs to current tenant/school.
- Attendance session status is `open`.
- QR token is not blank.
- QR token resolves to a student in the current tenant/school.
- Student is active.
- Student has active class enrollment in the session class/year.
- Do not log the full QR token in audit metadata.

### Before closing a session

Verify server-side:

- Session belongs to current tenant/school.
- User role is allowed.
- Session is not already closed/cancelled.

### Before reviewing absence excuses

Verify server-side:

- Excuse belongs to current tenant/school.
- Related attendance record belongs to current tenant/school.
- Role is `system_admin` or `school_admin`.
- Review status is either `approved` or `rejected`.
- If approved, attendance record may be updated to `excused` if appropriate.

---

## Services to Create

Create small server-only service files:

```txt
lib/attendance/context.ts
lib/attendance/attendance-sessions.ts
lib/attendance/attendance-records.ts
lib/attendance/absence-excuses.ts
```

Use `import "server-only"` in server-side service/context files.

Suggested responsibilities:

### `lib/attendance/attendance-sessions.ts`

- List sessions for current school.
- Get session by id with class/year/term summary.
- Create session.
- Close session.
- Load enrolled students for a session.

### `lib/attendance/attendance-records.ts`

- List records for a session.
- Record manual attendance.
- Record QR attendance.
- Resolve active enrollment for student/session.
- Prevent duplicate attendance records.

### `lib/attendance/absence-excuses.ts`

- List absence excuses.
- Submit absence excuse foundation if clean.
- Review absence excuse.

Keep queries tenant/school scoped.

---

## Server Actions

Create:

```txt
lib/actions/attendance.ts
```

Suggested actions:

```ts
createAttendanceSessionAction
closeAttendanceSessionAction
recordManualAttendanceAction
recordQrAttendanceAction
submitAbsenceExcuseAction
reviewAbsenceExcuseAction
```

Use Zod validation with Arabic user-facing error messages where practical.

Use the existing `ActionResult` helpers.

Do not expose raw database errors directly to the user.

---

## Audit Logs

Write audit logs where practical, following the existing audit log pattern.

Suggested events:

```txt
attendance.session.created
attendance.session.closed
attendance.record.manual_saved
attendance.record.qr_saved
attendance.excuse.submitted
attendance.excuse.approved
attendance.excuse.rejected
```

Rules:

- Do not store secrets.
- Do not store full QR token values.
- Keep metadata operational and minimal.
- Include ids such as session id, class id, student id where useful.

If audit logging would significantly complicate the slice, implement it for core events only and add TODOs for the rest.

---

## Types

Create:

```txt
types/attendance.ts
```

Include lightweight UI/domain types for:

- Attendance session status/method labels
- Attendance record status labels
- Absence excuse status labels
- Form state types if useful

Do not duplicate generated database types unnecessarily.

After migration, regenerate:

```bash
supabase gen types typescript --local > types/database.ts
```

Inspect `types/database.ts` and avoid committing line-ending-only changes unless schema changes are genuinely reflected.

---

## Routes

Update `constants/routes.ts` with attendance routes.

Suggested routes:

```ts
attendance: "/dashboard/attendance",
attendanceSessions: "/dashboard/attendance/sessions",
newAttendanceSession: "/dashboard/attendance/sessions/new",
attendanceSessionDetails: (sessionId: string) =>
  `/dashboard/attendance/sessions/${sessionId}`,
attendanceExcuses: "/dashboard/attendance/excuses",
```

Preserve existing route helpers.

---

## Navigation

Update `config/navigation.ts`:

- Turn `الحضور` from placeholder into an active link to `/dashboard/attendance`.
- Do not activate unrelated placeholder modules.
- Do not implement grades, reports, finance, or timetable navigation beyond existing placeholders.

---

## Pages to Implement

Create Arabic RTL dashboard pages:

```txt
app/(dashboard)/dashboard/attendance/page.tsx
app/(dashboard)/dashboard/attendance/sessions/page.tsx
app/(dashboard)/dashboard/attendance/sessions/new/page.tsx
app/(dashboard)/dashboard/attendance/sessions/[sessionId]/page.tsx
app/(dashboard)/dashboard/attendance/excuses/page.tsx
```

Keep pages simple and functional.

### `/dashboard/attendance`

Purpose: attendance overview.

Show:

- Today's sessions count
- Open sessions count
- Recent sessions
- Quick links to sessions/new/excuses

No charts required.

### `/dashboard/attendance/sessions`

Purpose: list attendance sessions.

Show:

- date
- class
- academic year
- method
- status
- taken by if available
- record count if easy
- link to details

### `/dashboard/attendance/sessions/new`

Purpose: create attendance session.

Form fields:

```txt
academic_year_id
class_id
term_id optional
session_date
method
starts_at optional
ends_at optional
notes optional
```

Do not include tenant/school fields.

### `/dashboard/attendance/sessions/[sessionId]`

Purpose: core attendance-taking page.

Show:

- Session summary
- Enrolled students list from active `class_enrollments`
- Current attendance status for each student
- Manual actions: present/absent/late
- QR token input foundation
- Close session action

For QR input, use a simple form input. Do not add camera scanner dependencies unless trivial and already available.

### `/dashboard/attendance/excuses`

Purpose: absence excuses foundation.

Show:

- excuse list
- student name
- date/session
- status
- reason
- approve/reject actions for allowed roles

If no excuses exist, show a clean empty state.

---

## UI Requirements

- Arabic-first copy.
- RTL layout.
- Use existing dashboard shell and shared components.
- Use shadcn-style UI primitives already in the project.
- Keep forms simple.
- Use accessible labels.
- Use clear empty states.
- Do not overuse animation.
- Do not introduce broad UI libraries.

---

## QR Foundation Rules

This phase implements QR token foundation, not full camera scanning.

Required behavior:

- Teacher/admin opens an attendance session.
- Teacher/admin enters/scans a student's `qr_token` into an input.
- Server Action validates the token and records attendance.

Do not:

- Add Beacon.
- Add GPS/device trust.
- Add camera permission complexity unless trivial.
- Store QR token in logs.
- Trust QR token without enrollment validation.

---

## Absence Excuses Scope

Implement a minimal foundation:

- Table exists.
- Admin/school admin review page exists.
- Review action can approve/reject.
- Optional submit action if it fits cleanly.

Do not implement:

- parent notification
- document upload for excuse
- medical report attachment
- SMS/WhatsApp
- parent portal workflow

Those can come later.

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

Document that Phase 06 added:

- `attendance_sessions`
- `attendance_records`
- `absence_excuses`
- manual attendance
- QR token attendance foundation

Also document that the following remain deferred:

- Beacon
- parent notifications
- advanced attendance reports
- timetable integration
- camera-based scanner if not implemented
- full RLS

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

If type generation only changes line endings, restore the file or avoid committing formatting-only changes.

If any command fails:

- report the command
- report the failure summary
- explain likely cause
- do not hide it
- do not make random unrelated changes to silence it

---

## Git Rules

If validation passes and the project instructions allow committing, commit the completed slice.

Suggested commit message:

```txt
feat: add attendance manual qr foundation
```

Stage only files related to Phase 06.

Do not commit local secrets or generated invalid type output.

---

## Strict Do Not Do List

Do not:

- implement Beacon attendance
- implement GPS/device validation
- implement real camera QR scanner unless trivial and dependency-free
- implement parent notifications
- implement SMS/WhatsApp
- implement timetable integration
- implement automatic session generation from timetable
- implement teacher schedule validation
- implement grades
- implement exams
- implement report cards
- implement advanced reports
- implement finance
- implement communication module
- implement full RLS
- implement full RBAC
- create permissions/role_permissions tables
- trust tenant_id or school_id from forms
- create attendance records for students without active class enrollment
- allow duplicate attendance records for the same student/session
- modify old migrations
- add broad dependencies
- refactor unrelated modules

---

## Success Criteria

This phase is successful when:

1. A new attendance migration exists and replays successfully.
2. `attendance_sessions`, `attendance_records`, and `absence_excuses` exist.
3. Attendance tables are tenant/school scoped.
4. Manual attendance can be recorded for enrolled students.
5. QR token input can record attendance for a valid enrolled student.
6. Students not enrolled in the session class/year cannot be recorded.
7. Duplicate attendance records per student/session are prevented.
8. Attendance dashboard pages exist and are Arabic RTL.
9. Navigation and routes are updated.
10. Documentation is updated.
11. `supabase db reset` passes.
12. `types/database.ts` is regenerated safely.
13. `npm run lint` passes.
14. `npm run build` passes.
15. Final response summarizes files, validation, warnings, and next recommended phase.

---

## Final Response Required

When finished, respond with:

1. Summary of implementation.
2. Files created/modified.
3. Database objects added.
4. Attendance workflow implemented.
5. Security/tenant validation summary.
6. Validation command results.
7. Skipped items with reasons.
8. TODOs.
9. Suggested next prompt.

Suggested next phase after successful Phase 06:

```txt
07 - Grades and Report Cards Foundation
```
