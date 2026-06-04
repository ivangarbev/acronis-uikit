// The token build domain: the two Style Dictionary stages that turn
// @acronis-platform/design-tokens into per-brand CSS. `index.ts` (the CLI)
// dispatches here; the SD hooks these stages share live in `hooks/`.
//
//   1. buildDtcg (`<filter>-dtcg`) — read the Acronis token files and emit six
//      per-mode, 100%-DTCG JSON files. Serialized from `normalizeTree` directly,
//      NOT via an SD format: SD's init normalization relocates `$type`, which
//      would break the intermediate's "every token self-describing, references
//      intact" contract. See context/pipeline.md.
//   2. buildCss (`<filter>-css`) — resolve those views per brand into one CSS
//      file each, zipping light/dark colors into `light-dark()`.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import StyleDictionary from 'style-dictionary';
import type { Config, File } from 'style-dictionary/types';

import { STATIC_HOOKS } from './hooks';
import { CSS_LIGHT_DARK, type CssLightDarkOptions } from './hooks/formats/css-light-dark';
import { SEMANTIC_ONLY } from './hooks/filters/semantic-only';
import { normalizeTree } from './hooks/preprocessors/acronis-dtcg';
import { ACRONIS_CSS_GROUP } from './hooks/transforms';
import { FILTER_ENUM, type Filter, type PlatformKey, rel, tokenDistDir } from './platforms';

// ── Sources ──────────────────────────────────────────────────────────────────
// Where the design data lives and how it is read.

/** A raw token tree (a DTCG-shaped JSON object). */
type TokenTree = Record<string, unknown>;

/** The three source token files, addressed via the package's `exports`. */
const TOKEN_SOURCES = {
  primitives: '@acronis-platform/design-tokens/tokens/primitives.json',
  semantic: '@acronis-platform/design-tokens/tokens/semantic.json',
  components: '@acronis-platform/design-tokens/tokens/components.json',
} as const;

type TokenSourceName = keyof typeof TOKEN_SOURCES;

/** Read and parse one source token file by name. */
function readTokenSource(name: TokenSourceName): TokenTree {
  const url = import.meta.resolve(TOKEN_SOURCES[name]);
  return JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as TokenTree;
}

// ── Shared design data ─────────────────────────────────────────────────────────

/**
 * Stage-1 outputs. `primitives` carries the Theme axis (light/dark); `semantic`
 * and `components` carry the Brand axis (acronis/brand-b). `mode` is the key to
 * pick out of each token's `values` dict; single-value tokens (units, font,
 * typography composites) are mode-invariant and emitted into every view of their
 * source file unchanged.
 */
interface DtcgView {
  out: string;
  source: TokenSourceName;
  mode: string;
}

const VIEWS: DtcgView[] = [
  { out: 'primitives-light', source: 'primitives', mode: 'light' },
  { out: 'primitives-dark', source: 'primitives', mode: 'dark' },
  { out: 'semantic-acronis', source: 'semantic', mode: 'acronis' },
  { out: 'semantic-brand-b', source: 'semantic', mode: 'brand-b' },
  { out: 'components-acronis', source: 'components', mode: 'acronis' },
  { out: 'components-brand-b', source: 'components', mode: 'brand-b' },
];

/**
 * Stage-2 brands. Each CSS file resolves its brand's semantic + component view
 * against both theme views of the primitives, zipping colors into `light-dark()`.
 */
interface Brand {
  name: string;
  semantic: string;
  components: string;
}

const BRANDS: Brand[] = [
  { name: 'acronis', semantic: 'semantic-acronis', components: 'components-acronis' },
  { name: 'brand-b', semantic: 'semantic-brand-b', components: 'components-brand-b' },
];

type Theme = 'light' | 'dark';

// ── Style Dictionary factory ─────────────────────────────────────────────────
// Every instance shares this tool's static hooks (transforms, transform group,
// format, filter). Stage 2 (css) is the only stage that runs through SD; stage 1
// (dtcg) writes normalized trees directly (see file header).

const makeSd = (config: Config): StyleDictionary =>
  new StyleDictionary({
    usesDtcg: true,
    log: { verbosity: 'silent', warnings: 'disabled' },
    hooks: STATIC_HOOKS,
    ...config,
  });

// ── Stage 1: dtcg ──────────────────────────────────────────────────────────────

export function buildDtcg(filter: Filter): void {
  const outDir = tokenDistDir(`${filter}-dtcg`);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  // Each source feeds several views (primitives → light + dark, etc.), so read
  // each file once up front rather than re-reading it per view.
  const sources = {} as Record<TokenSourceName, TokenTree>;
  for (const name of Object.keys(TOKEN_SOURCES) as TokenSourceName[]) {
    sources[name] = readTokenSource(name);
  }

  for (const view of VIEWS) {
    const tree = normalizeTree(sources[view.source], view.mode, FILTER_ENUM[filter]);
    const dest = path.join(outDir, `${view.out}.json`);
    writeFileSync(dest, `${JSON.stringify(tree, null, 2)}\n`);
    console.log(`✓ ${rel(dest)}`);
  }
}

// ── Stage 2: css ─────────────────────────────────────────────────────────────

const readView = (filter: Filter, name: string): Config['tokens'] =>
  JSON.parse(readFileSync(path.join(tokenDistDir(`${filter}-dtcg`), `${name}.json`), 'utf8'));

/** Merge a brand's semantic + component views with one theme of the primitives. */
const mergeViews = (filter: Filter, brand: Brand, theme: Theme): Config['tokens'] => ({
  ...readView(filter, `primitives-${theme}`),
  ...readView(filter, brand.semantic),
  ...readView(filter, brand.components),
});

const cssConfig = (filter: Filter, brand: Brand, theme: Theme, files: File[] = []): Config => {
  const key: PlatformKey = `${filter}-css`;
  return {
    tokens: mergeViews(filter, brand, theme),
    platforms: {
      [key]: {
        transformGroup: ACRONIS_CSS_GROUP,
        buildPath: `${tokenDistDir(key)}${path.sep}`,
        files,
      },
    },
  };
};

/** Resolve a theme to a `path → value` map of its color tokens (already `rgb()` strings). */
async function resolveColorMap(
  filter: Filter,
  brand: Brand,
  theme: Theme
): Promise<Map<string, string>> {
  const sd = makeSd(cssConfig(filter, brand, theme));
  const { allTokens } = await sd.getPlatformTokens(`${filter}-css`);
  return new Map(
    allTokens
      .filter((t) => t.$type === 'color')
      .map((t) => [t.path.join('.'), t.$value as string])
  );
}

export async function buildCss(filter: Filter): Promise<void> {
  const outDir = tokenDistDir(`${filter}-css`);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  for (const brand of BRANDS) {
    const darkTokens = await resolveColorMap(filter, brand, 'dark');
    const destination = `${brand.name}.css`;
    const options: CssLightDarkOptions & { showFileHeader: boolean } = {
      darkTokens,
      brand: brand.name,
      label: rel(path.join(outDir, destination)),
      showFileHeader: false,
    };

    const sd = makeSd(
      cssConfig(filter, brand, 'light', [
        { destination, format: CSS_LIGHT_DARK, filter: SEMANTIC_ONLY, options },
      ])
    );
    await sd.buildAllPlatforms();
  }
}
