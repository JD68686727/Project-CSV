import Papa from 'papaparse';
import type { CellValue, ColumnSchema, Dataset } from '@/types/dataset';

/** Papa.unparse stringifies primitives and renders null/'' as empty fields. */
function cellToField(cell: CellValue): string | number | boolean {
  return cell == null ? '' : cell;
}

/**
 * Serializes the rows referenced by `order` (the current filtered + sorted
 * display order) to CSV. `columns` controls which columns and in what order
 * (defaults to all) — so the export mirrors the visible table. PapaParse handles
 * quoting/escaping; operating through the index array means only the exported
 * view is materialized.
 */
export function datasetToCsv(
  dataset: Dataset,
  order: number[],
  columns: ColumnSchema[] = dataset.columns,
): string {
  const fields = columns.map((c) => c.name);
  const data = order.map((rowIdx) => {
    const row = dataset.rows[rowIdx];
    return columns.map((c) => cellToField(row[dataset.columnIndex[c.key]]));
  });
  return Papa.unparse({ fields, data });
}
