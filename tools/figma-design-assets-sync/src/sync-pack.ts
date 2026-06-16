import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';

import type { BaseConfig } from './config';
import { makeSyncConfig } from './config';
import type { PackDefinition } from './discover-packs';
import { downloadSvgs } from './download-svgs';
import type { DownloadedIcon } from './download-svgs';
import { generateManifest } from './generate-manifest';
import { getPackIcons } from './get-pack-icons';
import { getSvgUrls } from './get-svg-urls';

export interface PackSyncResult {
  packName: string;
  assetCount: number;
  pruned: number;
  durationMs: number;
}

/**
 * Deletes SVG files in outputDir that are no longer present in Figma.
 */
async function pruneStaleAssets(outputDir: string, downloaded: DownloadedIcon[]): Promise<number> {
  const expected = new Set(downloaded.map((icon) => `${icon.name}.svg`));

  let entries: string[];
  try {
    entries = await fs.readdir(outputDir);
  } catch {
    return 0;
  }

  const stale = entries.filter((f) => f.endsWith('.svg') && !expected.has(f));
  for (const file of stale) {
    await fs.unlink(path.join(outputDir, file));
    console.log(chalk.yellow(`  🗑  Pruned stale asset: ${file}`));
  }
  return stale.length;
}

/**
 * Runs the full sync pipeline for one pack:
 * fetch icons → resolve SVG URLs → download + SVGO → prune stale → update manifest.
 */
export async function syncPack(base: BaseConfig, pack: PackDefinition): Promise<PackSyncResult> {
  const t0 = Date.now();
  const config = makeSyncConfig(base, pack.frameId, pack.packName);

  console.log(chalk.bold(`\n── ${pack.packName} ──────────────────────────`));
  console.log(`  Frame:  ${pack.frameId}`);
  console.log(`  Output: ${pack.outputDir}\n`);

  const icons = await getPackIcons(config);
  const iconsWithUrls = await getSvgUrls(config, icons);
  const downloaded = await downloadSvgs(config, iconsWithUrls);

  console.log(chalk.green.bold(`✓ Downloaded ${downloaded.length} SVGs\n`));

  const pruned = await pruneStaleAssets(config.outputDir, downloaded);

  await generateManifest(config, downloaded);

  return { packName: pack.packName, assetCount: downloaded.length, pruned, durationMs: Date.now() - t0 };
}
