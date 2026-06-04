// Value transform: remaining scalar leaf values → a CSS-ready string. Catches
// standalone numeric/string tokens that aren't a color, dimension, typography, or
// gradient. Strings containing whitespace (font-family stacks) are quoted;
// everything else is stringified. The `typography/css-class` transform reuses
// `formatScalar` for its number/string sub-fields.

import type { Transform } from 'style-dictionary/types';
import { transformTypes } from 'style-dictionary/enums';

export const SCALAR_CSS = 'scalar/css';

// Types handled by their own transform or skipped by the format, never here.
const HANDLED_ELSEWHERE = new Set(['color', 'dimension', 'typography', 'gradient']);

/**
 * A resolved scalar (number or string) → a CSS-ready string. Whitespace-bearing
 * strings (font-family stacks) are quoted; everything else is stringified.
 */
export const formatScalar = (v: number | string): string =>
  typeof v === 'string' ? (/\s/.test(v) ? JSON.stringify(v) : v) : String(v);

export const scalarCss: Transform = {
  name: SCALAR_CSS,
  type: transformTypes.value,
  transitive: false,
  filter: (token) =>
    !HANDLED_ELSEWHERE.has(token.$type as string) &&
    (typeof token.$value === 'number' || typeof token.$value === 'string'),
  transform: (token) => formatScalar(token.$value as number | string),
};
