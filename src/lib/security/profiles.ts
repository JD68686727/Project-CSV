import type { Dataset } from '@/types/dataset';
import type { Finding } from '@/lib/analysis/findings';
import { bruteForce } from './detectors/bruteForce';
import { httpErrorBurst } from './detectors/httpErrorBurst';

/**
 * A one-click defensive analysis. Each profile runs a detector over the current
 * (filtered) view and returns findings. Profiles that don't apply to a schema
 * simply return `[]`, so running them all is safe on any dataset.
 */
export interface SecurityProfile {
  id: string;
  label: string;
  hint: string;
  detect(dataset: Dataset, order: number[]): Finding[];
}

export const SECURITY_PROFILES: SecurityProfile[] = [
  {
    id: 'brute-force',
    label: 'Brute-force login attempts',
    hint: '≥5 failed attempts from one source within 60s',
    detect: (d, o) => bruteForce(d, o),
  },
  {
    id: 'http-error-burst',
    label: 'HTTP error scanning',
    hint: '≥5 client/server errors from one source',
    detect: (d, o) => httpErrorBurst(d, o),
  },
];

/** Runs the selected profiles (all by default) and concatenates the findings. */
export function runProfiles(
  dataset: Dataset,
  order: number[],
  ids?: readonly string[],
): Finding[] {
  const active =
    ids && ids.length
      ? SECURITY_PROFILES.filter((p) => ids.includes(p.id))
      : SECURITY_PROFILES;
  return active.flatMap((p) => p.detect(dataset, order));
}
