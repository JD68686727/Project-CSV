import type { ColumnType, Dataset } from '@/types/dataset';
import { coerceValue } from '@/lib/csv/assembleDataset';

/** Re-coerces a cell to a new type, starting from its string representation. */
function recoerce(cell: Dataset['rows'][number][number], type: ColumnType) {
  return coerceValue(cell == null ? undefined : String(cell), type);
}

/**
 * Returns a new Dataset with one column's inferred type overridden and that
 * column's cells re-coerced (from their string form, so a string column of
 * numbers becomes real numbers, etc.). A no-op for an unknown column or the
 * same type. Only the changed column is recomputed; column keys are unchanged.
 */
export function retypeColumn(
  dataset: Dataset,
  columnKey: string,
  newType: ColumnType,
): Dataset {
  const idx = dataset.columnIndex[columnKey];
  if (idx == null || dataset.columns[idx].type === newType) return dataset;

  const columns = dataset.columns.map((c, i) =>
    i === idx ? { ...c, type: newType } : c,
  );
  const rows = dataset.rows.map((row) => {
    const next = row.slice();
    next[idx] = recoerce(row[idx], newType);
    return next;
  });
  return { ...dataset, columns, rows };
}

/**
 * Applies several type overrides (column key → type) in a single pass — used to
 * re-apply remembered overrides when a file with the same structure is loaded.
 */
export function applyTypeOverrides(
  dataset: Dataset,
  overrides: Record<string, ColumnType>,
): Dataset {
  const changes = Object.entries(overrides)
    .map(([key, type]) => [dataset.columnIndex[key], type] as const)
    .filter(([idx, type]) => idx != null && dataset.columns[idx].type !== type);
  if (changes.length === 0) return dataset;

  const columns = dataset.columns.map((c) =>
    overrides[c.key] && overrides[c.key] !== c.type
      ? { ...c, type: overrides[c.key] }
      : c,
  );
  const rows = dataset.rows.map((row) => {
    const next = row.slice();
    for (const [idx, type] of changes) next[idx] = recoerce(next[idx], type);
    return next;
  });
  return { ...dataset, columns, rows };
}
