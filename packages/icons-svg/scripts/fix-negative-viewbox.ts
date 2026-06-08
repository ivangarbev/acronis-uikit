/**
 * Minimal fix: only change viewBox and shift absolute path coordinates so the
 * viewBox origin becomes "0 0". Does NOT change any other SVG attributes,
 * structure, or formatting.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const monoDir = resolve(currentDir, '../src/monocolor-icons');

// SVG path command parameter counts
const CMD_PARAMS: Record<string, number> = {
  M: 2,
  L: 2,
  H: 1,
  V: 1,
  C: 6,
  S: 4,
  Q: 4,
  T: 2,
  A: 7,
  Z: 0,
};

interface PathToken {
  type: 'cmd' | 'num' | 'ws';
  raw: string;
  value?: string | number;
}

/**
 * Tokenize SVG path data into commands and numbers, preserving original formatting.
 */
function tokenizePath(d: string): PathToken[] {
  const tokens: PathToken[] = [];
  const re = /([MLHVCSQTAZ])|([ ,\t\n\r]+)|([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)/gi;
  let match = re.exec(d);
  while (match !== null) {
    if (match[1]) {
      tokens.push({ type: 'cmd', raw: match[1], value: match[1] });
    } else if (match[2]) {
      tokens.push({ type: 'ws', raw: match[2] });
    } else {
      tokens.push({ type: 'num', raw: match[3], value: Number.parseFloat(match[3]) });
    }
    match = re.exec(d);
  }
  return tokens;
}

/**
 * Format a number preserving reasonable precision, matching the original digit count.
 */
function formatNum(val: number, originalRaw: string): string {
  const dotIdx = originalRaw.indexOf('.');
  let decimals = 0;
  if (dotIdx >= 0) {
    const afterDot = originalRaw.slice(dotIdx + 1).replace(/e.*/i, '');
    decimals = afterDot.length;
  }
  let result = val.toFixed(decimals);
  if (result.includes('.')) {
    result = result.replace(/0+$/, '').replace(/\.$/, '');
  }
  if (result === '' || result === '-') {
    result = '0';
  }
  return result;
}

/**
 * Check if two adjacent number strings can be concatenated without ambiguity.
 */
function needsSeparator(prevNumStr: string, nextNumStr: string): boolean {
  if (nextNumStr.startsWith('-') || nextNumStr.startsWith('+')) {
    return false;
  }
  if (nextNumStr.startsWith('.')) {
    return false;
  }
  return true;
}

/**
 * Shift absolute coordinates in path data string. Returns new path string.
 */
function shiftPathData(d: string, dx: number, dy: number): string {
  const tokens = tokenizePath(d);

  // First pass: compute shifted values for each number token
  let i = 0;
  let currentCmd = '';
  let isAbsolute = false;
  let paramCount = 0;
  let paramIdx = 0;
  let isFirstCmd = true; // first 'm' is effectively absolute per SVG spec
  let isFirstMHandled = false; // tracks when first lowercase 'm' needs to revert to relative

  const shiftedValues = new Map<number, string>();

  while (i < tokens.length) {
    const tok = tokens[i];

    if (tok.type === 'cmd') {
      const cmdValue = tok.value as string;
      currentCmd = cmdValue.toUpperCase();
      if (isFirstCmd && cmdValue === 'm') {
        isAbsolute = true;
        isFirstMHandled = true;
      } else {
        isAbsolute = cmdValue === currentCmd;
        isFirstMHandled = false;
      }
      paramCount = CMD_PARAMS[currentCmd] || 0;
      paramIdx = 0;
      isFirstCmd = false;
      i++;
      continue;
    }

    if (tok.type === 'num' && isAbsolute && paramCount > 0) {
      let val = tok.value as number;
      let shift = 0;

      if (currentCmd === 'H') {
        shift = dx;
      } else if (currentCmd === 'V') {
        shift = dy;
      } else if (currentCmd === 'A') {
        if (paramIdx === 5) shift = dx;
        if (paramIdx === 6) shift = dy;
      } else if (paramIdx % 2 === 0) {
        shift = dx;
      } else {
        shift = dy;
      }

      if (shift !== 0) {
        val += shift;
        shiftedValues.set(i, formatNum(val, tok.raw));
      }

      paramIdx++;
      if (paramIdx >= paramCount) {
        paramIdx = 0;
        if (isFirstMHandled) {
          isAbsolute = false;
          isFirstMHandled = false;
        }
      }
    } else if (tok.type === 'num') {
      paramIdx++;
      if (paramIdx >= paramCount) paramIdx = 0;
    }

    i++;
  }

  // Second pass: rebuild string, inserting separators only when needed
  let result = '';
  let prevNumStr: string | null = null;

  for (let j = 0; j < tokens.length; j++) {
    const tok = tokens[j];

    if (tok.type === 'num') {
      const numStr = shiftedValues.has(j) ? (shiftedValues.get(j) as string) : tok.raw;

      if (prevNumStr !== null && needsSeparator(prevNumStr, numStr)) {
        result += ' ';
      }
      result += numStr;
      prevNumStr = numStr;
    } else if (tok.type === 'ws') {
      result += tok.raw;
      prevNumStr = null;
    } else {
      result += tok.raw;
      prevNumStr = null;
    }
  }

  return result;
}

interface FixResult {
  skipped?: boolean;
  fixed?: boolean;
  from?: string;
  to?: string;
  dx?: number;
  dy?: number;
}

function fixSvg(filePath: string): FixResult {
  let content = readFileSync(filePath, 'utf-8');

  const vbMatch = content.match(/viewBox="([^"]+)"/);
  if (!vbMatch) return { skipped: true };

  const parts = vbMatch[1].trim().split(/\s+/).map(Number);
  const [minX, minY, w, h] = parts;
  if (minX >= 0 && minY >= 0) return { skipped: true };

  const dx = -minX;
  const dy = -minY;

  content = content.replace(`viewBox="${vbMatch[1]}"`, `viewBox="0 0 ${w} ${h}"`);
  content = content.replace(/ d="([^"]+)"/g, (match, d: string) => ` d="${shiftPathData(d, dx, dy)}"`);

  writeFileSync(filePath, content, 'utf-8');
  return { fixed: true, from: vbMatch[1], to: `0 0 ${w} ${h}`, dx, dy };
}

function main(): void {
  const files = readdirSync(monoDir)
    .filter((file) => file.endsWith('.svg'))
    .sort()
    .map((file) => resolve(monoDir, file));

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const r = fixSvg(file);
      if (r.skipped) {
        skipped++;
        continue;
      }
      fixed++;
      console.log(`✅ ${file.split('/').pop()}: "${r.from}" → "${r.to}"`);
    } catch (err) {
      errors++;
      console.error(`❌ ${file.split('/').pop()}: ${(err as Error).message}`);
    }
  }
  console.log(`\nDone: ${fixed} fixed, ${skipped} skipped, ${errors} errors`);
}

main();
