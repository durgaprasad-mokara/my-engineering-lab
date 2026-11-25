# Development Roadmap

Each phase ends with: typecheck, lint, unit tests, production build, responsive screenshots, and a progress report (`docs/progress/PHASE-N.md`). A phase is not marked complete while any of its features are placeholders.

| # | Phase | Delivers | Nav sections unlocked | External dependencies | Status |
|---|---|---|---|---|---|
| 1 | Foundation | Next.js setup, design system, Supabase auth + demo mode, app shell, dashboard, profile, settings, in-app docs, schema + RLS | Dashboard, Documentation, Profile & Progress, Settings | Supabase project (optional — demo mode without) | **Complete** |
| 2 | Engineering Knowledge Base | Component, sensor and microcontroller libraries; datasheet links; provenance badges; 5-way sensor compare; board selector; Storage buckets | Components, Sensors, Microcontrollers | Manufacturer datasheets (public) | Next |
| 3 | Communication | Cellular, LPWAN, wired and application protocol library; comparison engine with application suitability (water/energy meters, railway, agriculture, industrial); antenna library with radiation-pattern plots; India (WPC) + global spectrum notes | Communication, Antennas | — | Planned |
| 4 | 3D Engineering | R3F explorer: orbit/zoom/pan, selection, pin inspection, labels, exploded view, 7 view modes; fidelity labels | 3D Explorer | glTF/STEP→glTF models (manufacturer CAD where licence allows) | Planned |
| 5 | Engineering Design | Hardware configuration engine (5 configs × 10 criteria), editable BOM, React Flow circuit/wiring/block designer with rule checks, PCB preparation (netlist export), architecture diagrams | Circuit Designer, PCB Designer, Hardware Architecture | — | Planned |
| 6 | Calculations | Mechanical, electrical, fluid, communication (link budget, FSPL), battery calculators with formula/steps/assumptions; basic simulations (RC/RL transients, duty-cycle power) | Calculators, Simulation | — | Planned |
| 7 | IoT Projects | Project workspace (CRUD, duplicate, archive, export, versions, statuses); IoT builder with 22-section workflow; reference projects: Smart Water Meter, Energy Meter, Railway Track, Railway Bridge Load, Industrial telemetry; industry research | My Projects, IoT Builder, Industrial Applications | — | Planned |
| 8 | Robotics | Motor/driver/encoder/IMU knowledge, motor sizing, robot architectures, ROS 2 templates, IoT + Robotics integration | Robotics Builder, IoT + Robotics | ROS 2 (local, optional) | Planned |
| 9 | Embedded Code Lab | Monaco editor, file tree, version history, download; template firmware for ESP32/STM32/RP2040/Arduino/MicroPython/Zephyr/FreeRTOS; build status tracking (`untested` until compiled) | Embedded Code Lab | Optional compile service (PlatformIO in a container) | Planned |
| 10 | AI Engineering Assistant | Claude via server route; tool calling into the knowledge base; RAG over datasheets; 20-step requirement workflow; rate limiting; conversation history; AI dashboard recommendations | AI Assistant | **Anthropic API key** | Planned |
| 11 | Gateway & Cloud | Device registry, MQTT topics, ingest worker, telemetry dashboards, alerts, digital twin view bound to live telemetry | Gateway & Cloud, Digital Twin | **MQTT broker**; optional AWS IoT / Azure IoT accounts for integration examples | Planned |
| 12 | Learning Academy | 365-day curriculum (12 months), daily lesson structure, quizzes, progress, calendar scheduling/rescheduling, reminders (in-app, browser, email) | Learning Academy, Daily Calendar | **Email provider** for app-closed reminders | Planned |
| 13 | Testing & Deployment | Playwright E2E, RLS/security tests, performance budgets, responsive suite, Vercel production deploy | — | **Vercel** account | Planned |

## Sequencing rationale
- The knowledge base (2–3) precedes design tools (5) and AI (10) because both consume it: the AI assistant's recommendations must come from stored, sourced data rather than free generation.
- Calculators (6) precede projects (7) because the reference projects rely on power, flow and link-budget calculations.
- Cloud (11) follows firmware (9) so device → broker → cloud can be tested with generated firmware.

## Requirement traceability
PRD sections map to phases: §4.1–4.3 → P1, §4.4 → P2–3, §4.5 → P4, §4.6 → P5, §4.7 → P6, §4.8 → P7–8, §4.9 → P9, §4.10 → P10, §4.11 → P11, §4.12–4.13 → P12.
