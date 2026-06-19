import { useCallback, useMemo, useState } from 'react';
import type { Dataset } from '@/types/dataset';
import type { ColumnFilter } from '@/types/filter';
import { applyFilters } from '@/lib/filter/applyFilters';
import { operatorsForType } from '@/lib/filter/operators';

let idCounter = 0;
const nextId = () => `filter-${++idCounter}`;

export interface UseFilters {
  filters: ColumnFilter[];
  addFilter: () => void;
  updateFilter: (id: string, patch: Partial<ColumnFilter>) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
  /** Row indices passing all filters (AND). Memoized. */
  filteredOrder: number[];
}

export function useFilters(dataset: Dataset | null): UseFilters {
  const [filters, setFilters] = useState<ColumnFilter[]>([]);

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

  const filteredOrder = useMemo(() => {
    if (!dataset) return [];
    return applyFilters(dataset, filters);
  }, [dataset, filters]);

  return {
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    clearFilters,
    filteredOrder,
  };
}
