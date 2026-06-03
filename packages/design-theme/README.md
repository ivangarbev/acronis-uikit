# @acronis-platform/theme

Consumable **CSS / SCSS / JS** design-theme artifacts, generated from
[`@acronis-platform/tokens`](../design-tokens) (the raw DTCG token data) via
[Style Dictionary](https://styledictionary.com/).

The raw tokens are a Figma-exported, multi-dimensional DTCG variant that
no app can use directly — primitives carry per-scheme (`light`/`dark`)
values and semantic tokens carry per-brand (`acronis`/`brand-b`) aliases
back into the primitives. This package resolves that matrix into flat,
ready-to-consume artifacts.

## Build

```sh
pnpm --filter @acronis-platform/theme build
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
@import '@acronis-platform/theme/css';
```

```ts
// JS
import { light, dark, tokens } from '@acronis-platform/theme/js';
```

CSS custom properties use the `--av-` prefix to stay consistent with the
legacy library's theming contract.

## Scope (first iteration)

- **Color tokens only**, default `acronis` brand, `light` + `dark` schemes.
- Deferred: typography/composite tokens, the `brand-b` brand, and a
  per-scheme SCSS split.
