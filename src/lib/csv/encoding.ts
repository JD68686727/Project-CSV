/** Encodings we detect and decode. UTF-8 is the streaming fast path; the others
 *  are re-decoded into a string before parsing. */
export type Encoding = 'utf-8' | 'utf-16le' | 'utf-16be' | 'windows-1252';

/**
 * Detects an encoding from the file's first bytes: byte-order marks for UTF-8 /
 * UTF-16, otherwise a heuristic — bytes that aren't valid UTF-8 are treated as
 * legacy Windows-1252 (Latin-1). Non-BOM UTF-16 is not detectable and stays as
 * UTF-8 (rare in practice; tools that emit UTF-16 write a BOM).
 */
export function detectEncoding(head: Uint8Array): { encoding: Encoding; bom: boolean } {
  if (head.length >= 3 && head[0] === 0xef && head[1] === 0xbb && head[2] === 0xbf) {
    return { encoding: 'utf-8', bom: true };
  }
  if (head.length >= 2 && head[0] === 0xff && head[1] === 0xfe) {
    return { encoding: 'utf-16le', bom: true };
  }
  if (head.length >= 2 && head[0] === 0xfe && head[1] === 0xff) {
    return { encoding: 'utf-16be', bom: true };
  }
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(head);
    return { encoding: 'utf-8', bom: false };
  } catch {
    return { encoding: 'windows-1252', bom: false };
  }
}

/** Decodes bytes with the given encoding. TextDecoder strips a leading BOM. */
export function decodeBytes(
  bytes: ArrayBuffer | Uint8Array,
  encoding: Encoding,
): string {
  return new TextDecoder(encoding).decode(bytes);
}

/** Strips a leading UTF-8 BOM (U+FEFF) left in a string (e.g. by FileReader). */
export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * Reads a file as a clean, correctly-decoded string regardless of its encoding.
 * Used by paths that already read the whole file (the custom-log parser) and as
 * the re-decode step for non-UTF-8 CSVs.
 */
export async function readFileSmart(
  file: File,
): Promise<{ text: string; encoding: Encoding }> {
  const head = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
  const { encoding } = detectEncoding(head);
  const text = decodeBytes(await file.arrayBuffer(), encoding);
  return { text: stripBom(text), encoding };
}
