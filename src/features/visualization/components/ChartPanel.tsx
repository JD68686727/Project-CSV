import type { Dataset } from '@/types/dataset';
import type { Aggregation, ChartType } from '@/types/chart';
import { cn } from '@/utils/cn';
import { useChartConfig } from '../hooks/useChartConfig';
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

export interface ChartPanelProps {
  dataset: Dataset;
  /** Filtered row indices to aggregate (sorting doesn't affect aggregation). */
  order: number[];
}

export function ChartPanel({ dataset, order }: ChartPanelProps) {
  const {
    config,
    numericColumns,
    result,
    setType,
    setDimension,
    setMeasure,
    setAggregation,
  } = useChartConfig(dataset, order);

  const measureDisabled = config.aggregation === 'count';
  const noNumeric = numericColumns.length === 0;
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
