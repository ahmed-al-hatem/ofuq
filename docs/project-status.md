# Project Status

## Snapshot

- Project name: Ofuq | أُفُق
- Current phase: Phase 25A Chat UI & Schema Foundation implemented
- Last completed implementation phase: Phase 25A Chat UI & Schema Foundation
- Last completed quality phase: Phase 25A Chat UI & Schema Foundation Verification
- Next implementation phase: Phase 25B Internal Realtime Chat MVP
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
| Testing | Vitest 4, jsdom, Testing Library foundation, Playwright Chromium local browser smoke |

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
| Phase 17 Browser Smoke / E2E Tests Foundation | Done | Playwright-based local browser smoke now covers login, dashboard access, parent/student portal entry, portal read-only cues, dashboard-navigation absence in the portal, and honest local verification docs. |
| Phase 18 Settings and Integrations Placeholders Foundation | Done | Admin-only `/dashboard/settings` and `/dashboard/integrations` now exist with school-scoped settings persistence, message-template editing, integration placeholder pages, local seed data, unit coverage, DB smoke updates, and Playwright smoke coverage without real external connections. |
| Phase 19 Role-Aware UX Routing and Navigation Foundation | Done with documented local browser blocker | Login redirect now follows the resolved fixed role, `parent` and `student` are routed to `/portal`, dashboard shell access excludes portal roles, dashboard navigation is filtered by staff role, and developer-facing dashboard copy has been removed. |
| Phase 20 Role-Specific Dashboards Foundation | Done with preflight auth repair verified | `/dashboard` now renders staff-specific dashboards for admin, teacher, accountant, and librarian roles, while `/portal` now surfaces richer parent/student overviews using authenticated linked-student scope only and without schema changes. |
| Phase 21 Professional UI Polish and Design System Pass | Done with minimal verification budget | Dashboard and portal shells, headers, sidebars, shared cards, empty states, and landing-page copy now present a more cohesive Arabic-first SaaS experience without schema or workflow changes. |
| Phase 21.5 Modal Form UX Foundation | Done with minimal verification budget | Reusable `Dialog` and `Sheet` composition wrappers now support quick create/edit flows, and selected low-risk forms were converted without schema, seed, or Supabase config changes. |
| Phase 22A Academic / Attendance / Grades UX Cleanup | Done with minimal verification budget | Selected academic, attendance, and grades pages now apply the Phase 21 shared page polish and the Phase 21.5 modal-form pattern for quick create/review flows while keeping complex detail routes intact. |
| Phase 22B Finance / Library / Communication UX Cleanup | Done with minimal verification budget | Selected finance, library, and communication pages now use the shared page hierarchy more consistently, move quick create flows into `Dialog` or `Sheet`, and keep complex detail views as route pages. |
| Phase 22C Portal UX Cleanup | Done with minimal verification budget | Parent and student portal pages now present calmer read-only guidance, clearer child/student cards, stronger attendance/grades summaries, clearer finance review summaries, and a more explicit school-managed profile experience without adding portal mutations or changing scope. |
| Phase 23 Final Demo Readiness & Presentation Flow Polish | Done with focused demo-readiness budget | A final demo guide, documented demo users and presentation routes, professional MVP limitations wording, and a small set of presentation-facing copy refinements now support a smoother graduation demo without adding new business scope. |
| Phase 24 Professional Split Login UX | Done with focused auth-UX budget | `/login` is now an audience chooser, `/login/staff` and `/login/portal` present tailored Arabic RTL login experiences, `/login/reset-password` is a UI-only placeholder, and role-based redirect resolution remains server-side. |
| Phase 25A Chat UI & Schema Foundation | Done with schema + UI foundation budget | `/dashboard/chat`, `/portal/chat`, `/dashboard/assistant`, and `/portal/assistant` now exist as Arabic RTL scaffolds over new chat/assistant schema tables, while realtime chat, send flows, and Gemini calls remain deferred. |

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
- Portal UX cleanup for `/portal` overview, linked students, student details, attendance, grades, finance, and profile pages with stronger Arabic hierarchy and mobile readability while keeping the portal read-only.
- Local Playwright browser smoke foundation for authenticated login, dashboard access, and read-only portal route coverage.
- Settings foundation, including school display settings, branding placeholders, localization settings, module flags, and editable local message templates.
- Integration placeholders foundation, including admin-only overview and provider pages for WhatsApp, webhooks, MoE, calendar, BI, and automation without real external API calls or secret storage.
- Role-aware login routing and dashboard navigation filtering by fixed role.
- Role-specific staff dashboards and richer parent/student portal summaries.
- Professionalized dashboard and portal shell styling, shared section primitives, and production-ready Arabic empty-state copy.
- Reusable modal-form UX foundation for selected quick forms using existing `components/ui` `Dialog` and `Sheet` primitives with dimmed overlays and Arabic-first action copy.
- Academic, attendance, and grades high-value screens now use quick `Dialog` and `Sheet` actions for selected short or mid-size forms, while complex details such as attendance sessions, exam details, and report-card details remain route pages.
- Selected finance, library, and communication operational screens now use quick `Dialog` or `Sheet` actions for fee structures, fee items, student discounts, catalog records, loans, internal messages, and school events, while invoice details, message details, and loan details remain full route pages.
- Final demo readiness documentation now exists in `docs/demo-readiness.md`, including the recommended demo order, local demo users, presentation-ready route map, known limitations wording, and a final smoke checklist.
- Split login UX now exists for `/login`, `/login/staff`, `/login/portal`, and `/login/reset-password`; Google continuation and reset-password flows remain UI-only placeholders, while the real login path continues to use the existing server-side email/password action.
- Chat UI and assistant schema foundation now exist for staff dashboard and parent/student portal surfaces, but realtime chat, message sending, read tracking, and Gemini execution remain intentionally disabled in this phase.

AI Query, chatbot behavior, real external integrations, and report builder are not implemented yet.

## Current Routes

| Route | Status | Notes |
| --- | --- | --- |
| `/` | Active | Public home route. |
| `/login` | Active | Audience chooser for the staff/admin login path and the parent/student portal login path. |
| `/login/staff` | Active | Staff/admin login UX for `system_admin`, `school_admin`, `teacher`, `accountant`, and `librarian`; role enforcement still happens server-side after sign-in. |
| `/login/portal` | Active | Parent/student portal login UX with calmer guidance and explicit read-only positioning; server-side role redirects remain authoritative. |
| `/login/reset-password` | Active | UI-only reset-password request screen; no Supabase reset email flow is implemented yet. |
| `/portal` | Active | Read-only parent/student portal overview with calmer guidance, clearer summary hierarchy, and direct quick links. |
| `/portal/students` | Active | Linked student list for the signed-in parent or student with clearer student identity cards. |
| `/portal/students/[studentId]` | Active | Read-only linked student details with clearer summary cards and follow-up links. |
| `/portal/attendance` | Active | Read-only attendance view for linked students with stronger status summary and clearer notes. |
| `/portal/grades` | Active | Read-only grades, exam results, and report-card snapshots for linked students with summary KPIs and easier score scanning. |
| `/portal/timetable` | Active | Read-only timetable view for linked students' active classes. |
| `/portal/finance` | Active | Parent-facing linked-student finance visibility with clearer read-only summary cards; student role sees a restricted read-only note. |
| `/portal/library` | Active | Read-only active and historical book-loan view for linked students. |
| `/portal/announcements` | Active | Read-only published announcements and school events relevant to linked students. |
| `/portal/chat` | Active | Arabic RTL chat scaffold for parent/student messaging with a disabled composer and no realtime send flow yet. |
| `/portal/assistant` | Active | Arabic RTL assistant scaffold for parent/student prompts with no real Gemini call yet. |
| `/portal/profile` | Active | Read-only membership/profile summary with explicit school-managed profile messaging and linked-student scope cues. |
| `/dashboard` | Active | Protected staff landing route that renders role-specific content for `system_admin`, `school_admin`, `teacher`, `accountant`, and `librarian`. `parent` and `student` memberships are redirected to `/portal` before the shell renders. |
| `/dashboard/chat` | Active | Staff-only internal chat scaffold with conversation list, thread surface, disabled composer, and no realtime send flow yet. |
| `/dashboard/assistant` | Active | Staff-only assistant scaffold with suggested prompts and no real Gemini call yet. |
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
| `/dashboard/settings` | Active | Admin-only settings overview for school identity, branding, localization, module flags, and templates. |
| `/dashboard/settings/school` | Active | Admin-only school display-name settings. |
| `/dashboard/settings/branding` | Active | Admin-only branding and white-label placeholder settings. |
| `/dashboard/settings/localization` | Active | Admin-only locale, direction, timezone, and academic-week settings. |
| `/dashboard/settings/modules` | Active | Admin-only module-flag foundation page that does not disable real modules yet. |
| `/dashboard/settings/templates` | Active | Admin-only local message-template management without external delivery. |
| `/dashboard/integrations` | Active | Admin-only integration placeholder overview with explicit non-connected status. |
| `/dashboard/integrations/whatsapp` | Active | Placeholder-only WhatsApp Business settings page. |
| `/dashboard/integrations/webhooks` | Active | Placeholder-only webhooks settings page. |
| `/dashboard/integrations/moe` | Active | Placeholder-only Ministry of Education settings page. |
| `/dashboard/integrations/calendar` | Active | Placeholder-only Google/Microsoft Calendar settings page. |
| `/dashboard/integrations/bi` | Active | Placeholder-only Power BI/Looker settings page. |
| `/dashboard/integrations/automation` | Active | Placeholder-only Zapier/Make settings page. |
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
- Settings tables: `school_settings`, `integration_settings`, `message_templates`.
- Chat and assistant foundation tables: `chat_conversations`, `chat_participants`, `chat_messages`, `chat_message_reads`, `ai_conversations`, `ai_messages`.
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
- Settings reads and writes derive tenant/school/user scope from the active membership and remain limited to `system_admin` and `school_admin`.
- Integration pages are placeholder-only in this phase. They do not perform external API calls, OAuth, webhook delivery, provider sync, or real API secret storage.
- Chat and assistant surfaces are scaffolds only in this phase. No realtime subscription, send-message write, mark-as-read write, or Gemini request path is active yet.
- Any future Gemini integration must remain server-side, role-scoped, and must never receive unrestricted SQL or raw database execution ability.
- Login destination is role-aware and is resolved on the server from the active membership only.
- The selected login route (`/login/staff` or `/login/portal`) is UI guidance only and is never trusted as an authorization source.
- Dashboard navigation is filtered by fixed role for UX purposes, but sensitive reads and mutations still rely on server-side authorization.
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
- `docs/ui-ux-role-roadmap.md`
- `docs/demo-readiness.md`
- `docs/verification-phase-06.md`
- `docs/verification-phase-07.md`
- `docs/requirements-roadmap.md`

## Current Known Limitations

- Communication is internal/in-app only; no real-time chat or external notification providers are implemented.
- Chat and assistant foundation pages are present, but internal chat send/realtime behavior is deferred to Phase 25B and Gemini integration is deferred to Phase 25C.
- Library is an operational foundation only; no fine billing, finance integration, barcode hardware, ISBN lookup, reservations, public portal, e-book storage, or advanced analytics are implemented.
- Student care is an operational foundation only; no diagnosis, prescriptions, medical uploads, parent notifications, PDF certificates, AI analysis, or behavior-risk scoring are implemented.
- Feedback is an operational foundation only; no anonymous/public complaint forms, public survey links, attachments, external notifications, AI analysis, advanced branching, or escalation automation are implemented.
- Finance basics foundation is implemented: fee structures, fee items, discounts, invoices, invoice items, payments, and basic receipt/payment detail views.
- Parent/student portal is currently read-only. It does not support payment submission, absence excuse submission, complaint/survey participation, profile editing, health/discipline visibility, or other self-service mutations.
- Staff users still share the same dashboard route tree even after role-specific summaries were introduced. Dedicated per-role route trees or deeper role-specific workflow splits are not implemented.
- Attendance camera scanning, Beacon, timetable integration, and advanced reports are deferred.
- Automatic timetable generation, drag-and-drop scheduling, optimization, and room resource calendars are deferred.
- Advanced grading policies, GPA/ranking, PDF generation, certificate/report template designer, parent notifications, and advanced analytics are deferred.
- No full RLS yet.
- No full RBAC yet.
- External integrations remain placeholder-only. No provider connection, delivery, sync, or secret storage is implemented.
- Google sign-in and reset-password email sending remain placeholder-only in the current login UX slice.
- No AI Query, chatbot, drag-and-drop report builder, report PDFs, or automated notification campaigns yet.
- Automated coverage remains intentionally small: Vitest targets stable pure logic and Playwright targets a small local-only browser smoke slice rather than full regression coverage.
- Browser smoke is now covered locally through Playwright only. Hosted CI E2E, cross-browser matrices, CRUD flows, and visual regression remain deferred.
- Phase 22C intentionally cleaned only a narrow portal-readability slice. Portal mutations, online payments, message sending, complaint submission, broader portal module additions, and cross-module redesign remain deferred.
- Phase 06.5 verification exists in `docs/verification-phase-06.md`; authenticated attendance workflow smoke was blocked by missing seeded users and attendance precondition data.
- Phase 07.5 verification exists in `docs/verification-phase-07.md`; repeatable local smoke data now exists, and authenticated browser workflow smoke is now covered separately in the Phase 17 Playwright foundation.
- A local Auth smoke-login issue caused by `NULL` GoTrue token fields was fixed and documented in `docs/local-auth-smoke-troubleshooting.md`.
- On Windows, Supabase local development may require Docker Desktop TCP daemon exposure for analytics/vector health.

## Recommended Next Phase

Recommended next phase: proceed to Phase 25B Internal Realtime Chat MVP, using the new schema and route scaffolds without widening tenant/school trust boundaries.

Go/no-go status: Go. Phase 25A adds the required schema/UI foundation cleanly while keeping send flows, realtime, and Gemini safely out of scope.
