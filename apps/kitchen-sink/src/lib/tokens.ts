export interface Token {
  name: string;
  /** First path segment after the `--av-` prefix, used to group swatches. */
  group: string;
}

/**
 * Collect the `--av-*` custom properties the loaded stylesheets define on
 * `:root`. Names are read once from the CSS rules; live values are resolved at
 * render time via `getComputedStyle` so they reflect the active theme.
 */
export function readTokenNames(): Token[] {
  const seen = new Set<string>();
  const tokens: Token[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // Cross-origin stylesheet — not ours, skip.
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      if (!/(^|[\s,(])(:root)([\s,)]|$)/.test(rule.selectorText)) continue;
      for (const prop of Array.from(rule.style)) {
        if (!prop.startsWith('--av-') || seen.has(prop)) continue;
        seen.add(prop);
        const rest = prop.slice('--av-'.length);
        tokens.push({ name: prop, group: rest.split('-')[0] || 'other' });
      }
    }
  }

  return tokens.sort((a, b) => a.name.localeCompare(b.name));
}

export function resolveToken(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
