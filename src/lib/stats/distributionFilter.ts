import type { ColumnType } from '@/types/dataset';
import type { ColumnFilter } from '@/types/filter';
import type { ColumnDistribution } from '@/types/stats';

/** A filter ready to hand to the filter store, which assigns the id. */
export type NewFilter = Omit<ColumnFilter, 'id'>;

type NumericDistribution = Extract<ColumnDistribution, { kind: 'numeric' }>;

/**
 * Inclusive value bounds of histogram bin `index`. Bins are evenly spaced over
 * [min, max]; the final bin is closed at `max` (mirrors the binning in
 * computeColumnDistributions, where the max value falls in the last bin).
 */
export function binBounds(
  dist: NumericDistribution,
  index: number,
): { lo: number; hi: number } {
  const width = (dist.max - dist.min) / dist.bins.length;
  const lo = dist.min + index * width;
  const hi =
    index === dist.bins.length - 1 ? dist.max : dist.min + (index + 1) * width;
  return { lo, hi };
}

/**
 * A `between` filter selecting the value range of histogram bin `index`. The
 * range is inclusive on both ends, so a value sitting exactly on an interior bin
 * boundary can match two adjacent bins — acceptable for a histogram drill-down.
 */
export function numericBinFilter(
  columnKey: string,
  dist: NumericDistribution,
  index: number,
): NewFilter {
  const { lo, hi } = binBounds(dist, index);
  return { columnKey, operator: 'between', value: String(lo), value2: String(hi) };
}

/**
 * An equality filter selecting a single categorical value. Booleans have no
 * `equals` operator, so they map to the unary is-true / is-false operators.
 */
export function categoricalFilter(
  columnKey: string,
  type: ColumnType,
  value: string,
): NewFilter {
  if (type === 'boolean') {
    return {
      columnKey,
      operator: value === 'true' ? 'isTrue' : 'isFalse',
      value: '',
    };
  }
  return { columnKey, operator: 'equals', value };
}
