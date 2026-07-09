# Codex Prompt — Phase 21: Professional UI Polish and Design System Pass

## Mission

Implement Phase 21 for Ofuq: **Professional UI Polish and Design System Pass**.

This is a focused UI/UX productization phase. The goal is to make Ofuq feel like a polished Arabic SaaS school-management product suitable for a final presentation, while preserving the existing full-stack architecture, role-aware routing, role-specific dashboards, and portal behavior.

This phase should improve the visible product experience. It must not add new business modules or change database behavior.

## Current State

- Phase 19 made routing and dashboard navigation role-aware.
- Phase 20 added role-specific staff dashboards and richer parent/student portal summaries.
- Preflight 20.1 aligned local E2E demo auth accounts for accountant/librarian smoke.
- The next visible improvement should be a professional design-system polish pass, not another feature slice.

## Primary Goal

Improve the overall interface quality across:

```text
- dashboard shell
- portal shell
- header
- sidebar
- page headers
- shared cards
- KPI/stat cards
- quick action cards
- summary section cards
- empty states
- Arabic production copy
- responsive layout basics
```

The app should no longer feel like a scaffold. It should feel like a coherent product.

## Hard Constraints

- No schema migrations.
- No seed changes.
- No Supabase config changes.
- No RBAC.
- No RLS.
- No new permissions system.
- No new business workflows.
- No AI/chatbot/report-builder work.
- No real external integrations.
- No route behavior changes unless required to fix a UI regression.
- No full module-by-module cleanup; that is Phase 22+.
- No heavy UI dependency.
- Do not switch away from Tailwind CSS, shadcn/ui-style source components, Base UI, Lucide/Hugeicons, and existing primitives.
- Use `shadcn`/Base UI patterns for UI work.
- Use `migrate-radix-to-base` only if Radix imports are discovered and need migration.
- Use framer-motion only for subtle, low-risk polish and only where it does not force broad client-component conversion.
- Keep Arabic-first RTL behavior.
- Do not trust client-provided `tenant_id`, `school_id`, `role`, or `user_id`.
- Do not broaden tests unnecessarily.

## Design Direction

Use the existing Ofuq brand palette and CSS tokens:

```text
#0D1B3D  Navy
#0D7A7B  Teal
#C9A24B  Gold
#FFFFFF  White
```

The visual style should be:

```text
Arabic-first
RTL-native
formal educational
premium but not overloaded
SaaS dashboard oriented
clear for school staff and families
```

Avoid playful or childish styling. Avoid excessive gradients, noisy backgrounds, or heavy animations.

---

## Scope

### In Scope

- Polish `AppShell` layout and page background.
- Polish `AppHeader` identity area, role badge, spacing, and production copy.
- Polish `AppSidebar` branding, spacing, active state, grouping, and responsive behavior.
- Polish portal shell/header/sidebar if present.
- Improve shared components used by dashboards and portal.
- Add small shared wrappers if useful:
  - `PageShell`
  - `PageSection`
  - `ModuleCard`
  - `DataToolbar`
  - `Breadcrumbs`
  - `RoleAwareEmptyState`
- Improve existing shared components:
  - `PageHeader`
  - `EmptyState`
  - `StatCard`
  - `KpiGrid`
  - `QuickActionCard`
  - `SummarySectionCard`
- Apply polish to dashboard landing pages and portal overview.
- Clean production copy that still sounds like a scaffold.
- Update docs honestly.

### Out of Scope

- No module workflow redesign.
- No large rewrite of all dashboard module pages.
- No new database queries unless needed for display text already available.
- No new charting dependency.
- No visual regression infrastructure.
- No test suite expansion for purely visual components.
- No full E2E requirement.

---

## Files To Inspect First

Inspect before editing:

```text
app/globals.css
components/app/app-shell.tsx
components/app/app-header.tsx
components/app/app-sidebar.tsx
components/portal/portal-shell.tsx
components/portal/portal-header.tsx if present
components/portal/portal-sidebar.tsx
components/shared/page-header.tsx
components/shared/empty-state.tsx
components/shared/stat-card.tsx
components/shared/kpi-grid.tsx
components/shared/quick-action-card.tsx
components/shared/summary-section-card.tsx
components/dashboard/*
components/portal/portal-overview.tsx
app/(dashboard)/dashboard/page.tsx
app/(portal)/portal/page.tsx
docs/ui-ux-role-roadmap.md
docs/project-status.md
```

Also search for remaining scaffold/developer copy:

```text
placeholder
foundation
جاهز للربط
لاحقًا
لا توجد بيانات فعلية بعد
ستتصل هنا
مخطط جاهز
Supabase Auth
Server Actions
```

Exception: integration placeholder pages may keep product-facing placeholder language because that is the explicit Phase 18 scope.

---

## Implementation Plan

### 1. Polish global visual foundation lightly

Inspect `app/globals.css`.

Allowed changes:

- Improve background softness using existing CSS variables.
- Add minimal base styles for selection/focus if helpful.
- Keep tokens aligned with existing brand colors.
- Do not introduce a new theme system.
- Do not break dark mode tokens if present.

Do not rename existing CSS variables unless necessary.

### 2. Polish dashboard shell

Update:

```text
components/app/app-shell.tsx
components/app/app-header.tsx
components/app/app-sidebar.tsx
```

Expected improvements:

- More polished application background.
- Better main content spacing and container behavior.
- Sidebar with clearer brand block.
- Better active navigation state.
- Better sidebar group spacing.
- Header with clearer user identity and role badge.
- Production-ready tagline.
- Better mobile/tablet stacking without adding complex drawer logic unless already present.

Do not change role filtering logic. Do not change route behavior.

### 3. Polish portal shell

Update existing portal shell components only if present and safe:

```text
components/portal/portal-shell.tsx
components/portal/portal-header.tsx
components/portal/portal-sidebar.tsx
```

Expected improvements:

- Consistent visual language with dashboard shell.
- Clear read-only portal identity.
- Better parent/student user block.
- Better responsive spacing.

Do not add mutations to portal. Portal remains read-only.

### 4. Improve shared components

Improve current shared components rather than duplicating styling across pages.

Target components:

```text
components/shared/page-header.tsx
components/shared/empty-state.tsx
components/shared/stat-card.tsx
components/shared/kpi-grid.tsx
components/shared/quick-action-card.tsx
components/shared/summary-section-card.tsx
```

Optional new components:

```text
components/shared/page-shell.tsx
components/shared/page-section.tsx
components/shared/module-card.tsx
components/shared/data-toolbar.tsx
components/shared/breadcrumbs.tsx
components/shared/role-aware-empty-state.tsx
```

Rules:

- Keep props backward-compatible where possible.
- Do not force all pages to change at once.
- Prefer optional props such as `eyebrow`, `badge`, `variant`, `children`, `actions`, `description`.
- Avoid adding tests for simple presentational props unless existing tests break.
- Keep components Server Component friendly unless interaction requires client code.

### 5. Apply polish to landing experiences only

Apply the improved components to:

```text
components/dashboard/*
components/portal/portal-overview.tsx
```

Focus on first impressions:

- Admin dashboard.
- Teacher dashboard.
- Accountant dashboard.
- Librarian dashboard.
- Parent portal overview.
- Student portal overview.

Do not refactor every module page in this phase.

### 6. Improve Arabic production copy

Copy should sound like a real school platform.

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
لا توجد نتائج مطابقة حاليًا.
تابع أعمالك اليومية من مكان واحد.
تعرض هذه الصفحة ملخصًا لأهم بيانات المدرسة.
انتقل إلى الإجراءات السريعة للوصول إلى القسم المطلوب.
هذه الإعدادات محفوظة للتحضير للتكامل. لا يتم تنفيذ اتصال خارجي حاليًا.
```

### 7. Use motion carefully

If using framer-motion:

- Use it only in small client components where already appropriate.
- Prefer subtle fade/slide for cards or sections.
- Do not convert large server-rendered dashboard pages into client components only for animation.
- Do not add animation to critical navigation state if it risks flakiness.

It is acceptable to skip motion entirely if the polish is strong without it.

---

## Testing Budget Rule

Keep tests minimal and high-value.

Do not add broad tests for every UI component. Do not add visual regression tests.

Add or update tests only for changed logic that can regress:

```text
- routing
- role visibility
- access behavior
- critical dashboard/portal summary behavior
- shared helper formatting
```

For this UI-only polish phase, prefer lint/build plus focused self-review.

### Required verification

Run:

```bash
npm run lint
npm run build
git diff --check
```

### Conditional verification

Run only if touched logic/helpers/tests require it:

```bash
npm run test
```

### Optional targeted browser smoke

Run only if the shell, portal entry, or dashboard landing layout changed enough to justify it and the local environment is available:

```bash
npx playwright test tests/e2e/role-dashboards-smoke.spec.ts -g "school admin|teacher|parent|student"
```

or one focused dashboard/portal smoke that already exists.

Do not require full E2E by default:

```bash
npm run test:e2e
```

Do not run by default:

```text
supabase db reset
DB smoke SQL
schema type generation
full Playwright suite
```

Only run Supabase/DB checks if you unexpectedly change schema, seeds, or database-dependent logic. This phase should not require that.

---

## Self-Review Checklist

Before finalizing, perform a focused code review:

```text
- No schema or seed files changed.
- No Supabase config changed.
- No role/routing regression introduced.
- No business workflow changed.
- No broad client-component conversion.
- No new heavy dependency.
- No developer-facing copy remains in main shell/dashboard/portal surfaces.
- RTL layout remains correct.
- Sidebar/header do not overflow obviously.
- Mobile/tablet layout remains acceptable.
- Empty states are production-ready.
- Dashboard and portal landing pages remain role-aware.
- Integration placeholder copy remains product-facing if touched.
```

---

## Documentation Requirements

Update only the docs that need to reflect Phase 21 closure:

```text
docs/project-status.md
docs/project-phases.md
docs/testing.md
docs/verification-report.md
docs/ui-ux-role-roadmap.md
```

Docs must state:

- Phase 21 improved professional UI polish and shared design-system patterns.
- No business features were added.
- No schema changes were added.
- No RBAC/RLS was added.
- Verification used the minimal/high-value testing budget.
- Full E2E was not required unless actually run.
- Any skipped checks are documented honestly.

---

## Acceptance Criteria

Phase 21 is done when:

```text
- Dashboard shell looks more professional and cohesive.
- Portal shell/overview is visually consistent with the dashboard.
- Header, sidebar, and page headers are more polished.
- Shared cards and empty states look production-ready.
- Role-specific dashboards still render correctly.
- Parent/student portal overview still renders correctly.
- Arabic copy is polished and user-facing.
- No schema/seed/Supabase config changes were introduced.
- No new heavy UI dependency was introduced.
- Required verification passes: lint, build, diff-check.
- Tests/E2E are only run where useful and documented honestly.
```

---

## Commit Requirements

Before committing:

```bash
git status --short
git diff --check
```

Suggested commit message:

```text
style: polish professional ui design system
```

Final report must include:

```text
- changed files summary
- shell polish summary
- shared component polish summary
- dashboard/portal polish summary
- copy cleanup summary
- required verification results
- conditional test results if run
- skipped checks with reasons
- confirmation that no schema/seed/config changes were made
- commit hash if committed
- Go/No-Go for Phase 22 planning
```
