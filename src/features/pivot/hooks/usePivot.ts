import { useCallback, useMemo, useState } from 'react';
import type { ColumnSchema, Dataset } from '@/types/dataset';
import type { PivotAggregation, PivotConfig, PivotResult } from '@/types/pivot';
import { computePivot } from '@/lib/pivot/computePivot';

function defaultConfig(dataset: Dataset): PivotConfig {
  const cols = dataset.columns;
  return {
    rowKey: cols[0]?.key ?? null,
    colKey: (cols[1] ?? cols[0])?.key ?? null,
    aggregation: 'count',
    measureKey: null,
  };
}

export interface UsePivot {
  config: PivotConfig;
  /** Columns eligible to be a measure (numeric only). */
  numericColumns: ColumnSchema[];
  /** Null until both dimensions are chosen, or while `enabled` is false. */
  result: PivotResult | null;
  setRow: (key: string) => void;
  setCol: (key: string) => void;
  setAggregation: (agg: PivotAggregation) => void;
  setMeasure: (key: string) => void;
}

/**
 * Owns pivot-table config and derives the cross-tab. The heavy `computePivot`
 * pass is gated on `enabled` so a collapsed panel costs nothing.
 */
export function usePivot(
  dataset: Dataset,
  order: number[],
  enabled: boolean,
): UsePivot {
  const numericColumns = useMemo(
    () => dataset.columns.filter((c) => c.type === 'number'),
    [dataset],
  );

  const [config, setConfig] = useState<PivotConfig>(() => defaultConfig(dataset));

  const setRow = useCallback(
    (rowKey: string) => setConfig((p) => ({ ...p, rowKey })),
    [],
  );
  const setCol = useCallback(
    (colKey: string) => setConfig((p) => ({ ...p, colKey })),
    [],
  );
  const setMeasure = useCallback(
    (measureKey: string) => setConfig((p) => ({ ...p, measureKey })),
    [],
  );
  const setAggregation = useCallback(
    (aggregation: PivotAggregation) =>
      setConfig((p) => {
        // count needs no measure; sum/avg need a numeric one — auto-pick if unset.
        if (aggregation === 'count') return { ...p, aggregation };
        const measureKey = p.measureKey ?? numericColumns[0]?.key ?? null;
        return { ...p, aggregation, measureKey };
      }),
    [numericColumns],
  );

  const result = useMemo(
    () => (enabled ? computePivot(dataset, order, config) : null),
    [enabled, dataset, order, config],
  );

  return { config, numericColumns, result, setRow, setCol, setAggregation, setMeasure };
}
