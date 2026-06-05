# AGENTS.md — `packages/tokens-pd`

`@acronis-platform/tokens-pd` — the **published** home for the Acronis platform
(PD) token artifacts: per-brand CSS custom properties, per-component CSS, Tailwind
presets, and a DTCG intermediate. Everything here is **generated** by
[`@acronis-platform/style-dictionary`](../../tools/style-dictionary) from
[`@acronis-platform/design-tokens`](../design-tokens) and **committed to git**.

Repo-wide rules live in the repo root's `./context/`. This file documents only
what's specific to this workspace.

## This package has no build logic

There are no source files to compile. `pnpm build` simply delegates to the tool:

```sh
pnpm --filter @acronis-platform/tokens-pd build
# → pnpm --filter @acronis-platform/style-dictionary build pd-css pd-tailwind
```

`pd-css`/`pd-tailwind` run their `pd-dtcg` dependency first. The tool writes its
token output directly into this package (paths centralized in the tool's
`src/platforms.ts`). To change a value, edit `@acronis-platform/design-tokens`
and rebuild — never hand-edit the generated files (they carry a DO-NOT-EDIT
header). `dev`/`clean`/`lint`/`typecheck` are no-ops; `test` re-runs the build.

## Layout (all generated, all committed)

Three top-level dirs — `css/`, `tailwind/`, `dtcg/`:

- `css/acronis.css` — semantic tier, default brand (full): `--ui-*` custom
  properties + `.ui-typography-*` utility classes.
- `css/brand-b.css` — semantic tier, non-default brand: **override-only**.
- `css/<component>/<brand>.css` — component tier, one dir per component
  (`button/`, `breadcrumb/`, …); default brand full, others override-only.
- `tailwind/<brand>.js` (+ `.d.ts`) — Tailwind preset with **baked** resolved
  values, consumed via `@config`.
- `dtcg/*.json` — the six per-mode, 100%-DTCG intermediate files.

## Conventions / scope

- **Naming `--ui-*`.** The `colors` tier root is dropped and every token is
  prefixed with `ui` (`colors.background.surface.primary` →
  `--ui-background-surface-primary`; `button._global.radius` →
  `--ui-button-global-radius`). Owned by the tool's `name/ui` transform.
- **Theming.** Colors are zipped into `light-dark()`; light/dark switches via the
  `[data-theme]` attribute + `color-scheme`. Base (`acronis`) files carry the
  `color-scheme` shell; override files are bare `:root {}` layered on top.
- **Brand model.** Bare `:root` (no brand class). An app picks one brand by
  importing the base + (optionally) that brand's override file — last import wins.
- **Override rule.** A non-default brand file contains a token only when its value
  **differs** from `acronis` or is **new** in that brand.
- **Tailwind preset** values are baked literals (no `--ui-*` dependency), so a
  preset is self-contained but brand selection is build-time (`@config`).

See `../../context/releasing.md` for the Changesets / publish flow. The tool's
own conventions live in [`../../tools/style-dictionary/AGENTS.md`](../../tools/style-dictionary/AGENTS.md).
