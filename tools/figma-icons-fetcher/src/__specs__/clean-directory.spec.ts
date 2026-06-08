import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { cleanDirectory } from '../clean-directory';

describe('cleanDirectory', () => {
  const testDir = path.join(process.cwd(), 'test-temp-dir');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(path.join(testDir, 'file1.txt'), 'content1');
    await fs.mkdir(path.join(testDir, 'subdir'), { recursive: true });
    await fs.writeFile(path.join(testDir, 'subdir', 'file2.txt'), 'content2');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should delete all contents of directory', async () => {
    await cleanDirectory(testDir);

    const contents = await fs.readdir(testDir);
    expect(contents).toHaveLength(0);
  });

  it('should handle non-existent directory', async () => {
    const nonExistentDir = path.join(process.cwd(), 'non-existent-dir');

    await expect(cleanDirectory(nonExistentDir)).resolves.not.toThrow();
  });

  it('should handle empty directory', async () => {
    await cleanDirectory(testDir);
    await cleanDirectory(testDir);

    const contents = await fs.readdir(testDir);
    expect(contents).toHaveLength(0);
  });
});
