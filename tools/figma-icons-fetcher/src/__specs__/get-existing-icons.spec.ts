import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getExistingIcons } from '../get-existing-icons';

describe('getExistingIcons', () => {
  const testDir = path.join(process.cwd(), 'test-icons-temp');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should return empty Set when directory does not exist', async () => {
    const result = await getExistingIcons(path.join(testDir, 'non-existent'));

    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });

  it('should return empty Set when directory is empty', async () => {
    const result = await getExistingIcons(testDir);

    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });

  it('should return Set of SVG filenames', async () => {
    await fs.writeFile(path.join(testDir, 'icon1.svg'), '<svg></svg>');
    await fs.writeFile(path.join(testDir, 'icon2.svg'), '<svg></svg>');
    await fs.writeFile(path.join(testDir, 'icon3.svg'), '<svg></svg>');

    const result = await getExistingIcons(testDir);

    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(3);
    expect(result.has('icon1.svg')).toBe(true);
    expect(result.has('icon2.svg')).toBe(true);
    expect(result.has('icon3.svg')).toBe(true);
  });

  it('should filter out non-SVG files', async () => {
    await fs.writeFile(path.join(testDir, 'icon1.svg'), '<svg></svg>');
    await fs.writeFile(path.join(testDir, 'readme.md'), '# README');
    await fs.writeFile(path.join(testDir, 'icon2.svg'), '<svg></svg>');
    await fs.writeFile(path.join(testDir, 'package.json'), '{}');

    const result = await getExistingIcons(testDir);

    expect(result.size).toBe(2);
    expect(result.has('icon1.svg')).toBe(true);
    expect(result.has('icon2.svg')).toBe(true);
    expect(result.has('readme.md')).toBe(false);
    expect(result.has('package.json')).toBe(false);
  });

  it('should handle special characters in filenames', async () => {
    await fs.writeFile(path.join(testDir, 'icon-with-dash.svg'), '<svg></svg>');
    await fs.writeFile(path.join(testDir, 'icon_with_underscore.svg'), '<svg></svg>');
    await fs.writeFile(path.join(testDir, 'icon--16.svg'), '<svg></svg>');

    const result = await getExistingIcons(testDir);

    expect(result.size).toBe(3);
    expect(result.has('icon-with-dash.svg')).toBe(true);
    expect(result.has('icon_with_underscore.svg')).toBe(true);
    expect(result.has('icon--16.svg')).toBe(true);
  });

  it('should return only filenames without paths', async () => {
    await fs.writeFile(path.join(testDir, 'icon.svg'), '<svg></svg>');

    const result = await getExistingIcons(testDir);
    const filenames = Array.from(result);

    expect(filenames[0]).toBe('icon.svg');
    expect(filenames[0]).not.toContain(testDir);
    expect(filenames[0]).not.toContain('/');
  });
});
