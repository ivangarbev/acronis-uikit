import chalk from 'chalk';

import type { SyncConfig } from './config';
import { figmaClientRequest } from './figma-client';
import { formatName } from './helpers';

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  description?: string;
  children?: FigmaNode[];
}

interface ComponentMeta {
  key: string;
  name: string;
  description: string;
}

interface NodesResponse {
  err?: string;
  nodes: Record<string, {
    document: FigmaNode;
    components?: Record<string, ComponentMeta>;
  }>;
}

export interface PackIcon {
  id: string;
  name: string;
  kebabName: string;
  description: string;
  gridNodeId?: string;
}

const ICON_TYPES = new Set(['INSTANCE', 'COMPONENT']);

function collectIconNodes(node: FigmaNode, result: PackIcon[] = []): PackIcon[] {
  if (ICON_TYPES.has(node.type) && node.name.startsWith('_assetsource/')) {
    const componentName = node.name.replace('_assetsource/', '');
    const gridChild = (node.children ?? []).find((c) => c.name === '_IconGrid-24');
    result.push({
      id: node.id,
      name: componentName,
      kebabName: formatName(componentName),
      description: node.description ?? '',
      gridNodeId: gridChild?.id,
    });
    return result;
  }
  for (const child of node.children ?? []) {
    collectIconNodes(child, result);
  }
  return result;
}

/**
 * Fetches all _assetsource/* component nodes from the given frame, then
 * batch-fetches each component directly to retrieve its description field.
 * (The Figma REST API does not include `description` on child nodes returned
 * as part of a parent frame fetch — only direct node fetches include it.)
 */
export async function getPackIcons(config: SyncConfig): Promise<PackIcon[]> {
  const client = figmaClientRequest(config.token);

  // 1. Fetch the frame subtree to collect icon node IDs and names
  console.log(`Fetching frame ${config.frameNodeId}...`);
  const t0 = Date.now();
  const nodesResp = await client.get<NodesResponse>(
    `/files/${config.fileKey}/nodes?ids=${config.frameNodeId}`,
  );

  if (nodesResp.data.err) {
    throw new Error(`Cannot fetch frame: ${nodesResp.data.err}`);
  }

  const frameEntry = Object.values(nodesResp.data.nodes)[0];
  if (!frameEntry) {
    throw new Error(`Frame ${config.frameNodeId} not found in file ${config.fileKey}`);
  }
  console.log(chalk.cyan(`  Frame fetched in ${((Date.now() - t0) / 1000).toFixed(1)}s`));

  const icons = collectIconNodes(frameEntry.document);
  console.log(`  Found ${icons.length} icons\n`);

  // 2. Build nodeId → description map from the `components` metadata
  //    returned alongside the frame document (Figma bundles all referenced
  //    component metadata — including description — in this map).
  const components = frameEntry.components ?? {};
  const descMap = new Map<string, string>(
    Object.entries(components).map(([id, meta]) => [id, meta.description ?? '']),
  );

  console.log(chalk.cyan(`  Loaded descriptions for ${descMap.size} components\n`));

  // 3. Merge descriptions back into icon list
  const withDesc = icons.map((icon) => ({ ...icon, description: descMap.get(icon.id) ?? '' }));

  const missingDesc = withDesc.filter((i) => !i.description);
  if (missingDesc.length > 0) {
    console.warn(
      chalk.yellow(
        `⚠  ${missingDesc.length} icons have no description (empty metadata will be written):\n`
        + missingDesc.map((i) => `   - ${i.name}`).join('\n')
        + '\n',
      ),
    );
  }

  return withDesc;
}
