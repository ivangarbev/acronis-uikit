import fs from 'node:fs/promises';
import path from 'node:path';

import { optimize, type Config } from 'svgo';

import { escapeRegExp, formatName, isMulticolor } from './helpers';
import type { FetcherConfig, DownloadedIcon, IconWithUrl } from './types';

/**
 * Downloads an SVG icon from Figma and saves it as an optimized SVG file.
 * Supports saving to multiple directories. Color categorization (mono/multi)
 * is handled separately so legacy icons are never deleted.
 */
export async function downloadImage(config: FetcherConfig, icon: IconWithUrl): Promise<DownloadedIcon> {
  const url = icon.image;
  const formattedName = formatName(icon.name);

  if (!url) {
    throw new Error(`Icon "${icon.name}" (ID: ${icon.id}) has no image URL`);
  }

  try {
    // Fetch SVG content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const svgText = await response.text();

    // Build SVGO plugins list
    const plugins: Config['plugins'] = [
      {
        name: 'preset-default',
        params: {
          overrides: {
            // SVGO v4 drops removeViewBox from preset-default, so viewBox is
            // already preserved by default (needed to resize SVGs with CSS) —
            // do not re-add removeViewBox here.
            // Keep precision higher for cleaner diagonals.
            cleanupNumericValues: { floatPrecision: 4 },
            convertPathData: { floatPrecision: 4 },
          },
        },
      },
      'removeDimensions',
      {
        name: 'prefixIds',
        params: {
          delim: '-',
          prefix: formattedName.replace(/[/\\]/g, '-'),
        },
      },
    ];

    // Only add className if it's defined
    if (config.className) {
      plugins.push({
        name: 'addClassesToSVGElement',
        params: {
          className: config.className,
        },
      });
    }

    // Optimize SVG
    const optimizedSvg = optimize(svgText, { plugins });

    // Replace system color with currentColor for theming
    const systemColorRegex = new RegExp(escapeRegExp(config.systemColor), 'gi');
    const content = optimizedSvg.data.replace(systemColorRegex, 'currentColor');

    // Detect if icon is multicolor
    const iconIsMulticolor = isMulticolor(content);

    // Determine output directories (excluding mono/multi - those are handled separately)
    const outputDirs = [config.outputDir, ...config.outputDirs];

    // Save to all output directories
    const savedPaths: string[] = [];
    for (const dir of outputDirs) {
      const outputPath = path.join(dir, `${formattedName}.svg`);
      const outputDirPath = path.dirname(outputPath);

      // Ensure output directory exists
      await fs.mkdir(outputDirPath, { recursive: true });

      // Write SVG file
      await fs.writeFile(outputPath, content, 'utf8');
      savedPaths.push(outputPath);
    }

    return {
      ...icon,
      isMulticolor: iconIsMulticolor,
      savedPaths,
    };
  } catch (err) {
    throw new Error(`Failed to download icon "${icon.name}" (ID: ${icon.id})`, { cause: err });
  }
}
