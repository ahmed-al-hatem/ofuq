# Database

## Purpose

Phase 02 establishes the smallest useful Supabase schema for Ofuq without jumping into business modules. The initial foundation is intentionally limited to:

- `tenants`
- `schools`
- `user_profiles`
- `user_memberships`
- `audit_logs`

Communication, library, health, and reporting tables remain for later phases.

Phase 04 extends this foundation with the first business-data slice for admissions and students.

Phase 05 adds the academic structure foundation required before attendance, grading, timetabling, and reporting.

Phase 06 adds the attendance foundation for manual attendance, QR-token attendance entry, attendance sessions, attendance records, and absence excuse review.

Phase 07 adds the grades and report cards foundation for exams, exam results, grade entries, and basic report card snapshots.

Phase 08 adds the manual timetable foundation for rooms, teacher-subject assignments, timetable slots, and server-side conflict prevention.

Phase 09 adds the finance basics foundation for fee structures, fee items, discounts, invoices, invoice items, payments, and basic receipt/payment detail views.

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

Reports remain a later phase.

## Phase 06 tables

### `attendance_sessions`

- Represents one attendance-taking session for a class on a date.
- Uses `tenant_id`, `school_id`, `academic_year_id`, optional `term_id`, and `class_id`.
- Supports `manual` and `qr` methods and the `open`, `closed`, and `cancelled` session states.
- Does not enforce one session per class per day so later timetable or period-based attendance can add multiple daily sessions.

### `attendance_records`

- Stores one student's status inside one attendance session.
- Enforces one record per `(attendance_session_id, student_id)`.
- Carries the active `class_enrollment_id` used to validate that the student belongs to the session class and year.
- Supports `present`, `absent`, `late`, and `excused` statuses and `manual`, `qr`, or `system` record methods.

### `absence_excuses`

- Stores one current excuse request for an attendance record.
- Supports `pending`, `approved`, `rejected`, and `cancelled` statuses.
- Review actions can approve or reject the excuse; approving an absent or late record may update the attendance record to `excused`.

Beacon attendance, parent notifications, timetable integration, camera-based scanning, advanced attendance reports, and full RLS remain deferred.

## Phase 07 tables

### `exams`

- Stores assessment definitions for a class, subject, academic year, and optional term.
- Uses `tenant_id`, `school_id`, `academic_year_id`, `class_id`, derived `grade_level_id`, and `subject_id`.
- Keeps status simple with `draft`, `scheduled`, `completed`, `published`, and `cancelled`.

### `exam_results`

- Stores one student's result for one exam.
- Enforces one result per `(exam_id, student_id)`.
- Application code validates the active class enrollment and checks score upper bounds against the related exam.

### `grade_entries`

- Stores non-exam marks such as quizzes, assignments, homework, projects, participation, behavior, and other entries.
- Carries `class_enrollment_id` resolved server-side after validating that the student is active and enrolled in the selected class/year.
- Enforces local score constraints such as `score <= max_score`.

### `report_cards`

- Stores a basic report card snapshot for one student, class, academic year, and optional term.
- Uses a JSON `summary` for stable display of subject totals and overall percentage.
- This phase does not generate PDFs, rankings, GPA scales, certificate designs, parent notifications, or advanced analytics.

## Phase 08 tables

### `rooms`

- Stores school rooms for manual timetable slot placement.
- Uses `tenant_id`, `school_id`, optional room code, capacity, location, and a simple active/inactive/archive status.
- Keeps room conflicts optional because timetable slots can be created without a room.

### `teacher_subject_assignments`

- Stores which active teacher can teach a subject for a grade level or a specific class in an academic year.
- Uses `tenant_id`, `school_id`, `academic_year_id`, `teacher_user_id`, `subject_id`, and optional `grade_level_id` or `class_id`.
- Application code validates the teacher membership, academic year, subject, grade level, and class ownership before insert.

### `timetable_slots`

- Stores manual timetable entries for a class, subject, teacher, day, time range, academic year, optional term, and optional room.
- Uses `tenant_id`, `school_id`, `academic_year_id`, `class_id`, derived `grade_level_id`, `subject_id`, `teacher_user_id`, and optional `room_id`.
- Application code validates the class/year, term/year, subject, active teacher membership, active teacher-subject assignment, and active room before insert.
- Server-side conflict checks prevent overlapping active slots for the same class, teacher, or room in the same school, year, day, and term context.
- Automatic timetable generation, drag-and-drop editing, attendance integration, room resource calendars, and optimization algorithms remain deferred.

## Phase 09 tables

### `fee_structures`

- Stores school fee plans scoped by tenant, school, and academic year.
- Can optionally target a grade level or class.
- Uses `fee_structure_status` and a simple `currency_code`; exchange rates are not implemented.

### `fee_items`

- Stores line items inside a fee structure.
- Uses `fee_item_type`, amount, optional due date, sort order, and status.
- Amounts are validated as non-negative and are used server-side when generating invoice items.

### `discount_types`

- Stores reusable discount definitions for a school.
- Supports `percentage` and `fixed_amount` values with database constraints for valid ranges.

### `student_discounts`

- Assigns active discount types to active students for an academic year and optional term.
- Supports optional start/end dates and status tracking.

### `invoices`

- Stores student invoices with invoice number, issue/due dates, academic year, optional term, optional class enrollment, totals, status, and issuing metadata.
- Invoice numbers are unique per tenant and school.
- Subtotal, discount, total, paid, balance, and status are calculated by server-side finance services rather than trusted from client forms.

### `invoice_items`

- Stores invoice line details derived from active fee items.
- Keeps quantity, unit amount, discount amount, total amount, and ordering fields.

### `payments`

- Stores manual payment and receipt records for invoices.
- Receipt numbers are unique per tenant and school.
- Payment amount must be positive; payment gateway data, card details, refunds, and reconciliation remain deferred.

## Role model

- The MVP uses fixed roles, not `permissions` or `role_permissions` tables.
- This keeps authorization simple while the product foundation is still forming.
- If permissions become necessary later, they should layer on top of memberships instead of replacing the tenant and school model.

## Multi-tenant rules

- All tenant-owned records must include `tenant_id`.
- School-owned records should also include `school_id`.
- Tenant and school context must be derived server-side from authenticated membership, never trusted from raw client input.
- Attendance mutations verify session, class, academic year, term, student, and active enrollment ownership server-side before writes.
- Grades mutations verify exam, class, academic year, term, subject, student, and active enrollment ownership server-side before writes.
- Timetable mutations verify rooms, teacher assignments, classes, academic years, terms, subjects, and conflict checks server-side before writes.
- Finance mutations derive tenant and school scope from authenticated membership, validate students, academic years, terms, fee structures, discounts, invoices, and payments server-side, and do not trust client-submitted totals.

## Storage note

- Student files belong in the private `student-documents` bucket.
- Application code should store only file metadata and storage paths in `student_documents`.
- Attendance absence excuses store text reasons only; document uploads can be added later if needed.
- Report card snapshots store summary JSON only; generated PDF files and template assets remain deferred.
- Finance receipt/payment detail views are application views only; invoice and receipt PDF generation remains deferred.

## RLS later

Row Level Security is intentionally deferred in this phase. The later plan is:

- enforce tenant isolation first
- add school-aware policies where data is school-scoped
- rely on membership lookups for user-facing access decisions
- reserve service-role access for narrow server-only administration flows
