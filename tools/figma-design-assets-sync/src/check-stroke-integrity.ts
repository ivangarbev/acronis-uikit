import fs from 'node:fs/promises';
import path from 'node:path';

const STROKE_MONO_DIR = path.join('packs', 'icons-stroke-mono');
const REPORT_PATH = path.join('packs', 'stroke-fill-warnings.md');

export interface StrokeIntegrityResult {
  total: number;
  fullyOutlined: string[];
  mixed: string[];
  reportPath: string;
}

/**
 * Scans all SVGs in packs/icons-stroke-mono for hardcoded fill colors
 * (fill="#..."), which indicates the icon's strokes were outlined in Figma
 * rather than using live stroke paths. Writes a markdown report of offenders.
 */
export async function checkStrokeIntegrity(): Promise<StrokeIntegrityResult> {
  let entries: string[];
  try {
    entries = await fs.readdir(STROKE_MONO_DIR);
  } catch {
    return { total: 0, fullyOutlined: [], mixed: [], reportPath: REPORT_PATH };
  }

  const svgFiles = entries.filter((f) => f.endsWith('.svg')).sort();
  const fullyOutlined: string[] = [];
  const mixed: string[] = [];

  for (const file of svgFiles) {
    const content = await fs.readFile(path.join(STROKE_MONO_DIR, file), 'utf8');
    const hasFill = content.includes('fill="#');
    if (!hasFill) continue;

    const hasStroke = content.includes('stroke=');
    const name = file.replace(/\.svg$/, '');
    if (hasStroke) {
      mixed.push(name);
    } else {
      fullyOutlined.push(name);
    }
  }

  await writeReport(fullyOutlined, mixed);

  return {
    total: svgFiles.length,
    fullyOutlined,
    mixed,
    reportPath: REPORT_PATH,
  };
}

function iconRow(name: string): string {
  const src = `./icons-stroke-mono/${name}.svg`;
  return `| <img src="${src}" height="24" /> | \`${name}\` |`;
}

async function writeReport(fullyOutlined: string[], mixed: string[]): Promise<void> {
  const totalAffected = fullyOutlined.length + mixed.length;
  const lines: string[] = [
    '# Stroke-Mono Fill Integrity Warnings',
    '',
    'Icons in `packs/icons-stroke-mono` that contain hardcoded `fill="#..."` attributes.',
    'These icons have outlined (expanded) strokes in Figma instead of live stroke paths.',
    'The fix must be applied in the Figma source file.',
    '',
    `**Total affected: ${totalAffected}**  ·  Fully outlined: ${fullyOutlined.length}  ·  Mixed (fill + stroke): ${mixed.length}`,
    '',
    '---',
    '',
  ];

  if (fullyOutlined.length > 0) {
    lines.push(
      '## Fully Outlined (no `stroke` attribute)',
      '',
      'These icons export as filled paths only — strokes were expanded to fills in Figma.',
      '',
      '| Preview | Name |',
      '|---|---|',
      ...fullyOutlined.map(iconRow),
      '',
    );
  }

  if (mixed.length > 0) {
    lines.push(
      '## Mixed (fill + stroke)',
      '',
      'These icons use both fills and strokes. The fills may be intentional (e.g. screen bezels,',
      'rack details) or may indicate partial outlining. Review case-by-case.',
      '',
      '| Preview | Name |',
      '|---|---|',
      ...mixed.map(iconRow),
      '',
    );
  }

  if (totalAffected === 0) {
    lines.push('_No issues found. All icons use stroke-only paths._', '');
  }

  await fs.writeFile(REPORT_PATH, lines.join('\n'), 'utf8');
}
