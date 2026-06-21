import { useCallback } from 'react';
import type { ColumnSchema, Dataset } from '@/types/dataset';
import { datasetToCsv } from '@/lib/csv/exportCsv';
import { downloadBlob } from '@/utils/downloadBlob';

/** `server-logs.csv` → `server-logs.filtered.csv` */
function exportName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  return `${base}.filtered.csv`;
}

export interface ExportButtonProps {
  dataset: Dataset;
  /** Filtered + sorted row indices — export mirrors the on-screen view. */
  order: number[];
  /** Visible columns (ordered) — export mirrors the visible table. */
  columns: ColumnSchema[];
}

export function ExportButton({ dataset, order, columns }: ExportButtonProps) {
  const handleExport = useCallback(() => {
    const csv = datasetToCsv(dataset, order, columns);
    downloadBlob(exportName(dataset.meta.fileName), csv);
  }, [dataset, order, columns]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={order.length === 0}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
      Export {order.length.toLocaleString()} rows
    </button>
  );
}
