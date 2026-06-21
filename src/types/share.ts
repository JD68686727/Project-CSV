import type { ChartConfig } from './chart';
import type { ColumnFilter } from './filter';
import type { ColumnViewItem } from './table';

export interface ViewSort {
  columnKey: string;
  direction: 'asc' | 'desc';
}

/**
 * The full analyze-view configuration that a shareable link carries. Like saved
 * views, this is configuration only — never row data. A recipient loads their
 * own file and gets your filters / search / sort / chart / columns applied.
 */
export interface ViewState {
  filters: ColumnFilter[];
  query: string;
  sort: ViewSort | null;
  chart: ChartConfig;
  columns: ColumnViewItem[];
}
