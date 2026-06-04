// The value transforms and the transform group the CSS builder applies. The
// group resolves DTCG values to CSS strings (color → rgb, dimension → px,
// remaining scalars → string, typography → a utility-class declaration block) and
// names tokens from their path (`name/kebab`, no prefix). Order matters: value
// transforms run before the name transform.

import { transforms as builtin } from 'style-dictionary/enums';

import { COLOR_HSL_RGB, colorHslToRgb } from './color-hsl-rgb';
import { DIMENSION_PX, dimensionPx } from './dimension-px';
import { SCALAR_CSS, scalarCss } from './scalar-css';
import { TYPOGRAPHY_CSS_CLASS, typographyCssClass } from './typography-css-class';

export { COLOR_HSL_RGB, DIMENSION_PX, SCALAR_CSS, TYPOGRAPHY_CSS_CLASS };

export const TRANSFORMS = [
  colorHslToRgb,
  dimensionPx,
  scalarCss,
  typographyCssClass,
];

export const ACRONIS_CSS_GROUP = 'acronis/css';

export const ACRONIS_CSS_TRANSFORMS = [
  COLOR_HSL_RGB,
  DIMENSION_PX,
  SCALAR_CSS,
  TYPOGRAPHY_CSS_CLASS,
  builtin.nameKebab,
];
