import type { ColumnSchema, Dataset } from '@/types/dataset';

/** Columns whose key exists in every dataset; schema taken from the first. */
export function commonColumns(datasets: Dataset[]): ColumnSchema[] {
  if (datasets.length === 0) return [];
  const [first, ...rest] = datasets;
  return first.columns.filter((col) =>
    rest.every((d) => d.columnIndex[col.key] != null),
  );
}

/** Columns that are numeric in *every* dataset — eligible shared measures. */
export function commonNumericColumns(datasets: Dataset[]): ColumnSchema[] {
  if (datasets.length === 0) return [];
  const [first, ...rest] = datasets;
  return first.columns.filter(
    (col) =>
      col.type === 'number' &&
      rest.every((d) => {
        const idx = d.columnIndex[col.key];
        return idx != null && d.columns[idx].type === 'number';
      }),
  );
}
