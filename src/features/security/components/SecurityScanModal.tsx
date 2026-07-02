import { useMemo } from 'react';
import type { Dataset } from '@/types/dataset';
import { findingsToDataset } from '@/lib/analysis/findings';
import { runProfiles, SECURITY_PROFILES } from '@/lib/security/profiles';
import { btnSecondary } from '@/utils/controls';
import { ModalShell } from '@/features/analysis/components/ModalShell';
import { FindingsTable } from '@/features/analysis/components/FindingsTable';

export interface SecurityScanModalProps {
  dataset: Dataset;
  /** The current filtered view — the scan runs over exactly what's on screen. */
  order: number[];
  /** Opens the findings as a new workspace dataset (table/filter/export reuse). */
  onOpenDataset: (dataset: Dataset) => void;
  onClose: () => void;
}

function baseName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

/** Runs the built-in defensive profiles over the current view and lets the user
 *  open the results as a first-class dataset. 100% local. */
export function SecurityScanModal({
  dataset,
  order,
  onOpenDataset,
  onClose,
}: SecurityScanModalProps) {
  const findings = useMemo(() => runProfiles(dataset, order), [dataset, order]);

  const openAsDataset = () => {
    onOpenDataset(
      findingsToDataset(findings, `${baseName(dataset.meta.fileName)}.threats.csv`),
    );
    onClose();
  };

  return (
    <ModalShell
      title="Security scan"
      subtitle="Run built-in defensive profiles over the current filtered view — nothing leaves your browser."
      testId="security-scan"
      onClose={onClose}
      footer={
        <>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {findings.length > 0
              ? `${findings.length} finding${findings.length === 1 ? '' : 's'} across ${order.length.toLocaleString()} rows`
              : 'No threats detected by the active profiles.'}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className={btnSecondary}>
              Close
            </button>
            <button
              type="button"
              disabled={findings.length === 0}
              onClick={openAsDataset}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Open as dataset
            </button>
          </div>
        </>
      }
    >
      {/* Per-profile summary */}
      <section className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Profiles
        </p>
        <ul className="space-y-1">
          {SECURITY_PROFILES.map((p) => {
            const n = findings.filter((f) => f.rule === p.id).length;
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-800"
              >
                <span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {p.label}
                  </span>{' '}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {p.hint}
                  </span>
                </span>
                <span
                  className={
                    n > 0
                      ? 'rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                      : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }
                >
                  {n}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Findings */}
      {findings.length > 0 ? (
        <section className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Findings
          </p>
          <FindingsTable findings={findings} />
        </section>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
          Nothing flagged. Profiles that don&apos;t apply to this file&apos;s columns
          are skipped automatically.
        </p>
      )}
    </ModalShell>
  );
}
