import { useCallback, useEffect, useState } from 'react';
import type { Theme } from '@/types/theme';
import { THEME_STORAGE_KEY, parseTheme, resolveTheme } from '@/lib/theme/theme';

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme: Theme): void {
  const resolved = resolveTheme(theme, prefersDark());
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export interface UseTheme {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/**
 * Owns the light/dark/system preference: persists it, toggles the `dark` class
 * on <html>, and re-applies when the OS preference changes in 'system' mode.
 * (An inline script in index.html applies it pre-paint to avoid a flash.)
 */
export function useTheme(): UseTheme {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage unavailable — keep the in-memory preference
    }
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
