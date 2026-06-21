export const ACCEPTED = ['.csv', '.tsv', '.log', '.txt'] as const;

export function isAccepted(file: File): boolean {
  const lower = file.name.toLowerCase();
  return ACCEPTED.some((ext) => lower.endsWith(ext));
}
