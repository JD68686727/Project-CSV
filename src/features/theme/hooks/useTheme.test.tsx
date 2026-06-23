// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTheme } from './useTheme';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  // jsdom has no matchMedia; stub a "prefers light" matcher.
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
});

describe('useTheme', () => {
  it('applies dark and persists the choice', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme('dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('logvibe.theme')).toBe('dark');
  });

  it('removes dark when switched to light', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme('dark'));
    act(() => result.current.setTheme('light'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('logvibe.theme')).toBe('light');
  });

  it('reads the persisted theme on init and applies it', () => {
    localStorage.setItem('logvibe.theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
