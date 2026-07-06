# Project Status

## Snapshot

- Project name: Ofuq | أُفُق
- Current phase: Ready for 06 Attendance Manual + QR Foundation
- Last completed implementation phase: 05 Academic Structure Foundation
- Last completed quality phase: 05.5 Quality Gate + Documentation Snapshot
- Next implementation phase: 06 Attendance Manual + QR Foundation
- Architecture summary: full-stack Next.js App Router application backed by Supabase Auth and Supabase PostgreSQL, using fixed roles from `user_memberships` and multi-tenant tenant/school context from the authenticated active membership.

## Tech Stack

| Area | Current Stack |
| --- | --- |
| Framework | Next.js 16.2.10 |
| UI runtime | React 19.2.4, React DOM 19.2.4 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, `tw-animate-css` |
| Supabase | `@supabase/ssr` 0.12.0, `@supabase/supabase-js` 2.110.0, Supabase CLI/local PostgreSQL |
| UI primitives | shadcn/ui-style source components, Base UI, Hugeicons components, Lucide React 1.23.0 |
| Motion | framer-motion 12.42.2 |
| Validation/forms | Zod 4.4.3, React Hook Form 7.81.0, `@hookform/resolvers` 5.4.0 |
| Utilities | `clsx`, `tailwind-merge`, `class-variance-authority`, `date-fns` |

## Completed Phases

| Phase | Status | Summary |
| --- | --- | --- |
| Phase 01 Project Setup and Architecture | Done | Next.js App Router foundation, RTL Arabic root, Tailwind/shadcn-style UI primitives, dashboard shell, and base docs. |
| Phase 02 Supabase Core Schema Foundation | Done | Core `tenants`, `schools`, `user_profiles`, `user_memberships`, and `audit_logs` schema foundation. |
| Phase 03 Auth + Fixed Roles + Membership Context | Done | Email/password login, sign-out, protected dashboard layout, session helpers, fixed role guards, and active membership context. |
| Phase 04 Students and Admissions Foundation | Done | Admissions workflow, student records, guardian links, document metadata, status history, and student QR token foundation. |
| Phase 05 Academic Structure Foundation | Done | Academic years, terms, grade levels, classes, subjects, grade-level subject assignments, class enrollments, and academic dashboard pages. |
| Phase 05.5 Quality Gate + Documentation Snapshot | Done | Documentation snapshot and verification report were created. The Supabase local reset/type-generation blocker was resolved and the project is ready for Phase 06. |

## Current Implemented Modules

- Auth foundation with Supabase Auth email/password login and sign-out.
- Tenant/school membership foundation through `public.user_memberships`.
- Fixed role checks for MVP roles without full RBAC.
- Students and admissions foundation, including admission creation/approval and student records.
- Academic structure foundation, including years, terms, grades, classes, subjects, subject assignments, and class enrollments.
- Dashboard shell and navigation with Arabic-first RTL UI.

Attendance, grades, finance, communication, library, and health are not implemented yet.

## Current Routes

| Route | Status | Notes |
| --- | --- | --- |
| `/` | Active | Public home route. |
| `/login` | Active | Supabase email/password login. |
| `/dashboard` | Active | Protected dashboard overview. |
| `/dashboard/admissions` | Active | Admissions list and management actions. |
| `/dashboard/admissions/new` | Active | Admission creation form. |
| `/dashboard/students` | Active | Official student records. |
| `/dashboard/academic` | Active | Academic module overview. |
| `/dashboard/academic/years` | Active | Academic years and terms. |
| `/dashboard/academic/grade-levels` | Active | Grade levels. |
| `/dashboard/academic/classes` | Active | Classes/sections. |
| `/dashboard/academic/subjects` | Active | Subjects and grade-level subject assignments. |
| `/dashboard/academic/enrollments` | Active | Student class enrollments. |

Configured dynamic helpers also exist for admission and student detail URLs, but matching route files are not currently present.

## Current Database Slices

- Core tenant/auth tables: `tenants`, `schools`, `user_profiles`, `user_memberships`, `audit_logs`.
- Students/admissions tables: `student_admissions`, `students`, `student_guardians`, `student_documents`, `student_status_history`.
- Academic structure tables: `academic_years`, `terms`, `grade_levels`, `classes`, `subjects`, `grade_level_subjects`, `class_enrollments`.
- Storage foundation: private `student-documents` bucket is created by the student/admissions migration.
- Local Supabase schema replay is currently verified with `supabase db reset`.
- Local type generation is currently verified with `supabase gen types typescript --local > types/database.ts`.
- RLS remains deferred by design; tenant/school isolation is currently enforced in server-side code and schema constraints.

## Current Security Model

- Supabase Auth is the identity source of truth.
- `public.user_profiles` stores application profile data with IDs matching `auth.users.id`.
- `public.user_memberships` stores fixed roles and tenant/school membership context.
- Server-side helpers resolve the authenticated user, primary active membership, role, tenant, and school.
- Sensitive reads and mutations use Server Components, Server Actions, or server-side service modules.
- Client-submitted `tenant_id`, `school_id`, and `role` are not trusted.
- Full RBAC is not implemented.
- Full RLS is not implemented yet.
- `SUPABASE_SERVICE_ROLE_KEY` remains server-only.

## Current Documentation

- `docs/architecture.md`
- `docs/database.md`
- `docs/security-model.md`
- `docs/supabase-local.md`
- `docs/project-phases.md`
- `docs/codex-workflow.md`
- `docs/project-status.md`
- `docs/verification-report.md`
- `docs/requirements-roadmap.md`

## Current Known Limitations

- No attendance module yet.
- No grades, exams, or report cards yet.
- No timetable logic yet.
- No finance module yet.
- No parent notifications or communication module yet.
- No full RLS yet.
- No full RBAC yet.
- No external integrations yet.
- No automated test suite beyond lint/build verification.
- Browser/manual smoke testing was not performed in Phase 05.5; see `docs/verification-report.md`.
- On Windows, Supabase local development may require Docker Desktop TCP daemon exposure for analytics/vector health.

## Recommended Next Phase

Recommended next phase:

```txt
06 - Attendance Manual + QR Foundation
```

Rationale: students now exist, academic years/classes/enrollments now exist, and attendance can build on `class_enrollments` without inventing its own student/class context.

Go/no-go status: Go for Phase 06 schema work after the successful Supabase local reset/type-generation recovery documented in `docs/verification-report.md`.
