# Testing

## Purpose

The project keeps a small automated test foundation for stable, pure project
logic. It does not yet add browser E2E coverage.

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
- Portal navigation and route consistency in `config/portal-navigation.ts` and `constants/routes.ts`
- Fixed-role sanity checks in `constants/roles.ts` and `lib/actions/require-role.ts`
- Small pure helper and validation checks in `types/feedback.ts`,
  `lib/actions/require-tenant.ts`, and `lib/validation/common.ts`
- Portal access helper checks in `lib/portal/access.ts`

## Database smoke checks

Database smoke remains a manual local verification step.
It assumes local Supabase is running and seeded.

Core commands:

```bash
supabase status
supabase db reset
```

- `supabase status`: confirm the local stack is healthy before running smoke SQL.
- `supabase db reset`: preferred when you need a clean replay and the local Docker/Supabase stack is behaving normally.
- In the Phase 16 closure session on Windows, direct `supabase db reset` exit remained intermittently unstable after replay, so verification used `supabase start`, local type generation, and the smoke SQL against the running stack.

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
- linked guardian and linked student portal-account checks
- basic orphan and duplicate relationship sanity

## Intentionally deferred

- Browser smoke is not automated yet.
- Playwright and broader E2E coverage are deferred to a later phase.
- Server Action integration tests with Supabase/session mocking are deferred.
- Hosted Supabase, CI workflows, and production test infrastructure are out of scope here.
