// `kind: "scale"` — lossless resize. Set the root `width`/`height` to the target
// along the longer viewBox dimension (aspect preserved); PRESERVE the `viewBox`
// and all geometry. No coordinate is rewritten, so gradient / userSpaceOnUse
// artwork (illustrations) survives untouched. Returns the new rendered longer
// dimension so a following `stroke` rule can size strokes in rendered px.

import { longerDim, numAttr, type INode, type ViewBox } from '../svg-ast';

export function applyScale(root: INode, targetPx: number, vb: ViewBox): number {
  const longer = longerDim(vb);
  root.attributes.width = numAttr((targetPx * vb.width) / longer);
  root.attributes.height = numAttr((targetPx * vb.height) / longer);
  return targetPx;
}
