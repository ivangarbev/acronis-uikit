// Thin wrappers over svgson: parse an SVG string to a mutable AST, walk its
// element nodes, read the root viewBox, and serialize back. The executor and the
// rule/color passes mutate the AST in place through these helpers.

import { parseSync, stringify, type INode } from 'svgson';

export type { INode };

export const parseSvg = (svg: string): INode => parseSync(svg);

export const serializeSvg = (root: INode): string => stringify(root);

/** Visit every element node in document order, root included. */
export function walk(node: INode, visit: (node: INode) => void): void {
  if (node.type === 'element') visit(node);
  for (const child of node.children) walk(child, visit);
}

export interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

/** Parse the root `viewBox`; throws if absent or malformed (all sources have one). */
export function readViewBox(root: INode): ViewBox {
  const raw = root.attributes.viewBox;
  if (!raw) throw new Error('svg root has no viewBox');
  const parts = raw.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    throw new Error(`malformed viewBox: "${raw}"`);
  }
  const [minX, minY, width, height] = parts;
  return { minX, minY, width, height };
}

/** The longer of the two viewBox dimensions (scale operates along this axis). */
export const longerDim = (vb: ViewBox): number => Math.max(vb.width, vb.height);

/**
 * Format a number for an SVG attribute: round to a few decimals and drop trailing
 * zeros so `2.4`/`16` stay clean (SVGO would otherwise re-introduce noise).
 */
export function numAttr(n: number): string {
  return Number(n.toFixed(4)).toString();
}
