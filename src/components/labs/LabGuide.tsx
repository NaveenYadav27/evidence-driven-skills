import { Fragment } from "react";
import { ListChecks, Terminal as TerminalIcon, Flag, Crosshair, Wrench } from "lucide-react";
import type { Lab } from "@/data/labs";

const TOOL_GUIDE: Record<string, { label: string; purpose: string; usage: string }> = {
  whois: { label: "WHOIS/RDAP", purpose: "registrar, ownership, dates", usage: "whois <domain>" },
  dig: { label: "DNS lookup", purpose: "DNS records", usage: "dig <domain> [type]" },
  nslookup: { label: "DNS lookup", purpose: "DNS records", usage: "nslookup <domain> [type]" },
  headers: { label: "HTTP headers", purpose: "server and security headers", usage: "headers <host>" },
  robots: { label: "robots.txt", purpose: "User-agent and Disallow paths", usage: "robots <host>" },
  tls: { label: "TLS certificate", purpose: "issuer and SAN names", usage: "tls <host>" },
  methods: { label: "HTTP methods", purpose: "allowed/risky verbs", usage: "methods <host>" },
  subs: { label: "Subdomains", purpose: "certificate transparency names", usage: "subs <domain>" },
  wayback: { label: "Wayback", purpose: "historical URLs", usage: "wayback <host>" },
  cve: { label: "CVE search", purpose: "vulnerability IDs", usage: "cve <keyword|CVE-ID>" },
  ip: { label: "IP intelligence", purpose: "IP, ASN, country", usage: "ip <host|ipv4>" },
  cvss: { label: "CVSS", purpose: "risk score/vector", usage: "cvss <CVSS:3.1/...>" },
  crack: { label: "Password crack", purpose: "recover demo hashes", usage: "crack <hash>" },
  hash: { label: "Hash", purpose: "calculate digest", usage: "hash md5|sha1|sha256 <text>" },
  b64: { label: "Base64", purpose: "encode/decode text", usage: "b64 encode|decode <text>" },
  jwt: { label: "JWT decoder", purpose: "inspect token claims", usage: "jwt <token>" },
  xor: { label: "XOR decoder", purpose: "decrypt hex with key", usage: "xor key=<k> hex=<h>" },
  reference: { label: "Reference", purpose: "built-in answer guide for concept labs", usage: "reference <topic>" },
};

function commandFor(tool: string, lab: Lab) {
  const objective = lab.objectives.find((o) => o.type === "command" && o.tool === tool);
  if (objective?.argMatch) return `${tool} ${objective.argMatch}`;
  if (tool === "reference") return `reference ${lab.target ?? lab.title}`;
  return lab.target ? `${tool} ${lab.target}` : TOOL_GUIDE[tool]?.usage ?? tool;
}

/**
 * LabGuide — minimal 5W1H + step-by-step completion guide.
 * Steps are auto-derived from the lab's own objectives so nothing is duplicated
 * or dumped; only what the student must do to finish THIS lab.
 */
export function LabGuide({ lab }: { lab: Lab }) {
  const why = lab.scenario.split(/(?<=[.!?])\s/)[0] ?? lab.scenario;
  const primaryTool = lab.tools[0] ?? "reference";
  const primaryCommand = lab.objectives.find((o) => o.type === "command")
    ? undefined
    : commandFor(primaryTool, lab);

  const steps = lab.objectives.map((o) => {
    if (o.type === "command") {
      const cmd = `${o.tool ?? primaryTool}${o.argMatch ? ` ${o.argMatch}` : lab.target ? ` ${lab.target}` : ""}`;
      return { kind: "cmd" as const, label: o.label, cmd, hint: o.hint };
    }
    return { kind: "find" as const, label: o.label, hint: o.hint };
  });

  const w = [
    { k: "What", v: lab.title },
    { k: "Why", v: why },
    { k: "Target", v: lab.target ?? "—" },
    { k: "When", v: `${lab.kind === "challenge" ? "Challenge" : "Guided lab"} · ~${lab.estMinutes}m` },
    { k: "Who", v: "You, as the assessor" },
    { k: "How", v: primaryCommand ? `Run ${primaryCommand}, then submit findings.` : "Run the listed commands, then submit findings." },
  ];

  return (
    <div className="panel p-4 space-y-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--cyan)] font-mono">
        <ListChecks className="h-3 w-3" /> Lab Guide
      </div>

      <div className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-1 text-[11px]">
        {w.map(({ k, v }) => (
          <Fragment key={k}>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground pt-0.5">{k}</div>
            <div className="text-foreground/90 leading-snug">{v}</div>
          </Fragment>
        ))}
      </div>

      <div className="rounded border border-border bg-black/25 p-2.5 space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
          <Crosshair className="h-3 w-3" /> Exact Target
        </div>
        <code className="block rounded bg-black/40 border border-border px-2 py-1 font-mono text-[11px] text-[var(--cyan)] break-words">
          {lab.target ?? "No external target — use the reference command."}
        </code>
      </div>

      <div className="rounded border border-border bg-black/25 p-2.5 space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
          <Wrench className="h-3 w-3" /> Tool Plan
        </div>
        <div className="space-y-1.5">
          {lab.tools.map((tool) => {
            const guide = TOOL_GUIDE[tool] ?? { label: tool, purpose: "lab tool", usage: `${tool} <target>` };
            return (
              <div key={tool} className="grid grid-cols-[72px_1fr] gap-2 text-[11px] leading-snug">
                <div className="font-mono text-[var(--cyan)]">{tool}</div>
                <div className="min-w-0">
                  <div className="text-foreground/90">{guide.label} — {guide.purpose}</div>
                  <code className="mt-0.5 inline-block max-w-full rounded bg-black/40 border border-border px-1.5 py-0.5 font-mono text-[10px] text-[var(--cyan)] break-words">
                    {commandFor(tool, lab)}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1.5">Steps</div>
        <ol className="space-y-1.5">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2 text-[12px] leading-snug">
              <span className="shrink-0 w-5 h-5 rounded bg-[var(--cyan)]/10 border border-[var(--cyan)]/30 text-[var(--cyan)] text-[10px] font-mono flex items-center justify-center">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-foreground/90 flex items-center gap-1.5">
                  {s.kind === "cmd" ? <TerminalIcon className="h-3 w-3 text-[var(--cyan)]" /> : <Flag className="h-3 w-3 text-amber-400" />}
                  {s.label}
                </div>
                {s.kind === "cmd" && (
                  <code className="mt-0.5 inline-block rounded bg-black/40 border border-border px-1.5 py-0.5 font-mono text-[11px] text-[var(--cyan)]">
                    {s.cmd}
                  </code>
                )}
                {s.hint && <div className="mt-0.5 text-[10px] text-muted-foreground">{s.hint}</div>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
