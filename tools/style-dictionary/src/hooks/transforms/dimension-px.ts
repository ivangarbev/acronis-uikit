// Value transform: resolved DTCG dimension (`{ value, unit }`) → e.g. `14px`.
// Only top-level dimension tokens — the dimension-typed sub-fields of typography
// composites reuse `formatDimension` from inside the `typography/css-class`
// transform.

import type { Transform } from 'style-dictionary/types';
import { transformTypes } from 'style-dictionary/enums';

export const DIMENSION_PX = 'dimension/px';

/** A resolved DTCG dimension value. */
export interface DtcgDimension {
  value: number;
  unit: string;
}

/** A resolved dimension → its CSS string, e.g. `14px`. */
export const formatDimension = (d: DtcgDimension): string => `${d.value}${d.unit}`;

export const dimensionPx: Transform = {
  name: DIMENSION_PX,
  type: transformTypes.value,
  transitive: false,
  filter: (token) => token.$type === 'dimension',
  transform: (token) => formatDimension(token.$value as DtcgDimension),
};
