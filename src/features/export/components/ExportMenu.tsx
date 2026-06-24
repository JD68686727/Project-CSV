import { useCallback, useEffect, useRef, useState } from 'react';
import type { ColumnSchema, Dataset } from '@/types/dataset';
import { datasetToCsv } from '@/lib/csv/exportCsv';
import { datasetToJson } from '@/lib/export/exportJson';
import { downloadBlob } from '@/utils/downloadBlob';
import { btnSecondary } from '@/utils/controls';

/** `server-logs.csv` → `server-logs.filtered.<ext>` */
function exportName(fileName: string, ext: string): string {
  const dot = fileName.lastIndexOf('.');
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  return `${base}.filtered.${ext}`;
}

export interface ExportMenuProps {
  dataset: Dataset;
  /** Filtered + sorted row indices — export mirrors the on-screen view. */
  order: number[];
  /** Visible columns (ordered) — export mirrors the visible table. */
  columns: ColumnSchema[];
}

const item =
  'flex w-full items-center justify-between gap-6 rounded-md px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800';
const ext = 'font-mono text-xs text-slate-400 dark:text-slate-500';

export function ExportMenu({ dataset, order, columns }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const name = dataset.meta.fileName;

  const exportCsv = useCallback(() => {
    downloadBlob(exportName(name, 'csv'), datasetToCsv(dataset, order, columns));
    setOpen(false);
  }, [dataset, order, columns, name]);

  const exportJson = useCallback(() => {
    downloadBlob(
      exportName(name, 'json'),
      datasetToJson(dataset, order, columns),
      'application/json',
    );
    setOpen(false);
  }, [dataset, order, columns, name]);

  const exportXlsx = useCallback(async () => {
    setBusy(true);
    try {
      // Lazy: SheetJS is fetched only on first Excel export.
      const { datasetToXlsxBlob } = await import('@/lib/export/exportXlsx');
      downloadBlob(exportName(name, 'xlsx'), await datasetToXlsxBlob(dataset, order, columns));
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }, [dataset, order, columns, name]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={order.length === 0}
        aria-expanded={open}
        className={`${btnSecondary} disabled:cursor-not-allowed disabled:opacity-40`}
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

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <button type="button" onClick={exportCsv} aria-label="CSV" className={item}>
            CSV<span className={ext}>.csv</span>
          </button>
          <button type="button" onClick={exportJson} aria-label="JSON" className={item}>
            JSON<span className={ext}>.json</span>
          </button>
          <button
            type="button"
            onClick={exportXlsx}
            disabled={busy}
            aria-label="Excel"
            className={item}
          >
            Excel<span className={ext}>{busy ? '…' : '.xlsx'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
