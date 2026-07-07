# Codex Execution Prompt — 12 Health, Discipline, and Achievements Foundation

## Phase

`12 - Health, Discipline, and Achievements Foundation`

## Role

You are Codex acting as a senior full-stack engineer and database-aware product engineer.

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

This phase must add the first foundation for **student care** only:

```txt
health records
vaccinations
clinic visits
discipline records
achievements
```

Keep the work focused. Do not start complaints, surveys, AI, chatbot, parent notifications, external integrations, advanced medical workflows, or report-builder work.

---

## Main Goal

Implement a focused vertical slice for basic student-care operations:

1. Basic health record per student.
2. Vaccination records.
3. School clinic visits.
4. Discipline records.
5. Student achievements.
6. Arabic RTL dashboard pages.
7. Server-side tenant/school/student validation.
8. Audit logs.
9. Documentation and verification.

Recommended Arabic UI module name:

```txt
الرعاية الطلابية
```

Recommended main route:

```txt
/dashboard/student-care
```

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
types/communication.ts
types/reports.ts
types/library.ts
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
lib/communication
lib/reports
lib/library
app/(dashboard)/dashboard
```

Also inspect current UI page and form patterns before adding new routes.

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
8. Communication and ready-made reports.
9. Library foundation.
10. Local smoke seed data.

Phase 12 must build student-care features on top of the existing tenant/school and student foundations.

---

## Strict Scope

### In Scope

Add the foundation for:

```txt
health_records
vaccinations
clinic_visits
discipline_records
achievements
student-care dashboard pages
health record upsert/list/detail foundation
vaccination create/list foundation
clinic visit create/close/list foundation
discipline record create/review/list foundation
achievement create/publish/archive/list foundation
server-side tenant/school/student validation
audit logs
documentation
verification
```

### Out of Scope

Do not implement:

```txt
medical diagnosis
prescriptions
doctor portal
nurse role
insurance
medical file uploads
hospital/lab integrations
parent notifications
SMS/email/WhatsApp alerts
PDF certificates
advanced punishment workflows
behavior risk scoring
AI behavior analysis
AI health analysis
complaints
surveys
external integrations
full RBAC
full RLS
```

Keep this phase as a simple operational student-care foundation.

---

## Database Migration

Create exactly one new migration for Phase 12.

Use the existing timestamp convention, for example:

```txt
supabase/migrations/<timestamp>_student_care_foundation.sql
```

Do not modify old migrations.

---

## Recommended Enums

Add minimal enums if they do not already exist:

```txt
health_record_status
vaccination_status
clinic_visit_status
discipline_incident_type
discipline_severity
discipline_status
achievement_category
achievement_level
achievement_status
```

Recommended values:

```txt
health_record_status:
active
archived

vaccination_status:
scheduled
completed
missed
exempted
unknown

clinic_visit_status:
open
closed
referred
cancelled

discipline_incident_type:
behavior
attendance
uniform
bullying
damage
academic_misconduct
other

discipline_severity:
low
medium
high
critical

discipline_status:
draft
submitted
reviewed
resolved
cancelled

achievement_category:
academic
sports
arts
behavior
attendance
community
competition
other

achievement_level:
class
school
district
regional
national
international

achievement_status:
draft
published
archived
```

Keep enum names clear and module-scoped.

---

## Tables to Add

### 1. `health_records`

Purpose:

Stores a simple school health profile for a student.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
student_id uuid not null references public.students(id) on delete cascade
blood_type text null
allergies text null
chronic_conditions text null
medications text null
emergency_notes text null
doctor_name text null
doctor_phone text null
status public.health_record_status not null default 'active'
created_by_user_id uuid null references public.user_profiles(id)
updated_by_user_id uuid null references public.user_profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `tenant_id` and `school_id` are mandatory.
- Student must belong to the same tenant/school.
- Prefer one active health record per student.
- Keep data basic and school-oriented.
- Do not implement diagnosis, prescriptions, or medical document uploads.
- Do not store sensitive detailed medical payloads in audit logs.

Recommended indexes/constraints:

```txt
index on tenant_id, school_id
index on student_id
index on status
unique on tenant_id, school_id, student_id where status = 'active' if practical
```

If partial uniqueness is awkward with enums, enforce one active health record per student in server-side logic and add useful indexes.

---

### 2. `vaccinations`

Purpose:

Stores vaccination records for a student.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
student_id uuid not null references public.students(id) on delete cascade
vaccine_name text not null
dose_label text null
vaccinated_on date null
next_due_on date null
status public.vaccination_status not null default 'unknown'
notes text null
recorded_by_user_id uuid null references public.user_profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Student must belong to the same tenant/school.
- `vaccine_name` is required.
- If both `vaccinated_on` and `next_due_on` are present, `next_due_on` should not be before `vaccinated_on`.
- Keep vaccination tracking simple.
- Do not send vaccine reminders in this phase.

Recommended indexes:

```txt
index on tenant_id, school_id
index on student_id
index on status
index on next_due_on
```

---

### 3. `clinic_visits`

Purpose:

Tracks school clinic visits or simple health incidents handled at school.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
student_id uuid not null references public.students(id) on delete cascade
visited_at timestamptz not null default now()
reason text not null
symptoms text null
action_taken text null
returned_to_class boolean not null default true
guardian_contacted boolean not null default false
referred_to_external_care boolean not null default false
handled_by_user_id uuid null references public.user_profiles(id)
status public.clinic_visit_status not null default 'open'
notes text null
closed_at timestamptz null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Student must belong to the same tenant/school.
- `reason` is required.
- `handled_by_user_id` must be derived from authenticated actor when practical.
- Closing a clinic visit should set `status = closed` and `closed_at`.
- Referral should set `status = referred` or `referred_to_external_care = true` according to your chosen model.
- Do not implement medical diagnosis or prescriptions.

Recommended indexes:

```txt
index on tenant_id, school_id
index on student_id
index on status
index on visited_at desc
```

---

### 4. `discipline_records`

Purpose:

Tracks student behavior/discipline incidents and basic review status.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
student_id uuid not null references public.students(id) on delete cascade
incident_date date not null
incident_type public.discipline_incident_type not null default 'other'
severity public.discipline_severity not null default 'low'
title text not null
description text not null
action_taken text null
status public.discipline_status not null default 'submitted'
reported_by_user_id uuid not null references public.user_profiles(id)
reviewed_by_user_id uuid null references public.user_profiles(id)
reviewed_at timestamptz null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Student must belong to the same tenant/school.
- `reported_by_user_id` must be the authenticated actor.
- `reviewed_by_user_id` must be the authenticated actor when reviewing.
- Teachers may create records if role access allows it.
- School admins may review/resolve records.
- Do not implement advanced sanctions, escalation workflows, or parent notifications in this phase.

Recommended indexes:

```txt
index on tenant_id, school_id
index on student_id
index on incident_date desc
index on incident_type
index on severity
index on status
```

---

### 5. `achievements`

Purpose:

Tracks student achievements and recognitions.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
student_id uuid not null references public.students(id) on delete cascade
achievement_date date not null
title text not null
description text null
category public.achievement_category not null default 'other'
level public.achievement_level not null default 'school'
awarded_by_user_id uuid null references public.user_profiles(id)
status public.achievement_status not null default 'draft'
created_by_user_id uuid not null references public.user_profiles(id)
published_at timestamptz null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Student must belong to the same tenant/school.
- `created_by_user_id` must be the authenticated actor.
- Publishing sets `status = published` and `published_at`.
- Do not generate PDF certificates in this phase.
- Do not notify parents in this phase.

Recommended indexes:

```txt
index on tenant_id, school_id
index on student_id
index on achievement_date desc
index on category
index on level
index on status
```

---

## Server-Side Validation Rules

All mutations must derive scope from authenticated active membership.

Never trust these fields from forms:

```txt
tenant_id
school_id
role
created_by_user_id
updated_by_user_id
recorded_by_user_id
handled_by_user_id
reported_by_user_id
reviewed_by_user_id
awarded_by_user_id
```

Validate server-side:

1. Student belongs to the current tenant/school.
2. Student should be active for new records where practical.
3. Current actor has an allowed role.
4. Health record upsert targets the correct student.
5. Vaccination dates are valid.
6. Clinic visit status transitions are valid.
7. Discipline status transitions are valid.
8. Achievement publish/archive transitions are valid.
9. No sensitive medical details are written into audit metadata.
10. No client-submitted tenant/school/user/role values are trusted.

Use database constraints where useful, but keep business workflow checks clear in server-side services/actions.

---

## Role Rules

Use fixed roles only.

Do not add a `nurse` role in this phase.

### Full Student-Care Management

Allowed roles:

```txt
system_admin
school_admin
```

They can:

```txt
create/update health records
create vaccination records
create/close clinic visits
create/review discipline records
create/publish/archive achievements
view student-care dashboard
```

### Limited Teacher Actions

Allowed where safe:

```txt
teacher
```

Teachers may:

```txt
create discipline records
create achievements
view limited records if server-side scoping is safe
```

Teachers should not manage full health records unless the existing project model makes it safe and the action is explicitly constrained.

### No Mutation Access

Do not allow these roles to mutate student-care records in this phase:

```txt
parent
student
accountant
librarian
```

Parent/student read-only portal remains deferred.

Do not add RBAC tables.

---

## Server Context

Create:

```txt
lib/student-care/context.ts
```

Recommended helper:

```ts
requireStudentCareContext(allowedRoles)
```

It must derive from authenticated active membership:

```txt
user_id
role
tenant_id
school_id
membership
```

Never accept tenant/school/role from client input.

---

## Server Services

Create:

```txt
lib/student-care/context.ts
lib/student-care/health-records.ts
lib/student-care/vaccinations.ts
lib/student-care/clinic-visits.ts
lib/student-care/discipline.ts
lib/student-care/achievements.ts
```

Responsibilities:

### `health-records.ts`

```txt
list health records
get health record by student
upsert health record
validate student ownership
keep one active record per student
```

### `vaccinations.ts`

```txt
list vaccination records
create vaccination record
validate student ownership
validate vaccination dates
```

### `clinic-visits.ts`

```txt
list clinic visits
create clinic visit
close clinic visit
mark referred if implemented simply
validate student ownership
validate status transitions
```

### `discipline.ts`

```txt
list discipline records
create discipline record
review discipline record
resolve discipline record if implemented simply
validate student ownership
validate role rules
validate status transitions
```

### `achievements.ts`

```txt
list achievements
create achievement
publish achievement
archive achievement
validate student ownership
validate status transitions
```

Keep services small and readable.

---

## Server Actions

Create:

```txt
lib/actions/student-care.ts
```

Recommended actions:

```txt
upsertHealthRecordAction
createVaccinationAction
createClinicVisitAction
closeClinicVisitAction
createDisciplineRecordAction
reviewDisciplineRecordAction
createAchievementAction
publishAchievementAction
archiveAchievementAction
```

Use Zod validation with Arabic user-facing messages where practical.

Actions must:

- call `requireStudentCareContext`
- validate role server-side
- derive tenant/school/user from active membership
- validate all student relationships server-side
- write audit logs for important events
- return the existing project `ActionResult` pattern if available

---

## Audit Logs

Write audit logs for important actions:

```txt
student_care.health_record.upserted
student_care.vaccination.created
student_care.clinic_visit.created
student_care.clinic_visit.closed
student_care.discipline.created
student_care.discipline.reviewed
student_care.achievement.created
student_care.achievement.published
student_care.achievement.archived
```

Keep audit metadata minimal:

```txt
student_id
record_id
status
```

Do not store detailed health notes, diagnosis-like text, symptoms, medications, chronic conditions, secrets, auth tokens, or credentials in audit metadata.

---

## Routes and Pages

Add pages under:

```txt
app/(dashboard)/dashboard/student-care
```

Required routes:

```txt
/dashboard/student-care
/dashboard/student-care/health
/dashboard/student-care/health/[studentId]
/dashboard/student-care/vaccinations
/dashboard/student-care/clinic-visits
/dashboard/student-care/clinic-visits/new
/dashboard/student-care/discipline
/dashboard/student-care/discipline/new
/dashboard/student-care/achievements
/dashboard/student-care/achievements/new
```

Optional if simple:

```txt
/dashboard/student-care/clinic-visits/[visitId]
/dashboard/student-care/discipline/[recordId]
/dashboard/student-care/achievements/[achievementId]
```

Do not create parent/student public portal routes in this phase.

---

## UI Requirements

Use Arabic RTL copy.

Keep UI simple and consistent with existing dashboard patterns.

### `/dashboard/student-care`

Overview cards:

```txt
السجلات الصحية
التطعيمات
زيارات العيادة
سجلات الانضباط
الإنجازات
```

Suggested metrics:

```txt
total health records
recent clinic visits
open clinic visits
open discipline records
published achievements
```

### `/dashboard/student-care/health`

Show table:

```txt
student
blood_type
allergies summary
status
last updated
```

Link to per-student health record page.

### `/dashboard/student-care/health/[studentId]`

Show student health record and form to create/update basic health info.

Fields:

```txt
blood_type optional
allergies optional
chronic_conditions optional
medications optional
emergency_notes optional
doctor_name optional
doctor_phone optional
```

### `/dashboard/student-care/vaccinations`

Show vaccination table and creation form.

Fields:

```txt
student_id
vaccine_name
dose_label optional
vaccinated_on optional
next_due_on optional
status
notes optional
```

### `/dashboard/student-care/clinic-visits`

Show clinic visits table:

```txt
student
visited_at
reason
status
guardian_contacted
referred_to_external_care
```

### `/dashboard/student-care/clinic-visits/new`

Fields:

```txt
student_id
visited_at optional
reason
symptoms optional
action_taken optional
returned_to_class
guardian_contacted
referred_to_external_care
notes optional
```

### `/dashboard/student-care/discipline`

Show discipline table:

```txt
student
incident_date
title
incident_type
severity
status
reported_by
```

### `/dashboard/student-care/discipline/new`

Fields:

```txt
student_id
incident_date
incident_type
severity
title
description
action_taken optional
```

### `/dashboard/student-care/achievements`

Show achievements table:

```txt
student
achievement_date
title
category
level
status
```

### `/dashboard/student-care/achievements/new`

Fields:

```txt
student_id
achievement_date
title
description optional
category
level
awarded_by_user_id optional if safely loaded from same school users
```

Do not expose tenant/school/user-role fields in forms.

---

## Routes and Navigation

Update:

```txt
constants/routes.ts
config/navigation.ts
```

Suggested route helpers:

```ts
studentCare: "/dashboard/student-care",
studentCareHealth: "/dashboard/student-care/health",
studentCareHealthDetails: (studentId: string) => `/dashboard/student-care/health/${studentId}`,
studentCareVaccinations: "/dashboard/student-care/vaccinations",
studentCareClinicVisits: "/dashboard/student-care/clinic-visits",
newStudentCareClinicVisit: "/dashboard/student-care/clinic-visits/new",
studentCareDiscipline: "/dashboard/student-care/discipline",
newStudentCareDiscipline: "/dashboard/student-care/discipline/new",
studentCareAchievements: "/dashboard/student-care/achievements",
newStudentCareAchievement: "/dashboard/student-care/achievements/new",
```

Activate only the student-care navigation item.

Do not activate complaints, surveys, AI, integrations, or other future modules.

---

## Types

Add:

```txt
types/student-care.ts
```

Update generated Supabase types after successful database reset:

```bash
supabase gen types typescript --local > types/database.ts
```

Do not keep invalid, empty, or partial generated types.

---

## Local Seed Safety Rule

Prefer not to modify seed files in Phase 12.

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

Do not mark Phase 12 verified until reset, type generation, lint, build, and diff check pass.

---

## SQL Spot Checks

After successful reset, run checks for the new student-care tables:

```sql
select count(*) from public.health_records;
select count(*) from public.vaccinations;
select count(*) from public.clinic_visits;
select count(*) from public.discipline_records;
select count(*) from public.achievements;
```

If seed was not changed, counts may be `0` after reset. That is acceptable as long as the tables exist and the queries succeed.

If one-active-health-record-per-student is implemented in the database or service layer, also verify no duplicates exist:

```sql
select student_id, count(*)
from public.health_records
where status = 'active'
group by student_id
having count(*) > 1;
```

Expected result:

```txt
0 rows
```

---

## Manual Smoke Test Guidance

If browser access is available, test:

1. Login as `school_admin`.
2. Open `/dashboard/student-care`.
3. Create or update a health record for the seeded active student.
4. Add a vaccination record.
5. Add a clinic visit.
6. Close the clinic visit.
7. Create a discipline record.
8. Review or resolve the discipline record if the action exists.
9. Create an achievement.
10. Publish the achievement.
11. Confirm forms do not expose tenant/school fields.
12. Confirm unauthorized roles cannot mutate restricted student-care records.

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

- new student-care tables
- basic health record scope
- vaccination tracking scope
- clinic visit scope
- discipline record scope
- achievement scope
- role access rules
- server-side tenant/school/student validation
- no diagnosis/prescriptions
- no parent notifications
- no PDF certificates
- no AI analysis or risk scoring
- verification results
- Go/No-Go for the next phase

---

## Expected Final Response

After implementation, report:

1. Summary of completed Phase 12 work.
2. Files created/modified.
3. Database objects added.
4. Server services/actions added.
5. Routes/pages added.
6. Student-care workflow behavior.
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

Phase 12 succeeds only when:

- One Phase 12 migration replays from scratch.
- Student-care tables exist.
- Health pages compile.
- Vaccination pages compile.
- Clinic visit pages compile.
- Discipline pages compile.
- Achievement pages compile.
- Server-side services derive tenant/school scope from membership.
- Student ownership is validated server-side.
- No client-submitted tenant/school/role/user fields are trusted.
- No diagnosis/prescriptions are added.
- No parent notifications are added.
- No PDF certificate generation is added.
- No AI analysis/risk scoring is added.
- `supabase db reset` passes.
- `types/database.ts` is regenerated and valid.
- SQL spot checks pass.
- `npm run lint` passes.
- `npm run build` passes.
- `git diff --check` passes.
- Docs are updated.

---

## Suggested Next Phase After Successful Completion

After Phase 12 is verified and committed, plan the next phase separately.

Do not start it in this prompt.

Potential next phase:

```txt
13 - Complaints and Surveys Foundation
```

Keep the next phase separate from student care.
