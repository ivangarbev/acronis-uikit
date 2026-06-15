import fs from 'node:fs/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import chalk from 'chalk';

interface AssetEntry {
  metadata?: {
    legacyNames?: string[];
  };
}

interface PackManifest {
  assets: Record<string, AssetEntry>;
}

export interface DuplicateEntry {
  legacyName: string;
  icons: [string, string];
}

export interface ManifestValidationResult {
  manifestPath: string;
  assetCount: number;
  legacyCount: number;
  duplicates: DuplicateEntry[];
}

export async function validateManifest(manifestPath: string): Promise<ManifestValidationResult> {
  let manifest: PackManifest;
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as PackManifest;
  } catch {
    throw new Error(`Cannot read manifest at ${manifestPath}`);
  }

  const seen = new Map<string, string>();
  const duplicates: DuplicateEntry[] = [];

  for (const [key, asset] of Object.entries(manifest.assets)) {
    for (const name of asset.metadata?.legacyNames ?? []) {
      if (seen.has(name)) {
        duplicates.push({ legacyName: name, icons: [seen.get(name)!, key] });
      } else {
        seen.set(name, key);
      }
    }
  }

  return {
    manifestPath,
    assetCount: Object.keys(manifest.assets).length,
    legacyCount: seen.size,
    duplicates,
  };
}

function printValidationResult(result: ManifestValidationResult): void {
  console.log(`  Assets:        ${result.assetCount}`);
  console.log(`  Legacy names:  ${result.legacyCount}`);

  if (result.duplicates.length === 0) {
    console.log(chalk.green('\n✓ No duplicate legacyNames\n'));
  } else {
    console.error(chalk.red(`\n✗ ${result.duplicates.length} duplicate legacyName(s) found:\n`));
    for (const d of result.duplicates) {
      console.error(
        chalk.red(`  "${d.legacyName}"`),
        chalk.dim(`→ ${d.icons[0]}`),
        chalk.dim('and'),
        chalk.dim(d.icons[1]),
      );
    }
    console.error('');
  }
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  const manifestPath = process.argv[2] ?? 'packs/icons-stroke-mono.json';
  console.log(chalk.bold(`\nValidating legacyNames in ${manifestPath}\n`));
  validateManifest(manifestPath)
    .then((result) => {
      printValidationResult(result);
      if (result.duplicates.length > 0) process.exit(1);
    })
    .catch((err: Error) => {
      console.error(chalk.red.bold('Error:'), err.message);
      process.exit(1);
    });
}
