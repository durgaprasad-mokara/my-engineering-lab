# My Engineering Lab

AI-powered IoT, robotics, electronics and industrial engineering workspace.

**Status:** Phase 1 (Foundation) complete. See `docs/progress/PHASE-1.md` and `docs/06-DEVELOPMENT-ROADMAP.md`.

## Quick start (demo mode, no backend)

```bash
npm install
npm run dev
# open http://localhost:3000
```

Without Supabase credentials the app runs in **demo mode**: no sign-in, and every data surface is labelled *Demo data*.

## Connect Supabase (live mode)

1. Create a project at supabase.com.
2. Apply the schema:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   Then run `supabase/seed.sql` in the SQL editor (or with `psql`).
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API).
4. In Supabase → Authentication → URL Configuration, set the Site URL to `http://localhost:3000` (and your Vercel URL later), and add `http://localhost:3000/auth/callback` as a redirect URL.
5. `npm run dev`, then sign up.

**Live-mode check:** after sign-up, confirm a row exists in `public.profiles` and `public.user_preferences`, the dashboard badges show **Live**, and counts are `0`. These are real counts; nothing is fabricated. Then edit your profile and settings and reload to confirm they persist.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |

## Documentation
All planning documents are in `docs/` and readable in-app at `/documentation`:
PRD · System Architecture · Database Schema · Design System · Folder Structure · Roadmap · Phase 1 Plan · Phase 1 Report.

## Deploy (Vercel)
Import the repo in Vercel, add the same environment variables, deploy. Add the production URL to Supabase Auth redirect URLs.
