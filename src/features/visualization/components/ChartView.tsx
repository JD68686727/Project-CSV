import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartDatum, ChartType } from '@/types/chart';

const COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

const AXIS_TICK = { fontSize: 11, fill: '#64748b' };

function formatNumber(value: unknown): string {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export interface ChartViewProps {
  type: ChartType;
  data: ChartDatum[];
  /** Human label for the aggregated series, shown in tooltip & legend. */
  valueLabel: string;
}

function renderChart(
  type: ChartType,
  data: ChartDatum[],
  valueLabel: string,
): ReactElement {
  if (type === 'line') {
    return (
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={AXIS_TICK} interval="preserveStartEnd" />
        <YAxis tick={AXIS_TICK} width={48} />
        <Tooltip formatter={(value) => [formatNumber(value), valueLabel]} />
        <Line
          type="monotone"
          dataKey="value"
          name={valueLabel}
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    );
  }

  if (type === 'pie') {
    return (
      <PieChart>
        <Tooltip formatter={(value) => [formatNumber(value), valueLabel]} />
        <Legend />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          labelLine={false}
        >
          {data.map((d, i) => (
            <Cell key={d.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }

  return (
    <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="name" tick={AXIS_TICK} interval="preserveStartEnd" />
      <YAxis tick={AXIS_TICK} width={48} />
      <Tooltip formatter={(value) => [formatNumber(value), valueLabel]} />
      <Bar dataKey="value" name={valueLabel} fill="#6366f1" radius={[4, 4, 0, 0]} />
    </BarChart>
  );
}

export function ChartView({ type, data, valueLabel }: ChartViewProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-400">
        No data to chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      {renderChart(type, data, valueLabel)}
    </ResponsiveContainer>
  );
}
