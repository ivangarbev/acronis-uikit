// Filesystem emit for the asset build: write optimized SVGs, raster passthroughs,
// generated React components + barrel, and a per-group manifest.json. Pure I/O —
// resolution/execution/codegen happen upstream in pipeline.ts.

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { generateBarrel, type GeneratedComponent } from './react/codegen';

const ensureDir = (dir: string): string => {
  mkdirSync(dir, { recursive: true });
  return dir;
};

export function writeSvg(dir: string, name: string, svg: string): void {
  ensureDir(dir);
  writeFileSync(path.join(dir, `${name}.svg`), svg.endsWith('\n') ? svg : `${svg}\n`);
}

export function writeRaster(dir: string, name: string, ext: string, bytes: Buffer): void {
  ensureDir(dir);
  writeFileSync(path.join(dir, `${name}.${ext}`), bytes);
}

export function writeReact(dir: string, components: GeneratedComponent[]): void {
  ensureDir(dir);
  for (const c of components) {
    writeFileSync(path.join(dir, `${c.fileName}.tsx`), c.source);
  }
  writeFileSync(path.join(dir, 'index.ts'), generateBarrel(components));
}

export function writeManifest(dir: string, data: unknown): void {
  ensureDir(dir);
  writeFileSync(path.join(dir, 'manifest.json'), `${JSON.stringify(data, null, 2)}\n`);
}
