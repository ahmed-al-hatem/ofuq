# Phase 26C - Portal Shell Navbar Sidebar Cleanup

## Goal

Clean up the Parent/Student Portal shell based on the latest screenshot.

The portal currently still contains duplicated/large blocks:

- A large portal header area with intro text.
- A large content hero card titled `بوابة المتابعة`.
- A large Ofuq branding card at the top of the sidebar.
- Sidebar section label `بوابة المتابعة` above the first navigation item.
- A visually heavy user identity block in the top header.

The requested final layout:

- Navbar/header spans the full viewport width.
- Navbar starts with the Ofuq logo/mark inside the navbar.
- Navbar shows the platform name and portal title: `Ofuq | أُفُق` and `بوابة ولي الأمر والطالب`.
- Remove the large red-marked blocks from the portal shell and portal overview.
- Sidebar starts directly with the first navigation item: `الرئيسية`.
- Keep logout and role information accessible, but compact.

## Scope

This is a UI/layout cleanup only.

Do not change:

- Authentication or redirects
- `getAuthenticatedUser`
- Portal access checks
- Role-based portal navigation filtering
- Routes
- Supabase queries
- Portal summary/business data
- Chat
- Gemini assistant
- Database schema or migrations

## Current Files to Inspect

The current implementation likely involves:

- `components/portal/portal-shell.tsx`
- `components/portal/portal-header.tsx`
- `components/portal/portal-sidebar.tsx`
- `components/portal/portal-overview.tsx`
- `config/portal-navigation.ts`
- `app/(portal)/portal/page.tsx`

Use the actual code structure and modify only files necessary for this cleanup.

## Required Changes

### 1. Make PortalHeader full-width

Refactor the portal shell so the top navbar/header spans the entire viewport width, similar to the cleaned dashboard shell pattern.

Expected structure:

- Top-level shell container
- `PortalHeader` rendered above the sidebar/content grid
- Below the header: sidebar + main content grid

Do not keep `PortalHeader` constrained only to the main content column.

### 2. Move brand into the navbar

The navbar should start, in RTL, with a compact brand area containing:

- Ofuq logo/mark if available
- `Ofuq`
- `أُفُق`
- `بوابة ولي الأمر والطالب`

Use the existing app config values where suitable:

- `appConfig.name`
- `appConfig.arabicName`

If `public/logo.png` exists and is suitable, it may be used. Otherwise use the current icon/text brand style without adding dependencies.

Keep it compact and suitable for a 56px–64px navbar.

### 3. Remove the large PortalHeader intro copy

Remove the red-marked intro text below the navbar content, including text similar to:

- `بوابة متابعة منظمة لآخر الحضور والدرجات والرسائل المدرسية.`
- `تعرض هذه المساحة السجلات المرتبطة بحسابك داخل المدرسة الحالية دون أي إجراءات تعديل أو إدخال.`

Also remove the separator used only for that intro block.

Do not hide it with CSS only; remove it from the rendered structure.

### 4. Compact/remove the heavy user identity block

The current user card is visually heavy and is marked for cleanup.

Required behavior:

- Do not render a large user identity card.
- Keep role badge and logout button accessible.
- If user name is retained, render it as a very compact text line or small pill.
- Use smaller text, reduced padding, and truncation.
- Do not show the long sentence `قراءة السجلات المسموح بها فقط` as a large block.

Suggested target:

- role badge: small rounded pill
- user name/email: optional, truncated, text-xs/text-sm
- logout button: compact rounded outline button

### 5. Remove the large sidebar brand card

Remove the large Ofuq card at the top of `PortalSidebar`, including:

- Ofuq / أُفُق brand card
- `بوابة المتابعة` badge
- `وصول مقيد` badge
- Long descriptive paragraph

After the global navbar, the sidebar should begin directly with navigation.

### 6. Remove sidebar group label above first item

Remove the sidebar section label:

- `بوابة المتابعة`

The first visible sidebar item must be:

- `الرئيسية`

No large vertical gap should remain above it.

If `portalNavigation` requires group labels for other groups, either:

- Make the first group label optional/empty and render labels conditionally, or
- Adjust only the first group so its label is not shown.

Do not remove navigation items.

### 7. Remove the large portal overview hero card

Remove the large content hero/page header in `/portal` that contains:

- `بوابة المتابعة`
- `ملخص يومي لمتابعة الأبناء والحضور والدرجات والفواتير ضمن المدرسة الحالية.`
- `عرض فقط` badge

This is currently likely rendered through `PageHeader` inside `components/portal/portal-overview.tsx`.

After removing it, the content cards such as `هذه البيانات للعرض فقط`, `نظرة سريعة`, and KPI cards should move upward naturally.

Do not remove actual portal summary cards or business data.

### 8. Keep responsive behavior

The cleaned layout must remain usable on:

- Desktop
- Tablet
- Mobile

For mobile:

- Header may wrap gracefully.
- Sidebar may remain stacked as currently implemented if that is the existing pattern.
- Avoid horizontal overflow.

## Design Constraints

- Keep RTL Arabic layout.
- Use existing Tailwind tokens and Ofuq colors.
- Keep shadcn/Base UI visual consistency.
- Do not introduce new UI libraries.
- Do not add animations unless already used in these components.
- Do not change brand colors.
- Do not change portal navigation routes or access logic.

## Acceptance Criteria

- The portal navbar spans the full viewport width.
- The navbar starts with Ofuq logo/brand inside the navbar.
- The navbar displays `بوابة ولي الأمر والطالب`.
- The large header intro text is removed.
- The heavy user identity block is removed or reduced to a compact navbar item.
- The large Ofuq card at the top of the sidebar is removed.
- The sidebar starts directly with `الرئيسية`.
- The sidebar label `بوابة المتابعة` above `الرئيسية` is removed.
- The large page hero `بوابة المتابعة` in `/portal` is removed.
- Portal cards and summaries remain intact.
- Logout still works.
- Portal role/access behavior remains unchanged.
- No auth, data, chat, assistant, or database changes.
- No hydration mismatch warnings are introduced.

## Verification

Clean generated Next cache first if previous generated-route type errors appear:

```powershell
Remove-Item -Recurse -Force .next
```

Then run:

```bash
npm run build
git diff --check
```

Run targeted lint on touched files, for example:

```bash
npx eslint components/portal app/\(portal\)/portal config/portal-navigation.ts
```

If global lint fails because of unrelated pre-existing files, document it and run targeted lint on touched files only.

Manual smoke:

- Login as `parent.hassan@ofuq.local`.
- Open `/portal`.
- Confirm navbar full width.
- Confirm navbar starts with Ofuq brand and `بوابة ولي الأمر والطالب`.
- Confirm sidebar starts with `الرئيسية`.
- Confirm removed intro/hero blocks no longer appear.
- Confirm logout button still works.

## Commit Message

```bash
style: clean up portal shell navbar sidebar layout
```
