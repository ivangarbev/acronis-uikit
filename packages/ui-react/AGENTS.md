# AGENTS.md — `packages/ui-react`

`@acronis-platform/ui-react` — the next-generation Acronis React component
library: a **Base UI implementation** themed by `@acronis-platform/theme`
(which is generated from `@acronis-platform/tokens`).

Repo-wide rules (TypeScript, file naming, editing rules, Conventional
Commits, Changesets) live in the repo root's `./context/` and apply on
top of this file.

## Always-loaded workspace context

@context/conventions.md

## How this differs from `packages/ui-legacy`

- **Base UI first.** Primitives come from `@base-ui/react`, a **direct
  dependency** (legacy treats it as an optional peer and mixes in Radix).
  Don't add Radix here. For element composition use Base UI's `useRender`
  - `mergeProps` (the `render` prop), not Radix `Slot` / `asChild`.
- **Theming via generated tokens.** Color comes from
  `@acronis-platform/theme` (`--av-*` CSS custom properties). `src/styles/
index.css` bridges those onto Tailwind color names via `@theme inline`.
  Don't hand-author theme values here — change them in
  `@acronis-platform/tokens` and rebuild `@acronis-platform/theme`.

## Shared conventions kept from legacy

- React **functional components**; `React.forwardRef` for ref-accepting
  primitives.
- **`class-variance-authority`** for variants; expose them via
  `VariantProps`. Merge classes with `cn()` (`src/lib/utils.ts`).
- **Tailwind CSS v4** utilities. PascalCase component names; kebab-case files.

## File layout per component

```
src/components/ui/<component>/
├── <component>.tsx
├── index.ts
├── __tests__/<component>.test.tsx
└── __stories__/<component>.stories.tsx
```

## Stack

- React 19, TypeScript, Vite 6 (library build via `vite.lib.config.ts`),
  Vitest 4 + React Testing Library (happy-dom), Storybook 10, Tailwind v4.

## When you add or change anything in `src/`

1. Add a Vitest test under the component's `__tests__/`.
2. Add a Storybook story under the component's `__stories__/` covering
   all variants, checked under light **and** dark mode.
3. Add a Changeset: `pnpm changeset` (from repo root).

See `../../context/releasing.md` for the Changesets / publish flow.
