# Database

## Purpose

Phase 02 establishes the smallest useful Supabase schema for Ofuq without jumping into business modules. The initial foundation is intentionally limited to:

- `tenants`
- `schools`
- `user_profiles`
- `user_memberships`
- `audit_logs`

Business tables are added one vertical slice at a time in the phase sections below.

Phase 04 extends this foundation with the first business-data slice for admissions and students.

Phase 05 adds the academic structure foundation required before attendance, grading, timetabling, and reporting.

Phase 06 adds the attendance foundation for manual attendance, QR-token attendance entry, attendance sessions, attendance records, and absence excuse review.

Phase 07 adds the grades and report cards foundation for exams, exam results, grade entries, and basic report card snapshots.

Phase 08 adds the manual timetable foundation for rooms, teacher-subject assignments, timetable slots, and server-side conflict prevention.

Phase 09 adds the finance basics foundation for fee structures, fee items, discounts, invoices, invoice items, payments, and basic receipt/payment detail views.

Phase 10 adds the communication and ready-made reports foundation for internal messages, announcements, in-app notification logs, school events, and server-rendered report pages.

Phase 11 adds the library foundation for book catalog records, physical book copies, student loans, return handling, and overdue visibility.

Phase 12 adds the student-care foundation for basic health records, vaccinations, clinic visits, discipline records, and student achievements.

Phase 13 adds the feedback foundation for complaints, complaint updates, surveys, survey questions, and survey responses.

Phase 16 adds the parent/student read-only portal foundation by introducing a direct `students.student_user_id` link and server-side read scope over existing attendance, grades, timetable, finance, library, and communication data.

Phase 18 adds the settings and integrations placeholders foundation with school-scoped settings persistence, placeholder integration records, and local message templates.

Phase 25A adds the chat UI and assistant schema foundation with internal chat history tables plus separate AI conversation history tables.

Phase 25B extends that foundation with the `school_office` conversation type, a per-portal-user uniqueness guard for school-office threads, and local Supabase Realtime publication support for `chat_messages`.

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
- Includes nullable `student_user_id` so a signed-in `student` user can be linked directly to exactly one student record for the read-only portal foundation.

### `student_guardians`

- Stores guardian contact data independently from Auth users.
- Supports optional `guardian_user_id` linking to `public.user_profiles.id`, which now powers parent portal access for linked students.
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

## Phase 10 tables

### `messages`

- Stores internal school messages between application users.
- Uses `tenant_id`, `school_id`, `sender_user_id`, subject/body, optional `related_student_id`, and simple status tracking.
- Attachments, real-time delivery, and external sending are not implemented.

### `message_recipients`

- Stores one recipient row per message recipient, including `read_at` and recipient-specific `archived_at`.
- Enforces one row per `(message_id, recipient_user_id)`.
- Recipient ownership is validated server-side through active school membership.

### `announcements`

- Stores school announcements as drafts, published items, or archived items.
- Targets are intentionally simple: whole school, fixed role, grade level, or class.
- Target grade/class ownership is validated server-side before writes.

### `notification_logs`

- Stores internal in-app notification log rows only.
- The only supported channel is `in_app`.
- Email, SMS, WhatsApp, push providers, provider payloads, and secrets are not part of this phase.

### `school_events`

- Stores simple school events with start/end times, optional location, target audience, and scheduled/cancelled/completed/archived status.
- Recurrence and external calendar sync are deferred.

## Phase 25A tables

### `chat_conversations`

- Stores internal conversation containers scoped by `tenant_id` and `school_id`.
- Uses `internal` plus the Phase 25B `school_office` conversation type, alongside `open`, `closed`, and `archived` states.
- `created_by_user_id` references `public.user_profiles.id`, matching the rest of the application schema.
- School-office conversations keep the portal owner in `metadata` and use an expression unique index to avoid duplicate parent/student school-office threads inside the same school.

### `chat_participants`

- Stores one participant row per internal conversation membership.
- Keeps the participant's fixed `user_role`, join timestamp, optional last-read timestamp, mute flag, and metadata object.
- Enforces one row per `(conversation_id, user_id)`.
- Phase 25B now uses this table for the actual portal user plus school-admin participants in the school-office MVP flow.

### `chat_messages`

- Stores internal chat message history for realtime delivery and message-thread persistence.
- Supports only `text` and `system` message types in this phase.
- Phase 25B activates the send flow for school-office messages, while editing, deletion, and attachments remain deferred.

### `chat_message_reads`

- Stores per-user read tracking for chat messages.
- Enforces one row per `(message_id, user_id)`.
- Phase 25B now writes read rows and updates participant `last_read_at` when an authorized user opens the conversation.

### `ai_conversations`

- Stores persisted assistant chat sessions per user, tenant, and school.
- Uses the current fixed `user_role` plus a simple `role_scoped` scope marker to reinforce server-built context boundaries.
- `updated_at` is refreshed when assistant or user messages are added so session ordering reflects the latest interaction cleanly.

### `ai_messages`

- Stores AI conversation history rows with `user`, `assistant`, or `system` roles.
- Includes optional `model` and `token_estimate` columns for Gemini auditing and safe usage metadata capture.
- No SQL execution, raw provider payload storage, raw secrets, or unrestricted context storage is introduced in this phase.

## Phase 10 ready-made reports

Ready-made reports are implemented as server-side query services and dashboard pages only. No report-builder tables were added.

- Student roster report.
- Attendance summary report.
- Grades summary report.
- Finance balances report.
- Timetable overview report.

## Phase 11 tables

### `book_catalog`

- Stores bibliographic book records scoped by `tenant_id` and `school_id`.
- Includes title, optional ISBN, author, publisher, publication year, category, language, description, cover URL, status, and creator metadata.
- ISBN is unique per tenant and school when present.
- Does not store e-book files or perform external ISBN lookups.

### `book_copies`

- Stores physical copies linked to `book_catalog`.
- Includes optional barcode text, accession number, shelf location, copy condition, copy status, notes, and creator metadata.
- Barcode and accession number are unique per tenant and school when present.
- Copy status controls loan availability; barcode scanner hardware integration is not implemented.

### `book_loans`

- Tracks student borrowing and returning physical copies.
- Links tenant, school, copy, catalog, student, issuing user, optional returning user, borrow/due/return timestamps, status, and notes.
- A partial unique index prevents more than one active loan for the same copy.
- Loan issue sets the copy to `loaned`; return sets the loan to `returned` and returns a `loaned` copy to `available`.
- Overdue visibility is computed from active loans with `due_at < now()`; no fine billing or finance integration exists yet.

## Phase 12 tables

### `health_records`

- Stores one active school health profile per student where practical.
- Keeps only school-operational fields such as blood type, allergies, chronic conditions, medications, emergency notes, and doctor contact.
- Uses a partial unique index so one active health record per student is enforced per tenant and school.
- Does not store diagnoses, prescriptions, or medical file uploads.

### `vaccinations`

- Stores student vaccination records with simple status tracking.
- Supports vaccine name, optional dose label, optional vaccination date, optional next due date, and notes.
- Uses a date-order constraint so `next_due_on` cannot be earlier than `vaccinated_on`.
- Reminder flows and parent notifications are deferred.

### `clinic_visits`

- Stores simple school clinic visits or health incidents handled inside the school.
- Supports reason, symptoms, action taken, guardian-contacted flag, referral flag, and close state.
- Open visits can be closed later; referred visits keep the same record without external integration.
- Medical diagnosis, prescriptions, and hospital integration are out of scope.

### `discipline_records`

- Stores student discipline incidents with incident type, severity, title, description, action taken, and review status.
- Teachers can create records; review and final resolution remain limited to fixed admin roles in server-side code.
- Review metadata stores reviewer identity and review time once a record moves to `reviewed` or `resolved`.
- Advanced sanction workflows, escalation ladders, and parent notifications remain deferred.

### `achievements`

- Stores student achievements and recognitions with date, category, level, and publication status.
- New achievements start as drafts and can later be published or archived by fixed admin roles.
- The table supports school-facing recognition tracking only.
- PDF certificates, parent notifications, and advanced analytics are not implemented.

## Phase 13 tables

### `complaints`

- Stores authenticated school-scoped complaint tickets submitted by internal staff users.
- Uses `tenant_id`, `school_id`, `submitted_by_user_id`, optional `student_id`, optional `assigned_to_user_id`, priority, category, status, and optional resolution metadata.
- Server-side code validates complaint/student ownership inside the active tenant and school before insert or update.
- Anonymous/public complaints and file attachments are not implemented.

### `complaint_updates`

- Stores timeline updates for comments, internal notes, assignment changes, status changes, and resolution notes.
- Uses `tenant_id`, `school_id`, `complaint_id`, `author_user_id`, `update_type`, and optional old/new status fields for workflow transitions.
- Internal notes stay in the complaint timeline table, while audit logs store only minimal IDs and status metadata.

### `surveys`

- Stores school-scoped survey headers with simple target metadata for school, role, grade level, or class.
- Uses `tenant_id`, `school_id`, `created_by_user_id`, optional schedule fields, and draft/published/closed/archived status.
- Grade and class targets are validated server-side against the current school.
- Public survey links and anonymous survey access are not implemented.

### `survey_questions`

- Stores ordered survey questions with simple answer types: short text, long text, single choice, multiple choice, rating, and yes/no.
- Uses `options` JSON only where needed for choice/rating questions.
- Drag-and-drop builders and branching logic are intentionally out of scope for this phase.

### `survey_responses`

- Stores one authenticated response per user per survey with JSON answer payloads.
- Uses `tenant_id`, `school_id`, `survey_id`, `respondent_user_id`, optional `student_id`, and a unique `(survey_id, respondent_user_id)` constraint.
- Server-side code prevents duplicate responses and blocks draft/closed/archived surveys from receiving answers.

## Phase 18 tables

### `school_settings`

- Stores one school-scoped settings record per `(tenant_id, school_id)`.
- Includes local display name, timezone, locale, direction, academic-week start, branding JSON, and module-flag JSON.
- Branding and module flags are validated as JSON objects and are used as UI/settings foundations only in this phase.

### `integration_settings`

- Stores one school-scoped placeholder record per provider such as WhatsApp, webhooks, MoE, calendar, BI, and automation tools.
- Includes provider, display name, placeholder/configured status, enabled flag, and settings JSON.
- No real API secrets, tokens, delivery payloads, OAuth refresh data, or external sync state are stored in this phase.

### `message_templates`

- Stores school-scoped local message-template records keyed by `template_key` and `channel`.
- Supports `in_app`, `email`, `sms`, and `whatsapp` channel labels for future growth, but no sending occurs in this phase.
- Templates are editable foundations only and do not imply delivery-provider support.

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
- Communication mutations derive tenant and school scope from authenticated membership, validate recipients, related students, announcement targets, and event targets server-side, and do not trust client-submitted tenant, school, or role values.
- Ready-made reports derive tenant and school scope from authenticated membership and write minimal `reports.viewed` audit logs.
- Portal reads derive tenant and school scope from authenticated membership, then intersect that scope with linked students only. Parent links come from `student_guardians.guardian_user_id`; student self-links come from `students.student_user_id`.
- Library mutations derive tenant/school/user scope from authenticated membership, validate catalog, copy, student, and loan ownership server-side, and do not trust client-submitted tenant, school, role, or actor fields.
- Student-care mutations derive tenant/school/user scope from authenticated membership, validate student ownership server-side, and do not trust client-submitted tenant, school, role, or actor fields.
- Feedback mutations derive tenant/school/user scope from authenticated membership, validate complaint ownership, related students, assignee memberships, survey targets, and survey response eligibility server-side, and do not trust client-submitted tenant, school, role, or actor fields.
- Settings mutations derive tenant/school/user scope from authenticated membership, validate fixed admin roles server-side, and do not trust submitted tenant, school, role, or actor fields.

## Storage note

- Student files belong in the private `student-documents` bucket.
- Application code should store only file metadata and storage paths in `student_documents`.
- Attendance absence excuses store text reasons only; document uploads can be added later if needed.
- Report card snapshots store summary JSON only; generated PDF files and template assets remain deferred.
- Finance receipt/payment detail views are application views only; invoice and receipt PDF generation remains deferred.
- Phase 10 reports are application views only; PDF/Excel export and drag-and-drop report builder remain deferred.
- Phase 11 library stores book metadata and physical copy records only. Public library portals, e-book lending, barcode hardware, and finance fine billing remain deferred.
- Phase 12 student care stores text-first operational records only. Medical uploads, prescriptions, diagnosis workflows, parent alerts, and PDF certificates remain deferred.
- Phase 13 feedback stores internal operational records only. Anonymous/public complaint forms, public survey links, file attachments, AI analysis, external notifications, and advanced survey branching remain deferred.
- Phase 16 parent/student portal is read-only. It does not add payment uploads, excuse attachments, complaints, surveys, profile edits, or health/discipline document access.
- Phase 18 settings and integrations are local-only foundations. They do not add external provider secrets, WhatsApp/SMS/email sending, webhook delivery, calendar sync, BI embedding, Zapier/Make execution, backup/restore, or sandbox features.

## RLS later

Row Level Security is intentionally deferred in this phase. The later plan is:

- enforce tenant isolation first
- add school-aware policies where data is school-scoped
- rely on membership lookups for user-facing access decisions
- reserve service-role access for narrow server-only administration flows
