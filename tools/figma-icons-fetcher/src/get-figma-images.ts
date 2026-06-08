import { figmaClientRequest } from './figma-client';
import type { FetcherConfig, FigmaIcon, IconWithUrl } from './types';

interface ImagesResponse {
  err?: string;
  images: Record<string, string>;
}

/**
 * Fetches the download URLs of the SVG images for the given icons from the Figma API.
 * Icon IDs are batched (200 per request) and resolved concurrently.
 */
export async function getFigmaImages(config: FetcherConfig, icons: FigmaIcon[]): Promise<IconWithUrl[]> {
  console.log('Fetching icon urls');

  if (!config.token) {
    throw new Error('Token not found. Please add FIGMA_FETCHER_FIGMA_TOKEN to .env.local');
  }

  const figmaClient = figmaClientRequest(config.token);
  const imagesMap = new Map<string, string>();

  // Create batches of icon IDs
  const batchSize = 200;
  const batches: string[] = [];
  for (let i = 0; i < icons.length; i += batchSize) {
    const batch = icons.slice(i, i + batchSize).map((icon) => icon.id).join(',');
    batches.push(batch);
  }

  // Create an array of Promises for each batch request
  const requests = batches.map((iconIds) =>
    figmaClient.get<ImagesResponse>(`/images/${config.fileKey}?ids=${iconIds}&format=svg`),
  );

  // Await all requests concurrently
  const responses = await Promise.all(requests);
  responses.forEach((response) => {
    if (response.data.err) {
      console.log('err', response.data.err);
      throw new Error(response.data.err);
    }
    const { images } = response.data;
    Object.entries(images).forEach(([key, value]) => imagesMap.set(key, value));
  });

  return icons.map((icon) => ({ ...icon, image: imagesMap.get(icon.id) }));
}
