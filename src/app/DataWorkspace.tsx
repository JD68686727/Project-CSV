import { lazy, Suspense } from 'react';
import type { Dataset } from '@/types/dataset';
import { useFilters } from '@/features/filtering/hooks/useFilters';
import { FilterBar } from '@/features/filtering/components/FilterBar';
import { useSortedRows } from '@/features/table/hooks/useSortedRows';
import { DataTable } from '@/features/table/components/DataTable';
import { ExportButton } from '@/features/export/components/ExportButton';

// Recharts is heavy (~d3 deps); load the chart panel only once a file is open
// so the initial drop-zone bundle stays lean.
const ChartPanel = lazy(() =>
  import('@/features/visualization/components/ChartPanel').then((m) => ({
    default: m.ChartPanel,
  })),
);

export interface DataWorkspaceProps {
  dataset: Dataset;
}

/**
 * Orchestrates the data view: filtering feeds its surviving row indices into
 * sorting, whose final order drives the virtualized table. The chart aggregates
 * the *filtered* indices (sorting is irrelevant to aggregation, so this avoids
 * recomputing charts on every sort). Every stage works on index arrays, so a
 * 50k-row dataset is never copied. Mounted with a `key` tied to the dataset in
 * App, so a new file gets fresh filter/sort/chart state for free.
 */
export function DataWorkspace({ dataset }: DataWorkspaceProps) {
  const { filters, addFilter, updateFilter, removeFilter, clearFilters, filteredOrder } =
    useFilters(dataset);
  const { order, sort, toggleSort } = useSortedRows(dataset, filteredOrder);

  return (
    <div className="space-y-3">
      <FilterBar
        dataset={dataset}
        filters={filters}
        onAdd={addFilter}
        onUpdate={updateFilter}
        onRemove={removeFilter}
        onClear={clearFilters}
        resultCount={filteredOrder.length}
        totalCount={dataset.rows.length}
      />

      <div className="flex items-center justify-end">
        <ExportButton dataset={dataset} order={order} />
      </div>

      <DataTable
        dataset={dataset}
        order={order}
        sort={sort}
        onToggleSort={toggleSort}
      />

      <Suspense
        fallback={
          <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
        }
      >
        <ChartPanel dataset={dataset} order={filteredOrder} />
      </Suspense>
    </div>
  );
}
