import { useCallback, useMemo, useState } from 'react';
import type { ColumnSchema } from '@/types/dataset';
import type { Aggregation, DateBucket } from '@/types/chart';
import type { CompareChartType, CompareResult } from '@/types/compare';
import type { LoadedFile } from '@/types/workspace';
import { commonColumns, commonNumericColumns } from '@/lib/compare/commonColumns';
import { buildComparison } from '@/lib/compare/buildComparison';
import { seriesColor } from '@/utils/chartColors';

interface ConfigState {
  type: CompareChartType;
  dimensionKey: string;
  measureKey: string | null;
  aggregation: Aggregation;
  bucket: DateBucket;
}

export interface CompareFileItem {
  id: string;
  label: string;
  rows: number;
  included: boolean;
  /** Series colour when included; undefined when excluded. */
  color?: string;
}

export interface UseCompareConfig {
  files: CompareFileItem[];
  toggleFile: (id: string) => void;
  commonCols: ColumnSchema[];
  commonNumeric: ColumnSchema[];
  config: ConfigState;
  dimensionIsDate: boolean;
  includedCount: number;
  setType: (type: CompareChartType) => void;
  setDimension: (key: string) => void;
  setMeasure: (key: string) => void;
  setAggregation: (agg: Aggregation) => void;
  setBucket: (bucket: DateBucket) => void;
  result: CompareResult;
}

/** Unique, stable display labels (file name; de-duplicated by suffix). */
function buildLabels(files: LoadedFile[]): Map<string, string> {
  const seen = new Map<string, number>();
  const out = new Map<string, string>();
  for (const f of files) {
    const base = f.dataset.meta.fileName;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    out.set(f.id, n === 1 ? base : `${base} (${n})`);
  }
  return out;
}

export function useCompareConfig(files: LoadedFile[]): UseCompareConfig {
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set());
  const [cfg, setCfg] = useState<ConfigState>({
    type: 'bar',
    dimensionKey: '',
    measureKey: null,
    aggregation: 'count',
    bucket: 'none',
  });

  const labels = useMemo(() => buildLabels(files), [files]);
  const included = useMemo(
    () => files.filter((f) => !excluded.has(f.id)),
    [files, excluded],
  );

  const commonCols = useMemo(
    () => commonColumns(included.map((f) => f.dataset)),
    [included],
  );
  const commonNumeric = useMemo(
    () => commonNumericColumns(included.map((f) => f.dataset)),
    [included],
  );

  // Resolve effective keys so stale selections (after toggling files) never
  // point at a column that isn't shared by the current selection.
  const dimensionKey = commonCols.some((c) => c.key === cfg.dimensionKey)
    ? cfg.dimensionKey
    : (commonCols[0]?.key ?? '');
  const dimensionIsDate =
    commonCols.find((c) => c.key === dimensionKey)?.type === 'date';
  const measureKey =
    cfg.aggregation === 'count'
      ? null
      : commonNumeric.some((c) => c.key === cfg.measureKey)
        ? cfg.measureKey
        : (commonNumeric[0]?.key ?? null);

  const effectiveConfig: ConfigState = {
    type: cfg.type,
    dimensionKey,
    measureKey,
    aggregation: cfg.aggregation,
    bucket: cfg.bucket,
  };

  const colorById = new Map<string, string>();
  included.forEach((f, i) => colorById.set(f.id, seriesColor(i)));

  const fileItems: CompareFileItem[] = files.map((f) => ({
    id: f.id,
    label: labels.get(f.id) ?? f.dataset.meta.fileName,
    rows: f.dataset.rows.length,
    included: !excluded.has(f.id),
    color: colorById.get(f.id),
  }));

  const result = useMemo<CompareResult>(() => {
    if (included.length === 0 || dimensionKey === '') {
      return { data: [], seriesLabels: [], groupCount: 0 };
    }
    return buildComparison(
      included.map((f) => ({
        label: labels.get(f.id) ?? f.dataset.meta.fileName,
        dataset: f.dataset,
      })),
      { ...effectiveConfig, fileIds: included.map((f) => f.id) },
    );
    // effectiveConfig is derived from cfg + included; listing its parts keeps
    // the memo honest without re-running on unrelated renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    included,
    labels,
    dimensionKey,
    measureKey,
    cfg.type,
    cfg.aggregation,
    cfg.bucket,
  ]);

  const toggleFile = useCallback((id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setType = useCallback(
    (type: CompareChartType) => setCfg((p) => ({ ...p, type })),
    [],
  );
  const setDimension = useCallback(
    (key: string) => setCfg((p) => ({ ...p, dimensionKey: key })),
    [],
  );
  const setMeasure = useCallback(
    (key: string) => setCfg((p) => ({ ...p, measureKey: key })),
    [],
  );
  const setAggregation = useCallback(
    (aggregation: Aggregation) => setCfg((p) => ({ ...p, aggregation })),
    [],
  );
  const setBucket = useCallback(
    (bucket: DateBucket) => setCfg((p) => ({ ...p, bucket })),
    [],
  );

  return {
    files: fileItems,
    toggleFile,
    commonCols,
    commonNumeric,
    config: effectiveConfig,
    dimensionIsDate,
    includedCount: included.length,
    setType,
    setDimension,
    setMeasure,
    setAggregation,
    setBucket,
    result,
  };
}
