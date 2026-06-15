import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import dotenv from 'dotenv';

function getEnvConfig(file: string): Record<string, string> {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    return dotenv.parse(fs.readFileSync(fullPath));
  }
  return {};
}

export function parseNodeId(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return /^\d+-\d+$/.test(trimmed) ? trimmed.replace('-', ':') : trimmed;
}

export interface BaseConfig {
  token: string;
  fileKey: string;
  sectionNodeId: string;
  platforms: string[];
}

export interface SyncConfig {
  token: string;
  fileKey: string;
  frameNodeId: string;
  packName: string;
  platforms: string[];
  outputDir: string;
}

export function getBaseConfig(): BaseConfig {
  const env = { ...getEnvConfig('.env'), ...getEnvConfig('.env.local'), ...process.env };

  return {
    token: env.FIGMA_SYNC_TOKEN ?? '',
    fileKey: env.FIGMA_SYNC_FILE_KEY ?? '',
    sectionNodeId: parseNodeId(env.FIGMA_SYNC_SECTION_NODE_ID) ?? '',
    platforms: (env.FIGMA_SYNC_PLATFORMS ?? 'PD').split(',').map((p) => p.trim()).filter(Boolean),
  };
}

export function makeSyncConfig(base: BaseConfig, frameNodeId: string, packName: string): SyncConfig {
  return {
    token: base.token,
    fileKey: base.fileKey,
    frameNodeId,
    packName,
    platforms: base.platforms,
    outputDir: path.join('packs', packName),
  };
}
