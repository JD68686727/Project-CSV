import type { LogPattern } from '@/types/logPattern';
import { parseLogText } from '@/lib/log/regexParser';
import type { SourceAdapter } from './types';

/**
 * Default TShark / Wireshark console output (`tshark -r x.pcap`):
 *   `  1   0.000000  10.0.0.1 → 10.0.0.2  TCP  74  50912 → 80 [SYN] Seq=0`
 * The distinctive `src → dst` arrow (also written `->`) between the frame
 * number and protocol makes this safe to auto-detect without stealing plain TSV.
 */
const TSHARK_PATTERN: LogPattern = {
  regex:
    '^\\s*(?<no>\\d+)\\s+(?<time>\\d+\\.\\d+)\\s+' +
    '(?<src>\\S+)\\s+(?:→|->)\\s+(?<dst>\\S+)\\s+' +
    '(?<proto>\\w+)\\s+(?<length>\\d+)\\s+(?<info>.*)$',
  flags: '',
};

/** A frame line: `<num> <time> <src> → <dst> …`. */
const TSHARK_LINE = /^\s*\d+\s+\d+\.\d+\s+\S+\s+(?:→|->)\s+\S+\s+\w+/;

export const tsharkAdapter: SourceAdapter = {
  id: 'tshark',
  label: 'TShark / Wireshark (text)',
  detect: (sample) =>
    sample.split(/\r?\n/, 40).some((line) => TSHARK_LINE.test(line)),
  parse: (text, opts) => parseLogText(text, TSHARK_PATTERN, opts),
};
