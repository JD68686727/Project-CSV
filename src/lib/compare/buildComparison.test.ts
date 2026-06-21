import { describe, it, expect } from 'vitest';
import type { CompareConfig } from '@/types/compare';
import { buildComparison } from './buildComparison';
import { makeDataset } from '@/test/factory';

const fileA = makeDataset(
  [
    { name: 'level', type: 'string' },
    { name: 'latency', type: 'number' },
  ],
  [
    ['INFO', 10],
    ['INFO', 20],
    ['ERROR', 100],
  ],
);
const fileB = makeDataset(
  [
    { name: 'level', type: 'string' },
    { name: 'latency', type: 'number' },
  ],
  [
    ['INFO', 5],
    ['WARN', 50], // category present only in B
  ],
);

const cfg = (over: Partial<CompareConfig>): CompareConfig => ({
  type: 'bar',
  dimensionKey: 'level',
  measureKey: null,
  aggregation: 'count',
  bucket: 'none',
  fileIds: [],
  ...over,
});

describe('buildComparison', () => {
  it('aligns each file as a series keyed by category', () => {
    const res = buildComparison(
      [
        { label: 'A', dataset: fileA },
        { label: 'B', dataset: fileB },
      ],
      cfg({ aggregation: 'count' }),
    );
    expect(res.seriesLabels).toEqual(['A', 'B']);
    const byName = Object.fromEntries(res.data.map((r) => [r.name, r]));
    expect(byName.INFO).toEqual({ name: 'INFO', A: 2, B: 1 });
    expect(byName.ERROR).toEqual({ name: 'ERROR', A: 1, B: 0 });
  });

  it('fills 0 for categories absent in a file (union of categories)', () => {
    const res = buildComparison(
      [
        { label: 'A', dataset: fileA },
        { label: 'B', dataset: fileB },
      ],
      cfg({ aggregation: 'count' }),
    );
    const warn = res.data.find((r) => r.name === 'WARN')!;
    expect(warn).toEqual({ name: 'WARN', A: 0, B: 1 }); // A has no WARN → 0; B counts 1
  });

  it('orders bar categories by cross-file total descending', () => {
    const res = buildComparison(
      [
        { label: 'A', dataset: fileA },
        { label: 'B', dataset: fileB },
      ],
      cfg({ type: 'bar', aggregation: 'count' }),
    );
    // totals: INFO=3, ERROR=1, WARN=1 → INFO first
    expect(res.data[0].name).toBe('INFO');
    expect(res.groupCount).toBe(3);
  });

  it('aggregates a shared numeric measure per file', () => {
    const res = buildComparison(
      [
        { label: 'A', dataset: fileA },
        { label: 'B', dataset: fileB },
      ],
      cfg({ aggregation: 'avg', measureKey: 'latency' }),
    );
    const info = res.data.find((r) => r.name === 'INFO')!;
    expect(info.A).toBe(15); // (10+20)/2
    expect(info.B).toBe(5);
  });
});
