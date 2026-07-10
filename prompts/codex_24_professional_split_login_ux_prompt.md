# Phase 24 - Professional Split Login UX

## Goal

Build a professional, modern Arabic RTL login experience for Ofuq with clear audience-based entry paths:

- `/login` as an authentication chooser page.
- `/login/staff` for staff, administration, teachers, accountants, and librarians.
- `/login/portal` for parents and students.
- `/login/reset-password` as UI-only reset password request screen.

This phase is primarily UI/UX polish and route organization. It must not change the core authentication/security model.

## Current Context

The current application has a single `/login` page that renders `LoginForm`.

The current login Server Action already performs the important secure behavior:

- validates email/password on the server;
- signs in using Supabase Auth;
- loads user profile and primary membership;
- redirects by the real database role through `getDefaultRouteForRole(membership.role)`.

Keep this role-based redirect behavior. The new staff/portal split is UI guidance only and must not become a trusted authorization source.

## Required Outcome

After this phase:

- `/login` shows a polished account-type chooser.
- `/login/staff` shows a professional staff login screen.
- `/login/portal` shows a calmer parent/student portal login screen.
- `/login/reset-password` shows a UI-only password reset request form.
- Google login buttons exist as UI only.
- No real Google OAuth is enabled.
- No real password reset email is sent.
- `signInWithEmail` remains the only real email/password login Server Action.
- Existing role redirect behavior remains unchanged.

## In Scope

- Improve login UI to professional dashboard/SaaS quality.
- Split login UX into staff and portal entry routes.
- Add UI-only Google continuation buttons.
- Add UI-only reset password request page.
- Reuse existing shadcn/Base-compatible UI components.
- Create small auth-specific components if useful.
- Update `constants/routes.ts` with new auth routes.
- Keep Arabic-first, RTL-native copy.
- Keep mobile responsiveness strong.
- Update lightweight documentation after implementation.

## Out of Scope

- No real Google OAuth.
- No Supabase OAuth provider configuration.
- No OAuth callback route.
- No Google client/environment setup.
- No real reset password email.
- No `resetPasswordForEmail` unless explicitly approved later.
- No OTP.
- No SMS.
- No schema migrations.
- No seed changes.
- No Supabase config changes.
- No changes to role redirect logic.
- No changes to authorization/scoping.
- No new dependencies.
- No heavy animation libraries beyond existing project dependencies.

## Routes

### Existing route to keep

```ts
login: "/login"
```

### Add these routes

Update `constants/routes.ts`:

```ts
loginStaff: "/login/staff",
loginPortal: "/login/portal",
loginResetPassword: "/login/reset-password",
```

Do not remove or rename existing routes.

## Page Requirements

### 1. `/login` - Login Audience Chooser

Transform `/login` into a polished chooser page.

It should include:

- Ofuq identity and Arabic name.
- Clear title: `اختر طريقة الدخول`.
- Clear description: `حدّد نوع حسابك للانتقال إلى تجربة الدخول المناسبة.`
- Two large cards:
  - `لوحة الموظفين والإدارة` → `/login/staff`
  - `بوابة الطالب وولي الأمر` → `/login/portal`
- A link back to `/`.
- Short trust/security notes.
- Modern layout with RTL spacing, good mobile stacking, and brand-colored accents.

Suggested staff card copy:

```text
لوحة الموظفين والإدارة
للمدراء والمعلمين والمحاسبين وأمناء المكتبة.
```

Suggested portal card copy:

```text
بوابة الطالب وولي الأمر
لمتابعة الحضور والدرجات والإعلانات والمالية.
```

### 2. `/login/staff` - Staff Login

Create:

```text
app/(auth)/login/staff/page.tsx
```

Audience:

- system_admin
- school_admin
- teacher
- accountant
- librarian

Important: this is UI copy only. Do not enforce role from the client route.

Suggested title:

```text
تسجيل دخول الموظفين
```

Suggested description:

```text
ادخل إلى لوحة التحكم لإدارة العمليات المدرسية حسب صلاحيات دورك.
```

The page should include:

- Professional auth shell.
- Email/password login form.
- Submit label: `الدخول إلى لوحة التحكم`.
- UI-only Google button: `المتابعة باستخدام Google`.
- Link: `نسيت كلمة المرور؟` → `/login/reset-password`.
- Link to portal login: `دخول الطالب وولي الأمر`.
- Explanation that the system redirects based on the real account role after login.

### 3. `/login/portal` - Parent/Student Portal Login

Create:

```text
app/(auth)/login/portal/page.tsx
```

Audience:

- parent
- student

Important: this is UI copy only. Do not enforce role from the client route.

Suggested title:

```text
دخول الطالب وولي الأمر
```

Suggested description:

```text
تابع البيانات المدرسية المرتبطة بك ضمن بوابة عرض آمنة ومبسطة.
```

The page should include:

- Calmer family/student-oriented auth shell.
- Email/password login form.
- Submit label: `الدخول إلى البوابة`.
- UI-only Google button: `المتابعة باستخدام Google`.
- Link: `نسيت كلمة المرور؟` → `/login/reset-password`.
- Link to staff login: `دخول الموظفين والإدارة`.
- Reminder that the portal is read-only.

### 4. `/login/reset-password` - UI-only Reset Password

Create:

```text
app/(auth)/login/reset-password/page.tsx
```

This screen is UI only for now.

It should include:

- Email input.
- Button: `إرسال رابط إعادة التعيين`.
- Inline success/info message on submit without calling a server action.
- Message explaining that email sending will be enabled later.
- Back links to staff and portal login.

Suggested title:

```text
إعادة تعيين كلمة المرور
```

Suggested description:

```text
أدخل بريدك الإلكتروني، وسنرسل لك تعليمات إعادة التعيين عند تفعيل خدمة البريد.
```

Do not call Supabase reset password APIs in this phase.

## Component Structure

Prefer creating small auth-specific components under:

```text
app/(auth)/login/_components
```

Suggested components:

```text
app/(auth)/login/_components/auth-shell.tsx
app/(auth)/login/_components/login-card.tsx
app/(auth)/login/_components/google-login-button.tsx
app/(auth)/login/_components/reset-password-card.tsx
```

You may keep `app/(auth)/login/login-form.tsx` and make it configurable, or move/re-export it if the structure stays clean.

Recommended configurable login form API:

```tsx
<LoginForm
  audience="staff"
  title="تسجيل دخول الموظفين"
  description="ادخل إلى لوحة التحكم لإدارة العمليات المدرسية حسب صلاحيات دورك."
  submitLabel="الدخول إلى لوحة التحكم"
  googleLabel="المتابعة باستخدام Google"
  alternateHref={appRoutes.loginPortal}
  alternateLabel="دخول الطالب وولي الأمر"
/>
```

and:

```tsx
<LoginForm
  audience="portal"
  title="دخول الطالب وولي الأمر"
  description="تابع البيانات المدرسية المرتبطة بك ضمن بوابة عرض آمنة ومبسطة."
  submitLabel="الدخول إلى البوابة"
  googleLabel="المتابعة باستخدام Google"
  alternateHref={appRoutes.loginStaff}
  alternateLabel="دخول الموظفين والإدارة"
/>
```

Important:

- `audience` is only for copy, styling, and labels.
- Never trust `audience` in server logic.
- Never send `audience` as an authorization input.

## Google Button UI-only Behavior

Add a polished Google button.

Label:

```text
المتابعة باستخدام Google
```

Behavior options:

Preferred:

- Button is enabled.
- It does not submit the login form.
- It shows an inline info message:

```text
تسجيل الدخول عبر Google غير مفعّل في النسخة المحلية، وسيتم تفعيله عند إعداد مزود OAuth.
```

Alternative:

- Button is disabled with a clear note.

Do not implement OAuth.

## Reset Password UI-only Behavior

The reset-password form should be client-side only.

When the user submits an email:

- Validate only basic non-empty/email shape if simple.
- Show an info/success panel.
- Do not call a Server Action.
- Do not call Supabase.
- Do not send email.

Suggested success message:

```text
واجهة إعادة التعيين جاهزة للربط بخدمة البريد. لم يتم إرسال بريد فعلي في النسخة المحلية.
```

## UI/UX Direction

Use a modern, professional SaaS auth style:

- Arabic-first RTL layout.
- Brand colors through existing Tailwind/shadcn tokens.
- Soft background gradient or subtle grid/glow.
- Elevated auth card.
- Clear visual distinction between staff and portal experiences.
- Mobile-first stacking.
- No clutter.
- No childish visuals.
- No custom modal/overlay/backdrop.

Use existing components where available:

```text
components/ui/card.tsx
components/ui/button.tsx
components/ui/input.tsx
components/ui/badge.tsx
components/ui/separator.tsx
components/ui/alert.tsx if available
components/ui/tabs.tsx if genuinely useful
```

Do not add a new UI framework.

## Security and Routing Constraints

Do not change the core `signInWithEmail` flow unless there is a build-breaking reason.

The current secure behavior must remain:

```text
real account role from membership -> getDefaultRouteForRole(role) -> redirect
```

Manual expectation:

- Parent logging in from `/login/staff` still redirects to `/portal`.
- Teacher logging in from `/login/portal` still redirects to `/dashboard`.

The route the user chose must never become the source of authorization.

## Files Expected to Change

Likely modified:

```text
constants/routes.ts
app/(auth)/login/page.tsx
app/(auth)/login/login-form.tsx
```

Likely added:

```text
app/(auth)/login/staff/page.tsx
app/(auth)/login/portal/page.tsx
app/(auth)/login/reset-password/page.tsx
app/(auth)/login/_components/auth-shell.tsx
app/(auth)/login/_components/login-card.tsx
app/(auth)/login/_components/google-login-button.tsx
app/(auth)/login/_components/reset-password-card.tsx
```

Docs to update lightly:

```text
docs/demo-readiness.md
docs/project-status.md
docs/verification-report.md
```

If documentation changes become too broad, keep them concise.

## Documentation Requirements

Update docs with short notes only:

- Phase 24 adds split login UX.
- `/login` is now an audience chooser.
- `/login/staff` and `/login/portal` are UI paths only.
- Role-based redirect remains server-side.
- Google and reset password are UI-only placeholders.
- No OAuth/reset email/schema/seed/config changes.

## Verification Budget

Required:

```bash
npm run build
git diff --check
```

Required if many TS/TSX files changed:

```bash
npm run lint
```

If global lint fails due pre-existing unrelated files, run targeted ESLint on touched files and document the reason.

Example targeted command; adjust file list to actual touched files:

```bash
npx eslint \
  'app/(auth)/login/page.tsx' \
  'app/(auth)/login/login-form.tsx' \
  'app/(auth)/login/staff/page.tsx' \
  'app/(auth)/login/portal/page.tsx' \
  'app/(auth)/login/reset-password/page.tsx' \
  'app/(auth)/login/_components/*.tsx' \
  constants/routes.ts
```

Conditional:

Run `npm run test` only if you modify any of:

```text
lib/actions/auth.ts
lib/auth/role-redirects.ts
lib/auth/session.ts
proxy.ts
```

Do not run by default:

```text
supabase db reset
DB smoke SQL
schema type generation
full npm run test:e2e
visual regression
```

## Manual Smoke Checklist

Document the result of these checks:

- Open `/login`.
- Staff card navigates to `/login/staff`.
- Portal card navigates to `/login/portal`.
- `/login/reset-password` opens and shows UI-only reset form.
- Google button shows UI-only message and does not trigger OAuth.
- Login with `school.admin@ofuq.local` from `/login/staff` redirects to `/dashboard`.
- Login with `parent.hassan@ofuq.local` from `/login/portal` redirects to `/portal`.
- Login with a parent account from `/login/staff` still redirects to `/portal`.
- Login with a teacher account from `/login/portal` still redirects to `/dashboard`.

If local auth is unavailable, document why and at least verify route rendering and no OAuth/reset network behavior.

## Skills Requirement

Final report must include:

```text
Skills used:
- shadcn: used for Card/Button/Input/Badge/Separator/Auth layout patterns
- ui-ux-pro-max: used for modern login UX, audience split, Arabic RTL polish, and auth flow clarity
- migrate-radix-to-base: not needed because no Radix imports were found
```

If touched files contain Radix imports, use `migrate-radix-to-base` and document what was migrated.

## Acceptance Criteria

- `/login` is a professional audience chooser.
- `/login/staff` exists and renders staff login UX.
- `/login/portal` exists and renders parent/student portal login UX.
- `/login/reset-password` exists and renders UI-only reset password UX.
- Google continuation button exists as UI only.
- No OAuth implementation was added.
- No password reset email implementation was added.
- `signInWithEmail` remains the real login path.
- Server-side role redirect behavior remains unchanged.
- No schema/seed/Supabase config changes.
- No authorization/scoping changes.
- Build passes.
- Diff check passes.
- Lint or targeted lint is documented.
- Manual smoke is documented.

## Suggested Commit Message

```text
style: add professional split login ux
```

## Final Report Format

When done, report:

```text
Changed files:
- ...

Summary:
- ...

Security/Scope confirmation:
- No OAuth implementation added.
- No reset email implementation added.
- No auth redirect logic changed.
- No schema/seed/config changes.

Verification:
- npm run build: ...
- git diff --check: ...
- lint/targeted lint: ...
- manual smoke: ...

Skills used:
- shadcn: ...
- ui-ux-pro-max: ...
- migrate-radix-to-base: ...

Commit hash:
- ...

Go/No-Go:
- ...
```
