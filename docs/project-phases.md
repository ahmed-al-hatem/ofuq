# Project Phases

1. Project setup and architecture
2. Core auth, tenant, school, and users
3. Students and admissions
4. Academic years, grades, classes, and enrollment
5. Attendance manual + QR
6. Grades and report cards
7. Manual timetable with conflict prevention
8. Finance basics
9. Communication and ready-made reports
10. Later modules and placeholders

## Later-phase items

- Beacon attendance
- AI Query
- Chatbot
- Drag and drop report builder
- External integrations
- Timetable generation algorithm

## Current focus

The project now has its auth, tenant, student/admission, academic-structure, and attendance foundations in place.
New business modules should continue to be added one vertical slice at a time so schema, actions, UI, and verification stay aligned.

## Phase 06 snapshot

- Attendance manual + QR foundation is implemented with sessions, records, and absence excuses.
- Attendance management uses server-side membership context and fixed role checks for `system_admin`, `school_admin`, and `teacher`.
- QR attendance is token-entry foundation only; camera scanning, Beacon, timetable integration, parent notifications, advanced attendance reports, and full RLS remain deferred.

## Phase 05 snapshot

- Academic structure foundation is implemented for years, terms, grade levels, classes, subjects, grade-level subject assignments, and class enrollments.
- Academic management uses server-side membership context and fixed role checks.
- Grades, timetable logic, finance, and reports remain future slices.

## Phase 04 snapshot

- Students and admissions foundation is complete enough for the academic enrollment foundation.
- This phase covers admissions, student records, guardian links, document metadata, and status history.
- Attendance, grades, and finance remain future slices.

## Phase 02 snapshot

- Supabase local setup and schema workflow: [supabase-local.md](./supabase-local.md)
- Core schema foundation: [database.md](./database.md)
- Security boundaries for auth and service-role usage: [security-model.md](./security-model.md)
- This phase stops at tenants, schools, user profiles, memberships, and audit logs.
