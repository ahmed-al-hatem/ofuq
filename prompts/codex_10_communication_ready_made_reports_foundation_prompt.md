# Codex Execution Prompt — 10 Communication and Ready-Made Reports Foundation

## Phase

`10 - Communication and Ready-Made Reports Foundation`

## Role

You are Codex acting as a senior full-stack engineer and product-minded database designer.

You are working on **Ofuq | أُفُق**, an Arabic-first multi-tenant school management system built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components and Base UI primitives where the project already uses them
- Lucide React icons
- Supabase CLI / PostgreSQL / Supabase Auth
- Server Components by default
- Server Actions for mutations
- server-side services for sensitive reads
- fixed roles through `user_memberships`
- tenant/school context derived from authenticated membership

This phase must add the first foundation for **school communication** and **ready-made reports**.

Keep the work focused. Do not start AI, chatbot, external integrations, or drag-and-drop report builder work.

---

## Main Goal

Implement a focused vertical slice for:

1. Internal school messages.
2. Announcements.
3. In-app notification logs.
4. School events.
5. Ready-made report pages.
6. Server-side tenant/school validation.
7. Arabic RTL dashboard pages.
8. Documentation and verification.

---

## Required Reading Before Editing

Before editing, inspect:

```txt
AGENTS.md
docs/architecture.md
docs/codex-workflow.md
docs/database.md
docs/project-phases.md
docs/project-status.md
docs/requirements-roadmap.md
docs/security-model.md
docs/supabase-local.md
docs/verification-report.md
constants/routes.ts
config/navigation.ts
types/database.ts
types/students.ts
types/academic.ts
types/attendance.ts
types/grades.ts
types/timetable.ts
types/finance.ts
lib/auth/session.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
lib/students/students.ts
lib/academic/academic-structure.ts
lib/attendance
lib/grades
lib/timetable
lib/finance
app/(dashboard)/dashboard
```

Also inspect the current UI component patterns before adding new pages.

Do not introduce a parallel architecture.

---

## Current Project Context

The project already has:

1. Core auth, tenant, school, user profiles, fixed roles, and memberships.
2. Students and admissions.
3. Academic structure.
4. Attendance manual + QR foundation.
5. Grades and report cards.
6. Manual timetable with conflict prevention.
7. Finance basics.
8. Local smoke seed data.

Phase 10 must build on top of these existing modules without changing their core behavior.

---

## Strict Scope

### In Scope

Add the foundation for:

```txt
messages
message_recipients
announcements
notification_logs
school_events
communication dashboard pages
ready-made reports dashboard pages
server-side tenant/school validation
audit logs
documentation
verification
```

### Out of Scope

Do not implement:

```txt
AI Query
Chatbot
real-time chat
WebSocket chat
email sending
SMS sending
WhatsApp integration
push notification provider
external integrations
drag-and-drop report builder
custom report designer
PDF report generation
advanced analytics
parent mobile notifications
automated notification campaigns
full RBAC
full RLS
```

Ready-made reports in this phase are simple server-rendered report pages. They are not a report builder.

---

## Database Migration

Create exactly one new migration for Phase 10.

Use the existing timestamp convention, for example:

```txt
supabase/migrations/<timestamp>_communication_ready_made_reports_foundation.sql
```

Do not modify old migrations.

---

## Recommended Enums

Add minimal enums if they do not already exist:

```txt
communication_message_status
announcement_target_type
announcement_status
notification_channel
notification_status
school_event_target_type
school_event_status
```

Recommended values:

```txt
communication_message_status:
sent
archived

announcement_target_type:
school
role
grade_level
class

announcement_status:
draft
published
archived

notification_channel:
in_app

notification_status:
created
read
archived
failed

school_event_target_type:
school
grade_level
class

school_event_status:
scheduled
cancelled
completed
archived
```

Keep enum names clear and module-scoped.

---

## Tables to Add

### 1. `messages`

Purpose:

Internal school messages between application users.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
sender_user_id uuid not null references public.user_profiles(id)
subject text not null
body text not null
related_student_id uuid null references public.students(id)
status public.communication_message_status not null default 'sent'
sent_at timestamptz not null default now()
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Sender must belong to the same tenant/school through active membership.
- Related student, if provided, must belong to the same tenant/school.
- Do not add attachments in this phase.
- Do not add real-time delivery.
- Do not add email/SMS sending.

Recommended indexes:

```txt
tenant_id, school_id
sender_user_id
related_student_id
status
sent_at desc
```

---

### 2. `message_recipients`

Purpose:

Track message recipients and read status per recipient.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
message_id uuid not null references public.messages(id) on delete cascade
recipient_user_id uuid not null references public.user_profiles(id)
read_at timestamptz null
archived_at timestamptz null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Recipient must be a user profile with an active membership in the same tenant/school.
- Use `unique(message_id, recipient_user_id)`.
- Do not trust recipient tenant/school from client input.

Recommended indexes:

```txt
tenant_id, school_id
message_id
recipient_user_id
read_at
```

---

### 3. `announcements`

Purpose:

School announcements targeted to all school users or a simple audience.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
title text not null
body text not null
target_type public.announcement_target_type not null default 'school'
target_role public.user_role null
grade_level_id uuid null references public.grade_levels(id)
class_id uuid null references public.classes(id)
status public.announcement_status not null default 'draft'
published_at timestamptz null
expires_at timestamptz null
created_by_user_id uuid not null references public.user_profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `target_type = school` should not require role/grade/class.
- `target_type = role` requires `target_role`.
- `target_type = grade_level` requires `grade_level_id`.
- `target_type = class` requires `class_id`.
- Class and grade level must belong to the same tenant/school.
- `expires_at`, if provided, must be after `published_at` or after `created_at` for drafts.

Recommended indexes:

```txt
tenant_id, school_id
status
target_type
published_at desc
expires_at
```

---

### 4. `notification_logs`

Purpose:

Internal in-app notification log only. This is not an external notification provider.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
recipient_user_id uuid null references public.user_profiles(id)
actor_user_id uuid null references public.user_profiles(id)
channel public.notification_channel not null default 'in_app'
notification_type text not null
title text not null
body text null
status public.notification_status not null default 'created'
related_entity_type text null
related_entity_id uuid null
read_at timestamptz null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Only `in_app` channel is supported in this phase.
- Do not send email/SMS/WhatsApp/push.
- Do not store provider payloads or secrets.
- Related entity fields are lightweight references only.

Recommended indexes:

```txt
tenant_id, school_id
recipient_user_id
status
notification_type
created_at desc
```

---

### 5. `school_events`

Purpose:

Simple school calendar/events foundation.

Prefer `school_events` over `events` to avoid naming ambiguity.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
title text not null
description text null
starts_at timestamptz not null
ends_at timestamptz not null
location text null
target_type public.school_event_target_type not null default 'school'
grade_level_id uuid null references public.grade_levels(id)
class_id uuid null references public.classes(id)
status public.school_event_status not null default 'scheduled'
created_by_user_id uuid not null references public.user_profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `starts_at < ends_at`.
- Class and grade level, if provided, must belong to the same tenant/school.
- Do not implement calendar sync.
- Do not implement recurrence in this phase.

Recommended indexes:

```txt
tenant_id, school_id
status
starts_at
ends_at
target_type
```

---

## Reports Scope

Do not create report-builder tables in Phase 10.

Ready-made reports should be implemented as server-side query services and pages only.

Required reports:

```txt
Student Roster Report
Attendance Summary Report
Grades Summary Report
Finance Balances Report
Timetable Overview Report
```

---

## Report Details

### Student Roster Report

Use existing tables:

```txt
students
student_guardians
class_enrollments
classes
grade_levels
```

Display:

```txt
student_number
student_name
status
grade_level
class
guardian
```

### Attendance Summary Report

Use existing tables:

```txt
attendance_sessions
attendance_records
students
classes
```

Display:

```txt
student
class
present_count
absent_count
late_count
excused_count
```

Use simple date range filters if practical.

### Grades Summary Report

Use existing tables:

```txt
exams
exam_results
grade_entries
report_cards
subjects
students
classes
```

Display:

```txt
student
class
subject
exam/result summary
grade entry summary
report card status
```

### Finance Balances Report

Use existing tables:

```txt
students
invoices
payments
```

Display:

```txt
student
invoice_number
total_amount
paid_amount
balance_amount
status
```

### Timetable Overview Report

Use existing tables:

```txt
timetable_slots
classes
subjects
rooms
user_profiles
```

Display:

```txt
day
class
subject
teacher
room
starts_at
ends_at
```

---

## Role Rules

Use fixed roles only.

### Communication management

Allowed to create/publish/archive announcements and create/cancel events:

```txt
system_admin
school_admin
```

### Messaging

Allowed to send/read internal messages when scoped safely:

```txt
system_admin
school_admin
teacher
accountant
librarian
```

Parent/student messaging can remain deferred unless the existing auth/membership model already makes it safe and simple.

### Notification logs

Allowed to view school-wide notification logs:

```txt
system_admin
school_admin
```

Users may view their own notifications if implemented safely.

### Reports

Recommended report access:

```txt
system_admin: all reports
school_admin: all school reports
teacher: limited academic/attendance/timetable reports when safely scoped
accountant: finance report and basic roster context
librarian: no reports unless simple announcements/events read-only
parent/student: deferred
```

Do not add RBAC tables.

---

## Server Context

Create module-level context helpers:

```txt
lib/communication/context.ts
lib/reports/context.ts
```

Recommended helpers:

```ts
requireCommunicationContext(allowedRoles)
requireReportsContext(allowedRoles)
```

They must derive from authenticated active membership:

```txt
user_id
role
tenant_id
school_id
membership
```

Never trust these from forms:

```txt
tenant_id
school_id
role
```

---

## Server Services

### Communication services

Create:

```txt
lib/communication/messages.ts
lib/communication/announcements.ts
lib/communication/events.ts
lib/communication/notifications.ts
lib/communication/context.ts
```

Responsibilities:

```txt
send messages
list inbox/sent messages
read message details
mark message as read
archive message for recipient
create announcements
publish announcements
archive announcements
list announcements
create school events
cancel school events
list school events
create notification log rows
mark notification as read
```

### Reports services

Create:

```txt
lib/reports/context.ts
lib/reports/students.ts
lib/reports/attendance.ts
lib/reports/grades.ts
lib/reports/finance.ts
lib/reports/timetable.ts
```

Responsibilities:

```txt
load student roster report
load attendance summary report
load grades summary report
load finance balances report
load timetable overview report
validate report access server-side
```

Keep reports simple and readable.

---

## Server Actions

Create:

```txt
lib/actions/communication.ts
```

Recommended actions:

```txt
sendMessageAction
markMessageReadAction
archiveMessageAction
createAnnouncementAction
publishAnnouncementAction
archiveAnnouncementAction
createSchoolEventAction
cancelSchoolEventAction
markNotificationReadAction
```

Reports should mostly use Server Components + services. Do not add report mutations unless necessary.

Use Zod validation with Arabic user-facing messages where practical.

All actions must:

- resolve authenticated user server-side
- resolve tenant/school from active membership
- validate role server-side
- validate recipient/target relationships server-side
- write audit logs for important events
- never store secrets in audit metadata

---

## Audit Logs

Write audit logs for important actions:

```txt
communication.message.sent
communication.message.read
communication.message.archived
communication.announcement.created
communication.announcement.published
communication.announcement.archived
communication.event.created
communication.event.cancelled
notification.read
reports.viewed
```

Keep audit metadata minimal.

Do not store long message bodies, secrets, tokens, or credentials in audit metadata.

---

## Routes and Pages

### Communication routes

Add pages under:

```txt
app/(dashboard)/dashboard/communication
```

Required routes:

```txt
/dashboard/communication
/dashboard/communication/messages
/dashboard/communication/messages/new
/dashboard/communication/messages/[messageId]
/dashboard/communication/announcements
/dashboard/communication/announcements/new
/dashboard/communication/events
/dashboard/communication/events/new
/dashboard/communication/notifications
```

### Reports routes

Add pages under:

```txt
app/(dashboard)/dashboard/reports
```

Required routes:

```txt
/dashboard/reports
/dashboard/reports/students
/dashboard/reports/attendance
/dashboard/reports/grades
/dashboard/reports/finance
/dashboard/reports/timetable
```

---

## UI Requirements

Use Arabic RTL copy.

Keep UI simple and consistent with existing dashboard patterns.

### `/dashboard/communication`

Cards for:

```txt
الرسائل
الإعلانات
الأحداث
الإشعارات
```

### `/dashboard/communication/messages`

Show:

```txt
inbox/sent sections or tabs if simple
subject
sender
recipients
read status
sent date
```

### `/dashboard/communication/messages/new`

Fields:

```txt
recipient_user_ids
subject
body
related_student_id optional
```

### `/dashboard/communication/messages/[messageId]`

Show message details and allow marking as read/archive when appropriate.

### `/dashboard/communication/announcements`

Show list with:

```txt
title
target
status
published_at
publish/archive actions
```

### `/dashboard/communication/announcements/new`

Fields:

```txt
title
body
target_type
target_role optional
grade_level_id optional
class_id optional
expires_at optional
```

### `/dashboard/communication/events`

Show list with:

```txt
title
starts_at
ends_at
location
status
cancel action
```

### `/dashboard/communication/events/new`

Fields:

```txt
title
description optional
starts_at
ends_at
location optional
target_type
grade_level_id optional
class_id optional
```

### `/dashboard/reports`

Cards for:

```txt
تقرير الطلاب
تقرير الحضور
تقرير الدرجات
تقرير المالية
تقرير الجدول
```

Each report page should show a simple table and basic filters when practical.

Do not build charts unless already trivial with existing components.

---

## Routes and Navigation

Update:

```txt
constants/routes.ts
config/navigation.ts
```

Suggested route helpers:

```ts
communication: "/dashboard/communication",
communicationMessages: "/dashboard/communication/messages",
newCommunicationMessage: "/dashboard/communication/messages/new",
communicationMessageDetails: (messageId: string) => `/dashboard/communication/messages/${messageId}`,
communicationAnnouncements: "/dashboard/communication/announcements",
newCommunicationAnnouncement: "/dashboard/communication/announcements/new",
communicationEvents: "/dashboard/communication/events",
newCommunicationEvent: "/dashboard/communication/events/new",
communicationNotifications: "/dashboard/communication/notifications",
reports: "/dashboard/reports",
reportsStudents: "/dashboard/reports/students",
reportsAttendance: "/dashboard/reports/attendance",
reportsGrades: "/dashboard/reports/grades",
reportsFinance: "/dashboard/reports/finance",
reportsTimetable: "/dashboard/reports/timetable",
```

Activate only communication and reports navigation items.

Do not activate AI, chatbot, integrations, or report builder navigation.

---

## Types

Add:

```txt
types/communication.ts
types/reports.ts
```

Update generated Supabase types after successful database reset:

```bash
supabase gen types typescript --local > types/database.ts
```

Do not keep invalid or partial generated types.

---

## Local Seed Safety Rule

Prefer not to modify seed files in Phase 10.

Do not modify these files unless strictly necessary:

```txt
supabase/seed.sql
supabase/seeds/auth_smoke_token_defaults.sql
supabase/config.toml
```

If seed/config changes are unavoidable:

1. Keep local-only deterministic data.
2. Preserve the existing seed order.
3. Do not weaken local Auth smoke safety.
4. Do not add production secrets or real users.
5. Run full `supabase db reset`.
6. Update `docs/supabase-local.md`.

Expected current order:

```toml
sql_paths = ["./seed.sql", "./seeds/auth_smoke_token_defaults.sql"]
```

---

## Verification Commands

After implementation, run:

```bash
git status
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
npm run lint
npm run build
git diff --check
```

If `supabase db reset` fails, stop and report clearly.

Do not mark Phase 10 verified until reset, type generation, lint, build, and diff check pass.

---

## SQL Spot Checks

After successful reset, run checks for the new communication tables:

```sql
select count(*) from public.messages;
select count(*) from public.message_recipients;
select count(*) from public.announcements;
select count(*) from public.notification_logs;
select count(*) from public.school_events;
```

If a different table name is chosen intentionally, update the SQL spot checks and docs accordingly.

Ready-made reports should be checked by loading the pages or running the underlying queries where practical.

---

## Manual Smoke Test Guidance

If browser access is available, test:

1. Login as school admin.
2. Open `/dashboard/communication`.
3. Send a message to the seeded teacher user.
4. Open message details.
5. Mark the message as read.
6. Create an announcement as draft.
7. Publish the announcement.
8. Create a school event.
9. Cancel a school event if the action exists.
10. Open `/dashboard/reports`.
11. Open the student roster report.
12. Open the attendance summary report.
13. Open the grades summary report.
14. Open the finance balances report.
15. Open the timetable overview report.
16. Confirm no form exposes trusted tenant/school fields.

If browser/authenticated smoke is unavailable, document it honestly.

Do not mark browser workflows as passed unless actually tested.

---

## Documentation Updates

Update:

```txt
docs/database.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/project-status.md
docs/security-model.md
docs/verification-report.md
```

Update `docs/supabase-local.md` only if seed/config/local setup behavior changes.

Documentation must mention:

- new communication tables
- ready-made reports scope
- no real-time chat
- no external notification sending
- no AI Query or chatbot
- no drag-and-drop report builder
- role access rules
- server-side tenant/school validation
- verification results
- Go/No-Go for the next phase

---

## Expected Final Response

After implementation, report:

1. Summary of completed Phase 10 work.
2. Files created/modified.
3. Database objects added.
4. Server services/actions added.
5. Routes/pages added.
6. Ready-made reports added.
7. Security and tenant validation summary.
8. Seed/config handling summary.
9. Verification command results.
10. SQL spot check results.
11. Browser smoke status.
12. Documentation updates.
13. Commit hash if committed.
14. Final Go/No-Go for next phase.

---

## Success Criteria

Phase 10 succeeds only when:

- One Phase 10 migration replays from scratch.
- Communication tables exist.
- Communication pages compile.
- Ready-made report pages compile.
- Server-side services derive tenant/school scope from membership.
- No client-submitted tenant/school/role is trusted.
- No AI/chatbot/report-builder work is added.
- No external notification provider is added.
- `supabase db reset` passes.
- `types/database.ts` is regenerated and valid.
- SQL spot checks pass.
- `npm run lint` passes.
- `npm run build` passes.
- `git diff --check` passes.
- Docs are updated.

---

## Suggested Next Phase After Successful Completion

After Phase 10 is verified and committed, the next phase should be planned separately.

Do not start it in this prompt.

Potential later directions include:

```txt
library/health/discipline operations
or
advanced reports/export foundation
or
parent/student read-only portal slices
```

Choose the next phase only after Phase 10 is complete and documented.
