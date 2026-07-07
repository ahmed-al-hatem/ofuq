# Codex Execution Prompt — 09.1 Finance Verification Recovery

## Phase

`09.1 - Finance Verification Recovery`

## Role

You are Codex acting as a senior full-stack engineer responsible for safely closing a partially implemented schema/UI slice.

You are working on **Ofuq | أُفُق**, a full-stack Arabic-first school management system using Next.js, TypeScript, Supabase Auth, Supabase PostgreSQL, Server Actions, fixed roles, and multi-tenant tenant/school isolation.

This task is **not** a new feature phase.

This task exists because Phase 09 Finance Basics was implemented as a draft, but verification stopped after `supabase db reset` exited with failure due to local Supabase storage readiness:

```txt
supabase_storage_ofuq container is not ready: unhealthy
```

The reported reset had already replayed migrations through the new finance migration and ran both seeds, but the command still failed. Therefore Phase 09 cannot be considered verified or closed yet.

---

## Main Goal

Recover local Supabase verification and safely close Phase 09 only after all required checks pass.

The goal is to:

1. Inspect the current Phase 09 draft.
2. Fix or document the local Supabase storage readiness issue.
3. Re-run Phase 09 verification from a clean database replay.
4. Regenerate `types/database.ts` only after a successful reset.
5. Run lint/build.
6. Run finance SQL spot checks.
7. Update documentation.
8. Commit only if the complete Phase 09 slice is verified.

---

## Strict Scope

### In Scope

You may:

- Inspect the Phase 09 draft implementation.
- Inspect Docker/Supabase local status.
- Restart the local Supabase stack.
- Remove/recreate unhealthy Supabase local containers if necessary.
- Re-run verification commands.
- Regenerate Supabase TypeScript types after successful reset.
- Fix small compile/type issues caused by the Phase 09 implementation.
- Update Phase 09 documentation after verification.
- Commit the verified Phase 09 slice if all checks pass.

### Out of Scope

Do not:

- Add new finance features.
- Start Phase 10.
- Add communication or reporting features.
- Add payment gateways.
- Add expenses or budgets.
- Add accounting ledger logic.
- Add tax/VAT engine.
- Add PDF generation.
- Add parent payment portal.
- Add full RBAC.
- Add full RLS.
- Rewrite old migrations.
- Modify unrelated modules.
- Make broad refactors.
- Hide failed commands.

---

## Required Reading Before Editing

Read and inspect these files first:

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
prompts/codex_09_finance_basics_foundation_prompt.md
supabase/config.toml
supabase/seed.sql
supabase/seeds/auth_smoke_token_defaults.sql
supabase/migrations/20260707140000_finance_basics_foundation.sql
types/finance.ts
lib/finance
lib/actions/finance.ts
app/(dashboard)/dashboard/finance
constants/routes.ts
config/navigation.ts
```

If any listed file does not exist locally, report it and continue with the files that do exist.

---

## Current Known Blocker

The known blocker is local Supabase storage readiness, not a confirmed SQL migration error.

Reported failure:

```txt
supabase_storage_ofuq container is not ready: unhealthy
```

Important:

- Do not assume the finance migration is valid until `supabase db reset` exits successfully.
- Do not regenerate and keep `types/database.ts` unless reset succeeds.
- Do not mark Phase 09 verified until reset, type generation, lint, and build all pass.

---

## Local Auth Seed Safety Rule

Preserve the existing local Auth smoke seed flow.

Do not modify local Auth seed unless absolutely necessary.

If seed/config files are touched, preserve this order in `supabase/config.toml`:

```toml
sql_paths = ["./seed.sql", "./seeds/auth_smoke_token_defaults.sql"]
```

Rules:

1. Do not remove `./seeds/auth_smoke_token_defaults.sql`.
2. Do not run it before `./seed.sql`.
3. Do not leave required local Auth token/default fields empty for `admin@ofuq.local` and `teacher@ofuq.local`.
4. Do not add production secrets or real users to seed files.
5. If seed files are not required for this recovery, do not edit them.
6. If seed files are changed, update `docs/supabase-local.md` and document why.

---

## Recovery Workflow

Follow this workflow exactly.

### Step 1 — Inspect Git State

Run:

```bash
git status --short
```

Document:

- Modified files
- Untracked files
- Whether there are unrelated pre-existing files
- Whether temporary logs exist

Do not stage or commit anything yet.

---

### Step 2 — Inspect Supabase/Docker State

Run:

```bash
supabase status
```

If it fails due to Windows Docker permission issues, retry from an elevated shell and document that elevation was required.

Inspect containers:

```bash
docker ps -a --filter "name=supabase"
```

If `supabase_storage_ofuq` exists and is unhealthy, inspect logs:

```bash
docker logs supabase_storage_ofuq --tail 200
```

Also inspect health details if available:

```bash
docker inspect supabase_storage_ofuq --format='{{json .State.Health}}'
```

Do not paste excessive logs into docs. Summarize the useful error only.

---

### Step 3 — Recover Local Supabase Stack

Try the least destructive recovery first:

```bash
supabase stop --no-backup
supabase start
supabase status
```

If storage remains unhealthy, try removing only the unhealthy local storage container:

```bash
supabase stop --no-backup
docker rm -f supabase_storage_ofuq
supabase start
supabase status
```

If this still fails, document the failure clearly and stop.

Do not run broad destructive commands such as `docker system prune -a` unless explicitly approved by the user.

---

### Step 4 — Re-run Database Reset

Once the local stack is healthy enough, run:

```bash
supabase db reset
```

Rules:

- If it fails, stop and report the exact failure summary.
- If it succeeds, continue.
- Do not mark Phase 09 verified if this command fails.

---

### Step 5 — Regenerate Database Types

Only after successful reset, run:

```bash
supabase gen types typescript --local > types/database.ts
```

Then inspect the diff:

```bash
git diff -- types/database.ts
```

Rules:

- Keep the generated file only if it contains the full schema and finance tables.
- Do not keep an empty or invalid generated schema.
- Finance tables expected in generated types include:
  - `fee_structures`
  - `fee_items`
  - `discount_types`
  - `student_discounts`
  - `invoices`
  - `invoice_items`
  - `payments`

---

### Step 6 — Run Finance SQL Spot Checks

Run SQL checks using whichever local method is already used in the project.

Required table checks:

```sql
select count(*) from public.fee_structures;
select count(*) from public.fee_items;
select count(*) from public.discount_types;
select count(*) from public.student_discounts;
select count(*) from public.invoices;
select count(*) from public.invoice_items;
select count(*) from public.payments;
```

Expected after reset:

- It is acceptable for finance workflow tables to be empty.
- The important result is that the tables exist and queries succeed.

Auth smoke seed sanity check:

```sql
select email
from auth.users
where email in ('admin@ofuq.local', 'teacher@ofuq.local')
order by email;
```

If a project-local query already checks token defaults, run it too. Do not expose sensitive values in docs.

---

### Step 7 — Run App Verification

Run:

```bash
npm run lint
npm run build
git diff --check
```

Rules:

- Fix only small type/build issues related to Phase 09.
- Do not refactor unrelated modules.
- If build fails due to finance code, fix it and rerun checks.
- If build fails due to unrelated pre-existing work, report clearly and do not hide it.

---

## Phase 09 Documentation Updates

After successful verification, update these docs:

```txt
docs/database.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/project-status.md
docs/security-model.md
```

Update `docs/supabase-local.md` only if Supabase seed/config/local recovery behavior changed.

Documentation must state that Phase 09 includes:

```txt
fee_structures
fee_items
discount_types
student_discounts
invoices
invoice_items
payments
basic receipt/payment detail foundation
```

Also update project status from:

```txt
No finance module yet.
```

to an accurate statement such as:

```txt
Finance basics foundation is implemented: fee structures, fee items, discounts, invoices, invoice items, payments, and basic receipt/payment detail views.
```

Recommended next phase after successful Phase 09 closure:

```txt
10 - Communication and Ready-Made Reports Foundation
```

---

## Finance Verification Expectations

Confirm that the Phase 09 implementation still respects these rules from the original Phase 09 prompt:

1. Do not trust `tenant_id` or `school_id` from forms.
2. Finance writes derive scope from authenticated membership.
3. Only `system_admin`, `school_admin`, and `accountant` can manage finance basics.
4. Invoice totals are calculated server-side.
5. Payment recording blocks overpayment.
6. No payment gateway was added.
7. No expenses/budget module was added.
8. No PDF generation was added.
9. No full RLS or full RBAC was added.

If any of these rules are violated, fix the issue before closing Phase 09.

---

## Commit Rules

Commit only if all required checks pass:

```bash
supabase db reset
supabase gen types typescript --local > types/database.ts
npm run lint
npm run build
git diff --check
```

Before committing, review staged files:

```bash
git diff --stat
git status --short
```

Stage only Phase 09 related files, such as:

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
```

Do not commit temporary logs or unrelated changes.

Suggested commit message:

```txt
feat: add finance basics foundation
```

If verification cannot be completed, do not commit the Phase 09 slice. Report the blocker clearly.

---

## Manual Smoke Guidance

If browser access is available, test:

1. Login as an admin or accountant smoke user.
2. Open `/dashboard/finance`.
3. Create a fee structure.
4. Add a fee item.
5. Create a discount type.
6. Assign a discount to the seeded active student.
7. Generate an invoice.
8. Verify invoice totals.
9. Issue the invoice.
10. Record a partial payment.
11. Verify invoice becomes `partially_paid`.
12. Record the remaining payment.
13. Verify invoice becomes `paid`.
14. Open payment/receipt details.
15. Try an overpayment and confirm it is blocked.

If browser/authenticated smoke is not available, document it honestly.

Do not mark browser workflows as passed unless actually tested.

---

## Strict Do Not Do List

Do not:

- Add new finance features.
- Start Phase 10.
- Add payment gateways.
- Add expenses.
- Add budgets.
- Add accounting ledger logic.
- Add PDF invoice or receipt generation.
- Add tax/VAT engine.
- Add external integrations.
- Add full RBAC.
- Add full RLS.
- Modify old migrations.
- Rewrite Phase 09 from scratch unless a small targeted fix is impossible.
- Trust client-submitted tenant/school/role.
- Trust client-submitted financial totals.
- Commit logs or unrelated files.
- Claim verification passed when `supabase db reset` failed.

---

## Expected Final Response

When finished, report:

1. Whether Supabase storage recovery succeeded.
2. Whether `supabase db reset` passed.
3. Whether `types/database.ts` was regenerated successfully.
4. SQL spot check results.
5. `npm run lint` result.
6. `npm run build` result.
7. `git diff --check` result.
8. Files created/modified.
9. Documentation updates.
10. Whether seed/config files were changed.
11. Whether browser smoke was tested or blocked.
12. Commit hash if committed.
13. Final Go/No-Go for Phase 10.

---

## Success Criteria

This recovery phase succeeds only when:

- Supabase local stack is healthy enough for reset.
- `supabase db reset` exits successfully.
- Finance migration replays from scratch.
- Finance tables exist.
- `types/database.ts` is regenerated from the full schema.
- `npm run lint` passes.
- `npm run build` passes.
- Documentation reflects Phase 09 completion.
- The working tree contains no unrelated staged files.
- Phase 09 is committed only after verification passes.
