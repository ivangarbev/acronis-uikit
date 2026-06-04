---
'@acronis-platform/design-theme': minor
---

Two additions:

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
