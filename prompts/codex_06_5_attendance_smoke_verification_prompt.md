# Codex Execution Prompt — 06.5 Attendance Smoke Test + Verification Snapshot

## Phase

`06.5 - Attendance Smoke Test + Verification Snapshot`

## Role

You are Codex acting as a senior full-stack engineer and QA-minded technical reviewer for **Ofuq | أُفُق**.

Your task is to verify the project after Phase 06 Attendance Manual + QR Foundation and document the result before Phase 07 Grades and Report Cards Foundation.

This is a **quality gate and documentation phase only**.

Do not implement new features.
Do not add migrations.
Do not modify schema.
Do not start Phase 07.

---

## Main Objective

Create a clear verification snapshot for Phase 06 that confirms whether the attendance foundation is safe enough to build Phase 07 on top of it.

You must:

1. Inspect the current project state.
2. Run technical verification commands.
3. Prepare a manual smoke test checklist for attendance flows.
4. Perform manual/browser smoke tests only if the environment allows it.
5. Document what was tested, what passed, what failed, and what was not tested.
6. Update project status and roadmap if needed.
7. Give a clear Go/No-Go recommendation for Phase 07.

---

## Required Pre-Read

Before making changes, read these files:

```txt
AGENTS.md
docs/architecture.md
docs/codex-workflow.md
docs/security-model.md
docs/database.md
docs/project-phases.md
docs/project-status.md
docs/verification-report.md
docs/requirements-roadmap.md
package.json
constants/routes.ts
config/navigation.ts
lib/auth/session.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
lib/attendance/context.ts
lib/actions/attendance.ts
lib/attendance/attendance-sessions.ts
lib/attendance/attendance-records.ts
lib/attendance/absence-excuses.ts
types/attendance.ts
types/database.ts
supabase/migrations/20260706213000_attendance_manual_qr_foundation.sql
```

If a listed file does not exist, report it clearly and continue with the available project state.

---

## Current Expected State

The project should already have:

- Auth foundation.
- Fixed roles through `user_memberships`.
- Multi-Tenant tenant/school membership context.
- Students and admissions foundation.
- Student QR token foundation via `students.qr_token`.
- Academic structure foundation.
- Class enrollments through `class_enrollments`.
- Attendance foundation from Phase 06:
  - `attendance_sessions`
  - `attendance_records`
  - `absence_excuses`
  - manual attendance
  - QR-token entry foundation
  - attendance dashboard pages

Expected active attendance routes:

```txt
/dashboard/attendance
/dashboard/attendance/sessions
/dashboard/attendance/sessions/new
/dashboard/attendance/sessions/[sessionId]
/dashboard/attendance/excuses
```

---

## Strict Scope

### In Scope

You may:

- Run verification commands.
- Inspect code and docs.
- Create `docs/verification-phase-06.md`.
- Update `docs/project-status.md` if needed.
- Update `docs/requirements-roadmap.md` only if it is inaccurate.
- Update `docs/verification-report.md` only with a short pointer to the new Phase 06 verification file if useful.
- Add notes about manual smoke test results.
- Add notes about known limitations and TODOs.

### Out of Scope

Do not:

- Implement Phase 07.
- Add grade/exam/report-card code.
- Add attendance features.
- Add camera QR scanner.
- Add Beacon.
- Add parent notifications.
- Add timetable integration.
- Add full RLS.
- Add full RBAC.
- Add or edit migrations.
- Modify business logic unless you discover a critical compile-breaking issue.
- Add testing frameworks such as Jest, Vitest, Playwright, Cypress, or CI.
- Add new dependencies.
- Perform unrelated refactors.

If you discover a critical bug, do not silently fix it. Report it first in the verification document unless it blocks lint/build and the fix is tiny and clearly scoped.

---

## Verification Commands

Run these commands from the project root:

```bash
git status
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
npm run lint
npm run build
```

If Windows/Docker requires elevation, report that clearly.

If `supabase db reset` has a transient container restart or upstream error, rerun it once if safe, then document both attempts.

If `types/database.ts` changes only because of line endings or formatting, restore the file and document that no schema diff was kept.

After type generation, inspect:

```bash
git diff -- types/database.ts
```

Do not commit invalid generated types.

---

## Manual Smoke Test Requirements

Manual smoke testing should be performed if the local app and seeded/authenticated user environment allow it.

If manual browser testing is not possible, leave checklist items unchecked and clearly explain why.

### Required Route Smoke Tests

Document the status of each route:

```txt
/
/login
/dashboard
/dashboard/admissions
/dashboard/students
/dashboard/academic
/dashboard/academic/enrollments
/dashboard/attendance
/dashboard/attendance/sessions
/dashboard/attendance/sessions/new
/dashboard/attendance/sessions/[sessionId]
/dashboard/attendance/excuses
```

For each route, mark one of:

```txt
Passed
Failed
Blocked
Not tested
```

Include short notes.

---

## Required Attendance Workflow Smoke Checklist

Create a checklist for these workflows:

### Auth and Access

- [ ] Login with valid credentials.
- [ ] Dashboard redirects unauthenticated users to `/login`.
- [ ] Attendance pages require authenticated active membership.
- [ ] Unauthorized roles cannot perform attendance mutations.

### Data Preconditions

- [ ] At least one active student exists.
- [ ] At least one academic year exists.
- [ ] At least one class exists.
- [ ] At least one active `class_enrollment` exists for the student and class.
- [ ] The student has a `qr_token`.

### Attendance Session

- [ ] Create attendance session from `/dashboard/attendance/sessions/new`.
- [ ] Session appears in `/dashboard/attendance/sessions`.
- [ ] Session details route opens successfully.
- [ ] Session status is initially `open`.

### Manual Attendance

- [ ] Enrolled students are listed in the session details page.
- [ ] Mark student as `present` manually.
- [ ] Mark student as `absent` manually.
- [ ] Mark student as `late` manually.
- [ ] Re-recording the same student/session updates or safely preserves one record without duplicate rows.
- [ ] Student without active enrollment cannot be recorded.

### QR Token Attendance Foundation

- [ ] Enter valid student `qr_token` for a student enrolled in the session class/year.
- [ ] Attendance record is created/updated as `present` with QR method.
- [ ] Invalid QR token shows a safe Arabic error.
- [ ] QR token for a student not enrolled in the session class/year is rejected.
- [ ] Full QR token is not exposed in audit metadata or user-visible debug output.

### Session Closing

- [ ] Close an open session.
- [ ] Closed session no longer accepts manual attendance changes.
- [ ] Closed session no longer accepts QR attendance.

### Absence Excuses

- [ ] Absence excuses page opens.
- [ ] Submit text excuse if the UI/action supports it.
- [ ] Approve/reject excuse as `system_admin` or `school_admin` if data exists.
- [ ] Unauthorized roles cannot review excuses.

---

## Suggested SQL Spot Checks

If Supabase SQL access is available, run simple read-only spot checks after smoke testing.

Do not expose secrets or local keys in documentation.

Suggested checks:

```sql
select count(*) from public.attendance_sessions;
select count(*) from public.attendance_records;
select count(*) from public.absence_excuses;
select attendance_session_id, student_id, count(*)
from public.attendance_records
group by attendance_session_id, student_id
having count(*) > 1;
```

Expected duplicate query result: zero rows.

Optional relationship check:

```sql
select ar.id
from public.attendance_records ar
left join public.class_enrollments ce on ce.id = ar.class_enrollment_id
where ce.id is null;
```

Expected result: zero rows.

Document whether these SQL checks were run.

---

## Required Document to Create

Create:

```txt
docs/verification-phase-06.md
```

Use this structure:

```md
# Phase 06 Verification Report

## Scope

## Environment

## Technical Verification Results

| Check | Command | Result | Notes |
| --- | --- | --- | --- |

## Manual Route Smoke Test

| Route | Result | Notes |
| --- | --- | --- |

## Attendance Workflow Smoke Test

### Auth and Access

### Data Preconditions

### Attendance Session

### Manual Attendance

### QR Token Attendance Foundation

### Session Closing

### Absence Excuses

## SQL Spot Checks

## Findings

## Known Issues

## Deferred Items

## Go/No-Go Decision For Phase 07
```

Be honest. If something was not tested, mark it as `Not tested`, not `Passed`.

---

## Project Status Update

Update `docs/project-status.md` only if needed.

Expected updates after this phase:

- Last completed quality phase should become:

```txt
06.5 Attendance Smoke Test + Verification Snapshot
```

- Current phase should remain or become:

```txt
Ready for 07 Grades and Report Cards Foundation
```

- Add a note that Phase 06 smoke verification exists in:

```txt
docs/verification-phase-06.md
```

- If Phase 06 verification finds blockers, update Go/No-Go accordingly.

---

## Requirements Roadmap Update

Update `docs/requirements-roadmap.md` only if it is inaccurate.

Do not rewrite it broadly.

If smoke verification passes enough to proceed, keep:

```txt
07 - Grades and Report Cards Foundation
```

as the planned next phase.

If blockers are found, document them and mark Phase 07 as blocked until resolved.

---

## Verification Report Index Update

Optional: update `docs/verification-report.md` with a short pointer to:

```txt
docs/verification-phase-06.md
```

Do not replace the existing 05.5 report unless necessary.

---

## Git Rules

After creating/updating documentation and running verification:

1. Run `git status`.
2. Stage only documentation files changed in this phase.
3. Do not stage unrelated generated changes unless they are necessary and valid.
4. Commit if verification docs are complete.

Suggested commit message:

```txt
docs: add phase 06 attendance verification
```

---

## Success Criteria

This phase is successful when:

1. No new features were added.
2. No migrations were added or modified.
3. Technical verification commands were run and documented.
4. Manual smoke test checklist was completed or honestly marked as not tested/blocked.
5. `docs/verification-phase-06.md` exists.
6. `docs/project-status.md` is updated if needed.
7. Any blockers are documented clearly.
8. Go/No-Go for Phase 07 is explicit.
9. Final response summarizes validation results and next step.

---

## Final Response Required

When finished, respond with:

1. Summary of Phase 06.5 verification.
2. Files created/modified.
3. Technical command results.
4. Manual smoke test status.
5. Any blockers or known issues.
6. Go/No-Go for Phase 07.
7. Suggested next prompt file name.

Suggested next prompt after successful verification:

```txt
prompts/codex_07_grades_report_cards_foundation_prompt.md
```
