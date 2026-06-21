import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, Workflow, Brain, Compass, History, CheckSquare,
  Sparkles, ChevronDown, AlertTriangle,
} from "lucide-react";
import {
  M02_SCENARIO, M02_WORKFLOW, M02_ANALYST_FRAMEWORK, M02_GUIDED,
  M02_INCIDENTS, M02_DELIVERABLES, M02_AI_ACTIONS,
} from "@/data/modules/m02";
import { TermText, Term } from "./Term";

/* ---------- Professional Scenario ---------- */
export function ProfessionalScenario() {
  const rows: [string, string][] = [
    ["Client", M02_SCENARIO.client],
    ["Assessment", M02_SCENARIO.assessment],
    ["Scope", M02_SCENARIO.scope],
    ["Available Info", M02_SCENARIO.available.join(" · ")],
    ["Expected Outcome", M02_SCENARIO.outcome],
  ];
  return (
    <section className="panel panel-accent p-6">
      <div className="flex items-center gap-2 mb-3 text-[var(--cyan)]">
        <Briefcase className="h-4 w-4" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">Professional Scenario</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-6 gap-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground pt-0.5">{k}</div>
            <div className="text-foreground">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-l-2 border-[var(--cyan)]/40 pl-3 text-xs text-muted-foreground leading-relaxed">
        <span className="text-[var(--cyan)] font-semibold">Why this matters · </span>{M02_SCENARIO.why}
      </div>
    </section>
  );
}

/* ---------- Investigation Workflow ---------- */
export function InvestigationWorkflow() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Workflow className="h-4 w-4 text-[var(--cyan)]" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">Investigation Workflow</h3>
      </div>
      <div className="panel p-4 overflow-x-auto">
        <div className="min-w-[760px] grid grid-cols-6 gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-2">
          <div>Tool</div><div>Finding</div><div>Exposure</div><div>Attack Opportunity</div><div>Risk</div><div>Recommendation</div>
        </div>
        <div className="min-w-[760px] space-y-1.5">
          {M02_WORKFLOW.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-6 gap-2 text-xs items-start border border-border/60 rounded p-2 bg-secondary/20"
            >
              <div className="font-semibold text-[var(--cyan)]">{r.tool}</div>
              <div className="text-foreground">{r.finding}</div>
              <div className="text-muted-foreground">{r.exposure}</div>
              <div className="text-muted-foreground">{r.opportunity}</div>
              <div className="text-amber-400/90">{r.risk}</div>
              <div className="text-emerald-400/90">{r.recommendation}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Analyst Thinking ---------- */
export function AnalystThinking() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-[var(--cyan)]" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">Analyst Thinking Framework</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Observation → Finding → Exposure → Attack Opportunity → Business Risk → Recommendation. This is the chain you will repeat for every artefact you collect.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {M02_ANALYST_FRAMEWORK.map((e, i) => (
          <div key={i} className="panel p-4 text-xs space-y-1.5">
            {[
              ["Observation", e.observation, "text-foreground"],
              ["Finding", e.finding, "text-[var(--cyan)]"],
              ["Exposure", e.exposure, "text-muted-foreground"],
              ["Attack Opportunity", e.opportunity, "text-amber-400/90"],
              ["Business Risk", e.risk, "text-destructive"],
              ["Recommendation", e.recommendation, "text-emerald-400/90"],
            ].map(([k, v, cls]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-2">
                <div className="font-mono uppercase tracking-wider text-[10px] text-muted-foreground pt-0.5">{k}</div>
                <div className={cls as string}>{v}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Guided Investigation ---------- */
export function GuidedInvestigation() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Compass className="h-4 w-4 text-[var(--cyan)]" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">Guided Investigation · Per Technique</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {M02_GUIDED.map((g) => (
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
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 text-xs py-1 border-t border-border/40 first:border-0">
      <div className="font-mono uppercase tracking-wider text-[10px] text-muted-foreground pt-0.5">{label}</div>
      <div className={accent ?? "text-muted-foreground"}>{value}</div>
    </div>
  );
}

/* ---------- Real Incidents ---------- */
export function RealIncidents() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-[var(--cyan)]" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">Real-World Reconnaissance Incidents</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {M02_INCIDENTS.map((i) => (
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
  );
}

/* ---------- Deliverable Tracker (localStorage) ---------- */
export function DeliverableTracker({ storageKey = "m02-deliverables" }: { storageKey?: string }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

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

  const done = M02_DELIVERABLES.filter((d) => checked[d.id]).length;

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm uppercase tracking-wider font-semibold">Engagement Deliverables</h3>
        </div>
        <div className="text-xs font-mono text-muted-foreground">{done} / {M02_DELIVERABLES.length}</div>
      </div>
      <div className="h-1 w-full rounded bg-secondary/60 overflow-hidden mb-3">
        <div className="h-full bg-[var(--cyan)] transition-all" style={{ width: `${(done / M02_DELIVERABLES.length) * 100}%` }} />
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {M02_DELIVERABLES.map((d) => {
          const isOn = !!checked[d.id];
          return (
            <li key={d.id}>
              <button
                onClick={() => toggle(d.id)}
                className={`w-full text-left text-sm flex items-start gap-2 rounded border px-3 py-2 transition ${
                  isOn ? "border-[var(--cyan)]/50 bg-[var(--cyan)]/5 text-foreground" : "border-border text-muted-foreground hover:border-[var(--cyan)]/30"
                }`}
              >
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
  );
}

/* ---------- AI-Enhanced Actions (no LLM call; reveals expert-written analysis) ---------- */
export function AiActions() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className="panel p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-[var(--cyan)]" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">AI-Enhanced Analysis</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Augment your investigation. Each action produces a reasoned analyst output you can paste into your report and adapt.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {M02_AI_ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => setOpen(open === a.id ? null : a.id)}
            className={`text-xs px-3 py-1.5 rounded border transition inline-flex items-center gap-1.5 ${
              open === a.id ? "border-[var(--cyan)] bg-[var(--cyan)]/10 text-foreground" : "border-border text-muted-foreground hover:border-[var(--cyan)]/40"
            }`}
          >
            <Sparkles className="h-3 w-3" /> {a.label}
            <ChevronDown className={`h-3 w-3 transition ${open === a.id ? "rotate-180" : ""}`} />
          </button>
        ))}
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-l-2 border-[var(--cyan)] pl-3 text-sm leading-relaxed text-foreground"
        >
          {M02_AI_ACTIONS.find((a) => a.id === open)?.output}
        </motion.div>
      )}
    </section>
  );
}

/* ---------- Full module enhancement block (for modules page) ---------- */
export function M02ModuleEnhancements() {
  return (
    <div className="space-y-6">
      <ProfessionalScenario />
      <InvestigationWorkflow />
      <AnalystThinking />
      <GuidedInvestigation />
      <AiActions />
      <RealIncidents />
      <DeliverableTracker storageKey="m02-deliverables-module" />
    </div>
  );
}

/* ---------- Slim block for the Hour 2 lesson page ---------- */
export function M02LessonEnhancements() {
  return (
    <div className="space-y-6">
      <ProfessionalScenario />
      <InvestigationWorkflow />
      <AnalystThinking />
      <AiActions />
    </div>
  );
}

/* ---------- Compact block for ticket workspace ---------- */
export function M02LabEnhancements({ ticketId }: { ticketId: string }) {
  return (
    <div className="space-y-4">
      <ProfessionalScenario />
      <DeliverableTracker storageKey={`m02-deliverables-${ticketId}`} />
    </div>
  );
}
