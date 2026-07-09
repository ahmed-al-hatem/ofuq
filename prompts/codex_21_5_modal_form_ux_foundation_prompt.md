# Codex Prompt — Phase 21.5: Modal Form UX Foundation

## Mission

Implement Phase 21.5 for Ofuq: **Modal Form UX Foundation**.

This is a small UX foundation phase before Phase 22. The goal is to establish a professional, reusable pattern for quick create/edit forms using the existing shadcn/Base UI components in `components/ui`.

The app currently has many flows that can feel more professional as dialogs, sheets, or drawers instead of separate pages for every short form. This phase should create the pattern and apply it to a limited number of low-risk examples only.

## Primary Rule

```text
Pages for complex views.
Dialogs/Sheets for quick create/edit forms.
```

Use:

- `Dialog` for short forms.
- `Sheet` or `Drawer` for longer forms.
- Route pages for complex details, reports, multi-step workflows, and table-heavy screens.

## Hard Constraints

- Use existing components from `components/ui`.
- Do not build custom modal primitives.
- Do not build custom overlays.
- Do not build custom backdrops.
- Do not add a new UI library.
- Do not introduce Radix primitives.
- Use Base UI/shadcn-style components already in the project.
- Use `DialogOverlay`/existing overlay behavior so the page behind the modal is dimmed.
- Keep Arabic-first RTL UI.
- Keep forms accessible and keyboard-friendly.
- Keep Server Actions and server-side validation.
- Do not move sensitive mutations into Client Components.
- Do not trust `tenant_id`, `school_id`, `role`, or `user_id` from the client.
- Do not change schema.
- Do not change seeds.
- Do not change Supabase config.
- Do not change business logic unless a tiny adapter is required to reuse an existing Server Action safely.
- Do not convert the whole project in this phase.
- Do not broaden tests unnecessarily.

## Required Skill Usage

Before implementing UI changes, explicitly use the available UI skills:

```text
- shadcn
- migrate-radix-to-base only if Radix imports are found
```

The final report must include a small section:

```text
Skills used:
- shadcn: used for Dialog/Form/Button/Input/Select patterns
- migrate-radix-to-base: not needed because no Radix imports were found
```

or, if Radix imports are discovered:

```text
Skills used:
- shadcn: used for Dialog/Form/Button/Input/Select patterns
- migrate-radix-to-base: used to migrate discovered Radix primitives to Base UI
```

If this section is missing, the phase is incomplete.

---

## UI Components To Use

Use existing files from:

```text
components/ui/dialog.tsx
components/ui/sheet.tsx
components/ui/drawer.tsx
components/ui/form.tsx
components/ui/input.tsx
components/ui/select.tsx
components/ui/textarea.tsx
components/ui/button.tsx
components/ui/popover.tsx
components/ui/calendar.tsx
components/ui/badge.tsx
components/ui/card.tsx
components/ui/separator.tsx
```

Use `Dialog` for short forms with dimmed background.

Use `Sheet`/`Drawer` for forms that need more horizontal or vertical space.

Do not create a different modal system.

---

## In Scope

- Audit quick create/edit forms and candidate routes.
- Create shared modal-form patterns.
- Create shared form action/footer pattern.
- Apply the pattern to 3 or 4 low-risk forms only.
- Preserve current Server Actions and validation.
- Improve Arabic labels and button copy.
- Ensure the background is dimmed while a dialog is open.
- Document the Dialog/Sheet/Route decision rules.

## Out of Scope

- No full module UX cleanup.
- No conversion of every form.
- No route deletion unless obviously unused and safe.
- No schema migrations.
- No seed updates.
- No Supabase config changes.
- No full E2E requirement.
- No unit tests for simple presentational modal wrappers.
- No visual regression system.
- No new dependency.

---

## Conversion Rules

### Convert to Dialog when

```text
- The form is short.
- The action is quick create/edit.
- The form does not need a large table.
- The workflow has no multi-step process.
- The user should return to the same context after saving.
```

Examples:

```text
- Add announcement
- Add payment
- Add book copy
- Add note
- Create simple attendance session
- Add simple grade entry
```

### Convert to Sheet/Drawer when

```text
- The form has more than 6 fields.
- The form benefits from extra width.
- The form has small sections.
- The user needs to review related context while editing.
```

### Keep as route page when

```text
- Student full profile/details
- Invoice detail
- Report card detail
- Detailed report page
- Large settings page
- Multi-step workflow
- Table-heavy page
- Page with tabs and complex filters
```

---

## Shared Components To Add

Create only if useful and not already present:

```text
components/shared/form-dialog.tsx
components/shared/form-sheet.tsx
components/shared/form-actions.tsx
```

### `FormDialog`

Expected capabilities:

```text
- Trigger area or trigger button support.
- Dialog title.
- Dialog description.
- Children form body.
- Footer support.
- Close/cancel behavior.
- Size variants if needed.
- RTL-friendly layout.
```

It should compose `components/ui/dialog.tsx`, not replace it.

### `FormSheet`

Expected capabilities:

```text
- Trigger area or trigger button support.
- Sheet title.
- Sheet description.
- Children form body.
- Footer support.
- Responsive max width.
- RTL-friendly layout.
```

It should compose `components/ui/sheet.tsx` or `components/ui/drawer.tsx`, not replace them.

### `FormActions`

Expected capabilities:

```text
- Save button.
- Cancel button.
- Pending/loading label.
- Disabled state.
- Optional destructive mode.
```

Arabic labels:

```text
حفظ
إلغاء
جاري الحفظ...
حفظ التغييرات
```

---

## Candidate Forms

Start with an audit and choose 3 or 4 low-risk examples from existing implemented modules.

Preferred candidates if available and safe:

```text
1. Finance payment form
2. Library loan form
3. Announcement create/edit form
4. Attendance session create form or Grade entry quick form
```

If these exact candidates are not structured in a way that can be safely converted in this phase, choose equivalent short create/edit forms and document the choice.

Do not force conversion where it risks breaking business logic.

---

## Implementation Steps

### 1. Audit first

Inspect current module pages and forms.

Find:

```text
- Existing create/edit routes.
- Existing form components.
- Existing Server Actions.
- Existing validation schemas.
- Existing buttons or links that navigate to form pages.
- Existing `components/ui` primitives.
```

Also search for Radix imports:

```text
@radix-ui
Radix
```

If Radix imports are found, use `migrate-radix-to-base` only for the touched UI surface. Do not run a broad migration.

### 2. Build the shared modal-form pattern

Create or update:

```text
components/shared/form-dialog.tsx
components/shared/form-sheet.tsx
components/shared/form-actions.tsx
```

These are composition wrappers around `components/ui`, not new primitives.

### 3. Apply to limited forms

Apply to 3 or 4 selected short forms.

For each selected form:

```text
- Keep the existing Server Action.
- Keep server-side validation.
- Keep role/server authorization.
- Replace quick navigation with a Dialog/Sheet trigger where appropriate.
- Keep the old route if deleting it is risky.
- Use Arabic labels and validation messages.
- Ensure cancel/close works.
- Ensure the backdrop dims the page.
```

### 4. Do not delete routes aggressively

If an old route is linked from multiple places or may be useful for direct access, keep it for now.

Phase 22 can do deeper route cleanup by domain.

### 5. Documentation

Update relevant docs with the new decision rule:

```text
Quick create/edit forms should use Dialog or Sheet from components/ui.
Complex details, reports, and multi-step workflows remain route pages.
```

---

## UI/UX Requirements

Modal forms must be:

```text
- RTL native.
- Arabic-labeled.
- Keyboard accessible through the underlying UI primitive.
- Clear title and description.
- Clear close button.
- Clear cancel button.
- Clear save button.
- Safe loading/pending state.
- Responsive on small screens.
- Not wider than needed.
- Visually consistent with Phase 21 polish.
```

The page behind `Dialog` must be dimmed. Use the existing overlay from `components/ui/dialog.tsx`.

Suggested copy:

```text
حفظ
إلغاء
جاري الحفظ...
تم حفظ البيانات بنجاح.
تعذر حفظ البيانات، يرجى مراجعة الحقول والمحاولة مرة أخرى.
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

### Required when many TS/TSX files are touched

Run:

```bash
npm run lint
```

If global lint fails because of unrelated `.codex/skills` files, run targeted ESLint on changed TypeScript/TSX files and document the global lint blocker honestly.

### Conditional

Run only if logic/helpers/actions changed:

```bash
npm run test
```

### Optional targeted browser smoke

Run only if the local environment is available and the selected form can be checked quickly:

```bash
npx playwright test <existing-targeted-spec>
```

or a tiny targeted smoke that verifies one modal:

```text
- trigger opens dialog
- dialog fields are visible
- backdrop exists/dims page
- cancel/close works
```

Do not require:

```text
- full npm run test:e2e
- supabase db reset
- DB smoke SQL
- schema type generation
- tests for every visual component
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
- Phase 21.5 added a modal form UX foundation.
- Short create/edit flows should use Dialog/Sheet from components/ui.
- Complex details/reports remain route pages.
- No schema/seed/Supabase config changes were made.
- Verification used the minimal/high-value testing budget.
- Skills used were documented.
```

---

## Self-Review Checklist

Before finalizing:

```text
- No custom modal primitives were created.
- No custom overlay/backdrop was created.
- Dialog/Sheet/Drawer came from components/ui.
- Background is dimmed behind Dialog.
- Forms are Arabic and RTL-friendly.
- Server Actions remain server-side.
- Sensitive scope is not accepted from the client.
- No schema/seed/config changes.
- No route deletion unless clearly safe.
- No new dependency.
- No broad tests were added.
- Existing role-aware navigation remains intact.
```

---

## Acceptance Criteria

Phase 21.5 is complete when:

```text
- A reusable modal form pattern exists.
- Existing components/ui primitives are used.
- Dialog backdrop dims the page.
- 3 or 4 low-risk quick forms use the pattern.
- Complex flows remain route pages.
- Business logic and Server Actions are preserved.
- No schema/seed/config changes were made.
- Build passes.
- diff-check passes.
- lint or targeted lint is documented.
- Skills usage is documented in the final report.
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
feat: add modal form ux foundation
```

or, if mostly visual composition:

```text
style: add modal form ux foundation
```

Final report must include:

```text
- changed files summary
- selected forms converted
- shared modal pattern summary
- confirmation that components/ui were used
- confirmation that no custom modal/overlay was created
- confirmation that background dimming uses existing DialogOverlay
- Skills used section
- verification results
- skipped checks with reasons
- confirmation that no schema/seed/config changes were made
- commit hash if committed
- Go/No-Go for Phase 22A planning
```
