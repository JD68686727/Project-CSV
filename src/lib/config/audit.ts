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
    // Key/value rules (sshd, nginx directives).
    if (rule.key) {
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
      continue;
    }

    // A bad line is present (Cisco IOS, cross-cutting checks).
    if (rule.unsafeLine) {
      const hit = entries.find((e) => rule.unsafeLine!.test(e.raw));
      if (hit) {
        findings.push({
          severity: rule.severity,
          rule: rule.id,
          entity: rule.subject ?? rule.id,
          detail: `${rule.title}: "${hit.raw.trim()}" (line ${hit.line}) — ${rule.remediation}`,
          count: 1,
        });
      }
      continue;
    }

    // A required hardening line is absent.
    if (rule.requireLine) {
      const present = entries.some((e) => rule.requireLine!.test(e.raw));
      if (!present) {
        findings.push({
          severity: rule.severity,
          rule: rule.id,
          entity: rule.subject ?? rule.id,
          detail: `Not set — ${rule.remediation}`,
          count: 1,
        });
      }
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
