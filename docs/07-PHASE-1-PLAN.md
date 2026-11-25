# Phase 1 — Foundation: Implementation Plan

## Objectives
1. Project scaffold with strict TypeScript, Tailwind design tokens, linting and unit testing.
2. Design system primitives and app shell (sidebar, top bar, breadcrumbs, search, notifications, profile, AI entry).
3. Supabase authentication (sign up, sign in, sign out, protected routes) with automatic profile creation.
4. Demo mode so the platform runs and can be reviewed without a backend.
5. Engineering dashboard with honest data sourcing.
6. All 26 navigation routes resolve; unbuilt sections render a truthful status page.
7. Profile, Settings and in-app Documentation as working pages.
8. Database schema + RLS (all later-phase tables created now to avoid churn).

## Files to create
| Area | Files |
|---|---|
| Config | `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `.env.example`, `.gitignore` |
| Database | `supabase/migrations/20261125000001_init.sql`, `supabase/seed.sql` |
| Core lib | `src/lib/env.ts`, `src/lib/utils.ts`, `src/lib/navigation.ts`, `src/lib/breadcrumbs.ts` |
| Supabase | `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`, `src/middleware.ts` |
| Data access | `src/lib/data/dashboard.ts`, `src/lib/data/demo.ts`, `src/lib/data/profile.ts`, `src/lib/data/docs.ts` |
| Engineering | `src/lib/engineering/ohms-law.ts`, `battery.ts` (used by dashboard quick calculators; full lab in Phase 6) |
| Validation | `src/lib/validation/auth.ts`, `profile.ts` |
| UI primitives | `src/components/ui/{button,card,badge,input,label,separator}.tsx` |
| Shell | `src/components/layout/{app-shell,sidebar,topbar,breadcrumbs,command-search,notifications-menu,user-menu,page-header,phase-status}.tsx` |
| Dashboard | `src/components/dashboard/*` (stats, 3D device, architecture, projects, configurations, measurements, calculators, calendar, tasks, recommendations, recent components, saved designs) |
| Routes | `src/app/layout.tsx`, `page.tsx`, `not-found.tsx`, `(auth)/login`, `(auth)/signup`, `(auth)/actions.ts`, `auth/callback/route.ts`, `(app)/layout.tsx`, `(app)/dashboard`, `(app)/[section]`, `(app)/documentation`, `(app)/documentation/[slug]`, `(app)/profile`, `(app)/settings` |
| Tests | `tests/*.test.ts` |

## Dependencies
Runtime: next 15, react 19, @supabase/ssr, @supabase/supabase-js, three, @react-three/fiber, @react-three/drei, recharts 3, lucide-react, @radix-ui/react-{dialog,dropdown-menu,slot}, class-variance-authority, clsx, tailwind-merge, zod, react-markdown, remark-gfm.
Dev: typescript, tailwindcss 3, eslint 9 + eslint-config-next, vitest.

## Implementation details
- **Mode detection** (`env.ts`): live iff both public Supabase variables are present.
- **Middleware**: in live mode refreshes the session and redirects anonymous users on app routes to `/login?next=…`; signed-in users visiting `/login` go to `/dashboard`. Demo mode: pass-through.
- **Dashboard data**: one `getDashboardData()` call returns `{ mode, stats, … }`. Live mode calls the `dashboard_stats()` RPC plus small owner-scoped queries; any failure degrades to an empty state with an error note, never to demo numbers.
- **Status pages**: `(app)/[section]/page.tsx` renders from `navigation.ts` (phase, planned capabilities, dependencies). When a phase ships its static route, it automatically takes precedence over the dynamic one.
- **Quick calculators**: real pure functions (Ohm's law, battery runtime with duty cycle) with formulas, steps and assumptions shown.
- **3D widget**: lazy-loaded client component, labelled *Illustrative model — not manufacturer CAD*. Respects `prefers-reduced-motion`.

## Testing steps
1. `npm run typecheck` — zero errors.
2. `npm run lint` — zero errors.
3. `npm test` — navigation integrity (26 unique routes), breadcrumbs, auth validation, calculator maths.
4. `npm run build` — production build succeeds.
5. Run `npm start` in demo mode; visit every route; confirm HTTP 200 and no console errors.
6. Screenshots at 1440 px and 390 px.
7. Migration applied to an embedded Postgres; RLS isolation checks.
8. Live-mode manual check (requires your Supabase project): sign up → profile row exists → dashboard shows `Live` badges.

## Exit criteria
All steps above pass; progress report written to `docs/progress/PHASE-1.md`.
