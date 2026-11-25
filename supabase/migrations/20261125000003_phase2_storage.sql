-- Phase 2: Storage bucket setup & RLS policies for datasheets, models and images.
-- Buckets are private (public = false); signed URLs or authenticated reads are required.
-- Admin checks reference private.is_admin() created in 20261125000002_harden_is_admin.sql.
-- Guarded on storage schema presence so bare Postgres / PGlite checks apply cleanly.

do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values
      ('datasheets', 'datasheets', false),
      ('models', 'models', false),
      ('images', 'images', false)
    on conflict (id) do nothing;
  end if;

  if to_regclass('storage.objects') is not null then
    drop policy if exists phase2_storage_authenticated_read on storage.objects;
    create policy phase2_storage_authenticated_read
      on storage.objects
      for select
      to authenticated
      using (bucket_id in ('datasheets', 'models', 'images'));

    drop policy if exists phase2_storage_admin_insert on storage.objects;
    create policy phase2_storage_admin_insert
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id in ('datasheets', 'models', 'images') and private.is_admin());

    drop policy if exists phase2_storage_admin_update on storage.objects;
    create policy phase2_storage_admin_update
      on storage.objects
      for update
      to authenticated
      using (bucket_id in ('datasheets', 'models', 'images') and private.is_admin())
      with check (bucket_id in ('datasheets', 'models', 'images') and private.is_admin());

    drop policy if exists phase2_storage_admin_delete on storage.objects;
    create policy phase2_storage_admin_delete
      on storage.objects
      for delete
      to authenticated
      using (bucket_id in ('datasheets', 'models', 'images') and private.is_admin());
  end if;
end
$$;
