import type { Dataset, ParseError, ParseStatus as Status } from '@/types/dataset';
import { formatBytes } from '@/utils/formatBytes';

export interface ParseStatusProps {
  status: Status;
  dataset: Dataset | null;
  errors: ParseError[];
  onClear: () => void;
}

/** Renders post-parse feedback: error list on failure, dataset summary on success. */
export function ParseStatus({ status, dataset, errors, onClear }: ParseStatusProps) {
  if (status === 'error') {
    return (
      <div className="mx-auto mt-4 w-full max-w-2xl rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/30 dark:bg-rose-500/10">
        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
          Couldn’t parse the file
        </p>
        <ul className="mt-1 list-inside list-disc text-xs text-rose-600 dark:text-rose-400">
          {errors.slice(0, 5).map((err, i) => (
            <li key={`${err.code}-${i}`}>{err.message}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (status === 'success' && dataset) {
    return (
      <div className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <div className="text-sm">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
            {dataset.meta.fileName}
          </p>
          <p className="text-emerald-600 dark:text-emerald-400">
            {dataset.meta.rowCount.toLocaleString()} rows · {dataset.columns.length}{' '}
            columns · {formatBytes(dataset.meta.fileSize)}
            {dataset.meta.truncated && ' · truncated'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
        >
          Clear
        </button>
      </div>
    );
  }

  return null;
}
