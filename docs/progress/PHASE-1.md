# Phase 1 — Foundation: Progress Report

| Field | Value |
|---|---|
| Date | 2026-11-25 |
| Status | **Complete** (demo mode fully verified; live mode verified up to route protection — see Known issues) |
| Next phase | Phase 2 — Engineering Knowledge Base |

## Objectives → outcome

| Objective | Outcome |
|---|---|
| Project scaffold | Next.js 15.5 (App Router), React 19, strict TypeScript (`noUncheckedIndexedAccess`), Tailwind 3, ESLint 9, Vitest |
| Design system | Tokens in `globals.css`/`tailwind.config.ts`; primitives: Button, Card, Badge, Input/Textarea/Select, Label, DataSourceBadge |
| App shell | Collapsible sidebar (state persisted), mobile drawer, top bar, breadcrumbs, Ctrl/⌘ K search, notifications menu, profile menu, "Ask AI" entry, demo-mode banner |
| Authentication | Supabase email/password sign-up, sign-in, sign-out (server actions + Zod), email-confirmation callback, middleware route protection, open-redirect protection, DB trigger creates profile + preferences |
| Demo mode | Automatic when Supabase env vars are absent; every data surface badged *Demo data* |
| Dashboard | 10 statistics (live RPC `dashboard_stats()` or labelled demo), interactive 3D device (orbit/zoom/pan, hover tooltips, part selection, exploded view; labelled *Illustrative*), measurements chart, sensor-to-cloud architecture, five-configuration comparison, working Ohm's-law and battery-runtime calculators with formulas/steps/assumptions, learning calendar, today's tasks, rule-based recommendations (labelled — AI is Phase 10), recently viewed components, saved designs |
| 26 navigation routes | All resolve. Dashboard, Documentation, Profile & Progress, Settings are functional; the 22 others show an honest "Not built yet · Phase N" page listing planned capabilities and dependencies |
| Profile & Settings | Editable profile (name, headline, time zone, goals) and preferences (region, units, reminder time), saved via RLS-protected server actions; read-only in demo mode |
| Documentation | All planning documents rendered in-app from `/docs` |
| Database | Full schema for all phases (34 tables), enums, indexes, `updated_at` triggers, RLS on every table, parent-ownership triggers, `dashboard_stats()` RPC, taxonomy seed |

## Files created
See `docs/05-FOLDER-STRUCTURE.md` for the full tree. 80 source, test, SQL and doc files (plus config).

## Dependencies added
Runtime: next, react, react-dom, @supabase/ssr, @supabase/supabase-js, three, @react-three/fiber, @react-three/drei, recharts, lucide-react, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge, zod (v4), react-markdown, remark-gfm, server-only, @fontsource-variable/inter, @fontsource-variable/jetbrains-mono.
Dev: typescript, tailwindcss, postcss, autoprefixer, eslint, eslint-config-next, @eslint/eslintrc, vitest, @types/*.

Fonts are self-hosted via `@fontsource` (no runtime request to Google Fonts).

## Tests run

| Check | Result |
|---|---|
| `npm run typecheck` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors, 0 warnings |
| `npm test` | ✅ 23/23 passing — navigation integrity (26 unique routes, phase/status consistency), breadcrumbs, auth + profile validation, open-redirect guard, mode detection, stats mapping, Ohm's law, battery runtime (checked against hand calculation) |
| `npm run build` (demo mode) | ✅ |
| `npm run build` (live-mode env) | ✅ |
| Route sweep (demo) | ✅ 32 routes → 200, `/` → 307 to dashboard, unknown routes → 404 |
| Route protection (live-mode env) | ✅ `/dashboard`, `/sensors`, `/documentation/prd` → 307 to `/login?next=…`; `/login`, `/signup` → 200 |
| Security headers | ✅ X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| Browser test (headless Chrome, 1440 px + 390 px) | ✅ 3D canvas renders, exploded view and part selection work, calculator tabs work, Ctrl K search navigates, sidebar collapses/expands, mobile drawer opens, no horizontal overflow on mobile, no page errors |
| Migration (embedded Postgres 16 via PGlite, stubbed `auth` schema) | ✅ Applies cleanly; seed inserts 42 categories; RLS: user B cannot read user A's project; cross-owner child insert blocked; self-promotion to admin blocked; non-admin catalogue write blocked |

## Known issues / limitations
1. **Live Supabase not tested end to end.** No Supabase project was available. Sign-up → profile trigger → live dashboard must be checked once you connect your project (5-minute check in README).
2. **Dashboard design image not supplied.** The master spec references it; the UI follows the written direction. Send it and tokens/layout will be aligned.
3. **`npm audit`: 2 findings in Next 15's bundled PostCSS** (build-time CSS processing of our own stylesheets; low practical exposure). The fix requires Next 16 (major: `middleware` → `proxy` rename, other changes). Recommended as a planned upgrade at the start of Phase 2. Zod advisory resolved by upgrading to Zod 4.
4. Search covers navigation sections only until the knowledge base exists (Phase 2).
5. Notifications are listed but cannot yet be marked as read (Phase 12).
6. Sidebar collapse is stored in `localStorage`; syncing to `user_preferences.sidebar_collapsed` is planned with Phase 2.
7. Rate limiting is not yet implemented; it is needed for the AI endpoints (Phase 10). Auth endpoints are rate-limited by Supabase Auth itself.
8. The 3D device is generic illustrative geometry, clearly labelled. Accurate models are Phase 4.

## Next steps (Phase 2)
1. Upgrade to Next 16 and re-run the full Phase 1 test suite.
2. Storage buckets and policies for datasheets, images and models.
3. Component, sensor and microcontroller libraries: list/filter/search pages, detail pages, provenance badges, datasheet links.
4. Seed an initial, source-backed catalogue (each value with verification status and a manufacturer datasheet reference).
5. Five-way sensor comparison and board-selection assistant.
6. Extend global search to catalogue records; record `component_views`.
