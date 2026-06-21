/** Shared categorical palette for chart series (single-file and comparison). */
export const CHART_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
] as const;

export function seriesColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
