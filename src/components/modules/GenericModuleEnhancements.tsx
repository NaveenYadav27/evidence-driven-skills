import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, Workflow, Brain, Compass, History, CheckSquare,
  Sparkles, ChevronDown, AlertTriangle,
} from "lucide-react";
import { TermText, Term } from "@/components/modules/m02/Term";
import * as m13 from "@/data/modules/m13";
import * as m14 from "@/data/modules/m14";
import * as m15 from "@/data/modules/m15";
import * as m16 from "@/data/modules/m16";
import * as m17 from "@/data/modules/m17";
import * as m18 from "@/data/modules/m18";
import * as m19 from "@/data/modules/m19";
import * as m20 from "@/data/modules/m20";

export interface ModuleEnhancementData {
  slug: string;
  scenario: {
    client: string;
    assessment: string;
    scope: string;
    available: string[];
    outcome: string;
    why: string;
  };
  workflow: Array<{ tool: string; finding: string; exposure: string; opportunity: string; risk: string; recommendation: string }>;
  framework: Array<{ observation: string; finding: string; exposure: string; opportunity: string; risk: string; recommendation: string }>;
  guided: Array<{ topic: string; look: string; expected: string; mistakes: string; attackers: string; defenders: string }>;
  incidents: Array<{ org: string; method: string; recon: string; impact: string; lesson: string }>;
  deliverables: Array<{ id: string; label: string }>;
  aiActions: Array<{ id: string; label: string; output: string }>;
  workflowTitle?: string;
  incidentsTitle?: string;
}

const pack = (m: any, workflowTitle: string, incidentsTitle: string, key: string): ModuleEnhancementData => ({
  slug: m[`${key}_SLUG`],
  scenario: m[`${key}_SCENARIO`],
  workflow: m[`${key}_WORKFLOW`],
  framework: m[`${key}_ANALYST_FRAMEWORK`],
  guided: m[`${key}_GUIDED`],
  incidents: m[`${key}_INCIDENTS`],
  deliverables: m[`${key}_DELIVERABLES`],
  aiActions: m[`${key}_AI_ACTIONS`],
  workflowTitle,
  incidentsTitle,
});

export const MODULE_ENHANCEMENTS: Record<string, ModuleEnhancementData> = {
  [m13.M13_SLUG]: pack(m13, "Web Server Assessment Workflow", "Real-World Web Server Incidents", "M13"),
  [m14.M14_SLUG]: pack(m14, "Web Application Assessment Workflow", "Real-World Web App Incidents", "M14"),
  [m15.M15_SLUG]: pack(m15, "SQL Injection Workflow", "Real-World SQL Injection Incidents", "M15"),
  [m16.M16_SLUG]: pack(m16, "Wireless Assessment Workflow", "Real-World Wireless Incidents", "M16"),
  [m17.M17_SLUG]: pack(m17, "Mobile Assessment Workflow", "Real-World Mobile Incidents", "M17"),
  [m18.M18_SLUG]: pack(m18, "IoT/OT Assessment Workflow", "Real-World IoT/OT Incidents", "M18"),
  [m19.M19_SLUG]: pack(m19, "Cloud Assessment Workflow", "Real-World Cloud Incidents", "M19"),
  [m20.M20_SLUG]: pack(m20, "Cryptography Assessment Workflow", "Real-World Cryptography Incidents", "M20"),
};

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 text-xs py-1 border-t border-border/40 first:border-0">
      <div className="font-mono uppercase tracking-wider text-[10px] text-muted-foreground pt-0.5">{label}</div>
      <div className={accent ?? "text-muted-foreground"}><TermText>{value}</TermText></div>
    </div>
  );
}

export function GenericModuleEnhancements({ data }: { data: ModuleEnhancementData }) {
  const [openAi, setOpenAi] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const storageKey = `${data.slug}-deliverables-module`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  const toggle = (id: string) => {
    setChecked((c) => {
      const next = { ...c, [id]: !c[id] };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const done = data.deliverables.filter((d) => checked[d.id]).length;

  const scenarioRows: [string, string][] = [
    ["Client", data.scenario.client],
    ["Assessment", data.scenario.assessment],
    ["Scope", data.scenario.scope],
    ["Available Info", data.scenario.available.join(" · ")],
    ["Expected Outcome", data.scenario.outcome],
  ];

  return (
    <div className="space-y-6">
      {/* Scenario */}
      <section className="panel panel-accent p-6">
        <div className="flex items-center gap-2 mb-3 text-[var(--cyan)]">
          <Briefcase className="h-4 w-4" />
          <h3 className="text-sm uppercase tracking-wider font-semibold">Professional Scenario</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-6 gap-y-2 text-sm">
          {scenarioRows.map(([k, v]) => (
            <div key={k} className="contents">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground pt-0.5">{k}</div>
              <div className="text-foreground"><TermText>{v}</TermText></div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-l-2 border-[var(--cyan)]/40 pl-3 text-xs text-muted-foreground leading-relaxed">
          <span className="text-[var(--cyan)] font-semibold">Why this matters · </span><TermText>{data.scenario.why}</TermText>
        </div>
      </section>

      {/* Workflow */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Workflow className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm uppercase tracking-wider font-semibold">{data.workflowTitle ?? "Assessment Workflow"}</h3>
        </div>
        <div className="panel p-4 overflow-x-auto">
          <div className="min-w-[760px] grid grid-cols-6 gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-2">
            <div>Tool</div><div>Finding</div><div>Exposure</div><div>Attack Opportunity</div><div>Risk</div><div>Recommendation</div>
          </div>
          <div className="min-w-[760px] space-y-1.5">
            {data.workflow.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="grid grid-cols-6 gap-2 text-xs items-start border border-border/60 rounded p-2 bg-secondary/20">
                <div className="font-semibold text-[var(--cyan)]"><Term>{r.tool}</Term></div>
                <div className="text-foreground"><TermText>{r.finding}</TermText></div>
                <div className="text-muted-foreground"><TermText>{r.exposure}</TermText></div>
                <div className="text-muted-foreground"><TermText>{r.opportunity}</TermText></div>
                <div className="text-amber-400/90"><TermText>{r.risk}</TermText></div>
                <div className="text-emerald-400/90"><TermText>{r.recommendation}</TermText></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analyst */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm uppercase tracking-wider font-semibold">Analyst Thinking Framework</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Observation → Finding → Exposure → Attack Opportunity → Business Risk → Recommendation.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {data.framework.map((e, i) => (
            <div key={i} className="panel p-4 text-xs space-y-1.5">
              {[
                ["Observation", e.observation, "text-foreground"],
                ["Finding", e.finding, "text-[var(--cyan)]"],
                ["Exposure", e.exposure, "text-muted-foreground"],
                ["Attack Opportunity", e.opportunity, "text-amber-400/90"],
                ["Business Risk", e.risk, "text-destructive"],
                ["Recommendation", e.recommendation, "text-emerald-400/90"],
              ].map(([k, v, cls]) => (
                <div key={k as string} className="grid grid-cols-[140px_1fr] gap-2">
                  <div className="font-mono uppercase tracking-wider text-[10px] text-muted-foreground pt-0.5">{k}</div>
                  <div className={cls as string}><TermText>{v as string}</TermText></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Guided */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Compass className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm uppercase tracking-wider font-semibold">Guided Investigation · Per Technique</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.guided.map((g) => (
            <div key={g.topic} className="panel p-4">
              <div className="text-sm font-semibold text-[var(--cyan)] mb-2">{g.topic}</div>
              <Row label="What to look for" value={g.look} />
              <Row label="Expected findings" value={g.expected} />
              <Row label="Common mistakes" value={g.mistakes} accent="text-amber-400/90" />
              <Row label="How attackers use it" value={g.attackers} accent="text-destructive/90" />
              <Row label="How defenders mitigate" value={g.defenders} accent="text-emerald-400/90" />
            </div>
          ))}
        </div>
      </section>

      {/* AI Actions */}
      <section className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm uppercase tracking-wider font-semibold">AI-Enhanced Analysis</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Augment your findings. Each action produces a reasoned analyst output you can adapt into your report.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {data.aiActions.map((a) => (
            <button key={a.id} onClick={() => setOpenAi(openAi === a.id ? null : a.id)}
              className={`text-xs px-3 py-1.5 rounded border transition inline-flex items-center gap-1.5 ${
                openAi === a.id ? "border-[var(--cyan)] bg-[var(--cyan)]/10 text-foreground" : "border-border text-muted-foreground hover:border-[var(--cyan)]/40"
              }`}>
              <Sparkles className="h-3 w-3" /> {a.label}
              <ChevronDown className={`h-3 w-3 transition ${openAi === a.id ? "rotate-180" : ""}`} />
            </button>
          ))}
        </div>
        {openAi && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="border-l-2 border-[var(--cyan)] pl-3 text-sm leading-relaxed text-foreground">
            <TermText>{data.aiActions.find((a) => a.id === openAi)?.output ?? ""}</TermText>
          </motion.div>
        )}
      </section>

      {/* Incidents */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm uppercase tracking-wider font-semibold">{data.incidentsTitle ?? "Real-World Incidents"}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.incidents.map((i) => (
            <div key={i.org} className="panel p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <div className="font-semibold text-foreground text-sm">{i.org}</div>
              </div>
              <Row label="Method" value={i.method} />
              <Row label="Recon" value={i.recon} />
              <Row label="Impact" value={i.impact} accent="text-destructive/90" />
              <Row label="Lesson" value={i.lesson} accent="text-emerald-400/90" />
            </div>
          ))}
        </div>
      </section>

      {/* Deliverables */}
      <section className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-[var(--cyan)]" />
            <h3 className="text-sm uppercase tracking-wider font-semibold">Engagement Deliverables</h3>
          </div>
          <div className="text-xs font-mono text-muted-foreground">{done} / {data.deliverables.length}</div>
        </div>
        <div className="h-1 w-full rounded bg-secondary/60 overflow-hidden mb-3">
          <div className="h-full bg-[var(--cyan)] transition-all" style={{ width: `${(done / data.deliverables.length) * 100}%` }} />
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {data.deliverables.map((d) => {
            const isOn = !!checked[d.id];
            return (
              <li key={d.id}>
                <button onClick={() => toggle(d.id)}
                  className={`w-full text-left text-sm flex items-start gap-2 rounded border px-3 py-2 transition ${
                    isOn ? "border-[var(--cyan)]/50 bg-[var(--cyan)]/5 text-foreground" : "border-border text-muted-foreground hover:border-[var(--cyan)]/30"
                  }`}>
                  <span className={`mt-0.5 inline-grid place-content-center h-4 w-4 rounded-sm border ${isOn ? "border-[var(--cyan)] bg-[var(--cyan)]/20" : "border-border"}`}>
                    {isOn && <span className="block h-2 w-2 rounded-[1px] bg-[var(--cyan)]" />}
                  </span>
                  <span className={isOn ? "line-through decoration-[var(--cyan)]/60" : ""}>{d.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
