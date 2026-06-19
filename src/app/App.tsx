import { useLogParser } from '@/features/ingestion/hooks/useLogParser';
import { DropZone } from '@/features/ingestion/components/DropZone';
import { ParseStatus } from '@/features/ingestion/components/ParseStatus';
import { DataWorkspace } from './DataWorkspace';

export function App() {
  const { status, dataset, errors, progress, parseFile, reset } = useLogParser();
  const hasData = status === 'success' && dataset !== null;
  const dataKey = dataset
    ? `${dataset.meta.fileName}:${dataset.meta.fileSize}:${dataset.meta.rowCount}`
    : 'none';

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[100rem] items-center gap-2 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            LV
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-slate-900">
              LogVibe
            </h1>
            <p className="text-xs text-slate-500">
              Privacy-first, local CSV &amp; log analyzer
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[100rem] px-6 py-8">
        {hasData ? (
          <div className="space-y-4">
            <ParseStatus
              status={status}
              dataset={dataset}
              errors={errors}
              onClear={reset}
            />
            <DataWorkspace key={dataKey} dataset={dataset} />
          </div>
        ) : (
          <div className="py-12">
            <DropZone
              status={status}
              progress={progress}
              onFileSelected={parseFile}
            />
            <ParseStatus
              status={status}
              dataset={dataset}
              errors={errors}
              onClear={reset}
            />
          </div>
        )}
      </main>
    </div>
  );
}
