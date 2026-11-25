# My Engineering Lab — Product Requirements Document

| Field | Value |
|---|---|
| Product | My Engineering Lab |
| Document | PRD v1.0 |
| Status | Approved for Phase 1 |
| Owner | Platform owner (single user, personal R&D) |
| Last updated | 2026-11-25 |

---

## 1. Purpose

My Engineering Lab is a personal, AI-assisted engineering workspace covering electronics, embedded systems, IoT, robotics, communications, antennas, PCB design, cloud telemetry and industrial applications. A user should be able to describe a requirement in plain language ("smart water meter over 4G") and work it through to a documented, testable design: requirements, component selection, five alternative configurations, BOM, schematics, power budget, firmware, cloud integration and test plan.

The product is a **workspace**, not a brochure site. Every feature must either do real work against real data or be clearly labelled as not yet implemented.

## 2. Users

| Persona | Description | Primary needs |
|---|---|---|
| Owner (primary) | Engineer and learner building personal R&D projects | Learn deeply, design real devices, keep everything in one place |
| Future collaborator (later) | Invited reviewer of a project | Read-only access to a shared project |

The data model is multi-user from day one (every user-owned row has `owner_id` and Row Level Security), even though the first release serves one person.

## 3. Product principles

1. **Engineering accuracy over visuals.** No fabricated specifications, statistics, prices or claims.
2. **Provenance on every value.** Each technical value carries a verification status: `verified`, `typical`, `estimated`, `user_provided`, `simulated`.
3. **Honest functionality.** A feature is only "complete" when it works end-to-end. Unbuilt features say so, with the phase that delivers them.
4. **Explain the why.** Recommendations always include reasoning, alternatives, trade-offs and assumptions.
5. **Safety boundaries.** Railway, bridge, grid and other safety-critical work is labelled research/education unless independently validated by qualified engineers.
6. **Incremental delivery.** Thirteen phases; each one is tested and reported before the next begins.

## 4. Scope — functional requirements

Requirement IDs are referenced by the roadmap and test plans.

### 4.1 Platform shell (Phase 1)
- **FR-SH-01** Collapsible left sidebar with all 26 sections, grouped; collapses to icons on desktop and becomes a drawer on mobile.
- **FR-SH-02** Top bar with global search (keyboard shortcut `Ctrl/⌘ K`), notifications, AI assistant entry point and profile menu.
- **FR-SH-03** Breadcrumbs derived from the route.
- **FR-SH-04** Responsive layouts at 360 px, 768 px, 1280 px and wider.
- **FR-SH-05** Every navigation item opens a real route. Routes for later phases show an honest status page (planned scope, phase, dependencies) — never a fake feature.

### 4.2 Authentication & profile (Phase 1)
- **FR-AU-01** Email + password sign-up, sign-in, sign-out via Supabase Auth.
- **FR-AU-02** Protected routes enforced in middleware; unauthenticated users go to `/login`.
- **FR-AU-03** A `profiles` row is created automatically on sign-up (database trigger).
- **FR-AU-04** **Demo mode**: when Supabase environment variables are absent, the app runs without auth and every data surface is labelled *Demo data*.

### 4.3 Dashboard (Phase 1)
- **FR-DB-01** Ten statistics: components, sensors, microcontrollers, communication modules, antenna types, IoT projects, robotics projects, saved configurations, completed experiments, learning progress. Values are live database counts, or labelled demo data.
- **FR-DB-02** Widgets: 3D telemetry device (illustrative model, labelled as such), sensor-to-cloud architecture, recent projects, five-configuration comparison, engineering measurements chart, quick calculators, learning calendar, today's tasks, AI recommendations, recently viewed components, saved designs.
- **FR-DB-03** Each widget shows a data-source badge (`Live`, `Demo data`, `Illustrative`).

### 4.4 Knowledge base (Phases 2–3)
- Components library (passive, semiconductor, ICs, power, connectors) with full attribute set listed in master spec §4.
- Sensor library with 21 attributes per sensor and five-way comparison.
- Microcontroller/processor library with board selector.
- Communication technology library (cellular, LPWAN, wired, application protocols) with comparison engine and application suitability.
- Antenna library with radiation-pattern visualisation.
- Every record links to a manufacturer datasheet and stores source URL, retrieval date and verification status.

### 4.5 3D engineering (Phase 4)
- React Three Fiber viewer: orbit, zoom, pan, select, pin inspection, labels, exploded view, 3D/2D toggle; seven view modes.
- Models flagged `illustrative` vs `manufacturer_cad`.

### 4.6 Design tools (Phase 5)
- Hardware configuration engine generating five configurations against a requirement, compared on ten criteria.
- Editable BOM with part numbers, manufacturers, datasheet references, prices and availability when reliable; unverified fields flagged.
- Circuit/hardware designer (React Flow) distinguishing block diagram, wiring diagram, schematic, PCB layout; rule checks for voltage, current and pin compatibility. Never claims electrical validation without a simulation.

### 4.7 Calculators (Phase 6)
- Mechanical, electrical, fluid, communication and battery calculators. Each shows formula, variables, units, inputs, steps, result, assumptions and limitations. Pure functions with unit tests.

### 4.8 Projects (Phases 7–8)
- IoT project builder with 22-section engineering workflow and categories (water, energy, railway, industrial, agriculture, smart city).
- Reference projects: Smart Water Meter, Railway Track Monitoring, Railway Bridge Load Monitoring (research prototype labels and safety disclaimers mandatory).
- Robotics workspace and IoT + Robotics integration (ROS 2, MQTT).
- Project management: create, edit, duplicate, archive, export; status lifecycle Planning → Research → Design → Development → Testing → Completed; version history.

### 4.9 Embedded Code Lab (Phase 9)
- Monaco editor, file tree, copy/download, version history.
- Template- and AI-generated firmware matching selected hardware. Status shows `untested` unless a real compile has run.

### 4.10 AI Engineering Assistant (Phase 10)
- Claude via server-side API route only; structured tool calls into the knowledge base (RAG over datasheets and records).
- Follows the 20-step requirement workflow and the interaction rules in master spec §21 (facts vs assumptions, cite datasheets, ask clarifying questions, warn on incompatibilities).

### 4.11 Gateway & cloud (Phase 11)
- Device registration, MQTT topic design, gateway architectures, telemetry ingestion into `telemetry_data`, dashboards and alerts.

### 4.12 Learning (Phase 12)
- 365-day roadmap (12 months), daily lesson structure, progress tracking, calendar with scheduling and rescheduling, reminders.
- Notifications: in-app always; browser push with permission; email/scheduled delivery for when the app is closed. Limitations explained in the UI.

### 4.13 Industry research (Phase 12+)
- Company technology profiles (Google, Qualcomm, Microsoft, Intel, Amazon, Siemens, Bosch, TI, NVIDIA, ABB) built only from public, linked sources with research dates.

## 5. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | Lighthouse performance ≥ 85 on dashboard (desktop); 3D canvas lazy-loaded |
| NFR-02 | WCAG 2.1 AA colour contrast for text; full keyboard navigation of shell |
| NFR-03 | All secrets server-side; no service-role key in the browser |
| NFR-04 | RLS enabled on every table; user-owned data isolated by `owner_id = auth.uid()` |
| NFR-05 | Input validation with Zod on every API route and form |
| NFR-06 | Rate limiting on AI and write endpoints (Phase 10) |
| NFR-07 | TypeScript strict mode; `tsc`, ESLint and unit tests must pass before a phase is reported complete |
| NFR-08 | Large files (datasheets, CAD models, firmware archives) in Supabase Storage, not DB columns |

## 6. Data quality rules

- Every spec value stores `verification_status` and `source_id`.
- Prices and availability carry `retrieved_at`; stale (> 90 days) values are flagged.
- The UI never presents a `typical` or `estimated` value as `verified`.

## 7. Out of scope (for now)
- Real PCB routing/Gerber generation (the PCB Designer prepares layouts and exports netlists; production layout stays in KiCad/Altium).
- In-browser firmware compilation (Phase 9 evaluates a server compile service as an optional dependency).
- Certification of any safety-critical design.

## 8. External dependencies

| Dependency | Needed for | Phase | Cost |
|---|---|---|---|
| Supabase project | Auth, Postgres, Storage | 1 | Free tier sufficient initially |
| Vercel | Hosting | 13 (optional earlier) | Free tier |
| Anthropic API key | AI assistant | 10 | Usage-based |
| Email provider (e.g. Resend) | Reminders when app closed | 12 | Free tier |
| MQTT broker (e.g. EMQX/HiveMQ Cloud, Mosquitto) | Telemetry | 11 | Free tier / self-hosted |
| Physical hardware | Testing real devices | 7+ | User-supplied |

## 9. Success criteria
- Phase 1: owner can sign up, sign in, navigate all 26 sections on desktop and mobile, and see a dashboard whose every number is either a live count or labelled demo data.
- Final: owner enters "industrial water meter with flow sensor, ESP32, 4G and cloud monitoring" and is guided through all 17 workflow steps in master spec §32, ending with exported documentation.

## 10. Open questions
1. The master spec references a "supplied My Engineering Lab dashboard design". It was not attached; Phase 1 follows the written visual direction (dark navy, electric blue/cyan, purple/green status). Supply the image to align details.
2. Target region for spectrum regulation guidance (e.g. India WPC/TEC bands for LoRa IN865) — affects Phase 3 content defaults.
