create extension if not exists "pgcrypto";

create or replace function pg_temp.seed_uuid(seed text)
returns uuid
language sql
immutable
as $$
  select (
    substr(md5(seed), 1, 8) || '-' ||
    substr(md5(seed), 9, 4) || '-' ||
    '4' || substr(md5(seed), 14, 3) || '-' ||
    '8' || substr(md5(seed), 18, 3) || '-' ||
    substr(md5(seed), 21, 12)
  )::uuid
$$;

-- 01 Demo constants

create temporary table temp_demo_context as
select
  pg_temp.seed_uuid('ofuq-syrian-demo:tenant') as tenant_id,
  pg_temp.seed_uuid('ofuq-syrian-demo:school') as school_id,
  pg_temp.seed_uuid('ofuq-syrian-demo:year:2026-2027') as academic_year_id,
  pg_temp.seed_uuid('ofuq-syrian-demo:term:T1') as term_1_id,
  pg_temp.seed_uuid('ofuq-syrian-demo:term:T2') as term_2_id,
  '2026-08-15 08:00:00+03'::timestamptz as seed_created_at,
  '2026-08-15 08:00:00+03'::timestamptz as seed_updated_at;

create temporary table temp_demo_users (
  email text primary key,
  user_id uuid not null,
  membership_id uuid not null,
  role public.user_role not null,
  full_name text not null,
  display_name text not null,
  phone text
);

insert into temp_demo_users (
  email,
  user_id,
  membership_id,
  role,
  full_name,
  display_name,
  phone
)
values
  (
    'system.admin@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:system.admin@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:system.admin@ofuq.local:system_admin'),
    'system_admin',
    'سامر الخطيب',
    'مشرف النظام',
    '+963944100001'
  ),
  (
    'school.admin@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:school.admin@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:school.admin@ofuq.local:school_admin'),
    'school_admin',
    'نور الهدى الحلبي',
    'مديرة المدرسة',
    '+963944100002'
  ),
  (
    'teacher.arabic@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:teacher.arabic@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:teacher.arabic@ofuq.local:teacher'),
    'teacher',
    'محمود العلي',
    'معلم اللغة العربية',
    '+963944100101'
  ),
  (
    'teacher.math@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:teacher.math@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:teacher.math@ofuq.local:teacher'),
    'teacher',
    'رنا الشامي',
    'معلمة الرياضيات',
    '+963944100102'
  ),
  (
    'teacher.science@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:teacher.science@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:teacher.science@ofuq.local:teacher'),
    'teacher',
    'حسن دياب',
    'معلم العلوم',
    '+963944100103'
  ),
  (
    'teacher.english@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:teacher.english@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:teacher.english@ofuq.local:teacher'),
    'teacher',
    'شام الرفاعي',
    'معلمة الإنجليزية',
    '+963944100104'
  ),
  (
    'teacher.physics@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:teacher.physics@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:teacher.physics@ofuq.local:teacher'),
    'teacher',
    'كريم العلي',
    'معلم الفيزياء',
    '+963944100105'
  ),
  (
    'teacher.social@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:teacher.social@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:teacher.social@ofuq.local:teacher'),
    'teacher',
    'سارة الدروبي',
    'معلمة الاجتماعيات',
    '+963944100106'
  ),
  (
    'accountant@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:accountant@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:accountant@ofuq.local:accountant'),
    'accountant',
    'مالك الشامي',
    'المحاسب',
    '+963944100201'
  ),
  (
    'librarian@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:librarian@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:librarian@ofuq.local:librarian'),
    'librarian',
    'جنى الحلبي',
    'أمينة المكتبة',
    '+963944100202'
  ),
  (
    'parent.hassan@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:parent.hassan@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:parent.hassan@ofuq.local:parent'),
    'parent',
    'حسن الأحمد',
    'ولي أمر',
    '+963944100301'
  ),
  (
    'parent.rana@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:parent.rana@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:parent.rana@ofuq.local:parent'),
    'parent',
    'رنا منصور',
    'ولية أمر',
    '+963944100302'
  ),
  (
    'student.youssef@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:student.youssef@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:student.youssef@ofuq.local:student'),
    'student',
    'يوسف الأحمد',
    'الطالب يوسف',
    '+963944100401'
  ),
  (
    'student.lana@ofuq.local',
    pg_temp.seed_uuid('ofuq-syrian-demo:user:student.lana@ofuq.local'),
    pg_temp.seed_uuid('ofuq-syrian-demo:membership:student.lana@ofuq.local:student'),
    'student',
    'لانا منصور',
    'الطالبة لانا',
    '+963944100402'
  );

create temporary table temp_demo_grade_levels (
  grade_level_id uuid primary key,
  code text not null,
  name text not null,
  grade_order integer not null,
  stage public.grade_level_stage not null
);

insert into temp_demo_grade_levels (
  grade_level_id,
  code,
  name,
  grade_order,
  stage
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G01'), 'G01', 'الصف الأول', 1, 'primary'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G02'), 'G02', 'الصف الثاني', 2, 'primary'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G03'), 'G03', 'الصف الثالث', 3, 'primary'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G04'), 'G04', 'الصف الرابع', 4, 'primary'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G05'), 'G05', 'الصف الخامس', 5, 'primary'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G06'), 'G06', 'الصف السادس', 6, 'primary'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G07'), 'G07', 'الصف السابع', 7, 'middle'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G08'), 'G08', 'الصف الثامن', 8, 'middle'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G09'), 'G09', 'الصف التاسع', 9, 'middle'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G10'), 'G10', 'الأول الثانوي', 10, 'secondary'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G11'), 'G11', 'الثاني الثانوي', 11, 'secondary'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade:G12'), 'G12', 'الثالث الثانوي', 12, 'secondary');

create temporary table temp_demo_classes (
  class_id uuid primary key,
  grade_code text not null,
  section text not null,
  name text not null,
  capacity integer,
  homeroom_email text not null,
  room_name text
);

insert into temp_demo_classes (
  class_id,
  grade_code,
  section,
  name,
  capacity,
  homeroom_email,
  room_name
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G01:A'), 'G01', 'A', 'الصف الأول / أ', 28, 'teacher.arabic@ofuq.local', 'القاعة 101'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G02:A'), 'G02', 'A', 'الصف الثاني / أ', 28, 'teacher.math@ofuq.local', 'القاعة 102'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G03:A'), 'G03', 'A', 'الصف الثالث / أ', 28, 'teacher.science@ofuq.local', 'القاعة 103'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G04:A'), 'G04', 'A', 'الصف الرابع / أ', 28, 'teacher.english@ofuq.local', 'القاعة 104'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G05:A'), 'G05', 'A', 'الصف الخامس / أ', 28, 'teacher.social@ofuq.local', 'القاعة 105'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G06:A'), 'G06', 'A', 'الصف السادس / أ', 28, 'teacher.arabic@ofuq.local', 'القاعة 106'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G07:A'), 'G07', 'A', 'الصف السابع / أ', 30, 'teacher.math@ofuq.local', 'القاعة 201'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G07:B'), 'G07', 'B', 'الصف السابع / ب', 30, 'teacher.english@ofuq.local', 'القاعة 202'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G08:A'), 'G08', 'A', 'الصف الثامن / أ', 30, 'teacher.science@ofuq.local', 'القاعة 203'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G08:B'), 'G08', 'B', 'الصف الثامن / ب', 30, 'teacher.social@ofuq.local', 'القاعة 204'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G09:A'), 'G09', 'A', 'الصف التاسع / أ', 30, 'teacher.arabic@ofuq.local', 'القاعة 205'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G09:B'), 'G09', 'B', 'الصف التاسع / ب', 30, 'teacher.math@ofuq.local', 'القاعة 206'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G10:A'), 'G10', 'A', 'الأول الثانوي / أ', 32, 'teacher.physics@ofuq.local', 'القاعة 301'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G10:B'), 'G10', 'B', 'الأول الثانوي / ب', 32, 'teacher.english@ofuq.local', 'القاعة 302'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G11:A'), 'G11', 'A', 'الثاني الثانوي / أ', 32, 'teacher.physics@ofuq.local', 'القاعة 303'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G11:B'), 'G11', 'B', 'الثاني الثانوي / ب', 32, 'teacher.social@ofuq.local', 'القاعة 304'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G12:A'), 'G12', 'A', 'الثالث الثانوي / أ', 32, 'teacher.physics@ofuq.local', 'القاعة 305'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:class:G12:B'), 'G12', 'B', 'الثالث الثانوي / ب', 32, 'teacher.math@ofuq.local', 'القاعة 306');

create temporary table temp_demo_subjects (
  subject_id uuid primary key,
  code text not null,
  name text not null,
  description text,
  subject_type public.subject_type not null
);

insert into temp_demo_subjects (
  subject_id,
  code,
  name,
  description,
  subject_type
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:ARABIC'), 'ARABIC', 'اللغة العربية', 'محتوى عربي أساسي ضمن المنهاج السوري المحلي.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:MATH'), 'MATH', 'الرياضيات', 'مهارات الحساب والجبر والهندسة بحسب المرحلة.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:SCIENCE'), 'SCIENCE', 'العلوم العامة', 'علوم عامة للمرحلتين الابتدائية والإعدادية.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:SOCIAL'), 'SOCIAL', 'الدراسات الاجتماعية', 'موضوعات اجتماعية مبسطة للصفوف الأولى.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:ENGLISH'), 'ENGLISH', 'اللغة الإنجليزية', 'مهارات اللغة الإنجليزية الأساسية.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:FRENCH'), 'FRENCH', 'اللغة الفرنسية', 'مدخل إلى اللغة الفرنسية.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:NATIONAL'), 'NATIONAL', 'التربية الوطنية', 'التربية الوطنية والمواطنة.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:RELIGION'), 'RELIGION', 'التربية الدينية', 'التربية الدينية العامة.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:ART'), 'ART', 'التربية الفنية', 'أنشطة فنية صفية.', 'activity'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:PE'), 'PE', 'التربية الرياضية', 'نشاط رياضي وحركي.', 'activity'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:PHYSICS'), 'PHYSICS', 'الفيزياء', 'مفاهيم الفيزياء للمرحلة الثانوية.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:CHEMISTRY'), 'CHEMISTRY', 'الكيمياء', 'مفاهيم الكيمياء للمرحلة الثانوية.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:BIOLOGY'), 'BIOLOGY', 'علم الأحياء', 'علم الأحياء للمرحلة الثانوية.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:HISTORY'), 'HISTORY', 'التاريخ', 'أحداث وشخصيات تاريخية مختارة.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:GEOGRAPHY'), 'GEOGRAPHY', 'الجغرافيا', 'خرائط وبيئات جغرافية.', 'core'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:subject:PHILOSOPHY'), 'PHILOSOPHY', 'الفلسفة', 'مقدمات في الفلسفة والتفكير النقدي.', 'core');

create temporary table temp_demo_grade_subjects as
select
  pg_temp.seed_uuid(
    'ofuq-syrian-demo:grade-subject:' || grade.code || ':' || subject_map.subject_code
  ) as grade_level_subject_id,
  grade.code as grade_code,
  subject_map.subject_code,
  subject_map.subject_sort_order as sort_order,
  case subject_map.subject_code
    when 'ARABIC' then case when grade.grade_order <= 6 then 7 else 5 end
    when 'MATH' then case when grade.grade_order <= 6 then 6 else 5 end
    when 'SCIENCE' then 4
    when 'SOCIAL' then 3
    when 'ENGLISH' then 4
    when 'FRENCH' then case when grade.grade_order >= 10 then 2 else 3 end
    when 'NATIONAL' then 1
    when 'RELIGION' then case when grade.grade_order <= 6 then 2 else 1 end
    when 'ART' then 1
    when 'PE' then 2
    when 'PHYSICS' then 4
    when 'CHEMISTRY' then 4
    when 'BIOLOGY' then 4
    when 'HISTORY' then 2
    when 'GEOGRAPHY' then 2
    when 'PHILOSOPHY' then 2
    else 1
  end as weekly_periods
from temp_demo_grade_levels grade
cross join lateral unnest(
  case
    when grade.grade_order between 1 and 6 then array[
      'ARABIC',
      'MATH',
      'SCIENCE',
      'SOCIAL',
      'ENGLISH',
      'NATIONAL',
      'RELIGION',
      'ART',
      'PE'
    ]
    when grade.grade_order between 7 and 9 then array[
      'ARABIC',
      'MATH',
      'SCIENCE',
      'ENGLISH',
      'FRENCH',
      'HISTORY',
      'GEOGRAPHY',
      'NATIONAL',
      'RELIGION'
    ]
    else array[
      'ARABIC',
      'MATH',
      'PHYSICS',
      'CHEMISTRY',
      'BIOLOGY',
      'ENGLISH',
      'FRENCH',
      'HISTORY',
      'GEOGRAPHY',
      'PHILOSOPHY',
      'NATIONAL'
    ]
  end
) with ordinality as subject_map(subject_code, subject_sort_order);

create temporary table temp_demo_guardians (
  guardian_key text primary key,
  guardian_name text not null,
  guardian_email text not null,
  guardian_phone text not null,
  relation public.guardian_relation not null,
  guardian_user_email text
);

insert into temp_demo_guardians (
  guardian_key,
  guardian_name,
  guardian_email,
  guardian_phone,
  relation,
  guardian_user_email
)
values
  ('ahmad', 'حسن الأحمد', 'parent.hassan@ofuq.local', '+963944200001', 'father', 'parent.hassan@ofuq.local'),
  ('mansour', 'رنا منصور', 'parent.rana@ofuq.local', '+963944200002', 'mother', 'parent.rana@ofuq.local'),
  ('khatib', 'محمود الخطيب', 'guardian.khatib@ofuq.local', '+963944200003', 'father', null),
  ('ali', 'نور العلي', 'guardian.ali@ofuq.local', '+963944200004', 'mother', null),
  ('shami', 'سامر الشامي', 'guardian.shami@ofuq.local', '+963944200005', 'father', null),
  ('homsi', 'ليلى الحمصي', 'guardian.homsi@ofuq.local', '+963944200006', 'mother', null),
  ('hasan', 'خالد الحسن', 'guardian.hasan@ofuq.local', '+963944200007', 'father', null),
  ('rafai', 'نور الرفاعي', 'guardian.rafai@ofuq.local', '+963944200008', 'mother', null),
  ('darwish', 'فادي درويش', 'guardian.darwish@ofuq.local', '+963944200009', 'father', null),
  ('sabbagh', 'هناء الصباغ', 'guardian.sabbagh@ofuq.local', '+963944200010', 'mother', null),
  ('murad', 'رائد مراد', 'guardian.murad@ofuq.local', '+963944200011', 'father', null),
  ('diab', 'منى دياب', 'guardian.diab@ofuq.local', '+963944200012', 'mother', null);

create temporary table temp_demo_admissions (
  admission_key text primary key,
  admission_id uuid not null,
  student_first_name text not null,
  student_middle_name text,
  student_last_name text not null,
  student_full_name text not null,
  gender public.student_gender,
  birth_date date,
  nationality text,
  guardian_name text not null,
  guardian_email text,
  guardian_phone text not null,
  guardian_relation public.guardian_relation not null,
  status public.admission_status not null,
  submitted_by_email text,
  reviewed_by_email text,
  notes text,
  decision_notes text,
  submitted_at timestamptz not null,
  reviewed_at timestamptz
);

insert into temp_demo_admissions (
  admission_key,
  admission_id,
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
  status,
  submitted_by_email,
  reviewed_by_email,
  notes,
  decision_notes,
  submitted_at,
  reviewed_at
)
values
  (
    'approved-youssef',
    pg_temp.seed_uuid('ofuq-syrian-demo:admission:approved-youssef'),
    'يوسف',
    null,
    'الأحمد',
    'يوسف الأحمد',
    'male',
    '2019-02-14',
    'سوري',
    'حسن الأحمد',
    'parent.hassan@ofuq.local',
    '+963944200001',
    'father',
    'approved',
    'parent.hassan@ofuq.local',
    'school.admin@ofuq.local',
    'طلب قبول تمت مراجعته محليًا لبيانات العرض.',
    'تمت الموافقة بعد استكمال الوثائق الأساسية.',
    '2026-08-20 09:00:00+03',
    '2026-08-22 11:30:00+03'
  ),
  (
    'pending-salma',
    pg_temp.seed_uuid('ofuq-syrian-demo:admission:pending-salma'),
    'سلمى',
    null,
    'سليمان',
    'سلمى سليمان',
    'female',
    '2020-01-10',
    'سوري',
    'وليد سليمان',
    'guardian.pending@ofuq.local',
    '+963944299001',
    'father',
    'pending',
    'parent.rana@ofuq.local',
    null,
    'بانتظار استكمال ملف التطعيم وصورة القيد.',
    null,
    '2026-08-24 10:15:00+03',
    null
  ),
  (
    'rejected-rami',
    pg_temp.seed_uuid('ofuq-syrian-demo:admission:rejected-rami'),
    'رامي',
    null,
    'قاسم',
    'رامي قاسم',
    'male',
    '2018-11-03',
    'سوري',
    'ميساء قاسم',
    'guardian.rejected@ofuq.local',
    '+963944299002',
    'mother',
    'rejected',
    'school.admin@ofuq.local',
    'school.admin@ofuq.local',
    'طلب متأخر بعد اكتمال الشواغر الحالية.',
    'تم الاعتذار عن القبول لعدم توفر مقعد شاغر في المرحلة المطلوبة.',
    '2026-08-26 08:45:00+03',
    '2026-08-27 12:00:00+03'
  );

create temporary table temp_demo_students (
  student_id uuid primary key,
  student_number text not null,
  qr_token uuid not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  full_name text not null,
  gender public.student_gender,
  birth_date date,
  nationality text,
  grade_code text not null,
  section text not null,
  guardian_key text not null,
  admission_key text,
  enrolled_at date not null
);

insert into temp_demo_students (
  student_id,
  student_number,
  qr_token,
  first_name,
  middle_name,
  last_name,
  full_name,
  gender,
  birth_date,
  nationality,
  grade_code,
  section,
  guardian_key,
  admission_key,
  enrolled_at
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-001'), 'SYR-2026-001', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-001'), 'يوسف', null, 'الأحمد', 'يوسف الأحمد', 'male', '2019-02-14', 'سوري', 'G01', 'A', 'ahmad', 'approved-youssef', '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-002'), 'SYR-2026-002', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-002'), 'ماسة', null, 'الأحمد', 'ماسة الأحمد', 'female', '2019-06-22', 'سوري', 'G01', 'A', 'ahmad', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-003'), 'SYR-2026-003', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-003'), 'لانا', null, 'منصور', 'لانا منصور', 'female', '2018-03-08', 'سوري', 'G02', 'A', 'mansour', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-004'), 'SYR-2026-004', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-004'), 'سليم', null, 'منصور', 'سليم منصور', 'male', '2018-08-19', 'سوري', 'G02', 'A', 'mansour', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-005'), 'SYR-2026-005', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-005'), 'عمر', null, 'الخطيب', 'عمر الخطيب', 'male', '2017-02-11', 'سوري', 'G03', 'A', 'khatib', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-006'), 'SYR-2026-006', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-006'), 'شام', null, 'الخطيب', 'شام الخطيب', 'female', '2017-05-27', 'سوري', 'G03', 'A', 'khatib', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-007'), 'SYR-2026-007', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-007'), 'كريم', null, 'العلي', 'كريم العلي', 'male', '2016-01-16', 'سوري', 'G04', 'A', 'ali', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-008'), 'SYR-2026-008', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-008'), 'سارة', null, 'العلي', 'سارة العلي', 'female', '2016-04-29', 'سوري', 'G04', 'A', 'ali', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-009'), 'SYR-2026-009', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-009'), 'مالك', null, 'الشامي', 'مالك الشامي', 'male', '2015-02-09', 'سوري', 'G05', 'A', 'shami', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-010'), 'SYR-2026-010', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-010'), 'جنى', null, 'الشامي', 'جنى الشامي', 'female', '2015-09-14', 'سوري', 'G05', 'A', 'shami', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-011'), 'SYR-2026-011', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-011'), 'ليان', null, 'الحمصي', 'ليان الحمصي', 'female', '2014-01-25', 'سوري', 'G06', 'A', 'homsi', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-012'), 'SYR-2026-012', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-012'), 'أنس', null, 'الحمصي', 'أنس الحمصي', 'male', '2014-06-30', 'سوري', 'G06', 'A', 'homsi', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-013'), 'SYR-2026-013', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-013'), 'آدم', null, 'الحسن', 'آدم الحسن', 'male', '2013-02-20', 'سوري', 'G07', 'A', 'hasan', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-014'), 'SYR-2026-014', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-014'), 'ديما', null, 'الحسن', 'ديما الحسن', 'female', '2013-10-02', 'سوري', 'G07', 'B', 'hasan', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-015'), 'SYR-2026-015', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-015'), 'رامي', null, 'الرفاعي', 'رامي الرفاعي', 'male', '2012-01-05', 'سوري', 'G08', 'A', 'rafai', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-016'), 'SYR-2026-016', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-016'), 'تالا', null, 'الرفاعي', 'تالا الرفاعي', 'female', '2012-07-18', 'سوري', 'G08', 'B', 'rafai', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-017'), 'SYR-2026-017', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-017'), 'باسل', null, 'درويش', 'باسل درويش', 'male', '2011-03-03', 'سوري', 'G09', 'A', 'darwish', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-018'), 'SYR-2026-018', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-018'), 'هبة', null, 'درويش', 'هبة درويش', 'female', '2011-11-09', 'سوري', 'G09', 'B', 'darwish', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-019'), 'SYR-2026-019', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-019'), 'نادر', null, 'الصباغ', 'نادر الصباغ', 'male', '2010-02-12', 'سوري', 'G10', 'A', 'sabbagh', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-020'), 'SYR-2026-020', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-020'), 'مريم', null, 'الصباغ', 'مريم الصباغ', 'female', '2010-09-21', 'سوري', 'G10', 'B', 'sabbagh', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-021'), 'SYR-2026-021', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-021'), 'إياد', null, 'مراد', 'إياد مراد', 'male', '2009-01-29', 'سوري', 'G11', 'A', 'murad', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-022'), 'SYR-2026-022', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-022'), 'زينة', null, 'مراد', 'زينة مراد', 'female', '2009-06-06', 'سوري', 'G11', 'B', 'murad', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-023'), 'SYR-2026-023', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-023'), 'يزن', null, 'دياب', 'يزن دياب', 'male', '2008-02-17', 'سوري', 'G12', 'A', 'diab', null, '2026-09-01'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student:SYR-2026-024'), 'SYR-2026-024', pg_temp.seed_uuid('ofuq-syrian-demo:qr:SYR-2026-024'), 'ورد', null, 'دياب', 'ورد دياب', 'female', '2008-08-24', 'سوري', 'G12', 'B', 'diab', null, '2026-09-01');

create temporary table temp_demo_rooms (
  room_id uuid primary key,
  room_key text not null,
  name text not null,
  code text not null,
  capacity integer,
  location text
);

insert into temp_demo_rooms (
  room_id,
  room_key,
  name,
  code,
  capacity,
  location
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:room:R101'), 'R101', 'قاعة 101', 'R101', 30, 'الطابق الأول'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:room:R102'), 'R102', 'قاعة 102', 'R102', 30, 'الطابق الأول'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:room:LAB-SCI'), 'LAB-SCI', 'مختبر العلوم', 'LAB-SCI', 24, 'الطابق الثاني'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:room:LAB-IT'), 'LAB-IT', 'مختبر الحاسوب', 'LAB-IT', 24, 'الطابق الثاني'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:room:LAB-PHY'), 'LAB-PHY', 'قاعة الفيزياء', 'LAB-PHY', 24, 'الطابق الثالث');

create temporary table temp_demo_timetable_assignments (
  assignment_id uuid primary key,
  grade_code text not null,
  subject_code text not null,
  teacher_email text not null,
  created_by_email text not null
);

insert into temp_demo_timetable_assignments (
  assignment_id,
  grade_code,
  subject_code,
  teacher_email,
  created_by_email
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:assignment:G07:ARABIC'), 'G07', 'ARABIC', 'teacher.arabic@ofuq.local', 'school.admin@ofuq.local'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:assignment:G07:MATH'), 'G07', 'MATH', 'teacher.math@ofuq.local', 'school.admin@ofuq.local'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:assignment:G07:ENGLISH'), 'G07', 'ENGLISH', 'teacher.english@ofuq.local', 'school.admin@ofuq.local'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:assignment:G07:HISTORY'), 'G07', 'HISTORY', 'teacher.social@ofuq.local', 'school.admin@ofuq.local'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:assignment:G10:ARABIC'), 'G10', 'ARABIC', 'teacher.arabic@ofuq.local', 'school.admin@ofuq.local'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:assignment:G10:MATH'), 'G10', 'MATH', 'teacher.math@ofuq.local', 'school.admin@ofuq.local'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:assignment:G10:PHYSICS'), 'G10', 'PHYSICS', 'teacher.physics@ofuq.local', 'school.admin@ofuq.local'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:assignment:G10:ENGLISH'), 'G10', 'ENGLISH', 'teacher.english@ofuq.local', 'school.admin@ofuq.local');

create temporary table temp_demo_timetable_slots (
  slot_id uuid primary key,
  class_key text not null,
  grade_code text not null,
  subject_code text not null,
  teacher_email text not null,
  room_key text not null,
  day_of_week public.timetable_day_of_week not null,
  starts_at time not null,
  ends_at time not null,
  notes text
);

insert into temp_demo_timetable_slots (
  slot_id,
  class_key,
  grade_code,
  subject_code,
  teacher_email,
  room_key,
  day_of_week,
  starts_at,
  ends_at,
  notes
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G07A:sunday:0800'), 'G07:A', 'G07', 'ARABIC', 'teacher.arabic@ofuq.local', 'R101', 'sunday', '08:00', '08:45', 'حصة قراءة وتعبير'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G07B:sunday:0900'), 'G07:B', 'G07', 'MATH', 'teacher.math@ofuq.local', 'R102', 'sunday', '09:00', '09:45', 'تدريب على العمليات الأساسية'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G10A:sunday:1000'), 'G10:A', 'G10', 'PHYSICS', 'teacher.physics@ofuq.local', 'LAB-PHY', 'sunday', '10:00', '10:45', 'مفاهيم الحركة'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G10B:sunday:1100'), 'G10:B', 'G10', 'ENGLISH', 'teacher.english@ofuq.local', 'LAB-IT', 'sunday', '11:00', '11:45', 'وحدة القراءة الأولى'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G07A:monday:0800'), 'G07:A', 'G07', 'ENGLISH', 'teacher.english@ofuq.local', 'R101', 'monday', '08:00', '08:45', 'محادثة يومية'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G07B:monday:0900'), 'G07:B', 'G07', 'ARABIC', 'teacher.arabic@ofuq.local', 'R102', 'monday', '09:00', '09:45', 'إملاء وتعبير'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G10A:monday:1000'), 'G10:A', 'G10', 'MATH', 'teacher.math@ofuq.local', 'R101', 'monday', '10:00', '10:45', 'تمارين الجبر'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G10B:monday:1100'), 'G10:B', 'G10', 'PHYSICS', 'teacher.physics@ofuq.local', 'LAB-PHY', 'monday', '11:00', '11:45', 'مراجعة القياس'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G07A:tuesday:0800'), 'G07:A', 'G07', 'HISTORY', 'teacher.social@ofuq.local', 'R101', 'tuesday', '08:00', '08:45', 'أحداث تاريخية مختارة'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G07B:tuesday:0900'), 'G07:B', 'G07', 'ENGLISH', 'teacher.english@ofuq.local', 'R102', 'tuesday', '09:00', '09:45', 'مفردات أساسية'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G10A:tuesday:1000'), 'G10:A', 'G10', 'ARABIC', 'teacher.arabic@ofuq.local', 'R101', 'tuesday', '10:00', '10:45', 'بلاغة ونصوص'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G10B:tuesday:1100'), 'G10:B', 'G10', 'MATH', 'teacher.math@ofuq.local', 'R102', 'tuesday', '11:00', '11:45', 'حل مسائل'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G07A:wednesday:0800'), 'G07:A', 'G07', 'MATH', 'teacher.math@ofuq.local', 'R101', 'wednesday', '08:00', '08:45', 'مراجعة الوحدة'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G07B:wednesday:0900'), 'G07:B', 'G07', 'HISTORY', 'teacher.social@ofuq.local', 'R102', 'wednesday', '09:00', '09:45', 'تاريخ محلي'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G10A:wednesday:1000'), 'G10:A', 'G10', 'ENGLISH', 'teacher.english@ofuq.local', 'LAB-IT', 'wednesday', '10:00', '10:45', 'نشاط استماع'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G10B:wednesday:1100'), 'G10:B', 'G10', 'ARABIC', 'teacher.arabic@ofuq.local', 'R101', 'wednesday', '11:00', '11:45', 'قراءة تحليلية'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G07A:thursday:0800'), 'G07:A', 'G07', 'ARABIC', 'teacher.arabic@ofuq.local', 'R101', 'thursday', '08:00', '08:45', 'تطبيقات لغوية'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G07B:thursday:0900'), 'G07:B', 'G07', 'MATH', 'teacher.math@ofuq.local', 'R102', 'thursday', '09:00', '09:45', 'تقويم أسبوعي'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G10A:thursday:1000'), 'G10:A', 'G10', 'PHYSICS', 'teacher.physics@ofuq.local', 'LAB-PHY', 'thursday', '10:00', '10:45', 'تجربة صفية'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:slot:G10B:thursday:1100'), 'G10:B', 'G10', 'ENGLISH', 'teacher.english@ofuq.local', 'LAB-IT', 'thursday', '11:00', '11:45', 'كتابة موجزة');

create temporary table temp_demo_fee_structures (
  fee_structure_id uuid primary key,
  fee_structure_key text not null,
  grade_code text not null,
  name text not null,
  description text
);

insert into temp_demo_fee_structures (
  fee_structure_id,
  fee_structure_key,
  grade_code,
  name,
  description
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-structure:G01'), 'G01', 'G01', 'رسوم الصف الأول 2026-2027', 'رسوم أساسية مبسطة للصف الأول.'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-structure:G10'), 'G10', 'G10', 'رسوم الأول الثانوي 2026-2027', 'رسوم الصف الأول الثانوي مع بند الامتحانات.'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-structure:G12'), 'G12', 'G12', 'رسوم الثالث الثانوي 2026-2027', 'رسوم الصف الثالث الثانوي للمراجعة النهائية.');

create temporary table temp_demo_fee_items (
  fee_item_id uuid primary key,
  fee_structure_key text not null,
  name text not null,
  item_type public.fee_item_type not null,
  amount numeric(12,2) not null,
  due_date date,
  sort_order integer not null
);

insert into temp_demo_fee_items (
  fee_item_id,
  fee_structure_key,
  name,
  item_type,
  amount,
  due_date,
  sort_order
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G01:tuition'), 'G01', 'رسوم القسط المدرسي', 'tuition', 600.00, '2026-09-20', 1),
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G01:books'), 'G01', 'رسوم الكتب', 'books', 120.00, '2026-09-20', 2),
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G01:activity'), 'G01', 'رسوم النشاط', 'activity', 80.00, '2026-09-20', 3),
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G10:tuition'), 'G10', 'رسوم القسط المدرسي', 'tuition', 900.00, '2026-09-25', 1),
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G10:books'), 'G10', 'رسوم الكتب', 'books', 180.00, '2026-09-25', 2),
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G10:exam'), 'G10', 'رسوم الامتحان', 'exam', 120.00, '2026-09-25', 3),
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G12:tuition'), 'G12', 'رسوم القسط المدرسي', 'tuition', 1000.00, '2026-09-30', 1),
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G12:books'), 'G12', 'رسوم الكتب', 'books', 200.00, '2026-09-30', 2),
  (pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G12:exam'), 'G12', 'رسوم الامتحان النهائي', 'exam', 150.00, '2026-09-30', 3);

create temporary table temp_demo_discount_types (
  discount_type_id uuid primary key,
  discount_key text not null,
  name text not null,
  description text,
  value_type public.discount_value_type not null,
  value numeric(12,2) not null
);

insert into temp_demo_discount_types (
  discount_type_id,
  discount_key,
  name,
  description,
  value_type,
  value
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:discount:siblings'), 'siblings', 'خصم الأشقاء', 'خصم محلي للأشقاء المسجلين في المدرسة.', 'percentage', 10.00),
  (pg_temp.seed_uuid('ofuq-syrian-demo:discount:merit'), 'merit', 'منحة تفوق', 'دعم ثابت للطلاب المتفوقين محليًا.', 'fixed_amount', 75.00);

create temporary table temp_demo_student_discounts (
  student_discount_id uuid primary key,
  student_number text not null,
  discount_key text not null,
  starts_on date,
  ends_on date,
  status public.student_discount_status not null,
  notes text
);

insert into temp_demo_student_discounts (
  student_discount_id,
  student_number,
  discount_key,
  starts_on,
  ends_on,
  status,
  notes
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:student-discount:SYR-2026-001'), 'SYR-2026-001', 'siblings', '2026-09-01', '2027-06-30', 'active', 'تطبيق خصم الأشقاء على فاتورة الطالب يوسف.'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:student-discount:SYR-2026-019'), 'SYR-2026-019', 'merit', '2026-09-01', '2027-01-31', 'active', 'منحة تفوق للفصل الأول.');

create temporary table temp_demo_invoices (
  invoice_id uuid primary key,
  invoice_number text not null,
  student_number text not null,
  issue_date date not null,
  due_date date,
  subtotal_amount numeric(12,2) not null,
  discount_amount numeric(12,2) not null,
  total_amount numeric(12,2) not null,
  paid_amount numeric(12,2) not null,
  balance_amount numeric(12,2) not null,
  status public.invoice_status not null,
  notes text,
  issued_at timestamptz,
  created_by_email text not null,
  issued_by_email text
);

insert into temp_demo_invoices (
  invoice_id,
  invoice_number,
  student_number,
  issue_date,
  due_date,
  subtotal_amount,
  discount_amount,
  total_amount,
  paid_amount,
  balance_amount,
  status,
  notes,
  issued_at,
  created_by_email,
  issued_by_email
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0001'),
    'INV-2026-0001',
    'SYR-2026-001',
    '2026-09-05',
    '2026-09-20',
    800.00,
    80.00,
    720.00,
    0.00,
    720.00,
    'issued',
    'فاتورة صادرة مع خصم أشقاء ولم تُسدّد بعد.',
    '2026-09-05 09:15:00+03',
    'accountant@ofuq.local',
    'accountant@ofuq.local'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0002'),
    'INV-2026-0002',
    'SYR-2026-019',
    '2026-09-08',
    '2026-09-25',
    1200.00,
    75.00,
    1125.00,
    500.00,
    625.00,
    'partially_paid',
    'فاتورة مسددة جزئيًا مع منحة تفوق.',
    '2026-09-08 10:00:00+03',
    'accountant@ofuq.local',
    'accountant@ofuq.local'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0003'),
    'INV-2026-0003',
    'SYR-2026-023',
    '2026-09-10',
    '2026-09-30',
    1350.00,
    0.00,
    1350.00,
    1350.00,
    0.00,
    'paid',
    'فاتورة مسددة بالكامل للصف الثالث الثانوي.',
    '2026-09-10 11:00:00+03',
    'accountant@ofuq.local',
    'accountant@ofuq.local'
  );

create temporary table temp_demo_invoice_items (
  invoice_item_id uuid primary key,
  invoice_number text not null,
  fee_item_id uuid,
  description text not null,
  quantity numeric(10,2) not null,
  unit_amount numeric(12,2) not null,
  discount_amount numeric(12,2) not null,
  total_amount numeric(12,2) not null,
  sort_order integer not null
);

insert into temp_demo_invoice_items (
  invoice_item_id,
  invoice_number,
  fee_item_id,
  description,
  quantity,
  unit_amount,
  discount_amount,
  total_amount,
  sort_order
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0001:1'), 'INV-2026-0001', pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G01:tuition'), 'رسوم القسط المدرسي', 1, 600.00, 60.00, 540.00, 1),
  (pg_temp.seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0001:2'), 'INV-2026-0001', pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G01:books'), 'رسوم الكتب', 1, 120.00, 12.00, 108.00, 2),
  (pg_temp.seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0001:3'), 'INV-2026-0001', pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G01:activity'), 'رسوم النشاط', 1, 80.00, 8.00, 72.00, 3),
  (pg_temp.seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0002:1'), 'INV-2026-0002', pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G10:tuition'), 'رسوم القسط المدرسي', 1, 900.00, 75.00, 825.00, 1),
  (pg_temp.seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0002:2'), 'INV-2026-0002', pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G10:books'), 'رسوم الكتب', 1, 180.00, 0.00, 180.00, 2),
  (pg_temp.seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0002:3'), 'INV-2026-0002', pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G10:exam'), 'رسوم الامتحان', 1, 120.00, 0.00, 120.00, 3),
  (pg_temp.seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0003:1'), 'INV-2026-0003', pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G12:tuition'), 'رسوم القسط المدرسي', 1, 1000.00, 0.00, 1000.00, 1),
  (pg_temp.seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0003:2'), 'INV-2026-0003', pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G12:books'), 'رسوم الكتب', 1, 200.00, 0.00, 200.00, 2),
  (pg_temp.seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0003:3'), 'INV-2026-0003', pg_temp.seed_uuid('ofuq-syrian-demo:fee-item:G12:exam'), 'رسوم الامتحان النهائي', 1, 150.00, 0.00, 150.00, 3);

create temporary table temp_demo_payments (
  payment_id uuid primary key,
  invoice_number text not null,
  student_number text not null,
  amount numeric(12,2) not null,
  payment_method public.payment_method not null,
  payment_status public.payment_status not null,
  paid_at timestamptz not null,
  reference_number text,
  receipt_number text not null,
  received_by_email text not null,
  notes text
);

insert into temp_demo_payments (
  payment_id,
  invoice_number,
  student_number,
  amount,
  payment_method,
  payment_status,
  paid_at,
  reference_number,
  receipt_number,
  received_by_email,
  notes
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:payment:REC-2026-0001'),
    'INV-2026-0002',
    'SYR-2026-019',
    500.00,
    'bank_transfer',
    'completed',
    '2026-09-15 12:00:00+03',
    'TRX-OFQ-5001',
    'REC-2026-0001',
    'accountant@ofuq.local',
    'دفعة جزئية محولة إلى الحساب المحلي.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:payment:REC-2026-0002'),
    'INV-2026-0003',
    'SYR-2026-023',
    1350.00,
    'cash',
    'completed',
    '2026-09-12 11:30:00+03',
    'CASH-OFQ-0002',
    'REC-2026-0002',
    'accountant@ofuq.local',
    'تسديد كامل نقدًا عند شباك المالية.'
  );

create temporary table temp_demo_messages (
  message_id uuid primary key,
  message_key text not null,
  sender_email text not null,
  subject text not null,
  body text not null,
  related_student_number text,
  status public.communication_message_status not null,
  sent_at timestamptz not null
);

insert into temp_demo_messages (
  message_id,
  message_key,
  sender_email,
  subject,
  body,
  related_student_number,
  status,
  sent_at
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:message:school-to-teachers'),
    'school-to-teachers',
    'school.admin@ofuq.local',
    'رسالة من الإدارة إلى المعلمين',
    'يرجى اعتماد الخطة الأسبوعية قبل نهاية دوام الخميس ومراجعة بيانات الحضور يوميًا.',
    null,
    'sent',
    '2026-09-01 07:35:00+03'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:message:math-to-parent-hassan'),
    'math-to-parent-hassan',
    'teacher.math@ofuq.local',
    'متابعة مستوى يوسف في الرياضيات',
    'تحسن أداء يوسف في الواجبات الأخيرة ونوصي بمتابعة المراجعة المنزلية مرتين أسبوعيًا.',
    'SYR-2026-001',
    'sent',
    '2026-10-01 17:45:00+03'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:message:librarian-to-admin'),
    'librarian-to-admin',
    'librarian@ofuq.local',
    'تحديث عهدة الكتب المتأخرة',
    'تم رصد إعارة متأخرة في قسم الفيزياء وتحتاج إلى متابعة مع الطالب المعني.',
    'SYR-2026-021',
    'sent',
    '2026-10-03 09:20:00+03'
  );

create temporary table temp_demo_message_recipients (
  recipient_row_id uuid primary key,
  message_key text not null,
  recipient_email text not null,
  read_at timestamptz,
  archived_at timestamptz
);

insert into temp_demo_message_recipients (
  recipient_row_id,
  message_key,
  recipient_email,
  read_at,
  archived_at
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.arabic@ofuq.local'), 'school-to-teachers', 'teacher.arabic@ofuq.local', '2026-09-01 08:10:00+03', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.math@ofuq.local'), 'school-to-teachers', 'teacher.math@ofuq.local', '2026-09-01 08:12:00+03', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.science@ofuq.local'), 'school-to-teachers', 'teacher.science@ofuq.local', null, null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.english@ofuq.local'), 'school-to-teachers', 'teacher.english@ofuq.local', null, null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.physics@ofuq.local'), 'school-to-teachers', 'teacher.physics@ofuq.local', null, null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.social@ofuq.local'), 'school-to-teachers', 'teacher.social@ofuq.local', null, null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:message-recipient:math-to-parent-hassan:parent.hassan@ofuq.local'), 'math-to-parent-hassan', 'parent.hassan@ofuq.local', '2026-10-01 18:10:00+03', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:message-recipient:librarian-to-admin:school.admin@ofuq.local'), 'librarian-to-admin', 'school.admin@ofuq.local', '2026-10-03 09:35:00+03', null);

create temporary table temp_demo_announcements (
  announcement_id uuid primary key,
  title text not null,
  body text not null,
  target_type public.announcement_target_type not null,
  target_role public.user_role,
  grade_code text,
  class_key text,
  status public.announcement_status not null,
  published_at timestamptz,
  expires_at timestamptz,
  created_by_email text not null
);

insert into temp_demo_announcements (
  announcement_id,
  title,
  body,
  target_type,
  target_role,
  grade_code,
  class_key,
  status,
  published_at,
  expires_at,
  created_by_email
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:announcement:term-start'),
    'إعلان بداية الفصل',
    'تبدأ الحصص الرسمية يوم الأحد 1 أيلول مع الالتزام الكامل بالزي المدرسي والبرنامج الصباحي.',
    'school',
    null,
    null,
    null,
    'published',
    '2026-09-01 06:00:00+03',
    '2026-09-15 18:00:00+03',
    'school.admin@ofuq.local'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:announcement:teacher-meeting'),
    'اجتماع المعلمين الأسبوعي',
    'يرجى حضور الاجتماع الأسبوعي يوم الأربعاء بعد انتهاء الدوام لمراجعة مؤشرات الحضور والإنجاز.',
    'role',
    'teacher',
    null,
    null,
    'published',
    '2026-09-02 12:00:00+03',
    '2026-09-09 15:00:00+03',
    'school.admin@ofuq.local'
  );

create temporary table temp_demo_notification_logs (
  notification_id uuid primary key,
  recipient_email text,
  actor_email text,
  notification_type text not null,
  title text not null,
  body text,
  status public.notification_status not null,
  related_entity_type text,
  related_entity_key text,
  read_at timestamptz
);

insert into temp_demo_notification_logs (
  notification_id,
  recipient_email,
  actor_email,
  notification_type,
  title,
  body,
  status,
  related_entity_type,
  related_entity_key,
  read_at
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:notification:announcement-teacher-arabic'),
    'teacher.arabic@ofuq.local',
    'school.admin@ofuq.local',
    'communication.announcement.published',
    'تم نشر إعلان بداية الفصل',
    'يتضمن الإعلان مواعيد الانطلاق والالتزام بالبرنامج الصباحي.',
    'read',
    'announcement',
    'term-start',
    '2026-09-01 08:05:00+03'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:notification:message-teacher-math'),
    'teacher.math@ofuq.local',
    'school.admin@ofuq.local',
    'communication.message.received',
    'رسالة جديدة من الإدارة',
    'يرجى مراجعة الرسالة الخاصة بالخطة الأسبوعية.',
    'created',
    'message',
    'school-to-teachers',
    null
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:notification:message-parent-hassan'),
    'parent.hassan@ofuq.local',
    'teacher.math@ofuq.local',
    'communication.message.received',
    'رسالة تخص يوسف الأحمد',
    'توجد متابعة جديدة حول مستوى يوسف في الرياضيات.',
    'read',
    'message',
    'math-to-parent-hassan',
    '2026-10-01 18:12:00+03'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:notification:finance-invoice-youssef'),
    'accountant@ofuq.local',
    'school.admin@ofuq.local',
    'finance.invoice.issued',
    'تم إصدار فاتورة جديدة',
    'صدرت فاتورة الطالب يوسف الأحمد للفصل الحالي.',
    'created',
    'invoice',
    'INV-2026-0001',
    null
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:notification:library-overdue-eiad'),
    'librarian@ofuq.local',
    'school.admin@ofuq.local',
    'library.loan.overdue',
    'إعارة متأخرة تحتاج متابعة',
    'إعارة كتاب الفيزياء للطالب إياد مراد تجاوزت تاريخ الاستحقاق.',
    'created',
    'book_loan',
    'physics-overdue',
    null
  );

create temporary table temp_demo_school_events (
  event_id uuid primary key,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  target_type public.school_event_target_type not null,
  grade_code text,
  class_key text,
  status public.school_event_status not null,
  created_by_email text not null
);

insert into temp_demo_school_events (
  event_id,
  title,
  description,
  starts_at,
  ends_at,
  location,
  target_type,
  grade_code,
  class_key,
  status,
  created_by_email
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:event:parent-meeting'),
    'اجتماع أولياء الأمور',
    'لقاء تعارفي مع أولياء الأمور لمراجعة خطط الفصل ومتطلبات الانضباط.',
    '2026-10-15 10:00:00+03',
    '2026-10-15 12:00:00+03',
    'القاعة الكبرى',
    'school',
    null,
    null,
    'scheduled',
    'school.admin@ofuq.local'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:event:science-fair'),
    'معرض العلوم المدرسي',
    'فعالية لعرض مشاريع الصفوف الثانوية في العلوم والفيزياء.',
    '2026-11-20 09:00:00+03',
    '2026-11-20 13:00:00+03',
    'مختبر العلوم',
    'grade_level',
    'G10',
    null,
    'scheduled',
    'school.admin@ofuq.local'
  );

create temporary table temp_demo_book_catalog (
  catalog_id uuid primary key,
  catalog_key text not null,
  isbn text,
  title text not null,
  author text,
  publisher text,
  publication_year integer,
  category text,
  language text,
  description text
);

insert into temp_demo_book_catalog (
  catalog_id,
  catalog_key,
  isbn,
  title,
  author,
  publisher,
  publication_year,
  category,
  language,
  description
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:book:arabic-9'),
    'arabic-9',
    '9789999999001',
    'كتاب اللغة العربية - الصف التاسع',
    'لجنة المناهج المحلية',
    'دار أفق التعليمية',
    2024,
    'لغة عربية',
    'ar',
    'نسخة محلية للاطلاع داخل المكتبة.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:book:math-10'),
    'math-10',
    '9789999999002',
    'كتاب الرياضيات - الأول الثانوي',
    'قسم الرياضيات',
    'دار أفق التعليمية',
    2024,
    'رياضيات',
    'ar',
    'مرجع صفي للمرحلة الثانوية الأولى.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:book:physics-11'),
    'physics-11',
    '9789999999003',
    'كتاب الفيزياء - الثاني الثانوي',
    'قسم العلوم',
    'دار أفق التعليمية',
    2024,
    'فيزياء',
    'ar',
    'مرجع مخبري مع أمثلة تطبيقية.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:book:science-6'),
    'science-6',
    '9789999999004',
    'كتاب العلوم العامة - الصف السادس',
    'لجنة العلوم',
    'دار أفق التعليمية',
    2024,
    'علوم',
    'ar',
    'كتاب داعم للأنشطة الصفية.'
  );

create temporary table temp_demo_book_copies (
  copy_id uuid primary key,
  copy_key text not null,
  catalog_key text not null,
  barcode text,
  accession_number text,
  shelf_location text,
  condition public.book_copy_condition not null,
  status public.book_copy_status not null,
  notes text
);

insert into temp_demo_book_copies (
  copy_id,
  copy_key,
  catalog_key,
  barcode,
  accession_number,
  shelf_location,
  condition,
  status,
  notes
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:copy:arabic-9-1'), 'arabic-9-1', 'arabic-9', 'BC-AR9-001', 'ACC-AR9-001', 'A-01', 'good', 'available', 'نسخة مرجعية متاحة للإعارة.'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:copy:arabic-9-2'), 'arabic-9-2', 'arabic-9', 'BC-AR9-002', 'ACC-AR9-002', 'A-01', 'good', 'loaned', 'نسخة معارة حالياً.'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:copy:math-10-1'), 'math-10-1', 'math-10', 'BC-M10-001', 'ACC-M10-001', 'A-02', 'new', 'available', 'نسخة أُعيدت حديثاً.'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:copy:physics-11-1'), 'physics-11-1', 'physics-11', 'BC-P11-001', 'ACC-P11-001', 'B-01', 'good', 'loaned', 'نسخة على ذمة إعارة متأخرة.'),
  (pg_temp.seed_uuid('ofuq-syrian-demo:copy:science-6-1'), 'science-6-1', 'science-6', 'BC-S6-001', 'ACC-S6-001', 'C-01', 'fair', 'available', 'نسخة متاحة للاستخدام داخل الصف.');

create temporary table temp_demo_book_loans (
  loan_id uuid primary key,
  loan_key text not null,
  copy_key text not null,
  catalog_key text not null,
  student_number text not null,
  issued_by_email text not null,
  returned_by_email text,
  borrowed_at timestamptz not null,
  due_at timestamptz not null,
  returned_at timestamptz,
  status public.book_loan_status not null,
  notes text,
  return_notes text
);

insert into temp_demo_book_loans (
  loan_id,
  loan_key,
  copy_key,
  catalog_key,
  student_number,
  issued_by_email,
  returned_by_email,
  borrowed_at,
  due_at,
  returned_at,
  status,
  notes,
  return_notes
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:loan:arabic-active'),
    'arabic-active',
    'arabic-9-2',
    'arabic-9',
    'SYR-2026-017',
    'librarian@ofuq.local',
    null,
    '2026-09-20 09:00:00+03',
    '2026-10-20 09:00:00+03',
    null,
    'active',
    'إعارة نشطة لطالب الصف التاسع.',
    null
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:loan:math-returned'),
    'math-returned',
    'math-10-1',
    'math-10',
    'SYR-2026-019',
    'librarian@ofuq.local',
    'librarian@ofuq.local',
    '2026-09-05 10:00:00+03',
    '2026-09-19 10:00:00+03',
    '2026-09-17 11:30:00+03',
    'returned',
    'إعارة مغلقة بعد الإعادة المبكرة.',
    'أعيدت النسخة بحالة جيدة.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:loan:physics-overdue'),
    'physics-overdue',
    'physics-11-1',
    'physics-11',
    'SYR-2026-021',
    'librarian@ofuq.local',
    null,
    '2026-08-25 08:30:00+03',
    '2026-09-10 08:30:00+03',
    null,
    'active',
    'إعارة فعالة تجاوزت تاريخ الاستحقاق.',
    null
  );

create temporary table temp_demo_health_records (
  health_record_id uuid primary key,
  student_number text not null,
  blood_type text,
  allergies text,
  chronic_conditions text,
  medications text,
  emergency_notes text,
  doctor_name text,
  doctor_phone text,
  status public.health_record_status not null,
  created_by_email text not null,
  updated_by_email text not null
);

insert into temp_demo_health_records (
  health_record_id,
  student_number,
  blood_type,
  allergies,
  chronic_conditions,
  medications,
  emergency_notes,
  doctor_name,
  doctor_phone,
  status,
  created_by_email,
  updated_by_email
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:health:SYR-2026-001'),
    'SYR-2026-001',
    'O+',
    'حساسية موسمية خفيفة',
    null,
    null,
    'يراعى التواصل مع ولي الأمر عند ارتفاع الحرارة.',
    'د. سمر ناصر',
    '+963944300001',
    'active',
    'school.admin@ofuq.local',
    'school.admin@ofuq.local'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:health:SYR-2026-003'),
    'SYR-2026-003',
    'A+',
    null,
    null,
    null,
    'ملاحظات إسعافية مدرسية عامة فقط.',
    'د. ليان شحود',
    '+963944300002',
    'active',
    'school.admin@ofuq.local',
    'school.admin@ofuq.local'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:health:SYR-2026-013'),
    'SYR-2026-013',
    'B+',
    'تنبيه غذائي بسيط',
    null,
    null,
    'تتم المتابعة المدرسية عند الحاجة فقط.',
    'د. أحمد حمدان',
    '+963944300003',
    'active',
    'school.admin@ofuq.local',
    'school.admin@ofuq.local'
  );

create temporary table temp_demo_vaccinations (
  vaccination_id uuid primary key,
  student_number text not null,
  vaccine_name text not null,
  dose_label text,
  vaccinated_on date,
  next_due_on date,
  status public.vaccination_status not null,
  notes text,
  recorded_by_email text not null
);

insert into temp_demo_vaccinations (
  vaccination_id,
  student_number,
  vaccine_name,
  dose_label,
  vaccinated_on,
  next_due_on,
  status,
  notes,
  recorded_by_email
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:vaccination:SYR-2026-001:triple'),
    'SYR-2026-001',
    'اللقاح الثلاثي',
    'الجرعة المعززة',
    '2026-09-02',
    null,
    'completed',
    'مكتمل ضمن الملف المدرسي المحلي.',
    'school.admin@ofuq.local'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:vaccination:SYR-2026-003:measles'),
    'SYR-2026-003',
    'لقاح الحصبة',
    'جرعة أساسية',
    '2026-09-03',
    null,
    'completed',
    'سجل محلي معتمد.',
    'school.admin@ofuq.local'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:vaccination:SYR-2026-013:tetanus'),
    'SYR-2026-013',
    'لقاح الكزاز',
    'متابعة دورية',
    null,
    '2026-12-01',
    'scheduled',
    'موعد متابعة مدرسي لاحق.',
    'school.admin@ofuq.local'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:vaccination:SYR-2026-023:polio'),
    'SYR-2026-023',
    'لقاح شلل الأطفال',
    'سجل مكتمل',
    '2026-09-04',
    null,
    'completed',
    'بيان مكتمل للطالب يزن.',
    'school.admin@ofuq.local'
  );

create temporary table temp_demo_clinic_visits (
  clinic_visit_id uuid primary key,
  student_number text not null,
  visited_at timestamptz not null,
  reason text not null,
  symptoms text,
  action_taken text,
  returned_to_class boolean not null,
  guardian_contacted boolean not null,
  referred_to_external_care boolean not null,
  handled_by_email text not null,
  status public.clinic_visit_status not null,
  notes text,
  closed_at timestamptz
);

insert into temp_demo_clinic_visits (
  clinic_visit_id,
  student_number,
  visited_at,
  reason,
  symptoms,
  action_taken,
  returned_to_class,
  guardian_contacted,
  referred_to_external_care,
  handled_by_email,
  status,
  notes,
  closed_at
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:clinic:SYR-2026-001'),
    'SYR-2026-001',
    '2026-10-10 09:30:00+03',
    'صداع خفيف',
    'إرهاق صباحي',
    'استراحة قصيرة وشرب الماء',
    true,
    false,
    false,
    'school.admin@ofuq.local',
    'closed',
    'تحسنت الحالة وعاد الطالب إلى الحصة.',
    '2026-10-10 10:00:00+03'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:clinic:SYR-2026-013'),
    'SYR-2026-013',
    '2026-11-12 11:00:00+03',
    'دوار بعد النشاط الرياضي',
    'تعب خفيف بعد التمرين',
    'متابعة أولية والتواصل مع ولي الأمر',
    false,
    true,
    true,
    'school.admin@ofuq.local',
    'referred',
    'أحيلت الحالة لمراجعة خارجية احترازية.',
    '2026-11-12 11:20:00+03'
  );

create temporary table temp_demo_discipline_records (
  discipline_record_id uuid primary key,
  student_number text not null,
  incident_date date not null,
  incident_type public.discipline_incident_type not null,
  severity public.discipline_severity not null,
  title text not null,
  description text not null,
  action_taken text,
  status public.discipline_status not null,
  reported_by_email text not null,
  reviewed_by_email text,
  reviewed_at timestamptz
);

insert into temp_demo_discipline_records (
  discipline_record_id,
  student_number,
  incident_date,
  incident_type,
  severity,
  title,
  description,
  action_taken,
  status,
  reported_by_email,
  reviewed_by_email,
  reviewed_at
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:discipline:SYR-2026-009'),
    'SYR-2026-009',
    '2026-10-20',
    'attendance',
    'low',
    'تأخر متكرر عن الطابور الصباحي',
    'سُجل تأخر الطالب أكثر من مرة خلال الأسبوع نفسه.',
    'تنبيه خطي ومتابعة أسبوعية مع المرشد.',
    'reviewed',
    'teacher.social@ofuq.local',
    'school.admin@ofuq.local',
    '2026-10-22 08:30:00+03'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:discipline:SYR-2026-017'),
    'SYR-2026-017',
    '2026-11-03',
    'behavior',
    'medium',
    'مقاطعة الحصة دون استئذان',
    'احتاج المعلم إلى تسجيل ملاحظة سلوكية بعد تكرار المقاطعة داخل الصف.',
    'جلسة إرشاد صفية أولية.',
    'submitted',
    'teacher.arabic@ofuq.local',
    null,
    null
  );

create temporary table temp_demo_achievements (
  achievement_id uuid primary key,
  student_number text not null,
  achievement_date date not null,
  title text not null,
  description text,
  category public.achievement_category not null,
  level public.achievement_level not null,
  awarded_by_email text,
  status public.achievement_status not null,
  created_by_email text not null,
  published_at timestamptz
);

insert into temp_demo_achievements (
  achievement_id,
  student_number,
  achievement_date,
  title,
  description,
  category,
  level,
  awarded_by_email,
  status,
  created_by_email,
  published_at
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:achievement:SYR-2026-001'),
    'SYR-2026-001',
    '2026-11-25',
    'تفوق في اختبار الرياضيات',
    'حقق الطالب أعلى نتيجة في اختبار الرياضيات القصير ضمن الصف الأول.',
    'academic',
    'class',
    'teacher.math@ofuq.local',
    'published',
    'teacher.math@ofuq.local',
    '2026-11-25 12:30:00+03'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:achievement:SYR-2026-003'),
    'SYR-2026-003',
    '2026-11-28',
    'مشاركة مميزة في النشاط الفني',
    'مساهمة فنية بارزة في لوحة الفصل.',
    'arts',
    'school',
    'teacher.english@ofuq.local',
    'draft',
    'teacher.english@ofuq.local',
    null
  );

create temporary table temp_demo_complaints (
  complaint_id uuid primary key,
  complaint_key text not null,
  submitted_by_email text not null,
  student_number text,
  assigned_to_email text,
  category public.complaint_category not null,
  priority public.complaint_priority not null,
  title text not null,
  description text not null,
  status public.complaint_status not null,
  submitted_at timestamptz not null,
  resolved_at timestamptz,
  resolved_by_email text,
  resolution_summary text
);

insert into temp_demo_complaints (
  complaint_id,
  complaint_key,
  submitted_by_email,
  student_number,
  assigned_to_email,
  category,
  priority,
  title,
  description,
  status,
  submitted_at,
  resolved_at,
  resolved_by_email,
  resolution_summary
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:complaint:attendance-followup'),
    'attendance-followup',
    'teacher.arabic@ofuq.local',
    'SYR-2026-001',
    'school.admin@ofuq.local',
    'academic',
    'medium',
    'تأخر متابعة غياب الطالب يوسف الأحمد',
    'تم تسجيل ملاحظات غياب متقاربة وتحتاج المتابعة مع ولي الأمر بسرعة.',
    'resolved',
    '2026-10-08 11:00:00+03',
    '2026-10-09 14:00:00+03',
    'school.admin@ofuq.local',
    'تم التواصل مع ولي الأمر وتحديث سجل المتابعة والإشعار الداخلي.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:complaint:lab-maintenance'),
    'lab-maintenance',
    'teacher.physics@ofuq.local',
    null,
    'school.admin@ofuq.local',
    'facility',
    'high',
    'حاجة مختبر الفيزياء إلى صيانة عاجلة',
    'توجد أعطال في بعض التجهيزات الأساسية المستخدمة داخل الحصص العملية.',
    'in_review',
    '2026-10-12 09:15:00+03',
    null,
    null,
    null
  );

create temporary table temp_demo_complaint_updates (
  complaint_update_id uuid primary key,
  complaint_key text not null,
  author_email text not null,
  update_type public.complaint_update_type not null,
  body text not null,
  old_status public.complaint_status,
  new_status public.complaint_status
);

insert into temp_demo_complaint_updates (
  complaint_update_id,
  complaint_key,
  author_email,
  update_type,
  body,
  old_status,
  new_status
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:complaint-update:attendance-followup:comment'),
    'attendance-followup',
    'teacher.arabic@ofuq.local',
    'comment',
    'تم رصد الغياب خلال الأسبوع الحالي وإرفاق ملاحظة للمتابعة.',
    null,
    null
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:complaint-update:attendance-followup:assignment'),
    'attendance-followup',
    'school.admin@ofuq.local',
    'assignment',
    'تمت إحالة الشكوى إلى إدارة المدرسة للمراجعة.',
    null,
    null
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:complaint-update:attendance-followup:review'),
    'attendance-followup',
    'school.admin@ofuq.local',
    'status_change',
    'بدأت المراجعة الإدارية للشكوى.',
    'submitted',
    'in_review'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:complaint-update:attendance-followup:resolution'),
    'attendance-followup',
    'school.admin@ofuq.local',
    'resolution',
    'أغلقت الشكوى بعد التواصل مع ولي الأمر وتحديث الإجراءات.',
    'in_review',
    'resolved'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:complaint-update:lab-maintenance:comment'),
    'lab-maintenance',
    'teacher.physics@ofuq.local',
    'comment',
    'العطل الحالي يؤثر في حصص العملي للصف الأول الثانوي.',
    null,
    null
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:complaint-update:lab-maintenance:review'),
    'lab-maintenance',
    'school.admin@ofuq.local',
    'status_change',
    'تم فتح طلب متابعة مع فريق الصيانة الداخلي.',
    'submitted',
    'in_review'
  );

create temporary table temp_demo_surveys (
  survey_id uuid primary key,
  survey_key text not null,
  title text not null,
  description text,
  target_type public.survey_target_type not null,
  target_role public.user_role,
  grade_code text,
  class_key text,
  status public.survey_status not null,
  opens_at timestamptz,
  closes_at timestamptz,
  created_by_email text not null,
  published_at timestamptz,
  closed_at timestamptz
);

insert into temp_demo_surveys (
  survey_id,
  survey_key,
  title,
  description,
  target_type,
  target_role,
  grade_code,
  class_key,
  status,
  opens_at,
  closes_at,
  created_by_email,
  published_at,
  closed_at
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:survey:teacher-readiness-2026'),
    'teacher-readiness-2026',
    'استبيان جاهزية المعلمين للفصل الأول',
    'استبيان داخلي قصير لقياس أولويات الدعم وجاهزية الخطة الأسبوعية.',
    'role',
    'teacher',
    null,
    null,
    'published',
    '2026-09-05 08:00:00+03',
    '2026-12-31 23:59:00+03',
    'school.admin@ofuq.local',
    '2026-09-05 07:00:00+03',
    null
  );

create temporary table temp_demo_survey_questions (
  question_id uuid primary key,
  survey_key text not null,
  question_key text not null,
  question_text text not null,
  question_type public.survey_question_type not null,
  options jsonb,
  is_required boolean not null,
  sort_order integer not null
);

insert into temp_demo_survey_questions (
  question_id,
  survey_key,
  question_key,
  question_text,
  question_type,
  options,
  is_required,
  sort_order
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:survey-question:teacher-readiness-2026:q1'),
    'teacher-readiness-2026',
    'q1',
    'ما أبرز أولوية تطويرية لهذا الفصل؟',
    'short_text',
    null,
    true,
    1
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:survey-question:teacher-readiness-2026:q2'),
    'teacher-readiness-2026',
    'q2',
    'كيف تقيم جاهزية الخطة الأسبوعية؟',
    'single_choice',
    '["ممتاز","جيد","يحتاج إلى تحسين"]'::jsonb,
    true,
    2
  );

create temporary table temp_demo_survey_responses (
  survey_response_id uuid primary key,
  survey_key text not null,
  respondent_email text not null,
  student_number text,
  answer_q1 text not null,
  answer_q2 text not null,
  submitted_at timestamptz not null
);

insert into temp_demo_survey_responses (
  survey_response_id,
  survey_key,
  respondent_email,
  student_number,
  answer_q1,
  answer_q2,
  submitted_at
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:survey-response:teacher-readiness-2026:teacher.arabic'),
    'teacher-readiness-2026',
    'teacher.arabic@ofuq.local',
    null,
    'الحاجة الأكبر هي تنسيق خطط التقويم القصير بين المواد.',
    'جيد',
    '2026-09-10 10:00:00+03'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:survey-response:teacher-readiness-2026:teacher.math'),
    'teacher-readiness-2026',
    'teacher.math@ofuq.local',
    null,
    'أولوية هذا الفصل هي رفع التزام الواجبات المنزلية في الصفوف الأولى.',
    'ممتاز',
    '2026-09-10 10:10:00+03'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:survey-response:teacher-readiness-2026:teacher.science'),
    'teacher-readiness-2026',
    'teacher.science@ofuq.local',
    null,
    'تحتاج الأنشطة العملية إلى تجهيزات صفية إضافية بشكل مبكر.',
    'يحتاج إلى تحسين',
    '2026-09-10 10:20:00+03'
  );

create temporary table temp_demo_attendance_sessions (
  attendance_session_id uuid primary key,
  session_key text not null,
  class_key text not null,
  taken_by_email text not null,
  session_date date not null,
  starts_at time,
  ends_at time,
  method public.attendance_session_method not null,
  status public.attendance_session_status not null,
  notes text
);

insert into temp_demo_attendance_sessions (
  attendance_session_id,
  session_key,
  class_key,
  taken_by_email,
  session_date,
  starts_at,
  ends_at,
  method,
  status,
  notes
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:attendance-session:g01a-2026-10-05'),
    'g01a-2026-10-05',
    'G01:A',
    'teacher.arabic@ofuq.local',
    '2026-10-05',
    '08:00',
    '08:20',
    'manual',
    'closed',
    'جلسة حضور الصف الأول.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:attendance-session:g05a-2026-10-06'),
    'g05a-2026-10-06',
    'G05:A',
    'teacher.social@ofuq.local',
    '2026-10-06',
    '09:00',
    '09:20',
    'qr',
    'closed',
    'جلسة حضور مختلطة مع تحقق QR.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:attendance-session:g06a-2026-10-07'),
    'g06a-2026-10-07',
    'G06:A',
    'teacher.science@ofuq.local',
    '2026-10-07',
    '10:00',
    '10:20',
    'manual',
    'closed',
    'جلسة حضور صفية اعتيادية.'
  );

create temporary table temp_demo_attendance_records (
  attendance_record_id uuid primary key,
  session_key text not null,
  student_number text not null,
  status public.attendance_status not null,
  method public.attendance_record_method not null,
  recorded_by_email text,
  recorded_at timestamptz not null,
  notes text
);

insert into temp_demo_attendance_records (
  attendance_record_id,
  session_key,
  student_number,
  status,
  method,
  recorded_by_email,
  recorded_at,
  notes
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:attendance-record:g01a-2026-10-05:youssef'),
    'g01a-2026-10-05',
    'SYR-2026-001',
    'present',
    'manual',
    'teacher.arabic@ofuq.local',
    '2026-10-05 08:02:00+03',
    null
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:attendance-record:g01a-2026-10-05:masa'),
    'g01a-2026-10-05',
    'SYR-2026-002',
    'late',
    'manual',
    'teacher.arabic@ofuq.local',
    '2026-10-05 08:07:00+03',
    'وصلت الطالبة بعد بدء الحصة الأولى.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:attendance-record:g05a-2026-10-06:malek'),
    'g05a-2026-10-06',
    'SYR-2026-009',
    'absent',
    'manual',
    'teacher.social@ofuq.local',
    '2026-10-06 09:05:00+03',
    'غاب الطالب دون إشعار مسبق.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:attendance-record:g05a-2026-10-06:janna'),
    'g05a-2026-10-06',
    'SYR-2026-010',
    'excused',
    'system',
    'teacher.social@ofuq.local',
    '2026-10-06 09:10:00+03',
    'اعتُمد العذر بعد المراجعة.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:attendance-record:g06a-2026-10-07:lian'),
    'g06a-2026-10-07',
    'SYR-2026-011',
    'present',
    'manual',
    'teacher.science@ofuq.local',
    '2026-10-07 10:03:00+03',
    null
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:attendance-record:g06a-2026-10-07:anas'),
    'g06a-2026-10-07',
    'SYR-2026-012',
    'absent',
    'manual',
    'teacher.science@ofuq.local',
    '2026-10-07 10:05:00+03',
    'بانتظار العذر.'
  );

create temporary table temp_demo_absence_excuses (
  absence_excuse_id uuid primary key,
  attendance_record_id uuid not null,
  student_number text not null,
  submitted_by_email text,
  reviewed_by_email text,
  status public.absence_excuse_status not null,
  reason text not null,
  review_notes text,
  submitted_at timestamptz not null,
  reviewed_at timestamptz
);

insert into temp_demo_absence_excuses (
  absence_excuse_id,
  attendance_record_id,
  student_number,
  submitted_by_email,
  reviewed_by_email,
  status,
  reason,
  review_notes,
  submitted_at,
  reviewed_at
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:absence-excuse:janna'),
    pg_temp.seed_uuid('ofuq-syrian-demo:attendance-record:g05a-2026-10-06:janna'),
    'SYR-2026-010',
    'school.admin@ofuq.local',
    'school.admin@ofuq.local',
    'approved',
    'مراجعة طبية مدرسية موثقة محليًا.',
    'تم اعتماد العذر وتحديث السجل إلى معذور.',
    '2026-10-06 12:30:00+03',
    '2026-10-06 13:00:00+03'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:absence-excuse:anas'),
    pg_temp.seed_uuid('ofuq-syrian-demo:attendance-record:g06a-2026-10-07:anas'),
    'SYR-2026-012',
    'school.admin@ofuq.local',
    null,
    'pending',
    'ظرف عائلي طارئ في يوم الغياب.',
    null,
    '2026-10-07 14:00:00+03',
    null
  );

create temporary table temp_demo_exams (
  exam_id uuid primary key,
  exam_key text not null,
  class_key text not null,
  grade_code text not null,
  subject_code text not null,
  title text not null,
  exam_date date,
  max_score numeric(6,2) not null,
  weight numeric(5,2),
  status public.exam_status not null,
  created_by_email text not null,
  notes text
);

insert into temp_demo_exams (
  exam_id,
  exam_key,
  class_key,
  grade_code,
  subject_code,
  title,
  exam_date,
  max_score,
  weight,
  status,
  created_by_email,
  notes
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:exam:math-quiz-g01'),
    'math-quiz-g01',
    'G01:A',
    'G01',
    'MATH',
    'اختبار رياضيات قصير',
    '2026-11-10',
    100.00,
    20.00,
    'published',
    'teacher.math@ofuq.local',
    'اختبار قصير لقياس أساسيات العد.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:exam:arabic-review-g01'),
    'arabic-review-g01',
    'G01:A',
    'G01',
    'ARABIC',
    'مذاكرة لغة عربية',
    '2026-11-12',
    100.00,
    20.00,
    'published',
    'teacher.arabic@ofuq.local',
    'مراجعة القراءة والإملاء.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:exam:science-test-g01'),
    'science-test-g01',
    'G01:A',
    'G01',
    'SCIENCE',
    'اختبار علوم',
    '2026-11-14',
    100.00,
    20.00,
    'published',
    'teacher.science@ofuq.local',
    'تقويم في موضوعات البيئة المحيطة.'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:exam:english-test-g01'),
    'english-test-g01',
    'G01:A',
    'G01',
    'ENGLISH',
    'اختبار لغة إنجليزية',
    '2026-11-16',
    100.00,
    20.00,
    'published',
    'teacher.english@ofuq.local',
    'مفردات وتمييز الحروف.'
  );

create temporary table temp_demo_exam_results (
  exam_result_id uuid primary key,
  exam_key text not null,
  student_number text not null,
  score numeric(6,2),
  status public.exam_result_status not null,
  entered_by_email text,
  entered_at timestamptz not null,
  published_at timestamptz,
  notes text
);

insert into temp_demo_exam_results (
  exam_result_id,
  exam_key,
  student_number,
  score,
  status,
  entered_by_email,
  entered_at,
  published_at,
  notes
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:exam-result:math-quiz-g01:youssef'), 'math-quiz-g01', 'SYR-2026-001', 95.00, 'published', 'teacher.math@ofuq.local', '2026-11-10 11:00:00+03', '2026-11-11 09:00:00+03', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:exam-result:math-quiz-g01:masa'), 'math-quiz-g01', 'SYR-2026-002', 76.00, 'published', 'teacher.math@ofuq.local', '2026-11-10 11:05:00+03', '2026-11-11 09:00:00+03', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:exam-result:arabic-review-g01:youssef'), 'arabic-review-g01', 'SYR-2026-001', 87.00, 'published', 'teacher.arabic@ofuq.local', '2026-11-12 11:00:00+03', '2026-11-13 09:00:00+03', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:exam-result:arabic-review-g01:masa'), 'arabic-review-g01', 'SYR-2026-002', 82.00, 'published', 'teacher.arabic@ofuq.local', '2026-11-12 11:05:00+03', '2026-11-13 09:00:00+03', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:exam-result:science-test-g01:youssef'), 'science-test-g01', 'SYR-2026-001', 91.00, 'published', 'teacher.science@ofuq.local', '2026-11-14 11:00:00+03', '2026-11-15 09:00:00+03', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:exam-result:science-test-g01:masa'), 'science-test-g01', 'SYR-2026-002', 62.00, 'published', 'teacher.science@ofuq.local', '2026-11-14 11:05:00+03', '2026-11-15 09:00:00+03', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:exam-result:english-test-g01:youssef'), 'english-test-g01', 'SYR-2026-001', 88.00, 'published', 'teacher.english@ofuq.local', '2026-11-16 11:00:00+03', '2026-11-17 09:00:00+03', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:exam-result:english-test-g01:masa'), 'english-test-g01', 'SYR-2026-002', 79.00, 'published', 'teacher.english@ofuq.local', '2026-11-16 11:05:00+03', '2026-11-17 09:00:00+03', null);

create temporary table temp_demo_grade_entries (
  grade_entry_id uuid primary key,
  class_key text not null,
  subject_code text not null,
  student_number text not null,
  category public.grade_entry_category not null,
  title text not null,
  score numeric(6,2) not null,
  max_score numeric(6,2) not null,
  weight numeric(5,2),
  status public.grade_entry_status not null,
  recorded_on date not null,
  entered_by_email text,
  notes text
);

insert into temp_demo_grade_entries (
  grade_entry_id,
  class_key,
  subject_code,
  student_number,
  category,
  title,
  score,
  max_score,
  weight,
  status,
  recorded_on,
  entered_by_email,
  notes
)
values
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade-entry:youssef-math-homework'), 'G01:A', 'MATH', 'SYR-2026-001', 'homework', 'واجب الرياضيات الأول', 18.00, 20.00, 10.00, 'published', '2026-11-18', 'teacher.math@ofuq.local', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade-entry:masa-math-homework'), 'G01:A', 'MATH', 'SYR-2026-002', 'homework', 'واجب الرياضيات الأول', 15.00, 20.00, 10.00, 'published', '2026-11-18', 'teacher.math@ofuq.local', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade-entry:youssef-arabic-participation'), 'G01:A', 'ARABIC', 'SYR-2026-001', 'participation', 'مشاركة صفية', 9.00, 10.00, 5.00, 'published', '2026-11-19', 'teacher.arabic@ofuq.local', null),
  (pg_temp.seed_uuid('ofuq-syrian-demo:grade-entry:masa-science-project'), 'G01:A', 'SCIENCE', 'SYR-2026-002', 'project', 'نشاط العلوم المصغر', 16.00, 20.00, 10.00, 'published', '2026-11-19', 'teacher.science@ofuq.local', null);

create temporary table temp_demo_report_cards (
  report_card_id uuid primary key,
  class_key text not null,
  student_number text not null,
  teacher_remarks text,
  admin_notes text,
  generated_by_email text not null,
  status public.report_card_status not null,
  generated_at timestamptz not null,
  published_at timestamptz
);

insert into temp_demo_report_cards (
  report_card_id,
  class_key,
  student_number,
  teacher_remarks,
  admin_notes,
  generated_by_email,
  status,
  generated_at,
  published_at
)
values
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:report-card:SYR-2026-001'),
    'G01:A',
    'SYR-2026-001',
    'أداء ثابت ومشاركة إيجابية داخل الصف.',
    'استمرارية ممتازة في المتابعة المنزلية.',
    'school.admin@ofuq.local',
    'published',
    '2026-12-20 10:00:00+03',
    '2026-12-20 12:00:00+03'
  ),
  (
    pg_temp.seed_uuid('ofuq-syrian-demo:report-card:SYR-2026-002'),
    'G01:A',
    'SYR-2026-002',
    'تحتاج الطالبة إلى مراجعة إضافية في العلوم والرياضيات.',
    'يوصى بخطة دعم قصيرة خلال الفصل الثاني.',
    'school.admin@ofuq.local',
    'published',
    '2026-12-20 10:15:00+03',
    '2026-12-20 12:10:00+03'
  );

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
from temp_demo_context ctx
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
from temp_demo_context ctx
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
  crypt('OfuqLocal123!', gen_salt('bf')),
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
from temp_demo_users demo_users
cross join temp_demo_context ctx
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
from temp_demo_users demo_users
cross join temp_demo_context ctx
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
from temp_demo_users demo_users
cross join temp_demo_context ctx
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
from temp_demo_users demo_users
cross join temp_demo_context ctx
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
from temp_demo_context ctx
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
from temp_demo_context ctx
cross join (
  values
    (
      (select term_1_id from temp_demo_context),
      'الفصل الأول',
      'T1',
      1,
      '2026-09-01'::date,
      '2027-01-15'::date
    ),
    (
      (select term_2_id from temp_demo_context),
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
from temp_demo_grade_levels grade_levels
cross join temp_demo_context ctx
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
from temp_demo_classes classes
join temp_demo_grade_levels grade_levels
  on grade_levels.code = classes.grade_code
join temp_demo_users homeroom_teachers
  on homeroom_teachers.email = classes.homeroom_email
cross join temp_demo_context ctx
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
from temp_demo_subjects subjects
cross join temp_demo_context ctx
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
from temp_demo_grade_subjects grade_subjects
join temp_demo_grade_levels grade_levels
  on grade_levels.code = grade_subjects.grade_code
join temp_demo_subjects subjects
  on subjects.code = grade_subjects.subject_code
cross join temp_demo_context ctx
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
from temp_demo_admissions admissions
left join temp_demo_users submitted_by
  on submitted_by.email = admissions.submitted_by_email
left join temp_demo_users reviewed_by
  on reviewed_by.email = admissions.reviewed_by_email
cross join temp_demo_context ctx
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
from temp_demo_students students
left join temp_demo_admissions admissions
  on admissions.admission_key = students.admission_key
cross join temp_demo_context ctx
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  school_id = excluded.school_id,
  admission_id = excluded.admission_id,
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
  pg_temp.seed_uuid(
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
from temp_demo_students students
join temp_demo_guardians guardians
  on guardians.guardian_key = students.guardian_key
left join temp_demo_users guardian_users
  on guardian_users.email = guardians.guardian_user_email
cross join temp_demo_context ctx
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
from temp_demo_context ctx
join (
  values
    (
      pg_temp.seed_uuid('ofuq-syrian-demo:document:youssef-birth-certificate'),
      (select student_id from temp_demo_students where student_number = 'SYR-2026-001'),
      null::uuid,
      'school.admin@ofuq.local'::text,
      'birth_certificate'::public.student_document_type,
      'youssef-birth-certificate.pdf'::text,
      'student-documents/ofuq-syrian-demo/SYR-2026-001/youssef-birth-certificate.pdf'::text,
      'application/pdf'::text,
      245760::bigint
    ),
    (
      pg_temp.seed_uuid('ofuq-syrian-demo:document:lana-photo'),
      (select student_id from temp_demo_students where student_number = 'SYR-2026-003'),
      null::uuid,
      'school.admin@ofuq.local'::text,
      'photo'::public.student_document_type,
      'lana-profile-photo.jpg'::text,
      'student-documents/ofuq-syrian-demo/SYR-2026-003/lana-profile-photo.jpg'::text,
      'image/jpeg'::text,
      187432::bigint
    ),
    (
      pg_temp.seed_uuid('ofuq-syrian-demo:document:pending-salma-request'),
      null::uuid,
      (select admission_id from temp_demo_admissions where admission_key = 'pending-salma'),
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
left join temp_demo_users uploaders
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
  pg_temp.seed_uuid(
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
from temp_demo_students students
join temp_demo_grade_levels grade_levels
  on grade_levels.code = students.grade_code
join temp_demo_classes classes
  on classes.grade_code = students.grade_code
 and classes.section = students.section
join temp_demo_users creators
  on creators.email = 'school.admin@ofuq.local'
cross join temp_demo_context ctx
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
  pg_temp.seed_uuid(
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
from temp_demo_students students
join temp_demo_users changers
  on changers.email = 'school.admin@ofuq.local'
cross join temp_demo_context ctx
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
from temp_demo_attendance_sessions attendance_sessions
join temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = attendance_sessions.class_key
join temp_demo_users teachers
  on teachers.email = attendance_sessions.taken_by_email
cross join temp_demo_context ctx
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
from temp_demo_attendance_records attendance_records
join temp_demo_attendance_sessions attendance_sessions
  on attendance_sessions.session_key = attendance_records.session_key
join temp_demo_students students
  on students.student_number = attendance_records.student_number
join temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = attendance_sessions.class_key
join public.class_enrollments class_enrollments
  on class_enrollments.student_id = students.student_id
 and class_enrollments.class_id = classes.class_id
 and class_enrollments.academic_year_id = (select academic_year_id from temp_demo_context)
 and class_enrollments.status = 'active'
left join temp_demo_users recorders
  on recorders.email = attendance_records.recorded_by_email
cross join temp_demo_context ctx
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
from temp_demo_absence_excuses excuses
join temp_demo_students students
  on students.student_number = excuses.student_number
left join temp_demo_users submitters
  on submitters.email = excuses.submitted_by_email
left join temp_demo_users reviewers
  on reviewers.email = excuses.reviewed_by_email
cross join temp_demo_context ctx
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
from temp_demo_exams exams
join temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = exams.class_key
join temp_demo_grade_levels grade_levels
  on grade_levels.code = exams.grade_code
join temp_demo_subjects subjects
  on subjects.code = exams.subject_code
join temp_demo_users creators
  on creators.email = exams.created_by_email
cross join temp_demo_context ctx
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
from temp_demo_exam_results exam_results
join temp_demo_exams exams
  on exams.exam_key = exam_results.exam_key
join temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = exams.class_key
join temp_demo_subjects subjects
  on subjects.code = exams.subject_code
join temp_demo_students students
  on students.student_number = exam_results.student_number
join public.class_enrollments class_enrollments
  on class_enrollments.student_id = students.student_id
 and class_enrollments.class_id = classes.class_id
 and class_enrollments.academic_year_id = (select academic_year_id from temp_demo_context)
 and class_enrollments.status = 'active'
left join temp_demo_users enterers
  on enterers.email = exam_results.entered_by_email
cross join temp_demo_context ctx
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
from temp_demo_grade_entries grade_entries
join temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = grade_entries.class_key
join temp_demo_subjects subjects
  on subjects.code = grade_entries.subject_code
join temp_demo_students students
  on students.student_number = grade_entries.student_number
join public.class_enrollments class_enrollments
  on class_enrollments.student_id = students.student_id
 and class_enrollments.class_id = classes.class_id
 and class_enrollments.academic_year_id = (select academic_year_id from temp_demo_context)
 and class_enrollments.status = 'active'
left join temp_demo_users enterers
  on enterers.email = grade_entries.entered_by_email
cross join temp_demo_context ctx
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
from temp_demo_report_cards report_cards
join temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = report_cards.class_key
join temp_demo_students students
  on students.student_number = report_cards.student_number
join public.class_enrollments class_enrollments
  on class_enrollments.student_id = students.student_id
 and class_enrollments.class_id = classes.class_id
 and class_enrollments.academic_year_id = (select academic_year_id from temp_demo_context)
 and class_enrollments.status = 'active'
join temp_demo_users generators
  on generators.email = report_cards.generated_by_email
cross join temp_demo_context ctx
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
    join temp_demo_subjects subjects
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
    join temp_demo_subjects subjects
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
from temp_demo_rooms rooms
cross join temp_demo_context ctx
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
from temp_demo_timetable_assignments assignments
join temp_demo_users teachers
  on teachers.email = assignments.teacher_email
join temp_demo_subjects subjects
  on subjects.code = assignments.subject_code
join temp_demo_grade_levels grade_levels
  on grade_levels.code = assignments.grade_code
join temp_demo_users creators
  on creators.email = assignments.created_by_email
cross join temp_demo_context ctx
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
from temp_demo_timetable_slots timetable_slots
join temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = timetable_slots.class_key
join temp_demo_grade_levels grade_levels
  on grade_levels.code = timetable_slots.grade_code
join temp_demo_subjects subjects
  on subjects.code = timetable_slots.subject_code
join temp_demo_users teachers
  on teachers.email = timetable_slots.teacher_email
join temp_demo_rooms rooms
  on rooms.room_key = timetable_slots.room_key
join temp_demo_users creators
  on creators.email = 'school.admin@ofuq.local'
cross join temp_demo_context ctx
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
from temp_demo_fee_structures fee_structures
join temp_demo_grade_levels grade_levels
  on grade_levels.code = fee_structures.grade_code
join temp_demo_users creators
  on creators.email = 'accountant@ofuq.local'
cross join temp_demo_context ctx
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
from temp_demo_fee_items fee_items
join temp_demo_fee_structures fee_structures
  on fee_structures.fee_structure_key = fee_items.fee_structure_key
cross join temp_demo_context ctx
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
from temp_demo_discount_types discount_types
join temp_demo_users creators
  on creators.email = 'accountant@ofuq.local'
cross join temp_demo_context ctx
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
from temp_demo_student_discounts student_discounts
join temp_demo_students students
  on students.student_number = student_discounts.student_number
join temp_demo_discount_types discount_types
  on discount_types.discount_key = student_discounts.discount_key
join temp_demo_users creators
  on creators.email = 'accountant@ofuq.local'
cross join temp_demo_context ctx
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
from temp_demo_invoices invoices
join temp_demo_students students
  on students.student_number = invoices.student_number
join public.class_enrollments class_enrollments
  on class_enrollments.student_id = students.student_id
 and class_enrollments.academic_year_id = (select academic_year_id from temp_demo_context)
 and class_enrollments.status = 'active'
join temp_demo_users creators
  on creators.email = invoices.created_by_email
left join temp_demo_users issuers
  on issuers.email = invoices.issued_by_email
cross join temp_demo_context ctx
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
from temp_demo_invoice_items invoice_items
join temp_demo_invoices invoices
  on invoices.invoice_number = invoice_items.invoice_number
cross join temp_demo_context ctx
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
from temp_demo_payments payments
join temp_demo_invoices invoices
  on invoices.invoice_number = payments.invoice_number
join temp_demo_students students
  on students.student_number = payments.student_number
join temp_demo_users receivers
  on receivers.email = payments.received_by_email
cross join temp_demo_context ctx
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
from temp_demo_messages messages
join temp_demo_users senders
  on senders.email = messages.sender_email
left join temp_demo_students students
  on students.student_number = messages.related_student_number
cross join temp_demo_context ctx
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
from temp_demo_message_recipients recipients
join temp_demo_messages messages
  on messages.message_key = recipients.message_key
join temp_demo_users recipient_users
  on recipient_users.email = recipients.recipient_email
cross join temp_demo_context ctx
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
from temp_demo_announcements announcements
left join temp_demo_grade_levels grade_levels
  on grade_levels.code = announcements.grade_code
left join temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = announcements.class_key
join temp_demo_users creators
  on creators.email = announcements.created_by_email
cross join temp_demo_context ctx
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
      when 'term-start' then pg_temp.seed_uuid('ofuq-syrian-demo:announcement:term-start')
      when 'teacher-meeting' then pg_temp.seed_uuid('ofuq-syrian-demo:announcement:teacher-meeting')
      else null
    end
    when notifications.related_entity_type = 'message' then case notifications.related_entity_key
      when 'school-to-teachers' then pg_temp.seed_uuid('ofuq-syrian-demo:message:school-to-teachers')
      when 'math-to-parent-hassan' then pg_temp.seed_uuid('ofuq-syrian-demo:message:math-to-parent-hassan')
      when 'librarian-to-admin' then pg_temp.seed_uuid('ofuq-syrian-demo:message:librarian-to-admin')
      else null
    end
    when notifications.related_entity_type = 'invoice' then case notifications.related_entity_key
      when 'INV-2026-0001' then pg_temp.seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0001')
      when 'INV-2026-0002' then pg_temp.seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0002')
      when 'INV-2026-0003' then pg_temp.seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0003')
      else null
    end
    when notifications.related_entity_type = 'book_loan' then case notifications.related_entity_key
      when 'arabic-active' then pg_temp.seed_uuid('ofuq-syrian-demo:loan:arabic-active')
      when 'math-returned' then pg_temp.seed_uuid('ofuq-syrian-demo:loan:math-returned')
      when 'physics-overdue' then pg_temp.seed_uuid('ofuq-syrian-demo:loan:physics-overdue')
      else null
    end
    else null
  end,
  notifications.read_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from temp_demo_notification_logs notifications
left join temp_demo_users recipients
  on recipients.email = notifications.recipient_email
left join temp_demo_users actors
  on actors.email = notifications.actor_email
cross join temp_demo_context ctx
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
from temp_demo_school_events school_events
left join temp_demo_grade_levels grade_levels
  on grade_levels.code = school_events.grade_code
left join temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = school_events.class_key
join temp_demo_users creators
  on creators.email = school_events.created_by_email
cross join temp_demo_context ctx
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
from temp_demo_book_catalog book_catalog
join temp_demo_users creators
  on creators.email = 'librarian@ofuq.local'
cross join temp_demo_context ctx
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
from temp_demo_book_copies book_copies
join temp_demo_book_catalog book_catalog
  on book_catalog.catalog_key = book_copies.catalog_key
join temp_demo_users creators
  on creators.email = 'librarian@ofuq.local'
cross join temp_demo_context ctx
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
from temp_demo_book_loans book_loans
join temp_demo_book_copies book_copies
  on book_copies.copy_key = book_loans.copy_key
join temp_demo_book_catalog book_catalog
  on book_catalog.catalog_key = book_loans.catalog_key
join temp_demo_students students
  on students.student_number = book_loans.student_number
join temp_demo_users issuers
  on issuers.email = book_loans.issued_by_email
left join temp_demo_users returners
  on returners.email = book_loans.returned_by_email
cross join temp_demo_context ctx
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
from temp_demo_health_records health_records
join temp_demo_students students
  on students.student_number = health_records.student_number
join temp_demo_users creators
  on creators.email = health_records.created_by_email
join temp_demo_users updaters
  on updaters.email = health_records.updated_by_email
cross join temp_demo_context ctx
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
from temp_demo_vaccinations vaccinations
join temp_demo_students students
  on students.student_number = vaccinations.student_number
join temp_demo_users recorders
  on recorders.email = vaccinations.recorded_by_email
cross join temp_demo_context ctx
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
from temp_demo_clinic_visits clinic_visits
join temp_demo_students students
  on students.student_number = clinic_visits.student_number
join temp_demo_users handlers
  on handlers.email = clinic_visits.handled_by_email
cross join temp_demo_context ctx
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
from temp_demo_discipline_records discipline_records
join temp_demo_students students
  on students.student_number = discipline_records.student_number
join temp_demo_users reporters
  on reporters.email = discipline_records.reported_by_email
left join temp_demo_users reviewers
  on reviewers.email = discipline_records.reviewed_by_email
cross join temp_demo_context ctx
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
from temp_demo_achievements achievements
join temp_demo_students students
  on students.student_number = achievements.student_number
left join temp_demo_users awarders
  on awarders.email = achievements.awarded_by_email
join temp_demo_users creators
  on creators.email = achievements.created_by_email
cross join temp_demo_context ctx
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
from temp_demo_complaints complaints
join temp_demo_users submitters
  on submitters.email = complaints.submitted_by_email
left join temp_demo_students students
  on students.student_number = complaints.student_number
left join temp_demo_users assignees
  on assignees.email = complaints.assigned_to_email
left join temp_demo_users resolvers
  on resolvers.email = complaints.resolved_by_email
cross join temp_demo_context ctx
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
from temp_demo_complaint_updates complaint_updates
join temp_demo_complaints complaints
  on complaints.complaint_key = complaint_updates.complaint_key
join temp_demo_users authors
  on authors.email = complaint_updates.author_email
cross join temp_demo_context ctx
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
from temp_demo_surveys surveys
left join temp_demo_grade_levels grade_levels
  on grade_levels.code = surveys.grade_code
left join temp_demo_classes classes
  on classes.grade_code || ':' || classes.section = surveys.class_key
join temp_demo_users creators
  on creators.email = surveys.created_by_email
cross join temp_demo_context ctx
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
from temp_demo_survey_questions survey_questions
join temp_demo_surveys surveys
  on surveys.survey_key = survey_questions.survey_key
cross join temp_demo_context ctx
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
    pg_temp.seed_uuid('ofuq-syrian-demo:survey-question:teacher-readiness-2026:q1')::text,
    survey_responses.answer_q1,
    pg_temp.seed_uuid('ofuq-syrian-demo:survey-question:teacher-readiness-2026:q2')::text,
    survey_responses.answer_q2
  ),
  survey_responses.submitted_at,
  ctx.seed_created_at,
  ctx.seed_updated_at
from temp_demo_survey_responses survey_responses
join temp_demo_surveys surveys
  on surveys.survey_key = survey_responses.survey_key
join temp_demo_users respondents
  on respondents.email = survey_responses.respondent_email
left join temp_demo_students students
  on students.student_number = survey_responses.student_number
cross join temp_demo_context ctx
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

-- 13 Summary

select
  'local syrian demo seed applied' as message,
  (select count(*) from temp_demo_users) as demo_auth_users,
  (select count(*) from public.user_profiles up join temp_demo_users du on du.user_id = up.id) as demo_user_profiles,
  (select count(*) from public.user_memberships where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as demo_memberships,
  (select count(*) from public.grade_levels where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as grade_levels,
  (select count(*) from public.classes where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as classes,
  (select count(*) from public.subjects where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as subjects,
  (select count(*) from public.grade_level_subjects where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as grade_level_subjects,
  (select count(*) from public.students where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as students,
  (select count(*) from public.student_guardians where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as guardians,
  (select count(*) from public.class_enrollments where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as class_enrollments,
  (select count(*) from public.attendance_sessions where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as attendance_sessions,
  (select count(*) from public.attendance_records where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as attendance_records,
  (select count(*) from public.exams where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as exams,
  (select count(*) from public.exam_results where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as exam_results,
  (select count(*) from public.report_cards where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as report_cards,
  (select count(*) from public.timetable_slots where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as timetable_slots,
  (select count(*) from public.invoices where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as invoices,
  (select count(*) from public.payments where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as payments,
  (select count(*) from public.messages where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as messages,
  (select count(*) from public.book_loans where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as book_loans,
  (select count(*) from public.health_records where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as health_records,
  (select count(*) from public.complaints where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as complaints,
  (select count(*) from public.surveys where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as surveys,
  (select count(*) from public.survey_responses where tenant_id = (select tenant_id from temp_demo_context) and school_id = (select school_id from temp_demo_context)) as survey_responses;
