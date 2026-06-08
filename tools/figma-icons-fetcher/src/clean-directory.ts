import fs, { promises } from 'node:fs';
import path from 'node:path';

/**
 * Deletes the contents of a directory (but not the directory itself).
 */
export async function cleanDirectory(directory: string): Promise<void> {
  if (fs.existsSync(directory)) {
    const entries = await promises.readdir(directory);
    await Promise.all(
      entries.map((entry) => promises.rm(path.join(directory, entry), { recursive: true, force: true })),
    );
  }
}
