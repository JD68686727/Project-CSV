import type { LogPattern } from '@/types/logPattern';
import { parseLogText } from '@/lib/log/regexParser';
import type { SourceAdapter } from './types';

/**
 * Classic `arp -a` / BSD-style ARP table lines:
 *   `gateway (10.0.0.1) at 00:1a:2b:3c:4d:5e [ether] on eth0`
 *   `? (10.0.0.5) at <incomplete> on eth0`
 * The host, hardware type, and interface are optional so partial tables parse.
 */
const ARP_PATTERN: LogPattern = {
  regex:
    '^(?<host>\\S+)\\s+\\((?<ip>[0-9.]+)\\)\\s+at\\s+' +
    '(?<mac>[0-9a-f]{2}(?::[0-9a-f]{2}){5}|<incomplete>)' +
    '(?:\\s+\\[(?<hwtype>\\w+)\\])?(?:\\s+on\\s+(?<iface>\\S+))?',
  flags: 'i',
};

/** A line looks like an ARP entry: an `(ip) at <mac|incomplete>` triple. */
const ARP_LINE =
  /\([0-9.]+\)\s+at\s+([0-9a-f]{2}(?::[0-9a-f]{2}){5}|<incomplete>)/i;

export const arpAdapter: SourceAdapter = {
  id: 'arp',
  label: 'ARP table (arp -a)',
  detect: (sample) =>
    sample
      .split(/\r?\n/, 40)
      .some((line) => ARP_LINE.test(line)),
  parse: (text, opts) => parseLogText(text, ARP_PATTERN, opts),
};
