# Codex Execution Prompt — 04 Students and Admissions Foundation

## Role

You are Codex acting as a senior full-stack Next.js engineer, Supabase/PostgreSQL engineer, product-minded software architect, and security-focused implementation partner.

You are working on **Ofuq | أُفُق**, a full-stack Arabic-first, RTL-first, multi-tenant school management system.

This task implements the fourth project slice:

```txt
04 - Students and Admissions Foundation
```

This is the first real business-data module. Be careful. The goal is to build a solid foundation for student admissions and student records without expanding into unrelated modules.

---

## Primary Objective

Build the first business module foundation for:

1. student admission requests
2. student records created from approved admissions
3. guardian relationship foundation
4. student document metadata and private storage foundation
5. student status history foundation
6. basic dashboard pages for admissions and students

All tenant, school, and role decisions must come from the authenticated user's active membership context, not from client-submitted values.

---

## Mandatory First Step

Before editing any file, read these files in this order:

```txt
AGENTS.md
docs/architecture.md
docs/database.md
docs/security-model.md
docs/supabase-local.md
docs/project-phases.md
docs/codex-workflow.md
package.json
proxy.ts
lib/auth/session.ts
lib/actions/auth.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/admin.ts
constants/roles.ts
constants/routes.ts
config/navigation.ts
types/auth.ts
types/tenant.ts
types/database.ts
app/(dashboard)/layout.tsx
app/(dashboard)/dashboard/page.tsx
components/app/app-shell.tsx
components/app/app-header.tsx
components/shared/page-header.tsx
components/shared/empty-state.tsx
components/shared/status-badge.tsx
components/ui/button.tsx
components/ui/card.tsx
components/ui/input.tsx
components/ui/label.tsx
components/ui/field.tsx
```

If a file does not exist, report it and continue with the closest existing structure.

Important: this repository currently uses root-level folders such as:

```txt
app/
lib/
types/
constants/
components/
docs/
supabase/
```

Do **not** assume a `src/` directory unless it already exists.

---

## Current Foundation You Must Preserve

The current project already has:

- Supabase Auth foundation
- real Arabic email/password login
- server-protected dashboard
- `getAuthenticatedUser()` in `lib/auth/session.ts`
- fixed role model through `public.user_memberships`
- generated `types/database.ts`
- session refresh through `proxy.ts`
- `user_profiles` and `user_memberships` as the auth/profile/membership foundation

Do not rebuild authentication.

Do not replace the current membership model.

Do not introduce full RBAC.

---

## Current Architecture Assumptions

Use this model exactly:

```txt
Supabase Auth            -> identity source
public.user_profiles     -> app profile; id matches auth.users.id
public.user_memberships  -> tenant/school/role context
public.tenants           -> top-level organization boundary
public.schools           -> school boundary inside a tenant
public.audit_logs        -> security/workflow audit events
```

The new student/admission data must be tenant-aware from the beginning.

All new tenant-owned tables must include:

```txt
tenant_id
```

All new school-scoped tables should include:

```txt
school_id
```

---

## Non-Negotiable Security Rules

Follow these rules strictly:

1. Never trust `tenant_id`, `school_id`, or `role` from forms or Client Components.
2. Resolve `tenant_id`, `school_id`, and `role` from `getAuthenticatedUser()` and the current active membership.
3. All create/update/delete flows must be Server Actions or server-side services.
4. Sensitive reads must validate authentication, active membership, role, tenant context, and school context where applicable.
5. Use fixed role checks only. Do not implement full RBAC.
6. Do not expose `SUPABASE_SERVICE_ROLE_KEY` to Client Components.
7. Do not upload documents directly from the client with privileged access.
8. Do not store files in the database; store only metadata and storage paths.
9. Do not rely on full production RLS in this phase.
10. Do not log secrets, credentials, tokens, or raw uploaded file contents.
11. User-facing validation and error messages must be Arabic.

---

## Fixed Role Rules for Phase 04

Use these fixed roles only:

```txt
system_admin
school_admin
teacher
parent
student
accountant
librarian
```

### Allowed in this phase

#### `system_admin`

- Can read admissions and students for the tenant/school available through membership context.
- Can manage admissions if the membership has enough tenant/school context.

#### `school_admin`

- Can create, view, review, approve, reject admission requests inside their school.
- Can view students inside their school.
- Can create a student record from an approved admission.

#### `parent`

- Can create an admission request for their current tenant/school context.
- Can view their own submitted admission requests if implemented simply.

### Read-only or no-op in this phase

#### `teacher`

- May be allowed to view students later, but do not implement teacher-specific student screens now.

#### `student`, `accountant`, `librarian`

- No student/admission management permissions in this phase.

Keep the implementation minimal. Do not build complex permission systems.

---

## In Scope

Implement a foundation slice only.

### Database

Create a new incremental migration for:

- `student_admissions`
- `students`
- `student_guardians`
- `student_documents`
- `student_status_history`
- optional enum types needed by these tables
- a private Supabase Storage bucket for student documents, if safe and practical in migration

### Backend / Server

Create server-side services and actions for:

- listing admissions for the current tenant/school context
- creating a new admission request
- updating admission status
- approving an admission and creating a student record
- listing students for the current tenant/school context
- reading basic student/admission details if needed
- storing student document metadata foundation

### UI

Create simple Arabic dashboard pages for:

- admissions list
- new admission form
- students list

Optional only if small:

- admission details page
- student details page

### Navigation and Routes

Update:

- `constants/routes.ts`
- `config/navigation.ts`

So that:

```txt
/dashboard/admissions
/dashboard/admissions/new
/dashboard/students
```

are real routes, not placeholders.

### Docs

Update relevant docs minimally:

- `docs/database.md`
- `docs/project-phases.md`
- `docs/security-model.md` if needed
- `docs/codex-workflow.md` only if new workflow rules are added

---

## Out of Scope

Do **not** implement:

- attendance
- QR attendance scanning
- QR attendance kiosk flow
- academic years/classes/enrollments
- class assignment
- grades
- finance
- communications
- library
- health module beyond basic future-ready fields
- student promotion
- student transfer
- student withdrawal workflow
- report cards
- import/export Excel or CSV
- PDF export
- AI Query
- chatbot logic
- external integrations
- invitation workflow
- automatic creation of Supabase Auth users for guardians
- parent portal beyond minimal admission creation/listing
- full RLS
- full RBAC
- `roles`, `permissions`, `role_permissions`, or `user_roles` tables
- changing old migrations

---

## Database Migration Requirements

Create a new migration under:

```txt
supabase/migrations/
```

Use a timestamped name similar to:

```txt
<timestamp>_students_admissions_foundation.sql
```

Do not edit previous migrations.

Do not rewrite existing schema history.

The migration must be idempotent where practical, but do not overcomplicate it.

Use PostgreSQL conventions consistent with existing migrations.

---

## Suggested Enum Types

Create enum types only if they improve safety and match the project style.

Suggested enums:

```sql
public.admission_status
public.student_status
public.student_gender
public.guardian_relation
public.student_document_type
```

Suggested values:

### `admission_status`

```txt
pending
approved
rejected
cancelled
```

### `student_status`

```txt
active
inactive
transferred
withdrawn
graduated
archived
```

### `student_gender`

```txt
male
female
```

### `guardian_relation`

```txt
father
mother
guardian
other
```

### `student_document_type`

```txt
birth_certificate
national_id
passport
medical_report
previous_school_record
photo
other
```

If enums add unnecessary complexity due to existing project style, use text with check constraints, but prefer enums because Phase 02 already introduced enums.

---

## Required Tables

### 1. `public.student_admissions`

Purpose: admission request before the student becomes an official student record.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
submitted_by_user_id uuid references public.user_profiles(id)
reviewed_by_user_id uuid references public.user_profiles(id)
status admission_status not null default 'pending'
student_first_name text not null
student_middle_name text null
student_last_name text not null
student_full_name text not null
gender student_gender null
birth_date date null
nationality text null
guardian_name text not null
guardian_email text null
guardian_phone text not null
guardian_relation guardian_relation not null default 'guardian'
notes text null
decision_notes text null
submitted_at timestamptz not null default now()
reviewed_at timestamptz null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Add useful constraints:

- names should not be blank where required
- `guardian_phone` should not be blank
- `student_full_name` should not be blank
- if `status` is approved or rejected, `reviewed_at` should eventually be set by action logic

Add indexes:

```txt
tenant_id
school_id
status
submitted_by_user_id
created_at desc
(tenant_id, school_id, status)
```

---

### 2. `public.students`

Purpose: official student record created from an approved admission or direct admin creation later.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
admission_id uuid unique references public.student_admissions(id)
student_number text not null
qr_token uuid not null default gen_random_uuid()
first_name text not null
middle_name text null
last_name text not null
full_name text not null
gender student_gender null
birth_date date null
nationality text null
photo_url text null
status student_status not null default 'active'
enrolled_at date not null default current_date
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Add constraints:

```txt
unique (tenant_id, school_id, student_number)
unique (tenant_id, qr_token)
```

Add indexes:

```txt
tenant_id
school_id
status
student_number
full_name
created_at desc
```

Important: QR here is only a stable token foundation. Do not implement attendance scanning in this phase.

---

### 3. `public.student_guardians`

Purpose: link guardian information to a student.

Do not require `guardian_user_id` yet because a guardian may not have a Supabase/Auth account.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
student_id uuid not null references public.students(id) on delete cascade
guardian_user_id uuid null references public.user_profiles(id)
guardian_name text not null
guardian_email text null
guardian_phone text not null
relation guardian_relation not null default 'guardian'
is_primary boolean not null default false
can_receive_notifications boolean not null default true
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Add constraints/indexes:

```txt
index tenant_id
index school_id
index student_id
index guardian_user_id where not null
unique primary guardian per student if practical
```

Do not create guardian auth users in this phase.

---

### 4. `public.student_documents`

Purpose: metadata for documents attached to admission requests or student records.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
student_id uuid null references public.students(id) on delete cascade
admission_id uuid null references public.student_admissions(id) on delete cascade
uploaded_by_user_id uuid references public.user_profiles(id)
document_type student_document_type not null default 'other'
file_name text not null
file_path text not null
mime_type text null
file_size bigint null
created_at timestamptz not null default now()
```

Required check:

```txt
Either student_id or admission_id must be present, but not both empty.
```

Preferred stricter rule:

```txt
Exactly one of student_id or admission_id should be present.
```

If exact-one becomes inconvenient for later student document migration, at least require one of them.

Add indexes:

```txt
tenant_id
school_id
student_id
admission_id
uploaded_by_user_id
created_at desc
```

Do not store file bytes in the database.

---

### 5. `public.student_status_history`

Purpose: audit-like status history for student lifecycle.

Required columns:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
student_id uuid not null references public.students(id) on delete cascade
from_status student_status null
to_status student_status not null
reason text null
changed_by_user_id uuid references public.user_profiles(id)
created_at timestamptz not null default now()
```

Add indexes:

```txt
tenant_id
school_id
student_id
created_at desc
```

---

## Supabase Storage Requirements

Create a private bucket for student documents if safe in migration:

```txt
student-documents
```

Rules:

- bucket should not be public
- uploads must be performed server-side
- store only `file_path` and metadata in `student_documents`
- do not expose public URLs
- do not add complex storage policies if full RLS is still deferred
- if storage bucket creation requires local Supabase availability and fails, report it clearly

Suggested storage path convention:

```txt
tenants/{tenant_id}/schools/{school_id}/admissions/{admission_id}/{filename}
tenants/{tenant_id}/schools/{school_id}/students/{student_id}/{filename}
```

Do not implement image transformations or document previews now.

---

## Student Number and QR Token Rules

### Student number

Generate a unique `student_number` when creating a student from an approved admission.

Keep it simple and deterministic enough for the MVP.

Acceptable examples:

```txt
STU-2026-000001
OFUQ-2026-000001
```

The value must be unique per tenant and school.

Do not overbuild a complex numbering service.

If using a database function is cleaner, create it in the same new migration. If application-side generation is simpler, ensure uniqueness is handled safely.

### QR token

Use `qr_token` as a UUID foundation for future QR workflows.

Do not implement:

- QR image generation
- QR attendance scan
- attendance records
- kiosk flow

---

## Server-Side Services

Create a focused server-side service layer.

Suggested files:

```txt
lib/students/admissions.ts
lib/students/students.ts
lib/students/documents.ts
```

or a simpler structure if that better fits the current project.

Services should:

- use `createSupabaseServerClient()` or server-only helpers
- receive trusted context from `getAuthenticatedUser()`
- filter by `tenant_id`
- filter by `school_id` when available/required
- avoid trusting raw tenant/school input
- return typed results
- keep queries simple

Suggested service functions:

```ts
listAdmissions(context)
getAdmissionById(context, admissionId)
createAdmission(context, input)
updateAdmissionStatus(context, admissionId, input)
approveAdmissionAndCreateStudent(context, admissionId)
listStudents(context)
getStudentById(context, studentId)
```

You may implement fewer functions if the UI does not need all of them.

---

## Server Actions

Create Server Actions for form mutations.

Suggested files:

```txt
lib/actions/admissions.ts
lib/actions/students.ts
```

or route-local actions if that fits better.

Required actions:

```ts
createAdmissionAction
updateAdmissionStatusAction
approveAdmissionAction
```

Optional actions if simple:

```ts
uploadStudentDocumentAction
```

Rules:

- use `"use server"`
- call `getAuthenticatedUser()`
- validate active membership
- validate fixed role authorization
- validate tenant/school context server-side
- validate input with Zod
- return `ActionResult` or redirect/revalidate where appropriate
- call `revalidatePath()` after successful mutations
- never trust hidden form fields for tenant/school/role
- use Arabic user-facing errors

---

## Authorization Rules for Actions

### `createAdmissionAction`

Allowed roles:

```txt
parent
school_admin
system_admin
```

Behavior:

- `parent`: creates an admission under their current membership tenant/school context
- `school_admin`: creates an admission inside their school context
- `system_admin`: allowed only if current membership has a clear tenant/school context

### `updateAdmissionStatusAction`

Allowed roles:

```txt
school_admin
system_admin
```

Behavior:

- can set `pending`, `rejected`, `cancelled` if valid
- approval should usually go through `approveAdmissionAction`
- set `reviewed_by_user_id` and `reviewed_at` when reviewing
- store safe `decision_notes`

### `approveAdmissionAction`

Allowed roles:

```txt
school_admin
system_admin
```

Behavior:

1. Load the admission under current tenant/school context.
2. Ensure it is `pending` or otherwise valid for approval.
3. Create a `students` row.
4. Create a primary `student_guardians` row from admission guardian fields.
5. Insert `student_status_history` with `to_status = 'active'`.
6. Mark admission `approved`.
7. Use a transaction-like approach if possible.

Important: Supabase JS does not provide multi-statement transactions directly in normal client code. Prefer one of:

- a PostgreSQL RPC function created in the migration, or
- carefully sequenced inserts with clear error handling and no hidden complexity

For this phase, prefer simple reliability over overengineering. If a transaction/RPC is introduced, keep it narrow and documented.

---

## Admission Form Requirements

Create a practical Arabic form for new admissions.

Minimum fields:

```txt
student_first_name
student_middle_name optional
student_last_name
gender optional
birth_date optional
nationality optional
guardian_name
guardian_phone
guardian_email optional
guardian_relation
notes optional
```

UI requirements:

- Arabic labels
- RTL layout
- accessible labels
- validation messages in Arabic
- loading/submission state if Client Component is used
- use shadcn/ui components already available
- do not create overly complex form abstractions

Validation examples:

```txt
الاسم الأول مطلوب
اسم العائلة مطلوب
اسم ولي الأمر مطلوب
رقم هاتف ولي الأمر مطلوب
البريد الإلكتروني غير صحيح
```

Use React Hook Form + Zod only if it reduces complexity. A simple Server Action form is acceptable.

---

## Admissions List Page

Create:

```txt
app/(dashboard)/dashboard/admissions/page.tsx
```

Requirements:

- server component by default
- read current authenticated user server-side
- list admissions filtered by tenant/school membership context
- show Arabic table or cards
- show status badges
- link/button to new admission page
- show empty state if no admissions
- no client-side tenant filtering

Suggested columns:

```txt
اسم الطالب
ولي الأمر
الهاتف
الحالة
تاريخ التقديم
إجراءات
```

Actions can be minimal:

- view details if details page exists
- approve/reject buttons if safely implemented

If approve/reject UI adds too much complexity, create the server action and leave details UI minimal.

---

## New Admission Page

Create:

```txt
app/(dashboard)/dashboard/admissions/new/page.tsx
```

Requirements:

- Arabic title and description
- admission form
- submit through Server Action
- redirects or revalidates admissions list after success

---

## Students List Page

Create:

```txt
app/(dashboard)/dashboard/students/page.tsx
```

Requirements:

- server component by default
- list students filtered by tenant/school membership context
- show Arabic table or cards
- show empty state if no students
- display `student_number`
- display name/status
- do not implement class enrollment yet

Suggested columns:

```txt
رقم الطالب
اسم الطالب
الحالة
تاريخ الالتحاق
```

---

## Optional Details Pages

Only if simple and does not bloat the slice:

```txt
app/(dashboard)/dashboard/admissions/[admissionId]/page.tsx
app/(dashboard)/dashboard/students/[studentId]/page.tsx
```

If implemented:

- enforce tenant/school filtering server-side
- show basic data only
- do not add complex tabs for health, discipline, grades, documents, attendance, or finance

If not implemented, mention it as TODO.

---

## Routes Update

Update `constants/routes.ts` carefully.

Add routes such as:

```ts
admissions: "/dashboard/admissions",
newAdmission: "/dashboard/admissions/new",
students: "/dashboard/students",
```

Optional route builder functions if useful:

```ts
admissionDetails: (id: string) => `/dashboard/admissions/${id}`,
studentDetails: (id: string) => `/dashboard/students/${id}`,
```

Do not break existing route references.

---

## Navigation Update

Update `config/navigation.ts` so that:

```txt
الطلاب -> /dashboard/students
القبول -> /dashboard/admissions
```

Remove `placeholder: true` only from these two items.

Do not activate unrelated modules.

---

## UI Component Rules

Use existing shared and shadcn/ui components when possible:

```txt
PageHeader
EmptyState
StatusBadge
Button
Card
Input
Label
Field
```

If a missing shadcn component is truly needed, add the minimum necessary component only.

Do not add a large data-table library.

Do not add complex state management.

Do not add Zustand.

Use server-rendered lists where possible.

---

## Types

Create or update:

```txt
types/students.ts
```

Define useful app-level types for:

```txt
AdmissionStatus
StudentStatus
StudentGender
GuardianRelation
StudentAdmission
Student
StudentGuardian
StudentDocument
StudentStatusHistory
```

Prefer deriving from generated `types/database.ts` where practical, but do not create fragile type gymnastics.

After migration and local reset, regenerate:

```bash
supabase gen types typescript --local > types/database.ts
```

If Supabase local is unavailable, keep manual types safe and report it.

---

## Documentation Updates

Update `docs/database.md` with:

- Phase 04 tables
- purpose of `student_admissions`
- purpose of `students`
- purpose of `student_guardians`
- purpose of `student_documents`
- purpose of `student_status_history`
- storage bucket note
- reminder that attendance/academic/finance are later

Update `docs/project-phases.md`:

- mark Phase 04 foundation as started or completed depending on implementation
- keep future items future

Update `docs/security-model.md` only if you add student/admission-specific security notes.

Update `docs/codex-workflow.md` only if a new reusable workflow rule is added.

Do not rewrite docs completely.

---

## Audit Logs

If practical, write audit logs for:

- admission created
- admission approved
- admission rejected
- student created from admission

Use `public.audit_logs` server-side only.

Do not log sensitive document contents.

If audit logging adds too much complexity, leave a clear TODO and mention it in the final response.

---

## RLS Rules

Do not implement full production RLS in this phase.

Do not add broad or misleading policies.

If you add minimal future-ready comments in migration or docs, keep them clear.

Tenant isolation is enforced in this phase through server-side queries and action guards.

---

## Supabase Verification

After migration changes, run when available:

```bash
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
```

If Docker/Supabase local is unavailable, report it clearly.

If `supabase db reset` fails, do not fake success.

Fix migration errors if they are caused by this phase.

---

## App Verification

Run the best available project checks:

```bash
npm run lint
npm run build
```

If additional scripts exist, use them only if relevant.

Do not hide failures.

If a command fails, report:

- command
- result
- concise error summary
- likely cause
- suggested fix

---

## Git Rules

Follow `AGENTS.md` and `docs/codex-workflow.md`.

If automatic commits are allowed and validation passes, commit only relevant files.

Suggested commit message:

```txt
feat: add students and admissions foundation
```

If validation fails, do not commit unless explicitly requested.

---

## Suggested Implementation Order

Follow this order:

1. Inspect the current project files and docs.
2. Create the new Supabase migration.
3. Add/update app-level student/admission types.
4. Add server-side services for admissions and students.
5. Add Server Actions for admission creation/status/approval.
6. Add the admissions list page.
7. Add the new admission form/page.
8. Add the students list page.
9. Update routes and navigation.
10. Update documentation minimally.
11. Run Supabase verification.
12. Regenerate database types.
13. Run lint/build.
14. Commit if allowed and validation passes.
15. Summarize results.

---

## Final Response Requirements

When finished, respond with:

1. Summary of implemented Phase 04 foundation
2. Files created/modified
3. Database tables/enums/storage added
4. How tenant/school context is enforced
5. Which roles can do what
6. How admissions work
7. How student creation from approval works
8. Validation results
9. Any skipped commands and why
10. Warnings/TODOs
11. Suggested next prompt for Phase 05

Keep the final response concise but complete.

---

## Strict Do Not Do List

Do not:

- implement attendance
- implement QR attendance scanning
- implement academic enrollment/classes
- implement grades
- implement finance
- implement communications
- implement full student lifecycle workflows
- implement import/export
- implement PDF generation
- implement parent invitation workflow
- create Supabase Auth users for guardians
- implement full RBAC
- create `roles`, `permissions`, `role_permissions`, or `user_roles`
- modify old migrations
- trust tenant/school/role from forms
- expose service-role key
- upload files with privileged client code
- enable full RLS
- add unrelated dependencies
- perform broad refactors
- rename existing architecture folders
- bypass TypeScript errors with broad `any`
- hide failed validation commands

---

## Success Criteria

This task is successful when:

- New student/admission schema exists in a new migration.
- Existing migrations are not modified.
- `student_admissions`, `students`, `student_guardians`, `student_documents`, and `student_status_history` exist or are created by the new migration.
- Student document storage foundation is private and documented.
- `/dashboard/admissions` works.
- `/dashboard/admissions/new` works.
- `/dashboard/students` works.
- Navigation links for students and admissions are active.
- Server Actions use authenticated membership context.
- No client form can choose trusted tenant/school context.
- Fixed roles are enforced without RBAC.
- `npm run lint` passes or failures are clearly reported.
- `npm run build` passes or failures are clearly reported.
- Supabase verification is run or skipped with a clear reason.

---

## Next Phase Reminder

Do not start the next phase in this task.

Suggested next phase after this one:

```txt
05 - Academic Structure Foundation
```

Possible Phase 05 scope:

- academic years
- terms
- grade levels
- classes
- subjects
- class enrollments

Only start Phase 05 after students/admissions foundation is stable.
