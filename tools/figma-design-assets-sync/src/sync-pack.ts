import chalk from 'chalk';

import type { BaseConfig } from './config';
import { makeSyncConfig } from './config';
import type { PackDefinition } from './discover-packs';
import { downloadSvgs } from './download-svgs';
import { generateManifest } from './generate-manifest';
import { getPackIcons } from './get-pack-icons';
import { getSvgUrls } from './get-svg-urls';

export interface PackSyncResult {
  packName: string;
  assetCount: number;
  durationMs: number;
}

/**
 * Runs the full sync pipeline for one pack:
 * fetch icons → resolve SVG URLs → download + SVGO → update manifest.
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

  await generateManifest(config, downloaded);

  return { packName: pack.packName, assetCount: downloaded.length, durationMs: Date.now() - t0 };
}
