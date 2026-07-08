# Codex Execution Prompt — 17 Browser Smoke / E2E Tests Foundation

## Phase

`17 - Browser Smoke / E2E Tests Foundation`

## Role

You are Codex acting as a senior QA automation engineer and full-stack TypeScript test architect.

You are working on **Ofuq | أُفُق**, an Arabic-first multi-tenant school management system built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase CLI / PostgreSQL / Supabase Auth
- Server Components and Server Actions
- fixed roles through `user_memberships`
- tenant/school context derived from authenticated active membership
- deterministic local Syrian demo dataset
- Vitest unit-test foundation
- parent/student read-only portal foundation

This phase adds a **small browser smoke / E2E foundation** using Playwright.

It is a quality phase.

It is not a feature phase.

---

## Current Context

The project already has:

```txt
Phase 14: deterministic local Syrian demo dataset
Phase 15: Vitest automated unit-test foundation
Phase 16: parent/student read-only portal foundation
```

The current automated test stack includes Vitest only. Browser smoke and Playwright/E2E are intentionally deferred in the current docs.

Phase 17 should add a limited browser smoke layer to validate the most important authenticated browser paths.

Do not turn this into full regression automation.

---

## Main Goal

Add a Playwright-based local browser smoke foundation that verifies:

1. Login page loads and authenticates demo users.
2. Admin/staff dashboard route can be opened after login.
3. Parent portal opens after login.
4. Student portal opens after login.
5. Portal pages remain read-only.
6. Admin dashboard navigation is not shown inside portal pages.
7. Browser smoke status is documented honestly.

Keep the suite small and stable.

---

## Required Reading Before Editing

Read these first:

```txt
AGENTS.md
package.json
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/testing.md
docs/verification-report.md
docs/supabase-local.md
docs/phase-14-demo-seed-troubleshooting.md
constants/routes.ts
constants/roles.ts
config/navigation.ts
config/portal-navigation.ts
app/login/page.tsx
app/(dashboard)/dashboard/layout.tsx
app/(portal)/portal/layout.tsx
lib/auth/session.ts
lib/portal/context.ts
tests/db/local-demo-smoke.sql
```

Also inspect existing shared UI components if stable selectors or accessible names are needed.

Do not guess login form labels or button names. Inspect actual components before writing selectors.

---

## Precondition

Before implementation, run:

```bash
git status --short
```

If Windows safe-directory protection applies, use:

```bash
git -c safe.directory=D:/ofuq/ofuq status --short
```

If unrelated uncommitted changes exist, stop and report them.

Phase 17 must start from a clean or clearly isolated Phase 17 working tree.

---

## Strict Scope

### In Scope

You may:

```txt
install Playwright test dependency
add Playwright config
add e2e scripts to package.json
add a small tests/e2e suite
add e2e helper files
add .gitignore entries for Playwright artifacts if needed
update docs/testing.md
update docs/project-status.md
update docs/project-phases.md
update docs/requirements-roadmap.md
update docs/verification-report.md
run verification commands
```

### Out of Scope

Do not:

```txt
add new product features
modify database schema
add migrations
modify seed data unless a critical test blocker proves a seed issue
change production behavior
add RLS
add RBAC
add hosted Supabase E2E
add CI/CD workflow unless explicitly minimal and necessary
add visual regression baselines
commit screenshots/videos/traces
add broad full-regression coverage
add CRUD E2E flows
add payment/complaint/survey submission tests
```

Do not make `npm run test:all` depend on Playwright. Keep E2E separate so routine unit/build checks remain fast.

---

## Recommended Playwright Setup

Install:

```bash
npm install -D @playwright/test
```

Install Chromium locally when needed:

```bash
npx playwright install chromium
```

Use Chromium only in this phase unless another browser is already available and trivial to support.

Do not commit browser binaries.

---

## package.json Scripts

Add scripts similar to:

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "test:quality": "npm run lint && npm run test && npm run build && npm run test:e2e"
}
```

Keep existing scripts unchanged:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:unit": "vitest run tests/unit",
  "test:all": "npm run lint && npm run test && npm run build"
}
```

Do not add E2E to `test:all`.

---

## Playwright Config

Add:

```txt
playwright.config.ts
```

Recommended settings:

```txt
baseURL: http://localhost:3000
webServer: npm run dev
reuseExistingServer: true
browserName: chromium only
reporter: list or html
trace: retain-on-failure
screenshot: only-on-failure
video: retain-on-failure or off
```

Use a reasonable timeout for Windows local Supabase + Next dev startup.

Do not require hosted services.

Make the config local-friendly.

---

## .gitignore

If not already ignored, add entries for Playwright artifacts:

```txt
playwright-report/
test-results/
```

Do not commit traces, screenshots, videos, or reports.

---

## Local Demo Accounts

Use local Phase 14/16 demo accounts.

Suggested accounts:

```txt
school.admin@ofuq.local
teacher.arabic@ofuq.local
parent.hassan@ofuq.local
student.youssef@ofuq.local
```

Shared local password:

```txt
OfuqLocal123!
```

Avoid hardcoding the password in multiple places.

Preferred:

```txt
E2E_PASSWORD env variable with local fallback in one helper only
```

Example behavior:

```txt
const password = process.env.E2E_PASSWORD ?? "OfuqLocal123!"
```

Do not put Supabase service keys or local anon keys in docs or test code unless they already exist in public local env examples.

---

## Files to Add

Recommended new files:

```txt
playwright.config.ts
tests/e2e/auth-login.spec.ts
tests/e2e/dashboard-smoke.spec.ts
tests/e2e/portal-parent-smoke.spec.ts
tests/e2e/portal-student-smoke.spec.ts
tests/e2e/helpers/auth.ts
tests/e2e/helpers/assertions.ts
tests/e2e/README.md
```

Optional only if useful:

```txt
tests/e2e/helpers/routes.ts
```

Do not add too many specs in this phase.

---

## E2E Helper Requirements

Create a helper such as:

```txt
tests/e2e/helpers/auth.ts
```

It should expose functions like:

```ts
loginAs(page, email)
logoutIfPossible(page)
```

The login helper must:

```txt
open /login
fill email and password
click the login submit button
wait for navigation or a stable post-login state
```

Use robust selectors:

```txt
getByLabel
getByRole
getByText only when stable Arabic text is visible and reliable
```

If the current login form lacks accessible labels, make the smallest accessibility-safe improvement needed. Do not change visual behavior.

---

## Test 1 — Auth Login Smoke

Create:

```txt
tests/e2e/auth-login.spec.ts
```

Cover a small set of accounts:

```txt
school.admin@ofuq.local
parent.hassan@ofuq.local
student.youssef@ofuq.local
```

Verify:

```txt
/login loads
login succeeds
post-login page is not still showing the login form
user lands on an allowed page or can navigate to allowed route
no obvious runtime error page appears
```

Do not test every role in this phase.

---

## Test 2 — Dashboard Smoke

Create:

```txt
tests/e2e/dashboard-smoke.spec.ts
```

Use:

```txt
school.admin@ofuq.local
```

Verify:

```txt
/dashboard opens after login
key dashboard/admin navigation text is visible
at least these module labels or links are visible when expected:
الطلاب
الأكاديمي
الحضور
الدرجات
المالية
```

Do not perform CRUD.

Do not create/edit/delete records.

---

## Test 3 — Parent Portal Smoke

Create:

```txt
tests/e2e/portal-parent-smoke.spec.ts
```

Use:

```txt
parent.hassan@ofuq.local
```

Verify:

```txt
/portal opens
/portal/students opens
/portal/attendance opens
/portal/grades opens
/portal/finance opens
/portal/announcements opens
portal navigation is visible
read-only cue appears where expected
admin dashboard navigation does not appear
```

Read-only checks should assert absence of common mutation buttons/links in the portal context:

```txt
دفع
تعديل
حذف
إرسال عذر
إنشاء
جديد
```

Prefer checking roles/links/buttons rather than raw body text, because words may appear in harmless explanatory text.

No mutation flows.

---

## Test 4 — Student Portal Smoke

Create:

```txt
tests/e2e/portal-student-smoke.spec.ts
```

Use:

```txt
student.youssef@ofuq.local
```

Verify:

```txt
/portal opens
/portal/students opens
/portal/grades opens
/portal/timetable opens
/portal/library opens
/portal/finance opens and shows restricted or read-only finance state
admin dashboard navigation does not appear
no mutation buttons are available
```

Do not assert exact student counts unless UI makes it stable and clear.

Prefer stable text/route/read-only assertions.

---

## Runtime Error Guard

Add a small helper to assert that pages do not show obvious Next.js/runtime error states, such as:

```txt
Application error
Unhandled Runtime Error
This page could not be found
```

Use it after major page navigations.

Do not overfit to development overlay internals.

---

## Supabase / Seed Requirements

E2E requires local Supabase with the demo seed applied.

Before claiming E2E passed, ensure at least:

```bash
supabase status
```

And either:

```bash
supabase db reset
```

or, if Windows Docker reset is unstable in this workspace, follow the documented Phase 16 local workflow:

```txt
supabase start
local type generation when needed
manual DB smoke SQL against the running local stack
```

Do not claim `supabase db reset` passed unless it actually exits successfully.

Do not claim DB smoke passed unless `tests/db/local-demo-smoke.sql` actually passed.

---

## Documentation Updates

Update:

```txt
docs/testing.md
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/verification-report.md
```

Optional if useful:

```txt
docs/supabase-local.md
```

Docs must include:

```txt
how to install Playwright browser dependencies
how to run E2E tests
which local accounts are used
what Browser Smoke covers
what it does not cover
that E2E is local-only
that CI/hosted E2E is deferred unless implemented
that Browser smoke is only passed if Playwright ran successfully
```

`docs/testing.md` should now have sections for:

```txt
Unit tests
Database smoke checks
Browser smoke / E2E tests
Intentionally deferred testing
```

---

## Verification Commands

Run:

```bash
npm run test
npm run lint
npm run build
npm run test:all
npm run test:e2e
git diff --check
```

Also run or verify local Supabase:

```bash
supabase status
```

Run DB smoke when the local stack is available:

```powershell
$dbContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db*" } | Select-Object -First 1
Get-Content tests/db/local-demo-smoke.sql | docker exec -i $dbContainer psql -U postgres -d postgres
```

If Playwright browser install is required, run:

```bash
npx playwright install chromium
```

Document whether this was needed.

---

## Handling Local Environment Blockers

If `npm run test:e2e` cannot be completed because of:

```txt
Playwright browser dependency unavailable
Next dev server startup failure
local Supabase unavailable
Docker permission issue
Windows reset instability
```

Then:

1. Document the blocker honestly.
2. Do not mark E2E as passed.
3. Keep any implemented Playwright config/tests only if they are syntactically valid and do not break lint/build/unit tests.
4. Report No-Go for Phase 17 closure until E2E actually runs successfully, unless the agreed scope is changed to setup-only.

Preferred success path is to run and pass `npm run test:e2e` locally.

---

## Commit Rules

Stage only Phase 17 files.

Expected files may include:

```txt
package.json
package-lock.json
playwright.config.ts
.gitignore
tests/e2e/auth-login.spec.ts
tests/e2e/dashboard-smoke.spec.ts
tests/e2e/portal-parent-smoke.spec.ts
tests/e2e/portal-student-smoke.spec.ts
tests/e2e/helpers/auth.ts
tests/e2e/helpers/assertions.ts
tests/e2e/README.md
docs/testing.md
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/verification-report.md
```

Before commit, run:

```bash
git diff --cached --name-only
git diff --cached --stat
git diff --check --cached
```

Suggested commit message:

```txt
test: add browser smoke e2e foundation
```

Do not commit if:

```txt
unit tests fail
lint fails
build fails
test:all fails
E2E tests fail after environment is available
unrelated files are staged
Playwright artifacts are staged
schema/migrations are changed without justification
```

---

## Expected Final Response

After implementation, report:

1. Git status at start.
2. Playwright dependency and browser install status.
3. Scripts added.
4. Playwright config added.
5. E2E helpers added.
6. E2E specs added and what they cover.
7. Supabase local status.
8. DB smoke status.
9. `npm run test` result.
10. `npm run lint` result.
11. `npm run build` result.
12. `npm run test:all` result.
13. `npm run test:e2e` result.
14. `git diff --check` result.
15. Browser smoke status.
16. Docs updated.
17. Commit hash if committed.
18. Final Go/No-Go for the next phase.

---

## Success Criteria

Phase 17 succeeds only when:

- Playwright is installed and configured.
- E2E scripts exist.
- Browser smoke specs exist for auth, dashboard, parent portal, and student portal.
- E2E tests are small and non-mutating.
- Portal read-only behavior is asserted.
- Admin dashboard navigation is not shown in portal smoke checks.
- `npm run test` passes.
- `npm run lint` passes.
- `npm run build` passes.
- `npm run test:all` passes.
- `npm run test:e2e` passes, unless explicitly documented as blocked and Phase 17 remains No-Go.
- DB smoke status is documented honestly.
- No Playwright artifacts are committed.
- Docs explain how to run Browser Smoke / E2E.
- No full E2E/regression coverage is falsely claimed.

---

## Suggested Next Phase After Successful Completion

After Phase 17 is verified and committed, plan the next phase separately.

Potential Phase 18 options:

```txt
18 - Settings and Integrations Placeholders Foundation
or
18 - Parent/Student Portal Interaction Foundation
or
18 - CI Quality Workflow Foundation
```

Do not start the next phase in this prompt.
