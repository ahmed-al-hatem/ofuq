# Codex Prompt — Phase 22A: Academic / Attendance / Grades UX Cleanup

## Mission

Implement Phase 22A for Ofuq: **Academic / Attendance / Grades UX Cleanup**.

This is a focused UX cleanup phase for the academic, attendance, and grades areas. It should apply the professional design-system polish from Phase 21 and the modal-form pattern from Phase 21.5 to a limited number of high-value academic workflows.

This phase is not a feature expansion phase. It should improve existing pages, forms, layout density, Arabic copy, and quick create/edit UX without changing core business behavior.

## Current Context

- Phase 21 polished the app shell, shared cards, page headers, dashboard landing pages, and portal overview.
- Phase 21.5 added reusable modal form wrappers:
  - `components/shared/form-dialog.tsx`
  - `components/shared/form-sheet.tsx`
  - `components/shared/form-actions.tsx`
- Phase 21.5 established the product rule:

```text
Pages for complex views.
Dialogs/Sheets for quick create/edit forms.
```

Phase 22A must reuse that rule for Academic, Attendance, and Grades.

## Primary Goal

Improve the user experience and visual consistency of existing pages in:

```text
Academic
Attendance
Grades
Report Cards where relevant
Timetable-related academic views only if directly related and low-risk
```

Focus on:

```text
- Page hierarchy
- Form placement
- Dialog/Sheet quick forms
- Empty states
- Card/table consistency
- Action buttons
- Arabic copy
- RTL-friendly layout
- Keeping complex pages as routes
```

---

## Hard Constraints

- No schema migrations.
- No seed changes.
- No Supabase config changes.
- No RBAC.
- No RLS.
- No new business module.
- No new timetable generation algorithm.
- No advanced report-card/PDF generation.
- No advanced analytics/charts.
- No full workflow rewrite.
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
- ui-ux-pro-max: used for module UX cleanup, density, form placement, loading feedback, and Arabic RTL polish
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
components/shared/stat-card.tsx
components/shared/kpi-grid.tsx
components/shared/summary-section-card.tsx
```

Do not create another modal system.

---

## In Scope

### Academic UX cleanup

Target existing academic pages and forms such as:

```text
academic years
terms
quarters
classes
grade levels
subjects
class enrollments
teacher subject assignments if present
```

Potential quick forms:

```text
create academic year
create term/quarter
create grade level
create class/section
create subject
assign subject to grade
assign teacher to subject
```

### Attendance UX cleanup

Target existing attendance pages and forms such as:

```text
attendance sessions
attendance records
manual attendance
QR attendance entry pages
absence excuses
```

Potential quick forms:

```text
create attendance session
record absence/delay note
submit absence excuse if staff-facing exists
approve/reject excuse with note
```

### Grades UX cleanup

Target existing grades pages and forms such as:

```text
exams
exam results
grade entries
report cards/snapshots
teacher remarks if present
```

Potential quick forms:

```text
create exam
enter one quick grade
edit one grade
add teacher remark
create report-card snapshot if already implemented
```

---

## Out of Scope

```text
- No complete redesign of every academic page.
- No conversion of every form.
- No business workflow changes.
- No new grading calculations.
- No new attendance policy logic.
- No timetable algorithm.
- No report-card PDF generation.
- No new database tables or columns.
- No new permissions model.
- No full Playwright suite.
- No tests for every visual component.
```

---

## Scope Limit

Keep the phase controlled.

Implement only:

```text
- 2 or 3 clear Academic UX improvements
- 1 or 2 clear Attendance UX improvements
- 1 or 2 clear Grades UX improvements
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
create subject
create grade level
add absence note
enter one grade
add teacher remark
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
create exam
create attendance session
create class/section
assign subject to multiple grade levels if already supported
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
class detail
student academic record
exam detail
report card detail
attendance session detail
large grade-entry table
```

---

## Implementation Plan

### 1. Audit first

Inspect existing routes and forms under:

```text
app/(dashboard)/dashboard/academic
app/(dashboard)/dashboard/attendance
app/(dashboard)/dashboard/grades
app/(dashboard)/dashboard/timetable
components/shared
components/ui
lib/academic
lib/attendance
lib/grades
```

Find:

```text
- Current create/edit routes.
- Current forms and Server Actions.
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

### 3. Reuse modal-form pattern

For selected forms:

```text
- Add `surface = "card" | "plain"` style support if the existing form is currently card-only.
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
- Use `PageShell` and `PageSection` where already appropriate.
- Keep `PageHeader` consistent.
- Place quick actions in `PageHeader.actions` or a clear section.
- Use `EmptyState` for no records.
- Use `Badge` for statuses.
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
- Change database mutations.
- Change role access rules.
- Change validation semantics.
- Add new workflow state.
- Add new tables or columns.
```

---

## Suggested Candidate Set

Use this set only if it matches the current code and is low-risk:

```text
Academic:
- Subject form as Dialog.
- Class/section form as Sheet.
- Academic lists use PageSection and production EmptyState.

Attendance:
- Attendance session creation as Sheet.
- Absence excuse action/note as Dialog if available.

Grades:
- Exam creation as Sheet.
- Quick grade/remark form as Dialog if already implemented.
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

If global lint fails because of unrelated existing files such as `.codex/skills`, run targeted ESLint on changed TypeScript/TSX files and document the global lint blocker honestly.

### Conditional

Run only if server logic, validation, routing, role checks, or helpers changed:

```bash
npm run test
```

### Optional targeted browser smoke

Run only if local environment is available and it is quick:

```text
- Open one Academic/Attendance/Grades page.
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
- Phase 22A cleaned Academic/Attendance/Grades UX.
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
- No schema/seed/config files changed.
- No new dependency added.
- Arabic copy is production-facing.
- RTL layout remains correct.
- Required verification was run or blockers documented honestly.
- Skills usage is documented.
```

---

## Acceptance Criteria

Phase 22A is complete when:

```text
- Academic pages are more consistent and professional.
- Attendance pages are clearer and easier to operate.
- Grades pages are easier to scan and use.
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
style: cleanup academic attendance grades ux
```

Final report must include:

```text
- changed files summary
- selected Academic improvements
- selected Attendance improvements
- selected Grades improvements
- forms converted to Dialog/Sheet
- routes kept as full-page fallbacks
- confirmation that components/ui and shared modal wrappers were used
- confirmation that no custom modal/overlay/backdrop was created
- confirmation that no schema/seed/config changes were made
- Skills used section
- build/diff-check/lint or targeted lint results
- skipped checks with reasons
- commit hash if committed
- Go/No-Go for Phase 22B planning
```
