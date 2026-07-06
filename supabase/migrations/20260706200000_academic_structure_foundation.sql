create extension if not exists "pgcrypto";

do $$
begin
  create type public.academic_year_status as enum (
    'draft',
    'active',
    'closed',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.term_status as enum (
    'draft',
    'active',
    'closed',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.grade_level_stage as enum (
    'kindergarten',
    'primary',
    'middle',
    'secondary',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.grade_level_status as enum (
    'active',
    'inactive',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.class_status as enum (
    'active',
    'inactive',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.subject_type as enum (
    'core',
    'elective',
    'activity',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.subject_status as enum (
    'active',
    'inactive',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.class_enrollment_status as enum (
    'active',
    'transferred',
    'withdrawn',
    'completed',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  code text not null,
  starts_on date not null,
  ends_on date not null,
  status public.academic_year_status not null default 'draft',
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_years_name_not_blank_chk check (btrim(name) <> ''),
  constraint academic_years_code_not_blank_chk check (btrim(code) <> ''),
  constraint academic_years_date_order_chk check (starts_on < ends_on),
  constraint academic_years_tenant_school_code_key unique (tenant_id, school_id, code)
);

create unique index academic_years_one_current_per_school_idx
  on public.academic_years (tenant_id, school_id)
  where is_current = true;
create index academic_years_tenant_id_idx on public.academic_years (tenant_id);
create index academic_years_school_id_idx on public.academic_years (school_id);
create index academic_years_status_idx on public.academic_years (status);
create index academic_years_is_current_idx on public.academic_years (is_current);
create index academic_years_starts_on_desc_idx on public.academic_years (starts_on desc);

create table public.terms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  name text not null,
  code text not null,
  term_order integer not null,
  starts_on date not null,
  ends_on date not null,
  status public.term_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint terms_name_not_blank_chk check (btrim(name) <> ''),
  constraint terms_code_not_blank_chk check (btrim(code) <> ''),
  constraint terms_order_positive_chk check (term_order > 0),
  constraint terms_date_order_chk check (starts_on < ends_on),
  constraint terms_academic_year_code_key unique (academic_year_id, code),
  constraint terms_academic_year_order_key unique (academic_year_id, term_order)
);

create index terms_tenant_id_idx on public.terms (tenant_id);
create index terms_school_id_idx on public.terms (school_id);
create index terms_academic_year_id_idx on public.terms (academic_year_id);
create index terms_status_idx on public.terms (status);
create index terms_term_order_idx on public.terms (term_order);

create table public.grade_levels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  code text not null,
  grade_order integer not null,
  stage public.grade_level_stage not null default 'other',
  status public.grade_level_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grade_levels_name_not_blank_chk check (btrim(name) <> ''),
  constraint grade_levels_code_not_blank_chk check (btrim(code) <> ''),
  constraint grade_levels_order_positive_chk check (grade_order > 0),
  constraint grade_levels_tenant_school_code_key unique (tenant_id, school_id, code),
  constraint grade_levels_tenant_school_order_key unique (tenant_id, school_id, grade_order)
);

create index grade_levels_tenant_id_idx on public.grade_levels (tenant_id);
create index grade_levels_school_id_idx on public.grade_levels (school_id);
create index grade_levels_stage_idx on public.grade_levels (stage);
create index grade_levels_status_idx on public.grade_levels (status);
create index grade_levels_grade_order_idx on public.grade_levels (grade_order);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  grade_level_id uuid not null references public.grade_levels(id),
  name text not null,
  section text not null,
  capacity integer,
  homeroom_teacher_id uuid references public.user_profiles(id) on delete set null,
  room_name text,
  status public.class_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_name_not_blank_chk check (btrim(name) <> ''),
  constraint classes_section_not_blank_chk check (btrim(section) <> ''),
  constraint classes_capacity_positive_chk check (capacity is null or capacity > 0),
  constraint classes_tenant_school_year_grade_section_key
    unique (tenant_id, school_id, academic_year_id, grade_level_id, section)
);

create index classes_tenant_id_idx on public.classes (tenant_id);
create index classes_school_id_idx on public.classes (school_id);
create index classes_academic_year_id_idx on public.classes (academic_year_id);
create index classes_grade_level_id_idx on public.classes (grade_level_id);
create index classes_status_idx on public.classes (status);
create index classes_homeroom_teacher_id_idx
  on public.classes (homeroom_teacher_id)
  where homeroom_teacher_id is not null;

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  code text not null,
  description text,
  subject_type public.subject_type not null default 'core',
  status public.subject_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subjects_name_not_blank_chk check (btrim(name) <> ''),
  constraint subjects_code_not_blank_chk check (btrim(code) <> ''),
  constraint subjects_tenant_school_code_key unique (tenant_id, school_id, code)
);

create index subjects_tenant_id_idx on public.subjects (tenant_id);
create index subjects_school_id_idx on public.subjects (school_id);
create index subjects_subject_type_idx on public.subjects (subject_type);
create index subjects_status_idx on public.subjects (status);

create table public.grade_level_subjects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  grade_level_id uuid not null references public.grade_levels(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  is_required boolean not null default true,
  weekly_periods integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grade_level_subjects_weekly_periods_positive_chk
    check (weekly_periods is null or weekly_periods > 0),
  constraint grade_level_subjects_unique_assignment_key
    unique (tenant_id, school_id, academic_year_id, grade_level_id, subject_id)
);

create index grade_level_subjects_tenant_id_idx on public.grade_level_subjects (tenant_id);
create index grade_level_subjects_school_id_idx on public.grade_level_subjects (school_id);
create index grade_level_subjects_academic_year_id_idx on public.grade_level_subjects (academic_year_id);
create index grade_level_subjects_grade_level_id_idx on public.grade_level_subjects (grade_level_id);
create index grade_level_subjects_subject_id_idx on public.grade_level_subjects (subject_id);
create index grade_level_subjects_sort_order_idx on public.grade_level_subjects (sort_order);

create table public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  grade_level_id uuid not null references public.grade_levels(id),
  status public.class_enrollment_status not null default 'active',
  enrolled_on date not null default current_date,
  left_on date,
  created_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_enrollments_date_order_chk
    check (left_on is null or left_on >= enrolled_on)
);

create unique index class_enrollments_one_active_per_student_year_idx
  on public.class_enrollments (tenant_id, school_id, academic_year_id, student_id)
  where status = 'active';
create index class_enrollments_tenant_id_idx on public.class_enrollments (tenant_id);
create index class_enrollments_school_id_idx on public.class_enrollments (school_id);
create index class_enrollments_academic_year_id_idx on public.class_enrollments (academic_year_id);
create index class_enrollments_class_id_idx on public.class_enrollments (class_id);
create index class_enrollments_student_id_idx on public.class_enrollments (student_id);
create index class_enrollments_grade_level_id_idx on public.class_enrollments (grade_level_id);
create index class_enrollments_status_idx on public.class_enrollments (status);

drop trigger if exists set_academic_years_updated_at on public.academic_years;
create trigger set_academic_years_updated_at
before update on public.academic_years
for each row execute function public.set_updated_at();

drop trigger if exists set_terms_updated_at on public.terms;
create trigger set_terms_updated_at
before update on public.terms
for each row execute function public.set_updated_at();

drop trigger if exists set_grade_levels_updated_at on public.grade_levels;
create trigger set_grade_levels_updated_at
before update on public.grade_levels
for each row execute function public.set_updated_at();

drop trigger if exists set_classes_updated_at on public.classes;
create trigger set_classes_updated_at
before update on public.classes
for each row execute function public.set_updated_at();

drop trigger if exists set_subjects_updated_at on public.subjects;
create trigger set_subjects_updated_at
before update on public.subjects
for each row execute function public.set_updated_at();

drop trigger if exists set_grade_level_subjects_updated_at on public.grade_level_subjects;
create trigger set_grade_level_subjects_updated_at
before update on public.grade_level_subjects
for each row execute function public.set_updated_at();

drop trigger if exists set_class_enrollments_updated_at on public.class_enrollments;
create trigger set_class_enrollments_updated_at
before update on public.class_enrollments
for each row execute function public.set_updated_at();
