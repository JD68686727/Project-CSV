import { describe, it, expect } from 'vitest';
import type { ColumnFilter } from '@/types/filter';
import { applyFilters, isFilterComplete } from './applyFilters';
import { makeDataset } from '@/test/factory';

const ds = makeDataset(
  [
    { name: 'level', type: 'string' },
    { name: 'code', type: 'number' },
    { name: 'cached', type: 'boolean' },
  ],
  [
    ['INFO', 200, true],
    ['WARN', 404, false],
    ['ERROR', 500, false],
    ['ERROR', 503, null],
    ['INFO', null, true],
  ],
);

const filter = (f: Partial<ColumnFilter>): ColumnFilter => ({
  id: 'f',
  columnKey: 'level',
  operator: 'contains',
  value: '',
  ...f,
});

describe('applyFilters', () => {
  it('returns all rows when no filters are active', () => {
    expect(applyFilters(ds, [])).toEqual([0, 1, 2, 3, 4]);
  });

  it('contains is case-insensitive', () => {
    const out = applyFilters(ds, [filter({ operator: 'contains', value: 'err' })]);
    expect(out).toEqual([2, 3]);
  });

  it('equals on a numeric column compares numerically', () => {
    const out = applyFilters(ds, [
      filter({ columnKey: 'code', operator: 'equals', value: '500' }),
    ]);
    expect(out).toEqual([2]);
  });

  it('gte/lt operate on numeric values, excluding nulls', () => {
    expect(
      applyFilters(ds, [filter({ columnKey: 'code', operator: 'gte', value: '500' })]),
    ).toEqual([2, 3]);
    expect(
      applyFilters(ds, [filter({ columnKey: 'code', operator: 'lt', value: '500' })]),
    ).toEqual([0, 1]);
  });

  it('between is inclusive and order-independent', () => {
    // value/value2 swapped → range [404, 500]; 503 (row 3) is outside it.
    const out = applyFilters(ds, [
      filter({ columnKey: 'code', operator: 'between', value: '500', value2: '404' }),
    ]);
    expect(out).toEqual([1, 2]);
  });

  it('isEmpty / isNotEmpty treat null as empty', () => {
    expect(
      applyFilters(ds, [filter({ columnKey: 'code', operator: 'isEmpty', value: '' })]),
    ).toEqual([4]);
    expect(
      applyFilters(ds, [
        filter({ columnKey: 'code', operator: 'isNotEmpty', value: '' }),
      ]),
    ).toEqual([0, 1, 2, 3]);
  });

  it('isTrue matches only boolean true', () => {
    expect(
      applyFilters(ds, [filter({ columnKey: 'cached', operator: 'isTrue', value: '' })]),
    ).toEqual([0, 4]);
  });

  it('skips incomplete filters (operator needs a value but none given)', () => {
    expect(
      applyFilters(ds, [filter({ columnKey: 'code', operator: 'gt', value: '' })]),
    ).toEqual([0, 1, 2, 3, 4]);
  });

  it('combines multiple filters with AND', () => {
    const out = applyFilters(ds, [
      filter({ operator: 'contains', value: 'error' }),
      filter({ columnKey: 'code', operator: 'gte', value: '503' }),
    ]);
    expect(out).toEqual([3]);
  });

  it('respects a provided base order', () => {
    const out = applyFilters(
      ds,
      [filter({ operator: 'contains', value: 'info' })],
      [4, 0],
    );
    expect(out).toEqual([4, 0]);
  });
});

describe('isFilterComplete', () => {
  it('unary operators are always complete', () => {
    expect(isFilterComplete(filter({ operator: 'isEmpty', value: '' }))).toBe(true);
  });
  it('range operators need both operands', () => {
    expect(
      isFilterComplete(filter({ operator: 'between', value: '1', value2: '' })),
    ).toBe(false);
    expect(
      isFilterComplete(filter({ operator: 'between', value: '1', value2: '2' })),
    ).toBe(true);
  });
});
