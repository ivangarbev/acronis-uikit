// Conservative SVGO config factory. Two modes:
//   - `mono`     icons whose colors our pass already collapsed to currentColor.
//   - `preserve` multi-color icons + illustrations: keep every fill, gradient,
//                and referenced id intact.
//
// Load-bearing overrides:
//   - cleanupIds:false     — illustrations reference `url(#paint0_linear_…)`; id
//                            mangling would break those paints.
//   - convertColors.currentColor:false — our color.ts owns currentColor.
// For `preserve`, mergePaths / convertShapeToPath are also disabled so
// independently-filled shapes are never collapsed.
//
// Note: SVGO v4 dropped `removeViewBox` from preset-default — the viewBox is
// preserved by default now (lossless resize + React both rely on it), so it is
// no longer overridden here.

import type { Config } from 'svgo';

export type ColorMode = 'mono' | 'preserve';

export function svgoConfig(mode: ColorMode): Config {
  const overrides: Record<string, unknown> = {
    cleanupIds: false,
    convertColors: { currentColor: false },
  };
  if (mode === 'preserve') {
    overrides.mergePaths = false;
    overrides.convertShapeToPath = false;
  }
  return {
    multipass: true,
    plugins: [{ name: 'preset-default', params: { overrides } }],
  };
}
