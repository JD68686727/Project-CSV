import { describe, it, expect } from 'vitest';
import { commonColumns, commonNumericColumns } from './commonColumns';
import { makeDataset } from '@/test/factory';

const a = makeDataset(
  [
    { name: 'ts', type: 'date' },
    { name: 'level', type: 'string' },
    { name: 'code', type: 'number' },
  ],
  [],
);
const b = makeDataset(
  [
    { name: 'ts', type: 'date' },
    { name: 'code', type: 'number' },
    { name: 'extra', type: 'string' },
  ],
  [],
);

describe('commonColumns', () => {
  it('keeps only keys present in every dataset', () => {
    expect(commonColumns([a, b]).map((c) => c.key)).toEqual(['ts', 'code']);
  });

  it('returns all columns for a single dataset', () => {
    expect(commonColumns([a]).map((c) => c.key)).toEqual(['ts', 'level', 'code']);
  });

  it('returns empty for no datasets', () => {
    expect(commonColumns([])).toEqual([]);
  });
});

describe('commonNumericColumns', () => {
  it('keeps columns numeric in every dataset', () => {
    expect(commonNumericColumns([a, b]).map((c) => c.key)).toEqual(['code']);
  });

  it('excludes a column that is non-numeric in another dataset', () => {
    const c = makeDataset([{ name: 'code', type: 'string' }], []);
    expect(commonNumericColumns([a, c])).toEqual([]);
  });
});
