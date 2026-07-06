# Database

## Purpose

Phase 02 establishes the smallest useful Supabase schema for Ofuq without jumping into business modules. The current foundation is intentionally limited to:

- `tenants`
- `schools`
- `user_profiles`
- `user_memberships`
- `audit_logs`

Attendance, grades, timetable, finance, communication, library, health, and reporting tables remain for later phases.

Phase 04 extends this foundation with the first business-data slice for admissions and students.

Phase 05 adds the academic structure foundation required before attendance, grading, timetabling, and reporting.

## Core tables

### `tenants`

- Represents the top-level organization boundary.
- Uses `slug`, `status`, `locale`, and `direction` so the platform stays Arabic-first and multi-tenant from day one.
- Every tenant-owned table should carry `tenant_id`.

### `schools`

- Belongs to a tenant through `tenant_id`.
- Adds `slug` plus optional contact and branding fields so each school can evolve independently later.
- School-scoped tables should carry both `tenant_id` and `school_id`.

### `user_profiles`

- Mirrors `auth.users.id` instead of storing a separate auth reference column.
- Keeps only profile data needed by the app: name, display preferences, avatar, and phone.
- Auth secrets, passwords, and provider details stay in Supabase Auth.

### `user_memberships`

- Replaces full RBAC for the MVP with fixed roles and tenant or school memberships.
- Supports multiple memberships per user while allowing one primary membership.
- Uses the fixed role enum:
  `system_admin`, `school_admin`, `teacher`, `parent`, `student`, `accountant`, `librarian`.

### `audit_logs`

- Stores security and workflow events for future Server Actions.
- Keeps `tenant_id`, `school_id`, and `actor_user_id` nullable for deletion safety and system-level actions.
- `metadata` is flexible, but must never include secrets.

## Phase 04 tables

### `student_admissions`

- Stores admission requests before a student becomes an official record.
- Uses `tenant_id`, `school_id`, `submitted_by_user_id`, and `reviewed_by_user_id`.
- Keeps the workflow simple with `pending`, `approved`, `rejected`, and `cancelled`.

### `students`

- Stores the official student record created after admission approval.
- Includes `student_number` and `qr_token` foundations without implementing attendance yet.
- Links back to the originating admission through `admission_id` when applicable.

### `student_guardians`

- Stores guardian contact data independently from Auth users.
- Allows future linking to a `guardian_user_id` without requiring a guardian account today.
- Supports one primary guardian per student.

### `student_documents`

- Stores document metadata only, not file bytes.
- Supports either admission-linked or student-linked files.
- Uses the private `student-documents` storage bucket as the intended file destination.

### `student_status_history`

- Captures status transitions such as the initial move into `active`.
- Preserves who changed the status and when.

## Phase 05 tables

### `academic_years`

- Stores school-specific academic years with dates, status, and a single current-year marker per school.
- Uses `tenant_id` and `school_id` on every record.

### `terms`

- Stores terms, semesters, or quarters inside an academic year.
- Keeps term order and dates without adding grading periods yet.

### `grade_levels`

- Stores grade levels such as Grade 1 or Grade 2 with stage and display order.
- Does not implement promotion or transfer flows in this phase.

### `classes`

- Stores class sections inside an academic year and grade level.
- Supports optional capacity, room name, and homeroom teacher reference only.

### `subjects`

- Stores school subjects such as Arabic, Math, and Science.
- Keeps subject type and status without exam configuration or weighting.

### `grade_level_subjects`

- Assigns subjects to grade levels for an academic year.
- Supports required/elective marking and optional weekly periods, but does not generate timetables.

### `class_enrollments`

- Enrolls students in classes for an academic year.
- Enforces one active enrollment per student per academic year through a partial unique index.
- Application code verifies that the student, class, academic year, and derived grade level all belong to the authenticated user's tenant and school before insert.

Attendance, exams, grades, report cards, timetable logic, finance, and reports remain later phases.

## Role model

- The MVP uses fixed roles, not `permissions` or `role_permissions` tables.
- This keeps authorization simple while the product foundation is still forming.
- If permissions become necessary later, they should layer on top of memberships instead of replacing the tenant and school model.

## Multi-tenant rules

- All tenant-owned records must include `tenant_id`.
- School-owned records should also include `school_id`.
- Tenant and school context must be derived server-side from authenticated membership, never trusted from raw client input.

## Storage note

- Student files belong in the private `student-documents` bucket.
- Application code should store only file metadata and storage paths in `student_documents`.
- Attendance, academic structure, and finance remain later-phase modules and are intentionally absent from this slice.

## RLS later

Row Level Security is intentionally deferred in this phase. The later plan is:

- enforce tenant isolation first
- add school-aware policies where data is school-scoped
- rely on membership lookups for user-facing access decisions
- reserve service-role access for narrow server-only administration flows
