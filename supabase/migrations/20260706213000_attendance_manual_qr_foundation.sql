create extension if not exists "pgcrypto";

do $$
begin
  create type public.attendance_session_method as enum (
    'manual',
    'qr'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.attendance_session_status as enum (
    'open',
    'closed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.attendance_status as enum (
    'present',
    'absent',
    'late',
    'excused'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.attendance_record_method as enum (
    'manual',
    'qr',
    'system'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.absence_excuse_status as enum (
    'pending',
    'approved',
    'rejected',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid references public.terms(id) on delete set null,
  class_id uuid not null references public.classes(id) on delete cascade,
  taken_by_user_id uuid references public.user_profiles(id) on delete set null,
  session_date date not null,
  starts_at time,
  ends_at time,
  method public.attendance_session_method not null default 'manual',
  status public.attendance_session_status not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_sessions_time_order_chk
    check (starts_at is null or ends_at is null or starts_at < ends_at)
);

create index attendance_sessions_tenant_id_idx
  on public.attendance_sessions (tenant_id);
create index attendance_sessions_school_id_idx
  on public.attendance_sessions (school_id);
create index attendance_sessions_academic_year_id_idx
  on public.attendance_sessions (academic_year_id);
create index attendance_sessions_term_id_idx
  on public.attendance_sessions (term_id)
  where term_id is not null;
create index attendance_sessions_class_id_idx
  on public.attendance_sessions (class_id);
create index attendance_sessions_session_date_idx
  on public.attendance_sessions (session_date);
create index attendance_sessions_status_idx
  on public.attendance_sessions (status);
create index attendance_sessions_method_idx
  on public.attendance_sessions (method);
create index attendance_sessions_taken_by_user_id_idx
  on public.attendance_sessions (taken_by_user_id)
  where taken_by_user_id is not null;
create index attendance_sessions_tenant_school_date_idx
  on public.attendance_sessions (tenant_id, school_id, session_date desc);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  attendance_session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_enrollment_id uuid not null references public.class_enrollments(id) on delete cascade,
  status public.attendance_status not null default 'present',
  method public.attendance_record_method not null default 'manual',
  recorded_by_user_id uuid references public.user_profiles(id) on delete set null,
  recorded_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_records_session_student_key
    unique (attendance_session_id, student_id)
);

create index attendance_records_tenant_id_idx
  on public.attendance_records (tenant_id);
create index attendance_records_school_id_idx
  on public.attendance_records (school_id);
create index attendance_records_attendance_session_id_idx
  on public.attendance_records (attendance_session_id);
create index attendance_records_academic_year_id_idx
  on public.attendance_records (academic_year_id);
create index attendance_records_class_id_idx
  on public.attendance_records (class_id);
create index attendance_records_student_id_idx
  on public.attendance_records (student_id);
create index attendance_records_class_enrollment_id_idx
  on public.attendance_records (class_enrollment_id);
create index attendance_records_status_idx
  on public.attendance_records (status);
create index attendance_records_method_idx
  on public.attendance_records (method);
create index attendance_records_recorded_at_desc_idx
  on public.attendance_records (recorded_at desc);

create table public.absence_excuses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  attendance_record_id uuid not null references public.attendance_records(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  submitted_by_user_id uuid references public.user_profiles(id) on delete set null,
  reviewed_by_user_id uuid references public.user_profiles(id) on delete set null,
  status public.absence_excuse_status not null default 'pending',
  reason text not null,
  review_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint absence_excuses_reason_not_blank_chk check (btrim(reason) <> ''),
  constraint absence_excuses_attendance_record_key unique (attendance_record_id)
);

create index absence_excuses_tenant_id_idx
  on public.absence_excuses (tenant_id);
create index absence_excuses_school_id_idx
  on public.absence_excuses (school_id);
create index absence_excuses_attendance_record_id_idx
  on public.absence_excuses (attendance_record_id);
create index absence_excuses_student_id_idx
  on public.absence_excuses (student_id);
create index absence_excuses_status_idx
  on public.absence_excuses (status);
create index absence_excuses_submitted_at_desc_idx
  on public.absence_excuses (submitted_at desc);

drop trigger if exists set_attendance_sessions_updated_at on public.attendance_sessions;
create trigger set_attendance_sessions_updated_at
before update on public.attendance_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_attendance_records_updated_at on public.attendance_records;
create trigger set_attendance_records_updated_at
before update on public.attendance_records
for each row execute function public.set_updated_at();

drop trigger if exists set_absence_excuses_updated_at on public.absence_excuses;
create trigger set_absence_excuses_updated_at
before update on public.absence_excuses
for each row execute function public.set_updated_at();
