# AGENTS.md — `packages/icons-svg`

`@acronis-platform/icons-svg` — **private, source-only** package of raw SVG icon
sources (monocolor + multicolor) fetched from Figma, plus per-page JSON
manifests. No build step, no published artifact: consumers read `src/` directly
through the package `exports` map.

Repo-wide rules (TypeScript, kebab-case filenames, Conventional Commits) live in
the repo root's [`../../context/`](../../context/) and apply on top. This file
documents only what is specific to this workspace.

## Layout

| Path                    | Contents                                                       |
| ----------------------- | -------------------------------------------------------------- |
| `src/svg/`              | Full current icon set — a clean mirror, replaced on every sync |
| `src/monocolor-icons/`  | Single-color icons — **append-only**, never auto-deleted       |
| `src/multicolor-icons/` | Multi-color icons — **append-only**, never auto-deleted        |
| `src/figma/`            | Per-page + combined `icons.json` manifests (icon name arrays)  |
| `scripts/`              | `fix-negative-viewbox.ts` maintenance script                   |

## Scripts

- `pull-icons` — runs `@acronis-platform/figma-icons-fetcher` from this package's
  directory (`tsx ../../tools/figma-icons-fetcher/src/index.ts`), so the fetcher's
  relative output paths (`./src/svg`, …) and `.env.local` resolve here. Config
  comes from `.env.local` (copy from `.env.local.example`) or `process.env`.
- `fix-viewbox` — normalizes monocolor SVGs with a negative `viewBox` origin.
- `build`/`dev`/`clean`/`test` are intentional no-ops (raw data package).
- `typecheck` covers only `scripts/` (the SVG/JSON data is not typechecked).

## Sync model (important)

The fetcher does a **clean sync** of `src/svg/` but **append-only** updates to
`src/monocolor-icons/` and `src/multicolor-icons/`. This is deliberate: icons
removed from Figma must keep working for consumers that still reference them, so
the categorized dirs are never cleaned. Don't "tidy" them to match `src/svg/`.

## Updating icons

Either run `pull-icons` locally and open a PR, or trigger the **Fetch Figma
Icons** workflow (`.github/workflows/icons-fetch.yml`), which runs the sync and
opens a PR. Never hand-edit fetched SVGs — they'll be overwritten on the next
sync; fix the source in Figma instead.
