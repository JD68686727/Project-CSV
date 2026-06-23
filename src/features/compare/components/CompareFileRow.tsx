import type { ColumnFilter } from '@/types/filter';
import { cn } from '@/utils/cn';
import { FilterRow } from '@/features/filtering/components/FilterRow';
import type { CompareFileItem } from '../hooks/useCompareConfig';

export interface CompareFileRowProps {
  item: CompareFileItem;
  onToggle: (id: string) => void;
  onAddFilter: (fileId: string) => void;
  onUpdateFilter: (
    fileId: string,
    filterId: string,
    patch: Partial<ColumnFilter>,
  ) => void;
  onRemoveFilter: (fileId: string, filterId: string) => void;
}

/** One file in compare: include toggle + its own filter editor + filtered count. */
export function CompareFileRow({
  item,
  onToggle,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
}: CompareFileRowProps) {
  const isFiltered = item.filteredRows !== item.rows;

  return (
    <div
      data-testid="compare-file-row"
      className={cn(
        'rounded-lg border p-2',
        item.included
          ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
          : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40',
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          aria-pressed={item.included}
          className={cn(
            'inline-flex items-center gap-2 text-sm',
            item.included
              ? 'text-slate-700 dark:text-slate-200'
              : 'text-slate-400 dark:text-slate-500',
          )}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.included ? item.color : '#cbd5e1' }}
          />
          <span className="font-medium">{item.label}</span>
        </button>

        <span
          className={cn(
            'text-xs',
            isFiltered
              ? 'font-medium text-brand-700 dark:text-brand-300'
              : 'text-slate-400 dark:text-slate-500',
          )}
        >
          {item.filteredRows.toLocaleString()} of {item.rows.toLocaleString()} rows
        </span>

        <button
          type="button"
          onClick={() => onAddFilter(item.id)}
          className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
        >
          + Filter
        </button>
      </div>

      {item.filters.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5">
          {item.filters.map((filter) => (
            <FilterRow
              key={filter.id}
              dataset={item.dataset}
              filter={filter}
              onChange={(patch) => onUpdateFilter(item.id, filter.id, patch)}
              onRemove={() => onRemoveFilter(item.id, filter.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
