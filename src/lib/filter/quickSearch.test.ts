import { describe, it, expect } from 'vitest';
import { applyQuickSearch } from './quickSearch';
import { makeDataset, allRows } from '@/test/factory';

const ds = makeDataset(
  [
    { name: 'level', type: 'string' },
    { name: 'code', type: 'number' },
    { name: 'endpoint', type: 'string' },
  ],
  [
    ['INFO', 200, '/api/users'],
    ['ERROR', 500, '/api/payments'],
    ['WARN', 404, '/api/orders'],
    ['ERROR', 503, '/api/payments'],
    ['INFO', null, '/api/health'],
  ],
);

describe('applyQuickSearch', () => {
  it('returns the input order unchanged for an empty/whitespace query', () => {
    expect(applyQuickSearch(ds, allRows(ds), '')).toEqual([0, 1, 2, 3, 4]);
    expect(applyQuickSearch(ds, allRows(ds), '   ')).toEqual([0, 1, 2, 3, 4]);
  });

  it('matches across any column, case-insensitively', () => {
    expect(applyQuickSearch(ds, allRows(ds), 'payments')).toEqual([1, 3]);
    expect(applyQuickSearch(ds, allRows(ds), 'error')).toEqual([1, 3]);
  });

  it('matches numeric cells by their string form', () => {
    expect(applyQuickSearch(ds, allRows(ds), '404')).toEqual([2]);
  });

  it('returns no rows when nothing matches', () => {
    expect(applyQuickSearch(ds, allRows(ds), 'zzz')).toEqual([]);
  });

  it('only searches within the provided order (composes with prior filters)', () => {
    // Pretend a structured filter already kept rows 1 and 4.
    expect(applyQuickSearch(ds, [1, 4], 'api')).toEqual([1, 4]);
    expect(applyQuickSearch(ds, [1, 4], 'health')).toEqual([4]);
  });

  it('ignores null cells', () => {
    // row 4 has a null code; searching the empty-ish value must not throw/match.
    expect(applyQuickSearch(ds, [4], 'null')).toEqual([]);
  });
});
