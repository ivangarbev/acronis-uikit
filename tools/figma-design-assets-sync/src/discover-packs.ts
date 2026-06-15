import path from 'node:path';

import chalk from 'chalk';

import type { BaseConfig } from './config';
import { figmaClientRequest } from './figma-client';

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

interface NodesResponse {
  err?: string;
  nodes: Record<string, { document: FigmaNode }>;
}

export interface PackDefinition {
  frameId: string;
  frameName: string;
  packName: string;
  outputDir: string;
}

const FRAME_TO_PACK: Record<string, string> = {
  'stroke-mono': 'icons-stroke-mono',
  'stroke-multi': 'icons-stroke-multi',
  'solid-mono': 'icons-solid-mono',
  'solid-multi': 'icons-solid-multi',
};

/**
 * Fetches the section node and returns a PackDefinition for each recognised
 * child frame (stroke-mono, stroke-multi, solid-mono, solid-multi).
 */
export async function discoverPacks(config: BaseConfig): Promise<PackDefinition[]> {
  const client = figmaClientRequest(config.token);

  const resp = await client.get<NodesResponse>(
    `/files/${config.fileKey}/nodes?ids=${config.sectionNodeId}`,
  );

  if (resp.data.err) {
    throw new Error(`Cannot fetch section ${config.sectionNodeId}: ${resp.data.err}`);
  }

  const sectionEntry = Object.values(resp.data.nodes)[0];
  if (!sectionEntry) {
    throw new Error(`Section ${config.sectionNodeId} not found in file ${config.fileKey}`);
  }

  const packs: PackDefinition[] = [];
  for (const child of sectionEntry.document.children ?? []) {
    if (child.type !== 'FRAME') continue;
    const packName = FRAME_TO_PACK[child.name];
    if (!packName) continue;
    packs.push({
      frameId: child.id,
      frameName: child.name,
      packName,
      outputDir: path.join('packs', packName),
    });
  }

  if (packs.length === 0) {
    throw new Error(
      `No known pack frames found in section ${config.sectionNodeId}. `
      + `Expected one of: ${Object.keys(FRAME_TO_PACK).join(', ')}`,
    );
  }

  console.log(chalk.cyan(`  Discovered ${packs.length} packs: ${packs.map((p) => p.packName).join(', ')}\n`));
  return packs;
}
