// React codegen coverage: geometry dedup across sizes, the variant (style) axis
// with precedence default, the size default = canonical, and that emitted .tsx is
// syntactically valid.

import { rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import ts from 'typescript';

import { generateComponent, type StyleInput } from '../react/codegen';

// Tool root, so the temp file's `import 'react'` resolves via node_modules.
const TOOL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/** Real semantic type-check of a generated component against @types/react. */
function typeCheckErrors(source: string): string[] {
  const file = path.join(TOOL_ROOT, '.tmp-codegen-check.tsx');
  writeFileSync(file, source);
  try {
    const program = ts.createProgram([file], {
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
      skipLibCheck: true,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      noEmit: true,
      types: [],
    });
    return ts
      .getPreEmitDiagnostics(program)
      .filter((d) => d.category === ts.DiagnosticCategory.Error)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  } finally {
    rmSync(file, { force: true });
  }
}

const SVG24 =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M1 1h2v2H1z"/></svg>';
const SVG16 = SVG24.replace('width="24" height="24"', 'width="16" height="16"');

const STROKE =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path stroke="#111" stroke-width="2" d="M1 1h2"/></svg>';
const SOLID =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill="#111" d="M1 1h2v2H1z"/></svg>';

const single = (variants: StyleInput['variants']): StyleInput => ({
  style: 'concept-pack',
  canonical: '24',
  variants,
});

describe('react codegen', () => {
  it('dedups identical geometry across sizes (one geometry constant)', () => {
    const { source } = generateComponent({
      id: 'demo',
      hasVariantAxis: false,
      styles: [single([{ size: '24', svg: SVG24 }, { size: '16', svg: SVG16 }])],
    });
    expect(source.match(/const g\d+ =/g) ?? []).toHaveLength(1);
    expect(source).toContain('size?: DemoSize');
    expect(source).toContain("DEFAULT_SIZE: DemoSize = '24'");
  });

  it('names the file in PascalCase, keeping the kebab id for the barrel', () => {
    const c = generateComponent({
      id: 'icon-basic',
      hasVariantAxis: false,
      styles: [single([{ size: '24', svg: SVG24 }])],
    });
    expect(c.fileName).toBe('IconBasic');
    expect(c.componentName).toBe('IconBasic');
    expect(c.id).toBe('icon-basic');
  });

  it('exposes the style union with precedence default for the variant axis', () => {
    const { source } = generateComponent({
      id: 'demo',
      hasVariantAxis: true,
      styles: [
        { style: 'icons-solid-mono', canonical: '24', variants: [{ size: '24', svg: SOLID }] },
        { style: 'icons-stroke-mono', canonical: '24', variants: [{ size: '24', svg: STROKE }] },
      ],
    });
    expect(source).toContain("DemoVariant = 'stroke-mono' | 'solid-mono'");
    expect(source).toContain("DEFAULT_VARIANT: DemoVariant = 'stroke-mono'");
    // two distinct geometries (stroke vs solid)
    expect(source.match(/const g\d+ =/g) ?? []).toHaveLength(2);
  });

  it('emits type-correct TSX (size-only component)', () => {
    const { source } = generateComponent({
      id: 'demo',
      hasVariantAxis: false,
      styles: [single([{ size: '24', svg: SVG24 }, { size: '16', svg: SVG16 }])],
    });
    expect(typeCheckErrors(source)).toEqual([]);
  });

  it('emits type-correct TSX (variant-axis component)', () => {
    const { source } = generateComponent({
      id: 'demo',
      hasVariantAxis: true,
      styles: [
        { style: 'icons-stroke-mono', canonical: '24', variants: [{ size: '24', svg: STROKE }] },
        { style: 'icons-solid-mono', canonical: '24', variants: [{ size: '24', svg: SOLID }] },
      ],
    });
    expect(typeCheckErrors(source)).toEqual([]);
  });
});
