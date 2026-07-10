# Codex Prompt — Phase 22C: Portal UX Cleanup

## Mission

Implement Phase 22C for Ofuq: **Portal UX Cleanup**.

This is a focused UX cleanup phase for the parent/student portal. It should improve readability, mobile usability, hierarchy, empty states, and read-only clarity across the existing `/portal` surfaces.

This phase must keep the portal read-only. Do not add create/edit/delete flows, mutations, administrative actions, or dashboard-style operational complexity.

## Current Context

- Phase 21 polished the app shell and shared design-system components.
- Phase 21.5 introduced modal form UX foundations for dashboard quick forms.
- Phase 22A cleaned Academic / Attendance / Grades dashboard UX.
- Phase 22B cleaned Finance / Library / Communication dashboard UX.
- Phase 22C is different: it targets the parent/student portal, not staff dashboard workflows.

Portal rule:

```text
Portal = Read-only
```

The portal should feel calm, clear, family/student-oriented, and easy to read on mobile.

---

## Primary Goal

Improve the existing parent/student portal UX across:

```text
/portal
/portal/students
/portal/students/[studentId]
/portal/attendance
/portal/grades
/portal/finance
/portal/library
/portal/announcements
/portal/profile
```

Focus on:

```text
- Portal overview clarity
- Child/student cards
- Student details sections
- Attendance/grades readability
- Finance/library read-only summaries
- Announcements/profile empty states
- Arabic production copy
- Mobile-friendly spacing and stacking
- Read-only cues
```

---

## Hard Constraints

- Portal remains read-only.
- No create/edit/delete actions inside portal.
- No new mutation Server Actions.
- No new client-side write logic.
- No forms for saving data.
- No schema migrations.
- No seed changes.
- No Supabase config changes.
- No authorization model changes.
- No linked-student scoping changes unless fixing an obvious bug.
- No business logic changes.
- No dashboard links added to portal unless an existing route already intentionally supports it; prefer not to add dashboard links.
- No payment gateway or real payment flow.
- No chatbot.
- No AI.
- No report builder.
- No custom modal/overlay/backdrop.
- No new UI dependency.
- Keep Arabic-first RTL UI.
- Keep tests minimal and high-value only.

---

## Required Skill Usage

Before implementing UI changes, explicitly use and follow these available UI skills:

```text
- shadcn
- ui-ux-pro-max
- migrate-radix-to-base only if Radix imports are found
```

The final report must include:

```text
Skills used:
- shadcn: used for Card/Badge/Table/Button/Tabs/Accordion patterns
- ui-ux-pro-max: used for portal readability, mobile layout, read-only cues, density, and Arabic RTL polish
- migrate-radix-to-base: not needed because no Radix imports were found
```

If Radix imports are discovered and touched, report:

```text
- migrate-radix-to-base: used to migrate touched Radix primitives to Base UI
```

If the final report does not include this section, the phase is incomplete.

---

## UI Components To Use

Use existing `components/ui` primitives and shared components.

Recommended primitives:

```text
components/ui/card.tsx
components/ui/badge.tsx
components/ui/table.tsx
components/ui/button.tsx
components/ui/separator.tsx
components/ui/tabs.tsx if present and useful
components/ui/accordion.tsx if useful for mobile sections
```

Recommended shared components:

```text
components/shared/page-shell.tsx
components/shared/page-section.tsx
components/shared/page-header.tsx
components/shared/empty-state.tsx
components/shared/status-badge.tsx
components/shared/stat-card.tsx
components/shared/kpi-grid.tsx
components/shared/summary-section-card.tsx
```

Avoid dashboard-only patterns that make the portal feel too operational.

Do not use these unless there is a purely read-only filter case and it is clearly justified:

```text
components/shared/form-dialog.tsx
components/shared/form-sheet.tsx
components/shared/form-actions.tsx
```

Most portal work should not need modal form wrappers.

---

## In Scope

### Portal overview

Target:

```text
app/(portal)/portal/page.tsx
components/portal/portal-overview.tsx
```

Potential improvements:

```text
- Clearer hero/summary section.
- Better parent/student greeting.
- More readable child/student cards.
- Simpler KPIs for attendance, grades, finance balance, library loans, announcements.
- Clear quick links to portal pages.
- A calm read-only notice.
```

### Student pages

Target:

```text
app/(portal)/portal/students/page.tsx
app/(portal)/portal/students/[studentId]/page.tsx
components/portal/*student* if present
```

Potential improvements:

```text
- More structured student identity card.
- Better academic/class/status badges.
- Sections for attendance, grades, finance, library, announcements where already available.
- Better empty states.
```

### Attendance and grades

Target:

```text
app/(portal)/portal/attendance/page.tsx
app/(portal)/portal/grades/page.tsx
```

Potential improvements:

```text
- Clearer attendance status presentation.
- Better badges for present/absent/late/excused states.
- More readable grades/results cards or tables.
- Better grouping by student, subject, exam, or term when current data supports it.
```

### Finance and library

Target:

```text
app/(portal)/portal/finance/page.tsx
app/(portal)/portal/library/page.tsx
```

Potential improvements:

```text
- Clearer invoice/payment/balance read-only summaries.
- No payment action.
- Better loan/overdue presentation.
- More helpful empty states for no invoices or no loans.
```

### Announcements and profile

Target:

```text
app/(portal)/portal/announcements/page.tsx
app/(portal)/portal/profile/page.tsx
```

Potential improvements:

```text
- More polished announcement cards.
- Better audience/date/status badges.
- Better profile layout.
- Clear message that profile data is managed by the school when relevant.
```

---

## Out of Scope

```text
- No portal mutations.
- No absence excuse submission unless it already exists and is intentionally in scope; do not add it in this phase.
- No online payment.
- No message sending from portal.
- No complaint submission.
- No chatbot.
- No AI Query.
- No report builder.
- No new portal modules.
- No new database fields.
- No new access model.
- No full E2E requirement.
- No visual regression system.
- No tests for every presentational component.
```

---

## Scope Limit

Keep this phase controlled.

Implement only:

```text
5 to 7 visible UX improvements
```

Suggested distribution:

```text
- 2 improvements in portal overview.
- 1 or 2 improvements in student details.
- 1 improvement in attendance/grades.
- 1 improvement in finance/library.
- 1 improvement in announcements/profile.
```

Do not attempt to polish every portal page deeply in one pass.

---

## Portal UX Rules

Portal pages should be:

```text
- Read-only.
- Arabic-first.
- RTL-native.
- Mobile-friendly.
- Less dense than dashboard pages.
- Family/student oriented.
- Clear in empty states.
- Free from administrative create/edit/delete actions.
```

Avoid:

```text
إنشاء
تعديل
حذف
حفظ
إرسال
اعتماد
رفض
تسجيل دفعة
```

Unless the action already exists as an intentionally supported portal read/write workflow, do not add it in Phase 22C.

Prefer copy like:

```text
هذه البيانات للعرض فقط ويتم تحديثها من قبل المدرسة.
لا توجد سجلات متاحة حاليًا.
تابع حضور الطالب ونتائجه من مكان واحد.
يعرض هذا القسم آخر البيانات المتاحة من المدرسة.
```

---

## Implementation Plan

### 1. Audit first

Inspect:

```text
app/(portal)/portal
components/portal
lib/portal
config/portal-navigation.ts
components/shared
components/ui
```

Find:

```text
- Most visible portal pages.
- Existing repeated layout patterns.
- Weak empty states.
- Tables/cards that do not stack well on mobile.
- Copy that sounds too administrative.
- Any buttons that imply create/edit/delete.
- Any accidental dashboard navigation exposure.
- Any Radix imports in touched surfaces.
```

### 2. Select 5 to 7 improvements

Choose the safest, most visible improvements.

Document selected improvements in the final report.

Suggested set if it matches the current code:

```text
1. Improve portal overview hero/summary.
2. Improve child/student cards.
3. Improve student detail sections.
4. Improve attendance status presentation.
5. Improve grades/results readability.
6. Improve finance/library read-only summary.
7. Improve announcements/profile empty states.
```

If current code differs, choose equivalent low-risk portal improvements and document the reason.

### 3. Preserve read-only behavior

Do not add:

```text
- Server Actions mutations.
- Client save forms.
- Create/edit/delete buttons.
- Payment submission.
- Message sending.
- Dashboard administrative links.
```

Allowed:

```text
- Read-only filters if already present and safe.
- Links between portal read-only pages.
- Better cards/tables/badges/empty states.
- Better summaries using existing server-side data.
```

### 4. Improve mobile layout

Portal should prioritize phones.

Pay attention to:

```text
- Card stacking.
- Table overflow.
- Line length.
- Font sizes.
- Touch target spacing.
- Clear navigation links.
- Avoiding dashboard-level density.
```

### 5. Keep server-side scoping

Do not loosen access checks.

All portal data must remain scoped by authenticated linked student context.

Do not accept trusted scope from client props/forms.

---

## Testing Budget Rule

Keep verification minimal and high-value.

### Required

Run:

```bash
npm run build
git diff --check
```

### Required if many TS/TSX files are touched

Run:

```bash
npm run lint
```

If global lint fails because of unrelated existing files such as `.codex/skills`, `components/ui/carousel.tsx`, or `hooks/use-mobile.ts`, run targeted ESLint on changed TypeScript/TSX files and document the blocker honestly.

### Conditional

Run only if portal server helpers, role/access logic, linked-student scoping, routing, or data helpers changed:

```bash
npm run test
```

### Optional targeted browser smoke

Run only if local environment is available and it is quick:

```text
- parent login opens /portal
- student login opens /portal
- no dashboard navigation appears
- portal remains read-only
```

Do not require by default:

```text
npm run test:e2e
supabase db reset
DB smoke SQL
schema type generation
visual regression tests
```

---

## Documentation Requirements

Update only relevant docs:

```text
docs/project-status.md
docs/project-phases.md
docs/testing.md
docs/verification-report.md
docs/ui-ux-role-roadmap.md
```

Docs must state:

```text
- Phase 22C cleaned the parent/student portal UX.
- Portal remained read-only.
- No portal mutations were added.
- No schema/seed/Supabase config changes were made.
- No business logic or authorization changes were made.
- Verification used the minimal/high-value testing budget.
- Global lint blockers, if any, are unrelated and documented.
```

---

## Self-Review Checklist

Before finalizing:

```text
- Only 5 to 7 focused UX improvements were made.
- No create/edit/delete actions were added to portal.
- No new mutation Server Actions were added.
- No payment action was added.
- No message/complaint submission was added.
- No dashboard administrative links were added.
- Portal data remains server-scoped to authenticated linked students.
- No schema/seed/config files changed.
- No new dependency added.
- Arabic copy is family/student-facing.
- RTL layout remains correct.
- Mobile layout is acceptable.
- Empty states are production-ready.
- Required verification was run or blockers documented honestly.
- Skills usage is documented.
```

---

## Acceptance Criteria

Phase 22C is complete when:

```text
- Portal overview is clearer and more professional.
- Student cards/details are easier to read.
- Attendance/grades are easier to scan.
- Finance/library read-only summaries are clearer.
- Announcements/profile pages have better hierarchy and empty states.
- 5 to 7 visible UX improvements are implemented.
- Portal remains read-only.
- No create/edit/delete actions are added.
- No mutation Server Actions are added.
- No schema/seed/Supabase config changes were made.
- Build passes.
- diff-check passes.
- lint or targeted lint is documented.
- Skills used section exists in the final report.
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
style: cleanup portal ux
```

Final report must include:

```text
- changed files summary
- selected portal improvements
- read-only confirmation
- confirmation that no portal mutations were added
- confirmation that no dashboard/admin links were added
- confirmation that linked-student scoping was preserved
- confirmation that no schema/seed/config changes were made
- Skills used section
- build/diff-check/lint or targeted lint results
- skipped checks with reasons
- commit hash if committed
- Go/No-Go for next phase planning
```
