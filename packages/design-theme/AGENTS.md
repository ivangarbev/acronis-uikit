# AGENTS.md — `packages/design-theme`

`@acronis-platform/design-theme` — consumable **CSS / SCSS / JS** artifacts
generated from [`@acronis-platform/design-tokens`](../design-tokens) via
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
- **Scope: color + gradient tokens.** Gradient tokens (color-stop arrays)
  are emitted as CSS `linear-gradient(...)`, with the angle derived from the
  Figma `com.figma.gradientTransform` matrix (`gradientAngle`); they carry
  `type: 'gradient'` so Style Dictionary leaves the string untouched.
  Typography/composite tokens and a per-scheme SCSS split are deferred.
- **Brands.** All brands authored in the tokens are emitted (derived via
  `listBrands()` — currently `acronis`, `brand-b`). The default brand
  (`acronis`) lives at `:root` / `.dark`; every other brand is a
  **class-scoped override** (`.brand-b`, `.brand-b.dark`) carrying only the
  tokens that differ from the default — so identical brands add nothing but
  a comment. Consumers switch brand by adding the brand class to an
  ancestor. The JS export ships `brands`, `defaultBrand`, and per-brand
  `tokens`. (Today `brand-b` produces **no** overrides: it matches `acronis`
  on every color token and leaves the AI gradient tokens unset, so it
  inherits the `acronis` gradients. The mechanism is ready for divergence.)
- Don't edit `dist/`. Don't fork token values here — change them upstream
  in `@acronis-platform/design-tokens` and rebuild.

See `../../context/releasing.md` for the Changesets / publish flow.
