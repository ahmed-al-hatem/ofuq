# Codex Execution Prompt — Phase 02: Supabase Setup & Core Schema

## Role

You are Codex acting as a senior full-stack software engineer, database architect, and Supabase specialist.

You are working on **Ofuq | أُفُق**, a full-stack multi-tenant school management system built with:

- Next.js
- TypeScript
- Supabase CLI
- Supabase Auth
- Supabase/PostgreSQL
- Server Actions
- Fixed roles, not full RBAC

Before doing anything, read and follow the active `AGENTS.md` file in the project root.

This phase focuses only on **Supabase setup and the core database schema foundation**.

Do not build business modules yet.

---

## Context From Phase 01

Phase 01 already prepared the general project architecture and documentation. Assume the project may already contain:

- `docs/architecture.md`
- `docs/project-phases.md`
- `docs/codex-workflow.md`
- Supabase client/server/admin helper files
- app config, role constants, tenant types, navigation, and layout shell
- Arabic RTL defaults
- Tailwind/shadcn/ui brand theme
- framer-motion readiness

Do not recreate or rewrite these files just because this prompt mentions them.

For this phase:

- Prefer **database schema and Supabase local setup** work.
- Treat existing helper files as already valid unless they are missing, broken, or unsafe.
- Update existing docs with concise Supabase/schema details instead of creating duplicate documentation.
- Keep changes narrower than Phase 01.

---

## Main Objective

Set up Supabase local development and create the minimal core schema needed for future modules.

The schema must support:

- Multi-Tenant architecture from day one
- Supabase Auth integration
- fixed user roles
- tenant/school membership
- audit logging
- future Server Actions
- future students, academics, attendance, finance, reports, and communication modules

The goal is to create a clean foundation, not the full database.

---

## Required Product Decisions

Follow these decisions exactly:

1. Preserve Multi-Tenant support from the beginning.
2. Use `tenant_id` in all tenant-owned tables.
3. Use `school_id` where data belongs to a specific school.
4. Do not implement full RBAC now.
5. Use fixed roles now, with a design that can evolve later.
6. Use Supabase Auth as the authentication foundation.
7. Use Supabase CLI locally.
8. Do not implement Backup/Restore.
9. Do not implement Sandbox.
10. Do not implement external integrations.
11. Do not build students, attendance, grades, finance, library, health, or reports tables in this phase.
12. Do not enable full RLS in this phase. Document the future RLS plan, and only add RLS policies if the project already has a working RLS/auth pattern that will not break local development.

---

## In Scope

You may create or update:

- `supabase/`
- `supabase/config.toml`
- `supabase/migrations/`
- `supabase/seed.sql`
- Supabase helper files only if missing, incomplete, or unsafe
- TypeScript database placeholder/types only if missing or inconsistent with the schema
- core schema migration
- environment example
- schema documentation
- local setup documentation
- Server Action database conventions documentation only if not already covered

---

## Out of Scope

Do not implement:

- full RBAC
- `permissions`
- `role_permissions`
- complex permission UI
- student module tables
- academic module tables
- attendance module tables
- finance module tables
- communication module tables
- health module tables
- library module tables
- AI Query tables
- chatbot implementation
- external integration API logic
- webhooks implementation
- Backup/Restore
- Sandbox

If a table is not needed for the core foundation, do not add it yet.

---

## Execution Workflow

Follow this exact workflow:

1. Read `AGENTS.md`.
2. Inspect the current project structure.
3. Inspect `package.json`.
4. Check whether Supabase is already initialized.
5. Check whether `supabase/` exists.
6. Check whether migrations already exist.
7. Do not overwrite existing migrations.
8. Create a new migration for the core schema if needed.
9. Review Supabase client/server/admin helper files; update only if missing, incomplete, or unsafe.
10. Create or update `.env.example`.
11. Create or update database types placeholder only if needed.
12. Update documentation for the schema and local commands without duplicating Phase 01 docs.
13. Run relevant validation commands.
14. Summarize exactly what changed.

---

## Supabase CLI Setup

If Supabase is not initialized, initialize it safely.

Expected structure:

```txt
supabase/
  config.toml
  migrations/
  seed.sql
```

Rules:

- Do not delete existing Supabase files.
- Do not overwrite existing migrations.
- If a migration already exists, create a new timestamped migration.
- If Supabase CLI is unavailable, report it clearly and still create the needed files manually.
- Do not run remote deploy commands.
- Do not link to a remote Supabase project in this phase.

Useful commands, only if appropriate:

```bash
supabase init
supabase migration new core_schema
supabase db reset
supabase status
```

If Supabase CLI is not installed, do not stop the whole task. Prepare the files and explain what command the user should run later.

If `supabase/` already exists from Phase 01, do not run `supabase init` again. Inspect it and add only missing migration/seed/config pieces.

---

## Environment Variables

Create or update `.env.example` with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Rules:

- Do not create `.env.local` with real secrets.
- Do not place real keys in any file.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Public keys must use `NEXT_PUBLIC_`.
- Server-only secrets must not use `NEXT_PUBLIC_`.

---

## Core Database Schema

Create a minimal initial migration for the core schema.

Suggested migration name:

```txt
core_schema
```

The migration should create only these foundation objects:

- extensions
- enums or check constraints
- updated_at trigger helper
- `tenants`
- `schools`
- `user_profiles`
- `user_memberships`
- `audit_logs`
- useful indexes
- optional seed-safe comments

Do not create business module tables yet.

If any of these core objects already exist in a prior migration, do not duplicate them. Create only the missing pieces in a new migration, or report that the schema foundation already exists.

---

## Required Extensions

Enable UUID generation if needed:

```sql
create extension if not exists "pgcrypto";
```

Use `gen_random_uuid()` for UUID primary keys.

---

## Fixed Role Model

Use fixed roles instead of full RBAC.

Required roles:

```txt
system_admin
school_admin
teacher
parent
student
accountant
librarian
```

Preferred implementation:

```sql
do $$
begin
  create type public.user_role as enum (
    'system_admin',
    'school_admin',
    'teacher',
    'parent',
    'student',
    'accountant',
    'librarian'
  );
exception
  when duplicate_object then null;
end $$;
```

Also create status enums if useful:

```txt
tenant_status: active, inactive, suspended
school_status: active, inactive, archived
membership_status: active, invited, suspended, archived
```

Keep enum usage simple.

---

## Table: `tenants`

Purpose:

Represents the tenant/organization boundary. In the MVP, the app may run with one tenant, but the schema must support multiple tenants.

Required fields:

```txt
id uuid primary key
name text not null
slug text unique not null
status tenant_status not null default 'active'
locale text not null default 'ar'
direction text not null default 'rtl'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Recommended constraints:

- slug lower-case compatible
- direction limited to `rtl` or `ltr`
- locale not empty

Indexes:

- unique index on `slug`
- index on `status`

---

## Table: `schools`

Purpose:

Represents schools under a tenant.

Required fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id) on delete cascade
name text not null
slug text not null
official_name text
code text
email text
phone text
address text
logo_url text
status school_status not null default 'active'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Recommended constraints:

- unique `(tenant_id, slug)`
- unique `(tenant_id, code)` when code is not null

Indexes:

- `tenant_id`
- `(tenant_id, slug)`
- `status`

---

## Table: `user_profiles`

Purpose:

Stores application profile data linked to Supabase Auth users.

Required fields:

```txt
id uuid primary key references auth.users(id) on delete cascade
full_name text not null
display_name text
avatar_url text
phone text
preferred_locale text not null default 'ar'
preferred_direction text not null default 'rtl'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Notes:

- `id` must match `auth.users.id`.
- Do not duplicate password/auth data here.
- Do not store sensitive auth secrets.

Indexes:

- `phone`

---

## Table: `user_memberships`

Purpose:

Links users to tenants, schools, and fixed roles.

This replaces full RBAC for the MVP.

Required fields:

```txt
id uuid primary key
user_id uuid not null references public.user_profiles(id) on delete cascade
tenant_id uuid not null references public.tenants(id) on delete cascade
school_id uuid references public.schools(id) on delete cascade
role public.user_role not null
status membership_status not null default 'active'
is_primary boolean not null default false
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- A user may have multiple memberships.
- A user may be a teacher in one school and parent in another later.
- `system_admin` may have tenant-level membership with `school_id` null.
- School-level roles should normally have `school_id`.
- Keep this simple.
- Do not add permission tables.

Recommended constraints:

- unique `(user_id, tenant_id, school_id, role)`
- optional check to allow `school_id` null for `system_admin`
- enforce at most one primary membership per user with a partial unique index:

```sql
create unique index if not exists user_memberships_one_primary_per_user_idx
on public.user_memberships (user_id)
where is_primary = true;
```

Indexes:

- `user_id`
- `tenant_id`
- `school_id`
- `(tenant_id, school_id)`
- `(tenant_id, role)`

---

## Table: `audit_logs`

Purpose:

Tracks important server-side actions for security and debugging.

Required fields:

```txt
id uuid primary key
tenant_id uuid references public.tenants(id) on delete set null
school_id uuid references public.schools(id) on delete set null
actor_user_id uuid references public.user_profiles(id) on delete set null
action text not null
entity_type text
entity_id uuid
metadata jsonb not null default '{}'::jsonb
ip_address inet
user_agent text
created_at timestamptz not null default now()
```

Rules:

- Do not store secrets in `metadata`.
- Use audit logs later in Server Actions.
- Keep `tenant_id` nullable only because logs may remain after tenant deletion or system actions.

Indexes:

- `tenant_id`
- `school_id`
- `actor_user_id`
- `action`
- `created_at desc`
- GIN index on `metadata` if useful

---

## Updated At Trigger

Create a reusable function:

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

Attach it to tables with `updated_at`:

- `tenants`
- `schools`
- `user_profiles`
- `user_memberships`

---

## RLS Policy Decision

For this phase:

- Do not build full production RLS unless the project already has an RLS pattern.
- Prefer not enabling RLS in this phase unless Phase 01 already established working auth/session policies.
- You may add SQL comments explaining future RLS intent.
- Prefer documenting the future RLS plan in `docs/database.md`.

Future RLS should enforce:

- tenant isolation
- school isolation where needed
- membership-based access
- service-role-only administrative operations

If you enable RLS now, make sure the app is not broken by missing policies and explain exactly why it is safe.

If unsure, leave RLS disabled for core tables and document it as Phase Later.

---

## Seed Data

Create or update `supabase/seed.sql` with minimal local seed data only if useful.

Seed may include:

- one demo tenant
- one demo school

Do not seed real users unless the project has a clear Supabase Auth seeding strategy.

Suggested demo tenant:

```txt
name: Ofuq Demo Tenant
slug: ofuq-demo
locale: ar
direction: rtl
```

Suggested demo school:

```txt
name: مدرسة أفق التجريبية
slug: ofuq-demo-school
```

Do not insert rows into `user_profiles` unless matching `auth.users` rows exist.

---

## Supabase Helper Files

Review these files according to the existing project structure:

```txt
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/admin.ts
```

If Phase 01 already created them and they are safe, do not rewrite them. Only update them if:

- service role usage is exposed to the client
- env variables are unsafe or inconsistent
- the file is missing
- imports are broken
- the implementation does not match the installed Supabase packages

### `client.ts`

Purpose:

- browser-safe Supabase client
- uses public URL and anon key only

Rules:

- no service role key
- safe for Client Components

### `server.ts`

Purpose:

- server-side Supabase client
- usable in Server Components and Server Actions
- cookie-aware if the project uses `@supabase/ssr`

Rules:

- no accidental client import
- keep implementation compatible with current Next.js version

### `admin.ts`

Purpose:

- service-role Supabase client for rare admin-only operations

Rules:

- server-only
- import `"server-only"` if available
- never import this file in Client Components
- fail clearly if `SUPABASE_SERVICE_ROLE_KEY` is missing

If the file already exists, do not rewrite it unnecessarily.

---

## TypeScript Types

Review or create only if needed:

```txt
src/types/database.ts
src/types/roles.ts
src/types/tenant.ts
```

If Phase 01 already created role and tenant types, keep them and only align names/imports if the new schema requires it.

### `src/types/roles.ts`

Include fixed roles:

```ts
export const USER_ROLES = {
  SYSTEM_ADMIN: "system_admin",
  SCHOOL_ADMIN: "school_admin",
  TEACHER: "teacher",
  PARENT: "parent",
  STUDENT: "student",
  ACCOUNTANT: "accountant",
  LIBRARIAN: "librarian",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
```

Also include Arabic labels:

```ts
export const USER_ROLE_LABELS_AR: Record<UserRole, string> = {
  system_admin: "مدير النظام",
  school_admin: "مدير المدرسة",
  teacher: "معلم",
  parent: "ولي أمر",
  student: "طالب",
  accountant: "محاسب",
  librarian: "موظف مكتبة",
};
```

### `src/types/tenant.ts`

Include:

```ts
export type TenantId = string;
export type SchoolId = string;

export type TenantScoped = {
  tenant_id: TenantId;
};

export type SchoolScoped = TenantScoped & {
  school_id: SchoolId;
};
```

### `src/types/database.ts`

If generated database types already exist, do not overwrite them.

If not, create a clearly marked placeholder:

```ts
// Placeholder until generated with:
// supabase gen types typescript --local > src/types/database.ts
```

Do not fake complete generated types.

---

## Server Action Database Conventions

Review or create only if needed:

```txt
src/lib/actions/action-result.ts
src/lib/actions/require-auth.ts
src/lib/actions/require-role.ts
src/lib/actions/require-tenant.ts
```

These are foundation helpers only.

If Phase 01 already created these helpers, do not rewrite them. Only update them to align with the core schema and membership model.

### `action-result.ts`

Use:

```ts
export type ActionResult<T = void> =
  | {
      ok: true;
      data: T;
      message?: string;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };
```

Add helpers:

- `success`
- `failure`
- `validationFailure`

### `require-auth.ts`

Create a basic helper for Server Actions to require an authenticated Supabase user.

Do not overbuild.

### `require-role.ts`

Create a helper that checks fixed roles from the current user membership.

No full RBAC.

### `require-tenant.ts`

Create a helper that establishes tenant context for future mutations.

It may be basic or placeholder if auth is not fully implemented yet.

---

## Documentation

Create or update without duplicating existing Phase 01 docs:

```txt
docs/database.md
docs/supabase-local.md
docs/security-model.md
```

Also update these existing docs with short cross-links if they already exist:

```txt
docs/architecture.md
docs/project-phases.md
docs/codex-workflow.md
```

Do not replace the content of the Phase 01 docs. Add concise references only when useful.

### `docs/database.md`

Document:

- core schema purpose
- tenants
- schools
- user_profiles
- user_memberships
- audit_logs
- why full RBAC is not implemented yet
- how fixed roles can evolve later
- tenant_id rules

### `docs/supabase-local.md`

Document local Supabase commands:

```bash
supabase start
supabase status
supabase db reset
supabase migration new <name>
supabase gen types typescript --local > src/types/database.ts
```

Also document env variables.

### `docs/security-model.md`

Document:

- Supabase Auth
- fixed roles
- server-side checks
- service role key rules
- tenant isolation
- RLS later
- audit logs

---

## Validation

After changes, run relevant available checks.

First inspect `package.json`.

Prefer:

```bash
npm run lint
npm run build
```

If Supabase CLI is available, also run one or more of:

```bash
supabase db reset
supabase status
```

Only run Supabase commands if local Docker/Supabase environment appears available.

If commands fail because Docker or Supabase CLI is not available, report that clearly.

Do not hide failures.

---

## Git Rules

If the repository uses Git:

1. Check `git status`.
2. Do not revert user changes.
3. Do not use destructive commands.
4. Stage only relevant files if committing.
5. Commit only if the project instructions allow automatic commits.

Suggested commit message:

```txt
feat: add supabase core schema foundation
```

---

## Final Response Required

When finished, respond with:

1. Summary of what was created or changed.
2. Supabase files created/updated.
3. Migration name and tables created.
4. TypeScript helper files created/updated.
5. Documentation files created/updated.
6. Validation commands run and results.
7. Any blockers, such as missing Supabase CLI or Docker.
8. Recommended next prompt: Core Auth, Tenant, School, and Users.

Keep the final response concise but complete.

---

## Strict Do Not Do List

Do not:

- build the full school database
- create student tables now
- create attendance tables now
- create finance tables now
- create academic tables now
- create communication tables now
- create report builder tables now
- implement full RBAC
- create `permissions` or `role_permissions` tables
- expose service role keys
- hardcode secrets
- implement external integrations
- implement Backup/Restore
- implement Sandbox
- implement AI Query
- implement Chatbot
- run remote Supabase deploy commands
- overwrite existing migrations
- ignore failed validation commands

---

## Success Criteria

This phase is successful when:

- Supabase local structure exists.
- A minimal core schema migration exists.
- Core tables support Multi-Tenant foundations.
- Fixed roles are represented without full RBAC.
- Supabase Auth profile linking is prepared.
- Server/client/admin Supabase helpers exist or are confirmed already present.
- `.env.example` exists and contains required variables.
- Documentation explains the schema and security model.
- Validation was attempted and results are reported.
