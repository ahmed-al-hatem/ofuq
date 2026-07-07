# Local Auth Smoke Troubleshooting

## Scope

This note documents a local Supabase Auth smoke-login issue found after Phase 07.5 and the fix that must be preserved in future phases.

This is local-development documentation only. It does not describe production credentials or hosted Supabase setup.

## Symptom

Local password sign-in reached Supabase Auth but failed with a generic application message.

The direct Auth request returned:

```txt
Database error querying schema
```

The Auth container log showed the real cause:

```txt
error finding user: sql: Scan error on column index 3, name "confirmation_token": converting NULL to string is unsupported
```

## Root Cause

The local smoke users were inserted directly into `auth.users` by seed data.

Some GoTrue token columns, especially `confirmation_token`, were left as `NULL`. The local GoTrue version scans these token fields as strings during password sign-in, so `NULL` caused a runtime scan error and sign-in returned HTTP 500.

A second issue appeared during the first fix attempt: `auth.users.confirmed_at` cannot be manually updated in the current local Auth schema and can only be updated to `DEFAULT`.

## Fix

The fix is split from the main seed file:

```txt
supabase/seeds/auth_smoke_token_defaults.sql
```

The file normalizes local smoke Auth token fields by converting `NULL` token strings to empty strings for the smoke users. It also ensures `email_confirmed_at` is set.

It must run after:

```txt
supabase/seed.sql
```

The order is configured in:

```txt
supabase/config.toml
```

Expected seed order:

```toml
sql_paths = ["./seed.sql", "./seeds/auth_smoke_token_defaults.sql"]
```

## Important Rules For Future Phases

When editing local smoke auth seeding:

1. Do not leave GoTrue token string fields as `NULL` for local smoke users.
2. Do not manually update `auth.users.confirmed_at`.
3. Use `email_confirmed_at` for local email-confirmed smoke users.
4. Keep the token-normalization seed file after the main seed file.
5. Run `supabase db reset` after seed changes.
6. Verify local sign-in through `/login` before treating authenticated workflow smoke as available.

## Validation

After the fix, `supabase db reset` should replay migrations and apply both seed files without errors.

Local sign-in should work for the smoke users created by the seed data.

If the same failure returns, inspect:

```bash
docker logs supabase_auth_ofuq --tail 200
```

If the log mentions `confirmation_token` or `converting NULL to string`, check that `supabase/seeds/auth_smoke_token_defaults.sql` exists and is listed after `./seed.sql` in `supabase/config.toml`.
