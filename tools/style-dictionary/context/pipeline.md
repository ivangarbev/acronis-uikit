# Pipeline — the two build stages

`@acronis-platform/style-dictionary` builds in two stages. Stage 1 normalizes the
Acronis design tokens into plain DTCG; stage 2 turns that into CSS. Splitting the
work this way keeps the DTCG-conformance concern (handling the Acronis
divergences) separate from the CSS concern (resolution, formatting, theming), and
leaves a clean intermediate that generic DTCG tooling could also consume.

## Why two stages, and why the file split

The source tokens carry two independent mode axes (see
[`design-tokens/context/manifest.md`](../../../packages/design-tokens/context/manifest.md)):

- **Theme** (`light` / `dark`) lives on `primitives.palette`.
- **Brand** (`acronis` / `brand-b`) lives on `semantic.colors` and `components.*`.

So stage 1 splits **primitives by theme** but **semantic/components by brand**:

| Output (`dist/tokens/pd-dtcg/`) | Source file       | Mode key picked from `values` |
| ------------------------------- | ----------------- | ----------------------------- |
| `primitives-light.json`         | `primitives.json` | `light`                       |
| `primitives-dark.json`          | `primitives.json` | `dark`                        |
| `semantic-acronis.json`         | `semantic.json`   | `acronis`                     |
| `semantic-brand-b.json`         | `semantic.json`   | `brand-b`                     |
| `components-acronis.json`       | `components.json` | `acronis`                     |
| `components-brand-b.json`       | `components.json` | `brand-b`                     |

Because semantic/component files are **not** split by theme, their values **keep
their `{group.token}` aliases** (e.g. `"{palette.base}"`). Theme is applied in
stage 2 by pairing a brand's files with `primitives-light` vs `primitives-dark`
and resolving the aliases against each. This is what yields a `light-dark()` pair
per color without ever needing a `semantic-acronis-dark.json`. Aliases are
**kept** in stage 1 and **flattened** only in stage 2.

## Stage 1 — `buildDtcg` (in `tokens.ts`)

`buildDtcg` (in `tokens.ts`) reads the three token files through the
`readTokenSource` reader (also in `tokens.ts`, a typed reader over the package's
`exports`) and, for each view above, normalizes the tree for that view's mode and
the build's `filter` enum value (`normalizeTree` in
`hooks/preprocessors/acronis-dtcg.ts`) producing 100%-DTCG JSON. It serializes
`normalizeTree`'s output **directly** rather than reading it back off a Style
Dictionary instance (SD's init normalization would relocate `$type`; see
AGENTS.md), which is why this stage does not run through SD. The pass:

- **Filter to the platform** — a token is dropped unless its `platforms` array
  includes the build's filter enum value (`"PD"` today; see AGENTS.md →
  Platforms). The `platforms` key itself is then **stripped** (it has no DTCG home).
- **One `$value` per token, original form** — `values.<mode>` collapses to a
  single `$value`; `$extensions.com.acronis.units` (`{ unit, value }` /
  string / number) is promoted to a DTCG `$value` (`{ value, unit }` /
  string / number); HSL color objects and typography composites are kept as-is.
  No conversion, no flattening here.
- **`$extensions` is retained** for traceability (so `com.acronis.units` ends up
  duplicated alongside the promoted `$value` — intentional).
- **`$type`** is carried down from groups onto each token so every emitted token
  is self-describing; `$description` / `$deprecated` are preserved.

A node is a **token** (not a group) if it carries `values`, `$value`, or
`$extensions.com.acronis.units`; groups whose every child was omitted for a mode
are themselves omitted.

## Stage 2 — `buildCss` (in `tokens.ts`) + the `acronis/css` hooks

`buildCss` (in `tokens.ts`), for each brand, resolves the brand's
`semantic`/`components` views against **both** theme views of the primitives, then
emits one CSS file via `StyleDictionary.buildAllPlatforms()` under the `<filter>-css`
platform key. See [`output.md`](output.md) for the
output contract. This stage uses Style Dictionary's framework idiomatically:

- **Value transforms** (`hooks/transforms/`, grouped as `acronis/css`) do the
  formatting: `color/hsl-to-rgb`, `dimension/px`, `scalar/css`,
  `typography/css-class`, plus the built-in `name/kebab` (no prefix). The first
  three are **non-transitive** — they run after reference resolution, so they
  never interfere with `{…}` alias resolution. `typography/css-class` must be
  **transitive**: a composite's sub-fields are references, so SD only applies a
  value transform to it on the transitive pass (non-transitive, it never fires).
- The light and dark resolutions are zipped by the `css/light-dark` **format**:
  color tokens become `light-dark(lightRgb, darkRgb)` (the dark values are
  resolved in a separate pass and passed to the format keyed by token path);
  dimensions and typography are mode-invariant.
- Typography composites are **not** expanded — the `typography/css-class`
  transform turns each resolved composite `$value` into a declaration block, and
  the format wraps it in a `.typography-*` utility class.
- The **`semantic-only` filter** drops the primitive roots (`palette`, `units`,
  `font`) from the file; they are resolution inputs only, so only the `semantic`
  - `component` tiers are emitted.
