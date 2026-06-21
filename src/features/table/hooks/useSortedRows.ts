import { useCallback, useMemo, useState } from 'react';
import type { CellValue, Dataset } from '@/types/dataset';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  columnKey: string;
  direction: SortDirection;
}

export interface UseSortedRows {
  /** Row indices into `dataset.rows`, in current display order. */
  order: number[];
  sort: SortState | null;
  /** Cycles a column through asc → desc → unsorted. */
  toggleSort: (columnKey: string) => void;
  /** Sets the sort outright (e.g. restoring a shared/saved view). */
  setSort: (sort: SortState | null) => void;
}

/** Comparator for two non-null cells of the same logical column. */
function compareNonNull(a: CellValue, b: CellValue): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }
  // Strings & dates: ISO dates sort correctly lexically; `numeric` handles
  // embedded numbers in strings (e.g. "item2" < "item10").
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

/**
 * Sorts a *base* index array (typically the filtered order) without touching
 * row data. When no sort is active it returns the base array untouched; when
 * active it sorts a copy so the caller's filtered array stays intact. Nulls
 * always sort last regardless of direction.
 */
export function useSortedRows(
  dataset: Dataset | null,
  baseOrder: number[],
): UseSortedRows {
  const [sort, setSort] = useState<SortState | null>(null);

  const toggleSort = useCallback((columnKey: string) => {
    setSort((prev) => {
      if (!prev || prev.columnKey !== columnKey) {
        return { columnKey, direction: 'asc' };
      }
      if (prev.direction === 'asc') return { columnKey, direction: 'desc' };
      return null; // third click clears the sort
    });
  }, []);

  const order = useMemo(() => {
    if (!dataset || !sort) return baseOrder;

    const colIdx = dataset.columnIndex[sort.columnKey];
    if (colIdx == null) return baseOrder;

    const dir = sort.direction === 'asc' ? 1 : -1;
    const { rows } = dataset;

    return [...baseOrder].sort((ia, ib) => {
      const va = rows[ia][colIdx];
      const vb = rows[ib][colIdx];
      if (va == null && vb == null) return 0;
      if (va == null) return 1; // nulls last
      if (vb == null) return -1;
      return compareNonNull(va, vb) * dir;
    });
  }, [dataset, baseOrder, sort]);

  return { order, sort, toggleSort, setSort };
}
