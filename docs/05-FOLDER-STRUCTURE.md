# Application Folder Structure

```
my-engineering-lab/
├── docs/                         Planning documents (rendered in-app under /documentation)
│   └── progress/                 One progress report per phase
├── supabase/
│   ├── migrations/               Timestamped SQL migrations (schema, RLS, functions)
│   └── seed.sql                  Reference seed (taxonomy only in Phase 1)
├── src/
│   ├── middleware.ts             Session refresh + route protection
│   ├── app/                      Next.js App Router
│   │   ├── layout.tsx            Root: fonts, global CSS
│   │   ├── page.tsx              → /dashboard
│   │   ├── not-found.tsx
│   │   ├── (auth)/               Public auth pages (no app shell)
│   │   │   ├── actions.ts        signIn / signUp / signOut server actions
│   │   │   ├── login/  signup/
│   │   ├── auth/callback/        Email-confirmation code exchange
│   │   └── (app)/                Authenticated workspace (app shell)
│   │       ├── layout.tsx        Loads viewer + notifications, renders AppShell
│   │       ├── dashboard/
│   │       ├── documentation/    Index + [slug]
│   │       ├── profile/          Page, form, server actions
│   │       ├── settings/
│   │       └── [section]/        Status page for sections not yet delivered
│   │                             (a shipped section adds its own folder, e.g. sensors/,
│   │                              which takes precedence automatically)
│   ├── components/
│   │   ├── ui/                   Design-system primitives (shadcn/ui pattern)
│   │   ├── layout/               Shell: sidebar, top bar, search, menus, page header
│   │   └── dashboard/            Dashboard widgets (3D device, charts, calculators…)
│   └── lib/
│       ├── env.ts                Live vs demo mode
│       ├── navigation.ts         Single source of truth for all 26 sections
│       ├── breadcrumbs.ts
│       ├── utils.ts
│       ├── supabase/             Browser, server and middleware clients
│       ├── data/                 Data access (only layer that queries Supabase) + demo fixtures
│       ├── engineering/          Pure engineering maths with steps/assumptions
│       └── validation/           Zod schemas shared by server actions and forms
└── tests/                        Vitest unit tests
```

## Future additions (by phase)

| Phase | New folders |
|---|---|
| 2 | `src/app/(app)/{components,sensors,microcontrollers}/`, `src/components/library/`, `src/lib/data/catalogue.ts`, `src/components/ui/provenance-badge.tsx` |
| 3 | `src/app/(app)/{communication,antennas}/`, `src/lib/engineering/rf.ts` |
| 4 | `src/app/(app)/explorer-3d/`, `src/components/three/`, `public/models/` (or Storage) |
| 5 | `src/app/(app)/{circuit-designer,pcb-designer,hardware-architecture}/`, `src/components/diagram/` (React Flow), `src/lib/services/configuration-engine.ts`, `src/lib/services/rules/` |
| 6 | `src/app/(app)/{calculators,simulation}/`, more `src/lib/engineering/*` |
| 7 | `src/app/(app)/{projects,iot-builder,industrial}/`, `src/lib/services/projects.ts`, `content/reference-projects/` |
| 9 | `src/app/(app)/code-lab/`, `src/components/editor/` (Monaco), `templates/firmware/` |
| 10 | `src/app/api/ai/`, `src/lib/ai/{prompts,tools,retrieval}.ts` |
| 11 | `src/app/api/telemetry/`, `workers/mqtt-ingest/` |
| 12 | `src/app/(app)/{academy,calendar}/`, `content/curriculum/`, `src/app/api/cron/` |
| 13 | `e2e/` (Playwright) |

## Conventions
- Server-only modules start with `import "server-only"`.
- Client components are marked `"use client"` and kept at the leaves.
- Heavy client libraries (Three.js, Monaco, React Flow) are lazy-loaded with `next/dynamic`.
- File names are kebab-case; React components PascalCase.
