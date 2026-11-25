-- Move is_admin() out of the API-exposed public schema (Supabase security advisor 0028/0029).
-- RLS policies reference the function by OID, so they keep working after the move.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
alter function public.is_admin() set schema private;
revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
