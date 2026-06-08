import { describe, expect, it } from 'vitest';

import { escapeRegExp, findDuplicates, formatName, groupIconsByPage, isMulticolor } from '../helpers';

describe('formatName', () => {
  it('should convert to lowercase', () => {
    expect(formatName('IconName')).toBe('icon-name');
  });

  it('should replace spaces with hyphens', () => {
    expect(formatName('icon name')).toBe('icon-name');
  });

  it('should normalize slashes', () => {
    expect(formatName('folder / icon')).toBe('folder/icon');
  });

  it('should trim whitespace', () => {
    expect(formatName('  icon  ')).toBe('icon');
  });

  it('should handle complex names', () => {
    expect(formatName('My Icon / Variant 1')).toBe('my-icon/variant-1');
  });

  it('should convert camelCase to kebab-case', () => {
    expect(formatName('macBook')).toBe('mac-book');
    expect(formatName('ESXi')).toBe('esx-i');
    expect(formatName('iOS')).toBe('i-os');
    expect(formatName('tvOS')).toBe('tv-os');
  });

  it('should handle real icon names with camelCase', () => {
    expect(formatName('devices-ESXi-host--24')).toBe('devices-esx-i-host--24');
    expect(formatName('laptop-macBook-disabled-ill--96')).toBe('laptop-mac-book-disabled-ill--96');
    expect(formatName('devices-iOS-tvOS--24')).toBe('devices-i-os-tv-os--24');
  });

  it('should handle consecutive uppercase letters', () => {
    expect(formatName('XMLHttpRequest')).toBe('xml-http-request');
    expect(formatName('HTMLElement')).toBe('html-element');
  });
});

describe('findDuplicates', () => {
  it('should not modify array without duplicates', () => {
    const items = [{ name: 'icon1' }, { name: 'icon2' }, { name: 'icon3' }];

    const result = findDuplicates('name', items);

    expect(result).toEqual(items);
  });

  it('should rename duplicate items', () => {
    const items = [{ name: 'icon1' }, { name: 'icon2' }, { name: 'icon1' }];

    const result = findDuplicates('name', items);

    expect(result[0].name).toBe('icon1');
    expect(result[1].name).toBe('icon2');
    expect(result[2].name).toBe('icon1-duplicate');
  });

  it('should handle multiple duplicates', () => {
    const items = [{ name: 'icon1' }, { name: 'icon1' }, { name: 'icon1' }];

    const result = findDuplicates('name', items);

    expect(result[0].name).toBe('icon1');
    expect(result[1].name).toBe('icon1-duplicate');
    expect(result[2].name).toBe('icon1-duplicate');
  });
});

describe('escapeRegExp', () => {
  it('should escape special regex characters', () => {
    expect(escapeRegExp('.')).toBe('\\.');
    expect(escapeRegExp('*')).toBe('\\*');
    expect(escapeRegExp('+')).toBe('\\+');
    expect(escapeRegExp('?')).toBe('\\?');
  });

  it('should escape brackets', () => {
    expect(escapeRegExp('[test]')).toBe('\\[test\\]');
    expect(escapeRegExp('{test}')).toBe('\\{test\\}');
  });

  it('should handle complex strings', () => {
    const input = '#181818';
    const escaped = escapeRegExp(input);
    const regex = new RegExp(escaped, 'g');

    expect('#181818'.replace(regex, 'currentColor')).toBe('currentColor');
  });
});

describe('isMulticolor', () => {
  it('should return false for monocolor SVG', () => {
    const svg = '<svg><path fill="#2668C5"/></svg>';
    expect(isMulticolor(svg)).toBe(false);
  });

  it('should return true for multicolor SVG', () => {
    const svg = '<svg><path fill="#2668C5"/><path fill="#FF0000"/></svg>';
    expect(isMulticolor(svg)).toBe(true);
  });

  it('should ignore currentColor', () => {
    const svg = '<svg><path fill="currentColor"/><path fill="#2668C5"/></svg>';
    expect(isMulticolor(svg)).toBe(false);
  });

  it('should ignore none and transparent', () => {
    const svg = '<svg><path fill="none"/><path fill="transparent"/><path fill="#2668C5"/></svg>';
    expect(isMulticolor(svg)).toBe(false);
  });

  it('should handle stroke colors', () => {
    const svg = '<svg><path stroke="#2668C5"/><path stroke="#FF0000"/></svg>';
    expect(isMulticolor(svg)).toBe(true);
  });

  it('should normalize 3-digit hex colors', () => {
    const svg = '<svg><path fill="#F00"/><path fill="#FF0000"/></svg>';
    expect(isMulticolor(svg)).toBe(false);
  });

  it('should be case insensitive', () => {
    const svg = '<svg><path fill="#2668C5"/><path fill="#2668c5"/></svg>';
    expect(isMulticolor(svg)).toBe(false);
  });

  it('should return false for empty SVG', () => {
    const svg = '<svg></svg>';
    expect(isMulticolor(svg)).toBe(false);
  });

  it('should handle mixed fill and stroke', () => {
    const svg = '<svg><path fill="#2668C5" stroke="#FF0000"/></svg>';
    expect(isMulticolor(svg)).toBe(true);
  });

  it('should return true for SVG with url() gradient fill', () => {
    const svg = '<svg><path fill="url(#gradient1)"/><defs><linearGradient id="gradient1"><stop stop-color="#3849E0"/><stop stop-color="#FC2DF1"/></linearGradient></defs></svg>';
    expect(isMulticolor(svg)).toBe(true);
  });

  it('should return true for SVG with url() gradient stroke', () => {
    const svg = '<svg><path stroke="url(#gradient1)"/><defs><linearGradient id="gradient1"><stop stop-color="#3849E0"/><stop stop-color="#FC2DF1"/></linearGradient></defs></svg>';
    expect(isMulticolor(svg)).toBe(true);
  });

  it('should return true for SVG with only url() fills and no hex colors', () => {
    const svg = '<svg fill="none"><path fill="url(#a)"/><path fill="url(#b)"/></svg>';
    expect(isMulticolor(svg)).toBe(true);
  });
});

describe('groupIconsByPage', () => {
  it('should group icons by page name', () => {
    const icons = [
      { name: 'icon1', pageName: 'Actions' },
      { name: 'icon2', pageName: 'Arrows' },
      { name: 'icon3', pageName: 'Actions' },
    ];

    const result = groupIconsByPage(icons);

    expect(result).toHaveProperty('actions');
    expect(result).toHaveProperty('arrows');
    expect(result.actions).toHaveLength(2);
    expect(result.arrows).toHaveLength(1);
  });

  it('should format page names to lowercase with hyphens', () => {
    const icons = [
      { name: 'icon1', pageName: 'Monocolor - Actions' },
      { name: 'icon2', pageName: 'Multicolor - Status' },
    ];

    const result = groupIconsByPage(icons);

    expect(result).toHaveProperty('monocolor---actions');
    expect(result).toHaveProperty('multicolor---status');
  });

  it('should handle empty array', () => {
    const result = groupIconsByPage([]);
    expect(result).toEqual({});
  });

  it('should handle single page', () => {
    const icons = [
      { name: 'icon1', pageName: 'Actions' },
      { name: 'icon2', pageName: 'Actions' },
    ];

    const result = groupIconsByPage(icons);

    expect(Object.keys(result)).toHaveLength(1);
    expect(result.actions).toHaveLength(2);
  });

  it('should preserve icon data', () => {
    const icons = [
      { name: 'icon1', pageName: 'Actions', id: '123' },
      { name: 'icon2', pageName: 'Actions', id: '456' },
    ];

    const result = groupIconsByPage(icons);

    expect(result.actions[0]).toEqual({ name: 'icon1', pageName: 'Actions', id: '123' });
    expect(result.actions[1]).toEqual({ name: 'icon2', pageName: 'Actions', id: '456' });
  });
});
