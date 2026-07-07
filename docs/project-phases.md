# Project Phases

1. Project setup and architecture
2. Core auth, tenant, school, and users
3. Students and admissions
4. Academic years, grades, classes, and enrollment
5. Attendance manual + QR
6. Grades and report cards
7. Manual timetable with conflict prevention
8. Finance basics
9. Finance basics
10. Communication and ready-made reports
11. Library foundation
12. Later modules and placeholders

## Later-phase items

- Beacon attendance
- AI Query
- Chatbot
- Drag and drop report builder
- External integrations
- Timetable generation algorithm

## Current focus

The project now has its auth, tenant, student/admission, academic-structure, attendance, grades/report-card, manual timetable, finance basics, communication, ready-made reports, and library foundations in place.
New business modules should continue to be added one vertical slice at a time so schema, actions, UI, and verification stay aligned.

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
