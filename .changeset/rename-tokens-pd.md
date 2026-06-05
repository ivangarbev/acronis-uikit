---
'@acronis-platform/tokens-pd': minor
'@acronis-platform/ui-react': minor
---

Rename `@acronis-platform/design-theme` → `@acronis-platform/tokens-pd` and rebuild it from the Style Dictionary pipeline.

**`@acronis-platform/tokens-pd` (was `@acronis-platform/design-theme`) — breaking:**

- **Package renamed.** Update the dependency and all import specifiers from
  `@acronis-platform/design-theme` to `@acronis-platform/tokens-pd`.
- **Homegrown build retired.** The package no longer runs its own Style
  Dictionary script; it is now the published home for the output of
  `@acronis-platform/style-dictionary`, which is generated and committed.
- **Exports replaced.** The `./css`, `./scss`, and `./js` exports are removed.
  Output is grouped into `css/`, `tailwind/`, and `dtcg/` dirs.
  - `./css` → `./css/acronis.css` (semantic tier, default brand) and, per
    component, `./css/<component>/acronis.css`.
  - Non-default brands ship as **override-only** files (`./css/brand-b.css`,
    `./css/<component>/brand-b.css`) — import the base then the override (last wins).
  - `./scss` and `./js` (the `tokens`/`groups`/`TokenName` map) are dropped.
  - New: `./tailwind/<brand>.js` (Tailwind presets, baked values, via `@config`)
    and `./dtcg/*.json` (the DTCG intermediate).
- **Custom-property naming changed.** The `--av-*` prefix is gone. Names now drop
  the `colors` tier segment and use a `--ui-*` prefix:
  `--av-colors-background-surface-primary` → `--ui-background-surface-primary`.
- **Theming mechanism changed.** Light/dark is driven by `light-dark()` +
  `color-scheme`, toggled with the `[data-theme]` attribute (`<html
data-theme="dark">`) instead of a `.dark` class. Brands are bare `:root`
  overrides (no `.brand-b` class) — one brand per app.
- **Gradients** are now emitted (`--ui-background-ai-*`), and typography ships as
  `.ui-typography-*` utility classes.

**`@acronis-platform/ui-react`:**

- Now themed by `@acronis-platform/tokens-pd` (was `@acronis-platform/design-theme`).
- The `@theme inline` bridge maps onto the new `--ui-*` names; the `dark:` variant
  now keys off the `[data-theme="dark"]` attribute instead of the `.dark` class.
  Consumers that previously toggled a `.dark` class must switch to `data-theme`.
- The `ai` button variant's gradient (`--ui-background-ai-*`) is now defined.
