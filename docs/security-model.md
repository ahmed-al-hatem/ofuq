# Security Model

## Authentication

- Supabase Auth is the source of truth for authentication.
- Application profile data lives in `public.user_profiles`.
- `user_profiles.id` matches `auth.users.id`.
- Email/password is the first supported login flow.
- A successful login must resolve both the app profile and an active membership before granting dashboard access.

## Authorization

- The MVP uses fixed roles through `public.user_memberships`.
- Sensitive reads and all mutations should check authentication, membership, role, and tenant context on the server.
- Client Components must not be trusted for tenant or role enforcement.
- Dashboard protection happens server-side in the route layout, not from client-only guards.
- Tenant and school context should come from the current membership, never from submitted form values.

## Service role key rules

- `SUPABASE_SERVICE_ROLE_KEY` stays server-only.
- `lib/supabase/admin.ts` is reserved for narrow administrative operations.
- Browser-safe access must go through the anon key only.

## Tenant isolation

- Tenant context should be resolved from authenticated membership, not from a submitted `tenant_id`.
- School-scoped actions should validate both `tenant_id` and `school_id`.
- Future modules must keep these columns on every tenant-owned table.

## Session handling

- Session refresh runs through the root proxy using the Supabase SSR middleware helper.
- Detailed access checks stay in server components and Server Actions to keep middleware lightweight.

## RLS plan

Full production RLS is postponed until the auth and membership flows are stable. When it is added, policies should:

- isolate tenants first
- narrow school-scoped data second
- keep service-role operations explicit and rare

## Audit logs

- Important server-side actions should write to `public.audit_logs`.
- `metadata` should contain operational context only, never secrets or raw credentials.
