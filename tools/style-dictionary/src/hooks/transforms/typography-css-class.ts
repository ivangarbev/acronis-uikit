// Value transform `typography/css-class`: a composite DTCG typography `$value` →
// the CSS declaration block for a utility class (one `property: value;` per
// field). MUST be transitive (the exception to the group's non-transitive rule):
// a composite's sub-fields are references, so SD only applies a value transform to
// it on the transitive, post-resolution pass — a non-transitive one never fires on
// it at all. By then the sub-field aliases (`{font.font-size.32}`) are resolved —
// to strings like `32px`, or kept as `{ value, unit }` when written inline — which
// is why both the dimension and scalar primitives are needed. The `css/light-dark`
// format wraps the block in a `.typography-*` selector and owns indentation.

import type { Transform } from 'style-dictionary/types';
import { transformTypes } from 'style-dictionary/enums';

import { formatDimension, type DtcgDimension } from './dimension-px';
import { formatScalar } from './scalar-css';

export const TYPOGRAPHY_CSS_CLASS = 'typography/css-class';

// Composite typography field → CSS property, in emission order.
const PROPERTIES: ReadonlyArray<readonly [string, string]> = [
  ['fontFamily', 'font-family'],
  ['fontSize', 'font-size'],
  ['fontWeight', 'font-weight'],
  ['lineHeight', 'line-height'],
  ['letterSpacing', 'letter-spacing'],
];

const isDimension = (v: unknown): v is DtcgDimension =>
  typeof v === 'object' && v !== null && 'value' in v && 'unit' in v;

// A resolved typography sub-field → its CSS string, or null if unrepresentable.
// Sub-fields carry no `$type` of their own, so dispatch on shape: `{ value, unit }`
// is a dimension, anything else a number/string scalar. Shape is the only signal.
const formatField = (v: unknown): string | null => {
  if (isDimension(v)) return formatDimension(v);
  if (typeof v === 'number' || typeof v === 'string') return formatScalar(v);
  return null;
};

export const typographyCssClass: Transform = {
  name: TYPOGRAPHY_CSS_CLASS,
  type: transformTypes.value,
  transitive: true,
  filter: (token) => token.$type === 'typography',
  transform: (token) => {
    const fields = token.$value as Record<string, unknown>;
    const declarations: string[] = [];
    for (const [field, property] of PROPERTIES) {
      if (!(field in fields)) continue;
      const value = formatField(fields[field]);
      if (value !== null) declarations.push(`${property}: ${value};`);
    }
    return declarations.join('\n');
  },
};
