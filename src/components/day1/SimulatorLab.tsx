"use client";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Trophy, Loader2, Terminal as TerminalIcon } from "lucide-react";
import { useTelemetry } from "@/lib/telemetry";
import {
  whoisLookup, dnsLookup, subdomainEnum, waybackHistory, httpHeaders, robotsScan,
} from "@/lib/recon.functions";

type SimTool = "whois" | "dns" | "subs" | "wayback" | "headers" | "robots";

export interface SimulatorData {
  tool: SimTool;
  defaultTarget: string;
  /** for dns */ dnsType?: string;
  /** human prompt above input */ prompt: string;
  /** what we look for in the raw output to mark objective satisfied */
  successContains?: string[];
  /** minimum result count (subs/wayback) */ minCount?: number;
  /** what learner should observe */ debrief: string;
}

const TOOL_LABEL: Record<SimTool, string> = {
  whois: "WHOIS / RDAP",
  dns: "DNS over HTTPS",
  subs: "Certificate Transparency (crt.sh)",
  wayback: "Wayback Machine",
  headers: "HTTP Header Audit",
  robots: "robots.txt + sitemap.xml",
};

export function SimulatorLab({ labId, data }: { labId: string; data: SimulatorData }) {
  const [target, setTarget] = useState(data.defaultTarget);
  const [type, setType] = useState(data.dnsType ?? "A");
  const [out, setOut] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  const ensureLab = useTelemetry((s) => s.ensureLab);
  const satisfy = useTelemetry((s) => s.satisfyObjective);
  const attempt = useTelemetry((s) => s.attemptObjective);
  const recordCmd = useTelemetry((s) => s.recordCommand);
  useEffect(() => { ensureLab(labId); }, [labId, ensureLab]);

  const whois = useServerFn(whoisLookup);
  const dns = useServerFn(dnsLookup);
  const subs = useServerFn(subdomainEnum);
  const wb = useServerFn(waybackHistory);
  const hdrs = useServerFn(httpHeaders);
  const rob = useServerFn(robotsScan);

  const run = async () => {
    setBusy(true); setOk(false); setOut("");
    const t0 = Date.now();
    attempt(labId, labId);
    try {
      let raw = ""; let success = false; let count = 0;
      switch (data.tool) {
        case "whois": { const r: any = await whois({ data: { domain: target } }); raw = r.raw || r.error || ""; success = !!r.ok; break; }
        case "dns":   { const r: any = await dns({ data: { domain: target, type } }); raw = r.raw || r.error || ""; success = !!r.ok; count = r.answers?.length ?? 0; break; }
        case "subs":  { const r: any = await subs({ data: { domain: target } }); raw = r.raw || r.error || ""; success = !!r.ok; count = r.count ?? 0; break; }
        case "wayback": { const r: any = await wb({ data: { target } }); raw = r.raw || r.error || ""; success = !!r.ok; count = r.totalSnapshots ?? 0; break; }
        case "headers": { const r: any = await hdrs({ data: { target } }); raw = r.raw || r.error || ""; success = !!r.ok; break; }
        case "robots": { const r: any = await rob({ data: { target } }); raw = r.raw || r.error || ""; success = !!r.ok; break; }
      }
      setOut(raw);
      recordCmd({ tool: data.tool, args: target, success, durationMs: Date.now() - t0, labId });
      const containsOk = !data.successContains?.length || data.successContains.every((s) => raw.toLowerCase().includes(s.toLowerCase()));
      const countOk = data.minCount == null || count >= data.minCount;
      if (success && containsOk && countOk) { satisfy(labId, labId); setOk(true); }
    } catch (e: any) {
      setOut(`[error] ${e?.message ?? "failed"}`);
    } finally { setBusy(false); }
  };

  return (
    <div className="panel p-5 space-y-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--cyan)] font-mono">
        <TerminalIcon className="h-3 w-3" /> LIVE SIMULATOR · {TOOL_LABEL[data.tool]}
      </div>
      <p className="text-sm text-muted-foreground">{data.prompt}</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="target.tld"
          className="flex-1 min-w-[200px] rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--cyan)]/60"
        />
        {data.tool === "dns" && (
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="rounded-md border border-border bg-secondary/40 px-2 py-2 text-xs font-mono">
            {["A","AAAA","MX","NS","TXT","SOA","CAA","CNAME"].map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
        <button onClick={run} disabled={busy || !target}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold disabled:opacity-40">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Execute
        </button>
        <button onClick={() => { setOut(""); setOk(false); setTarget(data.defaultTarget); }}
          className="text-xs px-2 py-2 rounded border border-border inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" /></button>
      </div>

      {out && (
        <pre className="rounded-md border border-border bg-black/40 p-3 text-[11px] leading-relaxed font-mono overflow-auto max-h-[420px] whitespace-pre-wrap">{out}</pre>
      )}

      <div className="text-xs text-muted-foreground border-t border-border pt-3">
        <span className="text-[var(--cyan)] font-mono">DEBRIEF ▸</span> {data.debrief}
      </div>

      <AnimatePresence>
        {ok && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-md border border-[var(--cyan)]/40 bg-[var(--cyan)]/5 px-3 py-2 text-sm inline-flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[var(--cyan)]" /> Recon objective satisfied — telemetry recorded.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
