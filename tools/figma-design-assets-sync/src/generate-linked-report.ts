import fs from 'node:fs/promises';
import path from 'node:path';

interface AssetEntry {
  metadata?: { legacyNames?: string[] };
}
interface PackManifest {
  assets: Record<string, AssetEntry>;
}

const LEGACY_DIRS = [
  { dir: path.join('..', 'icons-svg', 'src', 'monocolor-icons'), rel: '../../icons-svg/src/monocolor-icons' },
  { dir: path.join('..', 'icons-svg', 'src', 'multicolor-icons'), rel: '../../icons-svg/src/multicolor-icons' },
];

const PACKS = [
  { name: 'icons-stroke-mono', manifest: 'packs/icons-stroke-mono.json', svgDir: 'icons-stroke-mono' },
  { name: 'icons-stroke-multi', manifest: 'packs/icons-stroke-multi.json', svgDir: 'icons-stroke-multi' },
  { name: 'icons-solid-mono', manifest: 'packs/icons-solid-mono.json', svgDir: 'icons-solid-mono' },
  { name: 'icons-solid-multi', manifest: 'packs/icons-solid-multi.json', svgDir: 'icons-solid-multi' },
];

const LINKED_REPORT = path.join('packs', 'linked-icons.md');

async function buildLegacyIndex(): Promise<Map<string, string>> {
  const index = new Map<string, string>();
  for (const { dir, rel } of LEGACY_DIRS) {
    const files = await fs.readdir(dir);
    for (const f of files) {
      if (f.endsWith('.svg')) {
        index.set(f.replace(/\.svg$/, ''), rel);
      }
    }
  }
  return index;
}

function toPascalCase(kebab: string): string {
  return kebab.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function img(src: string, height = 20): string {
  return `<img src="${src}" height="${height}" />`;
}

async function buildPackTable(
  pack: (typeof PACKS)[number],
  legacyIndex: Map<string, string>,
): Promise<string[]> {
  const manifest = JSON.parse(await fs.readFile(pack.manifest, 'utf8')) as PackManifest;
  const entries = Object.entries(manifest.assets).sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) return [];

  const lines = [
    `## ${pack.name}`,
    '',
    `| New Icon | Legacy Icons |`,
    `|---|---|`,
  ];

  for (const [key, asset] of entries) {
    const pascalKey = toPascalCase(key);
    const newIconSrc = `${pack.svgDir}/${pascalKey}.svg`;
    const newIconCell = `${img(newIconSrc)} ${pascalKey}`;

    const legacyNames = asset.metadata?.legacyNames ?? [];
    const legacyCell = legacyNames
      .map((name) => {
        const rel = legacyIndex.get(name);
        if (!rel) return name;
        return `${img(`${rel}/${name}.svg`)} ${name}`;
      })
      .join('<br />');

    lines.push(`| ${newIconCell} | ${legacyCell || '—'} |`);
  }

  lines.push('');
  return lines;
}

export async function generateLinkedReport(): Promise<string> {
  const legacyIndex = await buildLegacyIndex();

  const lines = [
    '# Linked Icons',
    '',
    'Each new pack icon with its mapped legacy SVGs from `packages/icons-svg/src/`.',
    '',
  ];

  for (const pack of PACKS) {
    const section = await buildPackTable(pack, legacyIndex);
    lines.push(...section);
  }

  await fs.writeFile(LINKED_REPORT, lines.join('\n'), 'utf8');
  return LINKED_REPORT;
}
