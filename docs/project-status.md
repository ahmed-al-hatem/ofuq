# Project Status

## Snapshot

- Project name: Ofuq | أُفُق
- Current phase: Ready for 10 Communication and Ready-Made Reports Foundation
- Last completed implementation phase: 09 Finance Basics Foundation
- Last completed quality phase: 09.2 Finance Closure After Manual Supabase Recovery
- Next implementation phase: 10 Communication and Ready-Made Reports Foundation
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
- Dashboard shell and navigation with Arabic-first RTL UI.

Communication, library, and health are not implemented yet.

## Current Routes

| Route | Status | Notes |
| --- | --- | --- |
| `/` | Active | Public home route. |
| `/login` | Active | Supabase email/password login. |
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

Configured dynamic helpers also exist for admission and student detail URLs, but matching route files are not currently present.

## Current Database Slices

- Core tenant/auth tables: `tenants`, `schools`, `user_profiles`, `user_memberships`, `audit_logs`.
- Students/admissions tables: `student_admissions`, `students`, `student_guardians`, `student_documents`, `student_status_history`.
- Academic structure tables: `academic_years`, `terms`, `grade_levels`, `classes`, `subjects`, `grade_level_subjects`, `class_enrollments`.
- Attendance tables: `attendance_sessions`, `attendance_records`, `absence_excuses`.
- Grades tables: `exams`, `exam_results`, `grade_entries`, `report_cards`.
- Timetable tables: `rooms`, `teacher_subject_assignments`, `timetable_slots`.
- Finance tables: `fee_structures`, `fee_items`, `discount_types`, `student_discounts`, `invoices`, `invoice_items`, `payments`.
- Storage foundation: private `student-documents` bucket is created by the student/admissions migration.
- Local Supabase schema replay is currently verified with `supabase db reset`.
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
- `docs/verification-report.md`
- `docs/verification-phase-06.md`
- `docs/verification-phase-07.md`
- `docs/requirements-roadmap.md`

## Current Known Limitations

- Finance basics foundation is implemented: fee structures, fee items, discounts, invoices, invoice items, payments, and basic receipt/payment detail views.
- No parent notifications or communication module yet.
- Attendance camera scanning, Beacon, timetable integration, and advanced reports are deferred.
- Automatic timetable generation, drag-and-drop scheduling, optimization, and room resource calendars are deferred.
- Advanced grading policies, GPA/ranking, PDF generation, certificate/report template designer, parent/student grade portal, parent notifications, and advanced analytics are deferred.
- No full RLS yet.
- No full RBAC yet.
- No external integrations yet.
- No automated test suite beyond lint/build verification.
- Browser/manual smoke testing was not performed in Phase 05.5; see `docs/verification-report.md`.
- Phase 06.5 verification exists in `docs/verification-phase-06.md`; authenticated attendance workflow smoke was blocked by missing seeded users and attendance precondition data.
- Phase 07.5 verification exists in `docs/verification-phase-07.md`; repeatable local smoke data now exists, but authenticated browser workflow smoke remained blocked by unavailable browser automation in that session.
- A local Auth smoke-login issue caused by `NULL` GoTrue token fields was fixed and documented in `docs/local-auth-smoke-troubleshooting.md`.
- On Windows, Supabase local development may require Docker Desktop TCP daemon exposure for analytics/vector health.

## Recommended Next Phase

Recommended next phase:

```txt
10 - Communication and Ready-Made Reports Foundation
```

Rationale: students, academics, attendance, grades, timetabling, and finance basics now exist, so internal communication and ready-made reports can be added as the next operational slice.

Go/no-go status: Go for Phase 10 after Phase 09 verification. Database reset, type generation, finance SQL spot checks, lint, build, and `git diff --check` passed. Authenticated browser workflow smoke was not performed in this closure session.
