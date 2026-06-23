/** One column's display state: which column, and whether it's shown. Order in
 *  the containing array is the display order. */
export interface ColumnViewItem {
  key: string;
  visible: boolean;
}

export type SortDirection = 'asc' | 'desc';

/** One level of a multi-column sort. Position in the array is its priority
 *  (index 0 = primary, 1 = secondary, …). */
export interface SortKey {
  columnKey: string;
  direction: SortDirection;
}
