# Codex Execution Prompt — 11.1 Library Verification Report Cleanup

## Phase

`11.1 - Library Verification Report Cleanup`

## Role

You are Codex acting as a senior project maintainer and verification-documentation reviewer.

You are working on **Ofuq | أُفُق**, an Arabic-first multi-tenant school management system built with Next.js, TypeScript, Supabase Auth, Supabase PostgreSQL, Server Actions, fixed roles, and server-side tenant/school validation.

This task is a **documentation and verification snapshot cleanup** only.

It is not a feature phase.

---

## Background

Phase 11 Library Foundation has been implemented and verified, and the repository appears to contain the Phase 11 migration, server code, UI routes, generated types, and updated project status.

However, `docs/verification-report.md` may not clearly contain a dedicated **Phase 11 Library Foundation Verification** section, even though `docs/project-status.md` already marks Phase 11 as completed.

This prompt must reconcile that documentation gap.

---

## Main Goal

Add or fix a concise Phase 11 verification entry in `docs/verification-report.md` so the documentation accurately reflects the completed Library Foundation verification.

Do not modify application behavior.

---

## Strict Scope

### In Scope

You may:

- Inspect existing Phase 11 files.
- Inspect current documentation consistency.
- Update `docs/verification-report.md` with a Phase 11 verification section if missing or incomplete.
- Update `docs/project-status.md` only if it contradicts the actual Phase 11 state.
- Update `docs/database.md` only if it is missing the already implemented library table summary.
- Run lightweight verification commands that do not change schema.
- Commit the documentation cleanup if the working tree is clean and changes are limited to docs.

### Out of Scope

Do not:

- Add new library features.
- Modify the Phase 11 migration.
- Modify old migrations.
- Modify database schema.
- Modify `types/database.ts` unless a new full verification run is explicitly needed and succeeds.
- Modify `types/library.ts`.
- Modify `lib/library`.
- Modify `lib/actions/library.ts`.
- Modify routes or navigation.
- Modify seed files.
- Modify Supabase config.
- Start Phase 12.
- Add health, discipline, achievements, complaints, AI, chatbot, or external integrations.
- Add automated tests.
- Claim browser smoke passed if it was not actually performed.

---

## Required Reading Before Editing

Read these files first:

```txt
docs/project-status.md
docs/verification-report.md
docs/database.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/security-model.md
supabase/migrations/20260707180000_library_foundation.sql
types/library.ts
lib/library/context.ts
lib/library/catalog.ts
lib/library/copies.ts
lib/library/loans.ts
lib/actions/library.ts
app/(dashboard)/dashboard/library
constants/routes.ts
config/navigation.ts
```

If any file does not exist locally, report it and continue with the available files.

---

## Step 1 — Inspect Git State

Run:

```bash
git status --short
```

If Windows ownership requires a safe directory override, use the local project pattern:

```bash
git -c safe.directory=D:/ofuq/ofuq status --short
```

Rules:

- If the working tree contains unrelated changes, do not stage or overwrite them.
- If there are uncommitted Phase 11 implementation files, report them clearly before editing docs.
- If the working tree is clean, continue.

---

## Step 2 — Confirm Phase 11 Exists

Confirm these files/directories exist:

```txt
supabase/migrations/20260707180000_library_foundation.sql
types/library.ts
lib/library
lib/actions/library.ts
app/(dashboard)/dashboard/library
```

Confirm documentation already references Phase 11 in `docs/project-status.md`.

Expected Phase 11 database objects:

```txt
book_catalog
book_copies
book_loans
book_catalog_status
book_copy_status
book_copy_condition
book_loan_status
```

If Phase 11 files are missing, stop and report No-Go for cleanup.

---

## Step 3 — Inspect Verification Report

Open:

```txt
docs/verification-report.md
```

Check whether it already has a clear section titled similar to:

```txt
## Phase 11 Library Foundation Verification
```

If a complete Phase 11 section already exists, do not duplicate it. Instead, report that no cleanup was needed.

If the section is missing or incomplete, add it near the newer phase verification entries, preferably after Phase 10.

---

## Required Phase 11 Verification Section

Add a concise section like this, adjusting wording only to match actual verified results:

```md
## Phase 11 Library Foundation Verification

Phase 11 Library Foundation was verified after implementation of the library catalog, book copies, student loans, returns, and overdue visibility.

| Check | Result | Notes |
| --- | --- | --- |
| Git status before work | Passed | `git -c safe.directory=D:/ofuq/ofuq status --short` was clean before Phase 11 verification, or document the exact local status if different. |
| Supabase status | Passed | Local Supabase setup was running; Docker access may require elevation on Windows. |
| Supabase database reset | Passed | `supabase db reset` replayed all migrations through `20260707180000_library_foundation.sql` and applied existing seed files. |
| Supabase type generation | Passed | `supabase gen types typescript --local > types/database.ts` completed and generated types include `book_catalog`, `book_copies`, and `book_loans`. |
| Library SQL spot checks | Passed | `book_catalog`, `book_copies`, and `book_loans` existed and returned count `0` after reset; duplicate active loan check returned `0` rows. |
| Lint | Passed | `npm run lint` completed with exit code 0. |
| Build | Passed | `npm run build` completed successfully and included library dashboard routes. |
| Whitespace diff check | Passed | `git diff --check` completed with exit code 0; Windows line-ending warnings may appear only as warnings. |
| Browser smoke | Not performed | Authenticated browser workflow smoke was not run in this session, so it is not claimed as passed. |

Phase 11 scope notes:

- Library is an operational foundation only.
- Book catalog records, physical copies, loans, returns, and overdue visibility are implemented.
- No fine billing, finance integration, barcode hardware integration, ISBN lookup, e-book storage, reservations, public portal, or advanced analytics were added.
- Seed and Supabase config files were not modified.

Go/no-go after Phase 11: Go for planning Phase 12 separately.
```

Important:

- Do not invent results.
- If any command was not actually run in the current session but was reported in the Phase 11 implementation summary, write it as a documented Phase 11 result, not as newly run evidence.
- Keep browser smoke as `Not performed` unless it was actually performed.

---

## Step 4 — Optional Consistency Check

If safe and fast, run:

```bash
npm run lint
```

Do not run heavy commands unless needed.

This prompt is mostly documentation cleanup, so it does not require another full `supabase db reset` unless documentation contradictions suggest the repository is inconsistent.

If you do run verification commands, report them exactly.

---

## Step 5 — Documentation Consistency

Check that these docs do not contradict Phase 11 completion:

```txt
docs/project-status.md
docs/database.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/security-model.md
```

Only edit a file if it contains an obvious contradiction such as:

```txt
No library module yet.
```

or lacks the Phase 11 library tables while claiming Phase 11 is complete.

Prefer minimal documentation changes.

---

## Commit Rules

Before committing, run:

```bash
git diff --stat
git diff --check
```

Stage only documentation cleanup files.

Expected files may include:

```txt
docs/verification-report.md
```

Optional only if required by contradictions:

```txt
docs/project-status.md
docs/database.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/security-model.md
```

Do not stage:

```txt
library implementation files
migrations
types/database.ts
seed files
Supabase config
temporary logs
Phase 12 files
```

Suggested commit message:

```txt
docs: add library verification report
```

---

## Final Response Requirements

Report:

1. Initial git status.
2. Whether Phase 11 files were present.
3. Whether `docs/verification-report.md` already had a Phase 11 section.
4. Files changed.
5. Whether any schema, seed, config, or implementation files were changed.
6. Any commands run and their results.
7. Browser smoke status.
8. Commit hash if committed.
9. Final Go/No-Go for Phase 12 planning.

---

## Success Criteria

This cleanup succeeds when:

- Phase 11 implementation files are present.
- `docs/verification-report.md` contains a clear Phase 11 verification section.
- No schema or implementation files are changed.
- No seed/config files are changed.
- Browser smoke is not falsely claimed.
- The documentation cleanup is committed if changes were made.
- Phase 12 remains unstarted.

---

## Suggested Next Phase After Cleanup

After this cleanup is complete, Phase 12 may be planned separately as:

```txt
12 - Health, Discipline, and Achievements Foundation
```

Do not create Phase 12 in this prompt.
