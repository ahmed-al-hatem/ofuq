# Testing

## Purpose

Phase 15 adds a small automated test foundation for stable, pure project logic.
It does not add browser E2E coverage or production behavior changes.

## Automated commands

```bash
npm run test
npm run test:watch
npm run test:unit
npm run test:all
```

- `npm run test`: runs the full Vitest suite once.
- `npm run test:watch`: runs Vitest in watch mode for local iteration.
- `npm run test:unit`: scopes execution to `tests/unit`.
- `npm run test:all`: runs lint, unit tests, then the Next.js production build.

## Current automated coverage

- Route constant stability in `constants/routes.ts`
- Dashboard navigation consistency in `config/navigation.ts`
- Fixed-role sanity checks in `constants/roles.ts` and `lib/actions/require-role.ts`
- Small pure helper and validation checks in `types/feedback.ts`,
  `lib/actions/require-tenant.ts`, and `lib/validation/common.ts`

## Database smoke checks

Database smoke remains a manual local verification step in this phase.
It assumes local Supabase is running and seeded.

Core commands:

```bash
supabase db reset
supabase status
```

Then run the SQL smoke file:

```powershell
$dbContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db*" } | Select-Object -First 1
Get-Content tests/db/local-demo-smoke.sql | docker exec -i $dbContainer psql -U postgres -d postgres
```

The SQL file lives at `tests/db/local-demo-smoke.sql` and checks:

- local `@ofuq.local` Auth users
- local Auth token/default null safety
- seeded core demo counts
- seeded module coverage counts
- basic orphan and duplicate relationship sanity

## Intentionally deferred

- Browser smoke is not automated yet.
- Playwright and broader E2E coverage are deferred to a later phase.
- Server Action integration tests with Supabase/session mocking are deferred.
- Hosted Supabase, CI workflows, and production test infrastructure are out of scope here.
