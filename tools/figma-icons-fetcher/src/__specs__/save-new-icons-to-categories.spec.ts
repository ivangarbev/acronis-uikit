import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { saveNewIconsToCategories } from '../save-new-icons-to-categories';

describe('saveNewIconsToCategories', () => {
  const testDir = path.join(process.cwd(), 'test-categories-temp');
  const outputDir = path.join(testDir, 'svg');
  const monoColorDir = path.join(testDir, 'monocolor-icons');
  const multiColorDir = path.join(testDir, 'multicolor-icons');

  beforeEach(async () => {
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(monoColorDir, { recursive: true });
    await fs.mkdir(multiColorDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should do nothing when categorizeByColor is false', async () => {
    const config = { categorizeByColor: false, outputDir, monoColorDir, multiColorDir };
    const downloadedIcons = [{ name: 'icon1', isMulticolor: false }];

    const result = await saveNewIconsToCategories(config, downloadedIcons, new Set());

    expect(result.monoAdded).toBe(0);
    expect(result.multiAdded).toBe(0);
  });

  it('should add only NEW monocolor icons', async () => {
    await fs.writeFile(path.join(outputDir, 'new-icon.svg'), '<svg><path fill="#000"/></svg>');
    await fs.writeFile(path.join(monoColorDir, 'existing-icon.svg'), '<svg></svg>');

    const config = { categorizeByColor: true, outputDir, monoColorDir, multiColorDir };
    const downloadedIcons = [
      { name: 'new-icon', isMulticolor: false },
      { name: 'existing-icon', isMulticolor: false },
    ];
    const iconsBeforeDownload = new Set(['existing-icon.svg']);

    const result = await saveNewIconsToCategories(config, downloadedIcons, iconsBeforeDownload);

    expect(result.monoAdded).toBe(1);
    expect(result.multiAdded).toBe(0);

    const newIconExists = await fs.access(path.join(monoColorDir, 'new-icon.svg')).then(() => true).catch(() => false);
    expect(newIconExists).toBe(true);
  });

  it('should add only NEW multicolor icons', async () => {
    await fs.writeFile(path.join(outputDir, 'new-multi.svg'), '<svg><path fill="#000"/><path fill="#FFF"/></svg>');

    const config = { categorizeByColor: true, outputDir, monoColorDir, multiColorDir };
    const downloadedIcons = [{ name: 'new-multi', isMulticolor: true }];

    const result = await saveNewIconsToCategories(config, downloadedIcons, new Set());

    expect(result.monoAdded).toBe(0);
    expect(result.multiAdded).toBe(1);

    const newIconExists = await fs.access(path.join(multiColorDir, 'new-multi.svg')).then(() => true).catch(() => false);
    expect(newIconExists).toBe(true);
  });

  it('should not add icons that existed before download', async () => {
    await fs.writeFile(path.join(outputDir, 'icon1.svg'), '<svg></svg>');
    await fs.writeFile(path.join(outputDir, 'icon2.svg'), '<svg></svg>');

    const config = { categorizeByColor: true, outputDir, monoColorDir, multiColorDir };
    const downloadedIcons = [
      { name: 'icon1', isMulticolor: false },
      { name: 'icon2', isMulticolor: false },
    ];
    const iconsBeforeDownload = new Set(['icon1.svg', 'icon2.svg']);

    const result = await saveNewIconsToCategories(config, downloadedIcons, iconsBeforeDownload);

    expect(result.monoAdded).toBe(0);
    expect(result.multiAdded).toBe(0);
  });

  it('should handle mixed new monocolor and multicolor icons', async () => {
    await fs.writeFile(path.join(outputDir, 'mono1.svg'), '<svg></svg>');
    await fs.writeFile(path.join(outputDir, 'mono2.svg'), '<svg></svg>');
    await fs.writeFile(path.join(outputDir, 'multi1.svg'), '<svg></svg>');

    const config = { categorizeByColor: true, outputDir, monoColorDir, multiColorDir };
    const downloadedIcons = [
      { name: 'mono1', isMulticolor: false },
      { name: 'mono2', isMulticolor: false },
      { name: 'multi1', isMulticolor: true },
    ];

    const result = await saveNewIconsToCategories(config, downloadedIcons, new Set());

    expect(result.monoAdded).toBe(2);
    expect(result.multiAdded).toBe(1);
    expect(result.monoTotal).toBe(2);
    expect(result.multiTotal).toBe(1);
  });

  it('should calculate total counts correctly', async () => {
    await fs.writeFile(path.join(monoColorDir, 'existing1.svg'), '<svg></svg>');
    await fs.writeFile(path.join(monoColorDir, 'existing2.svg'), '<svg></svg>');
    await fs.writeFile(path.join(multiColorDir, 'existing3.svg'), '<svg></svg>');
    await fs.writeFile(path.join(outputDir, 'new-icon.svg'), '<svg></svg>');

    const config = { categorizeByColor: true, outputDir, monoColorDir, multiColorDir };
    const downloadedIcons = [{ name: 'new-icon', isMulticolor: false }];

    const result = await saveNewIconsToCategories(config, downloadedIcons, new Set());

    expect(result.monoAdded).toBe(1);
    expect(result.monoTotal).toBe(3); // 2 existing + 1 new
    expect(result.multiTotal).toBe(1); // 1 existing
  });

  it('should copy icon content correctly', async () => {
    const iconContent = '<svg><path fill="#2668C5" d="M10 10"/></svg>';
    await fs.writeFile(path.join(outputDir, 'test-icon.svg'), iconContent);

    const config = { categorizeByColor: true, outputDir, monoColorDir, multiColorDir };
    const downloadedIcons = [{ name: 'test-icon', isMulticolor: false }];

    await saveNewIconsToCategories(config, downloadedIcons, new Set());

    const copiedContent = await fs.readFile(path.join(monoColorDir, 'test-icon.svg'), 'utf8');
    expect(copiedContent).toBe(iconContent);
  });

  it('should handle empty downloadedIcons array', async () => {
    const config = { categorizeByColor: true, outputDir, monoColorDir, multiColorDir };

    const result = await saveNewIconsToCategories(config, [], new Set());

    expect(result.monoAdded).toBe(0);
    expect(result.multiAdded).toBe(0);
  });

  it('should create directories if they do not exist', async () => {
    await fs.rm(monoColorDir, { recursive: true, force: true });
    await fs.rm(multiColorDir, { recursive: true, force: true });
    await fs.writeFile(path.join(outputDir, 'icon.svg'), '<svg></svg>');

    const config = { categorizeByColor: true, outputDir, monoColorDir, multiColorDir };
    const downloadedIcons = [{ name: 'icon', isMulticolor: false }];

    await saveNewIconsToCategories(config, downloadedIcons, new Set());

    const monoExists = await fs.access(monoColorDir).then(() => true).catch(() => false);
    const multiExists = await fs.access(multiColorDir).then(() => true).catch(() => false);

    expect(monoExists).toBe(true);
    expect(multiExists).toBe(true);
  });
});
