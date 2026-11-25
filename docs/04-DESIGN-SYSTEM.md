# UX/UI Design System

Implementation: `tailwind.config.ts`, `src/app/globals.css`, `src/components/ui/*`.

> The master spec refers to a supplied dashboard design image. It was not included with the spec, so this system is derived from the written direction. When the image is supplied, only tokens below should need adjusting.

## 1. Principles
1. **Clarity first** — information density of an engineering tool, not a marketing page.
2. **Status is never colour alone** — every status colour pairs with a label or icon.
3. **Provenance is visible** — badges for `Live`, `Demo data`, `Illustrative`, `Verified`, `Typical`, `Estimated`, `Simulated`.
4. **Restrained effects** — glass panels only on overlays (top bar, popovers); cards are solid surfaces with a 1 px border.

## 2. Colour tokens (CSS variables, HSL)

| Token | Value | Use |
|---|---|---|
| `--background` | `222 47% 6%` (#080D1A) | App background (dark navy) |
| `--surface` | `223 42% 9%` (#0D1426) | Cards |
| `--surface-raised` | `223 38% 12%` (#131C33) | Hover, inputs |
| `--border` | `222 30% 18%` | Card borders, dividers |
| `--foreground` | `210 40% 96%` | Primary text |
| `--muted-foreground` | `215 20% 65%` | Secondary text (≥ 4.5:1 on surface) |
| `--primary` | `217 91% 60%` (#3B82F6) | Electric blue — primary actions |
| `--accent` | `189 94% 53%` (#13D3F2) | Cyan — highlights, focus, data series 1 |
| `--violet` | `262 83% 66%` | Purple — AI features, series 2 |
| `--success` | `142 71% 45%` | Green — online, complete |
| `--warning` | `38 92% 55%` | Amber — unverified, attention |
| `--danger` | `0 84% 62%` | Red — errors, failed checks |

Chart palette order: cyan, blue, violet, green, amber.

## 3. Typography
- UI: **Inter** (variable), via `next/font`.
- Data, part numbers, code: **JetBrains Mono**.
- Scale (rem): 0.75 caption · 0.8125 small · 0.875 body · 1 lead · 1.25 h3 · 1.5 h2 · 1.875 h1.
- Numeric stats use `tabular-nums`.

## 4. Spacing, radius, elevation
- 4 px base grid; card padding 16–20 px; grid gaps 16 px (mobile 12 px).
- Radius: `sm 6px`, `md 8px`, `lg 12px` (cards), `full` (pills).
- Elevation: border + subtle inner highlight; glow (`shadow-glow`) reserved for the active nav item and focused primary controls.

## 5. Layout
```
┌───────────┬──────────────────────────────────────────────┐
│ Sidebar   │ Top bar: ☰ · breadcrumbs · search ⌘K · AI · 🔔 · profile │
│ 264 px    ├──────────────────────────────────────────────┤
│ (72 px    │ Page header (title, description, actions)     │
│ collapsed)│ Workspace grid (12 col ≥1280, 6 col ≥768, 1 col) │
└───────────┴──────────────────────────────────────────────┘
```
- ≥ 1024 px: fixed sidebar, collapsible to icons (state persisted in `localStorage`, later `user_preferences`).
- < 1024 px: sidebar becomes an off-canvas drawer.
- Navigation grouped: Overview · Knowledge Base · Design & Build · Projects · Code & Compute · Systems & Cloud · Intelligence · Learning · Workspace.

## 6. Components (Phase 1)
| Component | Notes |
|---|---|
| `Button` | variants: default, secondary, outline, ghost, destructive; sizes sm/md/lg/icon |
| `Card` | Header/Title/Description/Content/Footer |
| `Badge` | variants incl. `live`, `demo`, `illustrative`, `success`, `warning` |
| `Input`, `Label` | 36 px height, visible focus ring (cyan) |
| `DataSourceBadge` | Maps `live/demo/illustrative` to badge + tooltip text |
| `StatCard` | Icon, label, value, sublabel, source badge |
| `PageHeader` | Title, description, actions slot |
| `PhaseStatus` | Honest status page for not-yet-built sections |
| `CommandSearch` | ⌘K dialog searching navigation (later: components, sensors, projects) |

## 7. Motion
- 150 ms ease-out for hover/press; 200 ms for drawers and dialogs.
- `prefers-reduced-motion` disables the 3D auto-rotation and transitions.

## 8. Accessibility
- All icon-only buttons have `aria-label`.
- Focus visible on every interactive element.
- Sidebar uses `<nav aria-label="Main">` with `aria-current="page"`.
- Dialogs are Radix primitives (focus trap, `Esc` to close).
