import { describe, it, expect } from 'vitest';
import type { ChartConfig } from '@/types/chart';
import { aggregate, aggregateToMap } from './aggregate';
import { makeDataset, allRows } from '@/test/factory';

const ds = makeDataset(
  [
    { name: 'level', type: 'string' },
    { name: 'latency', type: 'number' },
    { name: 'ts', type: 'date' },
  ],
  [
    ['INFO', 10, '2026-06-19T08:15:00'],
    ['INFO', 30, '2026-06-19T08:45:00'],
    ['WARN', 50, '2026-06-19T09:30:00'],
    ['ERROR', 100, '2026-06-19T09:45:00'],
  ],
);

const cfg = (over: Partial<ChartConfig>): ChartConfig => ({
  type: 'bar',
  dimensionKey: 'level',
  measureKey: null,
  aggregation: 'count',
  bucket: 'none',
  ...over,
});

describe('aggregateToMap', () => {
  it('counts rows per category', () => {
    const m = aggregateToMap(ds, allRows(ds), cfg({ aggregation: 'count' }));
    expect(Object.fromEntries(m)).toEqual({ INFO: 2, WARN: 1, ERROR: 1 });
  });

  it('sums and averages a measure per category', () => {
    const sum = aggregateToMap(
      ds,
      allRows(ds),
      cfg({ aggregation: 'sum', measureKey: 'latency' }),
    );
    expect(sum.get('INFO')).toBe(40);
    const avg = aggregateToMap(
      ds,
      allRows(ds),
      cfg({ aggregation: 'avg', measureKey: 'latency' }),
    );
    expect(avg.get('INFO')).toBe(20);
  });

  it('buckets a date dimension when requested', () => {
    const m = aggregateToMap(
      ds,
      allRows(ds),
      cfg({ dimensionKey: 'ts', bucket: 'hour', aggregation: 'count' }),
    );
    expect(Object.fromEntries(m)).toEqual({
      '2026-06-19 08:00': 2,
      '2026-06-19 09:00': 2,
    });
  });

  it('ignores bucket on a non-date dimension', () => {
    const m = aggregateToMap(ds, allRows(ds), cfg({ bucket: 'day' }));
    expect(m.has('INFO')).toBe(true);
  });
});

describe('aggregate', () => {
  it('sorts bar data by value descending', () => {
    const { data } = aggregate(ds, allRows(ds), cfg({ type: 'bar' }));
    expect(data.map((d) => d.name)).toEqual(['INFO', 'WARN', 'ERROR']);
  });

  it('sorts line data by category name ascending', () => {
    const { data } = aggregate(
      ds,
      allRows(ds),
      cfg({ type: 'line', dimensionKey: 'ts', bucket: 'hour' }),
    );
    expect(data.map((d) => d.name)).toEqual(['2026-06-19 08:00', '2026-06-19 09:00']);
  });

  it('reports the distinct group count', () => {
    expect(aggregate(ds, allRows(ds), cfg({})).groupCount).toBe(3);
  });
});
