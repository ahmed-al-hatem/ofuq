create extension if not exists "pgcrypto";

do $$
begin
  create type public.user_role as enum (
    'system_admin',
    'school_admin',
    'teacher',
    'parent',
    'student',
    'accountant',
    'librarian'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.tenant_status as enum (
    'active',
    'inactive',
    'suspended'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.school_status as enum (
    'active',
    'inactive',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.membership_status as enum (
    'active',
    'invited',
    'suspended',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.tenants
  add column if not exists status public.tenant_status not null default 'active',
  add column if not exists locale text not null default 'ar',
  add column if not exists direction text not null default 'rtl';

alter table public.tenants
  alter column slug set not null;

update public.tenants
set slug = lower(slug);

update public.tenants
set locale = 'ar'
where btrim(locale) = '';

update public.tenants
set direction = 'rtl'
where btrim(direction) = '';

alter table public.tenants
  add constraint tenants_slug_lower_chk check (slug = lower(slug)),
  add constraint tenants_direction_chk check (direction in ('rtl', 'ltr')),
  add constraint tenants_locale_not_blank_chk check (btrim(locale) <> '');

create index if not exists tenants_status_idx on public.tenants (status);

drop trigger if exists set_tenants_updated_at on public.tenants;
create trigger set_tenants_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

alter table public.schools
  add column if not exists slug text,
  add column if not exists official_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists logo_url text,
  add column if not exists status public.school_status not null default 'active';

update public.schools
set slug = lower(regexp_replace(btrim(coalesce(nullif(code, ''), name)), '\s+', '-', 'g'))
where slug is null or btrim(slug) = '';

update public.schools
set slug = lower(slug);

alter table public.schools
  alter column slug set not null,
  alter column code drop not null;

update public.schools
set code = nullif(btrim(code), '');

alter table public.schools
  drop constraint if exists schools_tenant_id_code_key;

alter table public.schools
  add constraint schools_slug_lower_chk check (slug = lower(slug)),
  add constraint schools_slug_not_blank_chk check (btrim(slug) <> '');

create index if not exists schools_tenant_id_idx on public.schools (tenant_id);
create unique index if not exists schools_tenant_id_slug_idx
  on public.schools (tenant_id, slug);
create unique index if not exists schools_tenant_id_code_idx
  on public.schools (tenant_id, code)
  where code is not null;
create index if not exists schools_status_idx on public.schools (status);

drop trigger if exists set_schools_updated_at on public.schools;
create trigger set_schools_updated_at
before update on public.schools
for each row execute function public.set_updated_at();

alter table public.user_profiles rename to user_profiles_legacy;

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  display_name text,
  avatar_url text,
  phone text,
  preferred_locale text not null default 'ar',
  preferred_direction text not null default 'rtl',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_full_name_not_blank_chk check (btrim(full_name) <> ''),
  constraint user_profiles_preferred_locale_not_blank_chk check (btrim(preferred_locale) <> ''),
  constraint user_profiles_preferred_direction_chk check (
    preferred_direction in ('rtl', 'ltr')
  )
);

insert into public.user_profiles (
  id,
  full_name,
  display_name,
  avatar_url,
  phone,
  preferred_locale,
  preferred_direction,
  created_at,
  updated_at
)
select
  user_id as id,
  full_name,
  nullif(btrim(full_name), '') as display_name,
  avatar_url,
  null::text as phone,
  'ar' as preferred_locale,
  'rtl' as preferred_direction,
  coalesce(created_at, now()),
  coalesce(updated_at, created_at, now())
from public.user_profiles_legacy;

create index if not exists user_profiles_phone_idx
  on public.user_profiles (phone)
  where phone is not null;

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create table public.user_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid references public.schools(id) on delete cascade,
  role public.user_role not null,
  status public.membership_status not null default 'active',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_memberships_user_tenant_school_role_key
    unique nulls not distinct (user_id, tenant_id, school_id, role)
);

with legacy_memberships as (
  select
    ur.id,
    ur.user_id,
    ur.tenant_id,
    ur.school_id,
    ur.role,
    ur.created_at
  from public.user_roles ur

  union all

  select
    gen_random_uuid() as id,
    upl.user_id,
    upl.tenant_id,
    upl.school_id,
    upl.role,
    upl.created_at
  from public.user_profiles_legacy upl
  where upl.tenant_id is not null
),
ranked_memberships as (
  select
    lm.id,
    lm.user_id,
    lm.tenant_id,
    lm.school_id,
    lm.role::public.user_role as role,
    lm.created_at,
    row_number() over (
      partition by lm.user_id, lm.tenant_id, lm.school_id, lm.role
      order by lm.created_at nulls last, lm.id
    ) as duplicate_rank,
    row_number() over (
      partition by lm.user_id
      order by lm.created_at nulls last, lm.id
    ) as primary_rank
  from legacy_memberships lm
  join public.user_profiles up
    on up.id = lm.user_id
)
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
  id,
  user_id,
  tenant_id,
  school_id,
  role,
  'active'::public.membership_status,
  primary_rank = 1,
  coalesce(created_at, now()),
  coalesce(created_at, now())
from ranked_memberships
where duplicate_rank = 1;

create index if not exists user_memberships_user_id_idx
  on public.user_memberships (user_id);
create index if not exists user_memberships_tenant_id_idx
  on public.user_memberships (tenant_id);
create index if not exists user_memberships_school_id_idx
  on public.user_memberships (school_id);
create index if not exists user_memberships_tenant_id_school_id_idx
  on public.user_memberships (tenant_id, school_id);
create index if not exists user_memberships_tenant_id_role_idx
  on public.user_memberships (tenant_id, role);
create unique index if not exists user_memberships_one_primary_per_user_idx
  on public.user_memberships (user_id)
  where is_primary = true;

create trigger set_user_memberships_updated_at
before update on public.user_memberships
for each row execute function public.set_updated_at();

drop table public.user_roles;

create table public.audit_logs_new (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete set null,
  school_id uuid references public.schools(id) on delete set null,
  actor_user_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

insert into public.audit_logs_new (
  id,
  tenant_id,
  school_id,
  actor_user_id,
  action,
  entity_type,
  entity_id,
  metadata,
  ip_address,
  user_agent,
  created_at
)
select
  al.id,
  al.tenant_id,
  al.school_id,
  case
    when exists (
      select 1
      from public.user_profiles up
      where up.id = al.actor_user_id
    ) then al.actor_user_id
    else null
  end as actor_user_id,
  al.action,
  al.entity_name as entity_type,
  al.entity_id,
  al.metadata,
  null::inet as ip_address,
  null::text as user_agent,
  coalesce(al.created_at, now())
from public.audit_logs al;

drop table public.audit_logs;
alter table public.audit_logs_new rename to audit_logs;

create index if not exists audit_logs_tenant_id_idx on public.audit_logs (tenant_id);
create index if not exists audit_logs_school_id_idx on public.audit_logs (school_id);
create index if not exists audit_logs_actor_user_id_idx on public.audit_logs (actor_user_id);
create index if not exists audit_logs_action_idx on public.audit_logs (action);
create index if not exists audit_logs_created_at_desc_idx
  on public.audit_logs (created_at desc);
create index if not exists audit_logs_metadata_gin_idx
  on public.audit_logs using gin (metadata);

drop table public.user_profiles_legacy;
