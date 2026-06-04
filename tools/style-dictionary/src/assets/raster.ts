// R8 raster passthrough. A raster variant (`$type: "raster"`, `.png`/`.webp`) has
// no vector content to transform, so its binary is copied byte-for-byte — no
// scale/stroke, no currentColor. The resolver already guarantees a raster asset
// has no computed variants, so a raster variant is always a direct leaf.

import { readBinary } from './read';

export const copyRaster = (absPath: string): Buffer => readBinary(absPath);
