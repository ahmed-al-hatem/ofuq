do $$
declare
  token_column text;
begin
  foreach token_column in array array[
    'confirmation_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'email_change',
    'phone_change_token',
    'phone_change',
    'reauthentication_token'
  ] loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'auth'
        and table_name = 'users'
        and column_name = token_column
    ) then
      execute format(
        'update auth.users set %I = coalesce(%I, '''') where email in (''admin@ofuq.local'', ''teacher@ofuq.local'')',
        token_column,
        token_column
      );
    end if;
  end loop;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'users'
      and column_name = 'confirmed_at'
  ) then
    update auth.users
    set confirmed_at = coalesce(confirmed_at, email_confirmed_at, now())
    where email in ('admin@ofuq.local', 'teacher@ofuq.local');
  end if;

  update auth.users
  set updated_at = now()
  where email in ('admin@ofuq.local', 'teacher@ofuq.local');
end $$;
