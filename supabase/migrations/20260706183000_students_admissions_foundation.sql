create extension if not exists "pgcrypto";

do $$
begin
  create type public.admission_status as enum (
    'pending',
    'approved',
    'rejected',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.student_status as enum (
    'active',
    'inactive',
    'transferred',
    'withdrawn',
    'graduated',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.student_gender as enum (
    'male',
    'female'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.guardian_relation as enum (
    'father',
    'mother',
    'guardian',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.student_document_type as enum (
    'birth_certificate',
    'national_id',
    'passport',
    'medical_report',
    'previous_school_record',
    'photo',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

create sequence if not exists public.student_number_seq
  start with 1
  increment by 1
  minvalue 1
  no maxvalue
  cache 1;

create or replace function public.generate_student_number()
returns text
language plpgsql
as $$
declare
  next_number bigint;
begin
  next_number := nextval('public.student_number_seq');

  return 'OFUQ-' || to_char(current_date, 'YYYY') || '-' || lpad(next_number::text, 6, '0');
end;
$$;

create table public.student_admissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  submitted_by_user_id uuid references public.user_profiles(id) on delete set null,
  reviewed_by_user_id uuid references public.user_profiles(id) on delete set null,
  status public.admission_status not null default 'pending',
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
  guardian_relation public.guardian_relation not null default 'guardian',
  notes text,
  decision_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_admissions_student_first_name_not_blank_chk
    check (btrim(student_first_name) <> ''),
  constraint student_admissions_student_last_name_not_blank_chk
    check (btrim(student_last_name) <> ''),
  constraint student_admissions_student_full_name_not_blank_chk
    check (btrim(student_full_name) <> ''),
  constraint student_admissions_guardian_name_not_blank_chk
    check (btrim(guardian_name) <> ''),
  constraint student_admissions_guardian_phone_not_blank_chk
    check (btrim(guardian_phone) <> '')
);

create index student_admissions_tenant_id_idx
  on public.student_admissions (tenant_id);
create index student_admissions_school_id_idx
  on public.student_admissions (school_id);
create index student_admissions_status_idx
  on public.student_admissions (status);
create index student_admissions_submitted_by_user_id_idx
  on public.student_admissions (submitted_by_user_id);
create index student_admissions_created_at_desc_idx
  on public.student_admissions (created_at desc);
create index student_admissions_tenant_school_status_idx
  on public.student_admissions (tenant_id, school_id, status);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  admission_id uuid unique references public.student_admissions(id),
  student_number text not null default public.generate_student_number(),
  qr_token uuid not null default gen_random_uuid(),
  first_name text not null,
  middle_name text,
  last_name text not null,
  full_name text not null,
  gender public.student_gender,
  birth_date date,
  nationality text,
  photo_url text,
  status public.student_status not null default 'active',
  enrolled_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_first_name_not_blank_chk check (btrim(first_name) <> ''),
  constraint students_last_name_not_blank_chk check (btrim(last_name) <> ''),
  constraint students_full_name_not_blank_chk check (btrim(full_name) <> '')
);

create unique index students_tenant_school_student_number_idx
  on public.students (tenant_id, school_id, student_number);
create unique index students_tenant_qr_token_idx
  on public.students (tenant_id, qr_token);
create index students_tenant_id_idx on public.students (tenant_id);
create index students_school_id_idx on public.students (school_id);
create index students_status_idx on public.students (status);
create index students_student_number_idx on public.students (student_number);
create index students_full_name_idx on public.students (full_name);
create index students_created_at_desc_idx on public.students (created_at desc);

create table public.student_guardians (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  guardian_user_id uuid references public.user_profiles(id) on delete set null,
  guardian_name text not null,
  guardian_email text,
  guardian_phone text not null,
  relation public.guardian_relation not null default 'guardian',
  is_primary boolean not null default false,
  can_receive_notifications boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_guardians_guardian_name_not_blank_chk
    check (btrim(guardian_name) <> ''),
  constraint student_guardians_guardian_phone_not_blank_chk
    check (btrim(guardian_phone) <> '')
);

create index student_guardians_tenant_id_idx on public.student_guardians (tenant_id);
create index student_guardians_school_id_idx on public.student_guardians (school_id);
create index student_guardians_student_id_idx on public.student_guardians (student_id);
create index student_guardians_guardian_user_id_idx
  on public.student_guardians (guardian_user_id)
  where guardian_user_id is not null;
create unique index student_guardians_one_primary_per_student_idx
  on public.student_guardians (student_id)
  where is_primary = true;

create table public.student_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  admission_id uuid references public.student_admissions(id) on delete cascade,
  uploaded_by_user_id uuid references public.user_profiles(id) on delete set null,
  document_type public.student_document_type not null default 'other',
  file_name text not null,
  file_path text not null,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now(),
  constraint student_documents_file_name_not_blank_chk
    check (btrim(file_name) <> ''),
  constraint student_documents_file_path_not_blank_chk
    check (btrim(file_path) <> ''),
  constraint student_documents_exactly_one_owner_chk
    check (num_nonnulls(student_id, admission_id) = 1)
);

create index student_documents_tenant_id_idx on public.student_documents (tenant_id);
create index student_documents_school_id_idx on public.student_documents (school_id);
create index student_documents_student_id_idx on public.student_documents (student_id);
create index student_documents_admission_id_idx on public.student_documents (admission_id);
create index student_documents_uploaded_by_user_id_idx
  on public.student_documents (uploaded_by_user_id);
create index student_documents_created_at_desc_idx
  on public.student_documents (created_at desc);

create table public.student_status_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  from_status public.student_status,
  to_status public.student_status not null,
  reason text,
  changed_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index student_status_history_tenant_id_idx
  on public.student_status_history (tenant_id);
create index student_status_history_school_id_idx
  on public.student_status_history (school_id);
create index student_status_history_student_id_idx
  on public.student_status_history (student_id);
create index student_status_history_created_at_desc_idx
  on public.student_status_history (created_at desc);

drop trigger if exists set_student_admissions_updated_at on public.student_admissions;
create trigger set_student_admissions_updated_at
before update on public.student_admissions
for each row execute function public.set_updated_at();

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists set_student_guardians_updated_at on public.student_guardians;
create trigger set_student_guardians_updated_at
before update on public.student_guardians
for each row execute function public.set_updated_at();

create or replace function public.approve_admission_and_create_student(
  p_admission_id uuid,
  p_changed_by_user_id uuid,
  p_decision_notes text default null
)
returns table (
  student_id uuid,
  student_number text
)
language plpgsql
as $$
declare
  v_admission public.student_admissions%rowtype;
  v_student_id uuid;
  v_student_number text;
begin
  select *
  into v_admission
  from public.student_admissions
  where id = p_admission_id
  for update;

  if not found then
    raise exception 'ADMISSION_NOT_FOUND';
  end if;

  if v_admission.status <> 'pending' then
    raise exception 'ADMISSION_NOT_PENDING';
  end if;

  if exists (
    select 1
    from public.students
    where admission_id = p_admission_id
  ) then
    raise exception 'ADMISSION_ALREADY_CONVERTED';
  end if;

  v_student_id := gen_random_uuid();
  v_student_number := public.generate_student_number();

  insert into public.students (
    id,
    tenant_id,
    school_id,
    admission_id,
    student_number,
    first_name,
    middle_name,
    last_name,
    full_name,
    gender,
    birth_date,
    nationality,
    status,
    enrolled_at
  )
  values (
    v_student_id,
    v_admission.tenant_id,
    v_admission.school_id,
    v_admission.id,
    v_student_number,
    v_admission.student_first_name,
    v_admission.student_middle_name,
    v_admission.student_last_name,
    v_admission.student_full_name,
    v_admission.gender,
    v_admission.birth_date,
    v_admission.nationality,
    'active',
    current_date
  );

  insert into public.student_guardians (
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
  values (
    v_admission.tenant_id,
    v_admission.school_id,
    v_student_id,
    v_admission.guardian_name,
    v_admission.guardian_email,
    v_admission.guardian_phone,
    v_admission.guardian_relation,
    true,
    true
  );

  insert into public.student_status_history (
    tenant_id,
    school_id,
    student_id,
    from_status,
    to_status,
    reason,
    changed_by_user_id
  )
  values (
    v_admission.tenant_id,
    v_admission.school_id,
    v_student_id,
    null,
    'active',
    'created_from_admission',
    p_changed_by_user_id
  );

  update public.student_admissions
  set
    status = 'approved',
    reviewed_by_user_id = p_changed_by_user_id,
    decision_notes = nullif(btrim(coalesce(p_decision_notes, '')), ''),
    reviewed_at = now(),
    updated_at = now()
  where id = p_admission_id;

  return query
  select v_student_id, v_student_number;
end;
$$;

insert into storage.buckets (id, name, public)
values ('student-documents', 'student-documents', false)
on conflict (id) do nothing;
