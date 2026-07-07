# Codex Execution Prompt — 13 Complaints and Surveys Foundation

## Phase

`13 - Complaints and Surveys Foundation`

## Role

You are Codex acting as a senior full-stack engineer and database-aware product engineer.

You are working on **Ofuq | أُفُق**, an Arabic-first multi-tenant school management system built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components and Base UI primitives where the project already uses them
- Lucide React icons
- Supabase CLI / PostgreSQL / Supabase Auth
- Server Components by default
- Server Actions for mutations
- server-side services for sensitive reads
- fixed roles through `user_memberships`
- tenant/school context derived from authenticated membership

This phase must add the first foundation for **complaints and surveys** only.

Recommended Arabic UI module name:

```txt
الشكاوى والاستبيانات
```

Recommended main route:

```txt
/dashboard/feedback
```

Keep the work focused. Do not start AI, chatbot, external forms, parent/student public portals, external notifications, advanced analytics, or report-builder work.

---

## Important Precondition

Before implementing this phase, confirm Phase 12 is committed or otherwise clearly present in the current working tree.

Phase 13 may be planned with this prompt, but implementation should not begin on top of an unstable or partially uncommitted Phase 12 state.

If Phase 12 files are present but uncommitted, stop and report:

```txt
No-Go: Phase 12 must be committed before Phase 13 implementation.
```

Do not mix Phase 12 implementation files into the Phase 13 commit.

---

## Main Goal

Implement a focused vertical slice for feedback operations:

1. Complaint submission.
2. Complaint review/update workflow.
3. Complaint resolution.
4. Survey creation.
5. Survey questions.
6. Survey publishing/closing.
7. Survey response submission.
8. Arabic RTL dashboard pages.
9. Server-side tenant/school validation.
10. Audit logs.
11. Documentation and verification.

---

## Required Reading Before Editing

Before editing, inspect:

```txt
AGENTS.md
docs/architecture.md
docs/codex-workflow.md
docs/database.md
docs/project-phases.md
docs/project-status.md
docs/requirements-roadmap.md
docs/security-model.md
docs/supabase-local.md
docs/verification-report.md
constants/routes.ts
config/navigation.ts
types/database.ts
types/students.ts
types/academic.ts
types/attendance.ts
types/grades.ts
types/timetable.ts
types/finance.ts
types/communication.ts
types/reports.ts
types/library.ts
types/student-care.ts
lib/auth/session.ts
lib/actions/require-auth.ts
lib/actions/require-role.ts
lib/actions/require-tenant.ts
lib/students/students.ts
lib/academic/academic-structure.ts
lib/attendance
lib/grades
lib/timetable
lib/finance
lib/communication
lib/reports
lib/library
lib/student-care
app/(dashboard)/dashboard
```

Also inspect current UI page and form patterns before adding new routes.

Do not introduce a parallel architecture.

---

## Current Project Context

The project already has:

1. Core auth, tenant, school, user profiles, fixed roles, and memberships.
2. Students and admissions.
3. Academic structure.
4. Attendance manual + QR foundation.
5. Grades and report cards.
6. Manual timetable with conflict prevention.
7. Finance basics.
8. Communication and ready-made reports.
9. Library foundation.
10. Student care foundation.
11. Local smoke seed data.

Phase 13 must build feedback features on top of the existing tenant/school, user, student, academic, communication, and student-care foundations.

---

## Strict Scope

### In Scope

Add the foundation for:

```txt
complaints
complaint_updates
surveys
survey_questions
survey_responses
feedback dashboard pages
complaint submit/review/resolve workflow
simple survey create/publish/respond workflow
server-side tenant/school validation
audit logs
documentation
verification
```

### Out of Scope

Do not implement:

```txt
anonymous public complaints
public complaint forms
external complaint forms
public survey links
anonymous public survey responses
email/SMS/WhatsApp notifications
push notifications
survey analytics beyond simple counts
AI sentiment analysis
AI classification
AI survey summarization
drag-and-drop survey builder
advanced survey branching logic
file attachments
parent/student portal workflows
advanced escalation workflow
SLA automation
full RBAC
full RLS
```

Keep this phase as a simple operational foundation.

---

## Database Migration

Create exactly one new migration for Phase 13.

Use the existing timestamp convention, for example:

```txt
supabase/migrations/<timestamp>_feedback_foundation.sql
```

Do not modify old migrations.

---

## Recommended Enums

Add minimal enums if they do not already exist:

```txt
complaint_category
complaint_priority
complaint_status
complaint_update_type
survey_target_type
survey_status
survey_question_type
```

Recommended values:

```txt
complaint_category:
academic
behavior
finance
transport
facility
communication
staff
other

complaint_priority:
low
medium
high
urgent

complaint_status:
submitted
in_review
resolved
rejected
cancelled

complaint_update_type:
comment
status_change
assignment
resolution
internal_note

survey_target_type:
school
role
grade_level
class

survey_status:
draft
published
closed
archived

survey_question_type:
short_text
long_text
single_choice
multiple_choice
rating
yes_no
```

Keep enum names clear and module-scoped.

---

## Tables to Add

### 1. `complaints`

Purpose:

Stores school-scoped complaint or feedback tickets submitted by authenticated users.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
submitted_by_user_id uuid not null references public.user_profiles(id)
student_id uuid null references public.students(id) on delete set null
assigned_to_user_id uuid null references public.user_profiles(id)
category public.complaint_category not null default 'other'
priority public.complaint_priority not null default 'medium'
title text not null
description text not null
status public.complaint_status not null default 'submitted'
submitted_at timestamptz not null default now()
resolved_at timestamptz null
resolved_by_user_id uuid null references public.user_profiles(id)
resolution_summary text null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `tenant_id` and `school_id` are mandatory.
- `submitted_by_user_id` must be derived from authenticated actor.
- `student_id`, if provided, must belong to the same tenant/school.
- `assigned_to_user_id`, if provided, must belong to the same tenant/school membership context.
- `resolved_by_user_id` must be the authenticated actor when resolving or rejecting.
- Do not support anonymous complaints in this phase.
- Do not support public complaint links in this phase.

Recommended indexes:

```txt
index on tenant_id, school_id
index on submitted_by_user_id
index on student_id
index on assigned_to_user_id
index on category
index on priority
index on status
index on submitted_at desc
```

---

### 2. `complaint_updates`

Purpose:

Stores timeline updates, internal notes, status changes, assignment changes, and resolution notes for complaints.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
complaint_id uuid not null references public.complaints(id) on delete cascade
author_user_id uuid not null references public.user_profiles(id)
update_type public.complaint_update_type not null default 'comment'
body text not null
old_status public.complaint_status null
new_status public.complaint_status null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Complaint must belong to the same tenant/school.
- `author_user_id` must be derived from authenticated actor.
- Status fields are only populated for status-change updates.
- Do not store huge sensitive text in audit metadata; the update body itself belongs in this table.

Recommended indexes:

```txt
index on tenant_id, school_id
index on complaint_id
index on author_user_id
index on update_type
index on created_at desc
```

---

### 3. `surveys`

Purpose:

Stores simple school-scoped surveys targeted to a school audience.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
title text not null
description text null
target_type public.survey_target_type not null default 'school'
target_role public.user_role null
grade_level_id uuid null references public.grade_levels(id)
class_id uuid null references public.classes(id)
status public.survey_status not null default 'draft'
opens_at timestamptz null
closes_at timestamptz null
created_by_user_id uuid not null references public.user_profiles(id)
published_at timestamptz null
closed_at timestamptz null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `created_by_user_id` must be derived from authenticated actor.
- `target_type = school` should not require role/grade/class.
- `target_type = role` requires `target_role`.
- `target_type = grade_level` requires `grade_level_id`.
- `target_type = class` requires `class_id`.
- Grade level/class must belong to the same tenant/school.
- `closes_at`, if provided, must be after `opens_at` or after `published_at`.
- Do not create public survey links in this phase.

Recommended indexes:

```txt
index on tenant_id, school_id
index on target_type
index on target_role
index on grade_level_id
index on class_id
index on status
index on published_at desc
index on closes_at
```

---

### 4. `survey_questions`

Purpose:

Stores simple ordered questions for a survey.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
survey_id uuid not null references public.surveys(id) on delete cascade
question_text text not null
question_type public.survey_question_type not null default 'short_text'
options jsonb null
is_required boolean not null default true
sort_order integer not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Survey must belong to the same tenant/school.
- `options` should be a JSON array/object only when needed for choice/rating questions.
- Keep validation simple but safe.
- Do not implement drag-and-drop question builder.
- Do not implement branching or conditional logic.

Recommended indexes:

```txt
index on tenant_id, school_id
index on survey_id
index on sort_order
```

---

### 5. `survey_responses`

Purpose:

Stores one authenticated response per user per survey as JSON answers.

Recommended fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
survey_id uuid not null references public.surveys(id) on delete cascade
respondent_user_id uuid not null references public.user_profiles(id)
student_id uuid null references public.students(id) on delete set null
answers jsonb not null
submitted_at timestamptz not null default now()
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `respondent_user_id` must be derived from authenticated actor.
- Survey must belong to the same tenant/school.
- Survey must be `published` and open when responding.
- Do not allow responses to closed/archived/draft surveys.
- Do not allow duplicate response for the same survey/user.
- `answers` must be a JSON object.
- `student_id`, if provided, must belong to the same tenant/school.
- Do not allow anonymous responses in this phase.

Recommended indexes/constraints:

```txt
index on tenant_id, school_id
index on survey_id
index on respondent_user_id
index on submitted_at desc
unique on survey_id, respondent_user_id
```

---

## Server-Side Validation Rules

All mutations must derive scope from authenticated active membership.

Never trust these fields from forms:

```txt
tenant_id
school_id
role
submitted_by_user_id
assigned_to_user_id
resolved_by_user_id
author_user_id
created_by_user_id
respondent_user_id
```

Validate server-side:

1. Current actor has an allowed role.
2. Complaint belongs to current tenant/school.
3. Complaint student, if provided, belongs to current tenant/school.
4. Assigned user, if provided, belongs to current tenant/school.
5. Complaint status transitions are valid.
6. Survey belongs to current tenant/school.
7. Survey target relationships are valid.
8. Survey questions belong to current tenant/school and survey.
9. Survey cannot be answered unless published and within open/close window if those dates are set.
10. Respondent can only submit one response per survey.
11. Response answers are valid JSON object.
12. No client-submitted tenant/school/user/role values are trusted.

Use database constraints where useful, but keep business workflow checks clear in server-side services/actions.

---

## Role Rules

Use fixed roles only.

Do not add RBAC tables.

### Full Feedback Management

Allowed roles:

```txt
system_admin
school_admin
```

They can:

```txt
review complaints
assign complaints
change complaint status
resolve/reject complaints
create surveys
add survey questions
publish/close/archive surveys
view survey responses
view feedback dashboard
```

### Complaint Submission

Allowed authenticated school staff roles:

```txt
system_admin
school_admin
teacher
accountant
librarian
```

Parent/student complaint submission remains deferred unless the existing app already has safe parent/student dashboards.

### Survey Responses

Allowed authenticated school staff roles:

```txt
system_admin
school_admin
teacher
accountant
librarian
```

Parent/student survey response remains deferred unless the existing app already has safe parent/student dashboards.

---

## Server Context

Create:

```txt
lib/feedback/context.ts
```

Recommended helper:

```ts
requireFeedbackContext(allowedRoles)
```

It must derive from authenticated active membership:

```txt
user_id
role
tenant_id
school_id
membership
```

Never accept tenant/school/role from client input.

---

## Server Services

Create:

```txt
lib/feedback/context.ts
lib/feedback/complaints.ts
lib/feedback/surveys.ts
```

Responsibilities:

### `complaints.ts`

```txt
list complaints
get complaint details with updates
create complaint
add complaint update
assign complaint
change complaint status
resolve complaint
validate complaint tenant/school ownership
validate related student ownership
validate assigned user membership
```

### `surveys.ts`

```txt
list surveys
get survey details with questions
create survey
add survey question
publish survey
close survey
archive survey
list survey responses
submit survey response
validate survey target relationships
validate response eligibility
prevent duplicate responses
```

Keep services small and readable.

---

## Server Actions

Create:

```txt
lib/actions/feedback.ts
```

Recommended actions:

```txt
createComplaintAction
addComplaintUpdateAction
assignComplaintAction
updateComplaintStatusAction
resolveComplaintAction
createSurveyAction
addSurveyQuestionAction
publishSurveyAction
closeSurveyAction
archiveSurveyAction
submitSurveyResponseAction
```

If this becomes too large, keep the core actions and document deferred actions clearly. Do not add out-of-scope functionality.

Use Zod validation with Arabic user-facing messages where practical.

Actions must:

- call `requireFeedbackContext`
- validate role server-side
- derive tenant/school/user from active membership
- validate all relationships server-side
- write audit logs for important events
- return the existing project `ActionResult` pattern if available

---

## Audit Logs

Write audit logs for important actions:

```txt
feedback.complaint.created
feedback.complaint.updated
feedback.complaint.assigned
feedback.complaint.status_changed
feedback.complaint.resolved
feedback.survey.created
feedback.survey.question_added
feedback.survey.published
feedback.survey.closed
feedback.survey.archived
feedback.survey.response_submitted
```

Keep audit metadata minimal:

```txt
complaint_id
survey_id
question_id
response_id
student_id
old_status
new_status
```

Do not store full complaint descriptions, complaint update bodies, survey answers, secrets, auth tokens, or credentials in audit metadata.

---

## Routes and Pages

Add pages under:

```txt
app/(dashboard)/dashboard/feedback
```

Required routes:

```txt
/dashboard/feedback
/dashboard/feedback/complaints
/dashboard/feedback/complaints/new
/dashboard/feedback/complaints/[complaintId]
/dashboard/feedback/surveys
/dashboard/feedback/surveys/new
/dashboard/feedback/surveys/[surveyId]
/dashboard/feedback/surveys/[surveyId]/respond
/dashboard/feedback/surveys/[surveyId]/responses
```

Do not create public feedback routes in this phase.

---

## UI Requirements

Use Arabic RTL copy.

Keep UI simple and consistent with existing dashboard patterns.

### `/dashboard/feedback`

Overview cards:

```txt
الشكاوى المفتوحة
الشكاوى قيد المراجعة
الشكاوى المحلولة
الاستبيانات المنشورة
إجمالي الردود
```

### `/dashboard/feedback/complaints`

Show complaint table:

```txt
title
category
priority
status
submitted_by
assigned_to
submitted_at
```

### `/dashboard/feedback/complaints/new`

Fields:

```txt
student_id optional
category
priority
title
description
```

Do not expose tenant/school/user fields.

### `/dashboard/feedback/complaints/[complaintId]`

Show:

```txt
complaint details
status
assignment
updates timeline
resolution summary
```

Allow, by role:

```txt
add update
assign complaint
move to in_review
resolve complaint
reject complaint
cancel if appropriate
```

### `/dashboard/feedback/surveys`

Show survey table:

```txt
title
target
status
published_at
closes_at
response count
```

### `/dashboard/feedback/surveys/new`

Fields:

```txt
title
description optional
target_type
target_role optional
grade_level_id optional
class_id optional
opens_at optional
closes_at optional
```

Keep question creation simple. You may add questions after survey creation on the survey detail page.

### `/dashboard/feedback/surveys/[surveyId]`

Show survey details and question list.

Allow admin actions:

```txt
add question while draft
publish survey
close survey
archive survey
```

### `/dashboard/feedback/surveys/[surveyId]/respond`

Show response form for published/open surveys.

Support these simple answer types:

```txt
short_text
long_text
single_choice
multiple_choice
rating
yes_no
```

If implementing all answer types is too large, support a safe subset and document the limitation.

### `/dashboard/feedback/surveys/[surveyId]/responses`

Admin-only response list.

Show compact response summaries only.

Do not expose raw JSON in a confusing way unless formatted safely.

---

## Routes and Navigation

Update:

```txt
constants/routes.ts
config/navigation.ts
```

Suggested route helpers:

```ts
feedback: "/dashboard/feedback",
feedbackComplaints: "/dashboard/feedback/complaints",
newFeedbackComplaint: "/dashboard/feedback/complaints/new",
feedbackComplaintDetails: (complaintId: string) => `/dashboard/feedback/complaints/${complaintId}`,
feedbackSurveys: "/dashboard/feedback/surveys",
newFeedbackSurvey: "/dashboard/feedback/surveys/new",
feedbackSurveyDetails: (surveyId: string) => `/dashboard/feedback/surveys/${surveyId}`,
feedbackSurveyRespond: (surveyId: string) => `/dashboard/feedback/surveys/${surveyId}/respond`,
feedbackSurveyResponses: (surveyId: string) => `/dashboard/feedback/surveys/${surveyId}/responses`,
```

Activate only the feedback navigation item.

Do not activate AI, integrations, report builder, or other future modules.

---

## Types

Add:

```txt
types/feedback.ts
```

Update generated Supabase types after successful database reset:

```bash
supabase gen types typescript --local > types/database.ts
```

Do not keep invalid, empty, or partial generated types.

---

## Local Seed Safety Rule

Prefer not to modify seed files in Phase 13.

Do not modify these files unless strictly necessary:

```txt
supabase/seed.sql
supabase/seeds/auth_smoke_token_defaults.sql
supabase/config.toml
```

If seed/config changes are unavoidable:

1. Keep local-only deterministic data.
2. Preserve the existing seed order.
3. Do not weaken local Auth smoke safety.
4. Do not add production secrets or real users.
5. Run full `supabase db reset`.
6. Update `docs/supabase-local.md`.

Expected current order:

```toml
sql_paths = ["./seed.sql", "./seeds/auth_smoke_token_defaults.sql"]
```

---

## Verification Commands

After implementation, run:

```bash
git status
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
npm run lint
npm run build
git diff --check
```

If `supabase db reset` fails, stop and report clearly.

Do not mark Phase 13 verified until reset, type generation, lint, build, and diff check pass.

---

## SQL Spot Checks

After successful reset, run checks for the new feedback tables:

```sql
select count(*) from public.complaints;
select count(*) from public.complaint_updates;
select count(*) from public.surveys;
select count(*) from public.survey_questions;
select count(*) from public.survey_responses;
```

If seed was not changed, counts may be `0` after reset. That is acceptable as long as the tables exist and the queries succeed.

Verify duplicate survey responses are prevented:

```sql
select survey_id, respondent_user_id, count(*)
from public.survey_responses
group by survey_id, respondent_user_id
having count(*) > 1;
```

Expected result:

```txt
0 rows
```

---

## Manual Smoke Test Guidance

If browser access is available, test:

1. Login as `school_admin`.
2. Open `/dashboard/feedback`.
3. Create a complaint.
4. Add a complaint update.
5. Move complaint to `in_review`.
6. Resolve complaint.
7. Create survey draft.
8. Add survey questions.
9. Publish survey.
10. Submit response as allowed user.
11. Try duplicate response and confirm it is blocked.
12. Close survey.
13. Confirm closed survey cannot receive responses.
14. Confirm forms do not expose tenant/school fields.
15. Confirm unauthorized roles cannot mutate restricted feedback records.

If browser/authenticated smoke is unavailable, document it honestly.

Do not mark browser workflows as passed unless actually tested.

---

## Documentation Updates

Update:

```txt
docs/database.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/project-status.md
docs/security-model.md
docs/verification-report.md
```

Update `docs/supabase-local.md` only if seed/config/local setup behavior changes.

Documentation must mention:

- new feedback tables
- complaint workflow scope
- complaint updates scope
- survey creation/publishing scope
- survey response scope
- role access rules
- server-side tenant/school validation
- no anonymous public complaints
- no public survey links
- no external notifications
- no AI sentiment/classification/summarization
- no drag-and-drop survey builder
- verification results
- Go/No-Go for the next phase

---

## Expected Final Response

After implementation, report:

1. Precondition result: whether Phase 12 was committed or cleanly present.
2. Summary of completed Phase 13 work.
3. Files created/modified.
4. Database objects added.
5. Server services/actions added.
6. Routes/pages added.
7. Feedback workflow behavior.
8. Security and tenant validation summary.
9. Seed/config handling summary.
10. Verification command results.
11. SQL spot check results.
12. Browser smoke status.
13. Documentation updates.
14. Commit hash if committed.
15. Final Go/No-Go for next phase.

---

## Success Criteria

Phase 13 succeeds only when:

- Phase 12 is not mixed into the Phase 13 commit.
- One Phase 13 migration replays from scratch.
- Feedback tables exist.
- Complaint pages compile.
- Survey pages compile.
- Server-side services derive tenant/school scope from membership.
- Related student/user/target relationships are validated server-side.
- No client-submitted tenant/school/role/user fields are trusted.
- Duplicate survey responses are prevented.
- Closed/draft/archived surveys cannot receive responses.
- No anonymous public complaints are added.
- No public survey links are added.
- No external notifications are added.
- No AI analysis or survey summarization is added.
- `supabase db reset` passes.
- `types/database.ts` is regenerated and valid.
- SQL spot checks pass.
- `npm run lint` passes.
- `npm run build` passes.
- `git diff --check` passes.
- Docs are updated.

---

## Suggested Next Phase After Successful Completion

After Phase 13 is verified and committed, plan the next phase separately.

Do not start it in this prompt.

Potential next phase options:

```txt
14 - Settings and Integrations Placeholders Foundation
or
14 - Parent and Student Read-Only Portal Foundation
or
14 - Automated Tests Foundation
```

Choose the next phase only after Phase 13 is complete and documented.
