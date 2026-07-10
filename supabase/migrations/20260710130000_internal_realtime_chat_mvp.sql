alter table public.chat_conversations
  drop constraint if exists chat_conversations_type_chk;

alter table public.chat_conversations
  add constraint chat_conversations_type_chk
  check (type in ('internal', 'school_office'));

create unique index if not exists chat_conversations_school_office_portal_owner_key
  on public.chat_conversations (tenant_id, school_id, ((metadata ->> 'portal_user_id')))
  where type = 'school_office' and metadata ? 'portal_user_id';

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end
$$;
