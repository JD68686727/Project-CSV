import type { Dataset } from '@/types/dataset';
import type { ColumnFilter } from '@/types/filter';
import { FilterRow } from './FilterRow';

export interface FilterBarProps {
  dataset: Dataset;
  filters: ColumnFilter[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ColumnFilter>) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
}

export function FilterBar({
  dataset,
  filters,
  onAdd,
  onUpdate,
  onRemove,
  onClear,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const isFiltered = resultCount !== totalCount;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-700">Filters</span>
          <span
            className={
              isFiltered
                ? 'rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700'
                : 'text-xs text-slate-400'
            }
          >
            {resultCount.toLocaleString()} of {totalCount.toLocaleString()} rows
          </span>
        </div>

        <div className="flex items-center gap-2">
          {filters.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Add filter
          </button>
        </div>
      </div>

      {filters.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {filters.map((filter) => (
            <FilterRow
              key={filter.id}
              dataset={dataset}
              filter={filter}
              onChange={(patch) => onUpdate(filter.id, patch)}
              onRemove={() => onRemove(filter.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
