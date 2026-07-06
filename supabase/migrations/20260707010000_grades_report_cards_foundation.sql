create extension if not exists "pgcrypto";

do $$
begin
  create type public.exam_status as enum (
    'draft',
    'scheduled',
    'completed',
    'published',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.exam_result_status as enum (
    'draft',
    'entered',
    'published',
    'absent',
    'excused'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.grade_entry_category as enum (
    'quiz',
    'assignment',
    'homework',
    'project',
    'participation',
    'behavior',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.grade_entry_status as enum (
    'draft',
    'entered',
    'published'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.report_card_status as enum (
    'draft',
    'published',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid references public.terms(id) on delete set null,
  class_id uuid not null references public.classes(id) on delete cascade,
  grade_level_id uuid not null references public.grade_levels(id),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  exam_date date,
  max_score numeric(6,2) not null default 100,
  weight numeric(5,2),
  status public.exam_status not null default 'draft',
  created_by_user_id uuid references public.user_profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exams_title_not_blank_chk check (btrim(title) <> ''),
  constraint exams_max_score_positive_chk check (max_score > 0),
  constraint exams_weight_range_chk check (weight is null or (weight > 0 and weight <= 100))
);

create index exams_tenant_id_idx on public.exams (tenant_id);
create index exams_school_id_idx on public.exams (school_id);
create index exams_academic_year_id_idx on public.exams (academic_year_id);
create index exams_term_id_idx on public.exams (term_id) where term_id is not null;
create index exams_class_id_idx on public.exams (class_id);
create index exams_grade_level_id_idx on public.exams (grade_level_id);
create index exams_subject_id_idx on public.exams (subject_id);
create index exams_status_idx on public.exams (status);
create index exams_exam_date_idx on public.exams (exam_date);
create index exams_created_by_user_id_idx
  on public.exams (created_by_user_id)
  where created_by_user_id is not null;
create index exams_tenant_school_year_class_subject_idx
  on public.exams (tenant_id, school_id, academic_year_id, class_id, subject_id);

create table public.exam_results (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid references public.terms(id) on delete set null,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_enrollment_id uuid not null references public.class_enrollments(id) on delete cascade,
  score numeric(6,2),
  status public.exam_result_status not null default 'draft',
  entered_by_user_id uuid references public.user_profiles(id) on delete set null,
  entered_at timestamptz not null default now(),
  published_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_results_exam_student_key unique (exam_id, student_id),
  constraint exam_results_score_non_negative_chk check (score is null or score >= 0)
);

create index exam_results_tenant_id_idx on public.exam_results (tenant_id);
create index exam_results_school_id_idx on public.exam_results (school_id);
create index exam_results_exam_id_idx on public.exam_results (exam_id);
create index exam_results_academic_year_id_idx on public.exam_results (academic_year_id);
create index exam_results_term_id_idx on public.exam_results (term_id) where term_id is not null;
create index exam_results_class_id_idx on public.exam_results (class_id);
create index exam_results_subject_id_idx on public.exam_results (subject_id);
create index exam_results_student_id_idx on public.exam_results (student_id);
create index exam_results_class_enrollment_id_idx on public.exam_results (class_enrollment_id);
create index exam_results_status_idx on public.exam_results (status);
create index exam_results_entered_at_desc_idx on public.exam_results (entered_at desc);

create table public.grade_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid references public.terms(id) on delete set null,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_enrollment_id uuid not null references public.class_enrollments(id) on delete cascade,
  category public.grade_entry_category not null default 'other',
  title text not null,
  score numeric(6,2) not null,
  max_score numeric(6,2) not null default 100,
  weight numeric(5,2),
  status public.grade_entry_status not null default 'entered',
  recorded_on date not null default current_date,
  entered_by_user_id uuid references public.user_profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grade_entries_title_not_blank_chk check (btrim(title) <> ''),
  constraint grade_entries_score_non_negative_chk check (score >= 0),
  constraint grade_entries_max_score_positive_chk check (max_score > 0),
  constraint grade_entries_score_max_chk check (score <= max_score),
  constraint grade_entries_weight_range_chk check (weight is null or (weight > 0 and weight <= 100))
);

create index grade_entries_tenant_id_idx on public.grade_entries (tenant_id);
create index grade_entries_school_id_idx on public.grade_entries (school_id);
create index grade_entries_academic_year_id_idx on public.grade_entries (academic_year_id);
create index grade_entries_term_id_idx on public.grade_entries (term_id) where term_id is not null;
create index grade_entries_class_id_idx on public.grade_entries (class_id);
create index grade_entries_subject_id_idx on public.grade_entries (subject_id);
create index grade_entries_student_id_idx on public.grade_entries (student_id);
create index grade_entries_class_enrollment_id_idx on public.grade_entries (class_enrollment_id);
create index grade_entries_category_idx on public.grade_entries (category);
create index grade_entries_status_idx on public.grade_entries (status);
create index grade_entries_recorded_on_desc_idx on public.grade_entries (recorded_on desc);

create table public.report_cards (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid references public.terms(id) on delete set null,
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_enrollment_id uuid not null references public.class_enrollments(id) on delete cascade,
  status public.report_card_status not null default 'draft',
  summary jsonb not null default '{}'::jsonb,
  teacher_remarks text,
  admin_notes text,
  generated_by_user_id uuid references public.user_profiles(id) on delete set null,
  generated_at timestamptz not null default now(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index report_cards_unique_scope_idx
  on public.report_cards (
    tenant_id,
    school_id,
    academic_year_id,
    coalesce(term_id, '00000000-0000-0000-0000-000000000000'::uuid),
    student_id
  );
create index report_cards_tenant_id_idx on public.report_cards (tenant_id);
create index report_cards_school_id_idx on public.report_cards (school_id);
create index report_cards_academic_year_id_idx on public.report_cards (academic_year_id);
create index report_cards_term_id_idx on public.report_cards (term_id) where term_id is not null;
create index report_cards_class_id_idx on public.report_cards (class_id);
create index report_cards_student_id_idx on public.report_cards (student_id);
create index report_cards_class_enrollment_id_idx on public.report_cards (class_enrollment_id);
create index report_cards_status_idx on public.report_cards (status);
create index report_cards_generated_at_desc_idx on public.report_cards (generated_at desc);

drop trigger if exists set_exams_updated_at on public.exams;
create trigger set_exams_updated_at
before update on public.exams
for each row execute function public.set_updated_at();

drop trigger if exists set_exam_results_updated_at on public.exam_results;
create trigger set_exam_results_updated_at
before update on public.exam_results
for each row execute function public.set_updated_at();

drop trigger if exists set_grade_entries_updated_at on public.grade_entries;
create trigger set_grade_entries_updated_at
before update on public.grade_entries
for each row execute function public.set_updated_at();

drop trigger if exists set_report_cards_updated_at on public.report_cards;
create trigger set_report_cards_updated_at
before update on public.report_cards
for each row execute function public.set_updated_at();
