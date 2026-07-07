# Codex Execution Prompt — 08 Manual Timetable with Conflict Prevention Foundation

## Phase

`08 - Manual Timetable with Conflict Prevention Foundation`

## Role

You are Codex acting as a senior full-stack software engineer and database-aware product engineer.

You are working on **Ofuq | أُفُق**, a full-stack Arabic-first school management system built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Lucide React
- Supabase CLI / PostgreSQL / Supabase Auth
- Server Components by default
- Server Actions for mutations
- Server-side services for sensitive reads
- Fixed roles through `user_memberships`
- Multi-tenant architecture using `tenant_id` and `school_id`

This phase must add the **manual timetable foundation with conflict prevention** only.

Do not implement automatic timetable generation.

---

## Mandatory Reading Before Editing

Before making any changes, read these files carefully:

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
docs/verification-phase-07.md
supabase/config.toml
supabase/seed.sql
supabase/seeds/auth_smoke_token_defaults.sql
constants/routes.ts
config/navigation.ts
types/database.ts
types/academic.ts
types/attendance.ts
types/grades.ts
lib/auth/session.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
lib/academic/context.ts
lib/academic/academic-structure.ts
lib/actions/academic.ts
```

Also inspect the current route structure under:

```txt
app/(dashboard)/dashboard
```

Do not assume paths. Use the existing project structure.

---

## Current Project Context

The project already has these completed foundations:

1. Core auth, tenant, school, users, and fixed roles.
2. Students and admissions.
3. Academic structure:
   - `academic_years`
   - `terms`
   - `grade_levels`
   - `classes`
   - `subjects`
   - `grade_level_subjects`
   - `class_enrollments`
4. Attendance manual + QR foundation.
5. Grades and report cards foundation.
6. Local smoke seed data for development verification.

The current local smoke seed includes local-only admin and teacher auth users, app profiles, memberships, tenant, school, academic year, term, grade level, class, subject assignment, one active student, guardian, and active class enrollment.

---

## Critical Local Auth Seed Rule

This rule is mandatory.

**لا تعدّل local Auth seed بدون الحفاظ على auth_smoke_token_defaults.sql بعد seed.sql، ولا تترك token fields في auth.users بقيمة NULL.**

English interpretation:

Do not modify the local Auth seed flow unless you preserve `auth_smoke_token_defaults.sql` after `seed.sql`, and do not leave token fields in `auth.users` as `NULL`.

Current expected Supabase seed order must remain:

```toml
[db.seed]
enabled = true
sql_paths = ["./seed.sql", "./seeds/auth_smoke_token_defaults.sql"]
```

Rules:

1. Do not remove `./seeds/auth_smoke_token_defaults.sql` from `supabase/config.toml`.
2. Do not reorder it before `./seed.sql`.
3. Do not delete or weaken `supabase/seeds/auth_smoke_token_defaults.sql`.
4. If `supabase/seed.sql` is modified, verify that the token-default seed still runs after it.
5. Never leave seeded local auth users with nullable token fields in `auth.users`.
6. Do not put production secrets or real users in local seed files.
7. If this phase does not need seed changes, prefer not to modify `supabase/seed.sql` at all.
8. If local smoke data needs timetable records, add only safe local-only demo rows and keep them deterministic.
9. If seed-related changes are made, update `docs/supabase-local.md` with a short note.
10. The final response must explicitly state whether seed files were changed and whether this rule was preserved.

After any seed-related change, run:

```bash
supabase db reset
```

Then verify local auth users still work and token fields are not null for seeded smoke users.

---

## Main Objective

Build the timetable foundation that allows school admins to manually create timetable slots while preventing obvious conflicts.

This phase must support:

- manual weekly timetable slot creation
- teacher conflict prevention
- class conflict prevention
- optional room conflict prevention
- subject/class/year validation
- Arabic RTL dashboard pages
- server-side role, tenant, school, and relationship validation
- documentation updates
- local verification

This phase must **not** generate timetables automatically.

---

## Scope

### In Scope

Implement a focused vertical slice for manual timetable management:

```txt
rooms
teacher_subject_assignments
timetable_slots
server-side timetable conflict checks
manual timetable pages
routes/navigation updates
documentation updates
validation commands
```

Use the existing academic structure and local smoke seed data where possible.

### Out of Scope

Do not implement:

```txt
automatic timetable generation algorithm
AI scheduling
teacher workload optimization
substitution management
calendar sync
Google/Microsoft Calendar integration
attendance session auto-generation from timetable
exam timetable
room booking system beyond simple room conflict checks
notifications
student/parent timetable portal
advanced reporting
finance
communication module
full RBAC
full RLS
```

---

## Database Design

Create one new migration only.

Migration filename should follow the existing timestamp style, for example:

```txt
supabase/migrations/<timestamp>_manual_timetable_conflict_prevention.sql
```

Do not modify old migrations.

### Recommended Enums

Create minimal enums if they do not already exist.

```sql
public.timetable_day_of_week
public.timetable_slot_status
public.room_status
public.teacher_subject_assignment_status
```

Recommended values:

```txt
timetable_day_of_week:
sunday
monday
tuesday
wednesday
thursday
friday
saturday

timetable_slot_status:
active
cancelled
archived

room_status:
active
inactive
archived

teacher_subject_assignment_status:
active
inactive
archived
```

If you choose not to create `timetable_day_of_week` enum, use a small integer day field with a check constraint. Prefer whichever is cleaner and consistent with current project style.

---

## Tables to Add

### 1. `rooms`

Purpose:

Simple school rooms used for optional timetable conflict prevention.

Fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
name text not null
code text
capacity integer
location text
status public.room_status not null default 'active'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `tenant_id` and `school_id` are mandatory.
- `name` should be unique per school if reasonable.
- `code` should be unique per school when present.
- `capacity`, if present, must be positive.
- Do not build a full room booking system.

Recommended indexes/constraints:

```txt
index on tenant_id, school_id
index on status
unique safe constraint on tenant_id, school_id, code when code is not null
optional unique safe constraint on tenant_id, school_id, name
```

---

### 2. `teacher_subject_assignments`

Purpose:

Define which teacher may teach which subject for a grade level or class context.

Recommended minimal form:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
academic_year_id uuid not null references public.academic_years(id)
teacher_user_id uuid not null references public.user_profiles(id)
subject_id uuid not null references public.subjects(id)
grade_level_id uuid null references public.grade_levels(id)
class_id uuid null references public.classes(id)
status public.teacher_subject_assignment_status not null default 'active'
created_by_user_id uuid null references public.user_profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Keep it simple.
- This is not a workload planner.
- Validate server-side that `teacher_user_id` has an active teacher membership in the same tenant/school.
- Validate that subject, grade level, class, and academic year belong to the same tenant/school.
- If both `grade_level_id` and `class_id` are null, reject the assignment.
- If `class_id` is provided, derive/validate its grade level and academic year.
- Do not create complex teacher workload, timetable generation, or scheduling algorithm logic.

If this table becomes too much for this slice, you may implement timetable slots with direct `teacher_user_id` and `subject_id`, but still validate teacher role and subject/class relationships server-side. Prefer adding this table because timetable needs a stable teaching assignment foundation.

Recommended indexes/constraints:

```txt
index on tenant_id, school_id
index on academic_year_id
index on teacher_user_id
index on subject_id
index on class_id
index on grade_level_id
index on status
safe uniqueness for active assignment if practical
```

---

### 3. `timetable_slots`

Purpose:

Represent one manually scheduled class period.

Fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
academic_year_id uuid not null references public.academic_years(id)
term_id uuid null references public.terms(id)
class_id uuid not null references public.classes(id)
grade_level_id uuid not null references public.grade_levels(id)
subject_id uuid not null references public.subjects(id)
teacher_user_id uuid not null references public.user_profiles(id)
room_id uuid null references public.rooms(id)
day_of_week public.timetable_day_of_week not null
starts_at time not null
ends_at time not null
status public.timetable_slot_status not null default 'active'
notes text
created_by_user_id uuid null references public.user_profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `starts_at < ends_at`.
- `grade_level_id` must be derived from or validated against the class.
- `academic_year_id` must match the class academic year.
- `subject_id` must be valid for the class grade level through `grade_level_subjects` when possible.
- `teacher_user_id` must have active teacher membership in the same tenant/school.
- `room_id`, if present, must be in the same tenant/school and active.
- Do not trust any tenant/school/role fields from forms.

Indexes:

Add useful indexes for:

```txt
tenant_id, school_id
academic_year_id
term_id
class_id
teacher_user_id
room_id
day_of_week
status
```

Conflict prevention may be done mostly in server-side logic, with optional exclusion constraints only if you are confident they are compatible with the current local Supabase/PostgreSQL setup.

Prefer server-side overlap checks for this MVP slice.

---

## Conflict Prevention Requirements

Before creating an active timetable slot, server-side code must check:

### 1. Class Conflict

No active slot for the same class overlaps on the same day in the same academic year and term context.

Conflict if:

```txt
same tenant_id
same school_id
same academic_year_id
same class_id
same day_of_week
status = active
time ranges overlap
```

Time overlap rule:

```txt
new.starts_at < existing.ends_at
and
new.ends_at > existing.starts_at
```

### 2. Teacher Conflict

No active slot for the same teacher overlaps on the same day.

Conflict if:

```txt
same tenant_id
same school_id
same academic_year_id
same teacher_user_id
same day_of_week
status = active
time ranges overlap
```

### 3. Room Conflict

If `room_id` is provided, no active slot for the same room overlaps on the same day.

Conflict if:

```txt
same tenant_id
same school_id
same academic_year_id
same room_id
same day_of_week
status = active
time ranges overlap
```

### 4. Relationship Validation

Before insert:

- class belongs to the current tenant/school
- class belongs to academic year
- class grade level matches submitted/derived grade level
- subject belongs to same tenant/school
- subject is assigned to grade level for the selected academic year if `grade_level_subjects` contains relevant rows
- teacher has active teacher membership in current tenant/school
- term, if provided, belongs to the academic year and same tenant/school
- room, if provided, belongs to same tenant/school and is active

---

## Role Rules

Use fixed roles only.

Allowed to manage timetable:

```txt
system_admin
school_admin
```

Teacher access in this phase:

```txt
teacher = read-only view of timetable slots relevant to that teacher when simple and safe
```

Do not allow these roles to create or modify timetable slots:

```txt
parent
student
accountant
librarian
```

Do not add RBAC tables.

---

## Server Context

Create:

```txt
lib/timetable/context.ts
```

Pattern should match existing module contexts such as academic, attendance, and grades.

Recommended helper:

```ts
requireTimetableContext(allowedRoles)
```

It must derive:

```txt
user_id
role
tenant_id
school_id
membership
```

from the authenticated active membership.

Never accept trusted `tenant_id`, `school_id`, or `role` from form input.

---

## Services

Create small server-side services:

```txt
lib/timetable/rooms.ts
lib/timetable/teacher-subject-assignments.ts
lib/timetable/timetable-slots.ts
lib/timetable/conflicts.ts
lib/timetable/context.ts
```

If fewer files are simpler, you may combine services, but keep conflict logic clear and testable.

Service responsibilities:

### `rooms.ts`

- list rooms
- create room
- validate active room by tenant/school

### `teacher-subject-assignments.ts`

- list assignments
- create assignment
- validate teacher subject/class/grade context

### `conflicts.ts`

- detect class conflict
- detect teacher conflict
- detect room conflict
- return clear Arabic-friendly error messages or structured conflict descriptions

### `timetable-slots.ts`

- list timetable slots
- create timetable slot
- cancel/archive slot if needed and simple
- load timetable page data

---

## Server Actions

Create:

```txt
lib/actions/timetable.ts
```

Actions:

```txt
createRoomAction
createTeacherSubjectAssignmentAction
createTimetableSlotAction
cancelTimetableSlotAction
```

Optional if simple:

```txt
archiveTimetableSlotAction
```

Use Zod validation.

Use Arabic validation messages for user-facing forms.

Server Actions must:

- call `requireTimetableContext`
- validate role
- derive tenant/school from membership
- validate all relationships server-side
- perform conflict checks before insert
- write audit logs for important events
- return the existing `ActionResult` pattern if available

Audit events:

```txt
timetable.room.created
timetable.teacher_subject_assignment.created
timetable.slot.created
timetable.slot.cancelled
```

Do not store secrets or raw auth tokens in audit metadata.

---

## Pages and UI

Add Arabic RTL pages under:

```txt
app/(dashboard)/dashboard/timetable
```

Required pages:

```txt
/dashboard/timetable
/dashboard/timetable/rooms
/dashboard/timetable/assignments
/dashboard/timetable/slots
/dashboard/timetable/slots/new
```

Optional if simple:

```txt
/dashboard/timetable/teacher
```

### `/dashboard/timetable`

Overview page with cards:

- active timetable slots
- rooms
- teacher assignments
- conflict-prevention status
- links to rooms, assignments, and slots

### `/dashboard/timetable/rooms`

- list rooms
- create room form

### `/dashboard/timetable/assignments`

- list teacher-subject assignments
- create teacher-subject assignment form

### `/dashboard/timetable/slots`

- list timetable slots
- filters if simple:
  - academic year
  - class
  - teacher
  - day

### `/dashboard/timetable/slots/new`

Form fields:

```txt
academic_year_id
term_id optional
class_id
subject_id
teacher_user_id
room_id optional
day_of_week
starts_at
ends_at
notes
```

Do not include tenant/school fields in forms.

Show clear Arabic errors when conflicts are found:

- teacher already has a class at this time
- selected class already has a class at this time
- selected room is already booked at this time

Keep UI simple. Do not build drag-and-drop timetable UI in this phase.

---

## Routes and Navigation

Update `constants/routes.ts` with timetable routes.

Suggested route helpers:

```ts
timetable: "/dashboard/timetable",
timetableRooms: "/dashboard/timetable/rooms",
timetableAssignments: "/dashboard/timetable/assignments",
timetableSlots: "/dashboard/timetable/slots",
newTimetableSlot: "/dashboard/timetable/slots/new",
```

Update `config/navigation.ts`:

- Activate the timetable item.
- Use Arabic label.
- Remove placeholder state only for the timetable item.
- Do not activate unrelated future modules.

---

## Local Smoke Seed Guidance

Prefer not to modify `supabase/seed.sql` in this phase.

If manual timetable smoke testing requires seed additions, keep them minimal and local-only.

Safe additions may include:

- one demo room
- one teacher-subject assignment
- one non-conflicting timetable slot only if needed for verification

However, avoid seeding workflow outputs unless necessary. It is acceptable to leave timetable workflow tables empty after reset and test creation through the UI/actions.

If modifying seed files:

1. Preserve deterministic IDs.
2. Preserve local-only credentials.
3. Preserve `supabase/seeds/auth_smoke_token_defaults.sql` after `supabase/seed.sql` in `supabase/config.toml`.
4. Verify local Auth token fields are not null.
5. Document the change in `docs/supabase-local.md`.

---

## Verification Requirements

Run these commands after implementation:

```bash
git status
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
npm run lint
npm run build
```

If `supabase db reset` fails, stop and report clearly.

If type generation produces an invalid or empty schema, do not keep the generated diff.

After seed-related changes, run SQL spot checks for local auth seeded users:

```sql
select
  email,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change_token,
  phone_change,
  reauthentication_token
from auth.users
where email in ('admin@ofuq.local', 'teacher@ofuq.local');
```

If any token field exists and is NULL for the smoke users, fix the seed flow before continuing.

Also run timetable spot checks if possible:

```sql
select count(*) from public.rooms;
select count(*) from public.teacher_subject_assignments;
select count(*) from public.timetable_slots;
```

And verify there are no obvious overlap violations for active slots if any are seeded or created.

---

## Manual Smoke Test Guidance

If a browser environment is available, test:

1. Login as `admin@ofuq.local`.
2. Open `/dashboard/timetable`.
3. Create a room.
4. Create a teacher-subject assignment for `teacher@ofuq.local`.
5. Create a timetable slot.
6. Try to create an overlapping slot for the same class.
7. Try to create an overlapping slot for the same teacher.
8. Try to create an overlapping slot for the same room.
9. Confirm conflict errors appear in Arabic.
10. Confirm non-conflicting slot creation works.
11. Confirm teacher can view timetable if read-only teacher view is implemented.

If browser/authenticated smoke testing is blocked, document it clearly.

Do not mark browser workflows as passed unless actually tested.

---

## Documentation Updates

Update these files:

```txt
docs/database.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/project-status.md
docs/security-model.md
```

Update `docs/supabase-local.md` only if local seed/config behavior changes.

Document:

- new timetable tables
- conflict prevention rules
- role access rules
- what remains deferred
- verification results
- Go/No-Go for Phase 09 Finance Basics

Do not overwrite unrelated documentation.

---

## Strict Do Not Do List

Do not:

- implement automatic timetable generation
- implement AI scheduling
- implement drag-and-drop timetable builder
- implement calendar sync
- implement attendance auto-generation from timetable
- implement exam timetable
- implement notifications
- implement finance
- implement communication
- implement advanced reports
- implement full RBAC
- implement full RLS
- modify old migrations
- trust tenant_id or school_id from forms
- trust role from client input
- allow timetable slots without server-side relationship validation
- allow overlapping active slots for the same class
- allow overlapping active slots for the same teacher
- allow overlapping active slots for the same room when room is provided
- add broad dependencies
- modify local Auth seed without preserving `auth_smoke_token_defaults.sql` after `seed.sql`
- leave token fields in `auth.users` as NULL for local smoke users

---

## Expected Final Response

After implementation, respond with:

1. Summary of completed Phase 08 work.
2. Files created/modified.
3. Database objects added.
4. Conflict prevention behavior implemented.
5. Security and tenant validation summary.
6. Seed/auth-token handling summary.
7. Verification command results.
8. Manual smoke status.
9. Skipped/deferred items.
10. TODOs.
11. Suggested next prompt:

```txt
09 - Finance Basics Foundation
```

---

## Success Criteria

Phase 08 is successful when:

- Timetable schema exists and replays from scratch.
- Manual timetable slot creation works.
- Class overlap conflicts are blocked.
- Teacher overlap conflicts are blocked.
- Room overlap conflicts are blocked when room is provided.
- All writes derive tenant/school/user/role from active membership.
- Timetable routes compile.
- Arabic RTL UI exists for timetable management.
- Supabase reset and type generation pass.
- `npm run lint` passes.
- `npm run build` passes.
- Local Auth smoke seed token defaults remain safe and non-null.
