import type { CellValue, ColumnSchema, ColumnType, Dataset } from '@/types/dataset';

/** Builds a Dataset from a compact column spec + raw rows, for tests. */
export function makeDataset(
  columns: { name: string; key?: string; type: ColumnType }[],
  rows: CellValue[][],
  meta?: Partial<Dataset['meta']>,
): Dataset {
  const cols: ColumnSchema[] = columns.map((c) => ({
    name: c.name,
    key: c.key ?? c.name,
    type: c.type,
  }));
  const columnIndex: Record<string, number> = {};
  cols.forEach((c, i) => {
    columnIndex[c.key] = i;
  });
  return {
    columns: cols,
    rows,
    columnIndex,
    meta: {
      fileName: 'test.csv',
      fileSize: 0,
      rowCount: rows.length,
      delimiter: ',',
      truncated: false,
      ...meta,
    },
  };
}

/** Index array over every row — the "no filter" order. */
export function allRows(dataset: Dataset): number[] {
  return dataset.rows.map((_, i) => i);
}
