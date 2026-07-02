/** One extracted key/value directive from a config file. */
export interface ConfigEntry {
  key: string;
  value: string;
  /** 1-based source line, for pinpointing findings. */
  line: number;
  raw: string;
}

/** Supported config dialects. `generic` = whitespace-separated key/value. */
export type ConfigSyntax = 'ssh' | 'ini' | 'generic';

/** Picks a dialect from the filename, then a light content sniff. */
export function detectSyntax(fileName: string, text: string): ConfigSyntax {
  const n = fileName.toLowerCase();
  if (n.includes('ssh') || /^\s*(?:permitrootlogin|passwordauthentication)\b/im.test(text)) {
    return 'ssh';
  }
  if (/\.(ini|cfg)$/.test(n) || /^\s*\[[^\]]+\]\s*$/m.test(text)) return 'ini';
  return 'generic';
}

/** Strips a `#`/`;` comment (dialect-dependent) and trims. */
function stripComment(raw: string, iniStyle: boolean): string {
  const cut = iniStyle ? raw.replace(/[#;].*$/, '') : raw.replace(/#.*$/, '');
  return cut.trim();
}

/** `sshd_config`-style: `Key value with spaces`. */
export function parseSpaceKv(text: string): ConfigEntry[] {
  const out: ConfigEntry[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = stripComment(raw, false);
    if (!line) return;
    const m = /^(\S+)\s+(.*)$/.exec(line);
    if (m) out.push({ key: m[1], value: m[2].trim(), line: i + 1, raw });
  });
  return out;
}

/** INI-style: `key = value`, ignoring `[sections]`. */
export function parseIniKv(text: string): ConfigEntry[] {
  const out: ConfigEntry[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = stripComment(raw, true);
    if (!line || /^\[[^\]]*\]$/.test(line)) return;
    const m = /^([^=]+)=(.*)$/.exec(line);
    if (m) out.push({ key: m[1].trim(), value: m[2].trim(), line: i + 1, raw });
  });
  return out;
}

export function parseConfig(text: string, syntax: ConfigSyntax): ConfigEntry[] {
  return syntax === 'ini' ? parseIniKv(text) : parseSpaceKv(text);
}
