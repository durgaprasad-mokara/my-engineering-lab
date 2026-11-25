# Database Schema

Source of truth: `supabase/migrations/20261125000001_init.sql`. Seed: `supabase/seed.sql` (component taxonomy only — no technical values).

## 1. Conventions
- `uuid` primary keys via `gen_random_uuid()`; `telemetry_data` uses `bigint identity` for insert throughput.
- `created_at`, `updated_at` (`timestamptz`) on every table; `updated_at` maintained by the `set_updated_at` trigger.
- User data carries `owner_id uuid not null default auth.uid()`.
- Technical values carry `verification_status` (`verified | typical | estimated | user_provided | simulated | unverified`) and `source_id → sources`.
- Large binaries (datasheets, glTF models, images, firmware archives) live in Supabase Storage; tables store the path only.

## 2. Entity overview

```
auth.users ─┬─ profiles (1:1, trigger-created)
            ├─ user_preferences (1:1, trigger-created)
            ├─ projects ─┬─ project_requirements
            │            ├─ project_components ── components
            │            ├─ project_versions
            │            ├─ hardware_configurations ── bom_items ── components / sources
            │            ├─ circuit_diagrams
            │            ├─ documentation
            │            └─ telemetry_devices ── telemetry_data
            ├─ saved_designs, firmware_projects ── firmware_files ── firmware_file_versions
            ├─ engineering_calculations, experiments
            ├─ learning_progress ── learning_paths
            ├─ daily_tasks, notifications, ai_conversations, component_views

Catalogue (shared, admin-maintained):
sources · component_categories (tree) · components · component_alternatives · component_datasheets
sensors ── sensor_specifications · microcontrollers · communication_modules · antennas · learning_paths
```

## 3. Tables

### Catalogue
| Table | Purpose | Key columns |
|---|---|---|
| `sources` | Provenance for any value | `url`, `publisher`, `document_rev`, `retrieved_at` |
| `component_categories` | Hierarchical taxonomy | `slug` (unique), `parent_id` |
| `components` | Every part | `part_number`, `pinout jsonb`, `ratings jsonb` (each rating `{min,typ,max,unit,status,source_id}`), `model_fidelity` |
| `component_alternatives` | Alternatives / compatibles | composite PK, self-reference check |
| `component_datasheets` | Datasheet links | one `is_primary` per component (partial unique index) |
| `sensors` | Sensor knowledge (21 attributes) | `sensor_group`, `measurand`, `output_type`, `protocols[]` |
| `sensor_specifications` | One numeric spec per row with own provenance | `key`, `min/typ/max`, `unit`, `conditions` |
| `microcontrollers` | Boards / SoCs | `architecture`, clocks, memory, `peripherals jsonb`, `power jsonb` |
| `communication_modules` | Modems, radios | `technology`, `bands[]`, `certifications[]` |
| `antennas` | Antennas | frequency range check, `peak_gain_dbi`, `vswr_max`, `pattern_data jsonb` |
| `learning_paths` | 365-day curriculum entries | unique `(month_number, day_number)` |

### User data
| Table | Purpose |
|---|---|
| `profiles` | Display name, role, goals, skills (0–5 per domain), time zone |
| `user_preferences` | Theme, sidebar state, reminder time + channels, units, region (default `IN`) |
| `projects` | Name, kind (`iot/robotics/iot_robotics/general`), industry, status lifecycle, `safety_critical`, archive flag, version |
| `project_versions` | Immutable JSON snapshots |
| `project_requirements` | Customer / functional / non-functional / constraint, MoSCoW priority |
| `hardware_configurations` | Up to five ranked configurations per project; one `is_selected` (partial unique) |
| `bom_items` | BOM lines with price date and verification status |
| `circuit_diagrams` | React Flow graph, `kind` (block/wiring/schematic/pcb_layout/architecture), `is_simulated` |
| `saved_designs` | Index of saved artefacts for the dashboard |
| `firmware_projects` / `firmware_files` / `firmware_file_versions` | Code Lab, `build_status` defaults to `untested` |
| `engineering_calculations` | Saved calculator runs |
| `experiments` | Lab experiments (drives "completed experiments" stat) |
| `learning_progress`, `daily_tasks`, `notifications` | Learning & calendar |
| `documentation` | Markdown docs per project |
| `ai_conversations` | Claude chat history + token usage |
| `telemetry_devices`, `telemetry_data` | Device registry and time-series |
| `component_views` | "Recently viewed" |

## 4. Security (RLS)
- **Catalogue tables:** `select` for `authenticated`; all writes require `public.is_admin()`.
- **Profiles:** user can read/update only their own row; the update policy forbids changing `role`.
- **Owner tables:** single `for all` policy `owner_id = auth.uid()` for both `using` and `with check`.
- **Parent ownership:** `assert_parent_owner()` trigger blocks child rows that reference another user's parent (e.g. a requirement on someone else's project).
- `dashboard_stats()` is `security invoker`, so counts respect RLS.

Verified locally against an embedded Postgres (PGlite) with stubbed `auth` schema:
- user B cannot see user A's project;
- cross-owner child insert is rejected;
- self-promotion to `admin` is rejected;
- non-admin catalogue writes are rejected.

## 5. Indexes
Ownership + recency indexes on every list view (`(owner_id, updated_at desc)`), FK indexes on child tables, GIN full-text index on components, partial indexes for unread notifications and pending scheduled notifications, `(device_id, recorded_at desc)` on telemetry.

## 6. Planned migrations
| Phase | Migration |
|---|---|
| 2 | Storage buckets `datasheets`, `models`, `images` with policies; catalogue seed with sourced data |
| 10 | `pgvector` extension, `document_chunks(embedding vector(1024))`, `ai_rate_limits` |
| 11 | Monthly partitioning of `telemetry_data`; device credentials table |
| 12 | `pg_cron` job for scheduled notifications |

## 7. Applying
```bash
supabase link --project-ref <ref>
supabase db push            # applies migrations
psql "$DATABASE_URL" -f supabase/seed.sql
```
