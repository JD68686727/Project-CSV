import type { ResolvedTheme, Theme } from '@/types/theme';

export const THEME_STORAGE_KEY = 'logvibe.theme';

/** Parses a stored value into a Theme, defaulting unknown/missing to 'system'. */
export function parseTheme(value: string | null): Theme {
  return value === 'light' || value === 'dark' || value === 'system'
    ? value
    : 'system';
}

/** Resolves the effective light/dark mode, honouring the OS preference for 'system'. */
export function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}
