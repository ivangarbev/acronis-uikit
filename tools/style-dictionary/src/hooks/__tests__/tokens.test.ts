// Token-domain unit tests: the two pure pieces stage 1 (dtcg) and stage 2 (css)
// are built from — the DTCG normalization preprocessor and the `light-dark()`
// zipping CSS format. These run without Style Dictionary or disk I/O, against a
// small in-memory fixture token tree, so the normalization rules and the
// light/dark zip stay pinned independently of a full `build`.

import type { Dictionary, TransformedToken } from 'style-dictionary/types';
import { describe, expect, it, vi } from 'vitest';

import { cssLightDark, type CssLightDarkOptions } from '../formats/css-light-dark';
import { normalizeTree } from '../preprocessors/acronis-dtcg';

// ── normalizeTree (stage 1) ──────────────────────────────────────────────────

// A fixture in the Acronis source shape: per-mode `values`, a `com.acronis.units`
// dimension, a `$value` composite, and a token scoped to a different platform.
const SOURCE = {
  $type: 'color',
  colors: {
    background: {
      base: {
        platforms: ['PD', 'WEB'],
        values: { light: { h: 0, s: 0, l: 100 }, dark: { h: 0, s: 0, l: 0 } },
      },
      'web-only': {
        platforms: ['WEB'],
        values: { light: { h: 1, s: 1, l: 1 }, dark: { h: 2, s: 2, l: 2 } },
      },
    },
  },
  spacing: {
    sm: {
      $type: 'dimension',
      platforms: ['PD'],
      $extensions: { 'com.acronis.units': { unit: 'px', value: 8 } },
    },
  },
  typography: {
    body: {
      $type: 'typography',
      platforms: ['PD'],
      $value: { fontFamily: 'Inter', fontSize: '14px' },
    },
  },
};

// Walk into a normalized tree by key path, keeping each level typed as a node
// (avoids `any` while still reaching `$value`/`$type` on the leaf).
type DtcgNode = Record<string, unknown>;
const at = (tree: unknown, ...keys: string[]): DtcgNode => {
  let node = tree as DtcgNode;
  for (const key of keys) node = node[key] as DtcgNode;
  return node;
};

describe('normalizeTree', () => {
  it('picks the requested mode out of each token `values` dict', () => {
    expect(at(normalizeTree(SOURCE, 'light', 'PD'), 'colors', 'background', 'base').$value).toEqual({
      h: 0,
      s: 0,
      l: 100,
    });
    expect(at(normalizeTree(SOURCE, 'dark', 'PD'), 'colors', 'background', 'base').$value).toEqual({
      h: 0,
      s: 0,
      l: 0,
    });
  });

  it('drops tokens not scoped to the requested platform, pruning empty groups', () => {
    const background = at(normalizeTree(SOURCE, 'light', 'PD'), 'colors', 'background');
    // `web-only` is WEB-scoped; `base` is the only PD child of `background`.
    expect(background['web-only']).toBeUndefined();
    expect(Object.keys(background)).toEqual(['base']);
  });

  it('reorders `com.acronis.units` into the DTCG `{ value, unit }` shape', () => {
    const sm = at(normalizeTree(SOURCE, 'light', 'PD'), 'spacing', 'sm');
    expect(sm.$type).toBe('dimension');
    expect(sm.$value).toEqual({ value: 8, unit: 'px' });
  });

  it('keeps a mode-invariant `$value` composite untouched', () => {
    expect(at(normalizeTree(SOURCE, 'light', 'PD'), 'typography', 'body').$value).toEqual({
      fontFamily: 'Inter',
      fontSize: '14px',
    });
  });

  it('strips the non-DTCG `platforms` array off normalized tokens', () => {
    expect('platforms' in at(normalizeTree(SOURCE, 'light', 'PD'), 'colors', 'background', 'base')).toBe(
      false
    );
  });

  it('returns an empty tree when no token matches the platform', () => {
    expect(normalizeTree(SOURCE, 'light', 'OTHER')).toEqual({});
  });
});

// ── cssLightDark format (stage 2) ────────────────────────────────────────────

const token = (over: Partial<TransformedToken>): TransformedToken =>
  ({ name: 'x', path: ['x'], ...over }) as TransformedToken;

const renderCss = (tokens: TransformedToken[], darkTokens = new Map<string, string>()): string => {
  const options: CssLightDarkOptions = { darkTokens, brand: 'acronis', label: 'test.css' };
  // The format is synchronous; SD types it as `string | Promise<string>`.
  return cssLightDark.format({
    dictionary: { allTokens: tokens } as Dictionary,
    file: { destination: 'test.css', format: 'x', options },
    platform: {},
    options: {},
  }) as string;
};

describe('cssLightDark format', () => {
  it('zips a color into light-dark() using its dark override', () => {
    const css = renderCss(
      [token({ name: 'color-bg', path: ['color', 'bg'], $type: 'color', $value: 'rgb(255 255 255)' })],
      new Map([['color.bg', 'rgb(0 0 0)']])
    );
    expect(css).toContain('--color-bg: light-dark(rgb(255 255 255), rgb(0 0 0));');
  });

  it('falls back to the light value when no dark override exists', () => {
    const css = renderCss([
      token({ name: 'color-bg', path: ['color', 'bg'], $type: 'color', $value: 'rgb(255 255 255)' }),
    ]);
    expect(css).toContain('--color-bg: light-dark(rgb(255 255 255), rgb(255 255 255));');
  });

  it('emits a dimension token as a plain custom property', () => {
    const css = renderCss([token({ name: 'spacing-sm', $type: 'dimension', $value: '8px' })]);
    expect(css).toContain('--spacing-sm: 8px;');
  });

  it('wraps a typography composite in a utility class selector', () => {
    const css = renderCss([
      token({ name: 'typography-body', $type: 'typography', $value: 'font-family: Inter;\nfont-size: 14px;' }),
    ]);
    expect(css).toContain('.typography-body {');
    expect(css).toContain('  font-family: Inter;');
  });

  it('skips unhandled token types and names them in the log note', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderCss([token({ name: 'grad', $type: 'gradient', $value: { stops: [] } as unknown as string })]);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('grad (gradient)'));
    log.mockRestore();
  });

  it('sorts custom properties by name for stable output', () => {
    const css = renderCss([
      token({ name: 'b-token', $type: 'dimension', $value: '2px' }),
      token({ name: 'a-token', $type: 'dimension', $value: '1px' }),
    ]);
    expect(css.indexOf('--a-token')).toBeLessThan(css.indexOf('--b-token'));
  });
});
