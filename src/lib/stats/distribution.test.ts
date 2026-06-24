import { describe, it, expect } from 'vitest';
import { computeColumnDistributions } from './distribution';
import { makeDataset, allRows } from '@/test/factory';

const ds = makeDataset(
  [
    { name: 'level', key: 'level', type: 'string' },
    { name: 'n', key: 'n', type: 'number' },
    { name: 'blank', key: 'blank', type: 'string' },
  ],
  [
    ['INFO', 0, null],
    ['INFO', 10, null],
    ['WARN', 100, null],
    ['ERROR', 50, null],
    ['INFO', null, null],
  ],
);

describe('computeColumnDistributions', () => {
  const dists = computeColumnDistributions(ds, allRows(ds));

  it('returns a categorical distribution with top values for string columns', () => {
    const level = dists[0];
    expect(level.kind).toBe('categorical');
    if (level.kind === 'categorical') {
      expect(level.top[0]).toEqual({ value: 'INFO', count: 3 }); // most common first
      expect(level.total).toBe(5); // INFO×3, WARN×1, ERROR×1 → 5 non-null
      expect(level.othersCount).toBe(0); // all 3 distinct fit in top-N
    }
  });

  it('returns a numeric histogram with bins spanning min..max', () => {
    const num = dists[1];
    expect(num.kind).toBe('numeric');
    if (num.kind === 'numeric') {
      expect(num.min).toBe(0);
      expect(num.max).toBe(100);
      expect(num.bins).toHaveLength(12);
      // 4 numeric values (null excluded) distributed across bins
      expect(num.bins.reduce((s, b) => s + b, 0)).toBe(4);
      expect(num.bins[0]).toBeGreaterThan(0); // 0 and 10 land in the first bins
    }
  });

  it('returns empty for an all-null column', () => {
    expect(dists[2]).toEqual({ kind: 'empty' });
  });

  it('respects the provided order (filtered subset)', () => {
    const subset = computeColumnDistributions(ds, [0, 1]); // two INFO rows
    const level = subset[0];
    if (level.kind === 'categorical') {
      expect(level.top).toEqual([{ value: 'INFO', count: 2 }]);
    }
  });
});
