# @acronis-platform/design-theme

Consumable **CSS / SCSS / JS** design-theme artifacts, generated from
[`@acronis-platform/design-tokens`](../design-tokens) (the raw DTCG token data) via
[Style Dictionary](https://styledictionary.com/).

The raw tokens are a Figma-exported, multi-dimensional DTCG variant that
no app can use directly — primitives carry per-scheme (`light`/`dark`)
values and semantic tokens carry per-brand (`acronis`/`brand-b`) aliases
back into the primitives. This package resolves that matrix into flat,
ready-to-consume artifacts.

## Build

```sh
pnpm --filter @acronis-platform/design-theme build
```

`scripts/resolve.ts` flattens the (brand × scheme) matrix into plain
Style-Dictionary token trees; `scripts/build.ts` feeds those to Style
Dictionary to emit:

| Output                         | Export   | Contents                                                     |
| ------------------------------ | -------- | ------------------------------------------------------------ |
| `dist/css/variables.css`       | `./css`  | `--av-*` custom properties: `:root` (light) + `.dark` (dark) |
| `dist/scss/_variables.scss`    | `./scss` | `$av-*` SCSS variables (light)                               |
| `dist/js/index.js` (+ `.d.ts`) | `./js`   | `{ light, dark }` token maps + `TokenName` type              |

## Consume

```css
/* CSS */
@import '@acronis-platform/design-theme/css';
```

```ts
// JS
import {
  brands,
  defaultBrand,
  tokens,
} from '@acronis-platform/design-theme/js';
```

CSS custom properties use the `--av-` prefix to stay consistent with the
legacy library's theming contract.

## Brands

The default brand (`acronis`) lives on `:root` / `.dark`. Every other brand
is a class-scoped override carrying only the tokens that differ:

```html
<html class="brand-b">
  <!-- brand-b, light -->
  <html class="brand-b dark">
    <!-- brand-b, dark -->
  </html>
</html>
```

`brands`, `defaultBrand`, and per-brand `tokens` are exported from `./js`.

## Scope

- **Color + gradient tokens**, `light` + `dark` schemes, all authored brands.
  Gradient tokens are emitted as `linear-gradient(...)` (angle from the Figma
  gradient transform).
- Deferred: typography/composite tokens and a per-scheme SCSS split. (Note:
  `brand-b` currently produces no overrides — it matches `acronis` on color
  tokens and inherits its gradients.)
