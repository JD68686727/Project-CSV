/** Cross-tabulation (pivot) of two columns over the filtered rows. */

export type PivotAggregation = 'count' | 'sum' | 'avg';

export interface PivotConfig {
  /** Column whose values become the grid rows. */
  rowKey: string | null;
  /** Column whose values become the grid columns. */
  colKey: string | null;
  aggregation: PivotAggregation;
  /** Numeric column to aggregate; required (and only used) for sum / avg. */
  measureKey: string | null;
}

export interface PivotResult {
  /** Row header values; a trailing `(others)` bucket when capped. */
  rowValues: string[];
  /** Column header values; a trailing `(others)` bucket when capped. */
  colValues: string[];
  rowHasOthers: boolean;
  colHasOthers: boolean;
  /** Aggregated value per cell, indexed `[row][col]`. */
  cells: number[][];
  rowTotals: number[];
  colTotals: number[];
  grandTotal: number;
  /** Largest single cell value, used to scale the heatmap shading. */
  max: number;
}

/** Synthetic bucket label for values beyond the per-axis cap. Not filterable. */
export const OTHERS_BUCKET = '(others)';
