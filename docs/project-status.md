# Project Status

## Snapshot

- Project name: Ofuq | أُفُق
- Current phase: Phase 16 Parent and Student Read-Only Portal Foundation closed
- Last completed implementation phase: Phase 16 Parent and Student Read-Only Portal Foundation
- Last completed quality phase: Phase 16 Parent and Student Read-Only Portal Foundation Verification
- Next implementation phase: Phase 17 planning is open; choose the next slice separately
- Architecture summary: full-stack Next.js App Router application backed by Supabase Auth and Supabase PostgreSQL, using fixed roles from `user_memberships` and multi-tenant tenant/school context from the authenticated active membership.

## Tech Stack

| Area | Current Stack |
| --- | --- |
| Framework | Next.js 16.2.10 |
| UI runtime | React 19.2.4, React DOM 19.2.4 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, `tw-animate-css` |
| Supabase | `@supabase/ssr` 0.12.0, `@supabase/supabase-js` 2.110.0, Supabase CLI/local PostgreSQL |
| UI primitives | shadcn/ui-style source components, Base UI, Hugeicons components, Lucide React 1.23.0 |
| Motion | framer-motion 12.42.2 |
| Validation/forms | Zod 4.4.3, React Hook Form 7.81.0, `@hookform/resolvers` 5.4.0 |
| Utilities | `clsx`, `tailwind-merge`, `class-variance-authority`, `date-fns` |
| Testing | Vitest 4, jsdom, Testing Library foundation |

## Completed Phases

| Phase | Status | Summary |
| --- | --- | --- |
| Phase 01 Project Setup and Architecture | Done | Next.js App Router foundation, RTL Arabic root, Tailwind/shadcn-style UI primitives, dashboard shell, and base docs. |
| Phase 02 Supabase Core Schema Foundation | Done | Core `tenants`, `schools`, `user_profiles`, `user_memberships`, and `audit_logs` schema foundation. |
| Phase 03 Auth + Fixed Roles + Membership Context | Done | Email/password login, sign-out, protected dashboard layout, session helpers, fixed role guards, and active membership context. |
| Phase 04 Students and Admissions Foundation | Done | Admissions workflow, student records, guardian links, document metadata, status history, and student QR token foundation. |
| Phase 05 Academic Structure Foundation | Done | Academic years, terms, grade levels, classes, subjects, grade-level subject assignments, class enrollments, and academic dashboard pages. |
| Phase 05.5 Quality Gate + Documentation Snapshot | Done | Documentation snapshot and verification report were created. The Supabase local reset/type-generation blocker was resolved and the project is ready for Phase 06. |
| Phase 06 Attendance Manual + QR Foundation | Done | Attendance sessions, attendance records, absence excuses, manual attendance, QR-token attendance entry, and Arabic dashboard pages. |
| Phase 07 Grades and Report Cards Foundation | Done | Exams, exam results, grade entries, basic report card snapshots, and Arabic dashboard pages. |
| Phase 07.5 Local Smoke Seed + Grades/Attendance Workflow Verification | Done | Deterministic local smoke seed, SQL spot checks, technical verification, and honest browser workflow status. |
| Phase 08 Manual Timetable with Conflict Prevention Foundation | Done | Rooms, teacher-subject assignments, timetable slots, overlap checks, and Arabic dashboard pages. |
| Phase 09 Finance Basics Foundation | Done | Fee structures, fee items, discounts, invoices, invoice items, manual payments, and basic receipt/payment detail views. |
| Phase 09.2 Finance Closure After Manual Supabase Recovery | Done | Supabase reset, type generation, finance SQL spot checks, local Auth sanity, lint, build, diff check, and documentation closure. |
| Phase 10 Communication and Ready-Made Reports Foundation | Done | Internal messages, announcements, notification logs, school events, and ready-made report pages. |
| Phase 11 Library Foundation | Done | Book catalog, physical copies, student loans, returns, overdue visibility, and Arabic dashboard pages. |
| Phase 12 Health, Discipline, and Achievements Foundation | Done | Basic health records, vaccinations, clinic visits, discipline records, achievements, and Arabic dashboard pages. |
| Phase 13 Complaints and Surveys Foundation | Done | Complaint submission/review workflow, surveys, survey questions, survey responses, and Arabic feedback dashboard pages. |
| Phase 14 Syrian Demo Dataset Foundation | Done | Deterministic local-only Syrian demo tenant, users, and cross-module seed data are verified through the split seed architecture, successful `supabase db reset`, passing SQL spot checks, and local Auth token/default safety checks. |
| Phase 15 Automated Tests Foundation | Done | Vitest foundation, unit tests for routes/navigation/roles/helpers, manual DB smoke SQL checks, and local test documentation are in place. |
| Phase 16 Parent and Student Read-Only Portal Foundation | Done | `/portal` overview, linked students, attendance, grades, timetable, finance, library, announcements, and profile pages now exist with server-side linked-student scoping and no portal mutations. |

## Current Implemented Modules

- Auth foundation with Supabase Auth email/password login and sign-out.
- Tenant/school membership foundation through `public.user_memberships`.
- Fixed role checks for MVP roles without full RBAC.
- Students and admissions foundation, including admission creation/approval and student records.
- Academic structure foundation, including years, terms, grades, classes, subjects, subject assignments, and class enrollments.
- Attendance foundation, including manual attendance, QR-token entry, session close flow, and absence excuse review.
- Grades foundation, including exams, exam result entry, grade entries, and basic report-card snapshots/views.
- Manual timetable foundation, including rooms, teacher-subject assignments, timetable slots, and class/teacher/room conflict prevention.
- Finance basics foundation, including fee structures, fee items, discounts, invoices, invoice items, payments, and basic receipt/payment detail views.
- Communication foundation, including internal messages, announcements, in-app notification logs, and school events.
- Ready-made reports for students, attendance, grades, finance balances, and timetable overview.
- Library foundation, including book catalog records, physical copies, loan issue/return flow, and overdue visibility.
- Student-care foundation, including basic health records, vaccinations, clinic visits, discipline records, and achievements.
- Feedback foundation, including complaints, complaint updates, surveys, survey questions, and survey responses.
- Deterministic local Syrian demo dataset, including fixed-role demo Auth users and fictional cross-module school data for local smoke workflows.
- Parent/student read-only portal foundation, including server-rendered `/portal` pages scoped to linked students for `parent` and `student` roles.
- Dashboard shell and navigation with Arabic-first RTL UI.

AI Query, chatbot, external integrations, and report builder are not implemented yet.

## Current Routes

| Route | Status | Notes |
| --- | --- | --- |
| `/` | Active | Public home route. |
| `/login` | Active | Supabase email/password login. |
| `/portal` | Active | Read-only parent/student portal overview. |
| `/portal/students` | Active | Linked student list for the signed-in parent or student. |
| `/portal/students/[studentId]` | Active | Read-only linked student details. |
| `/portal/attendance` | Active | Read-only attendance view for linked students. |
| `/portal/grades` | Active | Read-only grades, exam results, and report-card snapshots for linked students. |
| `/portal/timetable` | Active | Read-only timetable view for linked students' active classes. |
| `/portal/finance` | Active | Parent-facing linked-student finance visibility; student role sees a restricted read-only note. |
| `/portal/library` | Active | Read-only active and historical book-loan view for linked students. |
| `/portal/announcements` | Active | Read-only published announcements and school events relevant to linked students. |
| `/portal/profile` | Active | Read-only membership/profile summary for the signed-in portal user. |
| `/dashboard` | Active | Protected dashboard overview. |
| `/dashboard/admissions` | Active | Admissions list and management actions. |
| `/dashboard/admissions/new` | Active | Admission creation form. |
| `/dashboard/students` | Active | Official student records. |
| `/dashboard/academic` | Active | Academic module overview. |
| `/dashboard/academic/years` | Active | Academic years and terms. |
| `/dashboard/academic/grade-levels` | Active | Grade levels. |
| `/dashboard/academic/classes` | Active | Classes/sections. |
| `/dashboard/academic/subjects` | Active | Subjects and grade-level subject assignments. |
| `/dashboard/academic/enrollments` | Active | Student class enrollments. |
| `/dashboard/attendance` | Active | Attendance overview. |
| `/dashboard/attendance/sessions` | Active | Attendance session list. |
| `/dashboard/attendance/sessions/new` | Active | Create an attendance session. |
| `/dashboard/attendance/sessions/[sessionId]` | Active | Manual and QR-token attendance-taking page. |
| `/dashboard/attendance/excuses` | Active | Absence excuse review foundation. |
| `/dashboard/grades` | Active | Grades and report cards overview. |
| `/dashboard/grades/exams` | Active | Exams list. |
| `/dashboard/grades/exams/new` | Active | Exam creation form. |
| `/dashboard/grades/exams/[examId]` | Active | Exam details and per-student result entry. |
| `/dashboard/grades/entries` | Active | Non-exam grade entry form and list. |
| `/dashboard/grades/report-cards` | Active | Report card generation and list. |
| `/dashboard/grades/report-cards/[reportCardId]` | Active | Basic report card snapshot view. |
| `/dashboard/timetable` | Active | Timetable overview. |
| `/dashboard/timetable/rooms` | Active | Room management. |
| `/dashboard/timetable/assignments` | Active | Teacher-subject assignments. |
| `/dashboard/timetable/slots` | Active | Timetable slot list and cancellation. |
| `/dashboard/timetable/slots/new` | Active | Manual timetable slot creation with conflict checks. |
| `/dashboard/finance` | Active | Finance overview. |
| `/dashboard/finance/fees` | Active | Fee structures and fee items. |
| `/dashboard/finance/discounts` | Active | Discount types and student discounts. |
| `/dashboard/finance/invoices` | Active | Invoice list. |
| `/dashboard/finance/invoices/new` | Active | Generate invoice from fee structure. |
| `/dashboard/finance/invoices/[invoiceId]` | Active | Invoice detail, issue/cancel actions, and payment entry. |
| `/dashboard/finance/payments` | Active | Payment list. |
| `/dashboard/finance/payments/[paymentId]` | Active | Basic receipt/payment detail view. |
| `/dashboard/communication` | Active | Communication overview. |
| `/dashboard/communication/messages` | Active | Inbox and sent internal messages. |
| `/dashboard/communication/messages/new` | Active | Internal message creation. |
| `/dashboard/communication/messages/[messageId]` | Active | Message details, read/archive actions for recipients. |
| `/dashboard/communication/announcements` | Active | Announcement list and publish/archive actions for admins. |
| `/dashboard/communication/announcements/new` | Active | Announcement draft creation. |
| `/dashboard/communication/events` | Active | School event list and cancel action for admins. |
| `/dashboard/communication/events/new` | Active | School event creation. |
| `/dashboard/communication/notifications` | Active | In-app notification logs. |
| `/dashboard/feedback` | Active | Feedback overview. |
| `/dashboard/feedback/complaints` | Active | Complaint list and complaint workflow overview. |
| `/dashboard/feedback/complaints/new` | Active | Complaint submission form. |
| `/dashboard/feedback/complaints/[complaintId]` | Active | Complaint details, updates, assignment, and resolution actions. |
| `/dashboard/feedback/surveys` | Active | Survey list and visibility by role. |
| `/dashboard/feedback/surveys/new` | Active | Survey draft creation form for admins. |
| `/dashboard/feedback/surveys/[surveyId]` | Active | Survey details, questions, and admin workflow actions. |
| `/dashboard/feedback/surveys/[surveyId]/respond` | Active | Authenticated survey response form. |
| `/dashboard/feedback/surveys/[surveyId]/responses` | Active | Admin-only survey response summaries. |
| `/dashboard/reports` | Active | Ready-made reports overview. |
| `/dashboard/reports/students` | Active | Student roster report. |
| `/dashboard/reports/attendance` | Active | Attendance summary report. |
| `/dashboard/reports/grades` | Active | Grades summary report. |
| `/dashboard/reports/finance` | Active | Finance balances report. |
| `/dashboard/reports/timetable` | Active | Timetable overview report. |
| `/dashboard/student-care` | Active | Student-care overview. |
| `/dashboard/student-care/health` | Active | Health record list. |
| `/dashboard/student-care/health/[studentId]` | Active | Per-student health record upsert view. |
| `/dashboard/student-care/vaccinations` | Active | Vaccination list and creation form. |
| `/dashboard/student-care/clinic-visits` | Active | Clinic visit list with close action. |
| `/dashboard/student-care/clinic-visits/new` | Active | Clinic visit creation form. |
| `/dashboard/student-care/discipline` | Active | Discipline list with admin review actions. |
| `/dashboard/student-care/discipline/new` | Active | Discipline record creation form. |
| `/dashboard/student-care/achievements` | Active | Achievement list with publish/archive actions. |
| `/dashboard/student-care/achievements/new` | Active | Achievement creation form. |
| `/dashboard/library` | Active | Library overview cards and quick links. |
| `/dashboard/library/catalog` | Active | Book catalog list. |
| `/dashboard/library/catalog/new` | Active | Book catalog creation form. |
| `/dashboard/library/catalog/[catalogId]` | Active | Catalog detail and related copies. |
| `/dashboard/library/copies` | Active | Physical book copy list and simple lost/damaged actions. |
| `/dashboard/library/copies/new` | Active | Physical copy creation form. |
| `/dashboard/library/loans` | Active | Loan list with overdue indicator. |
| `/dashboard/library/loans/new` | Active | Student loan issue form. |
| `/dashboard/library/loans/[loanId]` | Active | Loan detail and return action when active. |
| `/dashboard/library/overdue` | Active | Basic overdue active-loan view. |

Configured dynamic helpers also exist for admission and student detail URLs, but matching route files are not currently present.

## Current Database Slices

- Core tenant/auth tables: `tenants`, `schools`, `user_profiles`, `user_memberships`, `audit_logs`.
- Students/admissions tables: `student_admissions`, `students`, `student_guardians`, `student_documents`, `student_status_history`.
- Academic structure tables: `academic_years`, `terms`, `grade_levels`, `classes`, `subjects`, `grade_level_subjects`, `class_enrollments`.
- Attendance tables: `attendance_sessions`, `attendance_records`, `absence_excuses`.
- Grades tables: `exams`, `exam_results`, `grade_entries`, `report_cards`.
- Timetable tables: `rooms`, `teacher_subject_assignments`, `timetable_slots`.
- Finance tables: `fee_structures`, `fee_items`, `discount_types`, `student_discounts`, `invoices`, `invoice_items`, `payments`.
- Communication tables: `messages`, `message_recipients`, `announcements`, `notification_logs`, `school_events`.
- Library tables: `book_catalog`, `book_copies`, `book_loans`.
- Student-care tables: `health_records`, `vaccinations`, `clinic_visits`, `discipline_records`, `achievements`.
- Feedback tables: `complaints`, `complaint_updates`, `surveys`, `survey_questions`, `survey_responses`.
- Storage foundation: private `student-documents` bucket is created by the student/admissions migration.
- Portal identity link: `students.student_user_id` now supports direct student-to-user linking for the read-only portal.
- Local Supabase replay for the Phase 16 schema slice was revalidated with `supabase start`, local type generation, and manual DB smoke SQL. Direct `supabase db reset` exit is still intermittently unstable on this Windows Docker setup.
- Local seed order now applies `supabase/seed.sql`, `supabase/seeds/local_syrian_demo_00_helpers.sql`, `supabase/seeds/local_syrian_demo_01_create_stage_tables.sql`, `supabase/seeds/local_syrian_demo_02_stage_data.sql`, `supabase/seeds/local_syrian_demo_03_apply.sql`, `supabase/seeds/local_syrian_demo_04_cleanup.sql`, then `supabase/seeds/auth_smoke_token_defaults.sql`.
- Local type generation is currently verified with `supabase gen types typescript --local > types/database.ts`.
- RLS remains deferred by design; tenant/school isolation is currently enforced in server-side code and schema constraints.

## Current Security Model

- Supabase Auth is the identity source of truth.
- `public.user_profiles` stores application profile data with IDs matching `auth.users.id`.
- `public.user_memberships` stores fixed roles and tenant/school membership context.
- Server-side helpers resolve the authenticated user, primary active membership, role, tenant, and school.
- Sensitive reads and mutations use Server Components, Server Actions, or server-side service modules.
- Client-submitted `tenant_id`, `school_id`, and `role` are not trusted.
- Finance mutations derive tenant/school/user scope from active membership and calculate financial totals server-side.
- Communication mutations derive tenant/school scope from active membership and validate recipients, related students, announcement targets, and event targets server-side.
- Ready-made report pages derive tenant/school scope from active membership and write minimal `reports.viewed` audit logs.
- Portal reads derive tenant/school/user scope from the active membership and linked student relationships only. `parent` access uses `student_guardians.guardian_user_id`; `student` access uses `students.student_user_id`.
- Portal routes are read-only in this phase and do not allow payments, absence excuses, complaints, surveys, profile edits, or health/discipline detail access.
- Library mutations derive tenant/school/user scope from active membership, validate catalog/copy/student/loan relationships server-side, and write minimal audit logs for catalog, copy, loan issue, loan return, lost, and damaged actions.
- Student-care mutations derive tenant/school/user scope from active membership, validate student ownership server-side, and write minimal audit logs without sensitive medical payloads.
- Feedback mutations derive tenant/school/user scope from active membership, validate complaint relationships, survey targets, and duplicate response prevention server-side, and write minimal audit logs without complaint text or survey answers.
- Full RBAC is not implemented.
- Full RLS is not implemented yet.
- `SUPABASE_SERVICE_ROLE_KEY` remains server-only.

## Current Documentation

- `docs/architecture.md`
- `docs/database.md`
- `docs/security-model.md`
- `docs/supabase-local.md`
- `docs/local-auth-smoke-troubleshooting.md`
- `docs/project-phases.md`
- `docs/codex-workflow.md`
- `docs/project-status.md`
- `docs/testing.md`
- `docs/verification-report.md`
- `docs/verification-phase-06.md`
- `docs/verification-phase-07.md`
- `docs/requirements-roadmap.md`

## Current Known Limitations

- Communication is internal/in-app only; no real-time chat or external notification providers are implemented.
- Library is an operational foundation only; no fine billing, finance integration, barcode hardware, ISBN lookup, reservations, public portal, e-book storage, or advanced analytics are implemented.
- Student care is an operational foundation only; no diagnosis, prescriptions, medical uploads, parent notifications, PDF certificates, AI analysis, or behavior-risk scoring are implemented.
- Feedback is an operational foundation only; no anonymous/public complaint forms, public survey links, attachments, external notifications, AI analysis, advanced branching, or escalation automation are implemented.
- Finance basics foundation is implemented: fee structures, fee items, discounts, invoices, invoice items, payments, and basic receipt/payment detail views.
- Parent/student portal is currently read-only. It does not support payment submission, absence excuse submission, complaint/survey participation, profile editing, health/discipline visibility, or other self-service mutations.
- Attendance camera scanning, Beacon, timetable integration, and advanced reports are deferred.
- Automatic timetable generation, drag-and-drop scheduling, optimization, and room resource calendars are deferred.
- Advanced grading policies, GPA/ranking, PDF generation, certificate/report template designer, parent notifications, and advanced analytics are deferred.
- No full RLS yet.
- No full RBAC yet.
- No external integrations yet.
- No AI Query, chatbot, drag-and-drop report builder, report PDFs, or automated notification campaigns yet.
- Automated unit-test coverage is intentionally small and focused on stable pure logic; browser smoke and full E2E automation are still deferred.
- Browser/manual smoke testing was not performed in the Phase 16 closure session; see `docs/verification-report.md`.
- Phase 06.5 verification exists in `docs/verification-phase-06.md`; authenticated attendance workflow smoke was blocked by missing seeded users and attendance precondition data.
- Phase 07.5 verification exists in `docs/verification-phase-07.md`; repeatable local smoke data now exists, but authenticated browser workflow smoke remained blocked by unavailable browser automation in that session.
- A local Auth smoke-login issue caused by `NULL` GoTrue token fields was fixed and documented in `docs/local-auth-smoke-troubleshooting.md`.
- On Windows, Supabase local development may require Docker Desktop TCP daemon exposure for analytics/vector health.

## Recommended Next Phase

Recommended next phase: choose a Phase 17 slice separately, such as settings and integrations placeholders, browser smoke/E2E foundation, or selected parent/student self-service flows.

Go/no-go status: Go for separate Phase 17 planning. Phase 16 now provides a working read-only portal foundation with honest local verification status and without claiming browser automation coverage.
