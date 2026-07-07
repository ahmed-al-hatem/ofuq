create extension if not exists "pgcrypto";

do $$
begin
  create type public.timetable_day_of_week as enum (
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.timetable_slot_status as enum (
    'active',
    'cancelled',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.room_status as enum (
    'active',
    'inactive',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.teacher_subject_assignment_status as enum (
    'active',
    'inactive',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  code text,
  capacity integer,
  location text,
  status public.room_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_name_not_blank_chk check (btrim(name) <> ''),
  constraint rooms_code_not_blank_chk check (code is null or btrim(code) <> ''),
  constraint rooms_capacity_positive_chk check (capacity is null or capacity > 0),
  constraint rooms_tenant_school_name_key unique (tenant_id, school_id, name)
);

create unique index rooms_tenant_school_code_idx
  on public.rooms (tenant_id, school_id, code)
  where code is not null;
create index rooms_tenant_school_idx on public.rooms (tenant_id, school_id);
create index rooms_status_idx on public.rooms (status);

create table public.teacher_subject_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  teacher_user_id uuid not null references public.user_profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  grade_level_id uuid references public.grade_levels(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  status public.teacher_subject_assignment_status not null default 'active',
  created_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teacher_subject_assignments_scope_chk
    check (grade_level_id is not null or class_id is not null)
);

create unique index teacher_subject_assignments_active_scope_idx
  on public.teacher_subject_assignments (
    tenant_id,
    school_id,
    academic_year_id,
    teacher_user_id,
    subject_id,
    coalesce(grade_level_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(class_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  where status = 'active';
create index teacher_subject_assignments_tenant_school_idx
  on public.teacher_subject_assignments (tenant_id, school_id);
create index teacher_subject_assignments_academic_year_id_idx
  on public.teacher_subject_assignments (academic_year_id);
create index teacher_subject_assignments_teacher_user_id_idx
  on public.teacher_subject_assignments (teacher_user_id);
create index teacher_subject_assignments_subject_id_idx
  on public.teacher_subject_assignments (subject_id);
create index teacher_subject_assignments_grade_level_id_idx
  on public.teacher_subject_assignments (grade_level_id)
  where grade_level_id is not null;
create index teacher_subject_assignments_class_id_idx
  on public.teacher_subject_assignments (class_id)
  where class_id is not null;
create index teacher_subject_assignments_status_idx
  on public.teacher_subject_assignments (status);

create table public.timetable_slots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid references public.terms(id) on delete set null,
  class_id uuid not null references public.classes(id) on delete cascade,
  grade_level_id uuid not null references public.grade_levels(id),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_user_id uuid not null references public.user_profiles(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  day_of_week public.timetable_day_of_week not null,
  starts_at time not null,
  ends_at time not null,
  status public.timetable_slot_status not null default 'active',
  notes text,
  created_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timetable_slots_time_order_chk check (starts_at < ends_at)
);

create index timetable_slots_tenant_school_idx
  on public.timetable_slots (tenant_id, school_id);
create index timetable_slots_academic_year_id_idx
  on public.timetable_slots (academic_year_id);
create index timetable_slots_term_id_idx
  on public.timetable_slots (term_id)
  where term_id is not null;
create index timetable_slots_class_id_idx
  on public.timetable_slots (class_id);
create index timetable_slots_teacher_user_id_idx
  on public.timetable_slots (teacher_user_id);
create index timetable_slots_room_id_idx
  on public.timetable_slots (room_id)
  where room_id is not null;
create index timetable_slots_day_of_week_idx
  on public.timetable_slots (day_of_week);
create index timetable_slots_status_idx
  on public.timetable_slots (status);
create index timetable_slots_class_conflict_lookup_idx
  on public.timetable_slots (
    tenant_id,
    school_id,
    academic_year_id,
    class_id,
    day_of_week,
    starts_at,
    ends_at
  )
  where status = 'active';
create index timetable_slots_teacher_conflict_lookup_idx
  on public.timetable_slots (
    tenant_id,
    school_id,
    academic_year_id,
    teacher_user_id,
    day_of_week,
    starts_at,
    ends_at
  )
  where status = 'active';
create index timetable_slots_room_conflict_lookup_idx
  on public.timetable_slots (
    tenant_id,
    school_id,
    academic_year_id,
    room_id,
    day_of_week,
    starts_at,
    ends_at
  )
  where status = 'active' and room_id is not null;

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists set_teacher_subject_assignments_updated_at
  on public.teacher_subject_assignments;
create trigger set_teacher_subject_assignments_updated_at
before update on public.teacher_subject_assignments
for each row execute function public.set_updated_at();

drop trigger if exists set_timetable_slots_updated_at on public.timetable_slots;
create trigger set_timetable_slots_updated_at
before update on public.timetable_slots
for each row execute function public.set_updated_at();
