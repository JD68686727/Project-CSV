import type { LogParseResult } from '@/types/logPattern';

/**
 * A pluggable ingestion adapter for a non-CSV text format (network dumps, etc.).
 * Every adapter emits the same `(headers, string[][])` shape the CSV and
 * custom-log paths produce, so the core engine (filter/sort/chart/export) stays
 * completely unchanged — an adapter is just a new *front door* to the pipeline.
 */
export interface SourceAdapter {
  id: string;
  label: string;
  /** Cheap sniff over a sample of the head — does this look like our format? */
  detect(sample: string): boolean;
  /** Parse the full text into headers + raw string rows. */
  parse(text: string, opts?: { maxRows?: number }): LogParseResult;
}
