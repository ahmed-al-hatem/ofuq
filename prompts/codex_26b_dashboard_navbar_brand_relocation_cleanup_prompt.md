# Phase 26B - Dashboard Navbar Brand Relocation Cleanup

## Goal

Apply a second dashboard shell cleanup based on the latest screenshot and Phase 26A result.

The current dashboard still shows:

- A large dashboard content hero/card titled `لوحة تشغيل المدرسة`.
- A compact Ofuq logo/brand block at the top of the sidebar.
- A navbar label `مساحة التشغيل`.

The requested UI should be simpler:

- Remove the large content hero/card from `/dashboard`.
- Remove the Ofuq logo block from the sidebar.
- Put the Ofuq logo and platform name inside the top navbar where `مساحة التشغيل` currently appears.
- Remove the exact text `مساحة التشغيل`.
- Keep the sidebar navigation starting directly with `لوحة التحكم`.
- Preserve the full-width navbar behavior introduced in Phase 26A.

## Scope

This is a UI/layout cleanup only.

Do not change:

- Authentication logic.
- User session logic.
- Role-based navigation filtering.
- Routes.
- Supabase logic.
- Dashboard business data queries.
- Internal chat logic.
- Gemini assistant logic.
- Portal layout unless a shared component requires a safe adjustment.

## Important Existing Context

Phase 26A already changed the dashboard shell so:

- `AppHeader` is rendered above the shell grid.
- The navbar spans the full viewport width.
- The large old dashboard intro strip in the header was removed.
- The sidebar has a compact Ofuq wordmark area.
- The first sidebar group label was removed from navigation config.
- The user identity block in the header is more compact.

Phase 26B should build on that state and remove the remaining elements marked in the latest screenshot.

## Required Changes

### 1. Remove the large dashboard content hero

Remove the large content card/hero inside the dashboard page that contains text similar to:

- `لوحة تشغيل المدرسة`
- `تعرض هذه الصفحة ملخصًا لأهم بيانات المدرسة والمهام التي تستحق المتابعة خلال اليوم.`

This block should not render on `/dashboard` after this phase.

Do not hide it with CSS only. Remove it from the rendered structure if possible.

The KPI cards should move upward naturally after removing this block.

### 2. Remove the sidebar logo block

Remove the compact Ofuq logo/brand block currently displayed at the top of the sidebar.

After the full-width navbar, the sidebar content should start directly with the first navigation item:

- `لوحة التحكم`

Do not leave a large empty gap above it.

Keep sidebar spacing professional and compact.

### 3. Move brand into the navbar

In the top navbar/header, replace the text:

- `مساحة التشغيل`

with a compact brand area containing:

- Ofuq logo/icon if available and suitable.
- Platform name:
  - `Ofuq`
  - `أُفُق`

Preferred visual:

- Located where `مساحة التشغيل` currently appears.
- Aligned correctly for RTL.
- Compact enough for a 56px-64px navbar.
- No large card.
- No long description.
- No duplicated brand in the sidebar.

If `public/logo.png` exists and is suitable, it may be used only if it is committed or intentionally added in this phase. If it is untracked locally, do not rely on it unless you intentionally add it to the repo and document that decision.

If no committed image logo is available, use the existing text/icon brand that was previously used in the sidebar.

Do not introduce a new dependency.

### 4. Remove `مساحة التشغيل`

The exact text `مساحة التشغيل` must not appear in the dashboard navbar after this change.

Search the codebase for this string and remove/replace it only where it belongs to the dashboard shell label.

### 5. Keep user identity compact

Keep the current compact user block from Phase 26A:

- display name / role name
- email
- role badge
- logout button

Do not increase its height.

If the user identity still looks too tall, reduce only vertical padding and gaps safely.

Suggested target:

- `text-sm` for name.
- `text-xs` for email.
- `truncate` for long email.
- small vertical padding.

## Expected Files to Inspect

Inspect the actual implementation first. Likely files include:

- `components/app/app-shell.tsx`
- `components/app/app-header.tsx`
- `components/app/app-sidebar.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/*`
- `config/navigation.ts`

Only modify files necessary for this cleanup.

## Design Constraints

- Arabic RTL must remain correct.
- Use existing Tailwind tokens and Ofuq colors.
- Keep shadcn/Base UI style consistency.
- Do not introduce new UI libraries.
- Do not add animations.
- Do not change brand colors.
- Do not remove navigation items.
- Do not change role-based navigation filtering.
- Do not change dashboard data cards or counts.

## Acceptance Criteria

- The large content card titled `لوحة تشغيل المدرسة` is removed from `/dashboard`.
- The Ofuq logo block at the top of the sidebar is removed.
- The sidebar first visible item is `لوحة التحكم` directly.
- The navbar contains the Ofuq logo/name where `مساحة التشغيل` used to be.
- The exact text `مساحة التشغيل` is removed from the dashboard navbar.
- The navbar still spans the full viewport width.
- The user/logout area remains working and compact.
- Role-aware navigation is unchanged.
- No auth, data, chat, or assistant logic changes.
- RTL layout remains correct.
- No hydration mismatch warnings are introduced.

## Verification

Because the previous report mentioned a generated `.next/dev/types/routes.d.ts` error, clean generated Next files before build.

PowerShell:

```powershell
Remove-Item -Recurse -Force .next
```

Bash:

```bash
rm -rf .next
```

Then run:

```bash
npm run build
git diff --check
```

Run targeted lint on touched files, for example:

```bash
npx eslint components/app app/\(dashboard\)/dashboard config/navigation.ts
```

If global lint fails because of unrelated pre-existing files, document it and run targeted lint on touched files only.

Manual browser smoke:

- Open `/dashboard`.
- Confirm the navbar spans full width.
- Confirm the navbar shows Ofuq/أُفُق brand instead of `مساحة التشغيل`.
- Confirm the sidebar starts directly with `لوحة التحكم`.
- Confirm the large `لوحة تشغيل المدرسة` hero/card is gone.
- Confirm the user identity and logout still work visually.

## Commit Message

```bash
style: relocate dashboard brand into navbar
```

## Out of Scope

Do not implement any of the following in this phase:

- New dashboard widgets.
- New navigation items.
- Portal shell redesign.
- Chat changes.
- Gemini assistant changes.
- Database or migration changes.
- Auth/session changes.
- RLS changes.
