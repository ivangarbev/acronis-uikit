#!/usr/bin/env -S node --import tsx
import process from 'node:process';

import { fetchIcons } from './fetch-icons';

export { fetchIcons };
export { getConfig } from './helpers';
export * from './types';

// Auto-run when executed directly (e.g. `tsx src/index.ts`).
if (import.meta.url === `file://${process.argv[1]}`) {
  void fetchIcons();
}
