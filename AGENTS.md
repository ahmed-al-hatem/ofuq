# AGENTS.md

## Project Overview

This project is a full-stack school management system built with:

- Next.js
- TypeScript
- Tailwind CSS
- Supabase CLI
- Supabase Auth
- Supabase/PostgreSQL
- shadcn/ui
- Lucide React
- framer-motion

The project must be built as a real full-stack Next.js application, not as UI-only. Use Server Actions and server-side code for data mutations, authorization checks, tenant validation, and sensitive operations.

## Product Scope

The system targets a multi-tenant school management platform. The MVP should be realistic, complete, and extensible without attempting to implement every advanced feature at once.

Primary MVP modules:

- Core tenant, school, user, and role foundation
- Authentication with Supabase Auth
- Student admissions and student profiles
- Guardian/student relationships
- Academic years, terms, grades, classes, subjects, and enrollments
- Attendance: manual attendance and QR-based attendance
- Grades, exams, report cards, and basic academic reports
- Manual timetabling with conflict prevention
- Basic finance: fees, invoices, payments, discounts, and receipts
- Internal notifications, announcements, messages, events, complaints
- Ready-made dashboards and reports

Later or placeholder-only modules:

- AI Query: UI placeholder only until enough real data exists
- Chatbot: UI placeholder only until enough real data exists
- Report Builder drag and drop: later; start with ready-made reports
- External integrations: settings UI only for now
- Beacon attendance: later
- Automatic timetable generation algorithm: later
- Library module: later or UI placeholder if needed
- Health module: basic student health record only in the MVP
- CMS: only basic public school pages if needed

Explicitly out of scope for now:

- Full RBAC implementation
- Backup and restore
- Sandbox environment
- Real WhatsApp, MoE, BI, Zapier, Make, Calendar, or SMS integrations

## Architecture Principles

- Keep the project full-stack from the beginning.
- Use Server Actions for create, update, delete, attendance, payments, grading, enrollment, and approval workflows.
- Keep Client Components focused on rendering and user interaction.
- Do not put sensitive data access or write operations directly in Client Components.
- Keep data access logic in clear server-side modules such as `lib/`, `services/`, or `actions/`, following the existing project structure.
- Prefer vertical slices over huge cross-cutting implementations.
- Each feature should include UI, server logic, validation, database access, and verification where applicable.
- Avoid speculative abstractions. Add structure only when it reduces real complexity.

## Multi-Tenant Rules

Multi-Tenant support must be preserved from the start.

- Use `tenant_id` in all tenant-owned database tables.
- Include `school_id` where the data belongs to a specific school.
- Validate `tenant_id` server-side before reading or writing sensitive data.
- Never trust `tenant_id` coming only from a client form.
- Use the authenticated user's tenant membership to determine allowed access.
- The MVP may run with a single tenant/school, but the schema and server logic must not block multi-tenant expansion.
- Avoid building UI-only tenant isolation; tenant enforcement belongs in server-side code and database constraints.

## Roles and Permissions

Do not implement full RBAC now.

Use fixed roles for the MVP:

- `system_admin`
- `school_admin`
- `teacher`
- `parent`
- `student`
- `accountant`
- `librarian`

Rules:

- Store user membership and role in a simple tenant/school membership model.
- Use fixed role checks in server-side code.
- Keep the design extensible for future granular permissions.
- Do not create complex `roles`, `permissions`, `role_permissions`, or full RBAC tables unless explicitly requested later.
- If permissions need to expand, prefer a small capability map or permission override layer after the MVP is stable.

## Authentication and Security

- Use Supabase Auth as the authentication system.
- Support Email/Password first.
- Google SSO may be added if it fits cleanly.
- Mobile OTP is later.
- Security expectations are high.
- Do not store secrets or service keys in the repository.
- Use environment variables for Supabase URLs, anon keys, service role keys, and other secrets.
- Supabase service role keys must only be used server-side.
- Do not log sensitive data.
- Protect pages and Server Actions with authentication checks.
- Validate authorization server-side for every sensitive operation.
- Supabase RLS may be added later; do not rely on RLS being complete in the MVP unless explicitly implemented.

## UI and Design

- Use Tailwind CSS as the primary styling approach.
- Use shadcn/ui for maintainable and accessible UI primitives.
- Use Lucide React for icons.
- Use framer-motion for purposeful UI animation and transitions.
- Keep animations subtle, fast, and useful. Avoid animation that harms clarity, performance, or accessibility.
- Build dashboard-style interfaces that are clean, modern, responsive, and practical for school staff.
- Prefer dense, scannable layouts for operational screens.
- Avoid decorative complexity that does not improve usability.
- Use reusable components where they genuinely reduce duplication.

## State, Forms, and Validation

- Prefer the simplest state management option that works.
- Use local React state for local UI state.
- Use React Context only for shared app state that truly needs it.
- Do not add Zustand or another state manager unless it clearly reduces complexity.
- Use React Hook Form and Zod for meaningful forms and validation.
- Use server-side validation before every database write.
- Client-side validation improves UX but must not be the only validation layer.

## Database and Supabase

- Use Supabase CLI for local development.
- Treat Supabase/PostgreSQL as the primary database.
- Keep migrations organized and incremental.
- Prefer clear relational modeling over JSON blobs for core business data.
- Use Supabase Storage for student documents and uploaded files.
- Keep file ownership tied to `tenant_id`, `school_id`, and the relevant record.
- Do not add external backend services unless explicitly needed.

## MVP Implementation Phases

Build in this order unless the user explicitly changes the plan:

1. Project foundation
   - Next.js setup
   - TypeScript
   - Tailwind CSS
   - shadcn/ui
   - Lucide React
   - framer-motion
   - Supabase CLI
   - environment variables
   - base layout and navigation

2. Core and authentication
   - tenants
   - schools
   - user profiles
   - tenant/school memberships
   - fixed roles
   - protected routes
   - audit logs

3. Students and admissions
   - admissions workflow: `pending`, `approved`, `rejected`
   - student profile
   - guardian linking
   - document upload with Supabase Storage
   - unique student number
   - student QR code

4. Academic structure
   - academic years
   - terms
   - grade levels
   - classes
   - subjects
   - class enrollments
   - basic promotion and transfer flows

5. Attendance
   - manual attendance by teacher
   - teacher scans student QR
   - optional kiosk QR flow later
   - absence excuses
   - internal absence notifications
   - basic attendance reports

6. Grades and report cards
   - exams
   - grade entries
   - exam results
   - averages and ranking
   - basic report card PDF

7. Timetabling
   - manual timetable creation
   - prevent teacher conflicts
   - prevent class conflicts
   - prevent room conflicts if rooms exist
   - automatic timetable generation later

8. Finance
   - fee structures
   - fee items
   - invoices
   - invoice items
   - payments
   - discounts
   - basic receipt PDF
   - basic overdue tracking

9. Communication and reports
   - internal messages
   - announcements
   - notification logs
   - school events
   - complaints and complaint updates
   - ready-made dashboards
   - ready-made reports for students, attendance, grades, and finance

10. Later modules and placeholders
   - AI Query UI placeholder
   - Chatbot UI placeholder
   - integration settings UI
   - report builder placeholder
   - library module later
   - expanded health module later

## Attendance Decisions

- Start with manual attendance and QR attendance.
- Preferred QR flow: the teacher scans the student's QR code.
- Kiosk QR flow may be added later if useful.
- Beacon attendance is not part of the MVP.

## Timetabling Decisions

- Start with manual timetable entry.
- Add conflict prevention from the beginning.
- Prevent conflicts for teachers, classes, and rooms when rooms exist.
- Do not implement automatic timetable generation until the manual version is stable.

## Reporting Decisions

- Start with ready-made reports.
- Include dashboards and basic PDF/Excel export where practical.
- Do not build drag-and-drop report builder in the MVP.
- Keep AI Query as a UI placeholder only until the database has enough stable data.

## External Integrations

For now, external integrations are UI and settings only.

Do not implement real integrations for:

- WhatsApp Business API
- SMS
- MoE systems
- Google Calendar
- Microsoft Calendar
- Power BI
- Looker Studio
- Zapier
- Make
- Webhooks

It is acceptable to create settings screens, disabled connection states, and placeholder configuration forms.

## Code Change Rules

- Read the existing code before editing.
- Keep changes scoped to the requested feature.
- Do not rewrite unrelated files.
- Do not perform broad refactors unless the user asks for them.
- If nearby cleanup directly supports the task, it is allowed.
- Do not add dependencies when simple local code is clearer.
- Add dependencies only when they clearly reduce complexity or match the stack.
- Before risky changes, ask the user.
- For ordinary engineering choices, decide and proceed.

## Verification Rules

- Inspect `package.json` before assuming scripts exist.
- Run the most relevant available checks after meaningful changes.
- Prefer:
  - `npm run lint`
  - `npm run build`
  - `npm test`
- If a check fails, explain the failure and whether it is related to the current change.
- Each completed phase or meaningful feature should be commit-ready.

## Git Rules

- Commit after completed and verified tasks when appropriate.
- Review changed files before committing.
- Do not use destructive commands such as `git reset --hard`.
- Do not revert changes you did not make unless the user explicitly requests it.
- Use clear, concise commit messages.

## Codex Workflow

For large work, use vertical slices:

1. Review the existing structure.
2. Define the database changes.
3. Add types and validation schemas.
4. Add server-side services or Server Actions.
5. Add UI pages/components.
6. Add or update tests when practical.
7. Run relevant verification commands.
8. Summarize what changed.

Do not ask Codex to build the whole system at once. Build module by module and keep each task verifiable.

## Communication Style

- Provide a concise but useful summary after each task.
- Mention important files changed.
- Mention verification commands and results.
- If a task is simple, keep the response short.
- If something is blocked or risky, explain the issue and ask for direction.

## Skills

- No skill is mandatory right now.
- If a skill such as `karpathy-guidelines` is added later, use it according to its instructions.
- Even without a skill, follow these principles:
  - understand before implementing
  - keep solutions simple
  - make scoped changes
  - verify results

