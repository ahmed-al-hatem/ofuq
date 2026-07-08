# Codex Execution Prompt — 18 Settings and Integrations Placeholders Foundation

## Phase

`18 - Settings and Integrations Placeholders Foundation`

## Role

You are Codex acting as a senior full-stack engineer and product-platform architect.

You are working on **Ofuq | أُفُق**, an Arabic-first multi-tenant school management system built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style components / Base UI where applicable
- Supabase CLI / PostgreSQL / Supabase Auth
- Server Components and Server Actions
- fixed roles through `user_memberships`
- tenant/school context derived from authenticated active membership
- deterministic local Syrian demo dataset
- Vitest unit-test foundation
- Playwright browser-smoke foundation

This phase adds a **settings foundation** and **external integration placeholders**.

It is an implementation phase, but it must remain limited to local UI/settings foundations.

Do not build real external integrations in this phase.

---

## Current Context

The project already has completed foundations for:

```txt
Auth + fixed roles
Students and admissions
Academic structure
Attendance
Grades and report cards
Manual timetable
Finance
Communication
Ready-made reports
Library
Student care
Complaints and surveys
Syrian local demo dataset
Automated unit tests
Parent/student read-only portal
Browser smoke / E2E tests
```

The roadmap currently lists settings and integrations as later or UI/settings-only items.

Phase 18 should make the existing dashboard placeholders for settings and integrations active, while preserving the rule:

```txt
No real external API calls now.
```

---

## Main Goal

Add an admin-only settings area and integration placeholder area:

```txt
/dashboard/settings
/dashboard/integrations
```

The feature should provide:

1. School settings foundation.
2. Branding/white-label placeholder.
3. Localization settings foundation.
4. Module toggle UI/settings foundation.
5. Message/template settings placeholder.
6. External integration placeholder pages.
7. School-scoped persistence where useful.
8. Clear UI warnings that integrations are not connected yet.
9. Tests and browser smoke coverage.
10. Honest documentation and verification updates.

---

## Critical Product Rule

This phase is **UI + Settings + Placeholder only**.

Do not implement:

```txt
WhatsApp sending
SMS sending
email provider sending
webhook delivery
Google/Microsoft OAuth
calendar sync
MoE API calls
Power BI/Looker embedding
Zapier/Make webhook execution
payment provider connection
external notification providers
real secret/token storage
```

Any integration-related UI must clearly state that no external connection is active in this phase.

---

## Required Reading Before Editing

Read these first:

```txt
AGENTS.md
package.json
docs/architecture.md
docs/codex-workflow.md
docs/database.md
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/security-model.md
docs/testing.md
docs/supabase-local.md
docs/verification-report.md
constants/routes.ts
constants/roles.ts
config/navigation.ts
lib/auth/session.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
types/database.ts
tests/db/local-demo-smoke.sql
tests/e2e/dashboard-smoke.spec.ts
playwright.config.ts
supabase/config.toml
supabase/seed.sql
supabase/seeds/local_syrian_demo_03_apply.sql
supabase/seeds/auth_smoke_token_defaults.sql
```

Inspect existing dashboard page/layout/component patterns before adding new UI.

Do not introduce a parallel design system.

---

## Precondition

Before implementation, run:

```bash
git status --short
```

If Windows safe-directory protection applies, use:

```bash
git -c safe.directory=D:/ofuq/ofuq status --short
```

If unrelated uncommitted changes exist, stop and report them.

Phase 18 must start from a clean or clearly isolated Phase 18 working tree.

---

## Strict Scope

### In Scope

You may add:

```txt
minimal settings schema
settings and integrations route constants
active dashboard navigation entries for settings/integrations
settings dashboard pages
integration placeholder pages
server-side settings context/helpers
server actions for safe settings updates
unit tests for routes/navigation/settings constants
Playwright smoke coverage for settings/integrations
DB smoke checks for settings tables if seeded
local docs and verification updates
```

### Out of Scope

Do not add:

```txt
real WhatsApp API integration
real SMS/email provider integration
real webhook delivery or retry workers
real Google/Microsoft OAuth
real MoE API
real BI embedding
real Zapier/Make execution
real API key/secret storage
Backup/Restore
Sandbox
billing/subscription settings
full RBAC
RLS
AI features
new notification delivery providers
CI workflows unless explicitly requested
large refactors
```

Do not change existing module behavior.

Do not break dashboard, portal, Vitest, DB smoke, or Playwright smoke.

---

## Access Control

Settings and integrations pages are admin-only for this phase.

Allow:

```txt
system_admin
school_admin
```

Do not allow:

```txt
teacher
parent
student
accountant
librarian
```

All actions must derive context server-side from active membership:

```txt
user_id
tenant_id
school_id
role
```

Never trust these fields from forms:

```txt
tenant_id
school_id
user_id
role
```

If a non-admin role opens `/dashboard/settings` or `/dashboard/integrations`, show a clear unauthorized state or redirect according to existing project patterns.

---

## Schema Foundation

Create one migration:

```txt
supabase/migrations/<timestamp>_settings_integrations_placeholders_foundation.sql
```

Recommended tables:

```txt
school_settings
integration_settings
message_templates
```

Keep the schema simple and extensible.

### 1. `public.school_settings`

Recommended columns:

```sql
id uuid primary key default gen_random_uuid(),
tenant_id uuid not null references public.tenants(id) on delete cascade,
school_id uuid not null references public.schools(id) on delete cascade,
school_display_name text,
timezone text not null default 'Asia/Damascus',
locale text not null default 'ar',
direction text not null default 'rtl',
academic_week_start smallint not null default 0,
branding jsonb not null default '{}'::jsonb,
module_flags jsonb not null default '{}'::jsonb,
updated_by_user_id uuid references public.user_profiles(id) on delete set null,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
```

Recommended constraints/indexes:

```sql
unique (tenant_id, school_id)
check locale is not blank
check direction in ('rtl', 'ltr')
check academic_week_start between 0 and 6
index on tenant_id
index on school_id
```

### 2. `public.integration_settings`

Recommended enum or text check providers.

Providers should include:

```txt
whatsapp
webhooks
moe
google_calendar
microsoft_calendar
power_bi
looker
zapier
make
```

Recommended columns:

```sql
id uuid primary key default gen_random_uuid(),
tenant_id uuid not null references public.tenants(id) on delete cascade,
school_id uuid not null references public.schools(id) on delete cascade,
provider text not null,
display_name text not null,
status text not null default 'placeholder',
enabled boolean not null default false,
settings jsonb not null default '{}'::jsonb,
last_checked_at timestamptz,
updated_by_user_id uuid references public.user_profiles(id) on delete set null,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
```

Recommended constraints:

```sql
unique (tenant_id, school_id, provider)
check provider in (...)
check status in ('placeholder', 'disabled', 'configured', 'error')
check display_name is not blank
```

Important:

```txt
Do not store real secrets or API tokens in this phase.
```

If a field represents a secret in UI, it should be disabled, masked, or documented as not stored.

### 3. `public.message_templates`

Recommended columns:

```sql
id uuid primary key default gen_random_uuid(),
tenant_id uuid not null references public.tenants(id) on delete cascade,
school_id uuid not null references public.schools(id) on delete cascade,
template_key text not null,
channel text not null,
title text not null,
body text not null,
status text not null default 'draft',
updated_by_user_id uuid references public.user_profiles(id) on delete set null,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
```

Recommended constraints:

```sql
unique (tenant_id, school_id, template_key, channel)
check channel in ('in_app', 'email', 'sms', 'whatsapp')
check status in ('draft', 'active', 'archived')
check title/body/template_key are not blank
```

Templates are settings placeholders only. Do not send messages.

Do not add RLS in this phase.

After migration, regenerate types:

```bash
supabase gen types typescript --local > types/database.ts
```

---

## Seed Update

Update the local Syrian demo split seed only if needed.

Preferred file:

```txt
supabase/seeds/local_syrian_demo_03_apply.sql
```

Seed deterministic default settings for the demo school:

```txt
1 school_settings row
integration_settings rows for all supported providers
at least a few message_templates rows
```

Suggested integration statuses:

```txt
status = placeholder
enabled = false
settings = {}
```

Suggested templates:

```txt
attendance_absence_notice / in_app
invoice_reminder / in_app
general_announcement / in_app
```

Do not alter the split seed architecture.

Do not reintroduce old single-file seeds.

Keep `auth_smoke_token_defaults.sql` final in `supabase/config.toml`.

---

## Route Constants

Update:

```txt
constants/routes.ts
```

Add:

```ts
settings: "/dashboard/settings",
settingsSchool: "/dashboard/settings/school",
settingsBranding: "/dashboard/settings/branding",
settingsLocalization: "/dashboard/settings/localization",
settingsModules: "/dashboard/settings/modules",
settingsTemplates: "/dashboard/settings/templates",

integrations: "/dashboard/integrations",
integrationsWhatsapp: "/dashboard/integrations/whatsapp",
integrationsWebhooks: "/dashboard/integrations/webhooks",
integrationsMoe: "/dashboard/integrations/moe",
integrationsCalendar: "/dashboard/integrations/calendar",
integrationsBi: "/dashboard/integrations/bi",
integrationsAutomation: "/dashboard/integrations/automation",
```

Update route tests if they need to include these new routes.

---

## Dashboard Navigation

Update:

```txt
config/navigation.ts
```

The existing placeholder entries for:

```txt
الإعدادات
التكاملات
```

should become active dashboard links with `href` values.

Do not expose integration/settings pages in the parent/student portal navigation.

Keep other future placeholders unchanged unless intentionally implemented.

---

## Pages to Add

Add settings pages:

```txt
app/(dashboard)/dashboard/settings/page.tsx
app/(dashboard)/dashboard/settings/school/page.tsx
app/(dashboard)/dashboard/settings/branding/page.tsx
app/(dashboard)/dashboard/settings/localization/page.tsx
app/(dashboard)/dashboard/settings/modules/page.tsx
app/(dashboard)/dashboard/settings/templates/page.tsx
```

Add integration pages:

```txt
app/(dashboard)/dashboard/integrations/page.tsx
app/(dashboard)/dashboard/integrations/whatsapp/page.tsx
app/(dashboard)/dashboard/integrations/webhooks/page.tsx
app/(dashboard)/dashboard/integrations/moe/page.tsx
app/(dashboard)/dashboard/integrations/calendar/page.tsx
app/(dashboard)/dashboard/integrations/bi/page.tsx
app/(dashboard)/dashboard/integrations/automation/page.tsx
```

Pages must be Arabic-first and RTL-friendly.

Use existing cards/page headers/status badges/table patterns.

---

## UI Behavior

### `/dashboard/settings`

Show cards for:

```txt
إعدادات المدرسة
الهوية البصرية
اللغة والمنطقة
الوحدات
القوالب
```

### `/dashboard/settings/school`

Show school identity/settings such as:

```txt
اسم العرض
المنطقة الزمنية
اللغة
الاتجاه
بداية الأسبوع الأكاديمي
```

Allow safe updates only if implemented cleanly.

### `/dashboard/settings/branding`

Placeholder only.

Show branding values from `school_settings.branding` if seeded:

```txt
الشعار
الألوان
اسم الواجهة
```

Do not upload files.

Do not store real assets.

### `/dashboard/settings/localization`

Show localization values:

```txt
locale
direction
timezone
academic_week_start
```

### `/dashboard/settings/modules`

Show module toggles as UI/settings foundation.

Recommended flags:

```txt
students
academic
attendance
grades
timetable
finance
communication
reports
library
student_care
feedback
portal
```

Module toggles should not disable real routes or behavior in Phase 18 unless explicitly already designed.

Clearly label them as settings foundation only.

### `/dashboard/settings/templates`

Show message templates table/cards.

Do not send messages.

Do not connect providers.

---

## Integration UI Behavior

### `/dashboard/integrations`

Show overview cards for:

```txt
WhatsApp Business
Webhooks
وزارة التربية
Google Calendar
Microsoft Calendar
Power BI
Looker
Zapier
Make
```

Every card should show:

```txt
الحالة: غير مفعّل / إعدادات فقط
لا يوجد اتصال خارجي في هذه المرحلة
```

### Provider Pages

Each provider page must show:

```txt
provider display name
current placeholder status
enabled false or placeholder state
settings summary if any
clear warning that no real connection exists
```

Required warning text or equivalent:

```txt
هذه الصفحة مخصصة لإعدادات أولية فقط. لا يتم تنفيذ أي اتصال خارجي في هذه المرحلة.
```

For secret/API key fields:

```txt
لا يتم حفظ مفاتيح API حقيقية في هذه المرحلة.
```

Do not add a working “test connection” action.

If a button is shown, it must be disabled or clearly non-functional placeholder.

Prefer no misleading buttons.

---

## Server-Side Files

Recommended new files:

```txt
types/settings.ts
lib/settings/context.ts
lib/settings/constants.ts
lib/settings/school-settings.ts
lib/settings/integration-settings.ts
lib/settings/message-templates.ts
lib/actions/settings.ts
```

`lib/settings/context.ts` should provide admin-only context helpers, or reuse existing `requireRole` / `requireTenant` patterns.

Actions must:

```txt
require authenticated user
require active membership
allow only system_admin or school_admin
derive tenant_id and school_id server-side
validate input with Zod
write audit_logs where practical
avoid storing secrets
```

If server actions are too much for this phase, keep pages read-only and seed-backed, but document the limitation honestly.

Recommended balance:

```txt
Allow simple school_settings update and template status/title/body updates if straightforward.
Keep integration secrets disabled/placeholder-only.
```

---

## Validation

Use Zod for any forms/actions.

Recommended schemas:

```txt
school settings update schema
branding placeholder update schema
localization update schema
module flags update schema
template update schema
integration placeholder update schema
```

Do not accept arbitrary JSON from client without validation.

If using `jsonb` fields, whitelist known keys before storing.

---

## Tests

Use Phase 15 Vitest foundation.

Add unit tests such as:

```txt
tests/unit/settings-routes.test.ts
tests/unit/settings-navigation.test.ts
tests/unit/integration-settings.test.ts
```

Test:

```txt
settings routes exist and are non-empty
integration routes exist and are non-empty
settings/integrations navigation entries are active, not placeholders
no duplicate dashboard hrefs
integration provider list is stable
integration provider labels are Arabic/non-empty
placeholder statuses are stable
no provider is marked as connected by default
```

Update existing route/navigation tests if needed.

---

## E2E Browser Smoke Update

Use Phase 17 Playwright foundation.

Add:

```txt
tests/e2e/settings-integrations-smoke.spec.ts
```

Use:

```txt
school.admin@ofuq.local
```

Verify:

```txt
/dashboard/settings opens
/dashboard/settings/school opens
/dashboard/settings/modules opens
/dashboard/settings/templates opens
/dashboard/integrations opens
/dashboard/integrations/whatsapp opens
/dashboard/integrations/webhooks opens
clear placeholder warning is visible
no real external connection is claimed
no working send/test-connection action is available
```

Keep this smoke small.

Do not create or mutate external resources.

If forms exist, do not perform broad form mutation unless it is a tiny local-only safe update and can be verified reliably.

Prefer page-load and placeholder assertions.

---

## DB Smoke SQL Update

If settings tables are added, update:

```txt
tests/db/local-demo-smoke.sql
```

Add non-destructive checks:

```sql
select count(*) as school_settings_count
from public.school_settings;

select count(*) as integration_settings_count
from public.integration_settings;

select count(*) as message_templates_count
from public.message_templates;
```

Expected for local demo seed:

```txt
school_settings_count >= 1
integration_settings_count >= 9
message_templates_count >= 1
```

Add anomaly checks:

```sql
select tenant_id, school_id, count(*)
from public.school_settings
group by tenant_id, school_id
having count(*) > 1;
```

Expected:

```txt
0 rows
```

Add:

```sql
select provider, count(*)
from public.integration_settings
group by provider
having count(*) > 1;
```

Expected for single demo school:

```txt
0 rows
```

If there are multiple schools, adapt the grouping to tenant/school/provider.

Do not make the SQL destructive.

---

## Documentation Updates

Update:

```txt
docs/database.md
docs/security-model.md
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/testing.md
docs/supabase-local.md
docs/verification-report.md
```

Docs must clearly mention:

```txt
Settings foundation is implemented.
Integrations are UI/settings placeholders only.
No real external API calls are implemented.
No real API secrets are stored.
Backup/Restore is excluded.
Sandbox is excluded.
RLS remains deferred.
Browser smoke was updated if Playwright test was added and passed.
```

Do not claim real integration support.

Do not claim external delivery or sync works.

---

## Verification Commands

Run:

```bash
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
npm run test
npm run lint
npm run build
npm run test:all
npm run test:e2e
git diff --check
```

Run DB smoke:

```powershell
$dbContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db*" } | Select-Object -First 1
Get-Content tests/db/local-demo-smoke.sql | docker exec -i $dbContainer psql -U postgres -d postgres
```

If `supabase db reset` is intermittently unstable in this Windows Docker environment, follow the project’s existing honest documentation pattern:

```txt
Do not claim reset passed unless it exits successfully.
If using supabase start + type generation + DB smoke instead, document that exactly.
```

Do not mark Phase 18 done unless unit/lint/build/E2E and DB smoke status are honestly recorded.

---

## Manual Browser Smoke Guidance

If manual browser check is available, test:

```txt
school.admin@ofuq.local
```

Shared local password:

```txt
OfuqLocal123!
```

Open:

```txt
/dashboard/settings
/dashboard/settings/school
/dashboard/settings/branding
/dashboard/settings/localization
/dashboard/settings/modules
/dashboard/settings/templates
/dashboard/integrations
/dashboard/integrations/whatsapp
/dashboard/integrations/webhooks
/dashboard/integrations/moe
/dashboard/integrations/calendar
/dashboard/integrations/bi
/dashboard/integrations/automation
```

Confirm:

```txt
pages load
Arabic RTL UI is correct
integration warnings are visible
no real connection action is available
no API secrets are stored or displayed
```

If manual browser smoke is not performed, document it honestly.

Playwright smoke can be considered browser smoke only when `npm run test:e2e` passes.

---

## Commit Rules

Stage only Phase 18 files.

Expected files may include:

```txt
supabase/migrations/<timestamp>_settings_integrations_placeholders_foundation.sql
supabase/seeds/local_syrian_demo_03_apply.sql
types/database.ts
types/settings.ts
constants/routes.ts
config/navigation.ts
lib/settings/context.ts
lib/settings/constants.ts
lib/settings/school-settings.ts
lib/settings/integration-settings.ts
lib/settings/message-templates.ts
lib/actions/settings.ts
app/(dashboard)/dashboard/settings/page.tsx
app/(dashboard)/dashboard/settings/school/page.tsx
app/(dashboard)/dashboard/settings/branding/page.tsx
app/(dashboard)/dashboard/settings/localization/page.tsx
app/(dashboard)/dashboard/settings/modules/page.tsx
app/(dashboard)/dashboard/settings/templates/page.tsx
app/(dashboard)/dashboard/integrations/page.tsx
app/(dashboard)/dashboard/integrations/whatsapp/page.tsx
app/(dashboard)/dashboard/integrations/webhooks/page.tsx
app/(dashboard)/dashboard/integrations/moe/page.tsx
app/(dashboard)/dashboard/integrations/calendar/page.tsx
app/(dashboard)/dashboard/integrations/bi/page.tsx
app/(dashboard)/dashboard/integrations/automation/page.tsx
tests/unit/settings-routes.test.ts
tests/unit/settings-navigation.test.ts
tests/unit/integration-settings.test.ts
tests/e2e/settings-integrations-smoke.spec.ts
tests/db/local-demo-smoke.sql
docs/database.md
docs/security-model.md
docs/project-status.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/testing.md
docs/supabase-local.md
docs/verification-report.md
```

Before commit, run:

```bash
git diff --cached --name-only
git diff --cached --stat
git diff --check --cached
```

Suggested commit message:

```txt
feat: add settings integrations placeholders foundation
```

Do not commit if:

```txt
supabase db reset or documented alternative verification is not handled honestly
DB smoke fails
unit tests fail
lint fails
build fails
test:all fails
test:e2e fails
unrelated files are staged
real secrets are added
external integration logic is added
Playwright artifacts are staged
```

---

## Expected Final Response

After implementation, report:

1. Git status at start.
2. Schema migration added.
3. Seed/default settings updates.
4. Settings routes/pages added.
5. Integrations routes/pages added.
6. Navigation changes.
7. Access-control model.
8. Server helpers/actions added.
9. Tests added.
10. E2E smoke update.
11. DB smoke updates and results.
12. Supabase reset/type generation results.
13. `npm run test` result.
14. `npm run lint` result.
15. `npm run build` result.
16. `npm run test:all` result.
17. `npm run test:e2e` result.
18. `git diff --check` result.
19. Manual/browser smoke status.
20. Docs updated.
21. Commit hash if committed.
22. Final Go/No-Go for the next phase.

---

## Success Criteria

Phase 18 succeeds only when:

- `/dashboard/settings` exists and is protected for admin roles.
- `/dashboard/integrations` exists and is protected for admin roles.
- Dashboard navigation links settings and integrations as active entries.
- Settings foundation data is tenant/school scoped.
- Integration providers are placeholder-only.
- No real external calls are implemented.
- No real API secrets are stored.
- Backup/Restore remains excluded.
- Sandbox remains excluded.
- DB smoke passes or blockers are documented honestly.
- Type generation is handled after schema changes.
- Vitest tests pass.
- Lint passes.
- Build passes.
- `npm run test:all` passes.
- Playwright smoke passes if updated.
- Docs are updated honestly.
- No false integration claims are made.

---

## Suggested Next Phase After Successful Completion

After Phase 18 is verified and committed, plan the next phase separately.

Potential Phase 19 options:

```txt
19 - Parent/Student Portal Interaction Foundation
or
19 - CI Quality Workflow Foundation
or
19 - Ready-Made Reports Polish and Export Preparation
```

Do not start the next phase in this prompt.
