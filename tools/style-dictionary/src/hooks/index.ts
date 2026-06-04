// Static hook registry shared by every Style Dictionary instance this tool
// creates (via the `makeSd` factory in `../index.ts`). Preprocessors are
// intentionally absent: stage 1 normalizes its source by calling `normalizeTree`
// directly (see `../index.ts` buildDtcg) rather than running through SD, so no
// preprocessor hook is registered.

import type { Hooks } from 'style-dictionary/types';

import { semanticOnly, SEMANTIC_ONLY } from './filters/semantic-only';
import { cssLightDark, CSS_LIGHT_DARK } from './formats/css-light-dark';
import { ACRONIS_CSS_GROUP, ACRONIS_CSS_TRANSFORMS, TRANSFORMS } from './transforms';

export const STATIC_HOOKS: Hooks = {
  transforms: Object.fromEntries(
    TRANSFORMS.map(({ name, ...rest }) => [name, rest])
  ),
  transformGroups: { [ACRONIS_CSS_GROUP]: ACRONIS_CSS_TRANSFORMS },
  formats: { [CSS_LIGHT_DARK]: cssLightDark.format },
  filters: { [SEMANTIC_ONLY]: semanticOnly.filter },
};
