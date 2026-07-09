# Role-Aware UI/UX Roadmap

## Purpose

This document captures the recommended UI/UX correction roadmap after Phase 18. The goal is to move Ofuq from a feature-complete foundation into a role-aware, polished, demo-ready product experience.

The current project already has a strong technical foundation: authentication, fixed roles, tenant/school membership context, domain modules, local Syrian demo data, unit tests, DB smoke checks, and Playwright browser smoke. The next priority is not to add another business module. The next priority is to correct the end-user experience so every signed-in user sees a professional interface that matches their role.

## Current UX Problem

The current UI has three visible product issues:

1. All users are still routed into the dashboard experience after login, even when their role should use the parent/student portal.
2. The dashboard shell/sidebar is too broad and exposes navigation that does not match every staff role.
3. Some UI copy still looks like developer-facing placeholder text, such as wording about the dashboard being ready for Supabase Auth or Server Actions.

These issues make the product feel unfinished during a final presentation even though the underlying modules are present.

## Product Principle

The application should follow this rule:

> A user should only see the interface, navigation, summaries, and actions that belong to their current role.

This is a UI/UX requirement and a security-aligned requirement. Hiding UI is not a replacement for server-side authorization, but the interface must not invite users into pages or actions that are not relevant to them.

## Constraints To Preserve

The roadmap must preserve the current architecture rules:

- Use fixed roles from `user_memberships`; do not introduce full RBAC yet.
- Keep multi-tenant and school-scoped access derived from the authenticated membership context.
- Do not trust `tenant_id`, `school_id`, `role`, or `user_id` from client forms.
- Keep sensitive reads and mutations server-side.
- Avoid unrelated schema changes unless a specific phase requires them.
- Keep UI Arabic-first and RTL.
- Use existing Tailwind CSS, shadcn-style/Base UI primitives, Lucide icons, and optional subtle framer-motion.
- Do not add a heavy UI framework.
- Keep each phase small enough for Codex to implement and verify.

## Recommended Roadmap

The recommended plan is:

1. Phase 19 — Role-Aware UX Routing and Navigation Foundation
2. Phase 20 — Role-Specific Dashboards Foundation
3. Phase 21 — Professional UI Polish and Design System Pass
4. Phase 22 — Module UX Cleanup by Domain

This order is recommended because the first visible problem is not only visual quality. It is role experience. Parent, student, teacher, accountant, librarian, and admin users need different entry points and different navigation.

---

# Phase 19 — Role-Aware UX Routing and Navigation Foundation

## Suggested prompt file

```text
prompts/codex_19_role_aware_ux_routing_navigation_prompt.md
```

## Goal

Correct the post-login routing, dashboard access, and navigation visibility for every fixed role.

This phase should make the app feel role-aware before any visual redesign work begins.

## In Scope

- Redirect users to the correct landing area after login.
- Redirect `parent` and `student` users to `/portal` instead of `/dashboard`.
- Prevent `parent` and `student` users from using the dashboard shell.
- Pass the authenticated user/role into the dashboard sidebar.
- Filter dashboard navigation by role.
- Remove developer-facing copy from the shell/header/dashboard.
- Remove or replace badges such as `مرحلة التأسيس` in production-facing UI.
- Add role-routing and role-navigation tests.
- Update Playwright smoke tests to verify role-specific destinations.
- Update docs honestly.

## Out of Scope

- No full visual redesign.
- No new business module.
- No RBAC tables.
- No RLS.
- No new permissions system.
- No deep module page redesign.
- No schema changes unless strictly required.

## Role Landing Rules

| Role | Landing route |
| --- | --- |
| `system_admin` | `/dashboard` |
| `school_admin` | `/dashboard` |
| `teacher` | `/dashboard/teacher` if created in Phase 20, otherwise `/dashboard` with teacher-specific content later |
| `accountant` | `/dashboard/finance` or future `/dashboard/accountant` |
| `librarian` | `/dashboard/library` or future `/dashboard/librarian` |
| `parent` | `/portal` |
| `student` | `/portal` |

For Phase 19 only, it is acceptable to route staff to their strongest existing module route if role-specific dashboards are not created until Phase 20.

## Dashboard Access Rule

`app/(dashboard)/layout.tsx` should keep server-side protection and add role-aware redirection:

```text
parent/student -> redirect /portal
inactive membership -> no-access state
missing profile -> no-access state
admin/staff roles -> dashboard shell
```

## Sidebar Visibility Rules

The dashboard sidebar should be filtered by role.

| Role | Suggested visible areas |
| --- | --- |
| `system_admin` | All admin modules, settings, integrations |
| `school_admin` | All school modules, settings, integrations |
| `teacher` | Teacher home, timetable, attendance, grades, assigned students/classes, communication, limited reports |
| `accountant` | Finance, finance reports, limited student lookup, communication/announcements |
| `librarian` | Library, limited student lookup, communication/announcements, limited reports |
| `parent` | No dashboard sidebar; use `/portal` |
| `student` | No dashboard sidebar; use `/portal` |

## Copy Cleanup Rules

Remove or rewrite copy that sounds like an implementation note.

Examples to remove:

```text
بنية dashboard عربية جاهزة للربط مع Supabase Auth و Server Actions.
مرحلة التأسيس
لا توجد بيانات فعلية بعد
جاهز للمرحلة التالية
مكان ملخص
ستتصل هنا في المرحلة التالية
```

Production-ready replacements should sound like a real school system:

```text
مرحبًا بك في منصة أُفُق لإدارة المدرسة.
تابع أعمالك اليومية من مكان واحد.
آخر تحديثات المدرسة والمهام اليومية.
لا توجد سجلات مطابقة حاليًا.
```

## Suggested Implementation Files

```text
lib/auth/role-redirects.ts
lib/navigation/role-navigation.ts
components/app/app-shell.tsx
components/app/app-sidebar.tsx
components/app/app-header.tsx
app/(dashboard)/layout.tsx
lib/actions/auth.ts
config/navigation.ts
constants/routes.ts
```

## Suggested Tests

```text
tests/unit/role-redirects.test.ts
tests/unit/role-navigation.test.ts
tests/unit/navigation.test.ts
tests/e2e/role-routing-smoke.spec.ts
```

## E2E Acceptance Criteria

- Parent login lands on `/portal`.
- Student login lands on `/portal`.
- Parent/student cannot remain in dashboard shell.
- Accountant login does not show admissions, health, library administration, or admin settings unless explicitly allowed.
- Librarian login shows library and hides finance/admin settings.
- Teacher login shows teacher-relevant navigation and hides finance/settings/integrations.
- Admin login still sees the full dashboard.
- No developer-facing header text remains in the main dashboard shell.

## Verification Commands

```bash
npm run test
npm run lint
npm run build
npm run test:all
npm run test:e2e
git diff --check
```

Use `supabase status` and DB smoke when route behavior depends on local seeded users.

---

# Phase 20 — Role-Specific Dashboards Foundation

## Suggested prompt file

```text
prompts/codex_20_role_specific_dashboards_foundation_prompt.md
```

## Goal

Create meaningful dashboard landing pages for each staff role and improve the portal overview for parent/student roles.

The application should no longer show one generic dashboard with placeholder numbers. Each role should see useful summaries and quick links based on demo data.

## In Scope

- Admin dashboard summary.
- Teacher dashboard summary.
- Accountant dashboard summary.
- Librarian dashboard summary.
- Parent portal overview improvements.
- Student portal overview improvements.
- Server-side summary helpers scoped by role and membership.
- Reusable KPI/stat card components if needed.
- Tests for role dashboard data helpers.
- Playwright smoke updates for role dashboards.

## Out of Scope

- No major redesign of all module pages.
- No new business workflows.
- No new permissions system.
- No advanced analytics.
- No AI dashboard.
- No report builder.

## Suggested Routes

Option A: one route with role-aware content:

```text
/dashboard
```

Option B: dedicated staff landing pages:

```text
/dashboard/admin
/dashboard/teacher
/dashboard/accountant
/dashboard/librarian
```

The recommended option is Option A for simplicity if the current route structure should stay stable. Option B is cleaner if the team wants explicit role landing pages.

## Admin Dashboard Content

- Total active students.
- Attendance summary for today or recent sessions.
- Open complaints.
- Recent announcements/events.
- Finance balance summary.
- Quick actions for admissions, students, attendance, grades, finance, reports.

## Teacher Dashboard Content

- Today’s timetable slots.
- Assigned classes/subjects.
- Recent attendance sessions.
- Recent exams or grade-entry tasks.
- Teacher communication/messages.
- Quick links: attendance, grades, timetable.

## Accountant Dashboard Content

- Issued invoices count.
- Paid/partial/unpaid totals.
- Recent payments.
- Outstanding balances.
- Quick links: invoices, payments, discounts, finance reports.

## Librarian Dashboard Content

- Book catalog count.
- Available copies.
- Active loans.
- Overdue loans.
- Quick links: catalog, copies, loans.

## Parent Portal Overview Content

- Linked children.
- Attendance snapshot.
- Latest grades.
- Finance summary.
- Recent announcements.
- Timetable preview.

## Student Portal Overview Content

- Today’s timetable.
- Attendance snapshot.
- Latest grades.
- Active library loans.
- Recent announcements.

## Suggested Files

```text
lib/dashboard/admin-summary.ts
lib/dashboard/teacher-summary.ts
lib/dashboard/accountant-summary.ts
lib/dashboard/librarian-summary.ts
lib/portal/portal-summary.ts
components/dashboard/role-dashboard.tsx
components/dashboard/admin-dashboard.tsx
components/dashboard/teacher-dashboard.tsx
components/dashboard/accountant-dashboard.tsx
components/dashboard/librarian-dashboard.tsx
components/shared/stat-card.tsx
components/shared/kpi-grid.tsx
```

## Acceptance Criteria

- `/dashboard` no longer shows zero-value placeholder cards when demo data exists.
- Teacher sees teacher-relevant summaries.
- Accountant sees finance-focused summaries.
- Librarian sees library-focused summaries.
- Admin sees cross-school operational summaries.
- Parent/student portal overview feels like a real user home page.
- All summaries are scoped server-side by authenticated membership.

---

# Phase 21 — Professional UI Polish and Design System Pass

## Suggested prompt file

```text
prompts/codex_21_professional_ui_polish_design_system_prompt.md
```

## Goal

Make Ofuq look and feel like a polished SaaS product suitable for a final presentation, while preserving the existing architecture and UI primitives.

## In Scope

- Professional dashboard shell polish.
- Professional portal shell polish.
- Header cleanup.
- Sidebar spacing, grouping, and active states.
- Page headers and breadcrumbs.
- Better empty states.
- Better KPI/stat cards.
- Better module cards.
- Better table/toolbars patterns.
- Consistent Arabic production copy.
- Mobile/responsive navigation improvements.
- Optional subtle framer-motion transitions.

## Out of Scope

- No full rewrite.
- No heavy UI dependency.
- No switch away from Tailwind/shadcn-style/Base UI.
- No new business features.
- No schema changes.
- No visual regression system unless explicitly planned later.

## Design Direction

Use the existing brand palette:

```text
#0D1B3D  Navy
#0D7A7B  Teal
#C9A24B  Gold
#FFFFFF  White
```

The visual style should be:

- Arabic-first.
- RTL-native.
- Formal and educational.
- Premium but not overloaded.
- SaaS dashboard oriented.
- Clear enough for school staff, not only developers.

## Shared Components To Add Or Improve

```text
components/shared/page-shell.tsx
components/shared/page-section.tsx
components/shared/stat-card.tsx
components/shared/kpi-grid.tsx
components/shared/module-card.tsx
components/shared/data-toolbar.tsx
components/shared/role-aware-empty-state.tsx
components/shared/breadcrumbs.tsx
components/shared/quick-action-card.tsx
```

## Copy Rules

Avoid implementation language in production UI.

Avoid:

```text
placeholder
foundation
جاهز للربط
لاحقًا
لا توجد بيانات فعلية بعد
```

Prefer:

```text
لا توجد نتائج مطابقة حاليًا.
ابدأ بإضافة سجل جديد من الزر أعلاه.
تعرض هذه الصفحة ملخصًا لآخر بيانات المدرسة.
```

Integrations pages are the only exception where placeholder wording is intentional, but even there it should be phrased as product messaging:

```text
هذه الإعدادات محفوظة للتحضير للتكامل. لا يتم تنفيذ اتصال خارجي حاليًا.
```

## Acceptance Criteria

- The main app no longer feels like a scaffold.
- Header, sidebar, and page headers are consistent.
- Empty states are production-ready.
- Module overview pages use consistent cards and actions.
- Arabic copy is polished and user-facing.
- E2E smoke still passes.

---

# Phase 22 — Module UX Cleanup by Domain

## Suggested prompt files

This phase can be split into smaller domain-focused prompts:

```text
prompts/codex_22_academic_attendance_grades_ui_cleanup_prompt.md
prompts/codex_23_finance_library_communication_ui_cleanup_prompt.md
prompts/codex_24_portal_ui_cleanup_prompt.md
```

## Goal

Polish existing module pages without changing core business logic.

## Recommended Split

### 22A — Academic, Attendance, Grades, Timetable

- Improve academic overview.
- Improve attendance session pages.
- Improve manual/QR attendance UI.
- Improve grade entry pages.
- Improve report card display.
- Improve timetable slot list and creation flow.

### 22B — Finance, Library, Communication

- Improve invoice list/detail pages.
- Improve receipt/payment view.
- Improve fee/discount pages.
- Improve book catalog/copy/loan UI.
- Improve message inbox and announcement pages.
- Improve school events pages.

### 22C — Portal Polish

- Better student cards.
- Better parent child switcher.
- Student-only vs parent-only visibility cleanup.
- Better timetable preview.
- Better grades snapshot.
- Better attendance summary.
- Better finance summary for parents only.
- Better library and announcements views.

## Acceptance Criteria

- Each domain has consistent page structure.
- Important actions are visible but only to allowed roles.
- Read-only pages are clearly read-only without looking like developer placeholders.
- Lists and details use consistent Arabic labels and status badges.
- No major business logic regression.

---

# Alternative Plans Considered

## Plan A — Recommended: Role UX First, Then Dashboards, Then Polish

```text
19 Role-aware routing/navigation
20 Role dashboards
21 UI polish
22 Module cleanup
```

### Advantages

- Fixes the most visible user-experience bug first.
- Keeps changes small and testable.
- Works well with Codex phase prompts.
- Reduces risk of users seeing irrelevant modules.
- Improves demo credibility quickly.

### Disadvantages

- Requires several phases.
- Visual polish arrives after role routing is corrected.

This is the recommended plan.

## Plan B — Complete Redesign In One Phase

```text
19 Complete UI Redesign Pass
```

### Advantages

- Fast visual transformation.
- One large redesign diff.

### Disadvantages

- High risk.
- Hard to review.
- Easy to break tests and flows.
- May hide the role-navigation issue instead of solving it.

This plan is not recommended.

## Plan C — Portal First

```text
19 Parent/Student Portal Polish
20 Staff Dashboards
21 Admin UI Polish
```

### Advantages

- Useful if the final demo focuses mostly on parents and students.
- Improves the most public-facing experience quickly.

### Disadvantages

- Leaves staff dashboards and role navigation unresolved.
- Does not immediately fix staff role confusion.

This plan is acceptable only if the presentation prioritizes parent/student workflows.

## Plan D — Design System First

```text
19 Design System Components
20 Apply Shell Polish
21 Apply Module Polish
```

### Advantages

- Clean from an engineering perspective.
- Creates reusable components early.

### Disadvantages

- Does not fix incorrect role routing first.
- Can become a large refactor without immediate user benefit.

This plan is useful after Phase 19, not before it.

---

# Recommended Immediate Next Step

Create and execute:

```text
prompts/codex_19_role_aware_ux_routing_navigation_prompt.md
```

The next phase should not add a new module. It should correct the role-aware user experience.

## Phase 19 Done Criteria

Phase 19 should only close when all of the following are true:

- Login redirects users to role-appropriate destinations.
- `parent` and `student` users land on `/portal`.
- `parent` and `student` users cannot use dashboard shell navigation.
- Dashboard sidebar is role-filtered for staff users.
- Developer-facing copy is removed from the main dashboard shell and dashboard page.
- Staff roles do not see obviously unrelated modules in the sidebar.
- Unit tests pass.
- Lint passes.
- Build passes.
- Playwright role-routing smoke passes.
- Documentation is updated honestly.

## Suggested Verification Commands For Phase 19

```bash
supabase status
npm run test
npm run lint
npm run build
npm run test:all
npm run test:e2e
git diff --check
```

If local Supabase state is stale, run:

```bash
supabase db reset
```

Then rerun DB smoke and E2E checks.

---

# Final Recommendation

Proceed with:

```text
19 - Role-Aware UX Routing and Navigation Foundation
```

Then continue with:

```text
20 - Role-Specific Dashboards Foundation
21 - Professional UI Polish and Design System Pass
22 - Module UX Cleanup by Domain
```

This sequence gives Ofuq the best path from a technically complete foundation to a polished, role-aware SaaS product suitable for a final presentation.
