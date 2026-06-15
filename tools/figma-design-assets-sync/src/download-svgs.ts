import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';
import { optimize, type Config } from 'svgo';

import type { SyncConfig } from './config';
import type { PackIconWithUrl } from './get-svg-urls';

const CHUNK_SIZE = 10;
const CONCURRENT_CHUNKS = 3;

export interface DownloadedIcon extends PackIconWithUrl {
  filePath: string;
}

/**
 * Removes the element (and all its children) whose `id` attribute matches the
 * given Figma node ID from the raw SVG text. Figma may encode the colon in
 * node IDs as a literal colon or as a hyphen, so both variants are tried.
 * Returns the SVG unchanged when the node ID is absent or not found.
 */
function stripGridElement(svg: string, gridNodeId: string | undefined): string {
  if (!gridNodeId) return svg;

  for (const id of [gridNodeId, gridNodeId.replace(':', '-')]) {
    const idAttr = `id="${id}"`;
    const pos = svg.indexOf(idAttr);
    if (pos === -1) continue;

    const openBracket = svg.lastIndexOf('<', pos);
    if (openBracket === -1) continue;

    const openEnd = svg.indexOf('>', openBracket);
    if (openEnd === -1) continue;

    const tagSlice = svg.slice(openBracket, openEnd + 1);

    if (tagSlice.endsWith('/>') || tagSlice.includes('/>')) {
      return svg.slice(0, openBracket) + svg.slice(openEnd + 1);
    }

    const tagNameMatch = svg.slice(openBracket + 1).match(/^([a-z][a-z0-9]*)/i);
    if (!tagNameMatch) continue;
    const tagName = tagNameMatch[1];

    let depth = 1;
    let searchPos = openEnd + 1;
    while (depth > 0 && searchPos < svg.length) {
      const nextOpen = svg.indexOf(`<${tagName}`, searchPos);
      const nextClose = svg.indexOf(`</${tagName}>`, searchPos);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        searchPos = nextOpen + tagName.length + 1;
      } else {
        depth--;
        if (depth === 0) {
          const closeEnd = nextClose + `</${tagName}>`.length;
          return svg.slice(0, openBracket) + svg.slice(closeEnd);
        }
        searchPos = nextClose + tagName.length + 3;
      }
    }
    break;
  }

  return svg;
}

async function downloadOne(config: SyncConfig, icon: PackIconWithUrl): Promise<DownloadedIcon> {
  const response = await fetch(icon.svgUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${icon.name}`);
  }
  const rawSvg = await response.text();
  const svgText = stripGridElement(rawSvg, icon.gridNodeId);

  const plugins: Config['plugins'] = [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupNumericValues: { floatPrecision: 4 },
          convertPathData: { floatPrecision: 4 },
        },
      },
    },
    'removeDimensions',
    {
      name: 'prefixIds',
      params: {
        delim: '-',
        prefix: icon.kebabName.replace(/[/\\]/g, '-'),
      },
    },
  ];

  const optimized = optimize(svgText, { plugins });

  const filePath = path.join(config.outputDir, `${icon.name}.svg`);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, optimized.data, 'utf8');

  return { ...icon, filePath };
}

/**
 * Downloads and SVGO-optimizes all icons in controlled parallel chunks.
 */
export async function downloadSvgs(
  config: SyncConfig,
  icons: PackIconWithUrl[],
): Promise<DownloadedIcon[]> {
  console.log(`Downloading ${icons.length} SVGs...\n`);

  const results: DownloadedIcon[] = [];
  const activePromises: Array<Promise<void>> = [];
  let from = 0;
  let chunkNumber = 0;

  while (from < icons.length) {
    const to = Math.min(from + CHUNK_SIZE, icons.length);
    const chunk = icons.slice(from, to);
    chunkNumber++;

    console.log(
      chalk.cyan(`  Chunk ${chunkNumber}: icons ${from + 1}–${to} / ${icons.length}`),
    );

    const chunkPromise = Promise.all(chunk.map((icon) => downloadOne(config, icon))).then(
      (downloaded) => {
        results.push(...downloaded);
      },
    );
    activePromises.push(chunkPromise);
    from = to;

    if (activePromises.length >= CONCURRENT_CHUNKS) {
      await activePromises.shift();
    }
  }

  await Promise.all(activePromises);
  return results;
}
