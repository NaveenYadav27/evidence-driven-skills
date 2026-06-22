// Command normalization for lab validation.
// Goal: a learner's intent — not their exact whitespace/casing/flag-order — drives objective completion.
//
// Examples that all normalize to the same form:
//   "DIG paypal.com MX"
//   "dig   paypal.com   mx"
//   "dig paypal.com mx +short"
//   "  dig -t MX paypal.com  "
//   → "dig paypal.com mx"

// Per-tool noise flags that don't change semantic intent for objective matching.
const NOISE_FLAGS: Record<string, RegExp[]> = {
  dig: [/^\+\w+(=\S*)?$/, /^-4$/, /^-6$/, /^@\S+$/],
  nslookup: [/^-\S+=\S*$/, /^-debug$/, /^-d2?$/],
  curl: [/^-[sSLkfivIA]+$/, /^--silent$/, /^--location$/, /^--insecure$/, /^--head$/, /^-X$/, /^-H$/, /^--max-time$/],
  wget: [/^-q$/, /^--quiet$/, /^-O-$/, /^--spider$/],
  whois: [/^-h$/, /^-H$/],
  host: [/^-t$/, /^-a$/, /^-v$/],
  nmap: [/^-v+$/, /^-T[0-5]$/, /^-Pn$/, /^-n$/, /^--reason$/, /^--open$/],
  ping: [/^-c$/, /^-W$/, /^-n$/],
};

// Flag tokens that take a value as the NEXT arg — drop both.
const FLAGS_WITH_VALUE: Record<string, RegExp[]> = {
  dig: [/^-t$/, /^-q$/, /^-c$/],
  curl: [/^-X$/, /^-H$/, /^-A$/, /^--max-time$/, /^-d$/, /^--data$/, /^-o$/, /^-e$/, /^--referer$/, /^-u$/],
  wget: [/^-O$/, /^--user-agent$/],
  ping: [/^-c$/, /^-W$/, /^-i$/, /^-s$/],
  host: [/^-t$/, /^-c$/, /^-N$/],
  nmap: [/^-p$/, /^--script$/, /^-oN$/, /^-oX$/],
};

// Tokenize respecting quoted strings.
function tokenize(input: string): string[] {
  const out: string[] = [];
  let buf = "";
  let quote: string | null = null;
  for (const ch of input.trim()) {
    if (quote) {
      if (ch === quote) { quote = null; continue; }
      buf += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (buf) { out.push(buf); buf = ""; }
    } else {
      buf += ch;
    }
  }
  if (buf) out.push(buf);
  return out;
}

export interface NormalizedCommand {
  tool: string;
  args: string[];          // positional args, lowercased, sorted-stable
  flags: string[];         // significant flags, sorted
  canonical: string;       // tool + sorted args (no flags) — used for objective matching
  full: string;            // tool + canonical args + flags (for logging)
  raw: string;
}

export function normalizeCommand(raw: string): NormalizedCommand {
  const tokens = tokenize(raw.toLowerCase());
  if (tokens.length === 0) return { tool: "", args: [], flags: [], canonical: "", full: "", raw };
  const tool = tokens[0];
  const noise = NOISE_FLAGS[tool] ?? [];
  const valueFlags = FLAGS_WITH_VALUE[tool] ?? [];

  const args: string[] = [];
  const flags: string[] = [];
  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (valueFlags.some((r) => r.test(t))) {
      // Promote `-t MX` into a flag pair, dropped from canonical args; capture value as a flag for full
      const val = tokens[i + 1];
      if (val !== undefined) {
        flags.push(`${t}=${val}`);
        i++;
      }
      continue;
    }
    if (noise.some((r) => r.test(t))) {
      flags.push(t);
      continue;
    }
    if (t.startsWith("-") || t.startsWith("+") || t.startsWith("@")) {
      flags.push(t);
      continue;
    }
    args.push(t);
  }

  // For canonical matching, sort args so `dig paypal.com mx` == `dig mx paypal.com`.
  const sortedArgs = [...args].sort();
  flags.sort();
  const canonical = [tool, ...sortedArgs].join(" ");
  const full = [tool, ...sortedArgs, ...flags].join(" ");
  return { tool, args: sortedArgs, flags, canonical, full, raw };
}

// Strict matcher: does the user's command satisfy ANY of the accepted patterns?
// Patterns can be strings (canonicalized too) or predicate functions.
export type CommandPattern =
  | string
  | RegExp
  | ((n: NormalizedCommand) => boolean);

export function matchesAny(input: string, patterns: CommandPattern[]): boolean {
  const n = normalizeCommand(input);
  for (const p of patterns) {
    if (typeof p === "string") {
      const np = normalizeCommand(p);
      if (np.canonical === n.canonical) return true;
      // Also tolerate: tool matches AND every required arg from pattern is present in input
      if (np.tool === n.tool && np.args.every((a) => n.args.includes(a))) return true;
    } else if (p instanceof RegExp) {
      if (p.test(n.canonical) || p.test(n.full) || p.test(n.raw)) return true;
    } else if (typeof p === "function") {
      try { if (p(n)) return true; } catch { /* ignore matcher errors */ }
    }
  }
  return false;
}

// Convenience: did the user run `tool` with all of these tokens (any order)?
export function ran(input: string, tool: string, mustInclude: string[] = []): boolean {
  const n = normalizeCommand(input);
  if (n.tool !== tool.toLowerCase()) return false;
  return mustInclude.every((t) => n.args.includes(t.toLowerCase()));
}
