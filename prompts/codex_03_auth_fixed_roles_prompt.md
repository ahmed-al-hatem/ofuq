# Codex Execution Prompt — 03 Core Auth + Fixed Roles + Membership Context

## Role

You are Codex acting as a senior full-stack Next.js engineer, Supabase engineer, and security-focused application architect.

You are working on **Ofuq | أُفُق**, a full-stack Arabic-first, RTL-first, multi-tenant school management system.

This task implements the third project slice:

```txt
03 - Core Auth + Fixed Roles + Membership Context
```

This is not a general auth task. It must fit the current Ofuq architecture exactly.

---

## Primary Objective

Implement a safe, minimal, production-oriented authentication foundation using:

- Supabase Auth for identity
- `public.user_profiles` for application profile data
- `public.user_memberships` for tenant/school/role context
- fixed roles only
- server-side authorization checks
- minimal protected routes
- a real email/password login flow

Do **not** implement business modules yet.

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
lib/env.ts
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/admin.ts
lib/supabase/middleware.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
constants/roles.ts
types/auth.ts
types/database.ts
app/(auth)/login/page.tsx
app/(dashboard)/layout.tsx
app/(dashboard)/dashboard/page.tsx
constants/routes.ts
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

## Current Architecture Assumptions

Preserve and use the existing architecture:

```txt
Supabase Auth          -> identity source
public.user_profiles   -> app profile, id matches auth.users.id
public.user_memberships -> tenant/school/role membership context
public.audit_logs      -> security/workflow audit events
```

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

Do not implement full RBAC.

Do not use or recreate `user_roles`.

The current schema uses `user_memberships`, not `user_roles`.

---

## Non-Negotiable Security Rules

Follow these rules strictly:

1. Supabase Auth is the only source of identity.
2. Never expose `SUPABASE_SERVICE_ROLE_KEY` to Client Components.
3. Never trust `tenant_id`, `school_id`, or `role` from client input.
4. Resolve tenant/school/role context server-side from `user_memberships`.
5. Mutations and sensitive reads must go through Server Actions or server-side helpers.
6. Client Components may handle UI interactivity, but not privileged authorization decisions.
7. Do not rely on RLS being complete in this phase.
8. Keep service-role usage rare and server-only.
9. Do not log secrets, passwords, access tokens, refresh tokens, or raw credentials.
10. Use Arabic user-facing error messages.

---

## In Scope

Implement the auth foundation only.

### Required deliverables

1. Email/password login flow
2. Sign-out flow
3. Supabase session refresh through root middleware
4. Protected dashboard route
5. Current authenticated user helper
6. Profile lookup helper
7. Primary membership lookup helper
8. Membership list helper
9. Active membership guard
10. Fixed role guard
11. Tenant context guard
12. Login form UI with Arabic validation and error messages
13. Server-side dashboard protection
14. Minimal auth documentation updates
15. Validation checks

---

## Out of Scope

Do **not** implement:

- full RBAC
- `roles` table
- `permissions` table
- `role_permissions` table
- `user_roles` table
- public self-signup with automatic tenant/role assignment
- invitation workflow
- admin user management UI
- student module
- admissions module
- attendance module
- finance module
- academic module
- reports module
- communication module
- library module
- health module
- AI Query
- chatbot logic
- external integrations
- full production RLS
- backup/restore
- sandbox mode

Google SSO may remain a placeholder unless it can be added safely without schema changes or additional complexity.

Mobile OTP is later and must not be implemented now.

---

## Important Database Constraints

The current core schema is intentionally limited to:

```txt
tenants
schools
user_profiles
user_memberships
audit_logs
```

Use the existing tables.

Do not rewrite old migrations.

Do not edit previous migration files.

If a database change is absolutely required, create a new incremental migration under:

```txt
supabase/migrations/
```

But prefer solving this phase with existing schema and application code.

---

## Expected Auth Flow

### Login

The user enters:

- email
- password

The app should:

1. Validate input.
2. Call Supabase Auth sign-in.
3. Ensure the user exists in Supabase Auth.
4. Resolve the app profile from `public.user_profiles`.
5. Resolve the primary active membership from `public.user_memberships`.
6. Redirect the user to `/dashboard` when successful.
7. Show Arabic errors when unsuccessful.

### Sign out

The app should:

1. Call Supabase Auth sign-out.
2. Clear session cookies through the Supabase SSR client.
3. Redirect to `/login`.

### Dashboard access

When accessing `/dashboard`:

- unauthenticated users should be redirected to `/login`
- authenticated users without an active membership should be redirected to a safe page or shown a clear Arabic error state
- authenticated users with active membership should see the dashboard

Keep this protection simple and reliable.

---

## Implementation Requirements

### 1. Auth service

Create or update a server-side auth service.

Preferred path:

```txt
lib/auth/session.ts
```

or, if the project already has a better convention, follow it.

The service should expose functions similar to:

```ts
getCurrentAuthUser()
getUserProfile(userId)
getUserMemberships(userId)
getPrimaryMembership(userId)
getAuthenticatedUser()
```

`getAuthenticatedUser()` should return a normalized object compatible with the existing `SessionUser` / `AuthenticatedUser` types if possible.

Expected normalized shape:

```ts
type SessionUser = {
  id: string
  email: string | null
  full_name: string
  display_name: string | null
  role: UserRole | null
  tenant_id: TenantId | null
  school_id: SchoolId | null
  membership: UserMembership | null
}
```

If existing types differ, update them carefully without breaking unrelated code.

---

### 2. Server Actions

Create or update auth Server Actions.

Preferred path:

```txt
app/(auth)/login/actions.ts
```

or:

```txt
lib/actions/auth.ts
```

Choose the least disruptive structure.

Required actions:

```ts
signInWithEmail(formData: FormData): Promise<ActionResult>
signOut(): Promise<ActionResult>
```

Alternative names are acceptable if clear and consistent.

Rules:

- Use server-side validation with Zod.
- Return standardized `ActionResult` where useful.
- Use Arabic error messages.
- Redirect only after successful login/sign-out where appropriate.
- Do not leak Supabase internal errors directly to users.
- Keep detailed technical errors out of the UI.

---

### 3. Login form UI

Replace the placeholder login page with a real login UI.

Requirements:

- Arabic RTL interface
- email input
- password input
- submit button
- loading state
- error state
- accessible labels
- works with Server Action or a safe client auth flow
- redirects to `/dashboard` after success
- uses existing shadcn/ui components where available
- uses existing Tailwind/shadcn theme tokens
- keeps Google SSO as placeholder if not implemented
- no mobile OTP implementation

Possible files:

```txt
app/(auth)/login/page.tsx
app/(auth)/login/login-form.tsx
app/(auth)/login/actions.ts
```

If Client Component is needed for loading/error UX, keep it UI-only and call a safe Server Action or Supabase browser auth only for public auth flow.

---

### 4. Middleware

A root middleware file is currently expected but may not exist.

Create:

```txt
middleware.ts
```

It should use the existing helper:

```ts
refreshSession(request)
```

from:

```txt
lib/supabase/middleware.ts
```

Responsibilities:

- refresh Supabase session
- protect `/dashboard` minimally if safe
- do not lock the app during local development
- do not add complex role logic to middleware

Middleware should not query complex business data if avoidable.

Route-level server-side protection can handle detailed membership checks.

Recommended matcher:

```ts
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

Adjust only if required by the existing project.

---

### 5. Dashboard layout protection

Update:

```txt
app/(dashboard)/layout.tsx
```

or the closest route-level server component.

It should:

1. Resolve the authenticated user server-side.
2. Redirect unauthenticated users to `/login`.
3. Validate active membership.
4. Pass minimal user context to shell components if useful.
5. Avoid client-trusted authorization.

Use:

```ts
redirect("/login")
```

from `next/navigation` when needed.

If a user is authenticated but has no active membership, show a clear Arabic error screen or redirect to a safe route such as `/login?error=no-membership`.

Prefer a clear Arabic error state inside the protected layout if that is simpler.

---

### 6. Guards and helpers

Improve existing helpers instead of replacing them destructively:

```txt
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
```

Expected behavior:

#### `requireAuth`

Should authenticate through Supabase Auth and preferably return enough context for downstream use.

#### `requireRole`

Should validate fixed roles only.

It should not query RBAC tables.

#### `requireTenant`

Should validate tenant context derived from membership.

Do not accept raw client-submitted `tenant_id` as trusted authority.

Add a helper if needed:

```ts
requireActiveMembership()
```

or:

```ts
requireAuthenticatedMembership()
```

Keep names clear and consistent.

---

### 7. Role constants

Use the existing file:

```txt
constants/roles.ts
```

Do not create a separate incompatible role source.

If you add helpers, add them there only if they are generic and useful.

Do not change enum values.

Do not rename role values.

---

### 8. Types

Use and refine:

```txt
types/auth.ts
types/tenant.ts
types/database.ts
```

Important:

`types/database.ts` may still be a placeholder if Supabase local type generation was not available.

If Supabase local stack is available, run:

```bash
supabase gen types typescript --local > types/database.ts
```

If not available, do not block the task. Keep types safe enough for TypeScript and report that generated database types were skipped.

Avoid excessive `any`.

If a narrow type assertion is necessary because database types are placeholder-only, explain it in the final response.

---

## Suggested File Changes

You may create or update these files:

```txt
middleware.ts
lib/auth/session.ts
lib/auth/membership.ts
lib/actions/auth.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
app/(auth)/login/page.tsx
app/(auth)/login/login-form.tsx
app/(auth)/login/actions.ts
app/(dashboard)/layout.tsx
types/auth.ts
types/database.ts
docs/security-model.md
docs/codex-workflow.md
```

Do not modify unrelated UI modules.

Do not modify business module placeholders unless absolutely necessary.

---

## Login UI Copy Requirements

Use Arabic user-facing labels.

Suggested Arabic copy:

```txt
تسجيل الدخول
البريد الإلكتروني
كلمة المرور
الدخول إلى لوحة التحكم
جاري تسجيل الدخول...
يجب إدخال بريد إلكتروني صحيح
يجب إدخال كلمة المرور
بيانات الدخول غير صحيحة
لا توجد عضوية نشطة مرتبطة بهذا الحساب
تسجيل الخروج
```

Keep internal identifiers in English.

---

## Audit Logging

If practical, write audit logs for important auth events:

- successful login
- failed login only if safe and not noisy
- sign out
- missing membership access attempt

Use `public.audit_logs` only from server-side code.

Do not log passwords, tokens, raw credentials, or secrets.

If audit logging adds too much complexity, leave a TODO and document it.

---

## Error Handling Rules

User-facing errors must be Arabic and safe.

Do not expose raw Supabase error messages directly.

Map common auth errors to Arabic messages:

```txt
Invalid login credentials -> بيانات الدخول غير صحيحة
Email not confirmed -> يرجى تأكيد البريد الإلكتروني أولاً
User not found -> بيانات الدخول غير صحيحة
No active membership -> لا توجد عضوية نشطة مرتبطة بهذا الحساب
Unexpected error -> حدث خطأ غير متوقع، حاول مرة أخرى
```

Log only safe server-side context if needed.

---

## Redirect Rules

Use consistent redirects:

```txt
/login      -> public auth page
/dashboard  -> protected dashboard
/           -> public home page
```

After successful login:

```txt
/dashboard
```

After sign out:

```txt
/login
```

Unauthenticated access to dashboard:

```txt
/login
```

Authenticated but no active membership:

Show an Arabic error state or redirect with a safe query parameter.

Do not create complex onboarding flows in this phase.

---

## Validation Commands

After implementation, run the best available commands from `package.json`.

At minimum:

```bash
npm run lint
npm run build
```

If Supabase local is available:

```bash
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
```

If Docker or Supabase local is unavailable, report it clearly and do not fake success.

---

## Git Rules

Follow `AGENTS.md` and `docs/codex-workflow.md`.

If automatic commits are allowed, commit only after successful validation.

Suggested commit message:

```txt
feat: add auth and fixed-role membership foundation
```

If validation fails, do not commit unless the user explicitly asks for a work-in-progress commit.

---

## Final Response Requirements

When finished, respond with:

1. Summary of implemented auth foundation
2. Files created/modified
3. How login/sign-out now works
4. How dashboard protection works
5. How tenant/role context is resolved
6. Validation results
7. Any skipped commands and why
8. Warnings or TODOs
9. Suggested next prompt for Phase 04: Students and Admissions foundation

Keep the final response concise but complete.

---

## Strict Do Not Do List

Do not:

- implement full RBAC
- create `roles`, `permissions`, `role_permissions`, or `user_roles`
- recreate `user_roles`
- modify old migrations
- trust tenant/role from client input
- expose service-role key
- put privileged writes in Client Components
- implement public self-signup with automatic tenant assignment
- implement invitation flow
- implement Google SSO unless it is simple and safe
- implement OTP
- enable full production RLS
- build student/admission/attendance/finance modules
- perform unrelated refactors
- rename many files unnecessarily
- bypass TypeScript errors with broad `any`
- hide failed validation commands

---

## Success Criteria

This task is successful when:

- `/login` has a real email/password login form.
- Supabase Auth sign-in works through a safe flow.
- Sign-out is implemented.
- `/dashboard` is protected.
- Authenticated user context includes profile and active membership when available.
- Fixed roles are used from `user_memberships`.
- Tenant and school context are resolved server-side.
- Existing Supabase helpers are preserved.
- No full RBAC is introduced.
- No `user_roles` table/code path is introduced.
- Validation commands are run or clearly reported if blocked.

---

## Next Phase Reminder

Do not start Phase 04 in this task.

The next phase after this one should be:

```txt
04 - Students and Admissions Foundation
```

That phase should only start after auth, active membership, tenant context, and protected dashboard behavior are stable.
