# Codex Execution Prompt — 09.2 Finance Closure After Manual Recovery

## Phase

`09.2 - Finance Closure After Manual Supabase Recovery`

## Role

You are Codex acting as a senior full-stack engineer and release-verification maintainer.

You are working on **Ofuq | أُفُق**, a full-stack Arabic-first school management system built with Next.js, TypeScript, Supabase Auth, Supabase PostgreSQL, Server Actions, fixed roles, and server-side multi-tenant validation.

This task is a **closure and verification prompt**, not a new implementation phase.

---

## Background

Phase 09 Finance Basics was implemented as a draft, but verification was blocked by local Supabase reset/container readiness issues.

The earlier blockers included:

```txt
supabase_storage_ofuq container is not ready: unhealthy
Error status 502: An invalid response was received from the upstream server
```

The user reports that the Supabase local reset diagnostics and the 502 issue were handled manually.

This prompt must now complete the remaining Phase 09 verification and documentation steps.

---

## Main Goal

Close Phase 09 only if the full verification chain succeeds.

You must:

1. Inspect the current repository state.
2. Confirm Phase 09 finance files exist.
3. Re-run the required verification commands.
4. Regenerate `types/database.ts` after successful database reset.
5. Run SQL spot checks for finance tables and local auth seed sanity.
6. Run lint/build/diff checks.
7. Update documentation to mark Phase 09 complete.
8. Commit the Phase 09 closure only if all checks pass.
9. Report final Go/No-Go for Phase 10.

---

## Strict Scope

### In Scope

You may:

- Verify the existing Phase 09 finance implementation.
- Fix only small type/build issues directly caused by Phase 09.
- Regenerate `types/database.ts` after successful reset.
- Update documentation to reflect Phase 09 completion.
- Commit verified Phase 09 files and documentation.

### Out of Scope

Do not:

- Add new finance features.
- Start Phase 10.
- Add communication features.
- Add reports beyond documentation updates.
- Add payment gateways.
- Add expenses or budgets.
- Add accounting ledger logic.
- Add tax/VAT engine.
- Add PDF generation.
- Add parent payment portal.
- Add full RBAC.
- Add full RLS.
- Modify old migrations.
- Rewrite Phase 09 from scratch.
- Make broad refactors.
- Modify local Auth seed unless absolutely necessary.

---

## Required Reading Before Editing

Read these files before making changes:

```txt
AGENTS.md
docs/architecture.md
docs/codex-workflow.md
docs/database.md
docs/project-phases.md
docs/project-status.md
docs/requirements-roadmap.md
docs/security-model.md
docs/supabase-local.md
docs/verification-report.md
docs/local-auth-smoke-troubleshooting.md
prompts/codex_09_finance_basics_foundation_prompt.md
prompts/codex_09_1_finance_verification_recovery_prompt.md
supabase/config.toml
supabase/seed.sql
supabase/seeds/auth_smoke_token_defaults.sql
supabase/migrations/20260707140000_finance_basics_foundation.sql
types/finance.ts
types/database.ts
lib/finance
lib/actions/finance.ts
app/(dashboard)/dashboard/finance
constants/routes.ts
config/navigation.ts
```

If a listed file does not exist, report it and continue with the files that do exist.

---

## Local Auth Seed Safety Rule

Preserve the existing local Auth smoke seed flow.

Do not edit these files unless absolutely necessary:

```txt
supabase/seed.sql
supabase/seeds/auth_smoke_token_defaults.sql
supabase/config.toml
```

If any seed/config file must be touched, preserve this order exactly:

```toml
sql_paths = ["./seed.sql", "./seeds/auth_smoke_token_defaults.sql"]
```

Rules:

1. Do not remove `./seeds/auth_smoke_token_defaults.sql`.
2. Do not move it before `./seed.sql`.
3. Do not leave local Auth token/default fields empty for smoke users.
4. Do not add production secrets or real users.
5. If seed/config was not changed, explicitly state that in the final response.

---

## Step 1 — Inspect Git State

Run:

```bash
git status --short
```

If Windows ownership requires safe directory handling, use the existing local pattern:

```bash
git -c safe.directory=<project-path> status --short
```

Document:

- clean or dirty working tree
- modified files
- untracked files
- whether unrelated files exist

Do not stage anything yet.

---

## Step 2 — Confirm Phase 09 Files Exist

Verify these paths exist:

```txt
supabase/migrations/20260707140000_finance_basics_foundation.sql
types/finance.ts
lib/finance
lib/actions/finance.ts
app/(dashboard)/dashboard/finance
```

Also confirm routes/navigation contain finance entries:

```txt
constants/routes.ts
config/navigation.ts
```

If any major Phase 09 implementation file is missing, stop and report No-Go.

---

## Step 3 — Run Supabase Reset

Run:

```bash
supabase status
supabase db reset
```

Rules:

- If `supabase db reset` fails, stop immediately.
- Do not regenerate types.
- Do not run lint/build.
- Do not update docs.
- Do not commit.
- Report the failure clearly.

If it passes, continue.

---

## Step 4 — Regenerate Supabase Types

Run:

```bash
supabase gen types typescript --local > types/database.ts
```

Then inspect the generated file/diff.

Expected generated database types must include finance tables:

```txt
fee_structures
fee_items
discount_types
student_discounts
invoices
invoice_items
payments
```

If generated types are empty, invalid, or missing finance tables, stop and report No-Go.

---

## Step 5 — SQL Spot Checks

Run finance table existence checks:

```sql
select count(*) from public.fee_structures;
select count(*) from public.fee_items;
select count(*) from public.discount_types;
select count(*) from public.student_discounts;
select count(*) from public.invoices;
select count(*) from public.invoice_items;
select count(*) from public.payments;
```

Expected result:

- Queries succeed.
- Counts may be zero after reset unless finance workflow seed data was intentionally added.

Run local auth smoke sanity check:

```sql
select email
from auth.users
where email in ('admin@ofuq.local', 'teacher@ofuq.local')
order by email;
```

Also verify token/default safety using the existing project-local troubleshooting guidance. Do not expose sensitive values in documentation.

---

## Step 6 — App Verification

Run:

```bash
npm run lint
npm run build
git diff --check
```

Rules:

- Fix only small Phase 09-related type/build issues.
- Do not refactor unrelated modules.
- If lint/build fails due to unrelated changes, report clearly and stop.
- If lint/build fails due to Phase 09 code, fix and rerun all affected checks.

---

## Step 7 — Documentation Updates

After all technical checks pass, update:

```txt
docs/database.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/project-status.md
docs/security-model.md
docs/verification-report.md
```

Update `docs/supabase-local.md` only if seed/config/local recovery instructions changed.

### Required Documentation Content

`docs/project-status.md` must reflect:

```txt
Current phase: Ready for 10 Communication and Ready-Made Reports Foundation
Last completed implementation phase: 09 Finance Basics Foundation
Next implementation phase: 10 Communication and Ready-Made Reports Foundation
```

Remove or replace outdated wording such as:

```txt
No finance module yet.
```

Use a replacement like:

```txt
Finance basics foundation is implemented: fee structures, fee items, discounts, invoices, invoice items, payments, and basic receipt/payment detail views.
```

`docs/database.md` must document the finance tables added in Phase 09.

`docs/security-model.md` must mention finance server-side validation at a high level:

```txt
Finance mutations derive tenant/school scope from authenticated membership and do not trust client-submitted totals or tenant/school fields.
```

`docs/verification-report.md` must include a Phase 09 verification entry with:

```txt
supabase db reset: passed after manual local Supabase recovery
supabase gen types: passed
finance SQL spot checks: passed
npm run lint: passed
npm run build: passed
git diff --check: passed
browser smoke: passed if actually tested, otherwise blocked/not performed
```

Do not claim browser smoke passed unless it was actually performed.

---

## Step 8 — Commit Rules

Before staging:

```bash
git status --short
git diff --stat
```

Stage only Phase 09-related files and docs.

Expected files may include:

```txt
supabase/migrations/20260707140000_finance_basics_foundation.sql
types/finance.ts
types/database.ts
lib/finance
lib/actions/finance.ts
app/(dashboard)/dashboard/finance
constants/routes.ts
config/navigation.ts
docs/database.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/project-status.md
docs/security-model.md
docs/verification-report.md
```

Do not stage:

```txt
logs
temporary files
unrelated local files
Phase 10 files
```

Commit message:

```txt
feat: add finance basics foundation
```

Commit only after all checks pass.

---

## Manual Browser Smoke

If browser automation or manual browser access is available, test:

1. Login as admin or accountant.
2. Open `/dashboard/finance`.
3. Create a fee structure.
4. Add a fee item.
5. Create a discount type.
6. Assign discount to seeded active student.
7. Generate invoice.
8. Verify totals.
9. Issue invoice.
10. Record partial payment.
11. Verify invoice becomes `partially_paid`.
12. Record remaining payment.
13. Verify invoice becomes `paid`.
14. Open payment/receipt details.
15. Try overpayment and confirm it is blocked.

If browser smoke is unavailable, document it as blocked/not performed.

Do not mark browser workflows as passed unless actually tested.

---

## Final Response Requirements

At the end, report:

1. Git state before work.
2. Whether Phase 09 files existed.
3. `supabase db reset` result.
4. Type generation result.
5. Finance SQL spot check result.
6. Local auth seed sanity result.
7. Lint result.
8. Build result.
9. `git diff --check` result.
10. Documentation updates.
11. Whether seed/config files changed.
12. Browser smoke status.
13. Commit hash if committed.
14. Final Go/No-Go for Phase 10.

---

## Success Criteria

This prompt succeeds only if:

- `supabase db reset` exits successfully.
- `types/database.ts` is regenerated and includes finance tables.
- Finance SQL spot checks pass.
- Local auth smoke sanity passes.
- `npm run lint` passes.
- `npm run build` passes.
- `git diff --check` passes.
- Docs are updated to close Phase 09.
- Phase 09 is committed cleanly.
- Phase 10 is marked Go only after the above.
