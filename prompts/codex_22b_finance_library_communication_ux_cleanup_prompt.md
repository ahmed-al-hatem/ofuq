# Codex Prompt — Phase 22B: Finance / Library / Communication UX Cleanup

## Mission

Implement Phase 22B for Ofuq: **Finance / Library / Communication UX Cleanup**.

This is a focused UX cleanup phase for the finance, library, and communication areas. It should apply the professional design-system polish from Phase 21 and the modal-form pattern from Phase 21.5 while continuing the limited-scope cleanup style used in Phase 22A.

This phase is not a feature expansion phase. Improve existing pages, form placement, page hierarchy, Arabic copy, and quick create/edit UX without changing core business behavior.

## Current Context

- Phase 21 polished the app shell, shared cards, page headers, dashboard landing pages, and portal overview.
- Phase 21.5 added reusable modal form wrappers:
  - `components/shared/form-dialog.tsx`
  - `components/shared/form-sheet.tsx`
  - `components/shared/form-actions.tsx`
- Phase 21.5 already converted selected low-risk forms in Finance, Library, and Communication:
  - Finance manual payment form
  - Finance discount type form
  - Communication announcement form
  - Library book copy form
- Phase 22A applied the same modal-form pattern to Academic, Attendance, and Grades.

Phase 22B must not redo the Phase 21.5 conversions. It should build on them and clean surrounding pages in a limited, high-value way.

## Primary Rule

```text
Pages for complex views.
Dialogs/Sheets for quick create/edit forms.
```

Use:

- `FormDialog` for short quick forms.
- `FormSheet` for medium/long quick forms.
- Route pages for complex details, reports, table-heavy screens, and direct-link workflows.

---

## Hard Constraints

- No schema migrations.
- No seed changes.
- No Supabase config changes.
- No RBAC.
- No RLS.
- No real payment gateway integration.
- No real WhatsApp/SMS integration.
- No real webhook/external integration.
- No report builder.
- No AI/chatbot work.
- No change to financial calculations or payment semantics.
- No change to loan/return business semantics.
- No change to communication authorization rules.
- No custom modal primitives.
- No custom overlay/backdrop.
- No new UI dependency.
- Do not remove existing routes unless it is obviously safe.
- Do not move Server Actions into Client Components.
- Do not trust `tenant_id`, `school_id`, `role`, or `user_id` from client forms.
- Keep server-side authorization and validation intact.
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
- shadcn: used for Dialog/Sheet/Form/Button/Input/Select/Table patterns
- ui-ux-pro-max: used for Finance/Library/Communication UX cleanup, density, form placement, loading feedback, and Arabic RTL polish
- migrate-radix-to-base: not needed because no Radix imports were found
```

If Radix imports are discovered and touched, report:

```text
- migrate-radix-to-base: used to migrate touched Radix primitives to Base UI
```

If the final report does not include this section, the phase is incomplete.

---

## UI Components To Use

Use existing `components/ui` primitives and shared wrappers.

Required primitives when relevant:

```text
components/ui/dialog.tsx
components/ui/sheet.tsx
components/ui/drawer.tsx
components/ui/form.tsx
components/ui/input.tsx
components/ui/select.tsx
components/ui/textarea.tsx
components/ui/button.tsx
components/ui/table.tsx
components/ui/badge.tsx
components/ui/card.tsx
components/ui/separator.tsx
components/ui/popover.tsx
components/ui/calendar.tsx
```

Required shared wrappers when relevant:

```text
components/shared/form-dialog.tsx
components/shared/form-sheet.tsx
components/shared/form-actions.tsx
components/shared/page-shell.tsx
components/shared/page-section.tsx
components/shared/page-header.tsx
components/shared/empty-state.tsx
components/shared/status-badge.tsx
components/shared/stat-card.tsx
components/shared/kpi-grid.tsx
components/shared/summary-section-card.tsx
```

Do not create another modal system.

---

## In Scope

### Finance UX cleanup

Target existing finance pages and forms such as:

```text
finance overview
invoices
invoice details
payments
discounts
fee structures
fee items
student discounts if present
```

Potential improvements:

```text
- Improve invoices or payments list readability.
- Improve invoice detail actions while keeping invoice detail as a route.
- Improve discount/fee-structure pages after Phase 21.5.
- Add Dialog/Sheet placement for quick financial actions if not already applied.
- Improve empty states and Arabic descriptions.
- Improve financial status badges and action placement.
```

### Library UX cleanup

Target existing library pages and forms such as:

```text
library overview
book catalog
book copies
book loans
loan details if present
student loan history if present
```

Potential improvements:

```text
- Improve catalog or copies page hierarchy.
- Improve loans page readability.
- Add Dialog/Sheet placement for add book/copy/loan/return notes where safe.
- Improve loan status badges.
- Improve empty states for catalog, copies, and loans.
```

### Communication UX cleanup

Target existing communication pages and forms such as:

```text
communication overview
messages
announcements
events
notifications
notification logs
```

Potential improvements:

```text
- Improve announcement page after Phase 21.5.
- Improve messages or events page hierarchy.
- Convert message/event quick create to Sheet/Dialog where safe.
- Improve audience/status badges.
- Improve empty states and Arabic copy.
```

---

## Out of Scope

```text
- No complete redesign of every finance/library/communication page.
- No conversion of every form.
- No new finance workflows.
- No real online payment.
- No invoice PDF implementation unless already present and only lightly linked.
- No real external messaging provider.
- No real notifications gateway.
- No new library reservation workflow.
- No new database tables or columns.
- No full Playwright suite.
- No tests for every visual component.
```

---

## Scope Limit

Keep the phase controlled.

Implement only:

```text
- 2 or 3 clear Finance UX improvements
- 2 clear Library UX improvements
- 1 or 2 clear Communication UX improvements
```

Total expected impact:

```text
5 to 7 visible UX improvements
```

Do not attempt to clean the entire project in one pass.

---

## Dialog / Sheet / Route Decision Rules

### Use `FormDialog` when

```text
- The form is short.
- The action is quick create/edit.
- The form has roughly 6 fields or fewer.
- The user should remain on the current list/context page.
- The workflow is not multi-step.
```

Examples:

```text
add discount
add book copy
simple announcement update
small return note
small fee item form if available
```

### Use `FormSheet` when

```text
- The form is longer.
- The form benefits from extra width.
- The form has grouped fields.
- The user may need to keep the list context visible.
```

Examples:

```text
record payment
create book loan
create internal message
create school event
create fee structure if already implemented
```

### Keep route pages when

```text
- The page is a detail view.
- The page contains a large table.
- The page contains filters/tabs.
- The page is a report.
- The workflow is multi-step.
- Direct linking is useful.
```

Examples:

```text
invoice detail
payment receipt detail
financial report detail
book detail
loan detail
message detail
notification log page
```

---

## Implementation Plan

### 1. Audit first

Inspect existing routes and forms under:

```text
app/(dashboard)/dashboard/finance
app/(dashboard)/dashboard/library
app/(dashboard)/dashboard/communication
components/shared
components/ui
lib/finance
lib/library
lib/communication
```

Find:

```text
- Current create/edit routes.
- Current forms and Server Actions.
- Forms already converted in Phase 21.5.
- Repeated page structures.
- Candidate short forms for Dialog.
- Candidate longer forms for Sheet.
- Complex pages that must remain routes.
- Scaffold/developer-facing copy.
- Any Radix imports in touched surfaces.
```

### 2. Select limited candidates

Choose the safest 5 to 7 visible UX improvements.

Document selected candidates in the final report.

Prefer low-risk conversions that reuse existing form components and Server Actions.

Avoid touching financial calculations, payment state semantics, or library loan business rules.

### 3. Reuse modal-form pattern

For selected forms:

```text
- Add `surface = "card" | "plain"` support if the existing form is currently card-only.
- Add `cancelSlot?: ReactNode` when needed.
- Use `FormDialog` or `FormSheet` from `components/shared`.
- Use `FormActions` for save/cancel/pending buttons.
- Keep existing Server Actions.
- Keep server-side validation.
- Keep existing routes as fallback when removal is risky.
```

### 4. Clean list/page UI

For selected pages:

```text
- Use `PageShell` and `PageSection` where appropriate.
- Keep `PageHeader` consistent.
- Place quick actions in `PageHeader.actions` or a clear section.
- Use `EmptyState` for no records.
- Use `StatusBadge` or `Badge` for statuses.
- Improve table/card spacing without rewriting data logic.
- Add "open full page" fallback link where keeping the route is useful.
```

### 5. Arabic copy cleanup

Avoid copy that sounds like a scaffold.

Avoid:

```text
placeholder
foundation
جاهز للربط
لاحقًا
لا توجد بيانات فعلية بعد
ستتصل هنا
```

Prefer:

```text
لا توجد نتائج مطابقة حاليًا.
ابدأ بإضافة سجل جديد من الزر أعلاه.
تعرض هذه الصفحة ملخصًا لآخر بيانات المدرسة.
راجع الحقول ثم حاول الحفظ مرة أخرى.
فتح الصفحة الكاملة
```

### 6. Preserve behavior

Do not change business outcomes.

Allowed:

```text
- Move an existing form into Dialog/Sheet.
- Add a fallback link to the full page.
- Improve labels, descriptions, empty states, and action placement.
- Extract repeated presentational structure.
```

Not allowed:

```text
- Change payment calculations.
- Change invoice/payment state semantics.
- Change loan issue/return rules.
- Change message/announcement access rules.
- Change database mutations.
- Change validation semantics.
- Add new workflow state.
- Add new tables or columns.
```

---

## Suggested Candidate Set

Use this set only if it matches the current code and is low-risk:

```text
Finance:
- Improve invoices or payments page with PageShell/PageSection and production EmptyState.
- Keep invoice detail as route and improve quick payment action placement.
- Improve discounts or fee structures page using Phase 21.5 modal pattern.

Library:
- Improve catalog or copies page hierarchy and empty states.
- Improve loans page with clearer loan status badges and quick issue/return placement.

Communication:
- Improve announcements page after Phase 21.5.
- Improve messages or events page with Dialog/Sheet quick create if already implemented.
```

If current code differs, choose equivalent low-risk candidates and document the reason.

---

## UI/UX Requirements

Every selected modal/sheet form must have:

```text
- Arabic title.
- Short Arabic description.
- Arabic field labels.
- Arabic validation messages where currently available.
- Clear save button.
- Clear cancel button.
- Pending/loading label.
- Responsive layout.
- No obvious overflow on mobile.
- Dialog backdrop/dimmed page using existing DialogOverlay.
```

Suggested labels:

```text
حفظ
إلغاء
جاري الحفظ...
حفظ التغييرات
إنشاء
إضافة
فتح الصفحة الكاملة
تسجيل دفعة
إضافة نسخة
إصدار إعارة
إرسال رسالة
```

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

If global lint fails because of unrelated existing files such as `.codex/skills`, `components/ui/carousel.tsx`, or `hooks/use-mobile.ts`, run targeted ESLint on changed TypeScript/TSX files and document the global lint blocker honestly.

### Conditional

Run only if server logic, validation, routing, role checks, or helpers changed:

```bash
npm run test
```

### Optional targeted browser smoke

Run only if local environment is available and it is quick:

```text
- Open one finance/library/communication page.
- Open one Dialog or Sheet.
- Confirm fields are visible.
- Confirm overlay/dimmed background exists for Dialog.
- Confirm cancel/close works.
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
- Phase 22B cleaned Finance/Library/Communication UX.
- Phase 21.5 modal-form pattern was applied.
- Short create/edit forms use Dialog/Sheet.
- Complex details/reports remain route pages.
- No schema/seed/Supabase config changes were made.
- Verification used the minimal/high-value testing budget.
- Global lint blockers, if any, are unrelated and documented.
```

---

## Self-Review Checklist

Before finalizing:

```text
- Only 5 to 7 focused UX improvements were made.
- No custom modal/overlay/backdrop was created.
- `components/ui` and `components/shared` wrappers were used.
- Dialog forms dim the background through existing DialogOverlay.
- Complex pages remain routes.
- Old routes remain where deleting them is risky.
- Server Actions remain server-side.
- Client forms do not provide trusted tenant/school/user/role scope.
- No financial calculation semantics changed.
- No loan/return rules changed.
- No communication authorization semantics changed.
- No schema/seed/config files changed.
- No new dependency added.
- Arabic copy is production-facing.
- RTL layout remains correct.
- Required verification was run or blockers documented honestly.
- Skills usage is documented.
```

---

## Acceptance Criteria

Phase 22B is complete when:

```text
- Finance pages are more consistent and professional.
- Library pages are easier to operate.
- Communication pages are clearer and more consistent.
- 5 to 7 visible UX improvements are implemented.
- Selected short forms use Dialog/Sheet from existing components.
- No custom modal primitives are introduced.
- Complex flows remain routes.
- No business logic changes were made.
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
style: cleanup finance library communication ux
```

Final report must include:

```text
- changed files summary
- selected Finance improvements
- selected Library improvements
- selected Communication improvements
- forms converted to Dialog/Sheet
- routes kept as full-page fallbacks
- confirmation that components/ui and shared modal wrappers were used
- confirmation that no custom modal/overlay/backdrop was created
- confirmation that no schema/seed/config changes were made
- Skills used section
- build/diff-check/lint or targeted lint results
- skipped checks with reasons
- commit hash if committed
- Go/No-Go for Phase 22C planning
```
