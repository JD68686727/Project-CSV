import { describe, it, expect } from 'vitest';
import { parseSpaceKv, parseIniKv, detectSyntax } from './parse';
import { auditConfig, auditConfigText } from './audit';
import { SSH_RULES } from './rules';

const SSHD = `# Managed by Ansible
Port 22
PermitRootLogin yes    # legacy
PasswordAuthentication yes
X11Forwarding no
Protocol 2
`;

describe('parseSpaceKv', () => {
  it('extracts key/value pairs, stripping comments and blanks', () => {
    const entries = parseSpaceKv(SSHD);
    const byKey = Object.fromEntries(entries.map((e) => [e.key, e.value]));
    expect(byKey.Port).toBe('22');
    expect(byKey.PermitRootLogin).toBe('yes'); // trailing comment removed
    expect(entries.find((e) => e.key === 'PermitRootLogin')?.line).toBe(3);
  });
});

describe('parseIniKv', () => {
  it('parses key = value and ignores [sections]', () => {
    const entries = parseIniKv('[server]\nssl = on\n; note\nport=8080');
    expect(entries).toEqual([
      { key: 'ssl', value: 'on', line: 2, raw: 'ssl = on' },
      { key: 'port', value: '8080', line: 4, raw: 'port=8080' },
    ]);
  });
});

describe('detectSyntax', () => {
  it('recognizes ssh by filename or content', () => {
    expect(detectSyntax('sshd_config', '')).toBe('ssh');
    expect(detectSyntax('unknown', 'PermitRootLogin no')).toBe('ssh');
  });
  it('recognizes ini by section headers', () => {
    expect(detectSyntax('app.cfg', '[main]\nx = 1')).toBe('ini');
  });
});

describe('auditConfig', () => {
  it('flags insecure sshd directives with severity', () => {
    const findings = auditConfig(parseSpaceKv(SSHD), SSH_RULES);
    const ids = findings.map((f) => f.rule);
    expect(ids).toContain('ssh-root-login');
    expect(ids).toContain('ssh-password-auth');
    // X11Forwarding no + Protocol 2 are safe → not flagged.
    expect(ids).not.toContain('ssh-x11-forwarding');
    expect(ids).not.toContain('ssh-protocol-1');
    const root = findings.find((f) => f.rule === 'ssh-root-login');
    expect(root?.severity).toBe('high');
    expect(root?.detail).toContain('line 3');
  });

  it('uses the first occurrence of a repeated key', () => {
    const findings = auditConfig(
      parseSpaceKv('PermitRootLogin no\nPermitRootLogin yes'),
      SSH_RULES,
    );
    expect(findings.find((f) => f.rule === 'ssh-root-login')).toBeUndefined();
  });
});

describe('auditConfigText', () => {
  it('detects dialect, parses and audits end-to-end', () => {
    const res = auditConfigText('sshd_config', SSHD);
    expect(res.syntax).toBe('ssh');
    expect(res.entryCount).toBe(5);
    expect(res.findings.length).toBeGreaterThan(0);
  });
});
