# Phase 26A - Dashboard Shell Navbar Sidebar Layout Cleanup

## Objective

Clean up the dashboard shell layout based on the reviewed screenshot and user feedback.

The current dashboard has duplicated branding and oversized shell elements. The goal is to simplify the dashboard layout while keeping the existing RTL Arabic design system, authentication, role-aware navigation, and dashboard behavior intact.

## Scope

This is a UI/layout cleanup phase only.

Do not change:

- Auth logic
- Login/logout behavior
- `getAuthenticatedUser`
- Role-based access rules
- Navigation filtering by role
- Dashboard business queries
- Supabase schema, migrations, or seeds
- Chat logic
- Gemini assistant logic
- Portal logic unless a shared shell component requires a safe non-breaking adjustment

## Visual Requirements

### 1. Remove the large dashboard intro strip

Remove the large red-marked intro strip inside the main dashboard content/header area.

It contains copy similar to:

- `إدارة المدرسة اليومية من واجهة عربية واضحة ومباشرة.`
- `تابع الملخصات والتنبيهات والوحدات المتاحة لدورك الحالي من مكان واحد.`

Requirements:

- Remove it from the rendered structure, not only by hiding with CSS.
- Keep the main dashboard page header/card that says `لوحة تشغيل المدرسة` if it belongs to the page content.
- Do not remove page-specific headings or KPI cards.

### 2. Remove the large sidebar brand/profile card

Remove the large red-marked card at the top of the sidebar that currently contains:

- `Ofuq`
- `أُفُق`
- Role badge such as `مدير النظام`
- Platform badge such as `منصة تشغيل`
- Long descriptive text such as `تنقل بين الوحدات المتاحة لدورك الحالي...`

Replace it with a compact logo area only.

Expected sidebar top:

- Ofuq logo/wordmark at the very top of the sidebar.
- No large card background.
- No long descriptive text.
- No extra role/platform badges inside the logo area.

### 3. Remove sidebar section heading

Remove the red-marked sidebar section label:

- `التشغيل اليومي`

After the logo, the first visible navigation item must be:

- `لوحة التحكم`

Requirements:

- No large vertical gap between logo and first nav item.
- Do not remove the actual navigation items.
- Do not change route paths.

### 4. Make the header/navbar span full viewport width

Refactor the dashboard shell so the top navbar/header spans the full screen width.

Expected layout:

- A full-width top header/navbar across the entire viewport.
- The user identity area and logout button remain in the top header.
- Below the header, render the sidebar and main dashboard content.
- RTL alignment must remain correct.
- The sidebar should visually start below or align cleanly under the full-width header, depending on the existing shell structure.

Do not create duplicate headers.

### 5. Move logo to the top of the sidebar

The sidebar must start with the Ofuq logo/wordmark at the top.

Requirements:

- Logo appears before all navigation links.
- The first nav item under the logo is `لوحة التحكم`.
- Use existing brand assets/components if available.
- If no logo asset exists yet, keep the current textual Ofuq/أُفُق mark but render it compactly.
- Do not add new image assets in this phase unless a logo asset already exists in `public`.

Suggested visual target:

- Sidebar logo area height around `56px` to `72px`.
- Compact padding.
- No description paragraph.

### 6. Make user identity block more compact

The yellow-marked top header user block currently has too much height.

It contains values like:

- `مشرف النظام`
- `system.admin@ofuq.local`

Make it shorter and visually lighter.

Requirements:

- Reduce vertical padding.
- Reduce gap between display name/role and email.
- Use `text-sm` for name/role.
- Use `text-xs` for email.
- Use `truncate` for long email.
- Keep role badge if currently useful, but make it compact.
- Keep logout button accessible and unchanged functionally.
- Target height around `40px` to `48px` where practical.

## Expected Files to Inspect

Search for the real dashboard shell components before editing. Likely files include one or more of:

- `components/layout/app-shell.tsx`
- `components/layout/app-sidebar.tsx`
- `components/layout/app-header.tsx`
- `components/dashboard/app-shell.tsx`
- `app/(dashboard)/dashboard/layout.tsx`
- `config/navigation.ts`
- `lib/navigation/role-navigation.ts`

Only modify files necessary for this shell cleanup.

## Design Constraints

- Preserve Arabic RTL layout.
- Preserve Ofuq colors and Tailwind tokens.
- Preserve shadcn/Base UI style consistency.
- Do not introduce new UI libraries.
- Do not add animations unless the shell already uses them.
- Do not change brand colors.
- Do not remove navigation links.
- Do not change role-based navigation filtering.
- Do not change dashboard data cards, counts, or business logic.
- Do not change Chat or Gemini Assistant behavior.

## Responsive Behavior

Ensure the layout remains usable on:

- Desktop wide screens.
- Medium screens.
- Mobile if the existing dashboard shell supports it.

The sidebar and full-width header must not overlap content unexpectedly.

## Acceptance Criteria

- The red-marked content intro strip is removed.
- The red-marked large sidebar brand/profile card is removed.
- The red-marked `التشغيل اليومي` heading is removed.
- The header/navbar spans the full viewport width.
- The sidebar starts with the compact Ofuq logo/wordmark.
- The first sidebar item directly under the logo is `لوحة التحكم`.
- The yellow-marked user identity block is visibly shorter and compact.
- Logout still works.
- Role-aware navigation still works.
- Dashboard content still loads normally.
- No auth, data, chat, or assistant behavior changes.
- No hydration mismatch warnings are introduced.

## Verification

Run:

```bash
npm run build
git diff --check
```

Run targeted ESLint on touched layout files. Example:

```bash
npx eslint components app/\(dashboard\)/dashboard config lib/navigation
```

If global lint fails because of unrelated pre-existing files, document the failure and run targeted lint on touched files only.

Manual browser smoke:

1. Open `/dashboard` as `system.admin@ofuq.local`.
2. Confirm the top header spans the full width.
3. Confirm the large intro strip is gone.
4. Confirm the large sidebar card is gone.
5. Confirm the sidebar starts with the logo.
6. Confirm `لوحة التحكم` is the first sidebar item under the logo.
7. Confirm the user identity block is compact.
8. Confirm navigation still works.

## Documentation

Update only if relevant:

- `docs/project-status.md`
- `docs/verification-report.md`
- `docs/demo-readiness.md`

Keep the documentation update brief and focused on this UI shell cleanup.

## Commit Message

Use:

```bash
style: clean up dashboard shell navbar sidebar layout
```
