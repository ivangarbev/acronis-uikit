import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { fetchIcons } from '../fetch-icons';
import { getConfig } from '../helpers';

describe.skipIf(!process.env.FIGMA_FETCHER_FIGMA_TOKEN)('integration: fetchIcons', () => {
  const testOutputDir = path.join(process.cwd(), 'test-icons-output');

  beforeEach(async () => {
    await fs.rm(testOutputDir, { recursive: true, force: true });
  });

  afterEach(async () => {
    await fs.rm(testOutputDir, { recursive: true, force: true });
  });

  it('should fetch icons from Figma and save as SVG files', async () => {
    const config = getConfig();

    // Verify required config is present
    expect(config.token).toBeDefined();
    expect(config.fileKey).toBeDefined();
    expect(config.pageNames.length).toBeGreaterThan(0);
    expect(config.frameNames.length).toBeGreaterThan(0);

    await fetchIcons({ ...config, outputDir: testOutputDir });

    // Verify output directory was created
    const dirExists = await fs.access(testOutputDir).then(() => true).catch(() => false);
    expect(dirExists).toBe(true);

    // Verify SVG files were created
    const files = await fs.readdir(testOutputDir, { recursive: true });
    const svgFiles = files.filter((f) => f.endsWith('.svg'));

    expect(svgFiles.length).toBeGreaterThan(0);

    // Verify SVG file content
    const firstSvgPath = path.join(testOutputDir, svgFiles[0]);
    const svgContent = await fs.readFile(firstSvgPath, 'utf8');

    expect(svgContent).toContain('<svg');
    expect(svgContent).toContain('</svg>');
    expect(svgContent).toMatch(/viewBox="[^"]+"/);

    if (config.className) {
      expect(svgContent).toContain(`class="${config.className}"`);
    }

    console.log(`✓ Successfully fetched ${svgFiles.length} icons`);
    console.log(`✓ Sample icon: ${svgFiles[0]}`);
  }, 30000);
});
