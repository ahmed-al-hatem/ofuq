create extension if not exists "pgcrypto";

set search_path = public, auth, extensions;

create or replace function public.demo_seed_uuid(seed text)
returns uuid
language sql
immutable
as $$
  select (
    substr(md5(seed), 1, 8) || '-' ||
    substr(md5(seed), 9, 4) || '-' ||
    '4' || substr(md5(seed), 14, 3) || '-' ||
    '8' || substr(md5(seed), 18, 3) || '-' ||
    substr(md5(seed), 21, 12)
  )::uuid
$$;
