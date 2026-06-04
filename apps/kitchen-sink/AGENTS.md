# AGENTS.md — `apps/kitchen-sink`

`@acronis-platform/kitchen-sink` — a single-page "kitchen sink" that renders
**everything at once**: the `--av-*` design tokens / colors, default HTML
element styles, the implemented `@acronis-platform/ui-react` components, and
the `@acronis-platform/icons-react` packs. A visual reference / QA surface.
**Private**, not published.

Cross-cutting topics live in `../../context/*.md`. This file documents only
what's specific to this workspace.

## It consumes the libraries like a real consumer (from `dist`)

Unlike `apps/demo` (which aliases the legacy library to source), this app
imports `@acronis-platform/ui-react` and `@acronis-platform/icons-react` by
**package name**, resolved from their built `dist`. So the page reflects what
a published consumer actually gets.

Consequence: the dependency libraries must be built before this app's `dev`,
`build`, or `typecheck` resolves them.

- `predev` / `prebuild` run `pnpm --filter "@acronis-platform/kitchen-sink^..." build`
  (builds `ui-react`, `icons-react`, and their deps in topological order).
- For `pnpm -r typecheck` (CI / pre-commit), CI builds those packages first
  (see `.github/workflows/ci.yml`, mirroring the `ui-legacy` step). `pnpm -r`
  is topological, so a plain `pnpm -r build` also builds them before this app.

## Styling

`src/main.tsx` imports `@acronis-platform/ui-react/styles` — the built CSS that
already bundles the reset (default element styles), the `--av-*` tokens
(`:root` + `.dark`), and the component utilities. The page's own layout uses
inline styles + `var(--av-*)` tokens; there is **no Tailwind pipeline here**.

## Sections (`src/sections/`)

- `colors.tsx` — enumerates `--av-*` custom properties from the loaded
  stylesheets at runtime (`src/lib/tokens.ts`); values resolve live per theme.
- `elements.tsx` — raw HTML elements (headings, lists, table, native form
  controls) as the reset renders them.
- `components.tsx` — `ui-react` `Button` (variants/sizes/states/with-icons) and
  `Switch`.
- `icons.tsx` — galleries for all four `icons-react` packs.

Light/dark is toggled by adding the `dark` class to `<html>` (`src/App.tsx`).

## Run

```sh
pnpm --filter @acronis-platform/kitchen-sink dev   # builds deps, then serves on :3001
```
