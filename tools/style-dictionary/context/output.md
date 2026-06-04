# Output — the CSS contract

Stage 2 writes one file per brand to `dist/tokens/pd-css/`: `acronis.css` and
`brand-b.css`. Each is self-contained: CSS custom properties for the color and
dimension tokens of the semantic + component tiers (colors in both light and
dark), followed by a block of typography utility classes.

## Theming — `light-dark()` + `color-scheme`

The modern, single-block approach (baseline-supported: Chrome 123+, Safari 17.5+,
Firefox 120+). Every variable lives in one `:root`; color values carry both modes
inline and the browser resolves them from `color-scheme`:

```css
:root {
  color-scheme: light dark;

  --colors-background-surface-primary: light-dark(rgb(255 255 255), rgb(0 0 0));
  --breadcrumb-gap: 4px;
}

[data-theme='light'] {
  color-scheme: light;
}
[data-theme='dark'] {
  color-scheme: dark;
}
```

By default the page follows the OS preference; setting `data-theme` on any
ancestor (or `color-scheme` directly) forces a mode for that subtree.

## Variable & class names

Derived straight from the token path, kebab-cased, **no prefix**:

- `colors.background.surface.primary` → `--colors-background-surface-primary`
- `button._global.radius` → `--button-global-radius` (leading `_` dropped)
- typography composites become a class → `.typography-body-default`

## Value formats

| Token `$type` | Output                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`       | `--…` custom property, `light-dark(<rgb>, <rgb>)` — modern `rgb(r g b)`, or `rgb(r g b / a)` when the color carries opacity (raw decimal alpha)   |
| `dimension`   | `--…` custom property, `<value><unit>`, e.g. `4px`, `0px`                                                                                         |
| `typography`  | a `.typography-…` class with one declaration per field: `font-family`, `font-size` (px), `font-weight`, `line-height` (px), `letter-spacing` (px) |
| `gradient`    | **skipped** (see below)                                                                                                                           |

Colors are always wrapped in `light-dark()`, even when the two modes resolve to
the same value — the output stays uniform and predictable. Dimensions and
typography are mode-invariant (they alias theme-less primitives), so they appear
once with a single value.

Typography is emitted as a utility class so a single class name applies the whole
text style:

```css
.typography-body-default {
  font-family: Inter;
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0px;
}
```

## Known MVP gap — gradients

The 4 `colors.background.ai.*` gradient tokens are **not** emitted. Faithful CSS
gradient output needs the Figma `gradientTransform` matrix mapped to a CSS angle;
emitting a guessed direction would be silently wrong, so they're skipped and the
build logs the count (`N unsupported tokens skipped: gradients`). Add gradient
support by handling `$type === 'gradient'` in the `css/light-dark` format
(`hooks/formats/css-light-dark.ts`) — the `$value` is a DTCG array of
`{ color, position }` stops; the transform is under
`$extensions.com.figma.gradientTransform`.
