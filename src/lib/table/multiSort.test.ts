import { describe, it, expect } from 'vitest';
import type { SortKey } from '@/types/table';
import { applyMultiSort, toggleSortKey } from './multiSort';
import { makeDataset, allRows } from '@/test/factory';

describe('toggleSortKey', () => {
  it('plain click cycles a single column asc → desc → none', () => {
    let keys: SortKey[] = [];
    keys = toggleSortKey(keys, 'a', false);
    expect(keys).toEqual([{ columnKey: 'a', direction: 'asc' }]);
    keys = toggleSortKey(keys, 'a', false);
    expect(keys).toEqual([{ columnKey: 'a', direction: 'desc' }]);
    keys = toggleSortKey(keys, 'a', false);
    expect(keys).toEqual([]);
  });

  it('plain click on a different column replaces the whole sort', () => {
    const keys = toggleSortKey([{ columnKey: 'a', direction: 'desc' }], 'b', false);
    expect(keys).toEqual([{ columnKey: 'b', direction: 'asc' }]);
  });

  it('Shift-click appends a column, keeping existing keys and order', () => {
    let keys: SortKey[] = [{ columnKey: 'a', direction: 'asc' }];
    keys = toggleSortKey(keys, 'b', true);
    expect(keys).toEqual([
      { columnKey: 'a', direction: 'asc' },
      { columnKey: 'b', direction: 'asc' },
    ]);
  });

  it('Shift-click cycles a column in place then removes it', () => {
    let keys: SortKey[] = [
      { columnKey: 'a', direction: 'asc' },
      { columnKey: 'b', direction: 'asc' },
    ];
    keys = toggleSortKey(keys, 'a', true); // asc → desc, stays first
    expect(keys).toEqual([
      { columnKey: 'a', direction: 'desc' },
      { columnKey: 'b', direction: 'asc' },
    ]);
    keys = toggleSortKey(keys, 'a', true); // desc → removed
    expect(keys).toEqual([{ columnKey: 'b', direction: 'asc' }]);
  });
});

describe('applyMultiSort', () => {
  // level (string), latency (number)
  const ds = makeDataset(
    [
      { name: 'level', key: 'level', type: 'string' },
      { name: 'latency', key: 'latency', type: 'number' },
    ],
    [
      ['INFO', 10], // 0
      ['ERROR', 50], // 1
      ['ERROR', 20], // 2
      ['INFO', 5], // 3
      ['WARN', null], // 4
    ],
  );

  it('returns the base order untouched with no keys', () => {
    const base = allRows(ds);
    expect(applyMultiSort(ds, base, [])).toBe(base);
  });

  it('sorts by a single key, nulls last', () => {
    const out = applyMultiSort(ds, allRows(ds), [
      { columnKey: 'latency', direction: 'asc' },
    ]);
    expect(out).toEqual([3, 0, 2, 1, 4]); // 5,10,20,50, null
  });

  it('breaks ties by the secondary key', () => {
    // primary level asc (ERROR, INFO, WARN), secondary latency desc
    const out = applyMultiSort(ds, allRows(ds), [
      { columnKey: 'level', direction: 'asc' },
      { columnKey: 'latency', direction: 'desc' },
    ]);
    // ERROR: 50(1),20(2) ; INFO: 10(0),5(3) ; WARN: null(4)
    expect(out).toEqual([1, 2, 0, 3, 4]);
  });

  it('skips unknown columns', () => {
    const base = allRows(ds);
    expect(applyMultiSort(ds, base, [{ columnKey: 'gone', direction: 'asc' }])).toBe(
      base,
    );
  });
});
