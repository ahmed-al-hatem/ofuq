# Requirements Roadmap

## Purpose

This roadmap maps Ofuq MVP and later requirements to implementation phases and current status after Phase 10. It is a planning snapshot, not a feature specification for the next phase.

## Status Legend

| Status | Meaning |
| --- | --- |
| Done | Implemented as a foundation or usable slice. |
| In Progress | Current documentation/verification phase. |
| Planned | Intended for upcoming MVP phases. |
| Later | Deferred until the MVP foundation is stable. |
| UI / Settings Only | May have placeholder/settings screens, but no real integration logic yet. |
| Excluded | Explicitly out of scope for now. |

## MVP Decisions

- Fixed roles now; extensible permissions later.
- Keep Multi-Tenant foundations from the beginning.
- Use Supabase Auth.
- Use Server Actions and server-side services for mutations.
- RLS later.
- Backup/Restore excluded.
- Sandbox excluded.
- External integrations are UI/settings only for now.
- AI Query and Chatbot are UI placeholders only until enough data exists.
- Report Builder drag-and-drop is later; ready-made reports first.
- Timetabling starts manual with conflict prevention, algorithm later.
- QR attendance starts with teacher scanning student QR or QR-token foundation; Beacon later.

## Roadmap Table

| Area | Requirement | Phase | Status | Notes |
| --- | --- | --- | --- | --- |
| Security/Auth | Email/password login | 03 | Done | Supabase Auth login is implemented. |
| Security/Auth | Google SSO | Later | Later | Optional if it fits cleanly. |
| Security/Auth | OTP mobile later | Later | Later | Deferred. |
| Security/Auth | Fixed roles | 02-03 | Done | Stored through `user_memberships`. |
| Security/Auth | Extensible permissions later | Later | Later | Do not add RBAC tables yet. |
| Security/Auth | Multi-Tenant | 02+ | Done | Tenant/school context exists and is used by later slices. |
| Security/Auth | Audit logs | 02+ | Done | Foundation table exists; key actions write logs where practical. |
| Security/Auth | RLS later | Later | Later | Deferred until auth/membership flows stabilize. |
| Students | Admissions workflow | 04 | Done | Pending/approved/rejected/cancelled foundation. |
| Students | Student profile foundation | 04 | Done | Official student records exist. |
| Students | Guardian links | 04 | Done | Guardian table exists. |
| Students | Student documents metadata | 04 | Done | Metadata and private bucket foundation exist. |
| Students | Student status history | 04 | Done | Status history table exists. |
| Students | Student QR token foundation | 04 | Done | `students.qr_token` now feeds the Phase 06 QR-token attendance foundation. |
| Students | Promotions/transfers later | Later | Later | Not implemented. |
| Students | Withdrawal workflow later | Later | Later | Not implemented. |
| Students | Achievements later | Later | Later | Not implemented. |
| Students | Discipline later | Later | Later | Not implemented. |
| Students | Import/export later | Later | Later | Not implemented. |
| Students | Dropout risk later | Later | Later | Not implemented. |
| Academic | Academic years | 05 | Done | Implemented. |
| Academic | Terms | 05 | Done | Implemented. |
| Academic | Grade levels | 05 | Done | Implemented. |
| Academic | Classes | 05 | Done | Implemented. |
| Academic | Subjects | 05 | Done | Implemented. |
| Academic | Grade-level subject assignments | 05 | Done | Implemented. |
| Academic | Class enrollments | 05 | Done | Implemented. |
| Academic | Grades foundation | 07 | Done | Grade entries and exam result entry foundation are implemented. |
| Academic | Exams foundation | 07 | Done | Exams can be created for class/subject/year with server-side relationship checks. |
| Academic | Report cards foundation | 07 | Done | Basic report card snapshots and views are implemented; PDF/ranking remain deferred. |
| Academic | Evaluation systems later | Later | Later | Not implemented. |
| Attendance | Manual attendance | 06 | Done | Attendance sessions and manual per-student records are implemented. |
| Attendance | Teacher scans student QR foundation | 06 | Done | Token-entry QR foundation validates the student and active class enrollment server-side. |
| Attendance | Absence excuses foundation | 06 | Done | Excuse table, submit action foundation, and admin/school admin review page are implemented. |
| Attendance | Parent notifications later | Later | Later | Requires communication/notification foundation. |
| Attendance | Beacon later | Later | Later | Explicitly deferred. |
| Attendance | Advanced attendance reports later | Later | Later | Ready-made basic reports should come first. |
| Timetable | Manual timetable with conflict prevention | 08 | Done | Rooms, teacher-subject assignments, slots, and class/teacher/room overlap checks are implemented. |
| Timetable | Automatic generation algorithm later | Later | Later | Deferred until manual timetable is stable. |
| Timetable | Beacon/timetable integration excluded from current phases | Later | Excluded | Not part of current MVP slices. |
| Finance | Fee structures | 09 | Done | Fee structures and fee items are implemented. |
| Finance | Invoices | 09 | Done | Invoice generation, issue/cancel foundation, and server-calculated totals are implemented. |
| Finance | Payments | 09 | Done | Manual completed payments are implemented with overpayment prevention. |
| Finance | Discounts | 09 | Done | Discount types and student discounts are implemented. |
| Finance | Receipts | 09 | Done | Basic receipt/payment detail views are implemented; PDF generation remains deferred. |
| Finance | Expenses/budget later | Later | Later | Not implemented. |
| Finance | Payment integrations later or UI/settings only | Later | UI / Settings Only | No real integration for now. |
| Communication | Internal messages foundation | 10 | Done | Internal school messages and per-recipient read/archive state are implemented. |
| Communication | Announcements foundation | 10 | Done | Draft/publish/archive announcements with simple target types are implemented. |
| Communication | Events foundation | 10 | Done | Simple school events with cancellation are implemented. |
| Communication | Complaints planned | 10 | Planned | Not implemented. |
| Communication | Surveys later | Later | Later | Not implemented. |
| Communication | Notifications foundation | 10 | Done | In-app notification logs only; no external sending providers. |
| Reports | Ready-made reports foundation | 10 | Done | Student, attendance, grades, finance, and timetable report pages are implemented. |
| Reports | Dashboard summaries planned | 10 | Done | Reports overview and communication overview pages are implemented. |
| Reports | Financial reports planned | Later | Later | Depends on finance. |
| Reports | Drag-and-drop builder later | Later | Later | Deferred. |
| Reports | AI Query UI placeholder only later | Later | UI / Settings Only | No AI query logic until stable data exists. |
| Library | Textbook distribution later | Later | Later | Not implemented. |
| Library | Full library workflow later if needed | Later | Later | Not implemented. |
| Health | Basic health record later | Later | Later | Not implemented. |
| Health | Vaccinations later | Later | Later | Not implemented. |
| Settings | School identity/white-label later | Later | Later | Not implemented. |
| Settings | Template management later | Later | Later | Not implemented. |
| Settings | Plugin/module toggles later | Later | Later | Not implemented. |
| Settings | Backup/Restore excluded | None | Excluded | Explicitly out of scope. |
| Settings | Sandbox excluded | None | Excluded | Explicitly out of scope. |
| Integrations | WhatsApp Business UI/settings only later | Later | UI / Settings Only | No real integration now. |
| Integrations | Webhooks UI/settings only later | Later | UI / Settings Only | No real integration now. |
| Integrations | MoE UI/settings only later | Later | UI / Settings Only | No real integration now. |
| Integrations | Google/Microsoft Calendar UI/settings only later | Later | UI / Settings Only | No real integration now. |
| Integrations | Power BI/Looker UI/settings only later | Later | UI / Settings Only | No real integration now. |
| Integrations | Zapier/Make UI/settings only later | Later | UI / Settings Only | No real integration now. |

## Implemented Now

- Project setup
- Core schema
- Auth + fixed roles
- Students/admissions foundation
- Academic structure foundation
- Attendance manual + QR foundation
- Grades and report cards foundation
- Manual timetable with conflict prevention foundation
- Finance basics foundation
- Communication and ready-made reports foundation

## Planned Next

```txt
Next phase to be planned separately after Phase 10 closure.
```

## Later / Placeholder Only

- Google SSO if it fits cleanly.
- Mobile OTP.
- Expanded permissions/capability layer.
- Student promotions, transfers, withdrawals, achievements, discipline, import/export, and risk indicators.
- Advanced grading policies, GPA/ranking, PDF generation, certificate/report template designer, parent/student grade portal, parent notifications, and advanced analytics.
- Camera QR scanner, Beacon, parent notifications, timetable integration, and advanced attendance reports.
- Automatic timetable generation later.
- Complaints and surveys.
- Advanced finance reports and exports.
- Drag-and-drop report builder later.
- AI Query and Chatbot UI placeholders only until enough stable data exists.
- Library and textbook workflows.
- Health records and vaccinations.
- School identity, templates, plugin toggles, and integration settings.
- External integration settings placeholders.

## Explicitly Excluded

- Backup/Restore
- Sandbox

## Notes For Future Codex Prompts

- Keep one vertical slice per prompt.
- Add migrations only under `supabase/migrations/`.
- Do not rewrite old migrations.
- Always run verification after schema changes.
- Do not trust tenant/school from forms.
- Use membership context server-side.
- Do not introduce RBAC tables unless explicitly requested.
- Keep Arabic-first RTL UI copy for user-facing screens.
- Do not start later modules inside a quality gate or documentation prompt.
