import { useCallback, useMemo, useState } from 'react';
import type { Dataset } from '@/types/dataset';
import type { SortKey } from '@/types/table';
import { applyMultiSort, toggleSortKey } from '@/lib/table/multiSort';

export interface UseSortedRows {
  /** Row indices into `dataset.rows`, in current display order. */
  order: number[];
  /** Active sort keys, primary first. */
  sortKeys: SortKey[];
  /** Toggle a column's sort. `additive` (Shift-click) keeps the other keys. */
  toggleSort: (columnKey: string, additive: boolean) => void;
  /** Replace the sort outright (e.g. restoring a shared view). */
  setSort: (keys: SortKey[]) => void;
}

/**
 * Sorts a *base* index array (typically the filtered order) by multiple columns
 * without touching row data — see `lib/table/multiSort`. No keys → the base
 * array is returned untouched.
 */
export function useSortedRows(
  dataset: Dataset | null,
  baseOrder: number[],
): UseSortedRows {
  const [sortKeys, setSortKeys] = useState<SortKey[]>([]);

  const toggleSort = useCallback((columnKey: string, additive: boolean) => {
    setSortKeys((prev) => toggleSortKey(prev, columnKey, additive));
  }, []);

  const order = useMemo(() => {
    if (!dataset) return baseOrder;
    return applyMultiSort(dataset, baseOrder, sortKeys);
  }, [dataset, baseOrder, sortKeys]);

  return { order, sortKeys, toggleSort, setSort: setSortKeys };
}
