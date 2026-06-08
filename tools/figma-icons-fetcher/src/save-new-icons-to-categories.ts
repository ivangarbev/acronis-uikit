import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';

import { getExistingIcons } from './get-existing-icons';
import type { CategoryStats } from './types';

interface CategoryConfig {
  categorizeByColor: boolean;
  outputDir: string;
  monoColorDir: string;
  multiColorDir: string;
}

interface CategorizableIcon {
  name: string;
  isMulticolor: boolean;
}

/**
 * Saves only NEW icons to the mono/multicolor directories.
 * NEW = icons that were just downloaded (not present in the output dir before download).
 * The mono/multicolor directories are never cleaned, preserving legacy icons.
 */
export async function saveNewIconsToCategories(
  config: CategoryConfig,
  downloadedIcons: CategorizableIcon[],
  iconsBeforeDownload: Set<string>,
): Promise<CategoryStats> {
  if (!config.categorizeByColor) {
    return { monoAdded: 0, multiAdded: 0 };
  }

  console.log(chalk.bold('\n📁 Categorizing new icons...\n'));

  // Get existing icons in mono/multi folders
  const existingMonoIcons = await getExistingIcons(config.monoColorDir);
  const existingMultiIcons = await getExistingIcons(config.multiColorDir);

  console.log(`  Icons before download: ${iconsBeforeDownload.size}`);
  console.log(`  Icons after download: ${downloadedIcons.length}`);
  console.log(`  Existing monocolor: ${existingMonoIcons.size} icons`);
  console.log(`  Existing multicolor: ${existingMultiIcons.size} icons`);

  // Find NEW icons = icons that were NOT in the output dir before download
  const newIcons = downloadedIcons.filter((icon) => !iconsBeforeDownload.has(`${icon.name}.svg`));

  console.log(`\n  New icons downloaded: ${newIcons.length}`);

  // Separate by color type
  const newMonoIcons = newIcons.filter((icon) => !icon.isMulticolor);
  const newMultiIcons = newIcons.filter((icon) => icon.isMulticolor);

  console.log(`\n  New monocolor icons to add: ${newMonoIcons.length}`);
  console.log(`  New multicolor icons to add: ${newMultiIcons.length}`);

  // Ensure directories exist
  await fs.mkdir(config.monoColorDir, { recursive: true });
  await fs.mkdir(config.multiColorDir, { recursive: true });

  // Copy new monocolor icons
  for (const icon of newMonoIcons) {
    const sourcePath = path.join(config.outputDir, `${icon.name}.svg`);
    const destPath = path.join(config.monoColorDir, `${icon.name}.svg`);

    try {
      const content = await fs.readFile(sourcePath, 'utf8');
      await fs.writeFile(destPath, content, 'utf8');
    } catch (err) {
      console.error(chalk.yellow(`  ⚠ Failed to copy ${icon.name}.svg to monocolor: ${(err as Error).message}`));
    }
  }

  // Copy new multicolor icons
  for (const icon of newMultiIcons) {
    const sourcePath = path.join(config.outputDir, `${icon.name}.svg`);
    const destPath = path.join(config.multiColorDir, `${icon.name}.svg`);

    try {
      const content = await fs.readFile(sourcePath, 'utf8');
      await fs.writeFile(destPath, content, 'utf8');
    } catch (err) {
      console.error(chalk.yellow(`  ⚠ Failed to copy ${icon.name}.svg to multicolor: ${(err as Error).message}`));
    }
  }

  console.log(chalk.green(`\n  ✓ Added ${newMonoIcons.length} monocolor icons`));
  console.log(chalk.green(`  ✓ Added ${newMultiIcons.length} multicolor icons`));

  return {
    monoAdded: newMonoIcons.length,
    multiAdded: newMultiIcons.length,
    monoTotal: existingMonoIcons.size + newMonoIcons.length,
    multiTotal: existingMultiIcons.size + newMultiIcons.length,
  };
}
