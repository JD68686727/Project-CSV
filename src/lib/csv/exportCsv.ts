import Papa from 'papaparse';
import type { CellValue, Dataset } from '@/types/dataset';

/** Papa.unparse stringifies primitives and renders null/'' as empty fields. */
function cellToField(cell: CellValue): string | number | boolean {
  return cell == null ? '' : cell;
}

/**
 * Serializes the rows referenced by `order` (the current filtered + sorted
 * display order) back to a CSV string, using the original column names as the
 * header. PapaParse handles quoting/escaping. Operates through the index array,
 * so only the exported view is materialized.
 */
export function datasetToCsv(dataset: Dataset, order: number[]): string {
  const fields = dataset.columns.map((c) => c.name);
  const data = order.map((rowIdx) => {
    const row = dataset.rows[rowIdx];
    return dataset.columns.map((_, c) => cellToField(row[c]));
  });
  return Papa.unparse({ fields, data });
}
