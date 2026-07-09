# Codex Prompt — Preflight 20.1: Local Demo Auth Accounts Repair

## Mission

Implement a small preflight repair for local demo authentication accounts.

This is not a feature phase. This is not a UI polish phase. This is a small environment/test alignment patch before Phase 21.

The goal is to remove the local Playwright blocker caused by a mismatch between the demo seed account emails and the E2E helper account emails.

## Current Problem

The local Syrian demo seed creates these staff Auth users:

```text
accountant@ofuq.local
librarian@ofuq.local
```

But the E2E helper currently expects:

```text
accountant.main@ofuq.local
librarian.main@ofuq.local
```

As a result, full Playwright E2E is blocked for accountant/librarian scenarios because those `*.main@ofuq.local` users do not exist in local `auth.users` after seed reset.

## Recommended Fix

Use the smallest safe patch:

Update the E2E helper to use the existing seed emails:

```text
accountant@ofuq.local
librarian@ofuq.local
```

Do not add duplicate users to the seed unless inspection proves the seed has changed and the helper is already correct.

## Hard Constraints

- Keep this patch small.
- Do not add a new business feature.
- Do not add UI redesign.
- Do not add schema migrations.
- Do not change Supabase seed order.
- Do not reintroduce the old monolithic seed file.
- Do not move `auth_smoke_token_defaults.sql`; it must remain last in `supabase/config.toml`.
- Do not add duplicate accountant/librarian demo users unless absolutely necessary.
- Do not change passwords.
- Do not broaden the test suite.
- Do not add new tests unless a tiny assertion is clearly necessary.
- Keep verification lightweight and high-value only.

## Files To Inspect

Inspect before editing:

```text
supabase/config.toml
supabase/seeds/local_syrian_demo_02_stage_data.sql
supabase/seeds/local_syrian_demo_03_apply.sql
supabase/seeds/auth_smoke_token_defaults.sql
tests/e2e/helpers/auth.ts
tests/e2e/role-dashboards-smoke.spec.ts
docs/testing.md
docs/verification-report.md
docs/project-status.md
```

## Expected Primary Change

Update:

```text
tests/e2e/helpers/auth.ts
```

From:

```ts
accountant: "accountant.main@ofuq.local",
librarian: "librarian.main@ofuq.local",
```

To:

```ts
accountant: "accountant@ofuq.local",
librarian: "librarian@ofuq.local",
```

If the file already uses the correct emails, do not make a no-op change. Instead inspect docs and tests for stale references.

## Docs To Update If Needed

Search for stale references:

```text
accountant.main@ofuq.local
librarian.main@ofuq.local
```

Update documentation references to the seed-backed emails:

```text
accountant@ofuq.local
librarian@ofuq.local
```

Likely docs:

```text
docs/testing.md
docs/verification-report.md
docs/project-status.md
docs/ui-ux-role-roadmap.md
```

Only update docs that actually mention stale emails or the old blocker.

## Verification Budget Rule

Use minimal, high-value verification only.

Do not run broad or expensive checks unless the small patch indicates a bigger issue.

### Required verification

Run:

```bash
npm run lint
npm run build
git diff --check
```

Run `npm run test` only if TypeScript/unit-test impact is expected or if existing tests cover the changed helper and the command is reasonably fast in the local environment.

### Targeted Playwright verification

If local Supabase and browser environment are available, run only the targeted accountant/librarian smoke first:

```bash
npx playwright test tests/e2e/role-dashboards-smoke.spec.ts -g "accountant|librarian"
```

If that passes, full E2E is optional, not required for this preflight.

```bash
npm run test:e2e
```

Do not claim full E2E passed unless it was actually run and passed.

### Optional DB check

If Supabase is running, use a tiny targeted check instead of a full DB smoke:

```sql
select email
from auth.users
where email in (
  'accountant@ofuq.local',
  'librarian@ofuq.local'
)
order by email;
```

Expected result:

```text
accountant@ofuq.local
librarian@ofuq.local
```

Do not run `supabase db reset` unless local data is stale or the users are missing despite the seed containing them.

## Out Of Scope Verification

Do not run these by default:

```text
supabase db reset
full DB smoke SQL
full npm run test:e2e
schema type generation
broad new E2E suites
```

Only run them if a small check proves the local database is stale or inconsistent.

## Acceptance Criteria

This preflight is done when:

- E2E helper account emails match the local Syrian demo seed.
- `accountant@ofuq.local` is used for accountant E2E login.
- `librarian@ofuq.local` is used for librarian E2E login.
- No duplicate accountant/librarian users are added.
- No schema migration is added.
- No seed order is changed.
- No broad test expansion is introduced.
- Required lightweight verification passes or any local blocker is documented honestly.
- Targeted accountant/librarian Playwright smoke passes if local Supabase/Auth is available.
- Docs no longer describe the accountant/librarian blocker as unresolved if the targeted smoke passes.

## Commit Requirements

Before committing:

```bash
git status --short
git diff --check
```

Suggested commit message:

```text
chore: align e2e demo auth accounts
```

Final report must include:

```text
- exact files changed
- whether tests/e2e/helpers/auth.ts was updated
- whether stale docs were updated
- lint/build/diff-check results
- targeted Playwright accountant/librarian result or blocker
- Supabase targeted auth check result if run
- confirmation that no schema/seed order changes were made
- commit hash if committed
- Go/No-Go for Phase 21 planning
```
