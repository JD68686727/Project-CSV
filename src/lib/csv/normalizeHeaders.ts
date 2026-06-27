/**
 * Produces stable, unique, machine-friendly keys from raw header labels.
 * Handles empty headers, duplicates, and whitespace. Pure & React-free so it
 * can be unit-tested in isolation.
 */
export function normalizeHeaders(
  rawHeaders: string[],
): { name: string; key: string }[] {
  const seen = new Map<string, number>();

  return rawHeaders.map((raw, i) => {
    // A UTF-8 BOM (U+FEFF) survives FileReader's text decode and clings to the
    // first header — strip it so the key isn't corrupted.
    const cleaned =
      raw && raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : (raw ?? '');
    const name = cleaned.trim() || `column_${i + 1}`;

    const base =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || `column_${i + 1}`;

    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    const key = count === 0 ? base : `${base}_${count + 1}`;
    return { name, key };
  });
}
