import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { datasetToXlsxBlob } from './exportXlsx';
import { makeDataset, allRows } from '@/test/factory';

const ds = makeDataset(
  [
    { name: 'level', key: 'level', type: 'string' },
    { name: 'code', key: 'code', type: 'number' },
  ],
  [
    ['INFO', 200],
    ['ERROR', 500],
  ],
);

describe('datasetToXlsxBlob', () => {
  it('produces a readable .xlsx workbook with header + rows', async () => {
    const blob = await datasetToXlsxBlob(ds, allRows(ds));
    expect(blob.type).toContain('spreadsheetml');

    const wb = XLSX.read(await blob.arrayBuffer(), { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    expect(XLSX.utils.sheet_to_json(ws)).toEqual([
      { level: 'INFO', code: 200 },
      { level: 'ERROR', code: 500 },
    ]);
  });

  it('mirrors a column subset and order', async () => {
    const blob = await datasetToXlsxBlob(ds, [1], [ds.columns[0]]);
    const wb = XLSX.read(await blob.arrayBuffer(), { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    expect(XLSX.utils.sheet_to_json(ws)).toEqual([{ level: 'ERROR' }]);
  });
});
