import { describe, it, expect } from 'vitest';
import { arpAdapter } from './arp';
import { tsharkAdapter } from './tshark';
import { detectAdapter } from './registry';

const ARP = `gateway (10.0.0.1) at 00:1a:2b:3c:4d:5e [ether] on eth0
? (10.0.0.5) at <incomplete> on eth0
host-2 (10.0.0.7) at 00:1a:2b:3c:4d:99 [ether] on eth0`;

const TSHARK = `  1   0.000000    10.0.0.1 → 10.0.0.2     TCP    74   50912 → 80 [SYN] Seq=0
  2   0.000123    10.0.0.2 → 10.0.0.1     TCP    74   80 → 50912 [SYN, ACK]
  3   0.100000    10.0.0.1 -> 8.8.8.8     DNS    88   Standard query A example.com`;

describe('arpAdapter', () => {
  it('detects and parses an arp -a table into ip/mac/iface columns', () => {
    expect(arpAdapter.detect(ARP)).toBe(true);
    const r = arpAdapter.parse(ARP);
    expect(r.headers).toEqual(['host', 'ip', 'mac', 'hwtype', 'iface']);
    expect(r.matched).toBe(3);
    expect(r.rows[0][r.headers.indexOf('ip')]).toBe('10.0.0.1');
    expect(r.rows[0][r.headers.indexOf('mac')]).toBe('00:1a:2b:3c:4d:5e');
    // The incomplete entry still parses (mac = <incomplete>).
    expect(r.rows[1][r.headers.indexOf('mac')]).toBe('<incomplete>');
  });

  it('does not claim a plain CSV', () => {
    expect(arpAdapter.detect('a,b,c\n1,2,3')).toBe(false);
  });
});

describe('tsharkAdapter', () => {
  it('detects and parses frames with the src → dst arrow (→ and ->)', () => {
    expect(tsharkAdapter.detect(TSHARK)).toBe(true);
    const r = tsharkAdapter.parse(TSHARK);
    expect(r.headers).toEqual([
      'no',
      'time',
      'src',
      'dst',
      'proto',
      'length',
      'info',
    ]);
    expect(r.matched).toBe(3);
    expect(r.rows[0][r.headers.indexOf('src')]).toBe('10.0.0.1');
    expect(r.rows[2][r.headers.indexOf('proto')]).toBe('DNS');
  });
});

describe('detectAdapter', () => {
  it('routes each sample to its adapter, and returns null otherwise', () => {
    expect(detectAdapter(ARP)?.id).toBe('arp');
    expect(detectAdapter(TSHARK)?.id).toBe('tshark');
    expect(detectAdapter('timestamp,level\n2026-01-01,INFO')).toBeNull();
  });
});
