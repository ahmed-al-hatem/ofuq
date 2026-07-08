create extension if not exists "pgcrypto";

do $$
begin
  create type public.integration_provider as enum (
    'whatsapp',
    'webhooks',
    'moe',
    'google_calendar',
    'microsoft_calendar',
    'power_bi',
    'looker',
    'zapier',
    'make'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.integration_status as enum (
    'placeholder',
    'disabled',
    'configured',
    'error'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.message_template_channel as enum (
    'in_app',
    'email',
    'sms',
    'whatsapp'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.message_template_status as enum (
    'draft',
    'active',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

create table public.school_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  school_display_name text,
  timezone text not null default 'Asia/Damascus',
  locale text not null default 'ar',
  direction text not null default 'rtl',
  academic_week_start smallint not null default 0,
  branding jsonb not null default '{}'::jsonb,
  module_flags jsonb not null default '{}'::jsonb,
  updated_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_settings_tenant_school_key
    unique (tenant_id, school_id),
  constraint school_settings_display_name_not_blank_chk
    check (school_display_name is null or btrim(school_display_name) <> ''),
  constraint school_settings_timezone_not_blank_chk
    check (btrim(timezone) <> ''),
  constraint school_settings_locale_not_blank_chk
    check (btrim(locale) <> ''),
  constraint school_settings_direction_chk
    check (direction in ('rtl', 'ltr')),
  constraint school_settings_academic_week_start_chk
    check (academic_week_start between 0 and 6),
  constraint school_settings_branding_object_chk
    check (jsonb_typeof(branding) = 'object'),
  constraint school_settings_module_flags_object_chk
    check (jsonb_typeof(module_flags) = 'object')
);

create index school_settings_tenant_id_idx
  on public.school_settings (tenant_id);
create index school_settings_school_id_idx
  on public.school_settings (school_id);

create table public.integration_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  provider public.integration_provider not null,
  display_name text not null,
  status public.integration_status not null default 'placeholder',
  enabled boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  updated_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint integration_settings_tenant_school_provider_key
    unique (tenant_id, school_id, provider),
  constraint integration_settings_display_name_not_blank_chk
    check (btrim(display_name) <> ''),
  constraint integration_settings_settings_object_chk
    check (jsonb_typeof(settings) = 'object')
);

create index integration_settings_tenant_school_idx
  on public.integration_settings (tenant_id, school_id);
create index integration_settings_provider_idx
  on public.integration_settings (provider);
create index integration_settings_status_idx
  on public.integration_settings (status);

create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  template_key text not null,
  channel public.message_template_channel not null,
  title text not null,
  body text not null,
  status public.message_template_status not null default 'draft',
  updated_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint message_templates_tenant_school_template_channel_key
    unique (tenant_id, school_id, template_key, channel),
  constraint message_templates_template_key_not_blank_chk
    check (btrim(template_key) <> ''),
  constraint message_templates_title_not_blank_chk
    check (btrim(title) <> ''),
  constraint message_templates_body_not_blank_chk
    check (btrim(body) <> '')
);

create index message_templates_tenant_school_idx
  on public.message_templates (tenant_id, school_id);
create index message_templates_template_key_idx
  on public.message_templates (template_key);
create index message_templates_status_idx
  on public.message_templates (status);

drop trigger if exists set_school_settings_updated_at on public.school_settings;
create trigger set_school_settings_updated_at
before update on public.school_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_integration_settings_updated_at on public.integration_settings;
create trigger set_integration_settings_updated_at
before update on public.integration_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_message_templates_updated_at on public.message_templates;
create trigger set_message_templates_updated_at
before update on public.message_templates
for each row execute function public.set_updated_at();
