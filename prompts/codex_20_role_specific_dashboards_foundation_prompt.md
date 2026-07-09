# Codex Prompt — Phase 20: Role-Specific Dashboards Foundation

## Mission

Implement Phase 20 for Ofuq: **Role-Specific Dashboards Foundation**.

This is a UX/productization phase. The goal is to replace the remaining generic dashboard experience with useful role-specific home pages and portal summaries, while keeping the work small, server-scoped, and verifiable.

Phase 19 already made routing and navigation role-aware. Phase 20 should make the actual landing content role-aware.

## Current State

- `/dashboard` is protected and portal roles are redirected to `/portal`.
- Login routing is role-aware.
- Dashboard navigation is filtered by fixed role.
- Some dashboard copy was cleaned up in Phase 19.
- The dashboard content is still generic and does not yet provide a meaningful home page for each staff role.
- `/portal` exists for `parent` and `student`, but the overview should become more useful and personalized.

## Primary Goal

Make `/dashboard` render different content based on the authenticated staff role:

- `system_admin` and `school_admin` see an administrative school operations dashboard.
- `teacher` sees a teaching-focused dashboard.
- `accountant` sees a finance-focused dashboard.
- `librarian` sees a library-focused dashboard.

Improve `/portal` overview so:

- `parent` sees a useful children/follow-up dashboard.
- `student` sees a useful personal school dashboard.

## Recommended Route Strategy

Use **Option A**: keep a single staff route:

```text
/dashboard
```

Render different dashboard content inside it based on the authenticated membership role.

Do not create separate staff routes in this phase unless strictly needed.

After this phase, staff users can all land on `/dashboard` because `/dashboard` becomes role-aware content.

Recommended role landing routes after Phase 20:

```text
system_admin -> /dashboard
school_admin -> /dashboard
teacher -> /dashboard
accountant -> /dashboard
librarian -> /dashboard
parent -> /portal
student -> /portal
```

If Phase 19 currently routes `accountant` to `/dashboard/finance` and `librarian` to `/dashboard/library`, update `getDefaultRouteForRole` so staff roles land on `/dashboard` after the new role dashboards are implemented.

## Hard Constraints

- No schema migrations.
- No seed changes unless strictly needed to fix existing local smoke data.
- No RBAC.
- No RLS.
- No permissions tables.
- No new business workflow.
- No AI dashboard.
- No advanced analytics.
- No report builder.
- No charts dependency.
- No heavy UI dependency.
- No full visual redesign; that is Phase 21.
- No deep module page cleanup; that is Phase 22+.
- Keep Arabic-first RTL UI.
- Use Server Components by default.
- Use server-side helpers for all sensitive reads.
- Derive `tenant_id`, `school_id`, `role`, and `user_id` from authenticated membership context only.
- Do not trust client-provided scope fields.
- Keep summaries small and stable.
- Do not claim E2E/browser verification if local Supabase/Playwright is blocked.

---

## In Scope

- Role-aware dashboard content inside `/dashboard`.
- Admin dashboard summary.
- Teacher dashboard summary.
- Accountant dashboard summary.
- Librarian dashboard summary.
- Parent portal overview improvement.
- Student portal overview improvement.
- Shared KPI/stat card components.
- Shared quick action card components.
- Server-side summary helpers scoped by role and membership.
- Unit tests for pure helper behavior and role routing.
- E2E smoke update for role dashboard page content when local environment supports it.
- Documentation updates.

## Out of Scope

- No full shell redesign.
- No module CRUD changes.
- No domain workflow changes.
- No schema changes.
- No new dashboard routes unless unavoidable.
- No permission editor.
- No external integrations.
- No hosted Supabase E2E.
- No complex graphs or visual regression.

---

## Implementation Plan

### 1. Inspect existing dashboard and portal code

Before editing, inspect:

```text
app/(dashboard)/dashboard/page.tsx
app/(portal)/portal/page.tsx
lib/auth/role-redirects.ts
lib/navigation/role-navigation.ts
lib/auth/session.ts
lib/portal/*
components/shared/*
components/dashboard/* if present
```

Also inspect existing data helpers for modules before creating new queries. Reuse existing server helpers when possible.

### 2. Add shared dashboard UI primitives

Add or improve lightweight shared components:

```text
components/shared/stat-card.tsx
components/shared/kpi-grid.tsx
components/shared/quick-action-card.tsx
```

Keep them generic and Arabic-friendly.

Suggested `StatCard` props:

```ts
type StatCardProps = {
  title: string
  value: string | number
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  tone?: "default" | "info" | "success" | "warning" | "danger"
}
```

Suggested `QuickActionCard` props:

```ts
type QuickActionCardProps = {
  title: string
  description: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}
```

Rules:

- Do not add heavy UI dependencies.
- Use existing `Card`, `Button`, `Badge`, and project utilities.
- Keep visual polish moderate; full polish is Phase 21.

### 3. Add dashboard summary types

Create:

```text
types/dashboard.ts
```

Or co-locate types under `lib/dashboard/types.ts` if project style prefers it.

Suggested high-level types:

```ts
export type AdminDashboardSummary = { ... }
export type TeacherDashboardSummary = { ... }
export type AccountantDashboardSummary = { ... }
export type LibrarianDashboardSummary = { ... }
export type RoleDashboardSummary =
  | { role: "system_admin" | "school_admin"; data: AdminDashboardSummary }
  | { role: "teacher"; data: TeacherDashboardSummary }
  | { role: "accountant"; data: AccountantDashboardSummary }
  | { role: "librarian"; data: LibrarianDashboardSummary }
```

Keep these summaries small. Counts and small recent lists are enough.

### 4. Add server-side staff summary helpers

Create:

```text
lib/dashboard/admin-summary.ts
lib/dashboard/teacher-summary.ts
lib/dashboard/accountant-summary.ts
lib/dashboard/librarian-summary.ts
lib/dashboard/get-role-dashboard-summary.ts
```

Each helper must:

- Run only server-side.
- Accept authenticated membership context or a typed authenticated user.
- Scope every query by `tenant_id` and `school_id` when school-scoped.
- Avoid accepting client-supplied `tenant_id` or `school_id`.
- Return safe fallback values if optional module data is missing.
- Avoid throwing user-facing runtime errors for empty data.

#### Admin summary

Use existing tables only. Suggested fields:

```text
activeStudentsCount
pendingAdmissionsCount
recentAttendanceSessionsCount or recentAttendanceSessions
openComplaintsCount
unpaidInvoicesCount
recentPaymentsCount or recentPayments
publishedAnnouncementsCount or recentAnnouncements
upcomingEventsCount or upcomingEvents
```

Recommended tables:

```text
students
student_admissions
attendance_sessions
complaints
invoices
payments
announcements
school_events
```

#### Teacher summary

Keep it teaching-focused. Suggested fields:

```text
todayTimetableSlots
assignedSubjectsCount
recentAttendanceSessions
recentExams
recentAnnouncements
quickLinks
```

Recommended tables:

```text
timetable_slots
teacher_subject_assignments
subjects
classes
attendance_sessions
exams
announcements
messages or notification_logs if safe and simple
```

If there is no reliable teacher-to-user relation yet, do one of these safely:

1. Use school-scoped recent teaching data and clearly label it as school teaching overview, or
2. Return safe empty teacher-specific arrays with useful quick links, and document that teacher-personal assignment scoping will be improved later.

Do not invent unsafe teacher-user joins.

#### Accountant summary

Suggested fields:

```text
invoicesCount
paidInvoicesCount
partialInvoicesCount
unpaidInvoicesCount
paymentsCount
recentPayments
activeDiscountsCount
outstandingBalance
quickLinks
```

Recommended tables:

```text
invoices
invoice_items
payments
discount_types
student_discounts
```

Do not show academic/health/library data here.

#### Librarian summary

Suggested fields:

```text
catalogCount
copiesCount
availableCopiesCount
activeLoansCount
overdueLoansCount
recentLoans
quickLinks
```

Recommended tables:

```text
book_catalog
book_copies
book_loans
students only if needed for display and safely scoped
```

Do not show finance/settings/academic sensitive data here.

### 5. Add role dashboard components

Create:

```text
components/dashboard/role-dashboard.tsx
components/dashboard/admin-dashboard.tsx
components/dashboard/teacher-dashboard.tsx
components/dashboard/accountant-dashboard.tsx
components/dashboard/librarian-dashboard.tsx
```

`RoleDashboard` should select the correct component by role.

Example shape:

```tsx
export function RoleDashboard({ summary }: { summary: RoleDashboardSummary }) {
  switch (summary.role) {
    case "system_admin":
    case "school_admin":
      return <AdminDashboard summary={summary.data} />
    case "teacher":
      return <TeacherDashboard summary={summary.data} />
    case "accountant":
      return <AccountantDashboard summary={summary.data} />
    case "librarian":
      return <LibrarianDashboard summary={summary.data} />
  }
}
```

Dashboard content should include:

- Arabic role-specific page title.
- Short useful description.
- KPI cards.
- Quick action cards.
- A small recent activity/list section where available.
- Production-ready empty states.

### 6. Update `/dashboard` page

Update:

```text
app/(dashboard)/dashboard/page.tsx
```

Requirements:

- Resolve authenticated user server-side.
- Use the active membership role from server-side context.
- Load `getRoleDashboardSummary(authenticatedUser)`.
- Render `RoleDashboard`.
- Do not show generic zero-value placeholders when demo data exists.
- Keep portal roles out of this page via layout behavior from Phase 19.

If `getAuthenticatedUser` is already called in layout but not passed to pages, call it again in the page if that matches project style. Do not introduce a global state dependency.

### 7. Improve parent/student `/portal` overview

Update:

```text
app/(portal)/portal/page.tsx
```

Add:

```text
lib/portal/portal-summary.ts
components/portal/portal-overview.tsx or local components if preferred
```

Requirements:

- Preserve all existing portal server-side linked-student scoping.
- Parent sees linked children summary.
- Student sees only own summary.
- Student should not see full finance details.
- Parent can see high-level finance summary for linked children.
- Keep portal read-only.

#### Parent portal overview should show

```text
الأبناء المرتبطون
ملخص الحضور
آخر الدرجات
ملخص الفواتير
الجدول القادم
الإعلانات الأخيرة
```

#### Student portal overview should show

```text
جدولي القريب
آخر الدرجات
حالة الحضور
كتبي المستعارة
الإعلانات الأخيرة
```

Do not add mutations.

### 8. Update default role redirects after dashboard is role-aware

Update:

```text
lib/auth/role-redirects.ts
```

Recommended final rules:

```text
system_admin -> /dashboard
school_admin -> /dashboard
teacher -> /dashboard
accountant -> /dashboard
librarian -> /dashboard
parent -> /portal
student -> /portal
```

Rationale: `/dashboard` now becomes a role-specific staff landing page.

Ensure existing unit tests are updated accordingly.

---

## UI Copy Requirements

Use production-ready Arabic. Avoid developer or scaffold words.

Avoid:

```text
placeholder
foundation
جاهز للربط
لاحقًا
لا توجد بيانات فعلية بعد
ستتصل هنا
مخطط جاهز
```

Prefer:

```text
لوحة تشغيل المدرسة
لوحة المعلم
لوحة المحاسب
لوحة المكتبة
نظرة عامة على أعمالك اليومية.
لا توجد سجلات مطابقة حاليًا.
انتقل إلى القسم المناسب من الإجراءات السريعة.
```

Integrations pages can keep carefully worded placeholder messaging because that is their explicit feature scope from Phase 18.

---

## Tests Required

### Unit tests

Add or update:

```text
tests/unit/dashboard-summaries.test.ts
tests/unit/role-dashboard.test.ts
tests/unit/portal-summary.test.ts
tests/unit/role-redirects.test.ts
```

Recommended tests:

```text
- getDefaultRouteForRole routes all staff roles to /dashboard after Phase 20.
- parent/student still route to /portal.
- dashboard summary builders return role-specific shapes.
- admin summary shape does not include portal-only data.
- teacher dashboard shape does not include finance/library/admin settings data.
- accountant dashboard shape focuses on finance.
- librarian dashboard shape focuses on library.
- portal summary differentiates parent and student modes.
- shared quick actions do not include hrefs outside the role navigation intent.
```

If database-query helpers are hard to unit test without Supabase, extract pure mapper/formatter functions and test those.

### E2E smoke

Add or update:

```text
tests/e2e/role-dashboards-smoke.spec.ts
```

Use existing E2E helpers.

Demo accounts:

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

Use the existing `E2E_PASSWORD` fallback pattern if present.

E2E scenarios:

```text
- school_admin login -> /dashboard and sees لوحة تشغيل المدرسة.
- teacher login -> /dashboard and sees لوحة المعلم.
- teacher does not see finance/settings/integrations in navigation.
- accountant login -> /dashboard and sees لوحة المحاسب.
- accountant sees finance-focused quick actions.
- accountant does not see attendance/grades/library/settings quick actions.
- librarian login -> /dashboard and sees لوحة المكتبة.
- librarian sees library-focused quick actions.
- librarian does not see finance/settings quick actions.
- parent login -> /portal and sees parent/children overview.
- student login -> /portal and sees student personal overview.
```

If Supabase local or Playwright is blocked, document it honestly in `docs/verification-report.md`. Do not claim browser smoke passed unless `npm run test:e2e` actually passes.

---

## Documentation Required

Update:

```text
docs/project-status.md
docs/project-phases.md
docs/testing.md
docs/verification-report.md
docs/ui-ux-role-roadmap.md
docs/security-model.md
```

Documentation must state:

- Phase 20 added role-specific dashboard content.
- `/dashboard` now renders staff-specific content by fixed role.
- `/portal` overview was improved for parent/student.
- No schema changes were added.
- No RBAC was added.
- No RLS was added.
- No full redesign was performed.
- UI summaries are UX helpers and do not replace server-side authorization.
- E2E/browser status is documented honestly.

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

If local Supabase/Docker becomes available and data is stale:

```bash
supabase db reset
```

Then run DB smoke if appropriate:

```powershell
$dbContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db*" } | Select-Object -First 1
Get-Content tests/db/local-demo-smoke.sql | docker exec -i $dbContainer psql -U postgres -d postgres
```

If Docker/Supabase remains blocked, document the exact blocker.

---

## Commit Requirements

Before committing:

```bash
git status --short
git diff --check
```

Suggested commit message:

```text
feat: add role specific dashboards foundation
```

Final report must include:

```text
- changed files summary
- role dashboard behavior summary
- portal overview behavior summary
- role redirect changes summary
- tests run with exact results
- E2E result or blocker
- Supabase status/reset/DB smoke result or blocker
- commit hash if committed
- final Go/No-Go for Phase 21 planning
```

---

## Done Criteria

Phase 20 is done only when:

- `/dashboard` renders role-specific staff content.
- Admin users see an administrative operations dashboard.
- Teacher sees a teaching-focused dashboard.
- Accountant sees a finance-focused dashboard.
- Librarian sees a library-focused dashboard.
- Parent portal overview is improved.
- Student portal overview is improved.
- Staff default route is `/dashboard` after the role dashboard is available.
- Parent/student default route remains `/portal`.
- No unsafe client-supplied scope is used.
- No schema migration is added.
- No RBAC/RLS/permissions system is introduced.
- Unit tests pass.
- Lint passes.
- Build passes.
- `npm run test:all` passes.
- E2E passes or blocker is documented honestly.
- Docs are updated.
