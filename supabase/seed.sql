create extension if not exists "pgcrypto";

with smoke_values as (
  select
    '00000000-0000-4000-8000-000000000001'::uuid as tenant_id,
    '00000000-0000-4000-8000-000000000002'::uuid as school_id,
    '00000000-0000-4000-8000-000000000010'::uuid as admin_user_id,
    '00000000-0000-4000-8000-000000000011'::uuid as teacher_user_id,
    '00000000-0000-4000-8000-000000000020'::uuid as academic_year_id,
    '00000000-0000-4000-8000-000000000021'::uuid as term_id,
    '00000000-0000-4000-8000-000000000030'::uuid as grade_level_id,
    '00000000-0000-4000-8000-000000000031'::uuid as class_id,
    '00000000-0000-4000-8000-000000000040'::uuid as subject_id,
    '00000000-0000-4000-8000-000000000041'::uuid as grade_level_subject_id,
    '00000000-0000-4000-8000-000000000050'::uuid as student_id,
    '00000000-0000-4000-8000-000000000051'::uuid as student_qr_token,
    '00000000-0000-4000-8000-000000000052'::uuid as guardian_id,
    '00000000-0000-4000-8000-000000000053'::uuid as class_enrollment_id,
    '00000000-0000-4000-8000-000000000060'::uuid as admin_membership_id,
    '00000000-0000-4000-8000-000000000061'::uuid as teacher_membership_id
),
upsert_tenant as (
  insert into public.tenants (
    id,
    name,
    slug,
    status,
    locale,
    direction
  )
  select
    tenant_id,
    'Ofuq Demo Tenant',
    'ofuq-demo',
    'active',
    'ar',
    'rtl'
  from smoke_values
  on conflict (slug) do update
  set
    name = excluded.name,
    status = excluded.status,
    locale = excluded.locale,
    direction = excluded.direction
  returning id
),
upsert_school as (
  insert into public.schools (
    id,
    tenant_id,
    name,
    slug,
    status
  )
  select
    smoke_values.school_id,
    upsert_tenant.id,
    'مدرسة أفق التجريبية',
    'ofuq-demo-school',
    'active'
  from smoke_values
  cross join upsert_tenant
  on conflict (tenant_id, slug) do update
  set
    name = excluded.name,
    status = excluded.status
  returning id, tenant_id
),
smoke_auth_users as (
  select
    admin_user_id as id,
    'admin@ofuq.local'::text as email,
    'مشرف أفق المحلي'::text as full_name
  from smoke_values

  union all

  select
    teacher_user_id as id,
    'teacher@ofuq.local'::text as email,
    'معلم أفق المحلي'::text as full_name
  from smoke_values
),
upsert_auth_users as (
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
    id,
    'authenticated',
    'authenticated',
    email,
    crypt('OfuqLocal123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', full_name),
    now(),
    now()
  from smoke_auth_users
  on conflict (id) do update
  set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now()
  returning id, email
),
upsert_auth_identities as (
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
    id,
    id,
    id::text,
    jsonb_build_object(
      'sub',
      id::text,
      'email',
      email,
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now()
  from upsert_auth_users
  on conflict (provider_id, provider) do update
  set
    identity_data = excluded.identity_data,
    updated_at = now()
  returning user_id
),
upsert_profiles as (
  insert into public.user_profiles (
    id,
    full_name,
    display_name,
    preferred_locale,
    preferred_direction
  )
  select
    admin_user_id,
    'مشرف أفق المحلي',
    'مشرف محلي',
    'ar',
    'rtl'
  from smoke_values

  union all

  select
    teacher_user_id,
    'معلم أفق المحلي',
    'معلم محلي',
    'ar',
    'rtl'
  from smoke_values
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    display_name = excluded.display_name,
    preferred_locale = excluded.preferred_locale,
    preferred_direction = excluded.preferred_direction,
    updated_at = now()
  returning id
),
upsert_memberships as (
  insert into public.user_memberships (
    id,
    user_id,
    tenant_id,
    school_id,
    role,
    status,
    is_primary
  )
  select
    admin_membership_id,
    admin_user_id,
    upsert_school.tenant_id,
    upsert_school.id,
    'school_admin'::public.user_role,
    'active'::public.membership_status,
    true
  from smoke_values
  cross join upsert_school

  union all

  select
    teacher_membership_id,
    teacher_user_id,
    upsert_school.tenant_id,
    upsert_school.id,
    'teacher'::public.user_role,
    'active'::public.membership_status,
    true
  from smoke_values
  cross join upsert_school
  on conflict (user_id, tenant_id, school_id, role) do update
  set
    status = excluded.status,
    is_primary = excluded.is_primary,
    updated_at = now()
  returning id
),
upsert_academic_year as (
  insert into public.academic_years (
    id,
    tenant_id,
    school_id,
    name,
    code,
    starts_on,
    ends_on,
    status,
    is_current
  )
  select
    academic_year_id,
    upsert_school.tenant_id,
    upsert_school.id,
    '2026-2027',
    '2026-2027',
    '2026-08-01',
    '2027-06-30',
    'active'::public.academic_year_status,
    true
  from smoke_values
  cross join upsert_school
  on conflict (tenant_id, school_id, code) do update
  set
    name = excluded.name,
    starts_on = excluded.starts_on,
    ends_on = excluded.ends_on,
    status = excluded.status,
    is_current = excluded.is_current,
    updated_at = now()
  returning id, tenant_id, school_id
),
upsert_term as (
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
    status
  )
  select
    term_id,
    upsert_academic_year.tenant_id,
    upsert_academic_year.school_id,
    upsert_academic_year.id,
    'الفصل الأول',
    'T1',
    1,
    '2026-08-01',
    '2026-12-31',
    'active'::public.term_status
  from smoke_values
  cross join upsert_academic_year
  on conflict (academic_year_id, code) do update
  set
    name = excluded.name,
    term_order = excluded.term_order,
    starts_on = excluded.starts_on,
    ends_on = excluded.ends_on,
    status = excluded.status,
    updated_at = now()
  returning id
),
upsert_grade_level as (
  insert into public.grade_levels (
    id,
    tenant_id,
    school_id,
    name,
    code,
    grade_order,
    stage,
    status
  )
  select
    grade_level_id,
    upsert_school.tenant_id,
    upsert_school.id,
    'الصف الأول',
    'G1',
    1,
    'primary'::public.grade_level_stage,
    'active'::public.grade_level_status
  from smoke_values
  cross join upsert_school
  on conflict (tenant_id, school_id, code) do update
  set
    name = excluded.name,
    grade_order = excluded.grade_order,
    stage = excluded.stage,
    status = excluded.status,
    updated_at = now()
  returning id, tenant_id, school_id
),
upsert_class as (
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
    status
  )
  select
    class_id,
    upsert_academic_year.tenant_id,
    upsert_academic_year.school_id,
    upsert_academic_year.id,
    upsert_grade_level.id,
    'الصف الأول / أ',
    'A',
    30,
    smoke_values.teacher_user_id,
    '101',
    'active'::public.class_status
  from smoke_values
  cross join upsert_academic_year
  cross join upsert_grade_level
  on conflict (tenant_id, school_id, academic_year_id, grade_level_id, section) do update
  set
    name = excluded.name,
    capacity = excluded.capacity,
    homeroom_teacher_id = excluded.homeroom_teacher_id,
    room_name = excluded.room_name,
    status = excluded.status,
    updated_at = now()
  returning id, tenant_id, school_id, academic_year_id, grade_level_id
),
upsert_subject as (
  insert into public.subjects (
    id,
    tenant_id,
    school_id,
    name,
    code,
    description,
    subject_type,
    status
  )
  select
    subject_id,
    upsert_school.tenant_id,
    upsert_school.id,
    'الرياضيات',
    'MATH',
    'مادة رياضيات محلية لاختبار التدفقات',
    'core'::public.subject_type,
    'active'::public.subject_status
  from smoke_values
  cross join upsert_school
  on conflict (tenant_id, school_id, code) do update
  set
    name = excluded.name,
    description = excluded.description,
    subject_type = excluded.subject_type,
    status = excluded.status,
    updated_at = now()
  returning id
),
upsert_grade_level_subject as (
  insert into public.grade_level_subjects (
    id,
    tenant_id,
    school_id,
    academic_year_id,
    grade_level_id,
    subject_id,
    is_required,
    weekly_periods,
    sort_order
  )
  select
    grade_level_subject_id,
    upsert_class.tenant_id,
    upsert_class.school_id,
    upsert_class.academic_year_id,
    upsert_class.grade_level_id,
    upsert_subject.id,
    true,
    5,
    1
  from smoke_values
  cross join upsert_class
  cross join upsert_subject
  on conflict (tenant_id, school_id, academic_year_id, grade_level_id, subject_id) do update
  set
    is_required = excluded.is_required,
    weekly_periods = excluded.weekly_periods,
    sort_order = excluded.sort_order,
    updated_at = now()
  returning id
),
upsert_student as (
  insert into public.students (
    id,
    tenant_id,
    school_id,
    student_number,
    qr_token,
    first_name,
    last_name,
    full_name,
    gender,
    birth_date,
    nationality,
    status,
    enrolled_at
  )
  select
    student_id,
    upsert_school.tenant_id,
    upsert_school.id,
    'OFUQ-SMOKE-0001',
    student_qr_token,
    'طالب',
    'تجريبي',
    'طالب تجريبي',
    'male'::public.student_gender,
    '2019-09-01',
    'محلي',
    'active'::public.student_status,
    '2026-08-01'
  from smoke_values
  cross join upsert_school
  on conflict (tenant_id, school_id, student_number) do update
  set
    qr_token = excluded.qr_token,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    full_name = excluded.full_name,
    gender = excluded.gender,
    birth_date = excluded.birth_date,
    nationality = excluded.nationality,
    status = excluded.status,
    enrolled_at = excluded.enrolled_at,
    updated_at = now()
  returning id, tenant_id, school_id
),
upsert_guardian as (
  insert into public.student_guardians (
    id,
    tenant_id,
    school_id,
    student_id,
    guardian_name,
    guardian_email,
    guardian_phone,
    relation,
    is_primary,
    can_receive_notifications
  )
  select
    guardian_id,
    upsert_student.tenant_id,
    upsert_student.school_id,
    upsert_student.id,
    'ولي أمر تجريبي',
    'guardian@ofuq.local',
    '+962700000000',
    'guardian'::public.guardian_relation,
    true,
    true
  from smoke_values
  cross join upsert_student
  on conflict (id) do update
  set
    guardian_name = excluded.guardian_name,
    guardian_email = excluded.guardian_email,
    guardian_phone = excluded.guardian_phone,
    relation = excluded.relation,
    is_primary = excluded.is_primary,
    can_receive_notifications = excluded.can_receive_notifications,
    updated_at = now()
  returning id
),
upsert_class_enrollment as (
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
    created_by_user_id
  )
  select
    class_enrollment_id,
    upsert_class.tenant_id,
    upsert_class.school_id,
    upsert_class.academic_year_id,
    upsert_class.id,
    upsert_student.id,
    upsert_class.grade_level_id,
    'active'::public.class_enrollment_status,
    '2026-08-01',
    smoke_values.admin_user_id
  from smoke_values
  cross join upsert_class
  cross join upsert_student
  on conflict (tenant_id, school_id, academic_year_id, student_id)
    where status = 'active'
  do update
  set
    class_id = excluded.class_id,
    grade_level_id = excluded.grade_level_id,
    enrolled_on = excluded.enrolled_on,
    created_by_user_id = excluded.created_by_user_id,
    updated_at = now()
  returning id
),
upsert_student_status_history as (
  insert into public.student_status_history (
    tenant_id,
    school_id,
    student_id,
    from_status,
    to_status,
    reason,
    changed_by_user_id
  )
  select
    upsert_student.tenant_id,
    upsert_student.school_id,
    upsert_student.id,
    null,
    'active'::public.student_status,
    'local_smoke_seed',
    smoke_values.admin_user_id
  from smoke_values
  cross join upsert_student
  where not exists (
    select 1
    from public.student_status_history existing
    where existing.student_id = upsert_student.id
      and existing.reason = 'local_smoke_seed'
  )
  returning id
)
select
  'local smoke seed applied' as message,
  (select count(*) from upsert_auth_users) as auth_users,
  (select count(*) from upsert_profiles) as user_profiles,
  (select count(*) from upsert_memberships) as memberships,
  (select count(*) from upsert_academic_year) as academic_years,
  (select count(*) from upsert_term) as terms,
  (select count(*) from upsert_grade_level) as grade_levels,
  (select count(*) from upsert_class) as classes,
  (select count(*) from upsert_subject) as subjects,
  (select count(*) from upsert_grade_level_subject) as grade_level_subjects,
  (select count(*) from upsert_student) as students,
  (select count(*) from upsert_guardian) as guardians,
  (select count(*) from upsert_class_enrollment) as class_enrollments,
  (select count(*) from upsert_student_status_history) as student_status_history_rows;
