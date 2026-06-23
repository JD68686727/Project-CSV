import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ColumnSchema, Dataset } from '@/types/dataset';
import { cn } from '@/utils/cn';
import type { SortDirection, SortState } from '../hooks/useSortedRows';
import { formatCell } from '../utils/formatCell';

const ROW_HEIGHT = 36;
const COLUMN_WIDTH = 180;
const GUTTER_WIDTH = 64;

export interface DataTableProps {
  dataset: Dataset;
  /** Visible columns in display order (controls which/what-order to render). */
  columns: ColumnSchema[];
  /** Row indices into `dataset.rows`, in display order (filtered + sorted). */
  order: number[];
  sort: SortState | null;
  onToggleSort: (columnKey: string) => void;
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  return (
    <span className="ml-auto text-[10px] leading-none text-brand-600">
      {direction === 'asc' ? '▲' : direction === 'desc' ? '▼' : ''}
    </span>
  );
}

/**
 * Virtualized data grid for large datasets. Only the rows in the viewport are
 * mounted (via @tanstack/react-virtual), so a 50k+ row file renders a few dozen
 * DOM nodes. Header and body share one `gridTemplateColumns` so columns stay
 * aligned while the single scroll container handles both axes.
 */
export function DataTable({
  dataset,
  columns,
  order,
  sort,
  onToggleSort,
}: DataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: order.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const gridTemplate = `${GUTTER_WIDTH}px repeat(${columns.length}, ${COLUMN_WIDTH}px)`;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div ref={parentRef} className="relative max-h-[70vh] overflow-auto">
        {/* Header — sticky vertically, scrolls horizontally with the body. */}
        <div
          className="sticky top-0 z-10 grid border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          style={{ gridTemplateColumns: gridTemplate, width: 'max-content' }}
        >
          <div className="flex items-center justify-end px-3 py-2 text-slate-400 dark:text-slate-500">
            #
          </div>
          {columns.map((col) => {
            const active = sort?.columnKey === col.key;
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => onToggleSort(col.key)}
                title={`${col.name} · ${col.type}`}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700',
                  active && 'text-brand-700 dark:text-brand-300',
                )}
              >
                <span className="truncate">{col.name}</span>
                <SortIcon direction={active && sort ? sort.direction : null} />
              </button>
            );
          })}
        </div>

        {/* Body — absolutely positioned virtual rows inside a spacer. */}
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: 'max-content',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((vRow) => {
            const rowIdx = order[vRow.index];
            const row = dataset.rows[rowIdx];
            return (
              <div
                key={vRow.key}
                className="absolute left-0 top-0 grid border-b border-slate-100 text-sm hover:bg-brand-50/50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                style={{
                  gridTemplateColumns: gridTemplate,
                  height: ROW_HEIGHT,
                  width: 'max-content',
                  transform: `translateY(${vRow.start}px)`,
                }}
              >
                <div className="flex items-center justify-end px-3 font-mono text-xs text-slate-400 dark:text-slate-500">
                  {rowIdx + 1}
                </div>
                {columns.map((col) => {
                  const cell = formatCell(row[dataset.columnIndex[col.key]], col.type);
                  return (
                    <div
                      key={col.key}
                      className={cn(
                        'flex items-center overflow-hidden px-3',
                        cell.align === 'right'
                          ? 'justify-end font-mono tabular-nums'
                          : 'justify-start',
                        cell.muted && 'text-slate-300 dark:text-slate-600',
                      )}
                    >
                      <span className="truncate">{cell.text}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {order.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              No rows match
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Adjust or remove a filter to see results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
