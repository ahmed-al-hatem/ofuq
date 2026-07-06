create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  school_id uuid references public.schools(id) on delete set null,
  full_name text not null,
  email text not null,
  role text not null check (
    role in (
      'system_admin',
      'school_admin',
      'teacher',
      'parent',
      'student',
      'accountant',
      'librarian'
    )
  ),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_tenant_id_idx on public.user_profiles (tenant_id);
create index if not exists user_profiles_school_id_idx on public.user_profiles (school_id);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid references public.schools(id) on delete cascade,
  role text not null check (
    role in (
      'system_admin',
      'school_admin',
      'teacher',
      'parent',
      'student',
      'accountant',
      'librarian'
    )
  ),
  created_at timestamptz not null default now(),
  unique (user_id, tenant_id, school_id, role)
);

create index if not exists user_roles_tenant_id_idx on public.user_roles (tenant_id);
create index if not exists user_roles_school_id_idx on public.user_roles (school_id);
create index if not exists user_roles_user_id_idx on public.user_roles (user_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_name text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_tenant_id_idx on public.audit_logs (tenant_id);
create index if not exists audit_logs_school_id_idx on public.audit_logs (school_id);
create index if not exists audit_logs_actor_user_id_idx on public.audit_logs (actor_user_id);

drop trigger if exists set_tenants_updated_at on public.tenants;
create trigger set_tenants_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

drop trigger if exists set_schools_updated_at on public.schools;
create trigger set_schools_updated_at
before update on public.schools
for each row execute function public.set_updated_at();

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();
