import fs from 'node:fs/promises';
import path from 'node:path';

interface AssetEntry {
  metadata?: { legacyNames?: string[] };
}
interface PackManifest {
  assets: Record<string, AssetEntry>;
}

const MONO_DIR = path.join('..', 'icons-svg', 'src', 'monocolor-icons');
const MULTI_DIR = path.join('..', 'icons-svg', 'src', 'multicolor-icons');
const UNLINKED_REPORT = path.join('packs', 'unlinked-legacy-icons.md');

const ALL_MANIFEST_PATHS = [
  'packs/icons-stroke-mono.json',
  'packs/icons-solid-mono.json',
  'packs/icons-stroke-multi.json',
  'packs/icons-solid-multi.json',
];

export interface UnlinkedResult {
  totalMono: number;
  totalMulti: number;
  unlinkedMono: number;
  unlinkedMulti: number;
  reportPath: string;
}

async function svgNames(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir);
  return files.filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, ''));
}

function groupByBase(names: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const name of names) {
    const base = name.replace(/--\d+$/, '');
    const list = groups.get(base) ?? [];
    list.push(name);
    groups.set(base, list);
  }
  return groups;
}

function renderSection(title: string, description: string, unlinked: string[], svgBase: string): string[] {
  const groups = groupByBase(unlinked);
  const lines: string[] = [
    `## ${title}`,
    '',
    description,
    '',
  ];
  if (unlinked.length === 0) {
    lines.push('_All icons are linked._', '');
    return lines;
  }
  for (const [base, names] of [...groups.entries()].sort()) {
    lines.push(`- **${base}**`);
    for (const n of names) {
      const img = `<img src="${svgBase}/${n}.svg" height="20" />`;
      lines.push(`  - \`${n}\` ${img}`);
    }
  }
  lines.push('');
  return lines;
}

/**
 * Reads all SVG filenames from monocolor-icons and multicolor-icons, collects
 * all legacyNames from all 4 pack manifests, then writes a markdown report of
 * unlinked legacy icons to packs/unlinked-legacy-icons.md.
 */
export async function checkUnlinked(): Promise<UnlinkedResult> {
  const [monoIcons, multiIcons] = await Promise.all([svgNames(MONO_DIR), svgNames(MULTI_DIR)]);

  const linked = new Set<string>();
  for (const mPath of ALL_MANIFEST_PATHS) {
    const manifest = JSON.parse(await fs.readFile(mPath, 'utf8')) as PackManifest;
    for (const asset of Object.values(manifest.assets)) {
      for (const name of asset.metadata?.legacyNames ?? []) {
        linked.add(name);
      }
    }
  }

  const unlinkedMono = monoIcons.filter((n) => !linked.has(n)).sort();
  const unlinkedMulti = multiIcons.filter((n) => !linked.has(n)).sort();

  const lines = [
    '# Unlinked Legacy Icons',
    '',
    'Legacy icons from `packages/icons-svg/src/` that are not referenced in `legacyNames`',
    'of any asset across all 4 pack manifests.',
    '',
    `**Monocolor unlinked: ${unlinkedMono.length}** / ${monoIcons.length}  ·  **Multicolor unlinked: ${unlinkedMulti.length}** / ${multiIcons.length}`,
    '',
    '---',
    '',
    ...renderSection(
      'Monocolor (`monocolor-icons`)',
      'Icons in `packages/icons-svg/src/monocolor-icons` not found in any manifest.',
      unlinkedMono,
      '../../icons-svg/src/monocolor-icons',
    ),
    ...renderSection(
      'Multicolor (`multicolor-icons`)',
      'Icons in `packages/icons-svg/src/multicolor-icons` not found in any manifest.',
      unlinkedMulti,
      '../../icons-svg/src/multicolor-icons',
    ),
  ];

  await fs.writeFile(UNLINKED_REPORT, lines.join('\n'), 'utf8');

  return {
    totalMono: monoIcons.length,
    totalMulti: multiIcons.length,
    unlinkedMono: unlinkedMono.length,
    unlinkedMulti: unlinkedMulti.length,
    reportPath: UNLINKED_REPORT,
  };
}
