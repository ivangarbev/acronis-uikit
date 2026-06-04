---
'@acronis-platform/style-dictionary': minor
---

Add `@acronis-platform/style-dictionary` — the first inhabitant of the repo's
`tools/` tier. A private (unpublished) [Style Dictionary v5](https://styledictionary.com/)
translation pipeline with two build domains, driven by a single CLI
(`src/index.ts`) keyed by `<filter>-<output>` platform keys:

- **Tokens → CSS.** Normalizes `@acronis-platform/design-tokens` into 100%-DTCG
  JSON (`pd-dtcg`), then resolves it into per-brand CSS custom properties
  (`pd-css`: `acronis.css`, `brand-b.css`) using the modern `light-dark()` +
  `color-scheme` theming pattern and `.typography-*` utility classes.
- **Assets → SVG + React.** Resolves `@acronis-platform/design-assets` packs
  (scale/stroke rules, `currentColor` for mono), optimizes with SVGO, and
  generates one tree-shakeable React component per asset with `size`/`variant`
  props (`pd-assets` / `web-assets`).

Output is written to a gitignored `dist/` (`dist/tokens/`, `dist/assets/`). A
POC CI pipeline (`assets-detect` / `assets-build` in `.github/workflows/ci.yml`)
exercises the change-detection → validate → per-pack build contract.
