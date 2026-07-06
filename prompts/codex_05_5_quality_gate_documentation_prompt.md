# Codex Execution Prompt — 05.5 Quality Gate + Documentation Snapshot

## Role

You are Codex acting as a senior full-stack engineer, QA reviewer, and technical documentation engineer.

You are working on **Ofuq | أُفُق**, a full-stack school management system built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Lucide React
- framer-motion where useful
- Supabase CLI and Supabase Auth
- Supabase PostgreSQL
- Server Actions and server-side services
- Fixed roles through `user_memberships`
- Multi-Tenant architecture from the beginning

This phase is **not a feature implementation phase**.

This phase is a **quality gate and documentation snapshot** after Phase 05 and before Phase 06.

---

## Main Objective

Create a clear, reliable checkpoint for the project after these completed foundations:

1. Project setup and architecture
2. Supabase core schema foundation
3. Auth + fixed roles + membership context
4. Students and admissions foundation
5. Academic structure foundation

Your job is to:

1. Inspect the current project state.
2. Run the available verification commands.
3. Document the current project status.
4. Document the verification results.
5. Document the requirements roadmap based on the existing project requirements and implemented phases.
6. Do **not** implement new business features.
7. Do **not** start Phase 06.

---

## Required Reading Before Editing

Before making any changes, read these files carefully:

```txt
AGENTS.md
package.json
docs/architecture.md
docs/database.md
docs/security-model.md
docs/supabase-local.md
docs/project-phases.md
docs/codex-workflow.md
constants/routes.ts
config/navigation.ts
types/database.ts
```

Also inspect the current folders without making changes first:

```txt
app/
components/
lib/
types/
supabase/migrations/
supabase/seed.sql
prompts/
docs/
```

If any of these files are missing, report that clearly and continue with the best available context.

---

## Phase Context

The project has completed the following slices:

### Phase 01 — Project Setup and Architecture

Expected completed foundations:

- Full-stack Next.js architecture
- Arabic-first RTL interface
- Dashboard shell
- Supabase helper separation
- shadcn/ui-style primitives
- Basic documentation

### Phase 02 — Supabase Core Schema Foundation

Expected completed foundations:

- `tenants`
- `schools`
- `user_profiles`
- `user_memberships`
- `audit_logs`

### Phase 03 — Auth + Fixed Roles + Membership Context

Expected completed foundations:

- Email/password login
- Server-side dashboard protection
- Sign-out
- `getAuthenticatedUser()` or equivalent session helper
- Fixed role checks
- Tenant/school context from active membership

### Phase 04 — Students and Admissions Foundation

Expected completed foundations:

- `student_admissions`
- `students`
- `student_guardians`
- `student_documents`
- `student_status_history`
- private `student-documents` storage bucket
- admission creation and approval foundation
- students/admissions dashboard routes

### Phase 05 — Academic Structure Foundation

Expected completed foundations:

- `academic_years`
- `terms`
- `grade_levels`
- `classes`
- `subjects`
- `grade_level_subjects`
- `class_enrollments`
- academic dashboard routes
- class enrollment foundation

---

## Important Scope Rule

This is a documentation and verification phase only.

### In Scope

You may create or update only documentation files related to current state and verification.

Expected files to create or update:

```txt
docs/project-status.md
docs/verification-report.md
docs/requirements-roadmap.md
```

You may also update these existing docs only if needed to add small cross-links to the new docs:

```txt
docs/project-phases.md
docs/codex-workflow.md
```

Only update them if the change is small and clearly useful.

### Out of Scope

Do **not** implement:

- Attendance
- QR attendance
- Beacon attendance
- Grades
- Exams
- Report cards
- Timetable
- Finance
- Communication
- Library
- Health
- AI Query
- Chatbot
- Report Builder
- External integrations
- Backup/Restore
- Sandbox
- RLS policies
- RBAC permissions tables
- New auth flows
- New database schema
- New UI modules
- New testing framework
- CI/CD pipeline

Do **not** modify:

- Existing migrations
- Current database schema
- Auth logic
- Student/admission logic
- Academic logic
- Dashboard layout unless documentation links require a very small non-functional change, which should generally be avoided

---

## Core Project Rules To Preserve

Document and preserve these rules:

1. The project is full-stack Next.js, not UI-only.
2. Use Server Components by default.
3. Use Client Components only when interaction requires them.
4. Use Server Actions or server-side services for mutations and sensitive reads.
5. Use Supabase Auth as the authentication source of truth.
6. Use `user_profiles` for application profile data.
7. Use `user_memberships` for fixed roles and tenant/school context.
8. Do not implement full RBAC now.
9. Do not recreate or reference `user_roles`.
10. Every tenant-owned table must include `tenant_id`.
11. School-scoped tables should include `school_id`.
12. Never trust `tenant_id`, `school_id`, or `role` from forms or client input.
13. Resolve tenant/school/role from the authenticated active membership server-side.
14. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
15. RLS is deferred until auth and membership flows are stable.
16. Keep Arabic-first RTL UI conventions.
17. Add new modules as vertical slices only.

---

## Required Output File 1 — `docs/project-status.md`

Create or update:

```txt
docs/project-status.md
```

This file must be a concise but complete current-state snapshot.

### Required Structure

Use this exact high-level structure:

```md
# Project Status

## Snapshot

## Tech Stack

## Completed Phases

## Current Implemented Modules

## Current Routes

## Current Database Slices

## Current Security Model

## Current Documentation

## Current Known Limitations

## Recommended Next Phase
```

### Required Content Details

#### `## Snapshot`

Include:

- Project name: `Ofuq | أُفُق`
- Current phase: `05.5 Quality Gate + Documentation Snapshot`
- Last completed implementation phase: `05 Academic Structure Foundation`
- Next implementation phase: `06 Attendance Manual + QR Foundation`
- Architecture summary: full-stack Next.js + Supabase + fixed roles + Multi-Tenant

#### `## Tech Stack`

Summarize the active stack based on `package.json`, including:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- shadcn/ui-style primitives
- Lucide React
- framer-motion
- Zod
- React Hook Form if present

Do not invent versions if you do not inspect them.

#### `## Completed Phases`

Create a list or table covering:

- Phase 01 Project Setup and Architecture
- Phase 02 Supabase Core Schema Foundation
- Phase 03 Auth + Fixed Roles + Membership Context
- Phase 04 Students and Admissions Foundation
- Phase 05 Academic Structure Foundation
- Phase 05.5 Quality Gate + Documentation Snapshot

Each row should include:

- Phase
- Status
- Summary

#### `## Current Implemented Modules`

Include:

- Auth foundation
- Tenant/school membership foundation
- Students and admissions foundation
- Academic structure foundation
- Dashboard shell and navigation

Do not mark attendance, grades, finance, communication, library, or health as implemented.

#### `## Current Routes`

Inspect `constants/routes.ts`, `config/navigation.ts`, and the `app/` directory.

Document known active routes, such as:

- `/`
- `/login`
- `/dashboard`
- `/dashboard/admissions`
- `/dashboard/admissions/new`
- `/dashboard/students`
- `/dashboard/academic`
- `/dashboard/academic/years`
- `/dashboard/academic/grade-levels`
- `/dashboard/academic/classes`
- `/dashboard/academic/subjects`
- `/dashboard/academic/enrollments`

Only include routes that actually exist or are clearly configured.

#### `## Current Database Slices`

Summarize current database areas:

- Core tenant/auth tables
- Students/admissions tables
- Academic structure tables

Mention that RLS is still deferred.

#### `## Current Security Model`

Summarize:

- Supabase Auth
- `user_profiles`
- `user_memberships`
- fixed roles
- server-side membership checks
- no full RBAC yet
- no full RLS yet

#### `## Current Documentation`

List relevant docs:

- `docs/architecture.md`
- `docs/database.md`
- `docs/security-model.md`
- `docs/supabase-local.md`
- `docs/project-phases.md`
- `docs/codex-workflow.md`
- `docs/project-status.md`
- `docs/verification-report.md`
- `docs/requirements-roadmap.md`

#### `## Current Known Limitations`

Include known limitations:

- No attendance module yet
- No grades/report cards yet
- No timetable logic yet
- No finance module yet
- No parent notifications yet
- No full RLS yet
- No full RBAC yet
- No external integrations yet
- No automated test suite yet unless one already exists

#### `## Recommended Next Phase`

Recommend:

```txt
06 - Attendance Manual + QR Foundation
```

Include short rationale:

- students exist
- academic years/classes/enrollments exist
- attendance can now depend on `class_enrollments`

---

## Required Output File 2 — `docs/verification-report.md`

Create or update:

```txt
docs/verification-report.md
```

This file must document actual checks run in this phase.

### Required Structure

Use this exact high-level structure:

```md
# Verification Report

## Scope

## Environment Notes

## Command Results

## Manual Smoke Test Checklist

## Findings

## Blockers

## Recommendations
```

### Required Content Details

#### `## Scope`

State that this report covers the state after Phase 05 and before Phase 06.

#### `## Environment Notes`

Document:

- OS/environment if obvious from terminal
- Supabase local availability
- Docker availability if observed
- Any elevated permission requirement if observed
- Missing env values if any command reveals them

Do not include secrets.

#### `## Command Results`

Run and document these commands if available:

```bash
git status
npm run lint
npm run build
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
```

If a command is unavailable, skipped, or fails, document it truthfully.

Use a table with columns:

```md
| Check | Command | Result | Notes |
```

Allowed result values:

```txt
Passed
Failed
Skipped
Not available
```

Do not claim a command passed unless it actually ran and passed.

If `supabase db reset` has a Docker/container restart or storage health issue, report it accurately and rerun `supabase status` if possible.

#### `## Manual Smoke Test Checklist`

Create a checklist for manual verification.

Include at least:

```md
- [ ] `/`
- [ ] `/login`
- [ ] login with valid credentials
- [ ] login with invalid credentials
- [ ] `/dashboard`
- [ ] sign out
- [ ] `/dashboard/admissions`
- [ ] `/dashboard/admissions/new`
- [ ] create admission as allowed role
- [ ] approve/reject admission as allowed role
- [ ] `/dashboard/students`
- [ ] `/dashboard/academic`
- [ ] `/dashboard/academic/years`
- [ ] `/dashboard/academic/grade-levels`
- [ ] `/dashboard/academic/classes`
- [ ] `/dashboard/academic/subjects`
- [ ] `/dashboard/academic/enrollments`
- [ ] enroll student in class as allowed role
- [ ] confirm unauthorized roles cannot mutate academic/student data
```

Do not mark manual items checked unless you actually verified them manually.

If you cannot do browser manual testing, leave them unchecked and state that browser testing was not performed.

#### `## Findings`

Summarize any warnings or observations.

Examples:

- automated checks passed
- Supabase local required elevated Docker access
- no automated test framework exists yet
- RLS deferred by design

#### `## Blockers`

List blockers if any.

If none, write:

```txt
No blocking issues found during this verification phase.
```

#### `## Recommendations`

Recommend next steps:

- proceed to Phase 06 if verification passed
- add automated tests after attendance or grades stabilize
- keep validating with lint/build/db reset after each schema slice

---

## Required Output File 3 — `docs/requirements-roadmap.md`

Create or update:

```txt
docs/requirements-roadmap.md
```

This file must map the broader project requirements to phases and statuses.

### Required Structure

Use this exact high-level structure:

```md
# Requirements Roadmap

## Purpose

## Status Legend

## MVP Decisions

## Roadmap Table

## Implemented Now

## Planned Next

## Later / Placeholder Only

## Explicitly Excluded

## Notes For Future Codex Prompts
```

### Status Legend

Use these statuses:

```txt
Done
In Progress
Planned
Later
UI / Settings Only
Excluded
```

### MVP Decisions

Document these decisions:

- Fixed roles now; extensible permissions later.
- Keep Multi-Tenant foundations from the beginning.
- Use Supabase Auth.
- Use Server Actions and server-side services for mutations.
- RLS later.
- Backup/Restore excluded.
- Sandbox excluded.
- External integrations are UI/settings only for now.
- AI Query and Chatbot are UI placeholders only until enough data exists.
- Report Builder drag-and-drop is later; ready-made reports first.
- Timetabling starts manual with conflict prevention later, algorithm later.
- QR attendance starts with teacher scanning student QR or QR-token foundation; Beacon later.

### Roadmap Table

Create a table with these columns:

```md
| Area | Requirement | Phase | Status | Notes |
```

Include at least these areas:

#### Security/Auth

- Email/password login
- Google SSO
- OTP mobile later
- Fixed roles
- Extensible permissions later
- Multi-Tenant
- Audit logs
- RLS later

#### Students

- Admissions workflow
- Student profile foundation
- Guardian links
- Student documents metadata
- Student status history
- Student QR token foundation
- Promotions/transfers later
- Withdrawal workflow later
- Achievements later
- Discipline later
- Import/export later
- Dropout risk later

#### Academic

- Academic years
- Terms
- Grade levels
- Classes
- Subjects
- Grade-level subject assignments
- Class enrollments
- Grades later
- Exams later
- Report cards later
- Evaluation systems later

#### Attendance

- Manual attendance planned
- Teacher scans student QR planned
- Absence excuses planned
- Parent notifications later
- Beacon later
- Advanced attendance reports later

#### Timetable

- Manual timetable with conflict prevention planned later
- Automatic generation algorithm later
- Beacon/timetable integration excluded from current phases

#### Finance

- Fee structures planned
- Invoices planned
- Payments planned
- Discounts planned
- Receipts planned
- Expenses/budget later
- Payment integrations later or UI/settings only

#### Communication

- Internal messages planned
- Announcements planned
- Events planned
- Complaints planned
- Surveys later
- Notifications foundation later

#### Reports

- Ready-made reports planned
- Dashboard summaries planned
- Financial reports planned
- Drag-and-drop builder later
- AI Query UI placeholder only later

#### Library

- Textbook distribution later
- Full library workflow later if needed

#### Health

- Basic health record later
- Vaccinations later

#### Settings

- School identity/white-label later
- Template management later
- Plugin/module toggles later
- Backup/Restore excluded
- Sandbox excluded

#### Integrations

- WhatsApp Business UI/settings only later
- Webhooks UI/settings only later
- MoE UI/settings only later
- Google/Microsoft Calendar UI/settings only later
- Power BI/Looker UI/settings only later
- Zapier/Make UI/settings only later

### Implemented Now

List current done areas only:

- Project setup
- Core schema
- Auth + fixed roles
- Students/admissions foundation
- Academic structure foundation

### Planned Next

List:

```txt
06 - Attendance Manual + QR Foundation
```

### Later / Placeholder Only

List features intentionally deferred.

### Explicitly Excluded

Include:

- Backup/Restore
- Sandbox

### Notes For Future Codex Prompts

Include rules:

- Keep one vertical slice per prompt.
- Add migrations only under `supabase/migrations/`.
- Do not rewrite old migrations.
- Always run verification after schema changes.
- Do not trust tenant/school from forms.
- Use membership context server-side.
- Do not introduce RBAC tables unless explicitly requested.

---

## Validation Commands

Run these commands in this phase:

```bash
git status
npm run lint
npm run build
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
```

If `supabase` is not available or Docker is unavailable, report it clearly.

If `types/database.ts` changes after regeneration, keep the generated update only if it reflects the current schema and does not introduce unrelated changes.

Do not suppress failures.

Do not make random code changes to force checks to pass.

---

## Git Rules

If the repository uses Git:

1. Check `git status` before editing.
2. Do not overwrite user changes.
3. Stage only documentation files created/updated by this phase.
4. Do not stage unrelated generated or code files unless a validation command legitimately changed them and the change is required.
5. Commit only if the user or AGENTS.md allows automatic commits.

Suggested commit message:

```txt
docs: add quality gate and roadmap snapshot
```

---

## Final Response Required

At the end, respond with:

1. Summary of documentation created/updated.
2. List of files changed.
3. Verification command results.
4. Manual smoke test status.
5. Any blockers or warnings.
6. Whether the project is ready for Phase 06.
7. Suggested next prompt file name:

```txt
prompts/codex_06_attendance_manual_qr_foundation_prompt.md
```

Keep the response concise but complete.

---

## Strict Do Not Do List

Do not:

- implement Phase 06
- implement attendance
- implement QR attendance
- add tests framework
- add Playwright/Jest/Vitest/Cypress
- add CI/CD
- add or modify database migrations
- alter schema
- alter auth logic
- alter student/admission logic
- alter academic logic
- enable RLS
- implement RBAC
- create permissions tables
- create user_roles
- add new dependencies
- refactor working code
- mark manual tests as passed unless actually verified
- hide failed commands
- commit unrelated files

---

## Success Criteria

This phase is successful when:

- `docs/project-status.md` exists and accurately reflects the current state.
- `docs/verification-report.md` exists and documents real command results.
- `docs/requirements-roadmap.md` exists and maps requirements to phases/statuses.
- Validation commands have been run or truthfully reported as unavailable/skipped.
- No new feature code was implemented.
- No schema changes were made.
- The project has a clear go/no-go decision for Phase 06.
