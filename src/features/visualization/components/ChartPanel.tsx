import type { Dataset } from '@/types/dataset';
import type { Aggregation, ChartType, DateBucket } from '@/types/chart';
import { cn } from '@/utils/cn';
import type { UseChartConfig } from '../hooks/useChartConfig';
import { ChartView } from './ChartView';

const selectCls =
  'rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'pie', label: 'Pie' },
];

const AGGREGATIONS: { value: Aggregation; label: string }[] = [
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
];

const BUCKETS: { value: DateBucket; label: string }[] = [
  { value: 'none', label: 'No bucket' },
  { value: 'hour', label: 'By hour' },
  { value: 'day', label: 'By day' },
  { value: 'week', label: 'By week' },
  { value: 'month', label: 'By month' },
];

export interface ChartPanelProps {
  dataset: Dataset;
  /** Chart state owned by the orchestrator (shared with presets). */
  chart: UseChartConfig;
}

export function ChartPanel({ dataset, chart }: ChartPanelProps) {
  const {
    config,
    numericColumns,
    result,
    setType,
    setDimension,
    setMeasure,
    setAggregation,
    setBucket,
  } = chart;

  const measureDisabled = config.aggregation === 'count';
  const noNumeric = numericColumns.length === 0;
  const dimensionIsDate =
    dataset.columns[dataset.columnIndex[config.dimensionKey]]?.type === 'date';
  const measureCol =
    config.measureKey != null
      ? dataset.columns[dataset.columnIndex[config.measureKey]]
      : undefined;
  const aggLabel = AGGREGATIONS.find((a) => a.value === config.aggregation)?.label;
  const valueLabel = measureDisabled
    ? 'Count'
    : `${aggLabel} of ${measureCol?.name ?? 'value'}`;

  const truncated = result.data.length < result.groupCount;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {CHART_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                config.type === t.value
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Group by</label>
          <select
            aria-label="Group by column"
            value={config.dimensionKey}
            onChange={(e) => setDimension(e.target.value)}
            className={selectCls}
          >
            {dataset.columns.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>

          {dimensionIsDate && (
            <select
              aria-label="Date bucket"
              value={config.bucket ?? 'none'}
              onChange={(e) => setBucket(e.target.value as DateBucket)}
              className={selectCls}
            >
              {BUCKETS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          )}

          <select
            aria-label="Aggregation"
            value={config.aggregation}
            onChange={(e) => setAggregation(e.target.value as Aggregation)}
            className={selectCls}
          >
            {AGGREGATIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Measure column"
            value={config.measureKey ?? ''}
            onChange={(e) => setMeasure(e.target.value)}
            disabled={measureDisabled || noNumeric}
            className={cn(selectCls, (measureDisabled || noNumeric) && 'opacity-40')}
          >
            {noNumeric ? (
              <option value="">— no numeric columns —</option>
            ) : (
              numericColumns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <ChartView type={config.type} data={result.data} valueLabel={valueLabel} />

      {truncated && (
        <p className="mt-2 text-center text-xs text-slate-400">
          Showing top {result.data.length} of {result.groupCount.toLocaleString()}{' '}
          groups
        </p>
      )}
    </div>
  );
}
