import type { SourceAdapter } from './types';
import { arpAdapter } from './arp';
import { tsharkAdapter } from './tshark';

/** All known non-CSV text adapters, tried in order on ingest. */
export const ADAPTERS: SourceAdapter[] = [arpAdapter, tsharkAdapter];

/**
 * Returns the first adapter whose `detect` claims the sample, or null so the
 * caller falls back to the standard CSV/TSV parser. Cheap enough to run on the
 * decoded file head before committing to a parse path.
 */
export function detectAdapter(sample: string): SourceAdapter | null {
  return ADAPTERS.find((a) => a.detect(sample)) ?? null;
}
