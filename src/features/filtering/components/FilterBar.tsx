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
  query: string;
  onQueryChange: (query: string) => void;
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
  query,
  onQueryChange,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const isFiltered = resultCount !== totalCount;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      {/* Global search — grep across all columns */}
      <div className="relative mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search all columns…"
          aria-label="Search all columns"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        {query !== '' && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

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
