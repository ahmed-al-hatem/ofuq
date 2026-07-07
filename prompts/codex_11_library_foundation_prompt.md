# Codex Execution Prompt — 11 Library Foundation

## Phase

`11 - Library Foundation`

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
- tenant/school context derived from authenticated active membership

This phase must add the first foundation for the **school library module** only.

Keep the work focused. Do not start health, discipline, achievements, AI, chatbot, external integrations, or advanced reporting work.

---

## Main Goal

Implement a focused vertical slice for basic library operations:

1. Book catalog management.
2. Physical book copy management.
3. Student book loans.
4. Book return flow.
5. Basic overdue visibility.
6. Arabic RTL dashboard pages.
7. Server-side tenant/school/student/copy validation.
8. Audit logs.
9. Documentation and verification.

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
9. Local smoke seed data.

Phase 11 must build the library module on top of the existing tenant/school and student foundations.

---

## Strict Scope

### In Scope

Add the foundation for:

```txt
book_catalog
book_copies
book_loans
library dashboard pages
book catalog create/list/detail
book copy create/list/status
student loan issue/return
server-side tenant/school/student validation
audit logs
documentation
verification
```

### Out of Scope

Do not implement:

```txt
health records
discipline records
achievements
complaints
inventory purchasing
book vendors
barcode scanner hardware integration
ISBN external lookup
OCR
PDF generation
fine billing or finance integration
online reservations
e-book storage or digital lending
public library portal
parent/student portal for library
advanced library analytics
AI recommendations
full-text search engine beyond simple database filtering
real-time notifications
email/SMS/WhatsApp reminders
full RBAC
full RLS
```

Keep this phase as a simple operational library foundation.

---

## Database Migration

Create exactly one new migration for Phase 11.

Use the existing timestamp convention, for example:

```txt
supabase/migrations/<timestamp>_library_foundation.sql
```

Do not modify old migrations.

---

## Recommended Enums

Add minimal enums if they do not already exist:

```txt
book_catalog_status
book_copy_status
book_copy_condition
book_loan_status
```

Recommended values:

```txt
book_catalog_status:
active
inactive
archived

book_copy_status:
available
loaned
reserved
lost
damaged
archived

book_copy_condition:
new
good
fair
poor
damaged

book_loan_status:
active
returned
overdue
lost
cancelled
```

Notes:

- `reserved` can exist as a future-safe copy status, but do not implement reservations in this phase.
- `overdue` may be stored or computed. If stored, keep update logic simple. It is acceptable to show overdue based on `due_at < now()` for active loans.

---

## Tables to Add

### 1. `book_catalog`

Purpose:

Represents a bibliographic book record shared by one or more physical copies.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
isbn text null
title text not null
subtitle text null
author text null
publisher text null
publication_year integer null
category text null
language text null default 'ar'
description text null
cover_image_url text null
status public.book_catalog_status not null default 'active'
created_by_user_id uuid null references public.user_profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `tenant_id` and `school_id` are mandatory.
- `title` is required.
- `isbn`, if present, should be unique per school when reasonable.
- `publication_year`, if present, should be within a reasonable range.
- Do not store book files or e-books in this table.
- Do not add external ISBN lookup in this phase.

Recommended indexes/constraints:

```txt
index on tenant_id, school_id
index on status
index on title
index on author
index on category
unique partial index on tenant_id, school_id, isbn where isbn is not null
```

---

### 2. `book_copies`

Purpose:

Represents physical copies owned by the school.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
catalog_id uuid not null references public.book_catalog(id) on delete restrict
barcode text null
accession_number text null
shelf_location text null
condition public.book_copy_condition not null default 'good'
status public.book_copy_status not null default 'available'
notes text null
created_by_user_id uuid null references public.user_profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Copy must belong to the same tenant/school as its catalog record.
- `barcode`, if present, should be unique per school.
- `accession_number`, if present, should be unique per school.
- Do not allow a copy to be loaned if it is not `available`.
- Do not implement barcode scanning hardware. A barcode string field is enough.

Recommended indexes/constraints:

```txt
index on tenant_id, school_id
index on catalog_id
index on status
index on condition
unique partial index on tenant_id, school_id, barcode where barcode is not null
unique partial index on tenant_id, school_id, accession_number where accession_number is not null
```

---

### 3. `book_loans`

Purpose:

Tracks student borrowing and returning physical book copies.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
copy_id uuid not null references public.book_copies(id) on delete restrict
catalog_id uuid not null references public.book_catalog(id) on delete restrict
student_id uuid not null references public.students(id) on delete restrict
issued_by_user_id uuid not null references public.user_profiles(id)
returned_by_user_id uuid null references public.user_profiles(id)
borrowed_at timestamptz not null default now()
due_at timestamptz not null
returned_at timestamptz null
status public.book_loan_status not null default 'active'
notes text null
return_notes text null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `student_id` must belong to the same tenant/school and should be active.
- `copy_id` must belong to the same tenant/school.
- `catalog_id` must match the copy's catalog.
- `issued_by_user_id` must be the authenticated actor.
- `returned_by_user_id` must be the authenticated actor when returning.
- `due_at` must be after `borrowed_at`.
- Only one active loan may exist for a copy at a time.
- Issuing a loan must set the copy status to `loaned`.
- Returning a loan must set `returned_at`, set loan status to `returned`, and set the copy status back to `available`, unless the copy is marked damaged or lost.
- Do not integrate fines with finance in this phase.

Recommended indexes/constraints:

```txt
index on tenant_id, school_id
index on copy_id
index on catalog_id
index on student_id
index on status
index on due_at
unique partial index on copy_id where status = 'active'
```

If the database cannot create a partial unique index cleanly with enum comparison, implement the active-loan prevention in server-side transaction logic and still add useful non-unique indexes.

---

## Server-Side Validation Rules

All mutations must derive scope from authenticated active membership.

Never trust these fields from forms:

```txt
tenant_id
school_id
role
created_by_user_id
issued_by_user_id
returned_by_user_id
```

Validate server-side:

1. Catalog belongs to tenant/school.
2. Copy belongs to tenant/school.
3. Copy belongs to selected catalog.
4. Student belongs to tenant/school and is active.
5. Current actor has an allowed role.
6. Copy is available before issuing a loan.
7. Copy does not already have an active loan.
8. Loan is active before returning.
9. Due date is valid.
10. Status transitions are valid.

Use database constraints where useful, but keep main business workflow checks clear in server-side services/actions.

---

## Role Rules

Use fixed roles only.

### Full Library Management

Allowed roles:

```txt
system_admin
school_admin
librarian
```

They can:

```txt
create book catalog records
create physical copies
issue loans
return loans
mark copies lost/damaged if implemented simply
view library dashboard
```

### Read-Only or Limited Access

Optional simple read-only access:

```txt
teacher
accountant
```

Only if easy and safe. Do not let them mutate library records.

### Deferred

Keep these deferred unless existing app flows make read-only access trivial:

```txt
parent
student
```

Do not add RBAC tables.

---

## Server Context

Create:

```txt
lib/library/context.ts
```

Recommended helper:

```ts
requireLibraryContext(allowedRoles)
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
lib/library/context.ts
lib/library/catalog.ts
lib/library/copies.ts
lib/library/loans.ts
```

Responsibilities:

### `catalog.ts`

```txt
list book catalog records
get book catalog details
create book catalog record
validate catalog tenant/school ownership
load catalog options for copy forms
```

### `copies.ts`

```txt
list book copies
get copy details
create book copy
validate copy tenant/school ownership
validate copy availability
update copy status when loans are issued/returned
```

### `loans.ts`

```txt
list active and recent loans
get loan details
issue loan to student
return loan
compute overdue visibility
validate student/copy/catalog relationships
prevent duplicate active copy loans
```

Use transactions or carefully ordered updates for loan issue/return so copy status and loan status remain consistent.

---

## Server Actions

Create:

```txt
lib/actions/library.ts
```

Recommended actions:

```txt
createBookCatalogAction
createBookCopyAction
issueBookLoanAction
returnBookLoanAction
markBookCopyLostAction optional
markBookCopyDamagedAction optional
```

Only implement optional actions if they remain simple and do not expand the phase.

Use Zod validation with Arabic user-facing messages where practical.

Actions must:

- call `requireLibraryContext`
- validate role server-side
- derive tenant/school/user from active membership
- validate all relationships server-side
- write audit logs for important events
- return the existing project `ActionResult` pattern if available

---

## Audit Logs

Write audit logs for important actions:

```txt
library.catalog.created
library.copy.created
library.loan.issued
library.loan.returned
library.copy.marked_lost
library.copy.marked_damaged
```

Do not store secrets, auth tokens, or large book descriptions in audit metadata.

Keep metadata minimal:

```txt
catalog_id
copy_id
loan_id
student_id
```

---

## Routes and Pages

Add pages under:

```txt
app/(dashboard)/dashboard/library
```

Required routes:

```txt
/dashboard/library
/dashboard/library/catalog
/dashboard/library/catalog/new
/dashboard/library/catalog/[catalogId]
/dashboard/library/copies
/dashboard/library/copies/new
/dashboard/library/loans
/dashboard/library/loans/new
/dashboard/library/loans/[loanId]
```

Optional if simple:

```txt
/dashboard/library/overdue
```

Do not create public library routes in this phase.

---

## UI Requirements

Use Arabic RTL copy.

Keep UI simple and consistent with existing dashboard patterns.

### `/dashboard/library`

Overview cards:

```txt
إجمالي الكتب
النسخ المتاحة
الإعارات النشطة
الإعارات المتأخرة
```

Links to:

```txt
فهرس الكتب
نسخ الكتب
الإعارات
إعارة كتاب
```

### `/dashboard/library/catalog`

Show catalog table:

```txt
title
author
isbn
category
status
copies count
available copies count
```

### `/dashboard/library/catalog/new`

Fields:

```txt
title
subtitle optional
author optional
publisher optional
publication_year optional
isbn optional
category optional
language optional
description optional
cover_image_url optional
```

### `/dashboard/library/catalog/[catalogId]`

Show catalog details and related copies.

### `/dashboard/library/copies`

Show copy table:

```txt
book title
barcode
accession_number
shelf_location
condition
status
```

### `/dashboard/library/copies/new`

Fields:

```txt
catalog_id
barcode optional
accession_number optional
shelf_location optional
condition
notes optional
```

### `/dashboard/library/loans`

Show loans table:

```txt
book title
copy barcode/accession
student
borrowed_at
due_at
returned_at
status
overdue indicator
```

### `/dashboard/library/loans/new`

Fields:

```txt
copy_id
student_id
due_at
notes optional
```

Do not expose tenant/school fields in forms.

### `/dashboard/library/loans/[loanId]`

Show loan details and return action if active.

---

## Routes and Navigation

Update:

```txt
constants/routes.ts
config/navigation.ts
```

Suggested route helpers:

```ts
library: "/dashboard/library",
libraryCatalog: "/dashboard/library/catalog",
newLibraryCatalog: "/dashboard/library/catalog/new",
libraryCatalogDetails: (catalogId: string) => `/dashboard/library/catalog/${catalogId}`,
libraryCopies: "/dashboard/library/copies",
newLibraryCopy: "/dashboard/library/copies/new",
libraryLoans: "/dashboard/library/loans",
newLibraryLoan: "/dashboard/library/loans/new",
libraryLoanDetails: (loanId: string) => `/dashboard/library/loans/${loanId}`,
libraryOverdue: "/dashboard/library/overdue",
```

Activate only the library navigation item.

Do not activate health, discipline, achievements, AI, integrations, or other future modules.

---

## Types

Add:

```txt
types/library.ts
```

Update generated Supabase types after successful database reset:

```bash
supabase gen types typescript --local > types/database.ts
```

Do not keep invalid, empty, or partial generated types.

---

## Local Seed Safety Rule

Prefer not to modify seed files in Phase 11.

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

Do not mark Phase 11 verified until reset, type generation, lint, build, and diff check pass.

---

## SQL Spot Checks

After successful reset, run checks for the new library tables:

```sql
select count(*) from public.book_catalog;
select count(*) from public.book_copies;
select count(*) from public.book_loans;
```

If seed was not changed, counts may be `0` after reset. That is acceptable as long as the tables exist and the queries succeed.

Also verify there are no active-loan duplicates if any loans exist:

```sql
select copy_id, count(*)
from public.book_loans
where status = 'active'
group by copy_id
having count(*) > 1;
```

Expected result:

```txt
0 rows
```

---

## Manual Smoke Test Guidance

If browser access is available, test:

1. Login as `school_admin` or `librarian`.
2. Open `/dashboard/library`.
3. Create a book catalog record.
4. Create a physical copy for that catalog record.
5. Issue a loan to the seeded active student.
6. Confirm the copy becomes `loaned`.
7. Try issuing the same copy again and confirm it is blocked.
8. Open the loan detail page.
9. Return the loan.
10. Confirm the loan becomes `returned`.
11. Confirm the copy becomes `available`.
12. Confirm overdue indicator works for overdue active loans if any exist.
13. Confirm forms do not expose tenant/school fields.
14. Confirm unauthorized roles cannot mutate library records.

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

- new library tables
- book catalog/copy/loan scope
- loan issue/return rules
- copy availability rules
- role access rules
- server-side tenant/school validation
- no fine billing or finance integration yet
- no barcode hardware integration yet
- no public library portal yet
- verification results
- Go/No-Go for the next phase

---

## Expected Final Response

After implementation, report:

1. Summary of completed Phase 11 work.
2. Files created/modified.
3. Database objects added.
4. Server services/actions added.
5. Routes/pages added.
6. Library workflow behavior.
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

Phase 11 succeeds only when:

- One Phase 11 migration replays from scratch.
- Library tables exist.
- Book catalog pages compile.
- Book copy pages compile.
- Loan issue/return pages compile.
- Server-side services derive tenant/school scope from membership.
- No client-submitted tenant/school/role is trusted.
- Copy availability is validated before loan issue.
- Duplicate active loans for the same copy are prevented.
- Returning a loan updates both loan and copy state consistently.
- No finance fine billing is added.
- No barcode hardware integration is added.
- `supabase db reset` passes.
- `types/database.ts` is regenerated and valid.
- SQL spot checks pass.
- `npm run lint` passes.
- `npm run build` passes.
- `git diff --check` passes.
- Docs are updated.

---

## Suggested Next Phase After Successful Completion

After Phase 11 is verified and committed, plan the next phase separately.

Do not start it in this prompt.

Potential next phase:

```txt
12 - Health, Discipline, and Achievements Foundation
```

Keep the next phase separate from library.
