-- Phase 15 local demo smoke checks
-- Run this file manually after `supabase db reset` against the local seeded stack.
-- Expected outcome:
-- 1. Auth users list returns the local `@ofuq.local` accounts.
-- 2. Token null-safety count returns exactly 0.
-- 3. Core and module coverage counts return non-zero seeded data for the demo dataset.
-- 4. Relationship sanity checks return 0 rows or 0 counts for every anomaly query.

-- Auth users
select email
from auth.users
where email like '%@ofuq.local'
order by email;

-- Auth token null safety
-- Expected: users_with_null_token_fields = 0
select count(*) as users_with_null_token_fields
from auth.users
where email like '%@ofuq.local'
  and (
    confirmation_token is null
    or recovery_token is null
    or email_change_token_new is null
    or email_change_token_current is null
    or email_change is null
    or phone_change_token is null
    or phone_change is null
    or reauthentication_token is null
  );

-- Core counts
-- Expected: each table returns seeded demo rows and should be non-zero after reset.
select 'user_profiles' as table_name, count(*) from public.user_profiles
union all select 'user_memberships', count(*) from public.user_memberships
union all select 'grade_levels', count(*) from public.grade_levels
union all select 'classes', count(*) from public.classes
union all select 'subjects', count(*) from public.subjects
union all select 'students', count(*) from public.students
union all select 'student_guardians', count(*) from public.student_guardians
union all select 'class_enrollments', count(*) from public.class_enrollments;

-- Module coverage counts
-- Expected: each table returns seeded demo rows and should be non-zero after reset.
select 'attendance_sessions' as table_name, count(*) from public.attendance_sessions
union all select 'attendance_records', count(*) from public.attendance_records
union all select 'exams', count(*) from public.exams
union all select 'exam_results', count(*) from public.exam_results
union all select 'timetable_slots', count(*) from public.timetable_slots
union all select 'invoices', count(*) from public.invoices
union all select 'payments', count(*) from public.payments
union all select 'messages', count(*) from public.messages
union all select 'book_loans', count(*) from public.book_loans
union all select 'health_records', count(*) from public.health_records
union all select 'complaints', count(*) from public.complaints
union all select 'surveys', count(*) from public.surveys
union all select 'survey_responses', count(*) from public.survey_responses;

-- Relationship sanity checks
-- Expected: every count query below returns 0.
select count(*) as orphan_class_enrollments
from public.class_enrollments ce
left join public.students s on s.id = ce.student_id
where s.id is null;

select count(*) as orphan_attendance_records
from public.attendance_records ar
left join public.students s on s.id = ar.student_id
where s.id is null;

select count(*) as orphan_exam_results
from public.exam_results er
left join public.students s on s.id = er.student_id
where s.id is null;

-- Expected: zero rows returned.
select copy_id, count(*)
from public.book_loans
where status = 'active'
group by copy_id
having count(*) > 1;

-- Expected: zero rows returned.
select survey_id, respondent_user_id, count(*)
from public.survey_responses
group by survey_id, respondent_user_id
having count(*) > 1;

-- Expected: zero rows returned.
select student_id, count(*)
from public.health_records
where status = 'active'
group by student_id
having count(*) > 1;

-- Phase 16 parent/student portal foundation checks
-- Expected: students_linked_to_user_accounts >= 2
select count(*) as students_linked_to_user_accounts
from public.students
where student_user_id is not null;

-- Expected: guardians_linked_to_user_accounts >= 2
select count(*) as guardians_linked_to_user_accounts
from public.student_guardians
where guardian_user_id is not null;

-- Expected: zero rows returned.
select student_user_id, count(*)
from public.students
where student_user_id is not null
group by student_user_id
having count(*) > 1;

-- Expected: linked_parent_students >= 2
select count(*) as linked_parent_students
from public.student_guardians sg
join public.students s on s.id = sg.student_id
where sg.guardian_user_id is not null
  and sg.tenant_id = s.tenant_id
  and sg.school_id = s.school_id;
