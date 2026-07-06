# Architecture

Ofuq is a full-stack Next.js application. The project keeps rendering, data access, and mutation logic clearly separated so the app stays maintainable as modules grow.

## Core rules

- Use Server Components by default.
- Use Client Components only when user interaction requires them.
- Put create/update/delete flows in Server Actions or server-side services.
- Keep Supabase service-role usage on the server only.
- Validate tenant context server-side before sensitive reads or writes.
- Keep fixed roles simple for the MVP and expand to permissions later if needed.

## Multi-tenant model

- Every tenant-owned record should carry `tenant_id`.
- School-scoped data should also carry `school_id` where applicable.
- Access decisions must rely on authenticated membership, not client form values.

## Supabase separation

- `lib/supabase/client.ts` is for browser-safe access only.
- `lib/supabase/server.ts` is for Server Components and Server Actions.
- `lib/supabase/admin.ts` is for server-only service-role operations.
- `middleware.ts` prepares session refresh behavior without blocking development.

## UI system

- Tailwind CSS handles layout and design tokens.
- shadcn-style primitives provide accessible building blocks.
- Lucide icons are used throughout the shell and navigation.
- framer-motion can be added later for subtle transitions when they improve UX.

## Language and direction

- The interface defaults to Arabic.
- The root document uses `lang="ar"` and `dir="rtl"`.
- UI copy should remain Arabic-first unless a technical identifier must stay in English.
