// currentColor pass — MONO packs only. Rewrite every hardcoded paint
// (`fill` / `stroke` / `stop-color`) to `currentColor` so the icon themes via the
// consumer's CSS `color`. Skips `none`, `transparent`, and gradient/pattern refs
// (`url(#…)`). MULTI packs and illustrations never run this (their exact colors
// and gradients are preserved).
//
// Runs as an explicit AST pass BEFORE SVGO — one parse, trivially testable, and
// it keeps SVGO purely an optimizer (its own `convertColors currentColor` is too
// blunt and order-sensitive).

import { walk, type INode } from './svg-ast';

const PAINT_ATTRS = ['fill', 'stroke', 'stop-color'] as const;

const isHardcoded = (value: string | undefined): boolean =>
  value != null && value !== 'none' && value !== 'transparent' && !value.startsWith('url(');

export function toCurrentColor(root: INode): void {
  walk(root, (node) => {
    for (const attr of PAINT_ATTRS) {
      if (isHardcoded(node.attributes[attr])) node.attributes[attr] = 'currentColor';
    }
  });
}
