import { describe, it, expect } from 'vitest';
import { datasetToCsv } from './exportCsv';
import { makeDataset } from '@/test/factory';

const ds = makeDataset(
  [
    { name: 'level', type: 'string' },
    { name: 'code', type: 'number' },
    { name: 'note', type: 'string' },
  ],
  [
    ['INFO', 200, 'plain'],
    ['WARN', 404, 'has, comma'],
    ['ERROR', null, 'with "quote"'],
  ],
);

describe('datasetToCsv', () => {
  it('writes the header from column names', () => {
    const lines = datasetToCsv(ds, [0]).split(/\r?\n/);
    expect(lines[0]).toBe('level,code,note');
  });

  it('emits raw values, with null as an empty field', () => {
    const lines = datasetToCsv(ds, [2]).split(/\r?\n/);
    expect(lines[1]).toBe('ERROR,,"with ""quote"""');
  });

  it('quotes fields containing the delimiter', () => {
    const lines = datasetToCsv(ds, [1]).split(/\r?\n/);
    expect(lines[1]).toBe('WARN,404,"has, comma"');
  });

  it('exports only the rows in the given order, in that order', () => {
    const lines = datasetToCsv(ds, [2, 0]).split(/\r?\n/);
    expect(lines).toHaveLength(3); // header + 2 rows
    expect(lines[1].startsWith('ERROR')).toBe(true);
    expect(lines[2].startsWith('INFO')).toBe(true);
  });
});
