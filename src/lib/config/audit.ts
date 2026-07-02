import type { Finding } from '@/lib/analysis/findings';
import { detectSyntax, parseConfig, type ConfigEntry, type ConfigSyntax } from './parse';
import { RULES_BY_SYNTAX, type ConfigRule } from './rules';

/** Checks parsed entries against a ruleset. First occurrence of a key wins
 *  (matching sshd_config semantics). Pure — entries × rules → findings. */
export function auditConfig(entries: ConfigEntry[], rules: ConfigRule[]): Finding[] {
  const byKey = new Map<string, ConfigEntry>();
  for (const e of entries) {
    const k = e.key.toLowerCase();
    if (!byKey.has(k)) byKey.set(k, e);
  }

  const findings: Finding[] = [];
  for (const rule of rules) {
    const e = byKey.get(rule.key.toLowerCase());
    if (!e) {
      if (rule.requirePresent) {
        findings.push({
          severity: rule.severity,
          rule: rule.id,
          entity: rule.key,
          detail: `Not set — ${rule.remediation}`,
          count: 1,
        });
      }
      continue;
    }
    const val = e.value.toLowerCase();
    const unsafe = rule.unsafeValues?.some((u) => u.toLowerCase() === val) ?? false;
    const notSafe = rule.safeValues
      ? !rule.safeValues.some((s) => s.toLowerCase() === val)
      : false;
    if (unsafe || notSafe) {
      findings.push({
        severity: rule.severity,
        rule: rule.id,
        entity: rule.key,
        detail: `${rule.title}: "${e.value}" (line ${e.line}) — ${rule.remediation}`,
        count: 1,
      });
    }
  }
  return findings;
}

export interface ConfigAuditResult {
  syntax: ConfigSyntax;
  entryCount: number;
  findings: Finding[];
}

/** End-to-end: detect dialect → parse → audit against the matching ruleset. */
export function auditConfigText(fileName: string, text: string): ConfigAuditResult {
  const syntax = detectSyntax(fileName, text);
  const entries = parseConfig(text, syntax);
  const rules = RULES_BY_SYNTAX[syntax] ?? [];
  return { syntax, entryCount: entries.length, findings: auditConfig(entries, rules) };
}
