// `kind: "stroke"` — set every stroked element's `stroke-width` so it RENDERS at
// the target px in the final image. After any preceding `scale` the user-unit →
// px ratio is `renderedLonger / viewBoxLonger`, so to show `S` px the attribute
// value in user units is `S * viewBoxLonger / renderedLonger`. Filled-only
// elements (no own non-`none` `stroke`) are untouched.
//
// Limitation: only elements carrying their own `stroke` attribute are matched;
// a stroke inherited from an ancestor `<g>` or set via CSS is not rewritten.
// Every source SVG today strokes on the leaf element, so this is exact for them.

import { longerDim, numAttr, walk, type INode, type ViewBox } from '../svg-ast';

const isStroked = (node: INode): boolean => {
  const stroke = node.attributes.stroke;
  return stroke != null && stroke !== 'none';
};

export function applyStroke(root: INode, targetPx: number, vb: ViewBox, renderedLonger: number): void {
  const userUnits = (targetPx * longerDim(vb)) / renderedLonger;
  walk(root, (node) => {
    if (isStroked(node)) node.attributes['stroke-width'] = numAttr(userUnits);
  });
}
