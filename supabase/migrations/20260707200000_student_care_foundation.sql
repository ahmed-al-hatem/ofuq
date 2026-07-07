create extension if not exists "pgcrypto";

do $$
begin
  create type public.health_record_status as enum (
    'active',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.vaccination_status as enum (
    'scheduled',
    'completed',
    'missed',
    'exempted',
    'unknown'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.clinic_visit_status as enum (
    'open',
    'closed',
    'referred',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.discipline_incident_type as enum (
    'behavior',
    'attendance',
    'uniform',
    'bullying',
    'damage',
    'academic_misconduct',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.discipline_severity as enum (
    'low',
    'medium',
    'high',
    'critical'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.discipline_status as enum (
    'draft',
    'submitted',
    'reviewed',
    'resolved',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.achievement_category as enum (
    'academic',
    'sports',
    'arts',
    'behavior',
    'attendance',
    'community',
    'competition',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.achievement_level as enum (
    'class',
    'school',
    'district',
    'regional',
    'national',
    'international'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.achievement_status as enum (
    'draft',
    'published',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

create table public.health_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  blood_type text,
  allergies text,
  chronic_conditions text,
  medications text,
  emergency_notes text,
  doctor_name text,
  doctor_phone text,
  status public.health_record_status not null default 'active',
  created_by_user_id uuid references public.user_profiles(id) on delete set null,
  updated_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint health_records_blood_type_not_blank_chk
    check (blood_type is null or btrim(blood_type) <> ''),
  constraint health_records_doctor_name_not_blank_chk
    check (doctor_name is null or btrim(doctor_name) <> ''),
  constraint health_records_doctor_phone_not_blank_chk
    check (doctor_phone is null or btrim(doctor_phone) <> '')
);

create index health_records_tenant_school_idx
  on public.health_records (tenant_id, school_id);
create index health_records_student_id_idx
  on public.health_records (student_id);
create index health_records_status_idx
  on public.health_records (status);
create unique index health_records_one_active_per_student_key
  on public.health_records (tenant_id, school_id, student_id)
  where status = 'active';

create table public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  vaccine_name text not null,
  dose_label text,
  vaccinated_on date,
  next_due_on date,
  status public.vaccination_status not null default 'unknown',
  notes text,
  recorded_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vaccinations_vaccine_name_not_blank_chk
    check (btrim(vaccine_name) <> ''),
  constraint vaccinations_dose_label_not_blank_chk
    check (dose_label is null or btrim(dose_label) <> ''),
  constraint vaccinations_date_order_chk
    check (
      vaccinated_on is null
      or next_due_on is null
      or next_due_on >= vaccinated_on
    )
);

create index vaccinations_tenant_school_idx
  on public.vaccinations (tenant_id, school_id);
create index vaccinations_student_id_idx
  on public.vaccinations (student_id);
create index vaccinations_status_idx
  on public.vaccinations (status);
create index vaccinations_next_due_on_idx
  on public.vaccinations (next_due_on);

create table public.clinic_visits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  visited_at timestamptz not null default now(),
  reason text not null,
  symptoms text,
  action_taken text,
  returned_to_class boolean not null default true,
  guardian_contacted boolean not null default false,
  referred_to_external_care boolean not null default false,
  handled_by_user_id uuid references public.user_profiles(id) on delete set null,
  status public.clinic_visit_status not null default 'open',
  notes text,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clinic_visits_reason_not_blank_chk
    check (btrim(reason) <> ''),
  constraint clinic_visits_closed_state_chk
    check (
      closed_at is null
      or status in ('closed', 'referred', 'cancelled')
    )
);

create index clinic_visits_tenant_school_idx
  on public.clinic_visits (tenant_id, school_id);
create index clinic_visits_student_id_idx
  on public.clinic_visits (student_id);
create index clinic_visits_status_idx
  on public.clinic_visits (status);
create index clinic_visits_visited_at_idx
  on public.clinic_visits (visited_at desc);

create table public.discipline_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  incident_date date not null,
  incident_type public.discipline_incident_type not null default 'other',
  severity public.discipline_severity not null default 'low',
  title text not null,
  description text not null,
  action_taken text,
  status public.discipline_status not null default 'submitted',
  reported_by_user_id uuid not null references public.user_profiles(id) on delete restrict,
  reviewed_by_user_id uuid references public.user_profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discipline_records_title_not_blank_chk
    check (btrim(title) <> ''),
  constraint discipline_records_description_not_blank_chk
    check (btrim(description) <> ''),
  constraint discipline_records_reviewed_state_chk
    check (
      status not in ('reviewed', 'resolved')
      or (reviewed_at is not null and reviewed_by_user_id is not null)
    )
);

create index discipline_records_tenant_school_idx
  on public.discipline_records (tenant_id, school_id);
create index discipline_records_student_id_idx
  on public.discipline_records (student_id);
create index discipline_records_incident_date_idx
  on public.discipline_records (incident_date desc);
create index discipline_records_incident_type_idx
  on public.discipline_records (incident_type);
create index discipline_records_severity_idx
  on public.discipline_records (severity);
create index discipline_records_status_idx
  on public.discipline_records (status);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  achievement_date date not null,
  title text not null,
  description text,
  category public.achievement_category not null default 'other',
  level public.achievement_level not null default 'school',
  awarded_by_user_id uuid references public.user_profiles(id) on delete set null,
  status public.achievement_status not null default 'draft',
  created_by_user_id uuid not null references public.user_profiles(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint achievements_title_not_blank_chk
    check (btrim(title) <> ''),
  constraint achievements_published_state_chk
    check (status <> 'published' or published_at is not null)
);

create index achievements_tenant_school_idx
  on public.achievements (tenant_id, school_id);
create index achievements_student_id_idx
  on public.achievements (student_id);
create index achievements_achievement_date_idx
  on public.achievements (achievement_date desc);
create index achievements_category_idx
  on public.achievements (category);
create index achievements_level_idx
  on public.achievements (level);
create index achievements_status_idx
  on public.achievements (status);

drop trigger if exists set_health_records_updated_at on public.health_records;
create trigger set_health_records_updated_at
before update on public.health_records
for each row execute function public.set_updated_at();

drop trigger if exists set_vaccinations_updated_at on public.vaccinations;
create trigger set_vaccinations_updated_at
before update on public.vaccinations
for each row execute function public.set_updated_at();

drop trigger if exists set_clinic_visits_updated_at on public.clinic_visits;
create trigger set_clinic_visits_updated_at
before update on public.clinic_visits
for each row execute function public.set_updated_at();

drop trigger if exists set_discipline_records_updated_at on public.discipline_records;
create trigger set_discipline_records_updated_at
before update on public.discipline_records
for each row execute function public.set_updated_at();

drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at
before update on public.achievements
for each row execute function public.set_updated_at();
