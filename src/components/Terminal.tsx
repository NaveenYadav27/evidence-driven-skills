import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  whoisLookup, dnsLookup, subdomainEnum,
  httpHeaders, robotsScan, waybackHistory,
  cveSearch, ipIntel, tlsInspect, httpMethods,
} from "@/lib/recon.functions";
import { useTelemetry } from "@/lib/telemetry";
import { useLabTranscript } from "@/lib/lab-transcript";
import type { Lab } from "@/data/labs";

interface Line { kind: "in" | "out" | "sys" | "err"; text: string; }

const banner = `ShadowXLab :: Cyber Range Terminal v1.6
type 'help' for available commands · every command is tracked
`;

const HELP = `Available tools (sandbox-safe, real public APIs + client crypto)
  whois <domain>                — RDAP-based WHOIS lookup
  dig <domain> [type]           — DNS-over-HTTPS query
  nslookup <domain> [type]      — alias of dig
  host <domain>                 — short A/AAAA lookup
  subs <domain>                 — subdomain enumeration via crt.sh
  headers <host>                — HTTP response + security-header audit
  robots <host>                 — fetch & parse /robots.txt
  wayback <host>                — Internet Archive snapshot history
  cve <keyword|CVE-ID>          — NIST NVD vulnerability search
  ip <host|ipv4>                — IP geo & ASN intelligence (ipapi.co)
  tls <host>                    — latest TLS certificate (crt.sh)
  methods <host>                — HTTP OPTIONS / Allow probe
  b64 encode|decode <text>      — Base64 codec (client)
  hash md5|sha1|sha256 <text>   — Cryptographic digest (Web Crypto)
  jwt <token>                   — Decode JWT header + payload (no verify)
  xor key=<k> hex=<h>           — XOR decrypt hex ciphertext with key
  cvss <CVSS:3.1/AV:.../A:H>    — Parse CVSS:3.1 vector and score
  crack <hash>                  — Dictionary crack against built-in list
  clear                         — clear screen
  help                          — this help`;

// ─── tiny built-in wordlist for the demo `crack` command ────────────────
const CRACK_WORDS = [
  "password", "123456", "qwerty", "letmein", "admin", "welcome",
  "hunter2", "shadow", "dragon", "monkey", "iloveyou", "abc123",
  "ceh", "shadowxlab", "hacker", "root",
];

// MD5 implementation (tiny, for the demo crack tool only).
function md5(text: string): string {
  function safeAdd(x: number, y: number) { const lsw = (x & 0xffff) + (y & 0xffff); const msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xffff); }
  function bitRol(num: number, cnt: number) { return (num << cnt) | (num >>> (32 - cnt)); }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }
  function binlMD5(x: number[], len: number) {
    x[len >> 5] |= 0x80 << (len % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d;
      a = ff(a, b, c, d, x[i], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586); c = ff(c, d, a, b, x[i + 2], 17, 606105819); b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426); c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = ff(a, b, c, d, x[i + 8], 7, 1770035416); d = ff(d, a, b, c, x[i + 9], 12, -1958414417); c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101); c = ff(c, d, a, b, x[i + 14], 17, -1502002290); b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632); c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i], 20, -373897302);
      a = gg(a, b, c, d, x[i + 5], 5, -701558691); d = gg(d, a, b, c, x[i + 10], 9, 38016083); c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690); c = gg(c, d, a, b, x[i + 3], 14, -187363961); b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784); c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = hh(a, b, c, d, x[i + 5], 4, -378558); d = hh(d, a, b, c, x[i + 8], 11, -2022574463); c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353); c = hh(c, d, a, b, x[i + 7], 16, -155497632); b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i], 11, -358537222); c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = hh(a, b, c, d, x[i + 9], 4, -640364487); d = hh(d, a, b, c, x[i + 12], 11, -421815835); c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
      a = ii(a, b, c, d, x[i], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415); c = ii(c, d, a, b, x[i + 14], 15, -1416354905); b = ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606); c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = ii(a, b, c, d, x[i + 8], 6, 1873313359); d = ii(d, a, b, c, x[i + 15], 10, -30611744); c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379); c = ii(c, d, a, b, x[i + 2], 15, 718787259); b = ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }
  function binl2hex(binarray: number[]) {
    const hex = "0123456789abcdef"; let str = "";
    for (let i = 0; i < binarray.length * 4; i++) str += hex.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf) + hex.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xf);
    return str;
  }
  function str2binl(str: string) { const bin: number[] = []; const mask = 0xff; for (let i = 0; i < str.length * 8; i += 8) bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32); return bin; }
  const utf8 = unescape(encodeURIComponent(text));
  return binl2hex(binlMD5(str2binl(utf8), utf8.length * 8));
}

async function webCryptoHash(algo: "SHA-1" | "SHA-256", text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const out = await crypto.subtle.digest(algo, buf);
  return Array.from(new Uint8Array(out)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function decodeJwt(token: string) {
  const parts = token.split(".");
  if (parts.length < 2) throw new Error("not a JWT");
  const fix = (s: string) => s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const header = JSON.parse(atob(fix(parts[0])));
  const payload = JSON.parse(atob(fix(parts[1])));
  return { header, payload, signature: parts[2] ?? "" };
}

function xorHex(hex: string, key: string) {
  const bytes = hex.match(/.{1,2}/g)?.map(h => parseInt(h, 16)) ?? [];
  return bytes.map((b, i) => String.fromCharCode(b ^ key.charCodeAt(i % key.length))).join("");
}

// CVSS:3.1 base-score computation (per FIRST.org spec)
function cvssBase(vec: string): { score: number; severity: string; metrics: Record<string, string> } | null {
  if (!/^CVSS:3\.[01]\/[A-Z:/]+$/.test(vec)) return null;
  const m: Record<string, string> = {};
  for (const p of vec.split("/").slice(1)) { const [k, v] = p.split(":"); m[k] = v; }
  const W = {
    AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
    AC: { L: 0.77, H: 0.44 },
    PR_U: { N: 0.85, L: 0.62, H: 0.27 },
    PR_C: { N: 0.85, L: 0.68, H: 0.5 },
    UI: { N: 0.85, R: 0.62 },
    CIA: { N: 0, L: 0.22, H: 0.56 },
  } as const;
  const av = (W.AV as any)[m.AV]; const ac = (W.AC as any)[m.AC];
  const pr = m.S === "C" ? (W.PR_C as any)[m.PR] : (W.PR_U as any)[m.PR];
  const ui = (W.UI as any)[m.UI];
  const c = (W.CIA as any)[m.C], i = (W.CIA as any)[m.I], a = (W.CIA as any)[m.A];
  if ([av, ac, pr, ui, c, i, a].some(x => x === undefined)) return null;
  const iss = 1 - ((1 - c) * (1 - i) * (1 - a));
  const impact = m.S === "C" ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15) : 6.42 * iss;
  const exploit = 8.22 * av * ac * pr * ui;
  let score: number;
  if (impact <= 0) score = 0;
  else if (m.S === "C") score = Math.min(1.08 * (impact + exploit), 10);
  else score = Math.min(impact + exploit, 10);
  score = Math.ceil(score * 10) / 10;
  const severity = score === 0 ? "None" : score < 4 ? "Low" : score < 7 ? "Medium" : score < 9 ? "High" : "Critical";
  return { score, severity, metrics: m };
}

export function Terminal({ lab, onCommand }: {
  lab: Lab;
  onCommand: (tool: string, args: string, success: boolean) => void;
}) {
  const [lines, setLines] = useState<Line[]>([
    { kind: "sys", text: banner },
    { kind: "sys", text: `Scenario target: ${lab.target ?? "(none)"} · Tools: ${lab.tools.join(", ")}` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recordCommand = useTelemetry((s) => s.recordCommand);
  const pushTranscript = useLabTranscript((s) => s.push);
  const whois = useServerFn(whoisLookup);
  const dns = useServerFn(dnsLookup);
  const subs = useServerFn(subdomainEnum);
  const headers = useServerFn(httpHeaders);
  const robots = useServerFn(robotsScan);
  const wayback = useServerFn(waybackHistory);
  const cve = useServerFn(cveSearch);
  const ip = useServerFn(ipIntel);
  const tls = useServerFn(tlsInspect);
  const methods = useServerFn(httpMethods);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [lines]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const capturedRef = useRef<string[]>([]);
  const append = (...l: Line[]) => {
    for (const x of l) if (x.kind === "out" || x.kind === "err") capturedRef.current.push(x.text);
    setLines((prev) => [...prev, ...l]);
  };

  const run = async (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    append({ kind: "in", text: `$ ${cmd}` });
    setHistory((h) => [cmd, ...h].slice(0, 50));
    setHistIdx(-1);

    const [tool, ...rest] = cmd.split(/\s+/);
    const args = rest.join(" ");
    const lower = tool.toLowerCase();

    if (lower === "help") { append({ kind: "out", text: HELP }); return; }
    if (lower === "clear") { setLines([{ kind: "sys", text: banner }]); return; }

    setBusy(true);
    capturedRef.current = [];
    const t0 = performance.now();
    let success = false;
    try {
      const target = rest[0];
      const need = (usage: string) => { if (!target) { append({ kind: "err", text: usage }); return false; } return true; };

      if (lower === "whois") {
        if (need("usage: whois <domain>")) {
          const r = await whois({ data: { domain: target } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = true; }
          else append({ kind: "err", text: `whois failed: ${r.error}` });
        }
      } else if (lower === "dig" || lower === "nslookup") {
        if (need(`usage: ${lower} <domain> [type]`)) {
          const r = await dns({ data: { domain: target, type: rest[1] ?? "A" } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = true; }
          else append({ kind: "err", text: `${lower} failed: ${r.error}` });
        }
      } else if (lower === "host") {
        if (need("usage: host <domain>")) {
          const r = await dns({ data: { domain: target, type: "A" } });
          if (r.ok) {
            const out = r.answers.length ? r.answers.map((a) => `${a.name} has address ${a.data}`).join("\n") : `host ${target} not found`;
            append({ kind: "out", text: out });
            success = r.answers.length > 0;
          } else append({ kind: "err", text: `host failed: ${r.error}` });
        }
      } else if (lower === "subs" || lower === "subdomains") {
        if (need("usage: subs <domain>")) {
          const r = await subs({ data: { domain: target } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = r.count > 0; }
          else append({ kind: "err", text: `subs failed: ${r.error}` });
        }
      } else if (lower === "headers") {
        if (need("usage: headers <host>")) {
          const r = await headers({ data: { target } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = true; }
          else append({ kind: "err", text: `headers failed: ${r.error}` });
        }
      } else if (lower === "robots") {
        if (need("usage: robots <host>")) {
          const r = await robots({ data: { target } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = true; }
          else append({ kind: "err", text: `robots failed: ${r.error}` });
        }
      } else if (lower === "wayback") {
        if (need("usage: wayback <host>")) {
          const r = await wayback({ data: { target } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = r.totalSnapshots > 0; }
          else append({ kind: "err", text: `wayback failed: ${r.error}` });
        }
      } else if (lower === "cve") {
        if (need("usage: cve <keyword|CVE-ID>")) {
          const r = await cve({ data: { query: args } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = r.items.length > 0; }
          else append({ kind: "err", text: `cve failed: ${r.error}` });
        }
      } else if (lower === "ip") {
        if (need("usage: ip <host|ipv4>")) {
          const r = await ip({ data: { target } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = true; }
          else append({ kind: "err", text: `ip failed: ${r.error}` });
        }
      } else if (lower === "tls") {
        if (need("usage: tls <host>")) {
          const r = await tls({ data: { target } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = true; }
          else append({ kind: "err", text: `tls failed: ${r.error}` });
        }
      } else if (lower === "methods") {
        if (need("usage: methods <host>")) {
          const r = await methods({ data: { target } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = true; }
          else append({ kind: "err", text: `methods failed: ${r.error}` });
        }
      } else if (lower === "b64") {
        const op = (rest[0] || "").toLowerCase();
        const text = rest.slice(1).join(" ");
        if (op === "encode" && text) { append({ kind: "out", text: btoa(unescape(encodeURIComponent(text))) }); success = true; }
        else if (op === "decode" && text) {
          try { append({ kind: "out", text: decodeURIComponent(escape(atob(text))) }); success = true; }
          catch { append({ kind: "err", text: "invalid base64 input" }); }
        } else append({ kind: "err", text: "usage: b64 encode|decode <text>" });
      } else if (lower === "hash") {
        const algo = (rest[0] || "").toLowerCase();
        const text = rest.slice(1).join(" ");
        if (!text || !["md5", "sha1", "sha256"].includes(algo)) append({ kind: "err", text: "usage: hash md5|sha1|sha256 <text>" });
        else {
          let digest = "";
          if (algo === "md5") digest = md5(text);
          else digest = await webCryptoHash(algo === "sha1" ? "SHA-1" : "SHA-256", text);
          append({ kind: "out", text: `${algo}(${JSON.stringify(text)}) = ${digest}` });
          success = true;
        }
      } else if (lower === "jwt") {
        const token = rest[0];
        if (!token) append({ kind: "err", text: "usage: jwt <token>" });
        else {
          try {
            const j = decodeJwt(token);
            append({ kind: "out", text: `── header ──\n${JSON.stringify(j.header, null, 2)}\n── payload ──\n${JSON.stringify(j.payload, null, 2)}\n── signature ──\n${j.signature || "(empty)"}` });
            success = true;
          } catch (e: any) { append({ kind: "err", text: `jwt decode failed: ${e?.message}` }); }
        }
      } else if (lower === "xor") {
        const params: Record<string, string> = {};
        for (const p of rest) { const [k, ...v] = p.split("="); if (k && v.length) params[k.toLowerCase()] = v.join("="); }
        const key = params.key; const hex = params.hex || params.ciphertext_hex;
        if (!key || !hex) append({ kind: "err", text: "usage: xor key=<k> hex=<hex>" });
        else {
          try {
            const pt = xorHex(hex.replace(/\s+/g, ""), key);
            append({ kind: "out", text: `key="${key}" len=${hex.length / 2}B\nplaintext: ${pt}` });
            success = true;
          } catch (e: any) { append({ kind: "err", text: `xor failed: ${e?.message}` }); }
        }
      } else if (lower === "cvss") {
        const vec = rest[0];
        if (!vec) append({ kind: "err", text: "usage: cvss CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" });
        else {
          const r = cvssBase(vec);
          if (!r) append({ kind: "err", text: "invalid CVSS:3.x vector" });
          else { append({ kind: "out", text: `Vector:  ${vec}\nScore:   ${r.score}\nSeverity:${r.severity}` }); success = true; }
        }
      } else if (lower === "crack") {
        const target = rest[0]?.toLowerCase();
        if (!target) append({ kind: "err", text: "usage: crack <hash> (md5|sha1|sha256 hex)" });
        else {
          let hit: string | null = null;
          for (const w of CRACK_WORDS) {
            const m = md5(w);
            const s1 = await webCryptoHash("SHA-1", w);
            const s256 = await webCryptoHash("SHA-256", w);
            if (m === target || s1 === target || s256 === target) { hit = w; break; }
          }
          if (hit) { append({ kind: "out", text: `Match found: ${target}  →  "${hit}"` }); success = true; }
          else append({ kind: "out", text: `No match in built-in wordlist (${CRACK_WORDS.length} entries).` });
        }
      } else {
        append({ kind: "err", text: `command not found: ${tool}. Type 'help' for available tools.` });
      }
    } catch (e: any) {
      append({ kind: "err", text: `runtime error: ${e?.message ?? "unknown"}` });
    } finally {
      const dt = Math.round(performance.now() - t0);
      recordCommand({ tool: lower, args, success, durationMs: dt, labId: lab.id, moduleId: lab.moduleId });
      pushTranscript(lab.id, { tool: lower, args, success, output: capturedRef.current.join("\n") });
      onCommand(lower, args, success);
      setBusy(false);
      setInput("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <div className="panel relative overflow-hidden terminal-scan">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/40">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--warn)]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]/70" />
          <span className="ml-3 text-xs text-muted-foreground font-mono">student@shadowx-range:~/{lab.slug}</span>
        </div>
        <span className="chip chip-live"><span className="dot-live" /> tracked</span>
      </div>
      <div ref={scrollRef} className="h-[420px] overflow-auto p-4 font-mono text-[13px] leading-relaxed">
        {lines.map((l, i) => (
          <pre key={i} className={
            l.kind === "in" ? "text-[var(--cyan)] whitespace-pre-wrap" :
            l.kind === "err" ? "text-primary whitespace-pre-wrap" :
            l.kind === "sys" ? "text-muted-foreground whitespace-pre-wrap" :
            "text-foreground whitespace-pre-wrap"
          }>{l.text}</pre>
        ))}
        {busy && <div className="text-muted-foreground animate-pulse">…executing</div>}
      </div>
      <form
        className="flex items-center gap-2 px-4 py-3 border-t border-border bg-background/40"
        onSubmit={(e) => { e.preventDefault(); if (!busy) run(input); }}
      >
        <span className="font-mono text-[var(--cyan)]">$</span>
        <input
          ref={inputRef}
          disabled={busy}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const ni = Math.min(history.length - 1, histIdx + 1);
              setHistIdx(ni); setInput(history[ni] ?? "");
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const ni = Math.max(-1, histIdx - 1);
              setHistIdx(ni); setInput(ni === -1 ? "" : history[ni]);
            }
          }}
          placeholder="cve log4j   ·   ip github.com   ·   hash sha256 hello   ·   jwt eyJ..."
          className="flex-1 bg-transparent outline-none font-mono text-sm placeholder:text-muted-foreground/60"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  );
}
