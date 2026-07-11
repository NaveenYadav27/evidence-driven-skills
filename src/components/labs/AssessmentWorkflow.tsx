import { useState } from "react";
import { ChevronDown, Shield, Target, AlertTriangle, Bug, TrendingDown, Eye, Wrench, CheckCircle2, FileText, GitBranch, Building2, Layers, BookOpen } from "lucide-react";
import { getLabWorkflow } from "@/data/labs/workflows";

/**
 * AssessmentWorkflow — renders the CyberOS enterprise assessment lifecycle
 * for any lab that has a workflow entry. Consistent across modules 13–16.
 */
export function AssessmentWorkflow({ labId }: { labId: string }) {
  const wf = getLabWorkflow(labId);
  const [open, setOpen] = useState(true);
  if (!wf) return null;

  return (
    <div className="panel p-4 space-y-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--cyan)] font-mono">
          <Layers className="h-3 w-3" /> Assessment Workflow · {wf.mission}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4 text-xs">
          {/* Enterprise header */}
          <div className="rounded border border-border bg-black/30 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              <Building2 className="h-3 w-3" /> Enterprise Context
            </div>
            <div className="font-mono text-[11px] text-foreground/90">
              <span className="text-[var(--cyan)]">{wf.businessUnit}</span> · Mission {wf.mission}
            </div>
            <p className="text-foreground/85 leading-relaxed">{wf.context}</p>
          </div>

          {/* Objective */}
          <Section icon={<Target className="h-3 w-3" />} label="Assessment Objective">
            <p className="text-foreground/90 leading-relaxed">{wf.objective}</p>
          </Section>

          {/* Assets */}
          <Section icon={<Shield className="h-3 w-3" />} label="Assets In Scope">
            <ul className="space-y-0.5">
              {wf.assets.map((a, i) => (
                <li key={i} className="flex gap-1.5"><span className="text-[var(--cyan)]">▸</span><span className="font-mono text-[11px]">{a}</span></li>
              ))}
            </ul>
          </Section>

          {/* Workflow steps */}
          <Section icon={<GitBranch className="h-3 w-3" />} label="Assessment Workflow">
            <ol className="space-y-1">
              {wf.workflow.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[10px] text-[var(--cyan)] font-mono pt-0.5 w-4">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-foreground/85">{s}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* Findings */}
          <Section icon={<AlertTriangle className="h-3 w-3 text-amber-400" />} label="Typical Findings">
            <ul className="space-y-0.5">
              {wf.findings.map((f, i) => (
                <li key={i} className="flex gap-1.5"><span className="text-amber-400">•</span><span>{f}</span></li>
              ))}
            </ul>
          </Section>

          {/* Exposure / Attack / Risk grid */}
          <div className="grid grid-cols-1 gap-2">
            <Callout tone="amber" icon={<Eye className="h-3 w-3" />} label="Exposure" body={wf.exposure} />
            <Callout tone="red" icon={<Bug className="h-3 w-3" />} label="Attack Opportunity" body={wf.attackOpportunity} />
            <Callout tone="red" icon={<TrendingDown className="h-3 w-3" />} label="Business Risk" body={wf.businessRisk} />
          </div>

          {/* Detection */}
          <Section icon={<Eye className="h-3 w-3 text-emerald-400" />} label="Detection Opportunities">
            <ul className="space-y-0.5">
              {wf.detection.map((d, i) => (
                <li key={i} className="flex gap-1.5"><span className="text-emerald-400">▸</span><span>{d}</span></li>
              ))}
            </ul>
          </Section>

          {/* Recommendations */}
          <Section icon={<Wrench className="h-3 w-3 text-[var(--cyan)]" />} label="Recommendations">
            <ul className="space-y-0.5">
              {wf.recommendations.map((r, i) => (
                <li key={i} className="flex gap-1.5"><span className="text-[var(--cyan)]">✓</span><span>{r}</span></li>
              ))}
            </ul>
          </Section>

          {/* Validation */}
          <Callout tone="emerald" icon={<CheckCircle2 className="h-3 w-3" />} label="Validation" body={wf.validation} />

          {/* Framework mappings */}
          <div className="rounded border border-border bg-black/30 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              <BookOpen className="h-3 w-3" /> Framework Mappings
            </div>
            <div className="space-y-1.5">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-mono mb-0.5">MITRE ATT&CK</div>
                <div className="flex flex-wrap gap-1">
                  {wf.frameworks.mitre.map((m) => (
                    <span key={m.id} className="inline-flex items-center gap-1 rounded border border-red-400/30 bg-red-400/5 px-1.5 py-0.5 text-[10px] font-mono text-red-300">
                      <span className="font-semibold">{m.id}</span>
                      <span className="text-red-300/70">{m.name}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-mono mb-0.5">Cyber Kill Chain</div>
                <span className="inline-flex rounded border border-amber-400/30 bg-amber-400/5 px-1.5 py-0.5 text-[10px] font-mono text-amber-300">
                  {wf.frameworks.killChain}
                </span>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-mono mb-0.5">NIST CSF</div>
                <div className="flex flex-wrap gap-1">
                  {wf.frameworks.nistCsf.map((n) => (
                    <span key={n} className="inline-flex rounded border border-[var(--cyan)]/30 bg-[var(--cyan)]/5 px-1.5 py-0.5 text-[10px] font-mono text-[var(--cyan)]">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reports */}
          <div className="rounded border border-border bg-black/30 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              <FileText className="h-3 w-3" /> Reports
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-mono mb-0.5">Executive Summary</div>
              <p className="italic text-foreground/85 leading-relaxed">"{wf.reports.executive}"</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-mono mb-0.5">Technical Summary</div>
              <p className="font-mono text-[11px] text-foreground/80 leading-relaxed">{wf.reports.technical}</p>
            </div>
          </div>

          {/* Lessons */}
          <Section icon={<BookOpen className="h-3 w-3" />} label="Lessons Learned">
            <ul className="space-y-0.5">
              {wf.lessons.map((l, i) => (
                <li key={i} className="flex gap-1.5"><span className="text-muted-foreground">—</span><span className="italic text-foreground/80">{l}</span></li>
              ))}
            </ul>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
        {icon} {label}
      </div>
      <div className="pl-1">{children}</div>
    </div>
  );
}

function Callout({ tone, icon, label, body }: { tone: "amber" | "red" | "emerald"; icon: React.ReactNode; label: string; body: string }) {
  const cls = {
    amber: "border-amber-400/30 bg-amber-400/5 text-amber-200",
    red: "border-red-400/30 bg-red-400/5 text-red-200",
    emerald: "border-emerald-400/30 bg-emerald-400/5 text-emerald-200",
  }[tone];
  return (
    <div className={`rounded border ${cls} p-2.5 space-y-1`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono opacity-80">
        {icon} {label}
      </div>
      <p className="leading-relaxed">{body}</p>
    </div>
  );
}
