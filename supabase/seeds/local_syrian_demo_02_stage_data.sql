set search_path = public, auth, extensions;

-- 01 Demo constants

insert into public.temp_demo_context
select
  public.demo_seed_uuid('ofuq-syrian-demo:tenant') as tenant_id,
  public.demo_seed_uuid('ofuq-syrian-demo:school') as school_id,
  public.demo_seed_uuid('ofuq-syrian-demo:year:2026-2027') as academic_year_id,
  public.demo_seed_uuid('ofuq-syrian-demo:term:T1') as term_1_id,
  public.demo_seed_uuid('ofuq-syrian-demo:term:T2') as term_2_id,
  '2026-08-15 08:00:00+03'::timestamptz as seed_created_at,
  '2026-08-15 08:00:00+03'::timestamptz as seed_updated_at;



insert into public.temp_demo_users (
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
    public.demo_seed_uuid('ofuq-syrian-demo:user:system.admin@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:system.admin@ofuq.local:system_admin'),
    'system_admin',
    'سامر الخطيب',
    'مشرف النظام',
    '+963944100001'
  ),
  (
    'school.admin@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:school.admin@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:school.admin@ofuq.local:school_admin'),
    'school_admin',
    'نور الهدى الحلبي',
    'مديرة المدرسة',
    '+963944100002'
  ),
  (
    'teacher.arabic@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:teacher.arabic@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:teacher.arabic@ofuq.local:teacher'),
    'teacher',
    'محمود العلي',
    'معلم اللغة العربية',
    '+963944100101'
  ),
  (
    'teacher.math@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:teacher.math@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:teacher.math@ofuq.local:teacher'),
    'teacher',
    'رنا الشامي',
    'معلمة الرياضيات',
    '+963944100102'
  ),
  (
    'teacher.science@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:teacher.science@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:teacher.science@ofuq.local:teacher'),
    'teacher',
    'حسن دياب',
    'معلم العلوم',
    '+963944100103'
  ),
  (
    'teacher.english@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:teacher.english@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:teacher.english@ofuq.local:teacher'),
    'teacher',
    'شام الرفاعي',
    'معلمة الإنجليزية',
    '+963944100104'
  ),
  (
    'teacher.physics@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:teacher.physics@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:teacher.physics@ofuq.local:teacher'),
    'teacher',
    'كريم العلي',
    'معلم الفيزياء',
    '+963944100105'
  ),
  (
    'teacher.social@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:teacher.social@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:teacher.social@ofuq.local:teacher'),
    'teacher',
    'سارة الدروبي',
    'معلمة الاجتماعيات',
    '+963944100106'
  ),
  (
    'accountant@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:accountant@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:accountant@ofuq.local:accountant'),
    'accountant',
    'مالك الشامي',
    'المحاسب',
    '+963944100201'
  ),
  (
    'librarian@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:librarian@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:librarian@ofuq.local:librarian'),
    'librarian',
    'جنى الحلبي',
    'أمينة المكتبة',
    '+963944100202'
  ),
  (
    'parent.hassan@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:parent.hassan@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:parent.hassan@ofuq.local:parent'),
    'parent',
    'حسن الأحمد',
    'ولي أمر',
    '+963944100301'
  ),
  (
    'parent.rana@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:parent.rana@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:parent.rana@ofuq.local:parent'),
    'parent',
    'رنا منصور',
    'ولية أمر',
    '+963944100302'
  ),
  (
    'student.youssef@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:student.youssef@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:student.youssef@ofuq.local:student'),
    'student',
    'يوسف الأحمد',
    'الطالب يوسف',
    '+963944100401'
  ),
  (
    'student.lana@ofuq.local',
    public.demo_seed_uuid('ofuq-syrian-demo:user:student.lana@ofuq.local'),
    public.demo_seed_uuid('ofuq-syrian-demo:membership:student.lana@ofuq.local:student'),
    'student',
    'لانا منصور',
    'الطالبة لانا',
    '+963944100402'
  );



insert into public.temp_demo_grade_levels (
  grade_level_id,
  code,
  name,
  grade_order,
  stage
)
values
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G01'), 'G01', 'الصف الأول', 1, 'primary'),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G02'), 'G02', 'الصف الثاني', 2, 'primary'),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G03'), 'G03', 'الصف الثالث', 3, 'primary'),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G04'), 'G04', 'الصف الرابع', 4, 'primary'),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G05'), 'G05', 'الصف الخامس', 5, 'primary'),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G06'), 'G06', 'الصف السادس', 6, 'primary'),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G07'), 'G07', 'الصف السابع', 7, 'middle'),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G08'), 'G08', 'الصف الثامن', 8, 'middle'),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G09'), 'G09', 'الصف التاسع', 9, 'middle'),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G10'), 'G10', 'الأول الثانوي', 10, 'secondary'),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G11'), 'G11', 'الثاني الثانوي', 11, 'secondary'),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade:G12'), 'G12', 'الثالث الثانوي', 12, 'secondary');



insert into public.temp_demo_classes (
  class_id,
  grade_code,
  section,
  name,
  capacity,
  homeroom_email,
  room_name
)
values
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G01:A'), 'G01', 'A', 'الصف الأول / أ', 28, 'teacher.arabic@ofuq.local', 'القاعة 101'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G02:A'), 'G02', 'A', 'الصف الثاني / أ', 28, 'teacher.math@ofuq.local', 'القاعة 102'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G03:A'), 'G03', 'A', 'الصف الثالث / أ', 28, 'teacher.science@ofuq.local', 'القاعة 103'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G04:A'), 'G04', 'A', 'الصف الرابع / أ', 28, 'teacher.english@ofuq.local', 'القاعة 104'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G05:A'), 'G05', 'A', 'الصف الخامس / أ', 28, 'teacher.social@ofuq.local', 'القاعة 105'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G06:A'), 'G06', 'A', 'الصف السادس / أ', 28, 'teacher.arabic@ofuq.local', 'القاعة 106'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G07:A'), 'G07', 'A', 'الصف السابع / أ', 30, 'teacher.math@ofuq.local', 'القاعة 201'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G07:B'), 'G07', 'B', 'الصف السابع / ب', 30, 'teacher.english@ofuq.local', 'القاعة 202'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G08:A'), 'G08', 'A', 'الصف الثامن / أ', 30, 'teacher.science@ofuq.local', 'القاعة 203'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G08:B'), 'G08', 'B', 'الصف الثامن / ب', 30, 'teacher.social@ofuq.local', 'القاعة 204'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G09:A'), 'G09', 'A', 'الصف التاسع / أ', 30, 'teacher.arabic@ofuq.local', 'القاعة 205'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G09:B'), 'G09', 'B', 'الصف التاسع / ب', 30, 'teacher.math@ofuq.local', 'القاعة 206'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G10:A'), 'G10', 'A', 'الأول الثانوي / أ', 32, 'teacher.physics@ofuq.local', 'القاعة 301'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G10:B'), 'G10', 'B', 'الأول الثانوي / ب', 32, 'teacher.english@ofuq.local', 'القاعة 302'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G11:A'), 'G11', 'A', 'الثاني الثانوي / أ', 32, 'teacher.physics@ofuq.local', 'القاعة 303'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G11:B'), 'G11', 'B', 'الثاني الثانوي / ب', 32, 'teacher.social@ofuq.local', 'القاعة 304'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G12:A'), 'G12', 'A', 'الثالث الثانوي / أ', 32, 'teacher.physics@ofuq.local', 'القاعة 305'),
  (public.demo_seed_uuid('ofuq-syrian-demo:class:G12:B'), 'G12', 'B', 'الثالث الثانوي / ب', 32, 'teacher.math@ofuq.local', 'القاعة 306');



insert into public.temp_demo_subjects (
  subject_id,
  code,
  name,
  description,
  subject_type
)
values
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:ARABIC'), 'ARABIC', 'اللغة العربية', 'محتوى عربي أساسي ضمن المنهاج السوري المحلي.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:MATH'), 'MATH', 'الرياضيات', 'مهارات الحساب والجبر والهندسة بحسب المرحلة.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:SCIENCE'), 'SCIENCE', 'العلوم العامة', 'علوم عامة للمرحلتين الابتدائية والإعدادية.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:SOCIAL'), 'SOCIAL', 'الدراسات الاجتماعية', 'موضوعات اجتماعية مبسطة للصفوف الأولى.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:ENGLISH'), 'ENGLISH', 'اللغة الإنجليزية', 'مهارات اللغة الإنجليزية الأساسية.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:FRENCH'), 'FRENCH', 'اللغة الفرنسية', 'مدخل إلى اللغة الفرنسية.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:NATIONAL'), 'NATIONAL', 'التربية الوطنية', 'التربية الوطنية والمواطنة.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:RELIGION'), 'RELIGION', 'التربية الدينية', 'التربية الدينية العامة.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:ART'), 'ART', 'التربية الفنية', 'أنشطة فنية صفية.', 'activity'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:PE'), 'PE', 'التربية الرياضية', 'نشاط رياضي وحركي.', 'activity'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:PHYSICS'), 'PHYSICS', 'الفيزياء', 'مفاهيم الفيزياء للمرحلة الثانوية.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:CHEMISTRY'), 'CHEMISTRY', 'الكيمياء', 'مفاهيم الكيمياء للمرحلة الثانوية.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:BIOLOGY'), 'BIOLOGY', 'علم الأحياء', 'علم الأحياء للمرحلة الثانوية.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:HISTORY'), 'HISTORY', 'التاريخ', 'أحداث وشخصيات تاريخية مختارة.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:GEOGRAPHY'), 'GEOGRAPHY', 'الجغرافيا', 'خرائط وبيئات جغرافية.', 'core'),
  (public.demo_seed_uuid('ofuq-syrian-demo:subject:PHILOSOPHY'), 'PHILOSOPHY', 'الفلسفة', 'مقدمات في الفلسفة والتفكير النقدي.', 'core');

insert into public.temp_demo_grade_subjects
select
  public.demo_seed_uuid(
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
from public.temp_demo_grade_levels grade
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



insert into public.temp_demo_guardians (
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



insert into public.temp_demo_admissions (
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
    public.demo_seed_uuid('ofuq-syrian-demo:admission:approved-youssef'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:admission:pending-salma'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:admission:rejected-rami'),
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



insert into public.temp_demo_students (
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
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-001'), 'SYR-2026-001', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-001'), 'يوسف', null, 'الأحمد', 'يوسف الأحمد', 'male', '2019-02-14', 'سوري', 'G01', 'A', 'ahmad', 'approved-youssef', '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-002'), 'SYR-2026-002', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-002'), 'ماسة', null, 'الأحمد', 'ماسة الأحمد', 'female', '2019-06-22', 'سوري', 'G01', 'A', 'ahmad', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-003'), 'SYR-2026-003', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-003'), 'لانا', null, 'منصور', 'لانا منصور', 'female', '2018-03-08', 'سوري', 'G02', 'A', 'mansour', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-004'), 'SYR-2026-004', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-004'), 'سليم', null, 'منصور', 'سليم منصور', 'male', '2018-08-19', 'سوري', 'G02', 'A', 'mansour', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-005'), 'SYR-2026-005', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-005'), 'عمر', null, 'الخطيب', 'عمر الخطيب', 'male', '2017-02-11', 'سوري', 'G03', 'A', 'khatib', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-006'), 'SYR-2026-006', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-006'), 'شام', null, 'الخطيب', 'شام الخطيب', 'female', '2017-05-27', 'سوري', 'G03', 'A', 'khatib', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-007'), 'SYR-2026-007', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-007'), 'كريم', null, 'العلي', 'كريم العلي', 'male', '2016-01-16', 'سوري', 'G04', 'A', 'ali', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-008'), 'SYR-2026-008', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-008'), 'سارة', null, 'العلي', 'سارة العلي', 'female', '2016-04-29', 'سوري', 'G04', 'A', 'ali', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-009'), 'SYR-2026-009', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-009'), 'مالك', null, 'الشامي', 'مالك الشامي', 'male', '2015-02-09', 'سوري', 'G05', 'A', 'shami', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-010'), 'SYR-2026-010', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-010'), 'جنى', null, 'الشامي', 'جنى الشامي', 'female', '2015-09-14', 'سوري', 'G05', 'A', 'shami', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-011'), 'SYR-2026-011', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-011'), 'ليان', null, 'الحمصي', 'ليان الحمصي', 'female', '2014-01-25', 'سوري', 'G06', 'A', 'homsi', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-012'), 'SYR-2026-012', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-012'), 'أنس', null, 'الحمصي', 'أنس الحمصي', 'male', '2014-06-30', 'سوري', 'G06', 'A', 'homsi', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-013'), 'SYR-2026-013', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-013'), 'آدم', null, 'الحسن', 'آدم الحسن', 'male', '2013-02-20', 'سوري', 'G07', 'A', 'hasan', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-014'), 'SYR-2026-014', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-014'), 'ديما', null, 'الحسن', 'ديما الحسن', 'female', '2013-10-02', 'سوري', 'G07', 'B', 'hasan', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-015'), 'SYR-2026-015', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-015'), 'رامي', null, 'الرفاعي', 'رامي الرفاعي', 'male', '2012-01-05', 'سوري', 'G08', 'A', 'rafai', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-016'), 'SYR-2026-016', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-016'), 'تالا', null, 'الرفاعي', 'تالا الرفاعي', 'female', '2012-07-18', 'سوري', 'G08', 'B', 'rafai', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-017'), 'SYR-2026-017', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-017'), 'باسل', null, 'درويش', 'باسل درويش', 'male', '2011-03-03', 'سوري', 'G09', 'A', 'darwish', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-018'), 'SYR-2026-018', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-018'), 'هبة', null, 'درويش', 'هبة درويش', 'female', '2011-11-09', 'سوري', 'G09', 'B', 'darwish', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-019'), 'SYR-2026-019', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-019'), 'نادر', null, 'الصباغ', 'نادر الصباغ', 'male', '2010-02-12', 'سوري', 'G10', 'A', 'sabbagh', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-020'), 'SYR-2026-020', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-020'), 'مريم', null, 'الصباغ', 'مريم الصباغ', 'female', '2010-09-21', 'سوري', 'G10', 'B', 'sabbagh', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-021'), 'SYR-2026-021', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-021'), 'إياد', null, 'مراد', 'إياد مراد', 'male', '2009-01-29', 'سوري', 'G11', 'A', 'murad', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-022'), 'SYR-2026-022', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-022'), 'زينة', null, 'مراد', 'زينة مراد', 'female', '2009-06-06', 'سوري', 'G11', 'B', 'murad', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-023'), 'SYR-2026-023', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-023'), 'يزن', null, 'دياب', 'يزن دياب', 'male', '2008-02-17', 'سوري', 'G12', 'A', 'diab', null, '2026-09-01'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student:SYR-2026-024'), 'SYR-2026-024', public.demo_seed_uuid('ofuq-syrian-demo:qr:SYR-2026-024'), 'ورد', null, 'دياب', 'ورد دياب', 'female', '2008-08-24', 'سوري', 'G12', 'B', 'diab', null, '2026-09-01');



insert into public.temp_demo_rooms (
  room_id,
  room_key,
  name,
  code,
  capacity,
  location
)
values
  (public.demo_seed_uuid('ofuq-syrian-demo:room:R101'), 'R101', 'قاعة 101', 'R101', 30, 'الطابق الأول'),
  (public.demo_seed_uuid('ofuq-syrian-demo:room:R102'), 'R102', 'قاعة 102', 'R102', 30, 'الطابق الأول'),
  (public.demo_seed_uuid('ofuq-syrian-demo:room:LAB-SCI'), 'LAB-SCI', 'مختبر العلوم', 'LAB-SCI', 24, 'الطابق الثاني'),
  (public.demo_seed_uuid('ofuq-syrian-demo:room:LAB-IT'), 'LAB-IT', 'مختبر الحاسوب', 'LAB-IT', 24, 'الطابق الثاني'),
  (public.demo_seed_uuid('ofuq-syrian-demo:room:LAB-PHY'), 'LAB-PHY', 'قاعة الفيزياء', 'LAB-PHY', 24, 'الطابق الثالث');



insert into public.temp_demo_timetable_assignments (
  assignment_id,
  grade_code,
  subject_code,
  teacher_email,
  created_by_email
)
values
  (public.demo_seed_uuid('ofuq-syrian-demo:assignment:G07:ARABIC'), 'G07', 'ARABIC', 'teacher.arabic@ofuq.local', 'school.admin@ofuq.local'),
  (public.demo_seed_uuid('ofuq-syrian-demo:assignment:G07:MATH'), 'G07', 'MATH', 'teacher.math@ofuq.local', 'school.admin@ofuq.local'),
  (public.demo_seed_uuid('ofuq-syrian-demo:assignment:G07:ENGLISH'), 'G07', 'ENGLISH', 'teacher.english@ofuq.local', 'school.admin@ofuq.local'),
  (public.demo_seed_uuid('ofuq-syrian-demo:assignment:G07:HISTORY'), 'G07', 'HISTORY', 'teacher.social@ofuq.local', 'school.admin@ofuq.local'),
  (public.demo_seed_uuid('ofuq-syrian-demo:assignment:G10:ARABIC'), 'G10', 'ARABIC', 'teacher.arabic@ofuq.local', 'school.admin@ofuq.local'),
  (public.demo_seed_uuid('ofuq-syrian-demo:assignment:G10:MATH'), 'G10', 'MATH', 'teacher.math@ofuq.local', 'school.admin@ofuq.local'),
  (public.demo_seed_uuid('ofuq-syrian-demo:assignment:G10:PHYSICS'), 'G10', 'PHYSICS', 'teacher.physics@ofuq.local', 'school.admin@ofuq.local'),
  (public.demo_seed_uuid('ofuq-syrian-demo:assignment:G10:ENGLISH'), 'G10', 'ENGLISH', 'teacher.english@ofuq.local', 'school.admin@ofuq.local');



insert into public.temp_demo_timetable_slots (
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
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G07A:sunday:0800'), 'G07:A', 'G07', 'ARABIC', 'teacher.arabic@ofuq.local', 'R101', 'sunday', '08:00', '08:45', 'حصة قراءة وتعبير'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G07B:sunday:0900'), 'G07:B', 'G07', 'MATH', 'teacher.math@ofuq.local', 'R102', 'sunday', '09:00', '09:45', 'تدريب على العمليات الأساسية'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G10A:sunday:1000'), 'G10:A', 'G10', 'PHYSICS', 'teacher.physics@ofuq.local', 'LAB-PHY', 'sunday', '10:00', '10:45', 'مفاهيم الحركة'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G10B:sunday:1100'), 'G10:B', 'G10', 'ENGLISH', 'teacher.english@ofuq.local', 'LAB-IT', 'sunday', '11:00', '11:45', 'وحدة القراءة الأولى'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G07A:monday:0800'), 'G07:A', 'G07', 'ENGLISH', 'teacher.english@ofuq.local', 'R101', 'monday', '08:00', '08:45', 'محادثة يومية'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G07B:monday:0900'), 'G07:B', 'G07', 'ARABIC', 'teacher.arabic@ofuq.local', 'R102', 'monday', '09:00', '09:45', 'إملاء وتعبير'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G10A:monday:1000'), 'G10:A', 'G10', 'MATH', 'teacher.math@ofuq.local', 'R101', 'monday', '10:00', '10:45', 'تمارين الجبر'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G10B:monday:1100'), 'G10:B', 'G10', 'PHYSICS', 'teacher.physics@ofuq.local', 'LAB-PHY', 'monday', '11:00', '11:45', 'مراجعة القياس'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G07A:tuesday:0800'), 'G07:A', 'G07', 'HISTORY', 'teacher.social@ofuq.local', 'R101', 'tuesday', '08:00', '08:45', 'أحداث تاريخية مختارة'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G07B:tuesday:0900'), 'G07:B', 'G07', 'ENGLISH', 'teacher.english@ofuq.local', 'R102', 'tuesday', '09:00', '09:45', 'مفردات أساسية'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G10A:tuesday:1000'), 'G10:A', 'G10', 'ARABIC', 'teacher.arabic@ofuq.local', 'R101', 'tuesday', '10:00', '10:45', 'بلاغة ونصوص'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G10B:tuesday:1100'), 'G10:B', 'G10', 'MATH', 'teacher.math@ofuq.local', 'R102', 'tuesday', '11:00', '11:45', 'حل مسائل'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G07A:wednesday:0800'), 'G07:A', 'G07', 'MATH', 'teacher.math@ofuq.local', 'R101', 'wednesday', '08:00', '08:45', 'مراجعة الوحدة'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G07B:wednesday:0900'), 'G07:B', 'G07', 'HISTORY', 'teacher.social@ofuq.local', 'R102', 'wednesday', '09:00', '09:45', 'تاريخ محلي'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G10A:wednesday:1000'), 'G10:A', 'G10', 'ENGLISH', 'teacher.english@ofuq.local', 'LAB-IT', 'wednesday', '10:00', '10:45', 'نشاط استماع'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G10B:wednesday:1100'), 'G10:B', 'G10', 'ARABIC', 'teacher.arabic@ofuq.local', 'R101', 'wednesday', '11:00', '11:45', 'قراءة تحليلية'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G07A:thursday:0800'), 'G07:A', 'G07', 'ARABIC', 'teacher.arabic@ofuq.local', 'R101', 'thursday', '08:00', '08:45', 'تطبيقات لغوية'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G07B:thursday:0900'), 'G07:B', 'G07', 'MATH', 'teacher.math@ofuq.local', 'R102', 'thursday', '09:00', '09:45', 'تقويم أسبوعي'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G10A:thursday:1000'), 'G10:A', 'G10', 'PHYSICS', 'teacher.physics@ofuq.local', 'LAB-PHY', 'thursday', '10:00', '10:45', 'تجربة صفية'),
  (public.demo_seed_uuid('ofuq-syrian-demo:slot:G10B:thursday:1100'), 'G10:B', 'G10', 'ENGLISH', 'teacher.english@ofuq.local', 'LAB-IT', 'thursday', '11:00', '11:45', 'كتابة موجزة');



insert into public.temp_demo_fee_structures (
  fee_structure_id,
  fee_structure_key,
  grade_code,
  name,
  description
)
values
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-structure:G01'), 'G01', 'G01', 'رسوم الصف الأول 2026-2027', 'رسوم أساسية مبسطة للصف الأول.'),
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-structure:G10'), 'G10', 'G10', 'رسوم الأول الثانوي 2026-2027', 'رسوم الصف الأول الثانوي مع بند الامتحانات.'),
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-structure:G12'), 'G12', 'G12', 'رسوم الثالث الثانوي 2026-2027', 'رسوم الصف الثالث الثانوي للمراجعة النهائية.');



insert into public.temp_demo_fee_items (
  fee_item_id,
  fee_structure_key,
  name,
  item_type,
  amount,
  due_date,
  sort_order
)
values
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G01:tuition'), 'G01', 'رسوم القسط المدرسي', 'tuition', 600.00, '2026-09-20', 1),
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G01:books'), 'G01', 'رسوم الكتب', 'books', 120.00, '2026-09-20', 2),
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G01:activity'), 'G01', 'رسوم النشاط', 'activity', 80.00, '2026-09-20', 3),
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G10:tuition'), 'G10', 'رسوم القسط المدرسي', 'tuition', 900.00, '2026-09-25', 1),
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G10:books'), 'G10', 'رسوم الكتب', 'books', 180.00, '2026-09-25', 2),
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G10:exam'), 'G10', 'رسوم الامتحان', 'exam', 120.00, '2026-09-25', 3),
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G12:tuition'), 'G12', 'رسوم القسط المدرسي', 'tuition', 1000.00, '2026-09-30', 1),
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G12:books'), 'G12', 'رسوم الكتب', 'books', 200.00, '2026-09-30', 2),
  (public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G12:exam'), 'G12', 'رسوم الامتحان النهائي', 'exam', 150.00, '2026-09-30', 3);



insert into public.temp_demo_discount_types (
  discount_type_id,
  discount_key,
  name,
  description,
  value_type,
  value
)
values
  (public.demo_seed_uuid('ofuq-syrian-demo:discount:siblings'), 'siblings', 'خصم الأشقاء', 'خصم محلي للأشقاء المسجلين في المدرسة.', 'percentage', 10.00),
  (public.demo_seed_uuid('ofuq-syrian-demo:discount:merit'), 'merit', 'منحة تفوق', 'دعم ثابت للطلاب المتفوقين محليًا.', 'fixed_amount', 75.00);



insert into public.temp_demo_student_discounts (
  student_discount_id,
  student_number,
  discount_key,
  starts_on,
  ends_on,
  status,
  notes
)
values
  (public.demo_seed_uuid('ofuq-syrian-demo:student-discount:SYR-2026-001'), 'SYR-2026-001', 'siblings', '2026-09-01', '2027-06-30', 'active', 'تطبيق خصم الأشقاء على فاتورة الطالب يوسف.'),
  (public.demo_seed_uuid('ofuq-syrian-demo:student-discount:SYR-2026-019'), 'SYR-2026-019', 'merit', '2026-09-01', '2027-01-31', 'active', 'منحة تفوق للفصل الأول.');



insert into public.temp_demo_invoices (
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
    public.demo_seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0001'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0002'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:invoice:INV-2026-0003'),
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



insert into public.temp_demo_invoice_items (
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
  (public.demo_seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0001:1'), 'INV-2026-0001', public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G01:tuition'), 'رسوم القسط المدرسي', 1, 600.00, 60.00, 540.00, 1),
  (public.demo_seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0001:2'), 'INV-2026-0001', public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G01:books'), 'رسوم الكتب', 1, 120.00, 12.00, 108.00, 2),
  (public.demo_seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0001:3'), 'INV-2026-0001', public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G01:activity'), 'رسوم النشاط', 1, 80.00, 8.00, 72.00, 3),
  (public.demo_seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0002:1'), 'INV-2026-0002', public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G10:tuition'), 'رسوم القسط المدرسي', 1, 900.00, 75.00, 825.00, 1),
  (public.demo_seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0002:2'), 'INV-2026-0002', public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G10:books'), 'رسوم الكتب', 1, 180.00, 0.00, 180.00, 2),
  (public.demo_seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0002:3'), 'INV-2026-0002', public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G10:exam'), 'رسوم الامتحان', 1, 120.00, 0.00, 120.00, 3),
  (public.demo_seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0003:1'), 'INV-2026-0003', public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G12:tuition'), 'رسوم القسط المدرسي', 1, 1000.00, 0.00, 1000.00, 1),
  (public.demo_seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0003:2'), 'INV-2026-0003', public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G12:books'), 'رسوم الكتب', 1, 200.00, 0.00, 200.00, 2),
  (public.demo_seed_uuid('ofuq-syrian-demo:invoice-item:INV-2026-0003:3'), 'INV-2026-0003', public.demo_seed_uuid('ofuq-syrian-demo:fee-item:G12:exam'), 'رسوم الامتحان النهائي', 1, 150.00, 0.00, 150.00, 3);



insert into public.temp_demo_payments (
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
    public.demo_seed_uuid('ofuq-syrian-demo:payment:REC-2026-0001'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:payment:REC-2026-0002'),
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



insert into public.temp_demo_messages (
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
    public.demo_seed_uuid('ofuq-syrian-demo:message:school-to-teachers'),
    'school-to-teachers',
    'school.admin@ofuq.local',
    'رسالة من الإدارة إلى المعلمين',
    'يرجى اعتماد الخطة الأسبوعية قبل نهاية دوام الخميس ومراجعة بيانات الحضور يوميًا.',
    null,
    'sent',
    '2026-09-01 07:35:00+03'
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:message:math-to-parent-hassan'),
    'math-to-parent-hassan',
    'teacher.math@ofuq.local',
    'متابعة مستوى يوسف في الرياضيات',
    'تحسن أداء يوسف في الواجبات الأخيرة ونوصي بمتابعة المراجعة المنزلية مرتين أسبوعيًا.',
    'SYR-2026-001',
    'sent',
    '2026-10-01 17:45:00+03'
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:message:librarian-to-admin'),
    'librarian-to-admin',
    'librarian@ofuq.local',
    'تحديث عهدة الكتب المتأخرة',
    'تم رصد إعارة متأخرة في قسم الفيزياء وتحتاج إلى متابعة مع الطالب المعني.',
    'SYR-2026-021',
    'sent',
    '2026-10-03 09:20:00+03'
  );



insert into public.temp_demo_message_recipients (
  recipient_row_id,
  message_key,
  recipient_email,
  read_at,
  archived_at
)
values
  (public.demo_seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.arabic@ofuq.local'), 'school-to-teachers', 'teacher.arabic@ofuq.local', '2026-09-01 08:10:00+03', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.math@ofuq.local'), 'school-to-teachers', 'teacher.math@ofuq.local', '2026-09-01 08:12:00+03', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.science@ofuq.local'), 'school-to-teachers', 'teacher.science@ofuq.local', null, null),
  (public.demo_seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.english@ofuq.local'), 'school-to-teachers', 'teacher.english@ofuq.local', null, null),
  (public.demo_seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.physics@ofuq.local'), 'school-to-teachers', 'teacher.physics@ofuq.local', null, null),
  (public.demo_seed_uuid('ofuq-syrian-demo:message-recipient:school-to-teachers:teacher.social@ofuq.local'), 'school-to-teachers', 'teacher.social@ofuq.local', null, null),
  (public.demo_seed_uuid('ofuq-syrian-demo:message-recipient:math-to-parent-hassan:parent.hassan@ofuq.local'), 'math-to-parent-hassan', 'parent.hassan@ofuq.local', '2026-10-01 18:10:00+03', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:message-recipient:librarian-to-admin:school.admin@ofuq.local'), 'librarian-to-admin', 'school.admin@ofuq.local', '2026-10-03 09:35:00+03', null);



insert into public.temp_demo_announcements (
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
    public.demo_seed_uuid('ofuq-syrian-demo:announcement:term-start'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:announcement:teacher-meeting'),
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



insert into public.temp_demo_notification_logs (
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
    public.demo_seed_uuid('ofuq-syrian-demo:notification:announcement-teacher-arabic'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:notification:message-teacher-math'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:notification:message-parent-hassan'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:notification:finance-invoice-youssef'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:notification:library-overdue-eiad'),
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



insert into public.temp_demo_school_events (
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
    public.demo_seed_uuid('ofuq-syrian-demo:event:parent-meeting'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:event:science-fair'),
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



insert into public.temp_demo_book_catalog (
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
    public.demo_seed_uuid('ofuq-syrian-demo:book:arabic-9'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:book:math-10'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:book:physics-11'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:book:science-6'),
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



insert into public.temp_demo_book_copies (
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
  (public.demo_seed_uuid('ofuq-syrian-demo:copy:arabic-9-1'), 'arabic-9-1', 'arabic-9', 'BC-AR9-001', 'ACC-AR9-001', 'A-01', 'good', 'available', 'نسخة مرجعية متاحة للإعارة.'),
  (public.demo_seed_uuid('ofuq-syrian-demo:copy:arabic-9-2'), 'arabic-9-2', 'arabic-9', 'BC-AR9-002', 'ACC-AR9-002', 'A-01', 'good', 'loaned', 'نسخة معارة حالياً.'),
  (public.demo_seed_uuid('ofuq-syrian-demo:copy:math-10-1'), 'math-10-1', 'math-10', 'BC-M10-001', 'ACC-M10-001', 'A-02', 'new', 'available', 'نسخة أُعيدت حديثاً.'),
  (public.demo_seed_uuid('ofuq-syrian-demo:copy:physics-11-1'), 'physics-11-1', 'physics-11', 'BC-P11-001', 'ACC-P11-001', 'B-01', 'good', 'loaned', 'نسخة على ذمة إعارة متأخرة.'),
  (public.demo_seed_uuid('ofuq-syrian-demo:copy:science-6-1'), 'science-6-1', 'science-6', 'BC-S6-001', 'ACC-S6-001', 'C-01', 'fair', 'available', 'نسخة متاحة للاستخدام داخل الصف.');



insert into public.temp_demo_book_loans (
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
    public.demo_seed_uuid('ofuq-syrian-demo:loan:arabic-active'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:loan:math-returned'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:loan:physics-overdue'),
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



insert into public.temp_demo_health_records (
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
    public.demo_seed_uuid('ofuq-syrian-demo:health:SYR-2026-001'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:health:SYR-2026-003'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:health:SYR-2026-013'),
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



insert into public.temp_demo_vaccinations (
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
    public.demo_seed_uuid('ofuq-syrian-demo:vaccination:SYR-2026-001:triple'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:vaccination:SYR-2026-003:measles'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:vaccination:SYR-2026-013:tetanus'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:vaccination:SYR-2026-023:polio'),
    'SYR-2026-023',
    'لقاح شلل الأطفال',
    'سجل مكتمل',
    '2026-09-04',
    null,
    'completed',
    'بيان مكتمل للطالب يزن.',
    'school.admin@ofuq.local'
  );



insert into public.temp_demo_clinic_visits (
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
    public.demo_seed_uuid('ofuq-syrian-demo:clinic:SYR-2026-001'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:clinic:SYR-2026-013'),
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



insert into public.temp_demo_discipline_records (
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
    public.demo_seed_uuid('ofuq-syrian-demo:discipline:SYR-2026-009'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:discipline:SYR-2026-017'),
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



insert into public.temp_demo_achievements (
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
    public.demo_seed_uuid('ofuq-syrian-demo:achievement:SYR-2026-001'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:achievement:SYR-2026-003'),
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



insert into public.temp_demo_complaints (
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
    public.demo_seed_uuid('ofuq-syrian-demo:complaint:attendance-followup'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:complaint:lab-maintenance'),
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



insert into public.temp_demo_complaint_updates (
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
    public.demo_seed_uuid('ofuq-syrian-demo:complaint-update:attendance-followup:comment'),
    'attendance-followup',
    'teacher.arabic@ofuq.local',
    'comment',
    'تم رصد الغياب خلال الأسبوع الحالي وإرفاق ملاحظة للمتابعة.',
    null,
    null
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:complaint-update:attendance-followup:assignment'),
    'attendance-followup',
    'school.admin@ofuq.local',
    'assignment',
    'تمت إحالة الشكوى إلى إدارة المدرسة للمراجعة.',
    null,
    null
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:complaint-update:attendance-followup:review'),
    'attendance-followup',
    'school.admin@ofuq.local',
    'status_change',
    'بدأت المراجعة الإدارية للشكوى.',
    'submitted',
    'in_review'
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:complaint-update:attendance-followup:resolution'),
    'attendance-followup',
    'school.admin@ofuq.local',
    'resolution',
    'أغلقت الشكوى بعد التواصل مع ولي الأمر وتحديث الإجراءات.',
    'in_review',
    'resolved'
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:complaint-update:lab-maintenance:comment'),
    'lab-maintenance',
    'teacher.physics@ofuq.local',
    'comment',
    'العطل الحالي يؤثر في حصص العملي للصف الأول الثانوي.',
    null,
    null
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:complaint-update:lab-maintenance:review'),
    'lab-maintenance',
    'school.admin@ofuq.local',
    'status_change',
    'تم فتح طلب متابعة مع فريق الصيانة الداخلي.',
    'submitted',
    'in_review'
  );



insert into public.temp_demo_surveys (
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
    public.demo_seed_uuid('ofuq-syrian-demo:survey:teacher-readiness-2026'),
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



insert into public.temp_demo_survey_questions (
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
    public.demo_seed_uuid('ofuq-syrian-demo:survey-question:teacher-readiness-2026:q1'),
    'teacher-readiness-2026',
    'q1',
    'ما أبرز أولوية تطويرية لهذا الفصل؟',
    'short_text',
    null,
    true,
    1
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:survey-question:teacher-readiness-2026:q2'),
    'teacher-readiness-2026',
    'q2',
    'كيف تقيم جاهزية الخطة الأسبوعية؟',
    'single_choice',
    '["ممتاز","جيد","يحتاج إلى تحسين"]'::jsonb,
    true,
    2
  );



insert into public.temp_demo_survey_responses (
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
    public.demo_seed_uuid('ofuq-syrian-demo:survey-response:teacher-readiness-2026:teacher.arabic'),
    'teacher-readiness-2026',
    'teacher.arabic@ofuq.local',
    null,
    'الحاجة الأكبر هي تنسيق خطط التقويم القصير بين المواد.',
    'جيد',
    '2026-09-10 10:00:00+03'
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:survey-response:teacher-readiness-2026:teacher.math'),
    'teacher-readiness-2026',
    'teacher.math@ofuq.local',
    null,
    'أولوية هذا الفصل هي رفع التزام الواجبات المنزلية في الصفوف الأولى.',
    'ممتاز',
    '2026-09-10 10:10:00+03'
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:survey-response:teacher-readiness-2026:teacher.science'),
    'teacher-readiness-2026',
    'teacher.science@ofuq.local',
    null,
    'تحتاج الأنشطة العملية إلى تجهيزات صفية إضافية بشكل مبكر.',
    'يحتاج إلى تحسين',
    '2026-09-10 10:20:00+03'
  );



insert into public.temp_demo_attendance_sessions (
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
    public.demo_seed_uuid('ofuq-syrian-demo:attendance-session:g01a-2026-10-05'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:attendance-session:g05a-2026-10-06'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:attendance-session:g06a-2026-10-07'),
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



insert into public.temp_demo_attendance_records (
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
    public.demo_seed_uuid('ofuq-syrian-demo:attendance-record:g01a-2026-10-05:youssef'),
    'g01a-2026-10-05',
    'SYR-2026-001',
    'present',
    'manual',
    'teacher.arabic@ofuq.local',
    '2026-10-05 08:02:00+03',
    null
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:attendance-record:g01a-2026-10-05:masa'),
    'g01a-2026-10-05',
    'SYR-2026-002',
    'late',
    'manual',
    'teacher.arabic@ofuq.local',
    '2026-10-05 08:07:00+03',
    'وصلت الطالبة بعد بدء الحصة الأولى.'
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:attendance-record:g05a-2026-10-06:malek'),
    'g05a-2026-10-06',
    'SYR-2026-009',
    'absent',
    'manual',
    'teacher.social@ofuq.local',
    '2026-10-06 09:05:00+03',
    'غاب الطالب دون إشعار مسبق.'
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:attendance-record:g05a-2026-10-06:janna'),
    'g05a-2026-10-06',
    'SYR-2026-010',
    'excused',
    'system',
    'teacher.social@ofuq.local',
    '2026-10-06 09:10:00+03',
    'اعتُمد العذر بعد المراجعة.'
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:attendance-record:g06a-2026-10-07:lian'),
    'g06a-2026-10-07',
    'SYR-2026-011',
    'present',
    'manual',
    'teacher.science@ofuq.local',
    '2026-10-07 10:03:00+03',
    null
  ),
  (
    public.demo_seed_uuid('ofuq-syrian-demo:attendance-record:g06a-2026-10-07:anas'),
    'g06a-2026-10-07',
    'SYR-2026-012',
    'absent',
    'manual',
    'teacher.science@ofuq.local',
    '2026-10-07 10:05:00+03',
    'بانتظار العذر.'
  );



insert into public.temp_demo_absence_excuses (
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
    public.demo_seed_uuid('ofuq-syrian-demo:absence-excuse:janna'),
    public.demo_seed_uuid('ofuq-syrian-demo:attendance-record:g05a-2026-10-06:janna'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:absence-excuse:anas'),
    public.demo_seed_uuid('ofuq-syrian-demo:attendance-record:g06a-2026-10-07:anas'),
    'SYR-2026-012',
    'school.admin@ofuq.local',
    null,
    'pending',
    'ظرف عائلي طارئ في يوم الغياب.',
    null,
    '2026-10-07 14:00:00+03',
    null
  );



insert into public.temp_demo_exams (
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
    public.demo_seed_uuid('ofuq-syrian-demo:exam:math-quiz-g01'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:exam:arabic-review-g01'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:exam:science-test-g01'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:exam:english-test-g01'),
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



insert into public.temp_demo_exam_results (
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
  (public.demo_seed_uuid('ofuq-syrian-demo:exam-result:math-quiz-g01:youssef'), 'math-quiz-g01', 'SYR-2026-001', 95.00, 'published', 'teacher.math@ofuq.local', '2026-11-10 11:00:00+03', '2026-11-11 09:00:00+03', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:exam-result:math-quiz-g01:masa'), 'math-quiz-g01', 'SYR-2026-002', 76.00, 'published', 'teacher.math@ofuq.local', '2026-11-10 11:05:00+03', '2026-11-11 09:00:00+03', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:exam-result:arabic-review-g01:youssef'), 'arabic-review-g01', 'SYR-2026-001', 87.00, 'published', 'teacher.arabic@ofuq.local', '2026-11-12 11:00:00+03', '2026-11-13 09:00:00+03', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:exam-result:arabic-review-g01:masa'), 'arabic-review-g01', 'SYR-2026-002', 82.00, 'published', 'teacher.arabic@ofuq.local', '2026-11-12 11:05:00+03', '2026-11-13 09:00:00+03', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:exam-result:science-test-g01:youssef'), 'science-test-g01', 'SYR-2026-001', 91.00, 'published', 'teacher.science@ofuq.local', '2026-11-14 11:00:00+03', '2026-11-15 09:00:00+03', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:exam-result:science-test-g01:masa'), 'science-test-g01', 'SYR-2026-002', 62.00, 'published', 'teacher.science@ofuq.local', '2026-11-14 11:05:00+03', '2026-11-15 09:00:00+03', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:exam-result:english-test-g01:youssef'), 'english-test-g01', 'SYR-2026-001', 88.00, 'published', 'teacher.english@ofuq.local', '2026-11-16 11:00:00+03', '2026-11-17 09:00:00+03', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:exam-result:english-test-g01:masa'), 'english-test-g01', 'SYR-2026-002', 79.00, 'published', 'teacher.english@ofuq.local', '2026-11-16 11:05:00+03', '2026-11-17 09:00:00+03', null);



insert into public.temp_demo_grade_entries (
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
  (public.demo_seed_uuid('ofuq-syrian-demo:grade-entry:youssef-math-homework'), 'G01:A', 'MATH', 'SYR-2026-001', 'homework', 'واجب الرياضيات الأول', 18.00, 20.00, 10.00, 'published', '2026-11-18', 'teacher.math@ofuq.local', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade-entry:masa-math-homework'), 'G01:A', 'MATH', 'SYR-2026-002', 'homework', 'واجب الرياضيات الأول', 15.00, 20.00, 10.00, 'published', '2026-11-18', 'teacher.math@ofuq.local', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade-entry:youssef-arabic-participation'), 'G01:A', 'ARABIC', 'SYR-2026-001', 'participation', 'مشاركة صفية', 9.00, 10.00, 5.00, 'published', '2026-11-19', 'teacher.arabic@ofuq.local', null),
  (public.demo_seed_uuid('ofuq-syrian-demo:grade-entry:masa-science-project'), 'G01:A', 'SCIENCE', 'SYR-2026-002', 'project', 'نشاط العلوم المصغر', 16.00, 20.00, 10.00, 'published', '2026-11-19', 'teacher.science@ofuq.local', null);



insert into public.temp_demo_report_cards (
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
    public.demo_seed_uuid('ofuq-syrian-demo:report-card:SYR-2026-001'),
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
    public.demo_seed_uuid('ofuq-syrian-demo:report-card:SYR-2026-002'),
    'G01:A',
    'SYR-2026-002',
    'تحتاج الطالبة إلى مراجعة إضافية في العلوم والرياضيات.',
    'يوصى بخطة دعم قصيرة خلال الفصل الثاني.',
    'school.admin@ofuq.local',
    'published',
    '2026-12-20 10:15:00+03',
    '2026-12-20 12:10:00+03'
  );
