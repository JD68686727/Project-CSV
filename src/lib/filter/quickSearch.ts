import type { Dataset } from '@/types/dataset';

/**
 * Free-text "grep across all columns" stage. Narrows an index array to rows
 * where any cell contains the query (case-insensitive substring). Runs after
 * the structured column filters, so it only scans the survivors. An empty query
 * is a no-op (returns the input order unchanged).
 */
export function applyQuickSearch(
  dataset: Dataset,
  order: number[],
  query: string,
): number[] {
  const q = query.trim().toLowerCase();
  if (q === '') return order;

  const { rows, columns } = dataset;
  const colCount = columns.length;

  return order.filter((rowIdx) => {
    const row = rows[rowIdx];
    for (let c = 0; c < colCount; c++) {
      const v = row[c];
      if (v != null && String(v).toLowerCase().includes(q)) return true;
    }
    return false;
  });
}
