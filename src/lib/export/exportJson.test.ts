import { describe, it, expect } from 'vitest';
import { datasetToJson } from './exportJson';
import { makeDataset, allRows } from '@/test/factory';

const ds = makeDataset(
  [
    { name: 'level', key: 'level', type: 'string' },
    { name: 'code', key: 'code', type: 'number' },
  ],
  [
    ['INFO', 200],
    ['ERROR', null],
  ],
);

describe('datasetToJson', () => {
  it('serializes rows as objects keyed by column name, null preserved', () => {
    expect(JSON.parse(datasetToJson(ds, allRows(ds)))).toEqual([
      { level: 'INFO', code: 200 },
      { level: 'ERROR', code: null },
    ]);
  });

  it('respects the row order and a column subset', () => {
    expect(JSON.parse(datasetToJson(ds, [1], [ds.columns[0]]))).toEqual([
      { level: 'ERROR' },
    ]);
  });
});
