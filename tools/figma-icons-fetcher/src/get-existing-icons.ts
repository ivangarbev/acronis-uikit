import fs from 'node:fs/promises';

/**
 * Returns the set of existing SVG icon filenames in a directory.
 * Resolves to an empty set when the directory does not exist.
 */
export async function getExistingIcons(dir: string): Promise<Set<string>> {
  try {
    const files = await fs.readdir(dir);
    return new Set(files.filter((file) => file.endsWith('.svg')));
  } catch {
    return new Set();
  }
}
