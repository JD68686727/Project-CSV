import { describe, it, expect } from 'vitest';
import { parseTheme, resolveTheme } from './theme';

describe('parseTheme', () => {
  it('passes through valid themes', () => {
    expect(parseTheme('light')).toBe('light');
    expect(parseTheme('dark')).toBe('dark');
    expect(parseTheme('system')).toBe('system');
  });

  it('defaults unknown / null to system', () => {
    expect(parseTheme(null)).toBe('system');
    expect(parseTheme('')).toBe('system');
    expect(parseTheme('purple')).toBe('system');
  });
});

describe('resolveTheme', () => {
  it('returns explicit themes unchanged', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('follows the OS preference for system', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});
