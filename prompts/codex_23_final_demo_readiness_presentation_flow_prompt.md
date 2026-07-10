# Codex Prompt — Phase 23: Final Demo Readiness & Presentation Flow Polish

## Mission

Implement Phase 23 for Ofuq: **Final Demo Readiness & Presentation Flow Polish**.

This phase prepares the application for the final graduation discussion/demo. It should make the demo path clear, stable, documented, and presentation-friendly.

This is **not** a feature expansion phase. Do not add new modules or rewrite large UI areas. Focus on final demo flow, presentation copy, demo documentation, and a small number of polish fixes that directly support the live presentation.

## Current Context

The project already has:

- Role-aware dashboards and navigation.
- Role-specific staff dashboard pages.
- Parent/student read-only portal.
- Modal form UX foundation.
- UX cleanup for academic, attendance, grades, finance, library, communication, and portal pages.
- Local Syrian demo dataset and demo auth accounts.
- Automated unit/database/e2e foundations, but testing budget must remain controlled.

Phase 23 should now stabilize and document the final demo story.

---

## Primary Goal

Prepare Ofuq for a smooth final presentation by delivering:

```text
- A clear demo script.
- Demo user guide.
- Presentation-ready route list.
- Final smoke checklist.
- Known limitations written professionally.
- Light polish for the pages used in the demo.
- Honest verification report.
```

The final output should make it easy to open the app and present the project to an evaluation committee without improvising the flow.

---

## Hard Constraints

- No new business modules.
- No broad UI redesign.
- No schema migrations.
- No Supabase config changes.
- No seed changes unless a real demo blocker is found and documented.
- No RLS work.
- No RBAC work.
- No AI/chatbot implementation.
- No real external integrations.
- No real payment gateway.
- No report builder.
- No new portal mutations.
- No business logic changes unless required to fix a blocking demo bug.
- No authorization/scoping changes unless required to fix a blocking demo bug.
- No custom modal/overlay/backdrop.
- No new UI dependency.
- Do not attempt to fix unrelated historical lint issues.
- Keep the phase focused on final demo readiness.

---

## Required Skill Usage

Before touching UI/copy, explicitly apply these skills:

```text
- shadcn
- ui-ux-pro-max
- migrate-radix-to-base only if Radix imports are found in touched files
```

The final report must include:

```text
Skills used:
- shadcn: used for final Card/Button/Badge/Table/Page layout polish where touched
- ui-ux-pro-max: used for demo flow clarity, presentation readiness, copy polish, and Arabic RTL consistency
- migrate-radix-to-base: not needed because no Radix imports were found
```

If Radix imports are found and touched, report the migration honestly.

---

## In Scope

### 1. Demo readiness documentation

Create a new file:

```text
docs/demo-readiness.md
```

It must include:

```text
- Purpose of the final demo.
- Recommended demo order.
- Demo users table.
- Start route for each role.
- What to show for each role.
- Key routes for the presentation.
- Known limitations written professionally.
- Final smoke checklist.
- Local environment assumptions.
- What is intentionally out of scope for the MVP.
```

### 2. Demo users guide

Document demo users in a clear table.

Use the actual local demo accounts available in the project. Inspect existing seed/auth docs/tests before writing the final table.

Likely roles to include:

```text
school_admin
teacher
parent
student
accountant
librarian
```

The table should have:

```text
Role | Email | Password | Start Route | What to show
```

Important:

```text
- Do not expose demo passwords in public UI pages.
- Demo passwords may be documented in docs/demo-readiness.md if they already exist in local demo docs/seeds.
- If password certainty is unclear, document the account and write that the password follows the local demo seed convention, then point to the seed/doc source.
```

### 3. Demo route map

Document the final route map for presentation.

Include at least:

```text
/
/login
/dashboard
/dashboard/students
/dashboard/academic
/dashboard/attendance/sessions
/dashboard/grades/exams
/dashboard/finance
/dashboard/library
/dashboard/communication/announcements
/dashboard/settings
/portal
/portal/students
/portal/attendance
/portal/grades
/portal/finance
/portal/library
/portal/announcements
/portal/profile
```

Only include routes that currently exist.

If a route does not exist, replace it with the closest valid route and document the choice.

### 4. Demo script

Add a practical demo script inside `docs/demo-readiness.md`.

Suggested order:

```text
1. Login and product identity.
2. School Admin dashboard.
3. Students and academic structure.
4. Attendance and grades.
5. Finance, library, and communication.
6. Settings/integrations as MVP configuration placeholders.
7. Parent/student read-only portal.
8. Final note: MVP scope and future work.
```

The script should be concise but usable during a live presentation.

### 5. Known limitations

Use professional wording.

Avoid:

```text
غير مكتمل
لا يعمل
مكسور
لاحقًا فقط
placeholder
```

Prefer:

```text
- التكاملات الخارجية معروضة كإعدادات واجهة ضمن نطاق MVP.
- الذكاء الاصطناعي مؤجل إلى مرحلة لاحقة بعد توفر بيانات تشغيلية كافية.
- بوابة ولي الأمر والطالب مخصصة للعرض فقط في هذه النسخة.
- الدفع الإلكتروني غير مفعّل في النسخة المحلية.
- RLS مؤجل، ويعتمد العزل الحالي على طبقة الخدمات والتحقق الخادمي في هذه النسخة.
```

### 6. Light presentation polish

Allowed only if directly supporting demo flow:

```text
- Remove obvious scaffold/developer-facing copy from demo routes.
- Improve page titles/descriptions used in the demo.
- Improve empty state wording on demo routes.
- Fix an obvious broken link in the demo path.
- Improve a small spacing or badge issue that affects presentation clarity.
- Add a harmless read-only badge/notice where it clarifies portal scope.
```

Keep UI changes small.

### 7. Documentation updates

Update relevant docs:

```text
docs/project-status.md
docs/project-phases.md
docs/testing.md
docs/verification-report.md
docs/ui-ux-role-roadmap.md
```

Do not rewrite these files unnecessarily. Add a concise Phase 23 entry/status.

---

## Out of Scope

```text
- No new app feature.
- No new form workflow.
- No new mutations.
- No new database tables/columns.
- No seed changes unless a real demo blocker is discovered.
- No Supabase config changes.
- No auth model changes.
- No linked-student scoping changes.
- No report/PDF feature expansion.
- No real integrations.
- No AI/chatbot.
- No full visual redesign.
- No full E2E suite by default.
- No fixing unrelated lint issues.
```

---

## Suggested Demo Flow

### Scene 1 — Entry and login

```text
1. Open the public entry or login page.
2. Explain Ofuq as a SaaS school management system.
3. Login as school admin.
```

### Scene 2 — School admin overview

```text
1. Open /dashboard.
2. Explain role-aware dashboard and multi-tenant scope.
3. Show students and academic structure.
```

### Scene 3 — Academic operations

```text
1. Show /dashboard/students.
2. Show /dashboard/academic or closest academic page.
3. Show attendance sessions.
4. Show grades/exams.
```

### Scene 4 — Operational modules

```text
1. Show finance overview/invoices.
2. Show library catalog/loans.
3. Show communication announcements/messages.
```

### Scene 5 — MVP configuration and future-facing areas

```text
1. Show settings/integrations pages.
2. Explain that integrations are MVP configuration placeholders.
3. Mention AI/chatbot/report builder as future phases if already documented.
```

### Scene 6 — Parent/student portal

```text
1. Login as parent or student.
2. Open /portal.
3. Show student cards, attendance, grades, finance, library, announcements.
4. Emphasize that portal is read-only.
```

### Scene 7 — Closing

```text
1. Summarize implemented scope.
2. Mention known limitations professionally.
3. Mention future improvements.
```

---

## Demo Accounts Investigation

Before writing `docs/demo-readiness.md`, inspect:

```text
supabase/seed.sql
supabase/seeds/auth_smoke_token_defaults.sql
supabase/seeds/local_syrian_demo_*.sql
docs/supabase-local.md
docs/testing.md
tests/e2e
playwright config if relevant
```

Confirm actual demo users and passwords.

Known likely demo emails may include:

```text
school.admin@ofuq.local
teacher@ofuq.local
parent.hassan@ofuq.local
student@ofuq.local
accountant@ofuq.local
librarian@ofuq.local
```

Do not guess. Use what exists in the repo.

If multiple accounts exist for a role, choose the most stable demo account used by E2E/docs.

---

## Route Validation Guidance

Before finalizing the route list, inspect route files under:

```text
app
app/(dashboard)/dashboard
app/(portal)/portal
constants/routes if present
config/navigation files
config/portal-navigation.ts
```

Only document valid routes.

If a planned route is missing, use the nearest valid route and include a note like:

```text
تم استخدام /dashboard/academic/subjects بدل /dashboard/academic لأن صفحة المواد هي نقطة عرض أكاديمية مباشرة في النسخة الحالية.
```

---

## Copy Polish Rules

Use Arabic professional wording.

Avoid technical/developer copy in user-facing pages:

```text
scaffold
placeholder
TODO
mock
not implemented
coming soon
لاحقًا فقط
بيانات وهمية
```

Acceptable MVP wording:

```text
ضمن نطاق النسخة الحالية
إعدادات واجهة ضمن MVP
للمراجعة فقط
عرض قراءة فقط
تتم إدارة هذه البيانات من قبل المدرسة
```

---

## Testing Budget

This phase needs slightly more demo confidence than prior UX-only phases, but still avoid broad testing.

### Required

Run:

```bash
npm run build
git diff --check
```

### Required if TS/TSX files are touched

Run:

```bash
npm run lint
```

If global lint fails because of unrelated historical issues such as `.codex/skills`, `components/ui/carousel.tsx`, or `hooks/use-mobile.ts`, run targeted ESLint on changed TS/TSX files and document the blocker.

### Recommended targeted demo smoke

If the local environment is available, run a small manual or targeted browser smoke:

```text
- Login as school_admin.
- Open /dashboard.
- Open one student/academic page.
- Open attendance or grades page.
- Login as parent or student.
- Open /portal.
- Confirm portal does not show dashboard/admin links.
- Confirm portal remains read-only.
```

### Conditional

Run:

```bash
npm run test
```

Only if this phase changes:

```text
- auth/routing
- role redirect
- portal scoping
- server helpers
- validation/business logic
```

### Do not run by default

```text
supabase db reset
DB smoke SQL
schema type generation
full npm run test:e2e
visual regression tests
```

Run them only if a real demo blocker requires it, and document why.

---

## Documentation Requirements

Create:

```text
docs/demo-readiness.md
```

Update:

```text
docs/project-status.md
docs/project-phases.md
docs/testing.md
docs/verification-report.md
docs/ui-ux-role-roadmap.md
```

Documentation must clearly say:

```text
- Phase 23 prepared the final demo flow.
- A demo readiness guide was added.
- Demo users and routes were documented.
- Known limitations were written professionally.
- No schema/seed/config changes were made unless explicitly justified.
- No new business features were added.
- Testing followed a focused demo-readiness budget.
```

---

## Self-Review Checklist

Before final report:

```text
- docs/demo-readiness.md exists.
- Demo users are documented from actual repo sources.
- Demo route list contains only valid routes.
- Demo script is usable in a live presentation.
- Known limitations use professional MVP wording.
- Any UI polish is small and directly tied to demo clarity.
- No feature expansion happened.
- No schema/seed/config changes happened, unless justified as a demo blocker.
- No portal mutations were added.
- No auth/scoping/routing logic changed unless justified as a demo blocker.
- Build passed.
- diff-check passed.
- lint or targeted lint is documented.
- Demo smoke is documented, or skipped with reason.
- Skills used section exists.
```

---

## Acceptance Criteria

Phase 23 is complete when:

```text
- docs/demo-readiness.md exists and is clear.
- Final demo order is documented.
- Demo users are documented.
- Presentation routes are documented.
- Known limitations are documented professionally.
- Final smoke checklist exists.
- No new feature scope was introduced.
- No schema/seed/config changes were made unless clearly justified.
- No business logic changes were made unless clearly justified.
- No portal write actions were added.
- Build passes.
- diff-check passes.
- lint or targeted lint is documented.
- Recommended demo smoke is run or skipped with reason.
- Skills usage is documented.
```

---

## Commit Requirements

Before committing:

```bash
git status --short
git diff --check
```

Suggested commit message if mostly docs:

```text
docs: add final demo readiness guide
```

Suggested commit message if small UI polish is included:

```text
style: polish final demo flow
```

Prefer the docs commit message if most changes are documentation.

---

## Final Report Format

The final report must include:

```text
- Changed files summary
- Demo readiness guide summary
- Demo users documented
- Demo route map summary
- Any UI/copy polish applied
- Known limitations wording summary
- Confirmation no schema/seed/config changes, or explanation if changed
- Confirmation no new features/business logic changes, or explanation if changed
- Confirmation portal remains read-only
- Skills used section
- Verification results
- Demo smoke result or skipped reason
- Skipped checks with reasons
- Commit hash if committed
- Go/No-Go for the next phase
```
