import type { Severity } from '@/lib/analysis/findings';
import type { ConfigSyntax } from './parse';

/**
 * A static hardening rule checked against a config entry. Kept as plain data
 * (no code, no network) so the ruleset is a versioned, auditable JSON-like
 * catalog — extend it by adding entries, not logic.
 */
export interface ConfigRule {
  id: string;
  /** Directive key, matched case-insensitively. */
  key: string;
  severity: Severity;
  title: string;
  remediation: string;
  /** Fires when the value equals one of these (case-insensitive). */
  unsafeValues?: string[];
  /** Fires when the value is present but NOT one of these. */
  safeValues?: string[];
  /** Fires when the key is absent entirely. */
  requirePresent?: boolean;
}

/** OpenSSH server hardening checks (sshd_config). */
export const SSH_RULES: ConfigRule[] = [
  {
    id: 'ssh-root-login',
    key: 'PermitRootLogin',
    severity: 'high',
    title: 'Root login over SSH permitted',
    remediation: 'Set PermitRootLogin no (or prohibit-password).',
    unsafeValues: ['yes'],
  },
  {
    id: 'ssh-empty-passwords',
    key: 'PermitEmptyPasswords',
    severity: 'critical',
    title: 'Empty passwords allowed',
    remediation: 'Set PermitEmptyPasswords no.',
    unsafeValues: ['yes'],
  },
  {
    id: 'ssh-password-auth',
    key: 'PasswordAuthentication',
    severity: 'medium',
    title: 'Password authentication enabled',
    remediation: 'Prefer key-based auth: PasswordAuthentication no.',
    unsafeValues: ['yes'],
  },
  {
    id: 'ssh-protocol-1',
    key: 'Protocol',
    severity: 'high',
    title: 'Legacy SSH protocol 1 enabled',
    remediation: 'Use Protocol 2 only.',
    unsafeValues: ['1', '1,2', '2,1'],
  },
  {
    id: 'ssh-x11-forwarding',
    key: 'X11Forwarding',
    severity: 'low',
    title: 'X11 forwarding enabled',
    remediation: 'Disable unless required: X11Forwarding no.',
    unsafeValues: ['yes'],
  },
];

/**
 * Built-in rulesets per dialect. INI/generic ship empty for now — the point is
 * the shape: adding a ruleset is pure data, no engine changes.
 */
export const RULES_BY_SYNTAX: Record<ConfigSyntax, ConfigRule[]> = {
  ssh: SSH_RULES,
  ini: [],
  generic: [],
};
