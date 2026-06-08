# @acronis-platform/icons-svg

Raw SVG icon sources for Acronis — **monocolor** and **multicolor** icons
fetched from Figma, plus per-page JSON manifests. Private, source-only: it ships
no build artifact and is consumed in-repo directly from `src/`.

```
src/
  svg/                # full current set, replaced on every Figma sync
  monocolor-icons/    # single-color icons (never auto-deleted)
  multicolor-icons/   # multi-color icons (never auto-deleted)
  figma/              # per-page + combined JSON manifests (icon name lists)
```

## Importing (in-repo)

```ts
// raw SVG markup (resolved via the package "exports" map)
import addIcon from '@acronis-platform/icons-svg/monocolor/add--16.svg';
import statusIcon from '@acronis-platform/icons-svg/multicolor/status-ok--24.svg';

// a manifest (array of icon names)
import actions from '@acronis-platform/icons-svg/figma/actions.json' with { type: 'json' };
```

## Syncing icons from Figma

Icons are pulled by `@acronis-platform/figma-icons-fetcher`.

### Locally (then open a PR yourself)

1. Get a token at https://www.figma.com/developers/api#access-tokens
2. Copy `.env.local.example` → `.env.local` and set `FIGMA_FETCHER_FIGMA_TOKEN`
   (the file key, page, and frame names are pre-filled).
3. Run the sync, then commit and open a PR:

```bash
pnpm --filter @acronis-platform/icons-svg pull-icons
git checkout -b chore/figma-icons-sync
git add packages/icons-svg/src
git commit -m "chore(icons-svg): sync icons from Figma"
```

### Via CI

The **Fetch Figma Icons** GitHub Action (`.github/workflows/icons-fetch.yml`)
runs the same sync on demand (Actions tab → Run workflow) and opens a pull
request with any changes.

## Sync behavior

- `src/svg/` is a **clean mirror** of the current Figma set.
- `src/monocolor-icons/` and `src/multicolor-icons/` are **append-only** — new
  icons are added, existing ones are never removed, preserving icons that left
  Figma but are still referenced.

## Maintenance

`pnpm --filter @acronis-platform/icons-svg fix-viewbox` normalizes any
monocolor SVG whose `viewBox` has a negative origin, shifting absolute path
coordinates so the origin becomes `0 0`.
