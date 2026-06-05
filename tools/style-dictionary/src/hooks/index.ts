// Static hook registry shared by every Style Dictionary instance this tool
// creates (via the `makeSd` factory in `../tokens.ts`). Preprocessors are
// intentionally absent: stage 1 normalizes its source by calling `normalizeTree`
// directly (see `../tokens.ts` buildDtcg) rather than running through SD, so no
// preprocessor hook is registered. CSS emission is also driven directly from the
// resolved tokens (`collectDecls`/`serializeCss`), so no output `format` is
// registered either — SD is used only to resolve aliases and run the transforms.

import type { Hooks } from 'style-dictionary/types';

import { semanticOnly, SEMANTIC_ONLY } from './filters/semantic-only';
import { ACRONIS_CSS_GROUP, ACRONIS_CSS_TRANSFORMS, TRANSFORMS } from './transforms';

export const STATIC_HOOKS: Hooks = {
  transforms: Object.fromEntries(
    TRANSFORMS.map(({ name, ...rest }) => [name, rest])
  ),
  transformGroups: { [ACRONIS_CSS_GROUP]: ACRONIS_CSS_TRANSFORMS },
  filters: { [SEMANTIC_ONLY]: semanticOnly.filter },
};
