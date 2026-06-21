import { describe, it, expect } from 'vitest';
import { computeColumnStats } from './computeColumnStats';
import { makeDataset, allRows } from '@/test/factory';

const ds = makeDataset(
  [
    { name: 'level', type: 'string' },
    { name: 'latency', type: 'number' },
  ],
  [
    ['INFO', 10],
    ['INFO', 30],
    ['WARN', null],
    ['ERROR', 50],
    [null, 10],
  ],
);

describe('computeColumnStats', () => {
  const stats = computeColumnStats(ds, allRows(ds));
  const byKey = Object.fromEntries(stats.map((s) => [s.key, s]));

  it('counts non-null, null, and distinct values', () => {
    expect(byKey.level.count).toBe(4);
    expect(byKey.level.nullCount).toBe(1);
    expect(byKey.level.distinctCount).toBe(3); // INFO, WARN, ERROR
  });

  it('treats null and empty string as missing', () => {
    expect(byKey.latency.nullCount).toBe(1);
    expect(byKey.latency.count).toBe(4);
  });

  it('computes numeric min/max/mean only for numeric columns', () => {
    expect(byKey.latency.numeric).toEqual({
      min: 10,
      max: 50,
      mean: 25, // (10+30+50+10)/4
      sum: 100,
    });
    expect(byKey.level.numeric).toBeNull();
  });

  it('counts distinct numeric values correctly', () => {
    expect(byKey.latency.distinctCount).toBe(3); // 10, 30, 50
  });

  it('respects a filtered subset (only the given indices)', () => {
    const subset = computeColumnStats(ds, [0, 1]); // two INFO rows
    const level = subset.find((s) => s.key === 'level')!;
    expect(level.count).toBe(2);
    expect(level.distinctCount).toBe(1);
  });
});
