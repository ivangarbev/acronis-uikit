import primitivesJson from '@acronis-platform/design-tokens/tokens/primitives.json' with { type: 'json' };
import semanticJson from '@acronis-platform/design-tokens/tokens/semantic.json' with { type: 'json' };

// The raw tokens are a Figma-exported DTCG variant that no consumer can use
// directly: primitives carry per-scheme values, semantic tokens carry
// per-brand aliases that point back into primitives.
//
//   primitive: { "values": { "light": {colorSpace, components}, "dark": {...} } }
//   semantic:  { "values": { "acronis": "{palette.blue.3}", "brand-b": "..." } }
//
// `resolveTree` flattens this matrix for one (brand, scheme) pair into a
// plain Style-Dictionary token tree with concrete values, resolving the
// semantic → primitive alias chain itself (references only ever point at
// primitives, so a single lookup pass is enough). Color tokens and gradient
// tokens (color-stop arrays → CSS `linear-gradient`) are emitted; typography
// and other composite tokens are out of scope.

export type Scheme = 'light' | 'dark';
export type Brand = 'acronis' | 'brand-b';

/** The brand emitted at `:root` (other brands are class-scoped overrides). */
export const DEFAULT_BRAND = 'acronis';

export interface SdToken {
  value: string;
  type: string;
}
export type SdTree = { [key: string]: SdToken | SdTree };

interface DtcgColor {
  colorSpace: string;
  components: number[];
  alpha?: number;
}

const primitives = primitivesJson as Record<string, unknown>;
const semantic = semanticJson as Record<string, unknown>;

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function formatColor(color: DtcgColor): string {
  if (color.colorSpace !== 'hsl') {
    throw new Error(`Unsupported colorSpace "${color.colorSpace}"`);
  }
  const [h, s, l] = color.components;
  const base = `hsl(${round(h)} ${round(s)}% ${round(l)}%)`;
  if (color.alpha != null && color.alpha !== 1) {
    return `hsl(${round(h)} ${round(s)}% ${round(l)}% / ${round(color.alpha)})`;
  }
  return base;
}

interface GradientStop {
  color: DtcgColor;
  position: number;
}

/**
 * Convert a Figma gradient transform matrix to a CSS angle. The gradient
 * parameter progresses along the first row's linear part `(a, c)` in the
 * shape's (y-down) space; CSS 0deg points up and increases clockwise, so the
 * angle is `atan2(a, -c)`. Identity (`[[1,0,0],[0,1,0]]`) → 90deg (to right).
 */
function gradientAngle(transform: unknown): number {
  const m = transform as number[][] | undefined;
  const a = m?.[0]?.[0] ?? 0;
  const c = m?.[0]?.[1] ?? 1;
  const deg = (Math.atan2(a, -c) * 180) / Math.PI;
  return round(((deg % 360) + 360) % 360);
}

function formatGradient(stops: GradientStop[], transform: unknown): string {
  const css = stops
    .map((s) => `${formatColor(s.color)} ${round(s.position * 100)}%`)
    .join(', ');
  return `linear-gradient(${gradientAngle(transform)}deg, ${css})`;
}

function isMeta(key: string): boolean {
  return key.startsWith('$') || key === 'platforms';
}

function isLeaf(node: Record<string, unknown>): boolean {
  return 'values' in node || '$value' in node;
}

/** Flat map of `palette.x.y` → resolved color string, for the given scheme. */
function buildPrimitiveLookup(scheme: Scheme): Map<string, string> {
  const lookup = new Map<string, string>();
  const walk = (node: Record<string, unknown>, path: string[]): void => {
    if (isLeaf(node)) {
      const values = node.values as Record<string, DtcgColor> | undefined;
      const value = values?.[scheme];
      if (value?.colorSpace) {
        lookup.set(path.join('.'), formatColor(value));
      }
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (isMeta(key) || typeof child !== 'object' || child === null) continue;
      walk(child as Record<string, unknown>, [...path, key]);
    }
  };
  walk(primitives.palette as Record<string, unknown>, ['palette']);
  return lookup;
}

function setIn(tree: SdTree, path: string[], token: SdToken): void {
  let node = tree;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    node[key] = (node[key] as SdTree) ?? {};
    node = node[key] as SdTree;
  }
  node[path[path.length - 1]] = token;
}

const ALIAS_RE = /^\{(.+)\}$/;

/**
 * Resolve the full color token set for one (brand, scheme) into a
 * Style-Dictionary tree with concrete values (no references).
 */
export function resolveTree(scheme: Scheme, brand: string): SdTree {
  const primitiveLookup = buildPrimitiveLookup(scheme);
  const tree: SdTree = {};

  // Primitives: emit the whole resolved palette under `palette.*`.
  for (const [path, value] of primitiveLookup) {
    setIn(tree, path.split('.'), { value, type: 'color' });
  }

  // Semantic colors: pick the brand value, resolve aliases into primitives.
  const walk = (node: Record<string, unknown>, path: string[]): void => {
    if (isLeaf(node)) {
      const values = node.values as Record<string, unknown> | undefined;
      const raw = values?.[brand];
      if (typeof raw === 'string') {
        const alias = ALIAS_RE.exec(raw)?.[1];
        const resolved = alias ? primitiveLookup.get(alias) : undefined;
        if (resolved) setIn(tree, path, { value: resolved, type: 'color' });
      } else if (Array.isArray(raw)) {
        // Gradient token: stops + a Figma transform matrix → CSS linear-gradient.
        const ext = node.$extensions as Record<string, unknown> | undefined;
        setIn(tree, path, {
          value: formatGradient(
            raw as GradientStop[],
            ext?.['com.figma.gradientTransform']
          ),
          type: 'gradient',
        });
      } else if (raw && typeof raw === 'object' && 'colorSpace' in raw) {
        setIn(tree, path, {
          value: formatColor(raw as DtcgColor),
          type: 'color',
        });
      }
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (isMeta(key) || typeof child !== 'object' || child === null) continue;
      walk(child as Record<string, unknown>, [...path, key]);
    }
  };
  walk(semantic.colors as Record<string, unknown>, ['colors']);

  return tree;
}

/** Flat `kebab-var-name` → value map for the given (brand, scheme). */
export function resolveFlat(
  scheme: Scheme,
  brand: string
): Record<string, string> {
  const flat: Record<string, string> = {};
  const walk = (node: SdTree, path: string[]): void => {
    for (const [key, child] of Object.entries(node)) {
      if (typeof (child as SdToken).value === 'string') {
        flat[[...path, key].join('-')] = (child as SdToken).value;
      } else {
        walk(child as SdTree, [...path, key]);
      }
    }
  };
  walk(resolveTree(scheme, brand), []);
  return flat;
}

/**
 * Brands authored in the semantic tokens (the keys of each token's `values`),
 * with the default brand first. Primitives are brand-independent; only
 * semantic tokens carry a per-brand alias.
 */
export function listBrands(): string[] {
  const brands = new Set<string>();
  const walk = (node: Record<string, unknown>): void => {
    if (isLeaf(node)) {
      const values = node.values as Record<string, unknown> | undefined;
      if (values) for (const key of Object.keys(values)) brands.add(key);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (isMeta(key) || typeof child !== 'object' || child === null) continue;
      walk(child as Record<string, unknown>);
    }
  };
  walk(semantic.colors as Record<string, unknown>);
  const rest = [...brands].filter((b) => b !== DEFAULT_BRAND).sort();
  return [DEFAULT_BRAND, ...rest];
}
