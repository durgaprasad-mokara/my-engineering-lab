# My Engineering Lab

AI-powered IoT, robotics, electronics, and industrial engineering workspace.

**Status:** Phases 1–12 complete (all 26 workspace sections unlocked). Next: Phase 13 (E2E Testing & Vercel Deployment). See `docs/06-DEVELOPMENT-ROADMAP.md` and `docs/progress/PHASE-1.md` through `PHASE-12.md`.

## Quick start (demo mode, no backend)

```bash
npm install
npm run dev
# open http://localhost:3000
```

Without Supabase credentials in `.env.local`, the app runs in **demo mode**: no sign-in required, and every data surface is clearly badged *Demo data*.

## Environment variables (`.env.local`)

Copy `.env.example` to `.env.local` and configure the integrations you want to enable:

```env
# --- Supabase (Auth + Postgres + Storage) ----------------------------
# Leave both empty to run in DEMO MODE (no auth, labelled demo data).
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<optional-server-only-service-role-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# --- Anthropic (Phase 10 AI Assistant, server-only) ------------------
# Leave empty to use deterministic rule-based Knowledge Base synthesis.
ANTHROPIC_API_KEY=

# --- MQTT (Phase 11 Gateway & Cloud) ---------------------------------
MQTT_BROKER_URL=
MQTT_USERNAME=
MQTT_PASSWORD=

# --- Email reminders (Phase 12 Learning Calendar) --------------------
RESEND_API_KEY=
```

## Connect Supabase (live mode)

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema and storage policies:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   Then run `supabase/seed.sql` in the Supabase SQL Editor (or with `psql`).
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API) to `.env.local`.
4. In Supabase → **Authentication** → **URL Configuration**, set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` as a redirect URL.
5. **Fix `"Email not confirmed"` on sign-in (optional):**
   - In Supabase → **Authentication** → **Providers** → **Email**, toggle **Confirm email** **OFF** to allow immediate sign-in without email verification.
   - To confirm an already-created user, go to **Authentication** → **Users** → `...` → **Confirm user**, or run:
     ```sql
     update auth.users set email_confirmed_at = now() where email = 'your@email.com';
     ```
6. Restart `npm run dev` and sign up.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server (`http://localhost:3000`) |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest — 87 tests across 15 suites) |

## Unlocked sections (Phases 1–12)

- **Overview:** `/dashboard`
- **Knowledge Base:** `/components`, `/sensors`, `/microcontrollers`, `/communication`, `/antennas`, `/explorer-3d`
- **Design & Build:** `/circuit-designer`, `/pcb-designer`, `/hardware-architecture`
- **Projects:** `/projects`, `/iot-builder`, `/industrial`, `/robotics-builder`, `/iot-robotics`
- **Code & Compute:** `/code-lab`, `/calculators`, `/simulation`
- **Systems & Cloud:** `/gateway-cloud`, `/digital-twin`
- **Intelligence:** `/assistant` (`/api/assistant`)
- **Learning:** `/academy`, `/calendar`
- **Workspace:** `/documentation`, `/profile`, `/settings`

## Deploy (Vercel)

Import the repository in Vercel, add the environment variables from `.env.local` in Vercel Project Settings, deploy, and add your production URL (`https://<your-app>.vercel.app/auth/callback`) to Supabase Auth redirect URLs.
