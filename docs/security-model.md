# Security Model

## Authentication

- Supabase Auth is the source of truth for authentication.
- Application profile data lives in `public.user_profiles`.
- `user_profiles.id` matches `auth.users.id`.

## Authorization

- The MVP uses fixed roles through `public.user_memberships`.
- Sensitive reads and all mutations should check authentication, membership, role, and tenant context on the server.
- Client Components must not be trusted for tenant or role enforcement.

## Service role key rules

- `SUPABASE_SERVICE_ROLE_KEY` stays server-only.
- `lib/supabase/admin.ts` is reserved for narrow administrative operations.
- Browser-safe access must go through the anon key only.

## Tenant isolation

- Tenant context should be resolved from authenticated membership, not from a submitted `tenant_id`.
- School-scoped actions should validate both `tenant_id` and `school_id`.
- Future modules must keep these columns on every tenant-owned table.

## RLS plan

Full production RLS is postponed until the auth and membership flows are stable. When it is added, policies should:

- isolate tenants first
- narrow school-scoped data second
- keep service-role operations explicit and rare

## Audit logs

- Important server-side actions should write to `public.audit_logs`.
- `metadata` should contain operational context only, never secrets or raw credentials.
