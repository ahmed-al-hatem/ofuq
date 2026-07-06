# Codex Execution Prompt — Project Setup & Architecture

## Role

You are Codex acting as a senior full-stack software engineer and project architect.

You are working on a school management system named **Ofuq | أُفُق**.

Your task is to set up and organize the project foundation only. Do not implement business modules yet.

The project is a full-stack **Next.js + TypeScript + Tailwind CSS + Supabase** application using:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- framer-motion
- Supabase CLI and Supabase Auth
- Server Actions and server-side services
- Fixed roles with permissions designed to be extensible later
- Multi-Tenant architecture from the beginning

Before doing anything, read and follow the active `AGENTS.md` file in the project root.

---

## Main Objective

Prepare a clean, scalable, maintainable project structure for the Ofuq school management system.

This task must focus on:

1. Project structure
2. Shared architecture
3. Base configuration
4. Global styles
5. Core utility files
6. Supabase client/server setup
7. Server Actions conventions
8. Role and tenant foundations
9. shadcn/ui readiness
10. framer-motion readiness
11. Basic layout shell
12. Developer documentation

Do **not** build full feature modules such as students, attendance, grades, finance, reports, library, health, or communications in this step.

---

## Important Scope Rules

### In Scope

You may create or update:

- Project folders
- TypeScript path aliases
- Global CSS
- Tailwind-related configuration
- App layout
- Basic landing/dashboard placeholder pages
- Shared utility files
- Supabase client/server helpers
- Role constants and type definitions
- Tenant helper types
- Server Action response helpers
- Validation utilities
- Basic UI shell components
- Base navigation config
- Documentation files
- Package dependencies if needed

### Out of Scope

Do not implement:

- Student admission workflows
- Attendance logic
- QR attendance business logic
- Finance module
- Academic grades module
- Timetable conflict logic
- Report generation
- AI Query functionality
- Chatbot functionality
- External integrations
- Backup/Restore
- Sandbox mode
- Full RBAC engine

You may create placeholder pages or placeholder components only when they help define the project structure.

---

## Architecture Decisions

Follow these decisions strictly:

### 1. Full-Stack Next.js

The project is not UI-only.

Use Next.js as a full-stack framework:

- Server Components by default
- Client Components only when interactivity is required
- Server Actions for mutations
- Server-side services for sensitive data access
- No direct privileged Supabase operations from Client Components

### 2. Multi-Tenant From Day One

The system must be designed with Multi-Tenant support from the beginning.

Use these concepts consistently:

- `tenant_id`
- `school_id`
- user profile linked to tenant and school
- all future data operations must be tenant-aware

For this setup phase, create only foundations, types, helpers, and conventions.

Do not build full tenant management UI yet.

### 3. Fixed Roles Instead of Full RBAC

Do not implement a full RBAC system now.

Use fixed roles:

- `system_admin`
- `school_admin`
- `teacher`
- `parent`
- `student`
- `accountant`
- `librarian`

Create role constants/types in a way that can later evolve into permissions.

Do not create complex permissions tables or role-permission UI in this step.

### 4. Supabase

Prepare Supabase integration for local development using Supabase CLI.

Create clear separation between:

- browser/client Supabase usage
- server Supabase usage
- admin/service-role usage only when necessary and never exposed to the client

Do not hardcode secrets.

Use environment variables.

### 5. UI System

Use:

- Tailwind CSS
- shadcn/ui
- Lucide React
- framer-motion only when animation improves UX

Do not overuse animation.

Prefer accessible, clean, dashboard-style UI.

### 6. Language and Direction

The product targets Arabic users.

Prepare the app for Arabic and RTL usage.

Use Arabic as the default product language where applicable.

Set the base document direction to RTL when appropriate.

Keep code comments minimal and only when necessary.

---

## Required Project Structure

Create or align the project with a structure similar to this:

```txt
src/
  app/
    (auth)/
      login/
        page.tsx
    (dashboard)/
      dashboard/
        page.tsx
      layout.tsx
    globals.css
    layout.tsx
    page.tsx

  components/
    app/
      app-sidebar.tsx
      app-header.tsx
      app-shell.tsx
    ui/
      # shadcn/ui components live here
    shared/
      empty-state.tsx
      page-header.tsx
      status-badge.tsx

  config/
    app.ts
    navigation.ts
    roles.ts

  constants/
    roles.ts
    routes.ts

  lib/
    utils.ts
    env.ts
    auth/
      roles.ts
      session.ts
    supabase/
      client.ts
      server.ts
      middleware.ts
      admin.ts
    actions/
      action-result.ts
      require-auth.ts
      require-role.ts
      require-tenant.ts
    validation/
      common.ts

  server/
    services/
      tenant-service.ts
      user-service.ts

  types/
    app.ts
    auth.ts
    database.ts
    roles.ts
    tenant.ts

  middleware.ts
```

If the current project already has a different but reasonable structure, do not blindly replace it. Align it gradually and preserve existing working files.

---

## Required Files and Responsibilities

### `src/config/app.ts`

Create app metadata and brand configuration:

- app name: `Ofuq`
- Arabic name: `أُفُق`
- description
- default locale: `ar`
- default direction: `rtl`

Example responsibilities:

```ts
export const appConfig = {
  name: "Ofuq",
  arabicName: "أُفُق",
  description: "Full-stack school management system",
  locale: "ar",
  direction: "rtl",
} as const;
```

---

### `src/constants/roles.ts`

Create fixed role constants:

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
```

Also export:

- `UserRole`
- Arabic role labels
- role groups if useful
- helper function to check role inclusion

Do not implement full RBAC.

---

### `src/types/tenant.ts`

Create base tenant-related types:

- `TenantId`
- `SchoolId`
- `TenantScoped`
- `SchoolScoped`

Keep them simple.

---

### `src/types/auth.ts`

Create auth-related types:

- `UserProfile`
- `AuthenticatedUser`
- `SessionUser`
- role field
- tenant_id
- school_id

Do not over-model.

---

### `src/lib/env.ts`

Create a safe environment variable helper.

It should read public and server env variables clearly.

Do not expose private Supabase keys to the browser.

Expected env variables:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The service role key must only be used on the server.

---

### `src/lib/supabase/client.ts`

Create browser Supabase client for safe client-side usage.

It should use:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

No service role key.

---

### `src/lib/supabase/server.ts`

Create server Supabase client for Server Components, Server Actions, and server-side logic.

Use the recommended cookie-aware Next.js approach if the required packages are available.

If packages are missing, install only the minimal required Supabase packages.

---

### `src/lib/supabase/admin.ts`

Create an admin Supabase client only if needed.

Rules:

- Must be server-only
- Must never be imported by Client Components
- Must use `SUPABASE_SERVICE_ROLE_KEY`
- Add a clear guard/comment that it is server-only

If not needed yet, create a small placeholder with safe documentation.

---

### `src/lib/actions/action-result.ts`

Create a standard result shape for Server Actions:

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

Add helper functions:

- `success`
- `failure`
- `validationFailure`

---

### `src/lib/actions/require-auth.ts`

Create a helper for future Server Actions.

It should be a safe foundation for requiring authenticated users.

For now, it can return a placeholder or basic implementation depending on Supabase availability.

---

### `src/lib/actions/require-role.ts`

Create a role guard helper using fixed roles.

Do not implement database permissions.

---

### `src/lib/actions/require-tenant.ts`

Create a helper that ensures future mutations have tenant context.

This is foundational only.

---

### `src/config/navigation.ts`

Create a dashboard navigation configuration.

Include modules as navigation entries, but mark future/placeholder modules clearly.

Suggested navigation:

- Dashboard
- Students
- Admissions
- Academic
- Attendance
- Grades
- Timetable
- Finance
- Communication
- Reports
- Library
- Health
- Settings
- Integrations

Use Lucide icons.

Do not implement all pages yet unless placeholders are needed.

---

### `src/components/app/app-shell.tsx`

Create a reusable dashboard shell.

It may include:

- sidebar
- header
- main content area
- responsive layout

Use shadcn/ui and Tailwind CSS where appropriate.

Use framer-motion only for subtle transitions if useful.

---

### `src/components/shared/page-header.tsx`

Create a reusable page header component.

Props:

- title
- description
- actions

---

### `src/components/shared/empty-state.tsx`

Create a reusable empty state component.

Props:

- title
- description
- icon
- action

---

### `src/components/shared/status-badge.tsx`

Create a simple status badge component.

It should be reusable for future admission, attendance, invoice, and complaint statuses.

---

## Styling Requirements

Update global styling to support:

- Arabic RTL interface
- clean dashboard look
- accessible focus states
- responsive layout
- shadcn/ui compatibility

If Tailwind theme variables are already configured, do not break them.

If project brand colors are available, use these as CSS variables:

```txt
--color-primary: #0D1B3D;
--color-teal: #0D7A7B;
--color-gold: #C9A24B;
--color-background: #FFFFFF;
```

Use Tailwind-compatible variables where possible.

Do not hardcode colors repeatedly across components.

---

## Dependencies

Ensure these dependencies exist if needed:

```bash
npm install @supabase/supabase-js
npm install @supabase/ssr
npm install lucide-react
npm install framer-motion
npm install clsx tailwind-merge class-variance-authority
```

For shadcn/ui, do not reinitialize destructively if already configured.

If shadcn/ui is not configured, initialize it using the safest non-destructive approach.

Add only minimal shadcn components needed for this setup, such as:

```bash
npx shadcn@latest add button
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add sheet
```

Before installing anything, inspect `package.json`.

Do not add dependencies that are unnecessary for this setup phase.

---

## Supabase Local Development

If Supabase CLI files are not present, prepare the project for Supabase local development.

Expected files/folders may include:

```txt
supabase/
  config.toml
  migrations/
  seed.sql
```

Do not create a full production schema yet.

For this setup step, if useful, create only a minimal initial migration for core foundations:

- tenants
- schools
- user_profiles
- user_roles
- audit_logs

Keep it minimal and consistent with the fixed-role approach.

All future business tables must include `tenant_id`.

Do not implement Backup/Restore.

Do not implement Sandbox.

Do not implement full RBAC tables.

---

## Database Foundation Rules

If creating an initial schema, follow these rules:

1. Use UUID primary keys.
2. Include `tenant_id` where applicable.
3. Include `school_id` where applicable.
4. Include `created_at`.
5. Include `updated_at` where useful.
6. Include basic indexes for tenant and school lookups.
7. Do not overbuild.
8. Do not create unused complex permission tables.
9. Prepare for Supabase Auth by linking profile rows to `auth.users`.

Suggested minimal tables:

```txt
tenants
schools
user_profiles
user_roles
audit_logs
```

Suggested fixed role constraint values:

```txt
system_admin
school_admin
teacher
parent
student
accountant
librarian
```

---

## Pages to Create

Create only foundational pages:

### Public Home Page

Path:

```txt
src/app/page.tsx
```

Purpose:

- simple Ofuq landing placeholder
- Arabic/RTL friendly
- link/button to login or dashboard placeholder

### Login Placeholder

Path:

```txt
src/app/(auth)/login/page.tsx
```

Purpose:

- placeholder for future Supabase Auth UI
- mention Email/Password and Google SSO as planned
- do not fully implement OTP now

### Dashboard Placeholder

Path:

```txt
src/app/(dashboard)/dashboard/page.tsx
```

Purpose:

- basic cards for:
  - Students
  - Attendance
  - Finance
  - Reports
- use placeholder data only
- no database query required in this setup phase unless already available

---

## Middleware

Create or update middleware only if safe.

Responsibilities:

- prepare auth-protected routes structure
- do not lock yourself out during development
- keep middleware minimal

Suggested protected route group:

```txt
/dashboard
```

If auth is not fully implemented yet, leave clear TODOs and avoid breaking navigation.

---

## Documentation

Create or update:

```txt
docs/architecture.md
docs/project-phases.md
docs/codex-workflow.md
```

### `docs/architecture.md`

Document:

- Full-stack Next.js architecture
- Server Actions rule
- Supabase usage
- Multi-Tenant rule
- Fixed roles now, extensible permissions later

### `docs/project-phases.md`

Document the planned implementation phases:

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

Clearly mark later-phase items:

- Beacon attendance
- AI Query
- Chatbot
- Drag & drop report builder
- External integrations
- Timetable generation algorithm

### `docs/codex-workflow.md`

Document how Codex should be used:

- one phase per task
- small vertical slices
- no huge all-in-one prompts
- inspect before edit
- run checks after changes
- commit after each completed phase when requested
- avoid unrelated refactors

---

## Execution Steps

Follow this exact workflow:

1. Read `AGENTS.md`.
2. Inspect current project files:
   - `package.json`
   - `src/`
   - `app/`
   - `components/`
   - `tailwind` or CSS config
   - `supabase/`
3. Identify whether the project is already initialized.
4. Do not overwrite working configuration.
5. Install only missing required dependencies.
6. Create or align folder structure.
7. Add foundational config, constants, types, and helpers.
8. Add basic app shell components.
9. Add placeholder public, auth, and dashboard pages.
10. Add or update global styles.
11. Add Supabase helper files.
12. Add documentation files.
13. Run checks.
14. Summarize exactly what changed.

---

## Validation Commands

After changes, run the best available commands from `package.json`.

Prefer:

```bash
npm run lint
npm run build
```

If formatting/typecheck scripts exist, run them too.

If a command fails, do not hide it.

Report:

- command
- result
- error summary
- likely cause
- suggested fix

Do not make random changes to silence errors.

---

## Git Rules

If the repository uses Git:

1. Check current status.
2. Do not overwrite user changes.
3. Stage only relevant files.
4. Create a commit only if the project instructions allow it or the user requested automatic commits.

Suggested commit message:

```txt
chore: set up project architecture foundation
```

If automatic commit is allowed by `AGENTS.md`, commit after successful validation.

---

## Final Response Required

When finished, respond with:

1. Summary of completed setup
2. List of files created/modified
3. Dependencies installed
4. Validation results
5. Any warnings or TODOs
6. Suggested next Codex prompt for Phase 1: Core Auth, Tenant, School, and Users

Keep the final response concise but complete.

---

## Strict Do Not Do List

Do not:

- build the entire school management system
- implement full RBAC
- remove Multi-Tenant foundations
- expose Supabase service role key
- create Backup/Restore
- create Sandbox mode
- implement Beacon attendance
- implement AI Query
- implement Chatbot logic
- implement drag-and-drop Report Builder
- implement external integration APIs
- perform broad refactors unrelated to setup
- rename many files without need
- add unnecessary dependencies
- bypass TypeScript errors with `any` unless unavoidable and explained
- ignore failed validation commands

---

## Success Criteria

This task is successful when:

- The project has a clean full-stack architecture foundation.
- The app can run locally.
- The structure supports future modules.
- Supabase usage is separated between client and server.
- Fixed roles are defined.
- Multi-Tenant conventions are established.
- shadcn/ui and framer-motion are ready.
- Basic dashboard shell exists.
- Placeholder pages exist.
- Documentation exists.
- Validation commands have been run or clearly reported if unavailable.
