# Project Phases

1. Project setup and architecture
2. Supabase core schema foundation
3. Auth + fixed roles + membership context
4. Students and admissions foundation
5. Academic structure foundation
6. Attendance manual + QR foundation
7. Grades and report cards foundation
8. Manual timetable with conflict prevention foundation
9. Finance basics foundation
10. Communication and ready-made reports foundation
11. Library foundation
12. Health, discipline, and achievements foundation
13. Complaints and surveys foundation
14. Syrian demo dataset foundation
15. Automated tests foundation
16. Parent and student read-only portal foundation
17. Browser smoke / E2E tests foundation
18. Settings and integrations placeholders foundation
19. Role-aware UX routing and navigation foundation
20. Role-specific dashboards foundation
21. Professional UI polish and design system pass
21.5. Modal form UX foundation

## Later-phase items

- Beacon attendance
- AI Query
- Chatbot
- Drag and drop report builder
- External integrations
- Timetable generation algorithm

## Current focus

The project now has its auth, tenant, student/admission, academic-structure,
attendance, grades/report-card, manual timetable, finance basics,
communication, ready-made reports, library, student-care, feedback, local demo
seed, automated unit-test, parent/student read-only portal, local browser
smoke, settings/integrations placeholders, role-aware routing/navigation,
role-specific dashboard, UI-polish, and modal-form UX foundations in place.
New business modules should continue to be added one vertical slice at a time so
schema, actions, UI, verification, and test coverage stay aligned.

## Phase 21.5 snapshot

- Quick create/edit forms now prefer `Dialog` or `Sheet` from `components/ui`, while complex details, reports, and multi-step flows remain full route pages.
- Shared `FormDialog`, `FormSheet`, and `FormActions` wrappers now provide a reusable Arabic-first modal-form pattern without introducing custom modal primitives or overlays.
- Phase 21.5 converted four low-risk examples: announcement creation, library copy creation, finance discount-type creation, and manual payment recording from invoice details.
- Existing full-page routes such as `/dashboard/communication/announcements/new` and `/dashboard/library/copies/new` remain available for direct access and safer fallback.
- No schema changes, seed changes, or Supabase config changes were introduced in this phase.

## Phase 21 snapshot

- Dashboard and portal shells now use a more cohesive visual foundation with softer surfaces, clearer spacing, and stronger hierarchy.
- Shared primitives such as page headers, KPI cards, quick-action cards, summary cards, and empty states were polished for production-facing Arabic UI.
- Staff and portal landing experiences now use shared section wrappers and more professional operational copy.
- No schema changes, seed changes, Supabase config changes, RBAC, or RLS were introduced in this phase.

## Phase 20 snapshot

- `/dashboard` now stays as the single staff landing route, but the rendered content changes by fixed role.
- `system_admin` and `school_admin` see an operations-oriented school dashboard.
- `teacher` sees a teaching-focused dashboard, `accountant` sees a finance-focused dashboard, and `librarian` sees a library-focused dashboard.
- `/portal` now provides richer read-only overviews for `parent` and `student`, including linked-child, attendance, grades, timetable, finance, library, and announcement summaries as appropriate to the role.
- Staff default routing is now unified on `/dashboard`; `parent` and `student` still land on `/portal`.
- No schema changes, RBAC, RLS, or full redesign were added in this phase.

## Phase 19 snapshot

- Login redirect is now role-aware and is resolved server-side from the active membership role.
- `parent` and `student` users land on `/portal` and are redirected away from `/dashboard`.
- The dashboard shell no longer renders for portal roles or for users without an active membership.
- Dashboard navigation is filtered by fixed role for `teacher`, `accountant`, and `librarian`, while `system_admin` and `school_admin` retain the full active dashboard navigation.
- Developer-facing shell and dashboard copy such as `مرحلة التأسيس` and `بنية dashboard` was removed from the production-facing dashboard UI.
- No RBAC, RLS, schema changes, or full redesign were added in this phase.

## Phase 18 snapshot

- Admin-only `/dashboard/settings` and `/dashboard/integrations` routes are now implemented.
- Settings now include school display identity, branding placeholder values, localization, module flags, and local message-template editing.
- Integration pages now exist for WhatsApp, webhooks, MoE, calendar, BI, and automation, but they remain explicit placeholder/settings-only surfaces with no external API calls or secret storage.
- The local Syrian demo seed now inserts `school_settings`, `integration_settings`, and `message_templates`.
- Unit tests, DB smoke SQL, and Playwright smoke now cover the new settings/integrations foundation.

## Phase 17 snapshot

- Playwright is now configured for a small local-only Chromium browser smoke suite under `tests/e2e`.
- Browser smoke covers login, admin dashboard entry, parent portal access, student portal access, portal read-only cues, and dashboard-navigation absence inside portal pages.
- The suite is intentionally single-worker and non-mutating to stay stable on local Windows + Supabase + Next.js development startup.
- `npm run test:e2e`, `test:e2e:headed`, `test:e2e:ui`, and `test:quality` are now available without changing the faster `test:all` path.
- Hosted CI E2E, CRUD regression flows, cross-browser coverage, and visual regression remain deferred.

## Phase 16 snapshot

- A separate `/portal` route group now provides Arabic-first, RTL-first, read-only pages for `parent` and `student` roles.
- Portal access is resolved server-side from the authenticated active membership, current role, tenant, school, and linked student records only.
- Parent-linked students are resolved through `student_guardians.guardian_user_id`; student self-access is resolved through the new nullable `students.student_user_id` identity link.
- The portal currently covers overview, linked students, attendance, grades, timetable, announcements, library loans, finance visibility for parents, and a read-only profile summary.
- No portal mutations are implemented in this phase. Payment submission, absence excuse submission, complaints/surveys, health/discipline details, and profile editing remain deferred.

## Phase 15 snapshot

- Vitest is configured as the initial local test runner with `jsdom` and a shared setup file.
- Unit tests cover route constants, dashboard navigation consistency, fixed-role sanity, and selected pure helper/validation logic.
- Local seeded database smoke remains a manual SQL workflow documented in [testing.md](./testing.md).
- Browser smoke and Playwright/E2E automation moved into Phase 17 as a separate local quality slice.

## Phase 13 snapshot

- Feedback foundation is implemented with authenticated complaint submission, complaint timeline updates, assignment, review/status changes, resolution, surveys, survey questions, publishing/closing, and staff survey responses.
- Full feedback management remains limited to `system_admin` and `school_admin` in server-side code. Complaint submission and survey response remain limited to operational school staff roles in this phase.
- Complaint and survey forms do not trust client-submitted `tenant_id`, `school_id`, role, or actor identity fields. Scope is derived from the authenticated active membership.
- Anonymous public complaints, public survey links, parent/student external workflows, attachments, AI analysis, advanced branching logic, and external notifications remain deferred.

## Phase 12 snapshot

- Student-care foundation is implemented with basic health records, vaccination records, clinic visits, discipline records, and student achievements.
- Health records, vaccinations, and clinic visits are limited to `system_admin` and `school_admin` in server-side code. Teachers do not manage sensitive health data in this phase.
- Teachers can create discipline records and achievements. Review/resolution for discipline records and publish/archive actions for achievements remain limited to fixed admin roles.
- Diagnosis workflows, prescriptions, medical uploads, parent notifications, PDF certificates, AI analysis, and behavior-risk scoring remain deferred.

## Phase 11 snapshot

- Library foundation is implemented with book catalog records, physical book copies, student loans, return handling, and overdue visibility.
- Library management uses server-side membership context and fixed role checks. `system_admin`, `school_admin`, and `librarian` can create catalog records, create copies, issue loans, return loans, and mark copies lost/damaged. `teacher` and `accountant` have read-only access.
- Loan issue validates active student ownership, copy/catalog ownership, copy availability, and duplicate active loans. Return validates active loan state and updates the loan and copy together in service logic with database constraints as a backstop.
- Fine billing, finance integration, barcode scanner hardware, ISBN lookup, public library portal, e-book lending, reservations, and advanced analytics remain deferred.

## Phase 10 snapshot

- Communication foundation is implemented with internal messages, message recipients, announcements, in-app notification logs, and school events.
- Communication management uses server-side membership context and fixed role checks. Admin roles can manage announcements/events and school-wide notification logs; approved operational roles can send/read internal messages.
- Ready-made reports are implemented as server-rendered pages and query services for students, attendance, grades, finance balances, and timetable overview.
- Real-time chat, email/SMS/WhatsApp/push sending, external integrations, AI Query, chatbot, drag-and-drop report builder, report PDFs, full RLS, and full RBAC remain deferred.

## Phase 09 snapshot

- Finance basics foundation is implemented with fee structures, fee items, discount types, student discounts, invoices, invoice items, payments, and basic receipt/payment detail views.
- Finance management uses server-side membership context and fixed role checks for `system_admin`, `school_admin`, and `accountant`.
- Invoice totals, discounts, paid amount, balance, and status are calculated server-side. Manual payment recording blocks overpayment.
- Payment gateways, expenses, budgets, accounting ledger logic, tax/VAT, PDF invoice/receipt generation, parent payment portal, full RLS, and full RBAC remain deferred.

## Phase 08 snapshot

- Manual timetable foundation is implemented with rooms, teacher-subject assignments, timetable slots, and Arabic dashboard pages.
- Timetable management uses server-side membership context and fixed role checks. Admin roles can create rooms, assignments, and slots; teachers can read their own timetable-related data.
- Slot creation validates academic year, term, class, subject, teacher membership, teacher assignment, optional room, and overlapping class/teacher/room conflicts server-side.
- Automatic timetable generation, drag-and-drop scheduling, attendance integration, optimization, full RLS, and full RBAC remain deferred.

## Phase 07 snapshot

- Grades and report cards foundation is implemented with exams, exam results, grade entries, and report card snapshots.
- Grades management uses server-side membership context and fixed role checks for `system_admin`, `school_admin`, and `teacher`.
- Publishing exam results and report cards is limited to `system_admin` and `school_admin`.
- Advanced grading policies, GPA/ranking, PDF generation, certificate/report templates, parent/student grade portals, notifications, advanced analytics, full RLS, and full RBAC remain deferred.

## Phase 06 snapshot

- Attendance manual + QR foundation is implemented with sessions, records, and absence excuses.
- Attendance management uses server-side membership context and fixed role checks for `system_admin`, `school_admin`, and `teacher`.
- QR attendance is token-entry foundation only; camera scanning, Beacon, timetable integration, parent notifications, advanced attendance reports, and full RLS remain deferred.

## Phase 05 snapshot

- Academic structure foundation is implemented for years, terms, grade levels, classes, subjects, grade-level subject assignments, and class enrollments.
- Academic management uses server-side membership context and fixed role checks.
- Reports remain a future slice.

## Phase 04 snapshot

- Students and admissions foundation is complete enough for the academic enrollment foundation.
- This phase covers admissions, student records, guardian links, document metadata, and status history.
- Attendance, grades, and finance remain future slices.

## Phase 02 snapshot

- Supabase local setup and schema workflow: [supabase-local.md](./supabase-local.md)
- Core schema foundation: [database.md](./database.md)
- Security boundaries for auth and service-role usage: [security-model.md](./security-model.md)
- This phase stops at tenants, schools, user profiles, memberships, and audit logs.
