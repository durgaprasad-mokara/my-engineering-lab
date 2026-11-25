# System Architecture

## 1. Overview

```
┌────────────────────────── Browser ──────────────────────────┐
│ Next.js App Router (React Server + Client Components)        │
│  • App shell (sidebar, top bar, search, breadcrumbs)         │
│  • Feature modules: dashboard, library, designer, code lab…  │
│  • Visualisation: R3F/Three.js · React Flow · Recharts       │
│  • Monaco editor (Phase 9, lazy)                             │
└──────────────┬──────────────────────────────┬────────────────┘
               │ RSC / Server Actions         │ fetch /api/*
┌──────────────▼──────────────────────────────▼────────────────┐
│ Next.js server (Vercel)                                       │
│  middleware.ts  — session refresh + route protection          │
│  lib/services/* — business logic (pure, testable)             │
│  lib/data/*     — data access (Supabase queries only here)    │
│  lib/ai/*       — Claude orchestration, tools, RAG (Phase 10) │
│  app/api/*      — validated (Zod), rate-limited endpoints     │
└──────┬───────────────────┬────────────────────┬──────────────┘
       │                   │                    │
┌──────▼──────┐   ┌────────▼────────┐   ┌───────▼────────┐
│ Supabase    │   │ Anthropic API    │   │ MQTT broker     │
│ Auth        │   │ (server only)    │   │ (Phase 11)      │
│ Postgres+RLS│   └──────────────────┘   └───────▲────────┘
│ Storage     │                                   │
│ pgvector    │◄── telemetry ingest worker ───────┘
└─────────────┘
```

## 2. Layering

| Layer | Location | Rules |
|---|---|---|
| Presentation | `src/app/**`, `src/components/**` | No direct DB calls in client components. Server components call services. |
| Business logic | `src/lib/services/**` | Framework-agnostic TypeScript; unit-tested; returns typed results with provenance. |
| Data access | `src/lib/data/**`, `src/lib/supabase/**` | The only place that talks to Supabase. Returns domain types. |
| AI orchestration | `src/lib/ai/**` (Phase 10) | Prompt templates, tool definitions, retrieval; called only from server. |
| Engineering math | `src/lib/engineering/**` (Phase 6) | Pure functions with formulas, units and assumptions; 100% unit-test coverage target. |

## 3. Runtime modes

| Mode | Trigger | Behaviour |
|---|---|---|
| **Live** | `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set | Auth enforced; data from Postgres; badges show `Live`. |
| **Demo** | Variables absent | No auth; repositories return bundled demo fixtures; every surface badges `Demo data`. Lets the UI be developed and reviewed without a backend. |

`src/lib/env.ts` is the single source of truth for mode detection.

## 4. Authentication flow
1. `@supabase/ssr` creates browser and server clients using cookies.
2. `middleware.ts` refreshes the session on each request and redirects unauthenticated users from `/(app)` routes to `/login?next=…`.
3. Auth pages call server actions (`signIn`, `signUp`, `signOut`) that validate input with Zod.
4. A Postgres trigger `handle_new_user()` inserts the `profiles` and `user_preferences` rows.

## 5. Data provenance model
Technical values reference a `sources` row (URL, publisher, document revision, retrieved date) and carry a `verification_status` enum. The UI component `<ProvenanceBadge/>` renders the status consistently everywhere.

## 6. AI architecture (Phase 10, designed now)
- Route `POST /api/ai/chat` (server only, streaming). Key in `ANTHROPIC_API_KEY`.
- Tools exposed to Claude: `search_components`, `get_component_specs`, `search_sensors`, `compare_communication`, `compute_battery_life`, `create_bom`, `save_configuration`. Tools call the same services the UI uses, so AI answers draw on the stored, sourced data.
- Retrieval: datasheet chunks embedded into `document_chunks` (pgvector). Answers cite the chunk source.
- Guardrails: system prompt enforces facts-vs-assumptions separation, datasheet citation, clarifying questions, and safety-critical disclaimers.
- Conversations stored in `ai_conversations` / `ai_messages`.
- Rate limit: per-user token bucket stored in Postgres (no extra service needed).

## 7. Telemetry architecture (Phase 11, designed now)
- Device → MQTT broker topic `mel/{owner_id}/{device_id}/telemetry`.
- Ingest worker (Supabase Edge Function or small Node service) subscribes, validates payload against device schema, writes to `telemetry_data` (partitioned by month).
- Dashboard subscribes via Supabase Realtime.

## 8. Notifications (Phase 12)
- In-app: `notifications` table + Realtime.
- Browser: Notification API with explicit permission; works only while a tab is open (or via service-worker push).
- App-closed delivery: scheduled job (Supabase `pg_cron` or Vercel Cron) sends email at the user's `reminder_time` in their time zone. The UI explains these limits.

## 9. Security
- Service-role key never shipped to the browser; only used in server-only modules (`import 'server-only'`).
- RLS on every table. Reference data (components, sensors…) readable by authenticated users; writable by `admin` role only. User data: `owner_id = auth.uid()`.
- Zod validation on all inputs; output encoding via React.
- Security headers in `next.config.ts` (X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options).

## 10. Deployment
- Vercel project linked to GitHub; preview deploys on PRs.
- Supabase migrations in `supabase/migrations`, applied with `supabase db push`.
- Environment variables documented in `.env.example`.

## 11. Key technology decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 App Router, React 19 | Server components, server actions, Vercel fit |
| Styling | Tailwind CSS 3 + shadcn/ui pattern (local components) | Full control of the design tokens, no runtime CSS-in-JS |
| 3D | three + @react-three/fiber + drei | Spec requirement; mature ecosystem |
| Diagrams | React Flow (Phase 5) | Node/edge editing for block, wiring and architecture views |
| Charts | Recharts 3 | Simple declarative charts |
| Validation | Zod | Shared between server actions and forms |
| Tests | Vitest (unit), Playwright (E2E, Phase 13) | Fast, TS-native |
