// Name transform `name/ui`: derive a token's CSS name from its path with the
// Acronis `ui` convention — drop a leading `colors` tier segment, prefix every
// token with `ui`, kebab-join the rest. So `colors.background.surface.primary` →
// `ui-background-surface-primary`, `button._global.radius` → `ui-button-global-radius`,
// and the typography composite `typography.body.default` → `ui-typography-body-default`
// (the format renders that as the `.ui-typography-*` class selector).

import type { Transform } from 'style-dictionary/types';
import { transformTypes } from 'style-dictionary/enums';

export const NAME_UI = 'name/ui';

export const uiName = (path: string[]): string => {
  const segments = path[0] === 'colors' ? path.slice(1) : path;
  return ['ui', ...segments]
    .join('-')
    .replace(/_/g, '') // `_global` → `global`
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // camelCase → kebab, just in case
    .toLowerCase();
};

export const nameUi: Transform = {
  name: NAME_UI,
  type: transformTypes.name,
  transform: (token) => uiName(token.path),
};
