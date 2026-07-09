# Codex Prompt — Phase 19: Role-Aware UX Routing and Navigation Foundation

## Mission

Implement Phase 19 for Ofuq: **Role-Aware UX Routing and Navigation Foundation**.

This is a UX/routing/navigation correction phase, not a feature phase and not a full redesign phase.

The goal is to make the app behave like a real role-aware SaaS product:

- Parent and student users must land in `/portal`, not the administrative dashboard.
- Parent and student users must not remain in the dashboard shell.
- Staff users must only see dashboard navigation that matches their fixed role.
- Developer-facing UI copy must be removed from the production-facing shell/dashboard.
- The phase must stay small, safe, and verifiable.

## Current Problem To Fix

The current implementation has these known issues:

1. `signInWithEmail` redirects every active membership to `/dashboard`.
2. `app/(dashboard)/layout.tsx` allows any active membership into the dashboard shell, including `parent` and `student`.
3. `components/app/app-shell.tsx` renders `AppSidebar` without passing the authenticated user or role.
4. `components/app/app-sidebar.tsx` renders the entire `dashboardNavigation` for every role.
5. The dashboard UI still includes developer-facing copy such as:
   - `بنية dashboard عربية جاهزة للربط مع Supabase Auth و Server Actions.`
   - `مرحلة التأسيس`
   - `جاهز للمرحلة التالية`
   - `لا توجد بيانات فعلية بعد`
   - wording that says pages are waiting to be connected later.

## Hard Constraints

Preserve the project architecture and rules:

- Use fixed roles from `user_memberships`; do not introduce RBAC tables.
- Do not add permissions tables.
- Do not add RLS in this phase.
- Do not add schema migrations.
- Do not add new business modules.
- Do not add deep role-specific dashboards yet; that is Phase 20.
- Do not do a complete visual redesign; that is Phase 21.
- Keep Arabic-first RTL UI.
- Use existing Tailwind CSS, shadcn-style/Base UI primitives, Lucide icons, and existing utilities.
- Do not add a heavy UI library.
- Keep security checks server-side.
- Do not trust role, tenant_id, school_id, or user_id from the client.
- Keep Playwright smoke small and stable.
- Do not claim verification that was not actually run.

## Required Outcome

After this phase:

- `parent` login lands on `/portal`.
- `student` login lands on `/portal`.
- `parent` visiting `/dashboard` redirects to `/portal`.
- `student` visiting `/dashboard` redirects to `/portal`.
- `school_admin` and `system_admin` keep access to the full dashboard navigation.
- `teacher` sees teacher-relevant navigation only.
- `accountant` sees finance-relevant navigation only.
- `librarian` sees library-relevant navigation only.
- Developer-facing copy is removed from the dashboard shell and main dashboard page.
- Tests and docs are updated.

---

## Phase Scope

### In Scope

- Role-aware login redirect.
- Dashboard layout redirect for portal roles.
- Dashboard sidebar filtering by role.
- Passing `SessionUser` or role into `AppSidebar`.
- A pure helper for default route by role.
- A pure helper for dashboard navigation by role.
- Production-ready copy cleanup in:
  - app header
  - app sidebar
  - main dashboard page
- Unit tests for role routing/navigation helpers.
- E2E smoke for role-based routing/navigation visibility.
- Documentation updates.

### Out of Scope

- No full UI redesign.
- No new dashboard pages per role unless absolutely necessary.
- No schema changes.
- No new migrations.
- No seed changes unless an existing E2E demo user email differs.
- No RBAC.
- No RLS.
- No permissions editor.
- No module-level authorization rewrite.
- No deep page-by-page UI cleanup.
- No new external integrations.

---

## Implementation Plan

### 1. Add role redirect helper

Create:

```text
lib/auth/role-redirects.ts
```

Suggested API:

```ts
import type { UserRole } from "@/constants/roles"

export function getDefaultRouteForRole(role: UserRole): string
export function isPortalRole(role: UserRole): boolean
export function isDashboardRole(role: UserRole): boolean
```

Rules:

```text
system_admin -> /dashboard
school_admin -> /dashboard
teacher -> /dashboard
accountant -> /dashboard/finance
librarian -> /dashboard/library
parent -> /portal
student -> /portal
```

Notes:

- Reuse the existing `appRoutes` constants.
- If an `isPortalRole` helper already exists under `lib/portal/access.ts`, avoid duplicating logic. Either reuse it or re-export a single source of truth.
- Keep this helper pure and unit-testable.

### 2. Update sign-in redirect

Update:

```text
lib/actions/auth.ts
```

Replace the fixed redirect:

```ts
redirect(appRoutes.dashboard)
```

with role-aware routing:

```ts
redirect(getDefaultRouteForRole(membership.role))
```

Rules:

- Only redirect after profile and active membership checks pass.
- Do not read role from the client.
- Use the resolved server-side membership role.

### 3. Enforce dashboard access rule

Update:

```text
app/(dashboard)/layout.tsx
```

After active membership is confirmed, redirect portal roles:

```text
if role is parent or student -> redirect /portal
```

Final dashboard access behavior:

```text
No auth user -> /login
Missing profile -> no-access state
Inactive/missing membership -> no-access state
parent/student -> /portal
system_admin/school_admin/teacher/accountant/librarian -> AppShell
```

### 4. Pass user into AppSidebar

Update:

```text
components/app/app-shell.tsx
```

Current behavior renders:

```tsx
<AppSidebar />
```

Change to:

```tsx
<AppSidebar user={user} />
```

Update the sidebar props accordingly.

### 5. Add role navigation helper

Create:

```text
lib/navigation/role-navigation.ts
```

Suggested API:

```ts
import type { UserRole } from "@/constants/roles"
import type { NavigationGroup } from "@/config/navigation"

export function getDashboardNavigationForRole(role: UserRole): NavigationGroup[]
export function canRoleAccessDashboardNavigation(role: UserRole): boolean
```

The helper should be pure and unit-testable.

#### Admin roles

`system_admin` and `school_admin` should see all relevant active dashboard items.

Allowed:

```text
لوحة التحكم
الطلاب
القبول
الأكاديمي
الحضور
الدرجات
الجدول
المالية
التواصل
الشكاوى والاستبيانات
التقارير
المكتبة
الرعاية الطلابية
الإعدادات
التكاملات
```

Placeholder items such as `التقويم المدرسي` and `الأمان` should either remain hidden from production navigation or be clearly excluded from Phase 19 production UI. Do not keep `لاحقًا` developer badges in the main sidebar.

#### Teacher

Teacher navigation should include only teacher-relevant areas:

```text
لوحة التحكم
الطلاب أو الصفوف/الطلاب للقراءة المحدودة
الحضور
الدرجات
الجدول
التواصل
التقارير المحدودة
```

Hide from teacher:

```text
القبول
المالية
المكتبة الإدارية
الرعاية الطلابية الحساسة
الإعدادات
التكاملات
```

If the current app does not yet have a dedicated limited-students route, it is acceptable to keep `الطلاب` visible for now only if the existing page is already server-guarded appropriately. Otherwise hide it and document the limitation.

#### Accountant

Accountant navigation should include:

```text
لوحة التحكم
المالية
التقارير
التواصل
```

Optional if currently useful and safe:

```text
الطلاب
```

Hide from accountant:

```text
القبول
الأكاديمي
الحضور
الدرجات
الجدول
المكتبة
الرعاية الطلابية
الشكاوى والاستبيانات unless intentionally allowed
الإعدادات
التكاملات
```

#### Librarian

Librarian navigation should include:

```text
لوحة التحكم
المكتبة
التواصل
التقارير
```

Optional if currently useful and safe:

```text
الطلاب
```

Hide from librarian:

```text
القبول
الأكاديمي
الحضور
الدرجات
الجدول
المالية
الرعاية الطلابية
الإعدادات
التكاملات
```

#### Parent / Student

Return no dashboard navigation. They should not use dashboard shell.

### 6. Update AppSidebar to use filtered navigation

Update:

```text
components/app/app-sidebar.tsx
```

Requirements:

- Accept `user: SessionUser` or at minimum `role: UserRole`.
- Call `getDashboardNavigationForRole(user.role)`.
- Render only filtered groups/items.
- Do not render empty groups.
- Do not render placeholder-only items in production sidebar.
- Remove the `مرحلة التأسيس` badge.
- Replace it with product-safe text such as:

```text
منصة أُفُق
```

or, if school name is readily available in the authenticated context, use the school display name. Do not add extra database queries only for this phase.

### 7. Clean dashboard header copy

Update:

```text
components/app/app-header.tsx
```

Remove:

```text
بنية dashboard عربية جاهزة للربط مع Supabase Auth و Server Actions.
```

Replace with production-ready copy such as:

```text
مرحبًا بك في منصة أُفُق لإدارة المدرسة.
```

or:

```text
تابع أعمالك اليومية من مكان واحد.
```

Also remove UI badges that only indicate technical implementation status, such as `RTL`, unless they serve a real user purpose. Prefer showing role label and user name.

### 8. Clean main dashboard page copy

Update:

```text
app/(dashboard)/dashboard/page.tsx
```

Remove developer/foundation copy such as:

```text
لا توجد بيانات فعلية بعد
جاهز للمرحلة التالية
مخطط جاهز
ستتصل هنا في المرحلة التالية
ملخص تأسيسي قابل للتوسع قبل ربط الوحدات التشغيلية
ملاحظات التأسيس
```

Replace with production-ready language.

Do not implement Phase 20 role-specific summaries yet. For now, make the dashboard copy more professional and avoid claiming unavailable analytics.

Acceptable Phase 19 dashboard wording examples:

```text
لوحة تشغيل المدرسة
نظرة عامة على أهم أعمال المدرسة اليومية.
لا توجد سجلات مطابقة حاليًا.
تابع الحضور والطلاب والرسوم والتقارير من الروابط الجانبية.
```

If there are existing demo data summary helpers already available, use them lightly. Do not build new dashboard analytics in this phase.

### 9. Keep portal shell behavior intact

Do not break:

```text
app/(portal)/portal/layout.tsx
components/portal/*
config/portal-navigation.ts
```

Parent/student portal remains the correct destination.

Only update portal tests if login redirect behavior requires it.

---

## Testing Requirements

### Unit tests

Add:

```text
tests/unit/role-redirects.test.ts
tests/unit/role-navigation.test.ts
```

Update existing tests if needed:

```text
tests/unit/navigation.test.ts
tests/unit/routes.test.ts
tests/unit/roles.test.ts
```

#### role-redirects.test.ts must verify

```text
system_admin -> /dashboard
school_admin -> /dashboard
teacher -> /dashboard
accountant -> /dashboard/finance
librarian -> /dashboard/library
parent -> /portal
student -> /portal
```

Also verify:

```text
parent/student are portal roles
system_admin/school_admin/teacher/accountant/librarian are dashboard roles
```

#### role-navigation.test.ts must verify

```text
system_admin sees full admin navigation
school_admin sees full school admin navigation
teacher does not see finance/settings/integrations
accountant sees finance and does not see admissions/settings/integrations/library/student-care
librarian sees library and does not see finance/settings/integrations/student-care
parent gets no dashboard navigation
student gets no dashboard navigation
no rendered active item has an empty href
no duplicate active hrefs per role
empty groups are removed
```

### Playwright E2E

Add or update:

```text
tests/e2e/role-routing-smoke.spec.ts
```

Use existing E2E helpers when possible. Do not duplicate login helper logic unnecessarily.

Suggested local demo accounts:

```text
school.admin@ofuq.local
teacher.arabic@ofuq.local
accountant.main@ofuq.local
librarian.main@ofuq.local
parent.hassan@ofuq.local
student.youssef@ofuq.local
```

Password:

```text
OfuqLocal123!
```

Use existing `E2E_PASSWORD` fallback pattern if already present.

#### E2E scenarios

- `parent` login lands on `/portal`.
- `student` login lands on `/portal`.
- `parent` visiting `/dashboard` redirects to `/portal`.
- `student` visiting `/dashboard` redirects to `/portal`.
- `school_admin` login reaches dashboard and sees admin navigation.
- `teacher` does not see finance/settings/integrations navigation.
- `accountant` sees finance and does not see admissions/settings/integrations/library/student-care.
- `librarian` sees library and does not see finance/settings/integrations/student-care.
- Header no longer contains:

```text
Supabase Auth
Server Actions
بنية dashboard
مرحلة التأسيس
```

Keep assertions stable and not overly dependent on exact layout classes.

---

## Documentation Requirements

Update these docs:

```text
docs/project-status.md
docs/project-phases.md
docs/security-model.md
docs/testing.md
docs/verification-report.md
docs/ui-ux-role-roadmap.md
```

The docs must state clearly:

- Phase 19 added role-aware login routing.
- Parent/student users are routed to `/portal`.
- Dashboard shell redirects parent/student to `/portal`.
- Dashboard navigation is filtered by fixed role.
- UI navigation filtering is a UX improvement, not a replacement for server-side authorization.
- No RBAC was added.
- No RLS was added.
- No schema changes were added.
- No full redesign was performed.
- Developer-facing copy was removed from the main dashboard shell.
- Browser smoke status is whatever actually happened.

If any verification command is not run, document it honestly as `not run` or `blocked`, not as passed.

---

## Verification Commands

Run:

```bash
supabase status
npm run test
npm run lint
npm run build
npm run test:all
npm run test:e2e
git diff --check
```

If local Supabase state is stale and E2E needs demo users, run:

```bash
supabase db reset
```

Then rerun DB smoke if appropriate:

```powershell
$dbContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db*" } | Select-Object -First 1
Get-Content tests/db/local-demo-smoke.sql | docker exec -i $dbContainer psql -U postgres -d postgres
```

Do not claim `supabase db reset` passed unless it actually passed.

---

## Commit Requirements

Before committing:

```bash
git status --short
git diff --check
```

Commit message:

```text
feat: add role aware ux routing navigation foundation
```

Final report must include:

- Changed files summary.
- Role redirect behavior summary.
- Navigation visibility summary.
- Copy cleanup summary.
- Tests run and exact results.
- Browser smoke result.
- Supabase status/reset/DB smoke result if run.
- Commit hash, if committed.
- Final Go/No-Go for Phase 20 planning.

---

## Done Criteria

Phase 19 is done only when:

- Login redirect is role-aware.
- Parent/student login lands on `/portal`.
- Parent/student cannot remain in dashboard shell.
- Dashboard sidebar is role-filtered for staff roles.
- Staff roles do not see obviously unrelated modules in navigation.
- Developer-facing shell/dashboard copy is removed.
- Unit tests pass.
- Lint passes.
- Build passes.
- `npm run test:all` passes.
- Playwright E2E passes or any blocker is documented honestly.
- Docs are updated.
- No unrelated feature work was introduced.
