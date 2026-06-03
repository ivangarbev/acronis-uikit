# AGENTS.md — `packages/design-theme`

`@acronis-platform/theme` — consumable **CSS / SCSS / JS** artifacts
generated from [`@acronis-platform/tokens`](../design-tokens) via
[Style Dictionary](https://styledictionary.com/). Published.

Repo-wide rules live in the repo root's `./context/`. This file documents
only what's specific to this workspace.

## Why this package exists

The raw `tokens` package is a Figma-exported DTCG **variant** that no app
can consume directly: primitives carry per-scheme values
(`values: { light, dark }`, each `{ colorSpace, components }`) and semantic
tokens carry per-brand aliases (`values: { acronis, brand-b }` →
`{palette.x.y}`). This package resolves that (brand × scheme) matrix into
flat artifacts.

## Build pipeline

`pnpm build` runs `tsx scripts/build.ts`:

- `scripts/resolve.ts` — parses the raw tokens and flattens one
  (brand, scheme) pair into a plain Style-Dictionary token tree, resolving
  the semantic → primitive alias chain itself (references only ever point
  at primitives). `resolveTree` returns an SD tree; `resolveFlat` returns a
  flat `name → value` map.
- `scripts/build.ts` — feeds those trees to Style Dictionary to emit
  `dist/css/variables.css` (`:root` light + `.dark` dark), `dist/scss/
_variables.scss`, and `dist/js/index.{js,d.ts}`.

Outputs are gitignored — they're build artifacts. `dist/` is what ships.

## Conventions / scope

- CSS custom properties use the **`--av-`** prefix to match the legacy
  library's theming contract.
- **First-iteration scope: color tokens only**, default `acronis` brand.
  Typography/composite tokens, the `brand-b` brand, and a per-scheme SCSS
  split are deferred. The matrix in `build.ts` is structured so adding a
  brand is one more array entry.
- Don't edit `dist/`. Don't fork token values here — change them upstream
  in `@acronis-platform/tokens` and rebuild.

See `../../context/releasing.md` for the Changesets / publish flow.
