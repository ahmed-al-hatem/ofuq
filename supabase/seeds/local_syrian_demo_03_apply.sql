set search_path = public, auth, extensions;

-- 02 Auth users and memberships

insert into public.tenants (
  id,
  name,
  slug,
  status,
  locale,
  direction,
  created_at,
  updated_at
)
select
  ctx.tenant_id,
  'Ofuq Syrian Demo Tenant',
  'ofuq-syrian-demo',
  'active',
  'ar',
  'rtl',
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_context ctx
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  status = excluded.status,
  locale = excluded.locale,
  direction = excluded.direction,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.schools (
  id,
  tenant_id,
  name,
  code,
  slug,
  official_name,
  email,
  phone,
  address,
  status,
  created_at,
  updated_at
)
select
  ctx.school_id,
  ctx.tenant_id,
  'مدرسة أفق النموذجية الخاصة',
  'SYR-DEMO',
  'ofuq-syrian-demo-school',
  'مدرسة أفق النموذجية الخاصة',
  'school.demo@ofuq.local',
  '+963112233445',
  'حي المزة، دمشق، سوريا',
  'active',
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  name = excluded.name,
  code = excluded.code,
  slug = excluded.slug,
  official_name = excluded.official_name,
  email = excluded.email,
  phone = excluded.phone,
  address = excluded.address,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  demo_users.user_id,
  'authenticated',
  'authenticated',
  demo_users.email,
  extensions.crypt('OfuqLocal123!', extensions.gen_salt('bf')),
  ctx.seed_created_at,
  jsonb_build_object(
    'provider',
    'email',
    'providers',
    jsonb_build_array('email')
  ),
  jsonb_build_object(
    'full_name',
    demo_users.full_name,
    'display_name',
    demo_users.display_name
  ),
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_users demo_users
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  demo_users.user_id,
  demo_users.user_id,
  demo_users.user_id::text,
  jsonb_build_object(
    'sub',
    demo_users.user_id::text,
    'email',
    demo_users.email,
    'email_verified',
    true
  ),
  'email',
  ctx.seed_created_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_users demo_users
cross join public.temp_demo_context ctx
on conflict (provider_id, provider) do update
set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  last_sign_in_at = excluded.last_sign_in_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.user_profiles (
  id,
  full_name,
  display_name,
  phone,
  preferred_locale,
  preferred_direction,
  created_at,
  updated_at
)
select
  demo_users.user_id,
  demo_users.full_name,
  demo_users.display_name,
  demo_users.phone,
  'ar',
  'rtl',
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_users demo_users
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  full_name = excluded.full_name,
  display_name = excluded.display_name,
  phone = excluded.phone,
  preferred_locale = excluded.preferred_locale,
  preferred_direction = excluded.preferred_direction,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.user_memberships (
  id,
  user_id,
  tenant_id,
  school_id,
  role,
  status,
  is_primary,
  created_at,
  updated_at
)
select
  demo_users.membership_id,
  demo_users.user_id,
  ctx.tenant_id,
  ctx.school_id,
  demo_users.role,
  'active',
  true,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_users demo_users
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  user_id = excluded.user_id,
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  role = excluded.role,
  status = excluded.status,
  is_primary = excluded.is_primary,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- 03 Academic structure

insert into public.academic_years (
  id,
  tenant_id,
  school_id,
  name,
  code,
  starts_on,
  ends_on,
  status,
  is_current,
  created_at,
  updated_at
)
select
  ctx.academic_year_id,
  ctx.tenant_id,
  ctx.school_id,
  '2026-2027',
  '2026-2027',
  '2026-09-01',
  '2027-06-30',
  'active',
  true,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  name = excluded.name,
  code = excluded.code,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  status = excluded.status,
  is_current = excluded.is_current,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.terms (
  id,
  tenant_id,
  school_id,
  academic_year_id,
  name,
  code,
  term_order,
  starts_on,
  ends_on,
  status,
  created_at,
  updated_at
)
select
  term_values.term_id,
  ctx.tenant_id,
  ctx.school_id,
  ctx.academic_year_id,
  term_values.name,
  term_values.code,
  term_values.term_order,
  term_values.starts_on,
  term_values.ends_on,
  'active',
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_context ctx
cross join (
  values
    (
      (select term_1_id from public.temp_demo_context),
      'الفصل الأول',
      'T1',
      1,
      '2026-09-01'::date,
      '2027-01-15'::date
    ),
    (
      (select term_2_id from public.temp_demo_context),
      'الفصل الثاني',
      'T2',
      2,
      '2027-02-01'::date,
      '2027-06-15'::date
    )
) as term_values(term_id, name, code, term_order, starts_on, ends_on)
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  name = excluded.name,
  code = excluded.code,
  term_order = excluded.term_order,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.grade_levels (
  id,
  tenant_id,
  school_id,
  name,
  code,
  grade_order,
  stage,
  status,
  created_at,
  updated_at
)
select
  grade_levels.grade_level_id,
  ctx.tenant_id,
  ctx.school_id,
  grade_levels.name,
  grade_levels.code,
  grade_levels.grade_order,
  grade_levels.stage,
  'active',
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_grade_levels grade_levels
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  name = excluded.name,
  code = excluded.code,
  grade_order = excluded.grade_order,
  stage = excluded.stage,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.classes (
  id,
  tenant_id,
  school_id,
  academic_year_id,
  grade_level_id,
  name,
  section,
  capacity,
  homeroom_teacher_id,
  room_name,
  status,
  created_at,
  updated_at
)
select
  classes.class_id,
  ctx.tenant_id,
  ctx.school_id,
  ctx.academic_year_id,
  grade_levels.grade_level_id,
  classes.name,
  classes.section,
  classes.capacity,
  homeroom_teachers.user_id,
  classes.room_name,
  'active',
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_classes classes
join public.temp_demo_grade_levels grade_levels
  on grade_levels.code = classes.grade_code
join public.temp_demo_users homeroom_teachers
  on homeroom_teachers.email = classes.homeroom_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  grade_level_id = excluded.grade_level_id,
  name = excluded.name,
  section = excluded.section,
  capacity = excluded.capacity,
  homeroom_teacher_id = excluded.homeroom_teacher_id,
  room_name = excluded.room_name,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.subjects (
  id,
  tenant_id,
  school_id,
  name,
  code,
  description,
  subject_type,
  status,
  created_at,
  updated_at
)
select
  subjects.subject_id,
  ctx.tenant_id,
  ctx.school_id,
  subjects.name,
  subjects.code,
  subjects.description,
  subjects.subject_type,
  'active',
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_subjects subjects
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  name = excluded.name,
  code = excluded.code,
  description = excluded.description,
  subject_type = excluded.subject_type,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.grade_level_subjects (
  id,
  tenant_id,
  school_id,
  academic_year_id,
  grade_level_id,
  subject_id,
  is_required,
  weekly_periods,
  sort_order,
  created_at,
  updated_at
)
select
  grade_subjects.grade_level_subject_id,
  ctx.tenant_id,
  ctx.school_id,
  ctx.academic_year_id,
  grade_levels.grade_level_id,
  subjects.subject_id,
  true,
  grade_subjects.weekly_periods,
  grade_subjects.sort_order,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_grade_subjects grade_subjects
join public.temp_demo_grade_levels grade_levels
  on grade_levels.code = grade_subjects.grade_code
join public.temp_demo_subjects subjects
  on subjects.code = grade_subjects.subject_code
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  grade_level_id = excluded.grade_level_id,
  subject_id = excluded.subject_id,
  is_required = excluded.is_required,
  weekly_periods = excluded.weekly_periods,
  sort_order = excluded.sort_order,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- 04 Students and guardians

insert into public.student_admissions (
  id,
  tenant_id,
  school_id,
  submitted_by_user_id,
  reviewed_by_user_id,
  status,
  student_first_name,
  student_middle_name,
  student_last_name,
  student_full_name,
  gender,
  birth_date,
  nationality,
  guardian_name,
  guardian_email,
  guardian_phone,
  guardian_relation,
  notes,
  decision_notes,
  submitted_at,
  reviewed_at,
  created_at,
  updated_at
)
select
  admissions.admission_id,
  ctx.tenant_id,
  ctx.school_id,
  submitted_by.user_id,
  reviewed_by.user_id,
  admissions.status,
  admissions.student_first_name,
  admissions.student_middle_name,
  admissions.student_last_name,
  admissions.student_full_name,
  admissions.gender,
  admissions.birth_date,
  admissions.nationality,
  admissions.guardian_name,
  admissions.guardian_email,
  admissions.guardian_phone,
  admissions.guardian_relation,
  admissions.notes,
  admissions.decision_notes,
  admissions.submitted_at,
  admissions.reviewed_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_admissions admissions
left join public.temp_demo_users submitted_by
  on submitted_by.email = admissions.submitted_by_email
left join public.temp_demo_users reviewed_by
  on reviewed_by.email = admissions.reviewed_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  submitted_by_user_id = excluded.submitted_by_user_id,
  reviewed_by_user_id = excluded.reviewed_by_user_id,
  status = excluded.status,
  student_first_name = excluded.student_first_name,
  student_middle_name = excluded.student_middle_name,
  student_last_name = excluded.student_last_name,
  student_full_name = excluded.student_full_name,
  gender = excluded.gender,
  birth_date = excluded.birth_date,
  nationality = excluded.nationality,
  guardian_name = excluded.guardian_name,
  guardian_email = excluded.guardian_email,
  guardian_phone = excluded.guardian_phone,
  guardian_relation = excluded.guardian_relation,
  notes = excluded.notes,
  decision_notes = excluded.decision_notes,
  submitted_at = excluded.submitted_at,
  reviewed_at = excluded.reviewed_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.students (
  id,
  tenant_id,
  school_id,
  admission_id,
  student_user_id,
  student_number,
  qr_token,
  first_name,
  middle_name,
  last_name,
  full_name,
  gender,
  birth_date,
  nationality,
  status,
  enrolled_at,
  created_at,
  updated_at
)
select
  students.student_id,
  ctx.tenant_id,
  ctx.school_id,
  admissions.admission_id,
  student_users.user_id,
  students.student_number,
  students.qr_token,
  students.first_name,
  students.middle_name,
  students.last_name,
  students.full_name,
  students.gender,
  students.birth_date,
  students.nationality,
  'active',
  students.enrolled_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_students students
left join public.temp_demo_admissions admissions
  on admissions.admission_key = students.admission_key
left join public.temp_demo_users student_users
  on student_users.email = case students.student_number
    when 'SYR-2026-001' then 'student.youssef@ofuq.local'
    when 'SYR-2026-003' then 'student.lana@ofuq.local'
    else null
  end
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  admission_id = excluded.admission_id,
  student_user_id = excluded.student_user_id,
  student_number = excluded.student_number,
  qr_token = excluded.qr_token,
  first_name = excluded.first_name,
  middle_name = excluded.middle_name,
  last_name = excluded.last_name,
  full_name = excluded.full_name,
  gender = excluded.gender,
  birth_date = excluded.birth_date,
  nationality = excluded.nationality,
  status = excluded.status,
  enrolled_at = excluded.enrolled_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.student_guardians (
  id,
  tenant_id,
  school_id,
  student_id,
  guardian_user_id,
  guardian_name,
  guardian_email,
  guardian_phone,
  relation,
  is_primary,
  can_receive_notifications,
  created_at,
  updated_at
)
select
  public.demo_seed_uuid(
    'ofuq-syrian-demo:student-guardian:' || students.student_number || ':' || guardians.guardian_key
  ),
  ctx.tenant_id,
  ctx.school_id,
  students.student_id,
  guardian_users.user_id,
  guardians.guardian_name,
  guardians.guardian_email,
  guardians.guardian_phone,
  guardians.relation,
  true,
  true,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_students students
join public.temp_demo_guardians guardians
  on guardians.guardian_key = students.guardian_key
left join public.temp_demo_users guardian_users
  on guardian_users.email = guardians.guardian_user_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  student_id = excluded.student_id,
  guardian_user_id = excluded.guardian_user_id,
  guardian_name = excluded.guardian_name,
  guardian_email = excluded.guardian_email,
  guardian_phone = excluded.guardian_phone,
  relation = excluded.relation,
  is_primary = excluded.is_primary,
  can_receive_notifications = excluded.can_receive_notifications,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.student_documents (
  id,
  tenant_id,
  school_id,
  student_id,
  admission_id,
  uploaded_by_user_id,
  document_type,
  file_name,
  file_path,
  mime_type,
  file_size,
  created_at
)
select
  document_rows.document_id,
  ctx.tenant_id,
  ctx.school_id,
  document_rows.student_id,
  document_rows.admission_id,
  uploaders.user_id,
  document_rows.document_type,
  document_rows.file_name,
  document_rows.file_path,
  document_rows.mime_type,
  document_rows.file_size,
  ctx.seed_created_at
from public.temp_demo_context ctx
join (
  values
    (
      public.demo_seed_uuid('ofuq-syrian-demo:document:youssef-birth-certificate'),
      (select student_id from public.temp_demo_students where student_number = 'SYR-2026-001'),
      null::uuid,
      'school.admin@ofuq.local'::text,
      'birth_certificate'::public.student_document_type,
      'youssef-birth-certificate.pdf'::text,
      'student-documents/ofuq-syrian-demo/SYR-2026-001/youssef-birth-certificate.pdf'::text,
      'application/pdf'::text,
      245760::bigint
    ),
    (
      public.demo_seed_uuid('ofuq-syrian-demo:document:lana-photo'),
      (select student_id from public.temp_demo_students where student_number = 'SYR-2026-003'),
      null::uuid,
      'school.admin@ofuq.local'::text,
      'photo'::public.student_document_type,
      'lana-profile-photo.jpg'::text,
      'student-documents/ofuq-syrian-demo/SYR-2026-003/lana-profile-photo.jpg'::text,
      'image/jpeg'::text,
      187432::bigint
    ),
    (
      public.demo_seed_uuid('ofuq-syrian-demo:document:pending-salma-request'),
      null::uuid,
      (select admission_id from public.temp_demo_admissions where admission_key = 'pending-salma'),
      'school.admin@ofuq.local'::text,
      'previous_school_record'::public.student_document_type,
      'salma-previous-record.pdf'::text,
      'student-documents/ofuq-syrian-demo/admissions/pending-salma/salma-previous-record.pdf'::text,
      'application/pdf'::text,
      302144::bigint
    )
) as document_rows(
  document_id,
  student_id,
  admission_id,
  uploaded_by_email,
  document_type,
  file_name,
  file_path,
  mime_type,
  file_size
)
  on true
left join public.temp_demo_users uploaders
  on uploaders.email = document_rows.uploaded_by_email
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  student_id = excluded.student_id,
  admission_id = excluded.admission_id,
  uploaded_by_user_id = excluded.uploaded_by_user_id,
  document_type = excluded.document_type,
  file_name = excluded.file_name,
  file_path = excluded.file_path,
  mime_type = excluded.mime_type,
  file_size = excluded.file_size,
  created_at = excluded.created_at;

insert into public.class_enrollments (
  id,
  tenant_id,
  school_id,
  academic_year_id,
  class_id,
  student_id,
  grade_level_id,
  status,
  enrolled_on,
  created_by_user_id,
  created_at,
  updated_at
)
select
  public.demo_seed_uuid(
    'ofuq-syrian-demo:class-enrollment:' || students.student_number || ':2026-2027'
  ),
  ctx.tenant_id,
  ctx.school_id,
  ctx.academic_year_id,
  classes.class_id,
  students.student_id,
  grade_levels.grade_level_id,
  'active',
  students.enrolled_at,
  creators.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_students students
join public.temp_demo_grade_levels grade_levels
  on grade_levels.code = students.grade_code
join public.temp_demo_classes classes
  on classes.grade_code = students.grade_code
 and classes.section = students.section
join public.temp_demo_users creators
  on creators.email = 'school.admin@ofuq.local'
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  class_id = excluded.class_id,
  student_id = excluded.student_id,
  grade_level_id = excluded.grade_level_id,
  status = excluded.status,
  enrolled_on = excluded.enrolled_on,
  created_by_user_id = excluded.created_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.student_status_history (
  id,
  tenant_id,
  school_id,
  student_id,
  from_status,
  to_status,
  reason,
  changed_by_user_id,
  created_at
)
select
  public.demo_seed_uuid(
    'ofuq-syrian-demo:student-status-history:' || students.student_number || ':active'
  ),
  ctx.tenant_id,
  ctx.school_id,
  students.student_id,
  null,
  'active',
  'local_syrian_demo_seed',
  changers.user_id,
  students.enrolled_at::timestamptz
from public.temp_demo_students students
join public.temp_demo_users changers
  on changers.email = 'school.admin@ofuq.local'
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  student_id = excluded.student_id,
  from_status = excluded.from_status,
  to_status = excluded.to_status,
  reason = excluded.reason,
  changed_by_user_id = excluded.changed_by_user_id,
  created_at = excluded.created_at;

-- 05 Attendance

insert into public.attendance_sessions (
  id,
  tenant_id,
  school_id,
  academic_year_id,
  term_id,
  class_id,
  taken_by_user_id,
  session_date,
  starts_at,
  ends_at,
  method,
  status,
  notes,
  created_at,
  updated_at
)
select
  attendance_sessions.attendance_session_id,
  ctx.tenant_id,
  ctx.school_id,
  ctx.academic_year_id,
  ctx.term_1_id,
  classes.class_id,
  teachers.user_id,
  attendance_sessions.session_date,
  attendance_sessions.starts_at,
  attendance_sessions.ends_at,
  attendance_sessions.method,
  attendance_sessions.status,
  attendance_sessions.notes,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_attendance_sessions attendance_sessions
join public.temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = attendance_sessions.class_key
join public.temp_demo_users teachers
  on teachers.email = attendance_sessions.taken_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  term_id = excluded.term_id,
  class_id = excluded.class_id,
  taken_by_user_id = excluded.taken_by_user_id,
  session_date = excluded.session_date,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  method = excluded.method,
  status = excluded.status,
  notes = excluded.notes,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.attendance_records (
  id,
  tenant_id,
  school_id,
  attendance_session_id,
  academic_year_id,
  class_id,
  student_id,
  class_enrollment_id,
  status,
  method,
  recorded_by_user_id,
  recorded_at,
  notes,
  created_at,
  updated_at
)
select
  attendance_records.attendance_record_id,
  ctx.tenant_id,
  ctx.school_id,
  attendance_sessions.attendance_session_id,
  ctx.academic_year_id,
  classes.class_id,
  students.student_id,
  class_enrollments.id,
  attendance_records.status,
  attendance_records.method,
  recorders.user_id,
  attendance_records.recorded_at,
  attendance_records.notes,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_attendance_records attendance_records
join public.temp_demo_attendance_sessions attendance_sessions
  on attendance_sessions.session_key = attendance_records.session_key
join public.temp_demo_students students
  on students.student_number = attendance_records.student_number
join public.temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = attendance_sessions.class_key
join public.class_enrollments class_enrollments
  on class_enrollments.student_id = students.student_id
 and class_enrollments.class_id = classes.class_id
 and class_enrollments.academic_year_id = (select academic_year_id from public.temp_demo_context)
 and class_enrollments.status = 'active'
left join public.temp_demo_users recorders
  on recorders.email = attendance_records.recorded_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  attendance_session_id = excluded.attendance_session_id,
  academic_year_id = excluded.academic_year_id,
  class_id = excluded.class_id,
  student_id = excluded.student_id,
  class_enrollment_id = excluded.class_enrollment_id,
  status = excluded.status,
  method = excluded.method,
  recorded_by_user_id = excluded.recorded_by_user_id,
  recorded_at = excluded.recorded_at,
  notes = excluded.notes,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.absence_excuses (
  id,
  tenant_id,
  school_id,
  attendance_record_id,
  student_id,
  submitted_by_user_id,
  reviewed_by_user_id,
  status,
  reason,
  review_notes,
  submitted_at,
  reviewed_at,
  created_at,
  updated_at
)
select
  excuses.absence_excuse_id,
  ctx.tenant_id,
  ctx.school_id,
  excuses.attendance_record_id,
  students.student_id,
  submitters.user_id,
  reviewers.user_id,
  excuses.status,
  excuses.reason,
  excuses.review_notes,
  excuses.submitted_at,
  excuses.reviewed_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_absence_excuses excuses
join public.temp_demo_students students
  on students.student_number = excuses.student_number
left join public.temp_demo_users submitters
  on submitters.email = excuses.submitted_by_email
left join public.temp_demo_users reviewers
  on reviewers.email = excuses.reviewed_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  attendance_record_id = excluded.attendance_record_id,
  student_id = excluded.student_id,
  submitted_by_user_id = excluded.submitted_by_user_id,
  reviewed_by_user_id = excluded.reviewed_by_user_id,
  status = excluded.status,
  reason = excluded.reason,
  review_notes = excluded.review_notes,
  submitted_at = excluded.submitted_at,
  reviewed_at = excluded.reviewed_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- 06 Grades

insert into public.exams (
  id,
  tenant_id,
  school_id,
  academic_year_id,
  term_id,
  class_id,
  grade_level_id,
  subject_id,
  title,
  exam_date,
  max_score,
  weight,
  status,
  created_by_user_id,
  notes,
  created_at,
  updated_at
)
select
  exams.exam_id,
  ctx.tenant_id,
  ctx.school_id,
  ctx.academic_year_id,
  ctx.term_1_id,
  classes.class_id,
  grade_levels.grade_level_id,
  subjects.subject_id,
  exams.title,
  exams.exam_date,
  exams.max_score,
  exams.weight,
  exams.status,
  creators.user_id,
  exams.notes,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_exams exams
join public.temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = exams.class_key
join public.temp_demo_grade_levels grade_levels
  on grade_levels.code = exams.grade_code
join public.temp_demo_subjects subjects
  on subjects.code = exams.subject_code
join public.temp_demo_users creators
  on creators.email = exams.created_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  term_id = excluded.term_id,
  class_id = excluded.class_id,
  grade_level_id = excluded.grade_level_id,
  subject_id = excluded.subject_id,
  title = excluded.title,
  exam_date = excluded.exam_date,
  max_score = excluded.max_score,
  weight = excluded.weight,
  status = excluded.status,
  created_by_user_id = excluded.created_by_user_id,
  notes = excluded.notes,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.exam_results (
  id,
  tenant_id,
  school_id,
  exam_id,
  academic_year_id,
  term_id,
  class_id,
  subject_id,
  student_id,
  class_enrollment_id,
  score,
  status,
  entered_by_user_id,
  entered_at,
  published_at,
  notes,
  created_at,
  updated_at
)
select
  exam_results.exam_result_id,
  ctx.tenant_id,
  ctx.school_id,
  exams.exam_id,
  ctx.academic_year_id,
  ctx.term_1_id,
  classes.class_id,
  subjects.subject_id,
  students.student_id,
  class_enrollments.id,
  exam_results.score,
  exam_results.status,
  enterers.user_id,
  exam_results.entered_at,
  exam_results.published_at,
  exam_results.notes,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_exam_results exam_results
join public.temp_demo_exams exams
  on exams.exam_key = exam_results.exam_key
join public.temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = exams.class_key
join public.temp_demo_subjects subjects
  on subjects.code = exams.subject_code
join public.temp_demo_students students
  on students.student_number = exam_results.student_number
join public.class_enrollments class_enrollments
  on class_enrollments.student_id = students.student_id
 and class_enrollments.class_id = classes.class_id
 and class_enrollments.academic_year_id = (select academic_year_id from public.temp_demo_context)
 and class_enrollments.status = 'active'
left join public.temp_demo_users enterers
  on enterers.email = exam_results.entered_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  exam_id = excluded.exam_id,
  academic_year_id = excluded.academic_year_id,
  term_id = excluded.term_id,
  class_id = excluded.class_id,
  subject_id = excluded.subject_id,
  student_id = excluded.student_id,
  class_enrollment_id = excluded.class_enrollment_id,
  score = excluded.score,
  status = excluded.status,
  entered_by_user_id = excluded.entered_by_user_id,
  entered_at = excluded.entered_at,
  published_at = excluded.published_at,
  notes = excluded.notes,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.grade_entries (
  id,
  tenant_id,
  school_id,
  academic_year_id,
  term_id,
  class_id,
  subject_id,
  student_id,
  class_enrollment_id,
  category,
  title,
  score,
  max_score,
  weight,
  status,
  recorded_on,
  entered_by_user_id,
  notes,
  created_at,
  updated_at
)
select
  grade_entries.grade_entry_id,
  ctx.tenant_id,
  ctx.school_id,
  ctx.academic_year_id,
  ctx.term_1_id,
  classes.class_id,
  subjects.subject_id,
  students.student_id,
  class_enrollments.id,
  grade_entries.category,
  grade_entries.title,
  grade_entries.score,
  grade_entries.max_score,
  grade_entries.weight,
  grade_entries.status,
  grade_entries.recorded_on,
  enterers.user_id,
  grade_entries.notes,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_grade_entries grade_entries
join public.temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = grade_entries.class_key
join public.temp_demo_subjects subjects
  on subjects.code = grade_entries.subject_code
join public.temp_demo_students students
  on students.student_number = grade_entries.student_number
join public.class_enrollments class_enrollments
  on class_enrollments.student_id = students.student_id
 and class_enrollments.class_id = classes.class_id
 and class_enrollments.academic_year_id = (select academic_year_id from public.temp_demo_context)
 and class_enrollments.status = 'active'
left join public.temp_demo_users enterers
  on enterers.email = grade_entries.entered_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  term_id = excluded.term_id,
  class_id = excluded.class_id,
  subject_id = excluded.subject_id,
  student_id = excluded.student_id,
  class_enrollment_id = excluded.class_enrollment_id,
  category = excluded.category,
  title = excluded.title,
  score = excluded.score,
  max_score = excluded.max_score,
  weight = excluded.weight,
  status = excluded.status,
  recorded_on = excluded.recorded_on,
  entered_by_user_id = excluded.entered_by_user_id,
  notes = excluded.notes,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.report_cards (
  id,
  tenant_id,
  school_id,
  academic_year_id,
  term_id,
  class_id,
  student_id,
  class_enrollment_id,
  status,
  summary,
  teacher_remarks,
  admin_notes,
  generated_by_user_id,
  generated_at,
  published_at,
  created_at,
  updated_at
)
select
  report_cards.report_card_id,
  ctx.tenant_id,
  ctx.school_id,
  ctx.academic_year_id,
  ctx.term_1_id,
  classes.class_id,
  students.student_id,
  class_enrollments.id,
  report_cards.status,
  summary_parts.summary_json,
  report_cards.teacher_remarks,
  report_cards.admin_notes,
  generators.user_id,
  report_cards.generated_at,
  report_cards.published_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_report_cards report_cards
join public.temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = report_cards.class_key
join public.temp_demo_students students
  on students.student_number = report_cards.student_number
join public.class_enrollments class_enrollments
  on class_enrollments.student_id = students.student_id
 and class_enrollments.class_id = classes.class_id
 and class_enrollments.academic_year_id = (select academic_year_id from public.temp_demo_context)
 and class_enrollments.status = 'active'
join public.temp_demo_users generators
  on generators.email = report_cards.generated_by_email
cross join public.temp_demo_context ctx
cross join lateral (
  with score_parts as (
    select
      subjects.subject_id,
      subjects.name as subject_name,
      exam_results.score::numeric as score,
      exams.max_score::numeric as max_score
    from public.exam_results exam_results
    join public.exams exams
      on exams.id = exam_results.exam_id
    join public.temp_demo_subjects subjects
      on subjects.subject_id = exam_results.subject_id
    where exam_results.student_id = students.student_id
      and exam_results.class_id = classes.class_id
      and exam_results.academic_year_id = ctx.academic_year_id
      and exam_results.term_id = ctx.term_1_id
      and exam_results.status in ('entered', 'published')
      and exam_results.score is not null

    union all

    select
      subjects.subject_id,
      subjects.name as subject_name,
      grade_entries.score::numeric as score,
      grade_entries.max_score::numeric as max_score
    from public.grade_entries grade_entries
    join public.temp_demo_subjects subjects
      on subjects.subject_id = grade_entries.subject_id
    where grade_entries.student_id = students.student_id
      and grade_entries.class_id = classes.class_id
      and grade_entries.academic_year_id = ctx.academic_year_id
      and grade_entries.term_id = ctx.term_1_id
      and grade_entries.status in ('entered', 'published')
  ),
  subject_totals as (
    select
      subject_id,
      subject_name,
      round(sum(score), 2) as total_score,
      round(sum(max_score), 2) as max_score
    from score_parts
    group by subject_id, subject_name
  ),
  overall_totals as (
    select
      round(coalesce(sum(total_score), 0), 2) as total_score,
      round(coalesce(sum(max_score), 0), 2) as max_score
    from subject_totals
  )
  select jsonb_build_object(
    'subjects',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'subject_id',
            subject_totals.subject_id,
            'subject_name',
            subject_totals.subject_name,
            'total_score',
            subject_totals.total_score,
            'max_score',
            subject_totals.max_score,
            'percentage',
            case
              when subject_totals.max_score > 0 then round((subject_totals.total_score / subject_totals.max_score) * 100, 2)
              else null
            end
          )
          order by subject_totals.subject_name
        )
        from subject_totals
      ),
      '[]'::jsonb
    ),
    'overall',
    jsonb_build_object(
      'total_score',
      overall_totals.total_score,
      'max_score',
      overall_totals.max_score,
      'percentage',
      case
        when overall_totals.max_score > 0 then round((overall_totals.total_score / overall_totals.max_score) * 100, 2)
        else null
      end
    )
  ) as summary_json
  from overall_totals
) as summary_parts
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  term_id = excluded.term_id,
  class_id = excluded.class_id,
  student_id = excluded.student_id,
  class_enrollment_id = excluded.class_enrollment_id,
  status = excluded.status,
  summary = excluded.summary,
  teacher_remarks = excluded.teacher_remarks,
  admin_notes = excluded.admin_notes,
  generated_by_user_id = excluded.generated_by_user_id,
  generated_at = excluded.generated_at,
  published_at = excluded.published_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- 07 Timetable

insert into public.rooms (
  id,
  tenant_id,
  school_id,
  name,
  code,
  capacity,
  location,
  status,
  created_at,
  updated_at
)
select
  rooms.room_id,
  ctx.tenant_id,
  ctx.school_id,
  rooms.name,
  rooms.code,
  rooms.capacity,
  rooms.location,
  'active',
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_rooms rooms
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  name = excluded.name,
  code = excluded.code,
  capacity = excluded.capacity,
  location = excluded.location,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.teacher_subject_assignments (
  id,
  tenant_id,
  school_id,
  academic_year_id,
  teacher_user_id,
  subject_id,
  grade_level_id,
  class_id,
  status,
  created_by_user_id,
  created_at,
  updated_at
)
select
  assignments.assignment_id,
  ctx.tenant_id,
  ctx.school_id,
  ctx.academic_year_id,
  teachers.user_id,
  subjects.subject_id,
  grade_levels.grade_level_id,
  null,
  'active',
  creators.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_timetable_assignments assignments
join public.temp_demo_users teachers
  on teachers.email = assignments.teacher_email
join public.temp_demo_subjects subjects
  on subjects.code = assignments.subject_code
join public.temp_demo_grade_levels grade_levels
  on grade_levels.code = assignments.grade_code
join public.temp_demo_users creators
  on creators.email = assignments.created_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  teacher_user_id = excluded.teacher_user_id,
  subject_id = excluded.subject_id,
  grade_level_id = excluded.grade_level_id,
  class_id = excluded.class_id,
  status = excluded.status,
  created_by_user_id = excluded.created_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.timetable_slots (
  id,
  tenant_id,
  school_id,
  academic_year_id,
  term_id,
  class_id,
  grade_level_id,
  subject_id,
  teacher_user_id,
  room_id,
  day_of_week,
  starts_at,
  ends_at,
  status,
  notes,
  created_by_user_id,
  created_at,
  updated_at
)
select
  timetable_slots.slot_id,
  ctx.tenant_id,
  ctx.school_id,
  ctx.academic_year_id,
  ctx.term_1_id,
  classes.class_id,
  grade_levels.grade_level_id,
  subjects.subject_id,
  teachers.user_id,
  rooms.room_id,
  timetable_slots.day_of_week,
  timetable_slots.starts_at,
  timetable_slots.ends_at,
  'active',
  timetable_slots.notes,
  creators.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_timetable_slots timetable_slots
join public.temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = timetable_slots.class_key
join public.temp_demo_grade_levels grade_levels
  on grade_levels.code = timetable_slots.grade_code
join public.temp_demo_subjects subjects
  on subjects.code = timetable_slots.subject_code
join public.temp_demo_users teachers
  on teachers.email = timetable_slots.teacher_email
join public.temp_demo_rooms rooms
  on rooms.room_key = timetable_slots.room_key
join public.temp_demo_users creators
  on creators.email = 'school.admin@ofuq.local'
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  term_id = excluded.term_id,
  class_id = excluded.class_id,
  grade_level_id = excluded.grade_level_id,
  subject_id = excluded.subject_id,
  teacher_user_id = excluded.teacher_user_id,
  room_id = excluded.room_id,
  day_of_week = excluded.day_of_week,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status,
  notes = excluded.notes,
  created_by_user_id = excluded.created_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- 08 Finance

insert into public.fee_structures (
  id,
  tenant_id,
  school_id,
  academic_year_id,
  grade_level_id,
  class_id,
  name,
  description,
  currency_code,
  status,
  created_by_user_id,
  created_at,
  updated_at
)
select
  fee_structures.fee_structure_id,
  ctx.tenant_id,
  ctx.school_id,
  ctx.academic_year_id,
  grade_levels.grade_level_id,
  null,
  fee_structures.name,
  fee_structures.description,
  'SYP',
  'active',
  creators.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_fee_structures fee_structures
join public.temp_demo_grade_levels grade_levels
  on grade_levels.code = fee_structures.grade_code
join public.temp_demo_users creators
  on creators.email = 'accountant@ofuq.local'
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  grade_level_id = excluded.grade_level_id,
  class_id = excluded.class_id,
  name = excluded.name,
  description = excluded.description,
  currency_code = excluded.currency_code,
  status = excluded.status,
  created_by_user_id = excluded.created_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.fee_items (
  id,
  tenant_id,
  school_id,
  fee_structure_id,
  name,
  description,
  item_type,
  amount,
  due_date,
  sort_order,
  status,
  created_at,
  updated_at
)
select
  fee_items.fee_item_id,
  ctx.tenant_id,
  ctx.school_id,
  fee_structures.fee_structure_id,
  fee_items.name,
  fee_items.name,
  fee_items.item_type,
  fee_items.amount,
  fee_items.due_date,
  fee_items.sort_order,
  'active',
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_fee_items fee_items
join public.temp_demo_fee_structures fee_structures
  on fee_structures.fee_structure_key = fee_items.fee_structure_key
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  fee_structure_id = excluded.fee_structure_id,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  amount = excluded.amount,
  due_date = excluded.due_date,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.discount_types (
  id,
  tenant_id,
  school_id,
  name,
  description,
  value_type,
  value,
  status,
  created_by_user_id,
  created_at,
  updated_at
)
select
  discount_types.discount_type_id,
  ctx.tenant_id,
  ctx.school_id,
  discount_types.name,
  discount_types.description,
  discount_types.value_type,
  discount_types.value,
  'active',
  creators.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_discount_types discount_types
join public.temp_demo_users creators
  on creators.email = 'accountant@ofuq.local'
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  name = excluded.name,
  description = excluded.description,
  value_type = excluded.value_type,
  value = excluded.value,
  status = excluded.status,
  created_by_user_id = excluded.created_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.student_discounts (
  id,
  tenant_id,
  school_id,
  student_id,
  discount_type_id,
  academic_year_id,
  term_id,
  starts_on,
  ends_on,
  status,
  notes,
  created_by_user_id,
  created_at,
  updated_at
)
select
  student_discounts.student_discount_id,
  ctx.tenant_id,
  ctx.school_id,
  students.student_id,
  discount_types.discount_type_id,
  ctx.academic_year_id,
  ctx.term_1_id,
  student_discounts.starts_on,
  student_discounts.ends_on,
  student_discounts.status,
  student_discounts.notes,
  creators.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_student_discounts student_discounts
join public.temp_demo_students students
  on students.student_number = student_discounts.student_number
join public.temp_demo_discount_types discount_types
  on discount_types.discount_key = student_discounts.discount_key
join public.temp_demo_users creators
  on creators.email = 'accountant@ofuq.local'
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  student_id = excluded.student_id,
  discount_type_id = excluded.discount_type_id,
  academic_year_id = excluded.academic_year_id,
  term_id = excluded.term_id,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  status = excluded.status,
  notes = excluded.notes,
  created_by_user_id = excluded.created_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.invoices (
  id,
  tenant_id,
  school_id,
  invoice_number,
  student_id,
  academic_year_id,
  term_id,
  class_enrollment_id,
  issue_date,
  due_date,
  subtotal_amount,
  discount_amount,
  total_amount,
  paid_amount,
  balance_amount,
  status,
  notes,
  created_by_user_id,
  issued_by_user_id,
  issued_at,
  created_at,
  updated_at
)
select
  invoices.invoice_id,
  ctx.tenant_id,
  ctx.school_id,
  invoices.invoice_number,
  students.student_id,
  ctx.academic_year_id,
  ctx.term_1_id,
  class_enrollments.id,
  invoices.issue_date,
  invoices.due_date,
  invoices.subtotal_amount,
  invoices.discount_amount,
  invoices.total_amount,
  invoices.paid_amount,
  invoices.balance_amount,
  invoices.status,
  invoices.notes,
  creators.user_id,
  issuers.user_id,
  invoices.issued_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_invoices invoices
join public.temp_demo_students students
  on students.student_number = invoices.student_number
join public.class_enrollments class_enrollments
  on class_enrollments.student_id = students.student_id
 and class_enrollments.academic_year_id = (select academic_year_id from public.temp_demo_context)
 and class_enrollments.status = 'active'
join public.temp_demo_users creators
  on creators.email = invoices.created_by_email
left join public.temp_demo_users issuers
  on issuers.email = invoices.issued_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  invoice_number = excluded.invoice_number,
  student_id = excluded.student_id,
  academic_year_id = excluded.academic_year_id,
  term_id = excluded.term_id,
  class_enrollment_id = excluded.class_enrollment_id,
  issue_date = excluded.issue_date,
  due_date = excluded.due_date,
  subtotal_amount = excluded.subtotal_amount,
  discount_amount = excluded.discount_amount,
  total_amount = excluded.total_amount,
  paid_amount = excluded.paid_amount,
  balance_amount = excluded.balance_amount,
  status = excluded.status,
  notes = excluded.notes,
  created_by_user_id = excluded.created_by_user_id,
  issued_by_user_id = excluded.issued_by_user_id,
  issued_at = excluded.issued_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.invoice_items (
  id,
  tenant_id,
  school_id,
  invoice_id,
  fee_item_id,
  description,
  quantity,
  unit_amount,
  discount_amount,
  total_amount,
  sort_order,
  created_at,
  updated_at
)
select
  invoice_items.invoice_item_id,
  ctx.tenant_id,
  ctx.school_id,
  invoices.invoice_id,
  invoice_items.fee_item_id,
  invoice_items.description,
  invoice_items.quantity,
  invoice_items.unit_amount,
  invoice_items.discount_amount,
  invoice_items.total_amount,
  invoice_items.sort_order,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_invoice_items invoice_items
join public.temp_demo_invoices invoices
  on invoices.invoice_number = invoice_items.invoice_number
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  invoice_id = excluded.invoice_id,
  fee_item_id = excluded.fee_item_id,
  description = excluded.description,
  quantity = excluded.quantity,
  unit_amount = excluded.unit_amount,
  discount_amount = excluded.discount_amount,
  total_amount = excluded.total_amount,
  sort_order = excluded.sort_order,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.payments (
  id,
  tenant_id,
  school_id,
  invoice_id,
  student_id,
  amount,
  payment_method,
  payment_status,
  paid_at,
  reference_number,
  receipt_number,
  received_by_user_id,
  notes,
  created_at,
  updated_at
)
select
  payments.payment_id,
  ctx.tenant_id,
  ctx.school_id,
  invoices.invoice_id,
  students.student_id,
  payments.amount,
  payments.payment_method,
  payments.payment_status,
  payments.paid_at,
  payments.reference_number,
  payments.receipt_number,
  receivers.user_id,
  payments.notes,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_payments payments
join public.temp_demo_invoices invoices
  on invoices.invoice_number = payments.invoice_number
join public.temp_demo_students students
  on students.student_number = payments.student_number
join public.temp_demo_users receivers
  on receivers.email = payments.received_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  invoice_id = excluded.invoice_id,
  student_id = excluded.student_id,
  amount = excluded.amount,
  payment_method = excluded.payment_method,
  payment_status = excluded.payment_status,
  paid_at = excluded.paid_at,
  reference_number = excluded.reference_number,
  receipt_number = excluded.receipt_number,
  received_by_user_id = excluded.received_by_user_id,
  notes = excluded.notes,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- 09 Communication

insert into public.messages (
  id,
  tenant_id,
  school_id,
  sender_user_id,
  subject,
  body,
  related_student_id,
  status,
  sent_at,
  created_at,
  updated_at
)
select
  messages.message_id,
  ctx.tenant_id,
  ctx.school_id,
  senders.user_id,
  messages.subject,
  messages.body,
  students.student_id,
  messages.status,
  messages.sent_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_messages messages
join public.temp_demo_users senders
  on senders.email = messages.sender_email
left join public.temp_demo_students students
  on students.student_number = messages.related_student_number
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  sender_user_id = excluded.sender_user_id,
  subject = excluded.subject,
  body = excluded.body,
  related_student_id = excluded.related_student_id,
  status = excluded.status,
  sent_at = excluded.sent_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.message_recipients (
  id,
  tenant_id,
  school_id,
  message_id,
  recipient_user_id,
  read_at,
  archived_at,
  created_at,
  updated_at
)
select
  recipients.recipient_row_id,
  ctx.tenant_id,
  ctx.school_id,
  messages.message_id,
  recipient_users.user_id,
  recipients.read_at,
  recipients.archived_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_message_recipients recipients
join public.temp_demo_messages messages
  on messages.message_key = recipients.message_key
join public.temp_demo_users recipient_users
  on recipient_users.email = recipients.recipient_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  message_id = excluded.message_id,
  recipient_user_id = excluded.recipient_user_id,
  read_at = excluded.read_at,
  archived_at = excluded.archived_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.announcements (
  id,
  tenant_id,
  school_id,
  title,
  body,
  target_type,
  target_role,
  grade_level_id,
  class_id,
  status,
  published_at,
  expires_at,
  created_by_user_id,
  created_at,
  updated_at
)
select
  announcements.announcement_id,
  ctx.tenant_id,
  ctx.school_id,
  announcements.title,
  announcements.body,
  announcements.target_type,
  announcements.target_role,
  grade_levels.grade_level_id,
  classes.class_id,
  announcements.status,
  announcements.published_at,
  announcements.expires_at,
  creators.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_announcements announcements
left join public.temp_demo_grade_levels grade_levels
  on grade_levels.code = announcements.grade_code
left join public.temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = announcements.class_key
join public.temp_demo_users creators
  on creators.email = announcements.created_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  title = excluded.title,
  body = excluded.body,
  target_type = excluded.target_type,
  target_role = excluded.target_role,
  grade_level_id = excluded.grade_level_id,
  class_id = excluded.class_id,
  status = excluded.status,
  published_at = excluded.published_at,
  expires_at = excluded.expires_at,
  created_by_user_id = excluded.created_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.notification_logs (
  id,
  tenant_id,
  school_id,
  recipient_user_id,
  actor_user_id,
  channel,
  notification_type,
  title,
  body,
  status,
  related_entity_type,
  related_entity_id,
  read_at,
  created_at,
  updated_at
)
select
  notifications.notification_id,
  ctx.tenant_id,
  ctx.school_id,
  recipients.user_id,
  actors.user_id,
  'in_app',
  notifications.notification_type,
  notifications.title,
  notifications.body,
  notifications.status,
  notifications.related_entity_type,
  case
    when notifications.related_entity_type = 'announcement' then case notifications.related_entity_key
      when 'term-start' then public.demo_seed_uuid('ofuq-syrian-demo:announcement:term-start')
      when 'teacher-meeting' then public.demo_seed_uuid('ofuq-syrian-demo:announcement:teacher-meeting')
      else null
    end
    when notifications.related_entity_type = 'message' then case notifications.related_entity_key
      when 'school-to-teachers' then public.demo_seed_uuid('ofuq-syrian-demo:message:school-to-teachers')
      when 'math-to-parent-hassan' then public.demo_seed_uuid('ofuq-syrian-demo:message:math-to-parent-hassan')
      when 'librarian-to-admin' then public.demo_seed_uuid('ofuq-syrian-demo:message:librarian-to-admin')
      else null
    end
    when notifications.related_entity_type = 'invoice' then case notifications.related_entity_key
      when 'INV-2026-0001' then public.demo_seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0001')
      when 'INV-2026-0002' then public.demo_seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0002')
      when 'INV-2026-0003' then public.demo_seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0003')
      else null
    end
    when notifications.related_entity_type = 'book_loan' then case notifications.related_entity_key
      when 'arabic-active' then public.demo_seed_uuid('ofuq-syrian-demo:loan:arabic-active')
      when 'math-returned' then public.demo_seed_uuid('ofuq-syrian-demo:loan:math-returned')
      when 'physics-overdue' then public.demo_seed_uuid('ofuq-syrian-demo:loan:physics-overdue')
      else null
    end
    else null
  end,
  notifications.read_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_notification_logs notifications
left join public.temp_demo_users recipients
  on recipients.email = notifications.recipient_email
left join public.temp_demo_users actors
  on actors.email = notifications.actor_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  recipient_user_id = excluded.recipient_user_id,
  actor_user_id = excluded.actor_user_id,
  channel = excluded.channel,
  notification_type = excluded.notification_type,
  title = excluded.title,
  body = excluded.body,
  status = excluded.status,
  related_entity_type = excluded.related_entity_type,
  related_entity_id = excluded.related_entity_id,
  read_at = excluded.read_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.school_events (
  id,
  tenant_id,
  school_id,
  title,
  description,
  starts_at,
  ends_at,
  location,
  target_type,
  grade_level_id,
  class_id,
  status,
  created_by_user_id,
  created_at,
  updated_at
)
select
  school_events.event_id,
  ctx.tenant_id,
  ctx.school_id,
  school_events.title,
  school_events.description,
  school_events.starts_at,
  school_events.ends_at,
  school_events.location,
  school_events.target_type,
  grade_levels.grade_level_id,
  classes.class_id,
  school_events.status,
  creators.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_school_events school_events
left join public.temp_demo_grade_levels grade_levels
  on grade_levels.code = school_events.grade_code
left join public.temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = school_events.class_key
join public.temp_demo_users creators
  on creators.email = school_events.created_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  title = excluded.title,
  description = excluded.description,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  location = excluded.location,
  target_type = excluded.target_type,
  grade_level_id = excluded.grade_level_id,
  class_id = excluded.class_id,
  status = excluded.status,
  created_by_user_id = excluded.created_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- 10 Library

insert into public.book_catalog (
  id,
  tenant_id,
  school_id,
  isbn,
  title,
  subtitle,
  author,
  publisher,
  publication_year,
  category,
  language,
  description,
  cover_image_url,
  status,
  created_by_user_id,
  created_at,
  updated_at
)
select
  book_catalog.catalog_id,
  ctx.tenant_id,
  ctx.school_id,
  book_catalog.isbn,
  book_catalog.title,
  null,
  book_catalog.author,
  book_catalog.publisher,
  book_catalog.publication_year,
  book_catalog.category,
  book_catalog.language,
  book_catalog.description,
  null,
  'active',
  creators.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_book_catalog book_catalog
join public.temp_demo_users creators
  on creators.email = 'librarian@ofuq.local'
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  isbn = excluded.isbn,
  title = excluded.title,
  subtitle = excluded.subtitle,
  author = excluded.author,
  publisher = excluded.publisher,
  publication_year = excluded.publication_year,
  category = excluded.category,
  language = excluded.language,
  description = excluded.description,
  cover_image_url = excluded.cover_image_url,
  status = excluded.status,
  created_by_user_id = excluded.created_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.book_copies (
  id,
  tenant_id,
  school_id,
  catalog_id,
  barcode,
  accession_number,
  shelf_location,
  condition,
  status,
  notes,
  created_by_user_id,
  created_at,
  updated_at
)
select
  book_copies.copy_id,
  ctx.tenant_id,
  ctx.school_id,
  book_catalog.catalog_id,
  book_copies.barcode,
  book_copies.accession_number,
  book_copies.shelf_location,
  book_copies.condition,
  book_copies.status,
  book_copies.notes,
  creators.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_book_copies book_copies
join public.temp_demo_book_catalog book_catalog
  on book_catalog.catalog_key = book_copies.catalog_key
join public.temp_demo_users creators
  on creators.email = 'librarian@ofuq.local'
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  catalog_id = excluded.catalog_id,
  barcode = excluded.barcode,
  accession_number = excluded.accession_number,
  shelf_location = excluded.shelf_location,
  condition = excluded.condition,
  status = excluded.status,
  notes = excluded.notes,
  created_by_user_id = excluded.created_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.book_loans (
  id,
  tenant_id,
  school_id,
  copy_id,
  catalog_id,
  student_id,
  issued_by_user_id,
  returned_by_user_id,
  borrowed_at,
  due_at,
  returned_at,
  status,
  notes,
  return_notes,
  created_at,
  updated_at
)
select
  book_loans.loan_id,
  ctx.tenant_id,
  ctx.school_id,
  book_copies.copy_id,
  book_catalog.catalog_id,
  students.student_id,
  issuers.user_id,
  returners.user_id,
  book_loans.borrowed_at,
  book_loans.due_at,
  book_loans.returned_at,
  book_loans.status,
  book_loans.notes,
  book_loans.return_notes,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_book_loans book_loans
join public.temp_demo_book_copies book_copies
  on book_copies.copy_key = book_loans.copy_key
join public.temp_demo_book_catalog book_catalog
  on book_catalog.catalog_key = book_loans.catalog_key
join public.temp_demo_students students
  on students.student_number = book_loans.student_number
join public.temp_demo_users issuers
  on issuers.email = book_loans.issued_by_email
left join public.temp_demo_users returners
  on returners.email = book_loans.returned_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  copy_id = excluded.copy_id,
  catalog_id = excluded.catalog_id,
  student_id = excluded.student_id,
  issued_by_user_id = excluded.issued_by_user_id,
  returned_by_user_id = excluded.returned_by_user_id,
  borrowed_at = excluded.borrowed_at,
  due_at = excluded.due_at,
  returned_at = excluded.returned_at,
  status = excluded.status,
  notes = excluded.notes,
  return_notes = excluded.return_notes,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- 11 Student care

insert into public.health_records (
  id,
  tenant_id,
  school_id,
  student_id,
  blood_type,
  allergies,
  chronic_conditions,
  medications,
  emergency_notes,
  doctor_name,
  doctor_phone,
  status,
  created_by_user_id,
  updated_by_user_id,
  created_at,
  updated_at
)
select
  health_records.health_record_id,
  ctx.tenant_id,
  ctx.school_id,
  students.student_id,
  health_records.blood_type,
  health_records.allergies,
  health_records.chronic_conditions,
  health_records.medications,
  health_records.emergency_notes,
  health_records.doctor_name,
  health_records.doctor_phone,
  health_records.status,
  creators.user_id,
  updaters.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_health_records health_records
join public.temp_demo_students students
  on students.student_number = health_records.student_number
join public.temp_demo_users creators
  on creators.email = health_records.created_by_email
join public.temp_demo_users updaters
  on updaters.email = health_records.updated_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  student_id = excluded.student_id,
  blood_type = excluded.blood_type,
  allergies = excluded.allergies,
  chronic_conditions = excluded.chronic_conditions,
  medications = excluded.medications,
  emergency_notes = excluded.emergency_notes,
  doctor_name = excluded.doctor_name,
  doctor_phone = excluded.doctor_phone,
  status = excluded.status,
  created_by_user_id = excluded.created_by_user_id,
  updated_by_user_id = excluded.updated_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.vaccinations (
  id,
  tenant_id,
  school_id,
  student_id,
  vaccine_name,
  dose_label,
  vaccinated_on,
  next_due_on,
  status,
  notes,
  recorded_by_user_id,
  created_at,
  updated_at
)
select
  vaccinations.vaccination_id,
  ctx.tenant_id,
  ctx.school_id,
  students.student_id,
  vaccinations.vaccine_name,
  vaccinations.dose_label,
  vaccinations.vaccinated_on,
  vaccinations.next_due_on,
  vaccinations.status,
  vaccinations.notes,
  recorders.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_vaccinations vaccinations
join public.temp_demo_students students
  on students.student_number = vaccinations.student_number
join public.temp_demo_users recorders
  on recorders.email = vaccinations.recorded_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  student_id = excluded.student_id,
  vaccine_name = excluded.vaccine_name,
  dose_label = excluded.dose_label,
  vaccinated_on = excluded.vaccinated_on,
  next_due_on = excluded.next_due_on,
  status = excluded.status,
  notes = excluded.notes,
  recorded_by_user_id = excluded.recorded_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.clinic_visits (
  id,
  tenant_id,
  school_id,
  student_id,
  visited_at,
  reason,
  symptoms,
  action_taken,
  returned_to_class,
  guardian_contacted,
  referred_to_external_care,
  handled_by_user_id,
  status,
  notes,
  closed_at,
  created_at,
  updated_at
)
select
  clinic_visits.clinic_visit_id,
  ctx.tenant_id,
  ctx.school_id,
  students.student_id,
  clinic_visits.visited_at,
  clinic_visits.reason,
  clinic_visits.symptoms,
  clinic_visits.action_taken,
  clinic_visits.returned_to_class,
  clinic_visits.guardian_contacted,
  clinic_visits.referred_to_external_care,
  handlers.user_id,
  clinic_visits.status,
  clinic_visits.notes,
  clinic_visits.closed_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_clinic_visits clinic_visits
join public.temp_demo_students students
  on students.student_number = clinic_visits.student_number
join public.temp_demo_users handlers
  on handlers.email = clinic_visits.handled_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  student_id = excluded.student_id,
  visited_at = excluded.visited_at,
  reason = excluded.reason,
  symptoms = excluded.symptoms,
  action_taken = excluded.action_taken,
  returned_to_class = excluded.returned_to_class,
  guardian_contacted = excluded.guardian_contacted,
  referred_to_external_care = excluded.referred_to_external_care,
  handled_by_user_id = excluded.handled_by_user_id,
  status = excluded.status,
  notes = excluded.notes,
  closed_at = excluded.closed_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.discipline_records (
  id,
  tenant_id,
  school_id,
  student_id,
  incident_date,
  incident_type,
  severity,
  title,
  description,
  action_taken,
  status,
  reported_by_user_id,
  reviewed_by_user_id,
  reviewed_at,
  created_at,
  updated_at
)
select
  discipline_records.discipline_record_id,
  ctx.tenant_id,
  ctx.school_id,
  students.student_id,
  discipline_records.incident_date,
  discipline_records.incident_type,
  discipline_records.severity,
  discipline_records.title,
  discipline_records.description,
  discipline_records.action_taken,
  discipline_records.status,
  reporters.user_id,
  reviewers.user_id,
  discipline_records.reviewed_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_discipline_records discipline_records
join public.temp_demo_students students
  on students.student_number = discipline_records.student_number
join public.temp_demo_users reporters
  on reporters.email = discipline_records.reported_by_email
left join public.temp_demo_users reviewers
  on reviewers.email = discipline_records.reviewed_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  student_id = excluded.student_id,
  incident_date = excluded.incident_date,
  incident_type = excluded.incident_type,
  severity = excluded.severity,
  title = excluded.title,
  description = excluded.description,
  action_taken = excluded.action_taken,
  status = excluded.status,
  reported_by_user_id = excluded.reported_by_user_id,
  reviewed_by_user_id = excluded.reviewed_by_user_id,
  reviewed_at = excluded.reviewed_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.achievements (
  id,
  tenant_id,
  school_id,
  student_id,
  achievement_date,
  title,
  description,
  category,
  level,
  awarded_by_user_id,
  status,
  created_by_user_id,
  published_at,
  created_at,
  updated_at
)
select
  achievements.achievement_id,
  ctx.tenant_id,
  ctx.school_id,
  students.student_id,
  achievements.achievement_date,
  achievements.title,
  achievements.description,
  achievements.category,
  achievements.level,
  awarders.user_id,
  achievements.status,
  creators.user_id,
  achievements.published_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_achievements achievements
join public.temp_demo_students students
  on students.student_number = achievements.student_number
left join public.temp_demo_users awarders
  on awarders.email = achievements.awarded_by_email
join public.temp_demo_users creators
  on creators.email = achievements.created_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  student_id = excluded.student_id,
  achievement_date = excluded.achievement_date,
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  level = excluded.level,
  awarded_by_user_id = excluded.awarded_by_user_id,
  status = excluded.status,
  created_by_user_id = excluded.created_by_user_id,
  published_at = excluded.published_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- 12 Feedback

insert into public.complaints (
  id,
  tenant_id,
  school_id,
  submitted_by_user_id,
  student_id,
  assigned_to_user_id,
  category,
  priority,
  title,
  description,
  status,
  submitted_at,
  resolved_at,
  resolved_by_user_id,
  resolution_summary,
  created_at,
  updated_at
)
select
  complaints.complaint_id,
  ctx.tenant_id,
  ctx.school_id,
  submitters.user_id,
  students.student_id,
  assignees.user_id,
  complaints.category,
  complaints.priority,
  complaints.title,
  complaints.description,
  complaints.status,
  complaints.submitted_at,
  complaints.resolved_at,
  resolvers.user_id,
  complaints.resolution_summary,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_complaints complaints
join public.temp_demo_users submitters
  on submitters.email = complaints.submitted_by_email
left join public.temp_demo_students students
  on students.student_number = complaints.student_number
left join public.temp_demo_users assignees
  on assignees.email = complaints.assigned_to_email
left join public.temp_demo_users resolvers
  on resolvers.email = complaints.resolved_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  submitted_by_user_id = excluded.submitted_by_user_id,
  student_id = excluded.student_id,
  assigned_to_user_id = excluded.assigned_to_user_id,
  category = excluded.category,
  priority = excluded.priority,
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  submitted_at = excluded.submitted_at,
  resolved_at = excluded.resolved_at,
  resolved_by_user_id = excluded.resolved_by_user_id,
  resolution_summary = excluded.resolution_summary,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.complaint_updates (
  id,
  tenant_id,
  school_id,
  complaint_id,
  author_user_id,
  update_type,
  body,
  old_status,
  new_status,
  created_at,
  updated_at
)
select
  complaint_updates.complaint_update_id,
  ctx.tenant_id,
  ctx.school_id,
  complaints.complaint_id,
  authors.user_id,
  complaint_updates.update_type,
  complaint_updates.body,
  complaint_updates.old_status,
  complaint_updates.new_status,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_complaint_updates complaint_updates
join public.temp_demo_complaints complaints
  on complaints.complaint_key = complaint_updates.complaint_key
join public.temp_demo_users authors
  on authors.email = complaint_updates.author_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  complaint_id = excluded.complaint_id,
  author_user_id = excluded.author_user_id,
  update_type = excluded.update_type,
  body = excluded.body,
  old_status = excluded.old_status,
  new_status = excluded.new_status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.surveys (
  id,
  tenant_id,
  school_id,
  title,
  description,
  target_type,
  target_role,
  grade_level_id,
  class_id,
  status,
  opens_at,
  closes_at,
  created_by_user_id,
  published_at,
  closed_at,
  created_at,
  updated_at
)
select
  surveys.survey_id,
  ctx.tenant_id,
  ctx.school_id,
  surveys.title,
  surveys.description,
  surveys.target_type,
  surveys.target_role,
  grade_levels.grade_level_id,
  classes.class_id,
  surveys.status,
  surveys.opens_at,
  surveys.closes_at,
  creators.user_id,
  surveys.published_at,
  surveys.closed_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_surveys surveys
left join public.temp_demo_grade_levels grade_levels
  on grade_levels.code = surveys.grade_code
left join public.temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = surveys.class_key
join public.temp_demo_users creators
  on creators.email = surveys.created_by_email
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  title = excluded.title,
  description = excluded.description,
  target_type = excluded.target_type,
  target_role = excluded.target_role,
  grade_level_id = excluded.grade_level_id,
  class_id = excluded.class_id,
  status = excluded.status,
  opens_at = excluded.opens_at,
  closes_at = excluded.closes_at,
  created_by_user_id = excluded.created_by_user_id,
  published_at = excluded.published_at,
  closed_at = excluded.closed_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.survey_questions (
  id,
  tenant_id,
  school_id,
  survey_id,
  question_text,
  question_type,
  options,
  is_required,
  sort_order,
  created_at,
  updated_at
)
select
  survey_questions.question_id,
  ctx.tenant_id,
  ctx.school_id,
  surveys.survey_id,
  survey_questions.question_text,
  survey_questions.question_type,
  survey_questions.options,
  survey_questions.is_required,
  survey_questions.sort_order,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_survey_questions survey_questions
join public.temp_demo_surveys surveys
  on surveys.survey_key = survey_questions.survey_key
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  survey_id = excluded.survey_id,
  question_text = excluded.question_text,
  question_type = excluded.question_type,
  options = excluded.options,
  is_required = excluded.is_required,
  sort_order = excluded.sort_order,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.survey_responses (
  id,
  tenant_id,
  school_id,
  survey_id,
  respondent_user_id,
  student_id,
  answers,
  submitted_at,
  created_at,
  updated_at
)
select
  survey_responses.survey_response_id,
  ctx.tenant_id,
  ctx.school_id,
  surveys.survey_id,
  respondents.user_id,
  students.student_id,
  jsonb_build_object(
    public.demo_seed_uuid('ofuq-syrian-demo:survey-question:teacher-readiness-2026:q1')::text,
    survey_responses.answer_q1,
    public.demo_seed_uuid('ofuq-syrian-demo:survey-question:teacher-readiness-2026:q2')::text,
    survey_responses.answer_q2
  ),
  survey_responses.submitted_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_survey_responses survey_responses
join public.temp_demo_surveys surveys
  on surveys.survey_key = survey_responses.survey_key
join public.temp_demo_users respondents
  on respondents.email = survey_responses.respondent_email
left join public.temp_demo_students students
  on students.student_number = survey_responses.student_number
cross join public.temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  survey_id = excluded.survey_id,
  respondent_user_id = excluded.respondent_user_id,
  student_id = excluded.student_id,
  answers = excluded.answers,
  submitted_at = excluded.submitted_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- 13 Settings and integrations placeholders

insert into public.school_settings (
  id,
  tenant_id,
  school_id,
  school_display_name,
  timezone,
  locale,
  direction,
  academic_week_start,
  branding,
  module_flags,
  updated_by_user_id,
  created_at,
  updated_at
)
select
  public.demo_seed_uuid('ofuq-syrian-demo:school-settings'),
  ctx.tenant_id,
  ctx.school_id,
  'مدرسة أفق النموذجية الخاصة',
  'Asia/Damascus',
  'ar',
  'rtl',
  0,
  jsonb_build_object(
    'interface_name', 'منصة أفق المدرسية',
    'logo_hint', 'placeholder-only',
    'primary_color', '#0D1B3D',
    'secondary_color', '#0D7A7B',
    'accent_color', '#C9A24B'
  ),
  jsonb_build_object(
    'students', true,
    'academic', true,
    'attendance', true,
    'grades', true,
    'timetable', true,
    'finance', true,
    'communication', true,
    'reports', true,
    'library', true,
    'student_care', true,
    'feedback', true,
    'portal', true
  ),
  admins.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_context ctx
join public.temp_demo_users admins
  on admins.email = 'school.admin@ofuq.local'
on conflict (tenant_id, school_id) do update
set
  school_display_name = excluded.school_display_name,
  timezone = excluded.timezone,
  locale = excluded.locale,
  direction = excluded.direction,
  academic_week_start = excluded.academic_week_start,
  branding = excluded.branding,
  module_flags = excluded.module_flags,
  updated_by_user_id = excluded.updated_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.integration_settings (
  id,
  tenant_id,
  school_id,
  provider,
  display_name,
  status,
  enabled,
  settings,
  updated_by_user_id,
  created_at,
  updated_at
)
select
  public.demo_seed_uuid('ofuq-syrian-demo:integration:' || provider_rows.provider::text),
  ctx.tenant_id,
  ctx.school_id,
  provider_rows.provider,
  provider_rows.display_name,
  'placeholder',
  false,
  provider_rows.settings,
  admins.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_context ctx
join public.temp_demo_users admins
  on admins.email = 'school.admin@ofuq.local'
cross join (
  values
    (
      'whatsapp'::public.integration_provider,
      'WhatsApp Business'::text,
      jsonb_build_object('mode', 'settings_only')
    ),
    (
      'webhooks'::public.integration_provider,
      'Webhooks'::text,
      jsonb_build_object('mode', 'settings_only')
    ),
    (
      'moe'::public.integration_provider,
      'وزارة التربية'::text,
      jsonb_build_object('mode', 'settings_only')
    ),
    (
      'google_calendar'::public.integration_provider,
      'Google Calendar'::text,
      jsonb_build_object('mode', 'settings_only')
    ),
    (
      'microsoft_calendar'::public.integration_provider,
      'Microsoft Calendar'::text,
      jsonb_build_object('mode', 'settings_only')
    ),
    (
      'power_bi'::public.integration_provider,
      'Power BI'::text,
      jsonb_build_object('mode', 'settings_only')
    ),
    (
      'looker'::public.integration_provider,
      'Looker'::text,
      jsonb_build_object('mode', 'settings_only')
    ),
    (
      'zapier'::public.integration_provider,
      'Zapier'::text,
      jsonb_build_object('mode', 'settings_only')
    ),
    (
      'make'::public.integration_provider,
      'Make'::text,
      jsonb_build_object('mode', 'settings_only')
    )
) as provider_rows(provider, display_name, settings)
on conflict (tenant_id, school_id, provider) do update
set
  display_name = excluded.display_name,
  status = excluded.status,
  enabled = excluded.enabled,
  settings = excluded.settings,
  updated_by_user_id = excluded.updated_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.message_templates (
  id,
  tenant_id,
  school_id,
  template_key,
  channel,
  title,
  body,
  status,
  updated_by_user_id,
  created_at,
  updated_at
)
select
  public.demo_seed_uuid(
    'ofuq-syrian-demo:message-template:' || template_rows.template_key || ':' || template_rows.channel::text
  ),
  ctx.tenant_id,
  ctx.school_id,
  template_rows.template_key,
  template_rows.channel,
  template_rows.title,
  template_rows.body,
  template_rows.status,
  admins.user_id,
  ctx.seed_created_at,
  ctx.seed_updated_at
from public.temp_demo_context ctx
join public.temp_demo_users admins
  on admins.email = 'school.admin@ofuq.local'
cross join (
  values
    (
      'attendance_absence_notice'::text,
      'in_app'::public.message_template_channel,
      'إشعار غياب الطالب'::text,
      'تم تسجيل غياب الطالب اليوم. يرجى متابعة السبب مع إدارة المدرسة.'::text,
      'active'::public.message_template_status
    ),
    (
      'invoice_reminder'::text,
      'in_app'::public.message_template_channel,
      'تذكير فاتورة مدرسية'::text,
      'يوجد رصيد مستحق على الفاتورة. هذه الرسالة قالب داخلي فقط ولا يتم إرسالها خارجيًا في هذه المرحلة.'::text,
      'active'::public.message_template_status
    ),
    (
      'general_announcement'::text,
      'in_app'::public.message_template_channel,
      'إعلان عام'::text,
      'هذا قالب داخلي لاستخدام الإعلانات العامة داخل النظام.'::text,
      'draft'::public.message_template_status
    )
) as template_rows(template_key, channel, title, body, status)
on conflict (tenant_id, school_id, template_key, channel) do update
set
  title = excluded.title,
  body = excluded.body,
  status = excluded.status,
  updated_by_user_id = excluded.updated_by_user_id,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- 14 Summary

select
  'local syrian demo seed applied' as message,
  (select count(*) from public.temp_demo_users) as demo_auth_users,
  (select count(*) from public.user_profiles up join public.temp_demo_users du on du.user_id = up.id) as demo_user_profiles,
  (select count(*) from public.user_memberships where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as demo_memberships,
  (select count(*) from public.grade_levels where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as grade_levels,
  (select count(*) from public.classes where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as classes,
  (select count(*) from public.subjects where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as subjects,
  (select count(*) from public.grade_level_subjects where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as grade_level_subjects,
  (select count(*) from public.students where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as students,
  (select count(*) from public.student_guardians where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as guardians,
  (select count(*) from public.class_enrollments where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as class_enrollments,
  (select count(*) from public.attendance_sessions where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as attendance_sessions,
  (select count(*) from public.attendance_records where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as attendance_records,
  (select count(*) from public.exams where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as exams,
  (select count(*) from public.exam_results where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as exam_results,
  (select count(*) from public.report_cards where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as report_cards,
  (select count(*) from public.timetable_slots where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as timetable_slots,
  (select count(*) from public.invoices where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as invoices,
  (select count(*) from public.payments where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as payments,
  (select count(*) from public.messages where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as messages,
  (select count(*) from public.book_loans where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as book_loans,
  (select count(*) from public.health_records where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as health_records,
  (select count(*) from public.complaints where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as complaints,
  (select count(*) from public.surveys where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as surveys,
  (select count(*) from public.survey_responses where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as survey_responses,
  (select count(*) from public.school_settings where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as school_settings,
  (select count(*) from public.integration_settings where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as integration_settings,
  (select count(*) from public.message_templates where tenant_id = (select tenant_id from public.temp_demo_context) and school_id = (select school_id from public.temp_demo_context)) as message_templates;
