# Coding conventions — `packages/ui-react`

Workspace-specific conventions for the Base-UI-based component library.
These build on the repo-wide rules in `<repo-root>/context/conventions.md`
(TypeScript, file naming, editing rules, catalog versions) — they do not
repeat them.

## React + TypeScript

- React **functional components** only. No class components.
- Use `React.forwardRef` for components that accept refs.
- Define prop interfaces extending the appropriate HTML attribute type, or
  the Base UI primitive's own props (`React.ComponentPropsWithoutRef<typeof
Primitive.Root>`).
- Use `VariantProps<typeof xxxVariants>` from `class-variance-authority`
  for variant typing.
- **Components**: PascalCase. **Files**: kebab-case.

## Composition

- This package is the **Base UI** implementation. Wrap `@base-ui/react`
  primitives for anything stateful/interactive (switch, dialog, menu, …).
- For plain elements that need polymorphism (e.g. Button rendering as `<a>`
  or composing with another component), use Base UI's **`useRender`** hook
  with **`mergeProps`** and expose a `render` prop. Do **not** pull in
  `@radix-ui/react-slot` / `asChild` — that's the legacy pattern.

## Styling

- **Tailwind CSS v4** utility classes. Merge with `cn()` from
  `src/lib/utils.ts` (wraps `clsx` + `tailwind-merge`).
- **Never hard-code a hex/hsl value.** Every color must resolve to a generated
  `@acronis-platform/tokens-pd` token (`--ui-*`). This is the one hard rule;
  the next two points are about _how_ you reference the token.

### Bridged names vs. direct token references

There are two valid ways to drive a color from a token. Pick by **how shared
the token is**, not by habit:

- **Shared semantic vocabulary → bridge a name.** Colors reused across many
  components (`bg-primary`, `text-foreground`, `border-border`, …) are bridged
  to the `--ui-*` tokens in `src/styles/index.css`'s `@theme inline` block, and
  components use the short Tailwind name. The bridge exists so a token is
  renamed/re-pointed **once** and every consumer follows. If a shared color
  isn't bridged yet, add it there.
- **Component-specific tokens → reference the token directly** with an
  arbitrary-value utility: `bg-[var(--ui-button-primary-background-idle)]`,
  `hover:border-[var(--ui-button-secondary-border-hover)]`. Use this for the
  dense, single-component token sets (`--ui-button-*`, `--ui-switch-*`, …) whose
  names are already systematic. Bridging these would be a 1:1 mechanical rename
  used in exactly one place — pure indirection that just adds a second naming
  layer to keep in sync. Arbitrary values are first-class Tailwind and still
  carry `hover:`/`active:`/`disabled:` variants.

  Rule of thumb: **bridge what's reused; reference component-local tokens
  directly.** A 1:1 alias consumed by a single component is a smell — skip it.

- Because both forms compile to `var(--ui-*)` references resolved at paint time,
  brand/theme overrides (the `[data-theme]` attribute, brand `:root` overrides)
  are honored automatically. Corollary for **stateful** colors: wire **each
  state to its own token** (`hover:` → `*-hover`, `disabled:` → `*-disabled`)
  even when the default brand's value happens to match `*-idle` — another brand
  may define a distinct per-state value, and only the referenced token is
  honored. See `components/ui/button/button.tsx`.

## Accessibility

- Lean on Base UI primitives for keyboard nav, focus management, and ARIA.
- A11y is checked in Storybook via `@storybook/addon-a11y`.

## Theming source of truth

`@acronis-platform/design-tokens` (upstream source package; raw Design Tokens
Community Group (DTCG) format) → `@acronis-platform/tokens-pd` (generated CSS
output package, built by `tools/style-dictionary`) → this package's `@theme`
bridge → component utilities. Change colors in `design-tokens` and rebuild
`tokens-pd`; don't fork values here.
