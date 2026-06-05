# @acronis-platform/design-theme

## 0.6.0

### Minor Changes

- [#198](https://github.com/acronis/uikit/pull/198) [`8cbe6cf`](https://github.com/acronis/uikit/commit/8cbe6cfb891cf59a2fe3c006a0ef8a08d06806ee) Thanks [@heygabecom](https://github.com/heygabecom)! - Rename `@acronis-platform/design-theme` → `@acronis-platform/tokens-pd` and rebuild it from the Style Dictionary pipeline.

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

## 0.5.1

### Patch Changes

- Updated dependencies [[`23b62d4`](https://github.com/acronis/uikit/commit/23b62d49263276956b46d34cdd084003c9fd566b)]:
  - @acronis-platform/design-tokens@0.5.0

## 0.5.0

### Minor Changes

- [#94](https://github.com/acronis/uikit/pull/94) [`9e418d6`](https://github.com/acronis/uikit/commit/9e418d6fb7e4e52182e96dc26418daf82fde8c25) Thanks [@leonid](https://github.com/leonid)! - Add Figma Code Connect support to `ui-react` and align the Button with the
  Figma "Button" component.
  - **`ui-react`**: new Figma Code Connect setup (`figma.config.json`,
    co-located `*.figma.tsx` files, `figma:connect*` scripts) linking
    components to their Figma counterparts. The `Button` is fully connected and
    its variants now match the Figma `Style` set: added `ai` (gradient) and
    `inverted` variants, and re-pointed `default` / `secondary` / `ghost` /
    `destructive` to the colors used in the mockup via button-local
    `--color-btn-*` token bridges (the shared `--color-*` tokens are unchanged).
    The legacy-only `outline` / `link` / `translucent` variants are retained for
    parity with the shared demos.
  - **`design-tokens`**: added the `colors.background.inverted-surface` semantic
    tokens (idle / hover / active / disabled) that back the inverted button.
  - **`design-theme`**: emits the new
    `--av-colors-background-inverted-surface-*` custom properties.

### Patch Changes

- Updated dependencies [[`9e418d6`](https://github.com/acronis/uikit/commit/9e418d6fb7e4e52182e96dc26418daf82fde8c25)]:
  - @acronis-platform/design-tokens@0.4.0

## 0.4.0

### Minor Changes

- [#89](https://github.com/acronis/uikit/pull/89) [`61fe683`](https://github.com/acronis/uikit/commit/61fe68389b42f482fe9f7a07ab0f14ebad6c12d1) Thanks [@leonid](https://github.com/leonid)! - Two additions:
  - **All authored brands** are emitted, not just `acronis`. The default brand
    stays on `:root` / `.dark`; every other brand (currently `brand-b`) is a
    class-scoped override (`.brand-b`, `.brand-b.dark`) containing only the
    tokens that differ, so consumers switch brand by toggling a class. The
    `./js` export now ships `brands`, `defaultBrand`, per-brand `tokens`, and a
    `groups` array (tokens organized by category for display).
  - **Gradient tokens** are now emitted. Color-stop arrays become CSS
    `linear-gradient(...)`, with the angle derived from the Figma
    `com.figma.gradientTransform` matrix (e.g. `colors.background.ai.*`).

  Note: `brand-b` currently produces no overrides — it matches `acronis` on
  every color token and inherits its gradients. The mechanism is ready for when
  the brand data diverges.

## 0.3.0

### Minor Changes

- [#89](https://github.com/acronis/uikit/pull/89) [`61fe683`](https://github.com/acronis/uikit/commit/61fe68389b42f482fe9f7a07ab0f14ebad6c12d1) Thanks [@leonid](https://github.com/leonid)! - Emit **all authored brands**, not just `acronis`. The default brand stays on
  `:root` / `.dark`; every other brand (currently `brand-b`) is generated as a
  class-scoped override (`.brand-b`, `.brand-b.dark`) containing only the tokens
  that differ from the default, so consumers switch brand by toggling a class.
  The `./js` export now ships `brands`, `defaultBrand`, and per-brand `tokens`
  (the existing `light` / `dark` exports remain, pointing at the default brand).

  Note: `brand-b` currently differs from `acronis` only in AI gradient tokens,
  which the color-only build skips, so it produces no overrides yet — the
  mechanism is ready for when the brand data diverges.

## 0.2.0

### Minor Changes

- [#80](https://github.com/acronis/uikit/pull/80) [`1687cc9`](https://github.com/acronis/uikit/commit/1687cc9336de74d53521d8e6ef9097763a0a9bb0) Thanks [@leonid](https://github.com/leonid)! - Introduce two new published packages:
  - `@acronis-platform/design-theme` — generates consumable CSS / SCSS / JS theme
    artifacts from `@acronis-platform/design-tokens` via Style Dictionary, resolving
    the per-scheme (light/dark) and per-brand token matrix into `--av-*` CSS
    custom properties.
  - `@acronis-platform/ui-react` — the next-generation Acronis React
    component library built on Base UI (`@base-ui/react`) and themed by
    `@acronis-platform/design-theme`. Ships `Button` and `Switch` with tests and
    Storybook stories as the reference pattern.
