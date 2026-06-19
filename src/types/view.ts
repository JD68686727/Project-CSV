import type { ChartConfig } from './chart';
import type { ColumnFilter } from './filter';

/**
 * A persisted "view" — a named snapshot of the filter + chart configuration.
 * Deliberately stores only configuration, never row data: the local-first model
 * keeps users' data in memory only, never on disk.
 */
export interface SavedView {
  id: string;
  name: string;
  /** Schema fingerprint (column keys + types) this view applies to. */
  datasetSignature: string;
  filters: ColumnFilter[];
  chart: ChartConfig;
  createdAt: number;
}
