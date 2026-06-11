import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { whoisLookup, dnsLookup } from "@/lib/recon.functions";
import { useTelemetry } from "@/lib/telemetry";
import type { Lab } from "@/data/labs";

interface Line {
  kind: "in" | "out" | "sys" | "err";
  text: string;
}

const banner = `ShadowXLab :: Cyber Range Terminal v1.3
type 'help' for available commands · commands & outputs are tracked
`;

const HELP = `Available tools (sandbox-safe, real public APIs)
  whois <domain>                — RDAP-based WHOIS lookup
  dig   <domain> [type]         — DNS-over-HTTPS query (A,MX,NS,TXT,AAAA,SOA,CNAME,CAA,SRV)
  nslookup <domain> [type]      — alias of dig
  host  <domain>                — short A/AAAA lookup
  clear                         — clear screen
  help                          — this help`;

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
  const whois = useServerFn(whoisLookup);
  const dns = useServerFn(dnsLookup);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const append = (...l: Line[]) => setLines((prev) => [...prev, ...l]);

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
    const t0 = performance.now();
    let success = false;
    try {
      if (lower === "whois") {
        const domain = rest[0];
        if (!domain) { append({ kind: "err", text: "usage: whois <domain>" }); }
        else {
          const r = await whois({ data: { domain } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = true; }
          else append({ kind: "err", text: `whois failed: ${r.error}` });
        }
      } else if (lower === "dig" || lower === "nslookup") {
        const domain = rest[0];
        const type = rest[1] ?? "A";
        if (!domain) { append({ kind: "err", text: `usage: ${lower} <domain> [type]` }); }
        else {
          const r = await dns({ data: { domain, type } });
          if (r.ok) { append({ kind: "out", text: r.raw }); success = true; }
          else append({ kind: "err", text: `${lower} failed: ${r.error}` });
        }
      } else if (lower === "host") {
        const domain = rest[0];
        if (!domain) { append({ kind: "err", text: "usage: host <domain>" }); }
        else {
          const r = await dns({ data: { domain, type: "A" } });
          if (r.ok) {
            const out = r.answers.length
              ? r.answers.map((a) => `${a.name} has address ${a.data}`).join("\n")
              : `host ${domain} not found`;
            append({ kind: "out", text: out });
            success = r.answers.length > 0;
          } else append({ kind: "err", text: `host failed: ${r.error}` });
        }
      } else {
        append({ kind: "err", text: `command not found: ${tool}. Type 'help' for available tools.` });
      }
    } catch (e: any) {
      append({ kind: "err", text: `runtime error: ${e?.message ?? "unknown"}` });
    } finally {
      const dt = Math.round(performance.now() - t0);
      recordCommand({ tool: lower, args, success, durationMs: dt, labId: lab.id, moduleId: lab.moduleId });
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
          placeholder="whois example.com   ·   dig iana.org mx"
          className="flex-1 bg-transparent outline-none font-mono text-sm placeholder:text-muted-foreground/60"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  );
}
