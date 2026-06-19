export type ChartType = 'bar' | 'line' | 'pie';

export type Aggregation = 'count' | 'sum' | 'avg' | 'min' | 'max';

/** Time granularity for bucketing a date dimension; ignored for non-date dims. */
export type DateBucket = 'none' | 'hour' | 'day' | 'week' | 'month';

export interface ChartConfig {
  type: ChartType;
  /** Column whose values define the categories / x-axis (group-by). */
  dimensionKey: string;
  /** Numeric column to aggregate; null when aggregation is `count`. */
  measureKey: string | null;
  aggregation: Aggregation;
  /** Bucket granularity applied when the dimension is a date column. */
  bucket: DateBucket;
}

export interface ChartDatum {
  /** Category label (the dimension value as a string). */
  name: string;
  /** Aggregated value plotted on the chart. */
  value: number;
  /** Number of source rows in this group (for context/tooltips). */
  count: number;
}

export interface ChartResult {
  /** Ordered, capped data ready to hand to Recharts. */
  data: ChartDatum[];
  /** Total distinct groups before capping (for "top N of M" notes). */
  groupCount: number;
}
