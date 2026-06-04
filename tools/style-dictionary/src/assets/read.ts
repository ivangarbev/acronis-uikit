// Filesystem access to `@acronis-platform/design-assets`: locate the package via
// its `exports`, enumerate packs, and read manifests, rules, schemas, and the
// `$file` binaries. Everything else in the asset domain is pure and takes its
// input from here.

import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import type { PackManifest, Rule } from './types';

/** The assets package, addressed via its `exports`. */
const DESIGN_ASSETS_PACKAGE = '@acronis-platform/design-assets';

// createRequire (rather than import.meta.resolve) so package resolution works
// identically under tsx and the vitest/vite test runtime.
const require = createRequire(import.meta.url);

/** Absolute path to the assets package root (the dir holding its package.json). */
function packageRoot(): string {
  return path.dirname(require.resolve(`${DESIGN_ASSETS_PACKAGE}/package.json`));
}

/** Enumerate the asset pack names (`packs/*.json` stems, = each pack's `name`). */
export function listPackNames(): string[] {
  const packsDir = path.join(packageRoot(), 'packs');
  return readdirSync(packsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -'.json'.length))
    .sort();
}

/** Read and parse one pack manifest by name. */
export function loadPack(name: string): PackManifest {
  const file = path.join(packageRoot(), 'packs', `${name}.json`);
  return JSON.parse(readFileSync(file, 'utf8')) as PackManifest;
}

/** Read every rule declaration into an id → Rule map. */
export function loadAllRules(): Map<string, Rule> {
  const rulesDir = path.join(packageRoot(), 'rules');
  const rules = new Map<string, Rule>();
  for (const f of readdirSync(rulesDir).filter((n) => n.endsWith('.json'))) {
    const rule = JSON.parse(readFileSync(path.join(rulesDir, f), 'utf8')) as Rule;
    rules.set(rule.name, rule);
  }
  return rules;
}

/**
 * Resolve a manifest `$file` path (project-relative, e.g.
 * `./packs/icons-stroke-mono/add-24.svg`) to an absolute path under the package
 * root, plus whether it exists on disk.
 */
export function resolveBinary(file: string): { absPath: string; exists: boolean } {
  const absPath = path.join(packageRoot(), file.replace(/^\.\//, ''));
  return { absPath, exists: existsSync(absPath) };
}

/** Read the bytes of a resolved binary. */
export function readBinary(absPath: string): Buffer {
  return readFileSync(absPath);
}

/** Read a source SVG as text. */
export function readSvg(absPath: string): string {
  return readFileSync(absPath, 'utf8');
}

/** Load the pack JSON schema (for the fail-closed structural re-assert). */
export function loadPackSchema(): object {
  const file = path.join(packageRoot(), 'schemas', 'pack.schema.json');
  return JSON.parse(readFileSync(file, 'utf8')) as object;
}
