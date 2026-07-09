# Testing

## Purpose

The project keeps a small automated quality foundation:

- Vitest for stable, pure project logic.
- Manual SQL smoke for the seeded local Supabase stack.
- Playwright for a limited local browser smoke slice only.

## Automated commands

```bash
npm run test
npm run test:watch
npm run test:unit
npm run test:all
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:quality
```

- `npm run test`: runs the full Vitest suite once.
- `npm run test:watch`: runs Vitest in watch mode for local iteration.
- `npm run test:unit`: scopes execution to `tests/unit`.
- `npm run test:all`: runs lint, unit tests, then the Next.js production build.
- `npm run test:e2e`: runs the local Playwright Chromium browser smoke suite through the repo's local server runner.
- `npm run test:e2e:headed`: runs the same browser smoke suite with a visible browser.
- `npm run test:e2e:ui`: opens Playwright UI mode for local inspection.
- `npm run test:quality`: runs lint, unit tests, build, then browser smoke.

## Current automated coverage

- Route constant stability in `constants/routes.ts`
- Dashboard navigation consistency in `config/navigation.ts`
- Role-aware default-route and dashboard-navigation helpers in `lib/auth/role-redirects.ts` and `lib/navigation/role-navigation.ts`
- Role-specific dashboard summary builders, dashboard rendering, and portal overview builders
- Portal navigation and route consistency in `config/portal-navigation.ts` and `constants/routes.ts`
- Settings and integrations route/navigation consistency in `constants/routes.ts`, `config/navigation.ts`, and `lib/settings/constants.ts`
- Fixed-role sanity checks in `constants/roles.ts` and `lib/actions/require-role.ts`
- Small pure helper and validation checks in `types/feedback.ts`,
  `lib/actions/require-tenant.ts`, and `lib/validation/common.ts`
- Portal access helper checks in `lib/portal/access.ts`

## Unit tests

Vitest remains the fast default local safety net.
It intentionally focuses on stable pure logic and configuration consistency, not
full integration coverage.

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
- seeded settings/integrations/template counts and duplicate-scope anomalies

## Browser smoke / E2E tests

Browser smoke is now implemented with Playwright under `tests/e2e`.
It is intentionally small, Chromium-only, and local-only.

Coverage:

- `/login` loads and authenticates demo users
- admin dashboard opens after login
- parent/student login lands on `/portal`
- parent/student visiting `/dashboard` is redirected back to `/portal`
- teacher/accountant/librarian navigation is filtered by fixed role
- `/dashboard` renders role-specific staff headings and quick actions for admin, teacher, accountant, and librarian users
- `/portal` overview exposes richer parent/student summary sections
- parent portal opens after login
- student portal opens after login
- portal pages show read-only cues
- admin dashboard navigation is absent inside portal pages
- obvious runtime error text is guarded against after route transitions
- admin settings and integrations placeholder routes load and show explicit non-connected warnings

Local demo accounts used by the suite:

- `school.admin@ofuq.local`
- `teacher.arabic@ofuq.local`
- `accountant.main@ofuq.local`
- `librarian.main@ofuq.local`
- `parent.hassan@ofuq.local`
- `student.youssef@ofuq.local`

Password handling:

- `E2E_PASSWORD` if set
- fallback default in one helper only: `OfuqLocal123!`

Helpful local notes:

- The suite expects local Supabase to be running and seeded.
- In this workspace the local verification used a Windows-friendly wrapper script,
  `scripts/run-playwright-e2e.mjs`, to start and stop `next dev` cleanly around Playwright.
- Chromium may require a one-time install on some machines:

```bash
npx playwright install chromium
```

- In the Phase 17 verification session, Chromium was already available locally,
  so no additional browser install was required.
- In the latest Phase 20 verification attempt, browser smoke passed for admin, teacher, parent, and student flows, but accountant/librarian login smoke remained blocked by missing local demo auth users; see [verification-report.md](./verification-report.md) for the exact failure notes.

## Intentionally deferred

- Hosted or CI browser smoke is deferred.
- Cross-browser matrices are deferred.
- CRUD and mutation-heavy end-to-end workflows are deferred.
- Visual regression baselines are deferred.
- Server Action integration tests with Supabase/session mocking are deferred.
- Hosted Supabase, CI workflows, and production test infrastructure are out of scope here.
