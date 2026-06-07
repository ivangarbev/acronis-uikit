---
'@acronis-platform/ui-react': minor
---

Align Button with the Figma design and add a dedicated ButtonIcon component.

**Button** now wires every style and interaction state directly to the
dedicated `--ui-button-*` component tokens (from `@acronis-platform/tokens-pd`)
instead of borrowing shared semantic tokens:

- Disabled states use the design's explicit per-variant disabled colors instead
  of a blanket `opacity-50`.
- The focus ring uses the `--ui-focus-*` tokens.
- Secondary now uses its dedicated border/background/label tokens (previously a
  generic `border-border` + surface-hover), and Ghost is a plain colored-text
  button (the underline-on-hover was removed to match the design).

**ButtonIcon** is a new icon-only button (32×32, 16px glyph) mirroring the Figma
`ButtonIcon` component, wired to the `--ui-button-icon-*` tokens.

**Breaking changes:**

- Removed the non-design Button variants `outline`, `link`, and `translucent`.
  The supported variants are now `default` (Primary), `secondary`, `ghost`,
  `destructive`, `ai`, and `inverted`.
- Removed the Button `size="icon"` option — use the new `ButtonIcon` component
  for icon-only buttons.
