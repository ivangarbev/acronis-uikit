// Shared platform-key model + output locations — the axes the CLI and both build
// domains (tokens, assets) agree on, owned by none of them (so neither domain has
// to import the CLI). A build target is `${filter}-${output}`: `filter` maps to
// the `platforms` enum (PD | WEB) that both design-tokens and design-assets
// declare; `output` is the artifact kind. Output lands under `dist/tokens/`
// (dtcg, css) or `dist/assets/` (assets).

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ASSET_FILTERS } from './assets';

export type Filter = 'pd' | 'web';
export type Output = 'dtcg' | 'css' | 'assets';
export type PlatformKey = `${Filter}-${Output}`;

/** Filter slug → the `platforms` enum value kept by normalization / asset filtering. */
export const FILTER_ENUM: Record<Filter, 'PD' | 'WEB'> = { pd: 'PD', web: 'WEB' };

/** Token filters that have source data today. WEB lands here when it exists. */
export const FILTERS: Filter[] = ['pd'];

export const OUTPUTS: Output[] = ['dtcg', 'css', 'assets'];

/**
 * Which filters have source data for a given output. `dtcg`/`css` come from the
 * token package (PD today). `assets` come from `@acronis-platform/design-assets`,
 * which already spans both platforms — icons/concept-pack are PD, illustrations
 * WEB, selected per-asset by each asset's `platforms`. So the asset build runs for
 * `ASSET_FILTERS` (pd + web), independently of the token `FILTERS`.
 */
export const filtersFor = (output: Output): Filter[] =>
  output === 'assets' ? (ASSET_FILTERS as Filter[]) : FILTERS;

/** Every filter that appears in any output — the valid `--filter` values. */
export const ALL_FILTERS: Filter[] = [...new Set<Filter>([...FILTERS, ...(ASSET_FILTERS as Filter[])])];

/** Tool root (`tools/style-dictionary/`). */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Gitignored build output root. `dist/` splits into `tokens/` and `assets/`. */
export const DIST = path.join(ROOT, 'dist');

/** Token artifacts live under `dist/tokens/<key>/` (e.g. `dist/tokens/pd-css/`). */
export const tokenDistDir = (key: PlatformKey): string => path.join(DIST, 'tokens', key);

/** Asset deliverables live under `dist/assets/<filter>-<group>-<format>/`. */
export const ASSETS_DIST = path.join(DIST, 'assets');

/** Path relative to CWD, for log lines. */
export const rel = (p: string): string => path.relative(process.cwd(), p);
