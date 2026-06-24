import { describe, it, expect } from 'vitest';
import type { ColumnDistribution } from '@/types/stats';
import {
  binBounds,
  numericBinFilter,
  categoricalFilter,
} from './distributionFilter';

const numeric: Extract<ColumnDistribution, { kind: 'numeric' }> = {
  kind: 'numeric',
  bins: new Array(12).fill(0),
  min: 0,
  max: 120, // width = 10 per bin
};

describe('binBounds', () => {
  it('spaces bins evenly from min', () => {
    expect(binBounds(numeric, 0)).toEqual({ lo: 0, hi: 10 });
    expect(binBounds(numeric, 5)).toEqual({ lo: 50, hi: 60 });
  });

  it('closes the last bin at max', () => {
    expect(binBounds(numeric, 11)).toEqual({ lo: 110, hi: 120 });
  });
});

describe('numericBinFilter', () => {
  it('builds an inclusive between filter for the bin range', () => {
    expect(numericBinFilter('latency', numeric, 5)).toEqual({
      columnKey: 'latency',
      operator: 'between',
      value: '50',
      value2: '60',
    });
  });
});

describe('categoricalFilter', () => {
  it('uses equals for string/date columns', () => {
    expect(categoricalFilter('level', 'string', 'INFO')).toEqual({
      columnKey: 'level',
      operator: 'equals',
      value: 'INFO',
    });
  });

  it('maps booleans to the unary is-true / is-false operators', () => {
    expect(categoricalFilter('cached', 'boolean', 'true')).toEqual({
      columnKey: 'cached',
      operator: 'isTrue',
      value: '',
    });
    expect(categoricalFilter('cached', 'boolean', 'false')).toEqual({
      columnKey: 'cached',
      operator: 'isFalse',
      value: '',
    });
  });
});
