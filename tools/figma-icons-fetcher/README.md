# @acronis-platform/figma-icons-fetcher

Private build tool. Fetches SVG icons from a Figma file, optimizes them with
SVGO, and writes them — with optional JSON manifests and mono/multicolor
categorization — into a target package.

It is the engine behind `packages/icons-svg`'s `pull-icons` script and the
`Fetch Figma Icons` GitHub Action. Not published to npm.

## Usage

The tool reads its configuration from `FIGMA_FETCHER_*` environment variables
(via `.env`, `.env.local`, then `process.env`). See
[`.env.local.example`](./.env.local.example) for the full list.

### As a workspace dependency (the normal path)

`packages/icons-svg` runs the tool from its own directory so that relative
output paths (`./src/svg`, …) and `.env.local` resolve there:

```bash
pnpm --filter @acronis-platform/icons-svg pull-icons
```

### Standalone

```bash
# from this workspace, with a local .env.local
pnpm --filter @acronis-platform/figma-icons-fetcher fetch-icons
```

### Programmatically

```ts
import { fetchIcons } from '@acronis-platform/figma-icons-fetcher';

await fetchIcons({
  token: '…',
  fileKey: '…',
  pageNames: ['Icons'],
  frameNames: ['16px', '24px'],
  outputDir: './icons',
});
```

## Configuration

| Variable                            | Required | Default            | Description                                  |
| ----------------------------------- | -------- | ------------------ | -------------------------------------------- |
| `FIGMA_FETCHER_FIGMA_TOKEN`         | yes      | —                  | Figma personal access token                  |
| `FIGMA_FETCHER_FILE_KEY`            | yes      | —                  | Figma file key from the file URL             |
| `FIGMA_FETCHER_PAGE_NAMES`          | yes      | —                  | Comma-separated page names containing icons  |
| `FIGMA_FETCHER_FRAME_NAMES`         | yes      | —                  | Comma-separated frame names containing icons |
| `FIGMA_FETCHER_OUTPUT_DIR`          | no       | `./icons`          | Primary output directory                     |
| `FIGMA_FETCHER_OUTPUT_DIRS`         | no       | `[]`               | Additional output directories (comma-sep)    |
| `FIGMA_FETCHER_GENERATE_MANIFESTS`  | no       | `false`            | Write per-page + combined JSON manifests     |
| `FIGMA_FETCHER_MANIFEST_DIR`        | no       | `./manifests`      | Manifest output directory                    |
| `FIGMA_FETCHER_CATEGORIZE_BY_COLOR` | no       | `false`            | Split icons into mono/multicolor dirs        |
| `FIGMA_FETCHER_MONOCOLOR_DIR`       | no       | `monocolor-icons`  | Monocolor output directory                   |
| `FIGMA_FETCHER_MULTICOLOR_DIR`      | no       | `multicolor-icons` | Multicolor output directory                  |
| `FIGMA_FETCHER_CLASS_NAME`          | no       | _(none)_           | CSS class added to the SVG root              |
| `FIGMA_FETCHER_SYSTEM_COLOR`        | no       | `#181818`          | Hex color replaced with `currentColor`       |

## Sync behavior

- `outputDir` (and any `outputDirs`) are **fully replaced** with the current
  set of icons from Figma — a clean sync.
- `monocolor-icons/` and `multicolor-icons/` are **never cleaned**; only icons
  that are new since the last sync are added. This preserves legacy icons that
  were removed from Figma but are still referenced in consuming code.

## Scripts

| Script        | What it does                        |
| ------------- | ----------------------------------- |
| `fetch-icons` | Runs the fetch (`tsx src/index.ts`) |
| `test`        | Unit specs (`vitest run`)           |
| `lint`        | ESLint                              |
| `typecheck`   | `tsc --noEmit`                      |

`build`/`dev`/`clean` are no-ops — this is a runtime tool, not a compiled
artifact.
