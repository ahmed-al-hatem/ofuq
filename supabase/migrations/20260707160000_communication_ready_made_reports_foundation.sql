create extension if not exists "pgcrypto";

do $$
begin
  create type public.communication_message_status as enum (
    'sent',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.announcement_target_type as enum (
    'school',
    'role',
    'grade_level',
    'class'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.announcement_status as enum (
    'draft',
    'published',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_channel as enum (
    'in_app'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_status as enum (
    'created',
    'read',
    'archived',
    'failed'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.school_event_target_type as enum (
    'school',
    'grade_level',
    'class'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.school_event_status as enum (
    'scheduled',
    'cancelled',
    'completed',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  sender_user_id uuid not null references public.user_profiles(id) on delete cascade,
  subject text not null,
  body text not null,
  related_student_id uuid references public.students(id) on delete set null,
  status public.communication_message_status not null default 'sent',
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint messages_subject_not_blank_chk check (btrim(subject) <> ''),
  constraint messages_body_not_blank_chk check (btrim(body) <> '')
);

create index messages_tenant_school_idx on public.messages (tenant_id, school_id);
create index messages_sender_user_id_idx on public.messages (sender_user_id);
create index messages_related_student_id_idx on public.messages (related_student_id)
  where related_student_id is not null;
create index messages_status_idx on public.messages (status);
create index messages_sent_at_idx on public.messages (sent_at desc);

create table public.message_recipients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  recipient_user_id uuid not null references public.user_profiles(id) on delete cascade,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint message_recipients_message_recipient_key
    unique (message_id, recipient_user_id)
);

create index message_recipients_tenant_school_idx
  on public.message_recipients (tenant_id, school_id);
create index message_recipients_message_id_idx
  on public.message_recipients (message_id);
create index message_recipients_recipient_user_id_idx
  on public.message_recipients (recipient_user_id);
create index message_recipients_read_at_idx on public.message_recipients (read_at);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  body text not null,
  target_type public.announcement_target_type not null default 'school',
  target_role public.user_role,
  grade_level_id uuid references public.grade_levels(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  status public.announcement_status not null default 'draft',
  published_at timestamptz,
  expires_at timestamptz,
  created_by_user_id uuid not null references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_title_not_blank_chk check (btrim(title) <> ''),
  constraint announcements_body_not_blank_chk check (btrim(body) <> ''),
  constraint announcements_target_chk check (
    (target_type = 'school' and target_role is null and grade_level_id is null and class_id is null)
    or (target_type = 'role' and target_role is not null and grade_level_id is null and class_id is null)
    or (target_type = 'grade_level' and target_role is null and grade_level_id is not null and class_id is null)
    or (target_type = 'class' and target_role is null and grade_level_id is null and class_id is not null)
  ),
  constraint announcements_expiry_order_chk check (
    expires_at is null
    or published_at is null
    or expires_at > published_at
  )
);

create index announcements_tenant_school_idx
  on public.announcements (tenant_id, school_id);
create index announcements_status_idx on public.announcements (status);
create index announcements_target_type_idx on public.announcements (target_type);
create index announcements_published_at_idx
  on public.announcements (published_at desc);
create index announcements_expires_at_idx on public.announcements (expires_at)
  where expires_at is not null;

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  recipient_user_id uuid references public.user_profiles(id) on delete cascade,
  actor_user_id uuid references public.user_profiles(id) on delete set null,
  channel public.notification_channel not null default 'in_app',
  notification_type text not null,
  title text not null,
  body text,
  status public.notification_status not null default 'created',
  related_entity_type text,
  related_entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_logs_channel_chk check (channel = 'in_app'),
  constraint notification_logs_type_not_blank_chk check (btrim(notification_type) <> ''),
  constraint notification_logs_title_not_blank_chk check (btrim(title) <> '')
);

create index notification_logs_tenant_school_idx
  on public.notification_logs (tenant_id, school_id);
create index notification_logs_recipient_user_id_idx
  on public.notification_logs (recipient_user_id)
  where recipient_user_id is not null;
create index notification_logs_status_idx on public.notification_logs (status);
create index notification_logs_notification_type_idx
  on public.notification_logs (notification_type);
create index notification_logs_created_at_idx
  on public.notification_logs (created_at desc);

create table public.school_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  target_type public.school_event_target_type not null default 'school',
  grade_level_id uuid references public.grade_levels(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  status public.school_event_status not null default 'scheduled',
  created_by_user_id uuid not null references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_events_title_not_blank_chk check (btrim(title) <> ''),
  constraint school_events_time_order_chk check (starts_at < ends_at),
  constraint school_events_target_chk check (
    (target_type = 'school' and grade_level_id is null and class_id is null)
    or (target_type = 'grade_level' and grade_level_id is not null and class_id is null)
    or (target_type = 'class' and grade_level_id is null and class_id is not null)
  )
);

create index school_events_tenant_school_idx
  on public.school_events (tenant_id, school_id);
create index school_events_status_idx on public.school_events (status);
create index school_events_starts_at_idx on public.school_events (starts_at);
create index school_events_ends_at_idx on public.school_events (ends_at);
create index school_events_target_type_idx on public.school_events (target_type);

drop trigger if exists set_messages_updated_at on public.messages;
create trigger set_messages_updated_at
before update on public.messages
for each row execute function public.set_updated_at();

drop trigger if exists set_message_recipients_updated_at on public.message_recipients;
create trigger set_message_recipients_updated_at
before update on public.message_recipients
for each row execute function public.set_updated_at();

drop trigger if exists set_announcements_updated_at on public.announcements;
create trigger set_announcements_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

drop trigger if exists set_notification_logs_updated_at on public.notification_logs;
create trigger set_notification_logs_updated_at
before update on public.notification_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_school_events_updated_at on public.school_events;
create trigger set_school_events_updated_at
before update on public.school_events
for each row execute function public.set_updated_at();
