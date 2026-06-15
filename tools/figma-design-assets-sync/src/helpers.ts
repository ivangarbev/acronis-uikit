export interface ParsedDescription {
  category: string[];
  tags: string[];
  legacyNames: string[];
}

/**
 * Converts a PascalCase or mixed-case string to kebab-case.
 * e.g. "ArrowDown" → "arrow-down", "ESXi" → "esx-i", "Cctv" → "cctv"
 */
export function formatName(name: string): string {
  return name
    .trim()
    .replaceAll(/([a-z\d])([A-Z])/g, '$1-$2')
    .replaceAll(/[A-Z]{2,}/g, (match, offset: number, str: string) => {
      const after = str.slice(offset + match.length);
      if (after && /^[a-z]/.test(after)) {
        if (/^[a-z]{2,}/.test(after)) {
          return `${match.slice(0, -1)}-${match.slice(-1)}`;
        }
        return `${match}-`;
      }
      return match;
    })
    .toLowerCase()
    .replaceAll(/\s*\/\s*/g, '/')
    .replaceAll(/\s+/g, '-');
}

export function escapeRegExp(text: string): string {
  return text.replaceAll(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Parses a Figma component description string into structured metadata.
 * Expected format: "Categories: X, Y Tags: a, b, c LegacyNames: d, e"
 * Any missing section results in an empty array.
 */
export function parseDescription(description: string): ParsedDescription {
  if (!description.trim()) {
    return { category: [], tags: [], legacyNames: [] };
  }

  const parseList = (match: RegExpExecArray | null): string[] => {
    if (!match?.[1]?.trim()) return [];
    return match[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const catMatch = /Categories:\s*(.*?)(?=Tags:|LegacyNames:|$)/is.exec(description);
  const tagsMatch = /Tags:\s*(.*?)(?=Categories:|LegacyNames:|$)/is.exec(description);
  const legacyMatch = /LegacyNames:\s*(.*?)(?=Categories:|Tags:|$)/is.exec(description);

  return {
    category: parseList(catMatch),
    tags: parseList(tagsMatch),
    legacyNames: parseList(legacyMatch),
  };
}
