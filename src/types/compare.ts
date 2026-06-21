import type { Aggregation, DateBucket } from './chart';

export type CompareChartType = 'bar' | 'line';

export interface CompareConfig {
  type: CompareChartType;
  /** Shared group-by column (must exist in every included file). */
  dimensionKey: string;
  /** Shared numeric measure; null when aggregation is `count`. */
  measureKey: string | null;
  aggregation: Aggregation;
  bucket: DateBucket;
  /** Ids of the files included in the comparison. */
  fileIds: string[];
}

/**
 * One category row of the overlay. `name` is the category; every other key is a
 * file's series label mapping to that file's aggregated value for the category.
 */
export interface CompareSeriesRow {
  name: string;
  [seriesLabel: string]: string | number;
}

export interface CompareResult {
  data: CompareSeriesRow[];
  /** Series labels (one per included file), in render order. */
  seriesLabels: string[];
  /** Distinct categories before capping (for a "top N of M" note). */
  groupCount: number;
}
