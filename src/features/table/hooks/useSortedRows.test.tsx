// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSortedRows } from './useSortedRows';
import { makeDataset, allRows } from '@/test/factory';

// rows: [level, n]
const ds = makeDataset(
  [
    { name: 'level', key: 'level', type: 'string' },
    { name: 'n', key: 'n', type: 'number' },
  ],
  [
    ['INFO', 30], // 0
    ['INFO', 10], // 1
    ['ERROR', 20], // 2
    ['ERROR', null], // 3
  ],
);

describe('useSortedRows', () => {
  it('returns the base order untouched when unsorted', () => {
    const base = allRows(ds);
    const { result } = renderHook(() => useSortedRows(ds, base));
    expect(result.current.sortKeys).toEqual([]);
    expect(result.current.order).toBe(base);
  });

  it('plain toggleSort cycles a column asc → desc → cleared, nulls last', () => {
    const { result } = renderHook(() => useSortedRows(ds, allRows(ds)));

    act(() => result.current.toggleSort('n', false));
    expect(result.current.sortKeys).toEqual([{ columnKey: 'n', direction: 'asc' }]);
    expect(result.current.order).toEqual([1, 2, 0, 3]); // 10,20,30, null last

    act(() => result.current.toggleSort('n', false));
    expect(result.current.sortKeys).toEqual([{ columnKey: 'n', direction: 'desc' }]);

    act(() => result.current.toggleSort('n', false));
    expect(result.current.sortKeys).toEqual([]);
  });

  it('Shift-click adds a secondary sort that breaks ties', () => {
    const { result } = renderHook(() => useSortedRows(ds, allRows(ds)));
    act(() => result.current.toggleSort('level', false)); // primary: level asc
    act(() => result.current.toggleSort('n', true)); // secondary: n asc

    expect(result.current.sortKeys).toEqual([
      { columnKey: 'level', direction: 'asc' },
      { columnKey: 'n', direction: 'asc' },
    ]);
    // ERROR: 20(2), null(3) ; INFO: 10(1), 30(0)
    expect(result.current.order).toEqual([2, 3, 1, 0]);
  });

  it('setSort replaces the sort outright', () => {
    const { result } = renderHook(() => useSortedRows(ds, allRows(ds)));
    act(() => result.current.setSort([{ columnKey: 'n', direction: 'desc' }]));
    expect(result.current.order).toEqual([0, 2, 1, 3]); // 30,20,10, null last
  });
});
