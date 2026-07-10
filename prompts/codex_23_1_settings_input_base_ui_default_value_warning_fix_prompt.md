# Codex Prompt — Phase 23.1 Hotfix: Settings Input Base UI Default Value Warning

## Mission

Fix the console warning that appears in the school settings pages when changing school display name, branding colors, or related settings.

Observed warning:

```text
Base UI: A component is changing the default value state of an uncontrolled FieldControl after being initialized. To suppress this warning opt to use a controlled FieldControl.
```

Known stack trace:

```text
at Input (components/ui/input.tsx)
at SchoolIdentityForm (app/(dashboard)/dashboard/settings/_components/settings-forms.tsx)
at SchoolSettingsPage (app/(dashboard)/dashboard/settings/school/page.tsx)
```

This is a small UI primitive hotfix. Do not expand scope.

---

## Root Cause

`components/ui/input.tsx` currently wraps Base UI `InputPrimitive`:

```tsx
import { Input as InputPrimitive } from "@base-ui/react/input"
```

The settings forms use normal server-action form inputs with `defaultValue`, for example:

```tsx
defaultValue={schoolDisplayName ?? ""}
defaultValue={branding.primary_color ?? ""}
defaultValue={branding.secondary_color ?? ""}
defaultValue={branding.accent_color ?? ""}
```

After a successful save and re-render, Base UI warns because its uncontrolled FieldControl default value changed after initialization.

For this app, the shadcn-compatible input primitive should behave like the native shadcn input and support server-action forms with `defaultValue` without requiring controlled React state.

---

## Scope

### In scope

- Replace the Base UI input primitive in `components/ui/input.tsx` with a native `<input>` element.
- Keep the exact public API of `Input` as `React.ComponentProps<"input">`.
- Keep existing styling/classes unchanged unless a tiny formatting change is required.
- Keep `data-slot="input"`.
- Remove the unused Base UI input import.
- Verify no `@base-ui/react/input` import remains.
- Manually smoke test settings pages where possible.

### Out of scope

- Do not rewrite settings forms to controlled inputs.
- Do not change Server Actions.
- Do not change validation.
- Do not change settings authorization.
- Do not change `tenant_id`, `school_id`, `role`, or user scoping.
- Do not change schema.
- Do not change seeds.
- Do not change Supabase config.
- Do not add new UI dependency.
- Do not modify unrelated Base UI components.
- Do not fix unrelated global lint issues.

---

## Required Code Change

Update:

```text
components/ui/input.tsx
```

Target implementation:

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```

Do not change `Textarea` or `NativeSelect`; they already use native controls and are not the source of this warning.

---

## Settings Pages To Smoke Test

After the change, test at least:

```text
/dashboard/settings/school
/dashboard/settings/branding
```

Actions to verify manually:

```text
- Change school display name.
- Save.
- Confirm no Base UI uncontrolled FieldControl warning appears.
- Change primary color.
- Change secondary color.
- Change accent color.
- Save.
- Confirm no Base UI uncontrolled FieldControl warning appears.
```

If local auth/demo environment is not available, document that manual browser smoke was skipped and explain why.

---

## Verification Commands

Required:

```bash
npm run build
git diff --check
```

Recommended targeted check:

```bash
rg "@base-ui/react/input" .
```

Expected result:

```text
No matches.
```

Lint rule:

```bash
npm run lint
```

If global lint fails because of pre-existing unrelated files such as `.codex/skills/**/*.cjs`, `components/ui/carousel.tsx`, or `hooks/use-mobile.ts`, run targeted ESLint on the touched file only and document the blocker honestly.

Targeted example:

```bash
npx eslint components/ui/input.tsx
```

Do not run full E2E, Supabase reset, DB smoke, or schema type generation for this hotfix.

---

## Skills Requirement

Use and report:

```text
Skills used:
- shadcn: used to restore the Input primitive to a shadcn-compatible native input pattern for server-action forms
- ui-ux-pro-max: used to keep the settings edit experience stable without adding controlled-form complexity
- migrate-radix-to-base: not needed because this hotfix does not touch Radix imports
```

Do not claim `migrate-radix-to-base` was used unless Radix imports are actually found and modified.

---

## Acceptance Criteria

This hotfix is complete when:

```text
- components/ui/input.tsx uses native <input>.
- @base-ui/react/input import is removed.
- Settings forms continue to use defaultValue normally.
- No settings Server Actions were changed.
- No authorization/scoping logic was changed.
- No schema/seed/Supabase config changes were made.
- npm run build passes.
- git diff --check passes.
- lint or targeted lint is documented.
- Manual settings smoke is passed or skipped with a clear reason.
- Final report includes the skills-used section.
```

---

## Suggested Commit Message

```text
fix: use native input for server action forms
```

---

## Final Report Template

Return a concise report with:

```text
Changed files:
- components/ui/input.tsx

Fix summary:
- Replaced Base UI InputPrimitive with a native input while preserving classes and props.
- Removed @base-ui/react/input import.
- Settings Server Action forms can keep using defaultValue without Base UI FieldControl warnings.

Verification:
- npm run build: passed/failed
- git diff --check: passed/failed
- rg "@base-ui/react/input" .: no matches / matches found
- npm run lint or targeted ESLint: passed/failed with reason
- Manual settings smoke: passed/skipped with reason

Constraints confirmation:
- No settings Server Actions changed.
- No schema/seed/Supabase config changes.
- No authorization/scoping changes.
- No new dependency.

Skills used:
- shadcn: ...
- ui-ux-pro-max: ...
- migrate-radix-to-base: ...

Commit hash: <hash or not committed>
Go/No-Go: Go if warning is fixed and build passes.
```
