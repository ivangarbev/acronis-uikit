import chalk from 'chalk';

import type { SyncConfig } from './config';
import { figmaClientRequest } from './figma-client';
import type { PackIcon } from './get-pack-icons';

interface ImagesResponse {
  err?: string;
  images: Record<string, string>;
}

export interface PackIconWithUrl extends PackIcon {
  svgUrl: string;
}

/**
 * Resolves SVG export URLs for the given icons (batched at 200 per request).
 */
export async function getSvgUrls(config: SyncConfig, icons: PackIcon[]): Promise<PackIconWithUrl[]> {
  console.log('Fetching SVG export URLs...');
  const client = figmaClientRequest(config.token);
  const urlMap = new Map<string, string>();

  const BATCH_SIZE = 200;
  const batches: PackIcon[][] = [];
  for (let i = 0; i < icons.length; i += BATCH_SIZE) {
    batches.push(icons.slice(i, i + BATCH_SIZE));
  }

  const requests = batches.map((batch) => {
    const ids = batch.map((icon) => icon.id).join(',');
    return client.get<ImagesResponse>(`/images/${config.fileKey}?ids=${ids}&format=svg`);
  });

  const responses = await Promise.all(requests);
  for (const resp of responses) {
    if (resp.data.err) {
      throw new Error(`Figma image export error: ${resp.data.err}`);
    }
    for (const [id, url] of Object.entries(resp.data.images)) {
      if (url) urlMap.set(id, url);
    }
  }

  const missing = icons.filter((icon) => !urlMap.has(icon.id));
  if (missing.length > 0) {
    throw new Error(
      `${missing.length} icons have no SVG URL:\n`
      + missing.map((i) => `  - ${i.name} (${i.id})`).join('\n'),
    );
  }

  console.log(chalk.cyan(`  Resolved ${urlMap.size} SVG URLs\n`));

  return icons.map((icon) => ({ ...icon, svgUrl: urlMap.get(icon.id)! }));
}
