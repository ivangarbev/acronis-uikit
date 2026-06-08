import chalk from 'chalk';

import { downloadImage } from './download-image';
import type { FetcherConfig, DownloadedIcon, IconWithUrl } from './types';

const CHUNK_SIZE = 10; // Icons per chunk
const CONCURRENT_CHUNKS = 3; // Parallel chunks

/**
 * Downloads icons in controlled chunks to avoid overwhelming the API.
 */
export async function downloadChunks(config: FetcherConfig, icons: IconWithUrl[]): Promise<DownloadedIcon[]> {
  const activePromises: Array<Promise<DownloadedIcon[]>> = [];
  const downloadedIcons: DownloadedIcon[] = [];
  let from = 0;
  let chunkNumber = 0;

  while (from < icons.length) {
    const to = Math.min(from + CHUNK_SIZE, icons.length);
    const iconsChunk = icons.slice(from, to);

    chunkNumber += 1;
    console.log(chalk.cyan(`Downloading chunk ${chunkNumber}: ${iconsChunk.length} icons (${from + 1}-${to}/${icons.length})`));

    // Start downloading this chunk
    const chunkPromise = Promise.all(
      iconsChunk.map((icon) => downloadImage(config, icon)),
    ).then((results) => {
      downloadedIcons.push(...results);
      return results;
    });
    activePromises.push(chunkPromise);

    from = to;

    // Wait for oldest chunk to complete if we hit concurrency limit
    if (activePromises.length >= CONCURRENT_CHUNKS) {
      await activePromises[0];
      activePromises.shift();
    }
  }

  // Wait for all remaining chunks
  await Promise.all(activePromises);

  return downloadedIcons;
}
