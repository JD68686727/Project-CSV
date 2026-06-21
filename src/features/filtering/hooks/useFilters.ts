import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import type { Dataset } from '@/types/dataset';
import type { ColumnFilter } from '@/types/filter';
import { applyFilters } from '@/lib/filter/applyFilters';
import { applyQuickSearch } from '@/lib/filter/quickSearch';
import { operatorsForType } from '@/lib/filter/operators';

let idCounter = 0;
const nextId = () => `filter-${++idCounter}`;

export interface UseFilters {
  filters: ColumnFilter[];
  addFilter: () => void;
  updateFilter: (id: string, patch: Partial<ColumnFilter>) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
  /** Replaces all filters (e.g. applying a saved preset), with fresh ids. */
  replaceFilters: (filters: ColumnFilter[]) => void;
  /** Free-text "search across all columns" query (immediate, for the input). */
  query: string;
  setQuery: (query: string) => void;
  /** Row indices passing all structured filters AND the search. Memoized. */
  filteredOrder: number[];
}

export function useFilters(dataset: Dataset | null): UseFilters {
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [query, setQuery] = useState('');
  // Keep typing responsive on large files: the heavy re-filter uses a deferred
  // copy of the query so React can prioritise the input over recomputation.
  const deferredQuery = useDeferredValue(query);

  const addFilter = useCallback(() => {
    if (!dataset || dataset.columns.length === 0) return;
    const col = dataset.columns[0];
    const op = operatorsForType(col.type)[0]?.value ?? 'isNotEmpty';
    setFilters((prev) => [
      ...prev,
      { id: nextId(), columnKey: col.key, operator: op, value: '' },
    ]);
  }, [dataset]);

  const updateFilter = useCallback((id: string, patch: Partial<ColumnFilter>) => {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const removeFilter = useCallback((id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFilters = useCallback(() => setFilters([]), []);

  const replaceFilters = useCallback((next: ColumnFilter[]) => {
    // Reassign ids so restored presets can't collide with live filter keys.
    setFilters(next.map((f) => ({ ...f, id: nextId() })));
  }, []);

  const filteredOrder = useMemo(() => {
    if (!dataset) return [];
    // Structured filters first (cheap predicates), then the cross-column search
    // on the survivors only.
    const structured = applyFilters(dataset, filters);
    return applyQuickSearch(dataset, structured, deferredQuery);
  }, [dataset, filters, deferredQuery]);

  return {
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    clearFilters,
    replaceFilters,
    query,
    setQuery,
    filteredOrder,
  };
}
