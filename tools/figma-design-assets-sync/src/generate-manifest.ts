import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';

import type { SyncConfig } from './config';
import type { DownloadedIcon } from './download-svgs';
import { parseDescription } from './helpers';

interface PackManifest {
  $schema: string;
  name: string;
  version: string;
  $type: string;
  values: Record<string, unknown>;
  assets: Record<string, unknown>;
}

/**
 * Reads the existing pack manifest, regenerates the assets section from the
 * downloaded icons, and writes the result back to disk.
 */
export async function generateManifest(
  config: SyncConfig,
  icons: DownloadedIcon[],
): Promise<void> {
  const manifestPath = path.join('packs', `${config.packName}.json`);

  let existing: PackManifest;
  try {
    existing = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as PackManifest;
  } catch {
    throw new Error(`Cannot read existing manifest at ${manifestPath}`);
  }

  const assets: Record<string, unknown> = {};
  for (const icon of icons) {
    const meta = parseDescription(icon.description);
    assets[icon.kebabName] = {
      values: {
        '24': { $file: `./packs/${config.packName}/${icon.name}.svg` },
      },
      platforms: config.platforms,
      metadata: {
        category: meta.category,
        tags: meta.tags,
        legacyNames: meta.legacyNames,
      },
    };
  }

  const sortedAssets: Record<string, unknown> = {};
  for (const key of Object.keys(assets).sort()) {
    sortedAssets[key] = assets[key];
  }

  const manifest: PackManifest = { ...existing, assets: sortedAssets };
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(
    chalk.green(`  Manifest written → ${manifestPath} (${Object.keys(sortedAssets).length} assets)`),
  );
}
