# Supabase Local

## Environment

Copy the variables from `.env.example` and provide local values without committing secrets:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- `NEXT_PUBLIC_*` values are browser-safe.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be imported into Client Components.

## Common commands

```bash
supabase start
supabase status
supabase db reset
supabase migration new <name>
supabase gen types typescript --local > types/database.ts
```

## Local workflow

1. Start Supabase locally with `supabase start`.
2. Add incremental migrations under `supabase/migrations/`.
3. Reset the local database with `supabase db reset` when you need a clean replay.
4. Regenerate `types/database.ts` after schema changes when the local stack is available.

## Current schema files

- `supabase/config.toml`
- `supabase/migrations/20260706120000_initial_foundations.sql`
- `supabase/migrations/20260706143000_core_schema_refinement.sql`
- `supabase/migrations/20260706183000_students_admissions_foundation.sql`
- `supabase/migrations/20260706200000_academic_structure_foundation.sql`
- `supabase/seed.sql`
