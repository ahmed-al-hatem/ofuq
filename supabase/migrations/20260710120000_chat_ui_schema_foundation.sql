create extension if not exists "pgcrypto";

create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  type text not null default 'internal',
  subject text not null,
  status text not null default 'open',
  created_by_user_id uuid not null references public.user_profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  constraint chat_conversations_type_chk
    check (type in ('internal')),
  constraint chat_conversations_subject_not_blank_chk
    check (btrim(subject) <> ''),
  constraint chat_conversations_subject_length_chk
    check (char_length(subject) between 1 and 160),
  constraint chat_conversations_status_chk
    check (status in ('open', 'closed', 'archived')),
  constraint chat_conversations_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object')
);

create index chat_conversations_tenant_school_idx
  on public.chat_conversations (tenant_id, school_id);
create index chat_conversations_school_status_updated_idx
  on public.chat_conversations (school_id, status, updated_at desc);
create index chat_conversations_created_by_user_id_idx
  on public.chat_conversations (created_by_user_id);
create index chat_conversations_last_message_at_idx
  on public.chat_conversations (last_message_at desc);

comment on table public.chat_conversations is
  'Phase 25A chat foundation. Access remains enforced in application services until a later RLS phase.';

create table public.chat_participants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  role public.user_role not null,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  is_muted boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  constraint chat_participants_conversation_user_key
    unique (conversation_id, user_id),
  constraint chat_participants_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object')
);

create index chat_participants_user_school_idx
  on public.chat_participants (user_id, school_id);
create index chat_participants_conversation_id_idx
  on public.chat_participants (conversation_id);
create index chat_participants_tenant_school_idx
  on public.chat_participants (tenant_id, school_id);

comment on table public.chat_participants is
  'Phase 25A participant foundation. Participant scope must be derived from authenticated membership on the server.';

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_user_id uuid not null references public.user_profiles(id) on delete restrict,
  body text not null,
  message_type text not null default 'text',
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  constraint chat_messages_message_type_chk
    check (message_type in ('text', 'system')),
  constraint chat_messages_body_not_blank_chk
    check (btrim(body) <> ''),
  constraint chat_messages_body_length_chk
    check (char_length(body) between 1 and 4000),
  constraint chat_messages_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object')
);

create index chat_messages_conversation_created_idx
  on public.chat_messages (conversation_id, created_at asc);
create index chat_messages_sender_user_id_idx
  on public.chat_messages (sender_user_id);
create index chat_messages_tenant_school_created_idx
  on public.chat_messages (tenant_id, school_id, created_at desc);

comment on table public.chat_messages is
  'Phase 25A message history foundation. Real send/edit/delete flows are deferred to later phases.';

create table public.chat_message_reads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  constraint chat_message_reads_message_user_key
    unique (message_id, user_id)
);

create index chat_message_reads_user_read_idx
  on public.chat_message_reads (user_id, read_at desc);
create index chat_message_reads_message_id_idx
  on public.chat_message_reads (message_id);

comment on table public.chat_message_reads is
  'Phase 25A read-tracking foundation. Read-write workflows remain deferred and server-enforced.';

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  role public.user_role not null,
  title text not null default 'محادثة جديدة',
  scope text not null default 'role_scoped',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint ai_conversations_title_not_blank_chk
    check (btrim(title) <> ''),
  constraint ai_conversations_scope_chk
    check (scope in ('role_scoped')),
  constraint ai_conversations_status_chk
    check (status in ('active', 'archived')),
  constraint ai_conversations_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object')
);

create index ai_conversations_user_updated_idx
  on public.ai_conversations (user_id, updated_at desc);
create index ai_conversations_tenant_school_idx
  on public.ai_conversations (tenant_id, school_id);

comment on table public.ai_conversations is
  'Phase 25A AI conversation foundation. Future Gemini access must remain server-side and role scoped.';

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null,
  content text not null,
  model text,
  token_estimate integer,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint ai_messages_role_chk
    check (role in ('user', 'assistant', 'system')),
  constraint ai_messages_content_not_blank_chk
    check (btrim(content) <> ''),
  constraint ai_messages_content_length_chk
    check (char_length(content) between 1 and 8000),
  constraint ai_messages_token_estimate_chk
    check (token_estimate is null or token_estimate >= 0),
  constraint ai_messages_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object')
);

create index ai_messages_conversation_created_idx
  on public.ai_messages (conversation_id, created_at asc);
create index ai_messages_tenant_school_created_idx
  on public.ai_messages (tenant_id, school_id, created_at desc);

comment on table public.ai_messages is
  'Phase 25A AI message history foundation. No Gemini requests are executed in this phase.';

drop trigger if exists set_chat_conversations_updated_at on public.chat_conversations;
create trigger set_chat_conversations_updated_at
before update on public.chat_conversations
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_conversations_updated_at on public.ai_conversations;
create trigger set_ai_conversations_updated_at
before update on public.ai_conversations
for each row execute function public.set_updated_at();
