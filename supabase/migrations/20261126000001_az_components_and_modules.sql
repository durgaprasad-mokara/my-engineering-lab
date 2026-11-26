-- =====================================================================
-- Master Addition: Extended A-Z Component Tables & Advanced Modules
-- Target: Supabase Postgres 15+
-- =====================================================================

-- 1. Manufacturers registry
create table if not exists public.component_manufacturers (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  website_url text,
  country     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. Component images (supports main photo, alternatives, pinout, circuit, package)
create table if not exists public.component_images (
  id              uuid primary key default gen_random_uuid(),
  component_id    uuid not null references public.components(id) on delete cascade,
  image_role      text not null check (image_role in ('main', 'alternative', 'pinout', 'circuit', 'package', 'manufacturer')),
  storage_path    text,
  source_url      text,
  attribution     text,
  license         text,
  is_illustrative boolean not null default false,
  alt_text        text not null,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists component_images_comp_idx on public.component_images(component_id, sort_order);

-- 3. Component pinouts (normalized per-pin table)
create table if not exists public.component_pinouts (
  id           uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.components(id) on delete cascade,
  pin_number   text not null,
  pin_name     text not null,
  signal_type  text not null default 'gpio',
  voltage_spec text,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists component_pinouts_comp_idx on public.component_pinouts(component_id);

-- 4. Component specifications (normalized spec table with provenance)
create table if not exists public.component_specifications (
  id                  uuid primary key default gen_random_uuid(),
  component_id        uuid not null references public.components(id) on delete cascade,
  spec_key            text not null,
  spec_label          text not null,
  spec_value          text not null,
  unit                text,
  verification_status public.verification_status not null default 'unverified',
  source_id           uuid references public.sources(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists component_specs_comp_idx on public.component_specifications(component_id);

-- 5. Component compatibility (MCU / Sensor / Module cross-compatibility)
create table if not exists public.component_compatibility (
  id                    uuid primary key default gen_random_uuid(),
  component_id          uuid not null references public.components(id) on delete cascade,
  compatible_with_slug  text not null,
  compatible_with_name  text not null,
  compatibility_kind    text not null check (compatibility_kind in ('microcontroller', 'sensor', 'module')),
  interface_used        text,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists component_compat_comp_idx on public.component_compatibility(component_id);

-- 6. Component documents (app notes, reference manuals, CAD)
create table if not exists public.component_documents (
  id           uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.components(id) on delete cascade,
  doc_type     text not null check (doc_type in ('datasheet', 'app_note', 'reference_manual', 'errata', 'cad')),
  title        text not null,
  url          text,
  storage_path text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists component_docs_comp_idx on public.component_documents(component_id);

-- 7. Component engineering reviews / notes (user-owned)
create table if not exists public.component_reviews (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  component_id uuid not null references public.components(id) on delete cascade,
  rating       int check (rating between 1 and 5),
  notes        text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists component_reviews_owner_idx on public.component_reviews(owner_id, component_id);

-- 8. Component favorites (user-owned)
create table if not exists public.component_favorites (
  owner_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  component_id uuid not null references public.components(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (owner_id, component_id)
);

-- 9. Component comparisons (user-owned)
create table if not exists public.component_comparisons (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title           text not null,
  component_slugs text[] not null default '{}',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 10. Advanced module persistence: AI Hardware Research & Cost Estimates
create table if not exists public.hardware_research_reports (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  query       text not null,
  report_json jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.prototype_cost_estimates (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title       text not null,
  batch_size  int not null default 10,
  items_json  jsonb not null default '[]'::jsonb,
  total_usd   numeric,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Enable RLS on all new tables
alter table public.component_manufacturers enable row level security;
alter table public.component_images enable row level security;
alter table public.component_pinouts enable row level security;
alter table public.component_specifications enable row level security;
alter table public.component_compatibility enable row level security;
alter table public.component_documents enable row level security;
alter table public.component_reviews enable row level security;
alter table public.component_favorites enable row level security;
alter table public.component_comparisons enable row level security;
alter table public.hardware_research_reports enable row level security;
alter table public.prototype_cost_estimates enable row level security;

-- Catalogue tables: authenticated read, admin write
do $$
declare
  t text;
begin
  foreach t in array array[
    'component_manufacturers',
    'component_images',
    'component_pinouts',
    'component_specifications',
    'component_compatibility',
    'component_documents'
  ] loop
    execute format('drop policy if exists "%s_select_auth" on public.%I', t, t);
    execute format('create policy "%s_select_auth" on public.%I for select to authenticated using (true)', t, t);
    execute format('drop policy if exists "%s_admin_all" on public.%I', t, t);
    execute format('create policy "%s_admin_all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- User-owned tables: strict owner_id = auth.uid()
do $$
declare
  t text;
begin
  foreach t in array array[
    'component_reviews',
    'component_favorites',
    'component_comparisons',
    'hardware_research_reports',
    'prototype_cost_estimates'
  ] loop
    execute format('drop policy if exists "%s_owner_all" on public.%I', t, t);
    execute format('create policy "%s_owner_all" on public.%I for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid())', t, t);
  end loop;
end $$;

