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
- Use semantic Tailwind color names (`bg-primary`, `text-foreground`,
  `border-border`, …). They are bridged to the generated `--av-*` tokens in
  `src/styles/index.css`. If a component needs a color name that isn't
  bridged yet, add it to the `@theme inline` block pointing at the relevant
  `@acronis-platform/theme` token — never hard-code a hex/hsl value.

## Accessibility

- Lean on Base UI primitives for keyboard nav, focus management, and ARIA.
- A11y is checked in Storybook via `@storybook/addon-a11y`.

## Theming source of truth

`@acronis-platform/tokens` (raw DTCG) → `@acronis-platform/theme` (generated
CSS/SCSS/JS) → this package's `@theme` bridge → component utilities. Change
colors upstream and rebuild `theme`; don't fork values here.
