// Naming + SVG→JSX helpers for the React code generator. Converts kebab asset ids
// to PascalCase component names, SVG attribute names to React prop names, and an
// svgson element subtree to a JSX string.

import type { INode } from '../svg-ast';

/** `arrow-square-up-right` → `ArrowSquareUpRight`. Digit-first ids get an `Icon` prefix. */
export function pascalCase(id: string): string {
  const pascal = id
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return /^[0-9]/.test(pascal) ? `Icon${pascal}` : pascal;
}

/** Style label (pack name) → a `variant` union member, e.g. `icons-stroke-mono` → `stroke-mono`. */
export const styleLabel = (pack: string): string => pack.replace(/^icons-/, '');

const SPECIAL_ATTRS: Record<string, string> = {
  class: 'className',
  'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace',
};

/** SVG attribute name → React prop name (`stroke-width` → `strokeWidth`). */
export function jsxAttrName(name: string): string {
  if (SPECIAL_ATTRS[name]) return SPECIAL_ATTRS[name];
  if (name.startsWith('data-') || name.startsWith('aria-')) return name;
  if (!name.includes('-') && !name.includes(':')) return name;
  return name
    .replace(/:/g, '-')
    .split('-')
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');
}

/** Inline `style="a:b;c:d"` → a JSX style object literal `{{ a: 'b', c: 'd' }}`. */
function styleObject(value: string): string {
  const entries = value
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((decl) => {
      const idx = decl.indexOf(':');
      const prop = decl.slice(0, idx).trim();
      const val = decl.slice(idx + 1).trim();
      const camel = prop.startsWith('--')
        ? prop
        : prop.split('-').map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1))).join('');
      return `${JSON.stringify(camel)}: ${JSON.stringify(val)}`;
    });
  return `{{ ${entries.join(', ')} }}`;
}

/** Serialize one element node (and its children) to JSX. `skipAttrs` drops e.g. lifted `stroke-width`. */
export function nodeToJsx(node: INode, skipAttrs: Set<string> = new Set()): string {
  if (node.type === 'text') {
    const text = node.value.trim();
    return text ? text : '';
  }
  if (node.type !== 'element') return '';

  const attrs = Object.entries(node.attributes)
    .filter(([k]) => !skipAttrs.has(k))
    .map(([k, v]) => {
      if (k === 'style') return `style=${styleObject(v)}`;
      return `${jsxAttrName(k)}=${JSON.stringify(v)}`;
    });
  const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';

  const childJsx = node.children.map((c) => nodeToJsx(c, skipAttrs)).filter(Boolean);
  if (childJsx.length === 0) return `<${node.name}${attrStr} />`;
  return `<${node.name}${attrStr}>${childJsx.join('')}</${node.name}>`;
}
