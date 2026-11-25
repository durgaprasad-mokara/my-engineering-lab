-- =====================================================================
-- My Engineering Lab — initial schema
-- Target: Supabase Postgres 15+
-- Conventions:
--   * uuid primary keys (gen_random_uuid())
--   * created_at / updated_at on every table, updated_at maintained by trigger
--   * user-owned rows carry owner_id -> auth.users(id), RLS: owner_id = auth.uid()
--   * reference (catalogue) rows readable by any signed-in user, writable by admins
--   * every technical value carries a verification_status and optional source_id
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.verification_status as enum
  ('verified', 'typical', 'estimated', 'user_provided', 'simulated', 'unverified');

create type public.project_status as enum
  ('planning', 'research', 'design', 'development', 'testing', 'completed');

create type public.project_kind as enum ('iot', 'robotics', 'iot_robotics', 'general');

create type public.diagram_kind as enum
  ('block', 'wiring', 'schematic', 'pcb_layout', 'architecture');

create type public.model_fidelity as enum ('illustrative', 'manufacturer_cad', 'none');

create type public.user_role as enum ('user', 'admin');

create type public.task_status as enum ('pending', 'completed', 'missed', 'rescheduled');

create type public.notification_channel as enum ('in_app', 'browser', 'email');

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Profiles & preferences
-- ---------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text check (char_length(display_name) <= 120),
  avatar_path   text,                          -- Supabase Storage path
  role          public.user_role not null default 'user',
  headline      text check (char_length(headline) <= 200),
  learning_goals text[] not null default '{}',
  skills        jsonb  not null default '{}'::jsonb, -- {"embedded": 3, "rf": 1, ...} 0-5 scale
  timezone      text   not null default 'UTC',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create table public.user_preferences (
  owner_id            uuid primary key references auth.users(id) on delete cascade,
  theme               text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  sidebar_collapsed   boolean not null default false,
  reminder_time       time,                    -- local time in profiles.timezone
  reminder_channels   public.notification_channel[] not null default '{in_app}',
  units_system        text not null default 'metric' check (units_system in ('metric', 'imperial')),
  region_code         text not null default 'IN' check (char_length(region_code) = 2),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Create profile + preferences on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  insert into public.user_preferences (owner_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Sources (provenance)
-- ---------------------------------------------------------------------
create table public.sources (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  publisher     text,                          -- e.g. "Texas Instruments"
  url           text not null check (url ~* '^https?://'),
  document_rev  text,                          -- datasheet revision, e.g. "Rev. F"
  retrieved_at  date not null default current_date,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Component catalogue
-- ---------------------------------------------------------------------
create table public.component_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  parent_id   uuid references public.component_categories(id) on delete restrict,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index component_categories_parent_idx on public.component_categories(parent_id);

create table public.components (
  id                  uuid primary key default gen_random_uuid(),
  category_id         uuid not null references public.component_categories(id) on delete restrict,
  slug                text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name                text not null,
  manufacturer        text,
  part_number         text,
  package             text,
  description         text,
  operating_principle text,
  internal_structure  text,
  pinout              jsonb not null default '[]'::jsonb,   -- [{pin, name, function}]
  ratings             jsonb not null default '{}'::jsonb,   -- {voltage:{min,max,unit,status,source_id}, ...}
  interfaces          text[] not null default '{}',
  applications        text[] not null default '{}',
  advantages          text[] not null default '{}',
  limitations         text[] not null default '{}',
  image_path          text,
  model_path          text,                                 -- Storage path to glTF
  model_fidelity      public.model_fidelity not null default 'none',
  verification_status public.verification_status not null default 'unverified',
  source_id           uuid references public.sources(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index components_category_idx on public.components(category_id);
create index components_part_number_idx on public.components(part_number);
create index components_search_idx on public.components
  using gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(part_number,'') || ' ' || coalesce(description,'')));

create table public.component_alternatives (
  component_id    uuid not null references public.components(id) on delete cascade,
  alternative_id  uuid not null references public.components(id) on delete cascade,
  relation        text not null default 'alternative' check (relation in ('alternative', 'compatible')),
  notes           text,
  created_at      timestamptz not null default now(),
  primary key (component_id, alternative_id, relation),
  check (component_id <> alternative_id)
);

create table public.component_datasheets (
  id            uuid primary key default gen_random_uuid(),
  component_id  uuid not null references public.components(id) on delete cascade,
  source_id     uuid not null references public.sources(id) on delete restrict,
  file_path     text,                          -- Storage path if mirrored (respect licence)
  language      text not null default 'en',
  is_primary    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index component_datasheets_component_idx on public.component_datasheets(component_id);
create unique index component_datasheets_one_primary on public.component_datasheets(component_id) where is_primary;

-- ---------------------------------------------------------------------
-- Sensors
-- ---------------------------------------------------------------------
create table public.sensors (
  id                    uuid primary key default gen_random_uuid(),
  component_id          uuid unique references public.components(id) on delete set null,
  slug                  text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name                  text not null,
  sensor_group          text not null check (sensor_group in
                          ('distance_detection','environmental','motion','industrial','water','navigation')),
  measurand             text not null,           -- e.g. "flow", "distance"
  measurement_principle text,
  how_it_works          text,
  internal_construction text,
  output_type           text check (output_type in ('analog','digital','pulse','frequency','current_loop')),
  protocols             text[] not null default '{}',
  calibration_procedure text,
  environmental_limits  text,
  applications          text[] not null default '{}',
  advantages            text[] not null default '{}',
  disadvantages         text[] not null default '{}',
  verification_status   public.verification_status not null default 'unverified',
  source_id             uuid references public.sources(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index sensors_group_idx on public.sensors(sensor_group);

-- One row per numeric spec so each value has its own provenance
create table public.sensor_specifications (
  id                  uuid primary key default gen_random_uuid(),
  sensor_id           uuid not null references public.sensors(id) on delete cascade,
  key                 text not null,             -- 'range','accuracy','resolution','response_time','supply_voltage','current'
  min_value           numeric,
  typ_value           numeric,
  max_value           numeric,
  unit                text not null,
  conditions          text,                      -- test conditions from datasheet
  verification_status public.verification_status not null default 'unverified',
  source_id           uuid references public.sources(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (sensor_id, key, conditions)
);
create index sensor_specifications_sensor_idx on public.sensor_specifications(sensor_id);

-- ---------------------------------------------------------------------
-- Microcontrollers, communication modules, antennas
-- ---------------------------------------------------------------------
create table public.microcontrollers (
  id                  uuid primary key default gen_random_uuid(),
  component_id        uuid unique references public.components(id) on delete set null,
  slug                text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name                text not null,
  vendor              text not null,
  architecture        text,                      -- e.g. 'Xtensa LX6', 'ARM Cortex-M4F'
  cpu                 text,
  max_clock_mhz       numeric check (max_clock_mhz > 0),
  flash_kb            numeric,
  ram_kb              numeric,
  gpio_count          int,
  adc                 jsonb not null default '{}'::jsonb,  -- {channels, bits}
  dac                 jsonb not null default '{}'::jsonb,
  peripherals         jsonb not null default '{}'::jsonb,  -- {uart:3, spi:4, i2c:2, can:1, usb:'FS'}
  wireless            text[] not null default '{}',
  power               jsonb not null default '{}'::jsonb,  -- {active_ma, deep_sleep_ua, status, source_id}
  dev_tools           text[] not null default '{}',
  languages           text[] not null default '{}',
  applications        text[] not null default '{}',
  verification_status public.verification_status not null default 'unverified',
  source_id           uuid references public.sources(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.communication_modules (
  id                  uuid primary key default gen_random_uuid(),
  component_id        uuid unique references public.components(id) on delete set null,
  slug                text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name                text not null,
  manufacturer        text,
  technology          text not null,             -- 'LTE Cat 1', 'LTE-M', 'NB-IoT', 'LoRaWAN', 'Wi-Fi', ...
  bands               text[] not null default '{}',
  interfaces          text[] not null default '{}',
  certifications      text[] not null default '{}',
  specs               jsonb not null default '{}'::jsonb,  -- data rate, tx power, sleep current (each with status)
  verification_status public.verification_status not null default 'unverified',
  source_id           uuid references public.sources(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index communication_modules_technology_idx on public.communication_modules(technology);

create table public.antennas (
  id                  uuid primary key default gen_random_uuid(),
  component_id        uuid unique references public.components(id) on delete set null,
  slug                text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name                text not null,
  antenna_type        text not null,             -- dipole, monopole, patch, pcb, fpc, ceramic, yagi, helical
  services            text[] not null default '{}', -- 'LTE','5G NR','LoRa','GNSS','Wi-Fi','BLE'
  freq_min_mhz        numeric,
  freq_max_mhz        numeric,
  peak_gain_dbi       numeric,
  impedance_ohm       numeric default 50,
  vswr_max            numeric,
  polarization        text,
  connector           text,
  cable               text,
  ground_plane        text,
  pattern_data        jsonb,                     -- sampled radiation pattern for visualisation
  verification_status public.verification_status not null default 'unverified',
  source_id           uuid references public.sources(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (freq_max_mhz is null or freq_min_mhz is null or freq_max_mhz >= freq_min_mhz)
);

-- ---------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------
create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 160),
  description   text,
  kind          public.project_kind not null default 'iot',
  industry      text,                            -- water, energy, railway, industrial, agriculture, smart_city
  status        public.project_status not null default 'planning',
  is_archived   boolean not null default false,
  is_reference  boolean not null default false,  -- shipped reference project template
  safety_critical boolean not null default false,
  architecture  jsonb not null default '{}'::jsonb,
  version       int not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index projects_owner_idx on public.projects(owner_id, updated_at desc);

create table public.project_versions (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  version     int not null,
  snapshot    jsonb not null,
  note        text,
  created_at  timestamptz not null default now(),
  unique (project_id, version)
);

create table public.project_requirements (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('customer','functional','non_functional','constraint')),
  code        text,                              -- e.g. FR-01
  statement   text not null,
  priority    text not null default 'should' check (priority in ('must','should','could','wont')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index project_requirements_project_idx on public.project_requirements(project_id);

create table public.hardware_configurations (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references public.projects(id) on delete cascade,
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name          text not null,
  rank          int check (rank between 1 and 5),
  is_selected   boolean not null default false,
  summary       text,
  scores        jsonb not null default '{}'::jsonb, -- {cost, compatibility, performance, power, ...} with rationale
  est_cost      numeric(12,2),
  currency      char(3) default 'INR',
  battery_life_days numeric,
  assumptions   text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index hardware_configurations_project_idx on public.hardware_configurations(project_id);
create unique index hardware_configurations_one_selected
  on public.hardware_configurations(project_id) where is_selected;

create table public.project_components (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  component_id  uuid references public.components(id) on delete set null,
  role          text,                            -- 'flow sensor', 'MCU', 'modem'
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index project_components_project_idx on public.project_components(project_id);

create table public.bom_items (
  id                  uuid primary key default gen_random_uuid(),
  configuration_id    uuid not null references public.hardware_configurations(id) on delete cascade,
  owner_id            uuid not null default auth.uid() references auth.users(id) on delete cascade,
  component_id        uuid references public.components(id) on delete set null,
  designator          text,                      -- R1, U3
  description         text not null,
  manufacturer        text,
  part_number         text,
  quantity            numeric not null default 1 check (quantity > 0),
  unit_price          numeric(12,4),
  currency            char(3) default 'INR',
  availability        text,
  price_retrieved_at  date,
  datasheet_source_id uuid references public.sources(id) on delete set null,
  verification_status public.verification_status not null default 'unverified',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index bom_items_configuration_idx on public.bom_items(configuration_id);

create table public.circuit_diagrams (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references public.projects(id) on delete cascade,
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name          text not null,
  kind          public.diagram_kind not null,
  graph         jsonb not null default '{"nodes":[],"edges":[]}'::jsonb,
  validation    jsonb,                           -- last rule-check results; never implies simulation
  is_simulated  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index circuit_diagrams_owner_idx on public.circuit_diagrams(owner_id, updated_at desc);

create table public.saved_designs (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id    uuid references public.projects(id) on delete set null,
  name          text not null,
  design_type   text not null check (design_type in ('configuration','diagram','pcb','architecture','model')),
  ref_id        uuid,                            -- id in the table implied by design_type
  thumbnail_path text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index saved_designs_owner_idx on public.saved_designs(owner_id, updated_at desc);

-- ---------------------------------------------------------------------
-- Firmware
-- ---------------------------------------------------------------------
create table public.firmware_projects (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id    uuid references public.projects(id) on delete set null,
  configuration_id uuid references public.hardware_configurations(id) on delete set null,
  name          text not null,
  target        text not null,                   -- 'esp32', 'stm32', 'rp2040', ...
  framework     text not null,                   -- 'arduino', 'esp-idf', 'zephyr', 'micropython', 'platformio'
  build_status  text not null default 'untested' check (build_status in ('untested','compiled','failed','hardware_tested')),
  last_build_log text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.firmware_files (
  id            uuid primary key default gen_random_uuid(),
  firmware_id   uuid not null references public.firmware_projects(id) on delete cascade,
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  path          text not null,                   -- 'src/main.cpp'
  content       text not null default '' check (octet_length(content) <= 512000),
  version       int not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (firmware_id, path)
);

create table public.firmware_file_versions (
  id          uuid primary key default gen_random_uuid(),
  file_id     uuid not null references public.firmware_files(id) on delete cascade,
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  version     int not null,
  content     text not null,
  created_at  timestamptz not null default now(),
  unique (file_id, version)
);

-- ---------------------------------------------------------------------
-- Calculations & experiments
-- ---------------------------------------------------------------------
create table public.engineering_calculations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id    uuid references public.projects(id) on delete set null,
  calculator    text not null,                   -- 'ohms_law', 'battery_runtime', 'link_budget', ...
  inputs        jsonb not null,
  outputs       jsonb not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index engineering_calculations_owner_idx on public.engineering_calculations(owner_id, created_at desc);

create table public.experiments (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id    uuid references public.projects(id) on delete set null,
  title         text not null,
  objective     text,
  procedure     text,
  results       text,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index experiments_owner_idx on public.experiments(owner_id, completed_at);

-- ---------------------------------------------------------------------
-- Learning
-- ---------------------------------------------------------------------
create table public.learning_paths (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  month_number  int check (month_number between 1 and 12),
  day_number    int check (day_number between 1 and 366),
  objective     text,
  content       jsonb not null default '{}'::jsonb,  -- theory, components, exercise, coding, calculation, quiz, milestone
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (month_number, day_number)
);

create table public.learning_progress (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  completed_at  timestamptz,
  quiz_score    numeric check (quiz_score between 0 and 100),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (owner_id, learning_path_id)
);

create table public.daily_tasks (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id    uuid references public.projects(id) on delete set null,
  learning_path_id uuid references public.learning_paths(id) on delete set null,
  title         text not null check (char_length(title) between 1 and 200),
  due_date      date not null,
  due_time      time,
  status        public.task_status not null default 'pending',
  completed_at  timestamptz,
  rescheduled_from date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index daily_tasks_owner_due_idx on public.daily_tasks(owner_id, due_date);

create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title         text not null,
  body          text,
  link          text,
  channel       public.notification_channel not null default 'in_app',
  scheduled_for timestamptz,
  sent_at       timestamptz,
  read_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index notifications_owner_unread_idx on public.notifications(owner_id) where read_at is null;
create index notifications_schedule_idx on public.notifications(scheduled_for) where sent_at is null;

-- ---------------------------------------------------------------------
-- Documentation, AI, telemetry, activity
-- ---------------------------------------------------------------------
create table public.documentation (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id    uuid references public.projects(id) on delete cascade,
  title         text not null,
  body_md       text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.ai_conversations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id    uuid references public.projects(id) on delete set null,
  title         text,
  messages      jsonb not null default '[]'::jsonb, -- [{role, content, citations, created_at}]
  model         text,
  input_tokens  int not null default 0,
  output_tokens int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index ai_conversations_owner_idx on public.ai_conversations(owner_id, updated_at desc);

create table public.telemetry_devices (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id    uuid references public.projects(id) on delete set null,
  name          text not null,
  device_uid    text not null,                   -- IMEI / DevEUI / serial
  transport     text not null check (transport in ('mqtt','http','lorawan','coap')),
  payload_schema jsonb,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (owner_id, device_uid)
);

create table public.telemetry_data (
  id            bigint generated always as identity primary key,
  device_id     uuid not null references public.telemetry_devices(id) on delete cascade,
  owner_id      uuid not null references auth.users(id) on delete cascade,
  recorded_at   timestamptz not null,
  metric        text not null,
  value         double precision,
  payload       jsonb,
  created_at    timestamptz not null default now()
);
create index telemetry_data_device_time_idx on public.telemetry_data(device_id, recorded_at desc);

create table public.component_views (
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  component_id  uuid not null references public.components(id) on delete cascade,
  viewed_at     timestamptz not null default now(),
  primary key (owner_id, component_id)
);
create index component_views_recent_idx on public.component_views(owner_id, viewed_at desc);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','user_preferences','sources','component_categories','components','component_datasheets',
    'sensors','sensor_specifications','microcontrollers','communication_modules','antennas',
    'projects','project_requirements','hardware_configurations','project_components','bom_items',
    'circuit_diagrams','saved_designs','firmware_projects','firmware_files','engineering_calculations',
    'experiments','learning_paths','learning_progress','daily_tasks','notifications','documentation',
    'ai_conversations','telemetry_devices'
  ] loop
    execute format('create trigger %I_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

-- Reference / catalogue tables: read for signed-in users, write for admins
do $$
declare t text;
begin
  foreach t in array array[
    'sources','component_categories','components','component_alternatives','component_datasheets',
    'sensors','sensor_specifications','microcontrollers','communication_modules','antennas','learning_paths'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to authenticated using (true)', t || '_read', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t || '_admin_write', t);
  end loop;
end $$;

-- Profiles: a user reads/updates only their own row; role cannot be self-escalated
alter table public.profiles enable row level security;
create policy profiles_self_select on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

-- Owner-scoped tables
do $$
declare t text;
begin
  foreach t in array array[
    'user_preferences','projects','project_versions','project_requirements','hardware_configurations',
    'project_components','bom_items','circuit_diagrams','saved_designs','firmware_projects','firmware_files',
    'firmware_file_versions','engineering_calculations','experiments','learning_progress','daily_tasks',
    'notifications','documentation','ai_conversations','telemetry_devices','telemetry_data','component_views'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all to authenticated
                    using (owner_id = auth.uid()) with check (owner_id = auth.uid())', t || '_owner', t);
  end loop;
end $$;

-- Child rows must point at a parent the same user owns
create or replace function public.assert_parent_owner()
returns trigger language plpgsql security definer set search_path = public as $$
declare parent_owner uuid;
begin
  if tg_table_name in ('project_requirements','project_components','project_versions') then
    select owner_id into parent_owner from public.projects where id = new.project_id;
  elsif tg_table_name = 'hardware_configurations' and new.project_id is not null then
    select owner_id into parent_owner from public.projects where id = new.project_id;
  elsif tg_table_name = 'bom_items' then
    select owner_id into parent_owner from public.hardware_configurations where id = new.configuration_id;
  elsif tg_table_name = 'firmware_files' then
    select owner_id into parent_owner from public.firmware_projects where id = new.firmware_id;
  elsif tg_table_name = 'telemetry_data' then
    select owner_id into parent_owner from public.telemetry_devices where id = new.device_id;
  else
    return new;
  end if;
  if parent_owner is distinct from new.owner_id then
    raise exception 'owner mismatch on %', tg_table_name using errcode = '42501';
  end if;
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'project_requirements','project_components','project_versions','hardware_configurations',
    'bom_items','firmware_files','telemetry_data'
  ] loop
    execute format('create trigger %I_parent_owner before insert or update on public.%I
                    for each row execute function public.assert_parent_owner()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Dashboard statistics (single round-trip, respects RLS via security invoker)
-- ---------------------------------------------------------------------
create or replace function public.dashboard_stats()
returns jsonb language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'components',              (select count(*) from public.components),
    'sensors',                 (select count(*) from public.sensors),
    'microcontrollers',        (select count(*) from public.microcontrollers),
    'communication_modules',   (select count(*) from public.communication_modules),
    'antenna_types',           (select count(distinct antenna_type) from public.antennas),
    'iot_projects',            (select count(*) from public.projects where kind in ('iot','iot_robotics') and not is_archived),
    'robotics_projects',       (select count(*) from public.projects where kind in ('robotics','iot_robotics') and not is_archived),
    'saved_configurations',    (select count(*) from public.hardware_configurations),
    'completed_experiments',   (select count(*) from public.experiments where completed_at is not null),
    'learning_completed_days', (select count(*) from public.learning_progress where completed_at is not null),
    'learning_total_days',     (select count(*) from public.learning_paths)
  );
$$;

revoke execute on function public.dashboard_stats() from public, anon;
grant execute on function public.dashboard_stats() to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.assert_parent_owner() from public, anon, authenticated;
