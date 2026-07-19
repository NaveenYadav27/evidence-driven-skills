import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen, GitBranch, Building2, Terminal as TerminalIcon, ShieldAlert,
  FlaskConical, ClipboardCheck, FileText, Copy, Check, ArrowRight, Trophy,
  Wrench, Sparkles, ChevronRight, Cpu, Apple,
} from "lucide-react";
import { GFS_TEMPLATE_MODULES, type GfsTemplate } from "@/data/modules/gfs-template-data";
import type { CEHModule } from "@/data/modules";
import { getModuleLabs } from "@/data/labs";
import { AssessmentQuiz } from "@/components/modules/AssessmentQuiz";

const TABS = [
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "diagram", label: "Diagram & Workflow", icon: GitBranch },
  { id: "enterprise", label: "Enterprise (GFS)", icon: Building2 },
  { id: "commands", label: "Commands", icon: TerminalIcon },
  { id: "pitfalls", label: "Pitfalls & Security", icon: ShieldAlert },
  { id: "handson", label: "Hands-On Lab", icon: FlaskConical },
  { id: "assessment", label: "Assessment", icon: ClipboardCheck },
  { id: "summary", label: "Summary", icon: FileText },
] as const;
type TabId = typeof TABS[number]["id"];

export function isGfsTemplateSlug(slug: string): boolean {
  return slug in GFS_TEMPLATE_MODULES;
}

export function GfsSocView({ module: m }: { module: CEHModule }) {
  const data = GFS_TEMPLATE_MODULES[m.slug];
  const [tab, setTab] = useState<TabId>("learn");
  const [activeLesson, setActiveLesson] = useState(data.subLessons[0].id);
  if (!data) return null;

  const lesson = data.subLessons.find((s) => s.id === activeLesson) ?? data.subLessons[0];
  const labs = getModuleLabs(m.id);

  return (
    <div className="mx-auto max-w-[1600px] px-3 sm:px-4 py-6">
      {/* Header banner */}
      <div className="panel panel-accent p-4 sm:p-5 mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            {data.phase.toUpperCase()}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">{data.moduleTitle}</h1>
          <p className="text-xs text-muted-foreground max-w-3xl">{data.subtitle}</p>
        </div>
        <div className="flex gap-4 text-xs font-mono text-muted-foreground">
          <div><span className="text-foreground text-base">{data.subLessons.length}</span> lessons</div>
          <div><span className="text-foreground text-base">{labs.length}</span> labs</div>
          <div><span className="text-foreground text-base">{data.commandsWindows.length + data.commandsKali.length}</span> cmds</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* Sidebar: sub-lessons */}
        <aside className="panel p-3 h-fit lg:sticky lg:top-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground px-2 mb-2">
            {data.phase}
          </div>
          <ul className="space-y-1">
            {data.subLessons.map((sl, i) => (
              <li key={sl.id}>
                <button
                  onClick={() => { setActiveLesson(sl.id); setTab("learn"); }}
                  className={`w-full text-left rounded-md px-2 py-2 text-xs flex items-center gap-2 transition ${
                    activeLesson === sl.id && tab === "learn"
                      ? "bg-[var(--cyan)]/10 border border-[var(--cyan)]/40 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${activeLesson === sl.id ? "bg-[var(--cyan)]" : "bg-muted-foreground/40"}`} />
                  <span className="flex-1">{sl.title}</span>
                  <span className="font-mono text-[9px] opacity-60">{String(i + 1).padStart(2, "0")}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main column */}
        <div>
          {/* Tabs */}
          <div className="border-b border-border flex gap-0.5 overflow-x-auto mb-4">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`px-3 py-2.5 text-xs inline-flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
                  tab === id
                    ? "border-[var(--cyan)] text-foreground bg-secondary/30"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          {tab === "learn" && <LearnTab lesson={lesson} data={data} setLesson={setActiveLesson} />}
          {tab === "diagram" && <DiagramTab data={data} />}
          {tab === "enterprise" && <EnterpriseTab moduleId={m.id} slug={m.slug} />}
          {tab === "commands" && <CommandsTab data={data} />}
          {tab === "pitfalls" && <PitfallsTab data={data} />}
          {tab === "handson" && <HandsOnTab data={data} labsHref={`/labs/${labs[0]?.slug ?? ""}`} hasLabs={labs.length > 0} />}
          {tab === "assessment" && <AssessmentQuiz moduleId={m.id} />}
          {tab === "summary" && <SummaryTab data={data} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tab: Learn ---------------- */
function LearnTab({ lesson, data, setLesson }: { lesson: GfsTemplate["subLessons"][number]; data: GfsTemplate; setLesson: (id: string) => void }) {
  const idx = data.subLessons.findIndex((s) => s.id === lesson.id);
  const next = data.subLessons[idx + 1];
  return (
    <div className="space-y-4">
      <div className="panel p-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cyan)] mb-2">
          Lesson {String(idx + 1).padStart(2, "0")} / {String(data.subLessons.length).padStart(2, "0")}
        </div>
        <h2 className="text-2xl font-bold mb-3">{lesson.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{lesson.body}</p>
        {lesson.bullets && (
          <ul className="mt-4 space-y-2">
            {lesson.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <ChevronRight className="h-4 w-4 text-[var(--cyan)] mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {next && (
        <button onClick={() => setLesson(next.id)}
          className="w-full panel p-4 text-left flex items-center justify-between hover:border-[var(--cyan)]/50 transition">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Next lesson</div>
            <div className="font-semibold text-sm">{next.title}</div>
          </div>
          <ArrowRight className="h-5 w-5 text-[var(--cyan)]" />
        </button>
      )}
    </div>
  );
}

/* ---------------- Tab: Diagram & Workflow ---------------- */
function DiagramTab({ data }: { data: GfsTemplate }) {
  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--cyan)] mb-3">{data.diagram.title}</h3>
        <pre className="font-mono text-[11px] sm:text-xs leading-tight bg-black/40 border border-border rounded p-4 overflow-x-auto text-[var(--cyan)]">
{data.diagram.ascii}
        </pre>
        <p className="text-xs text-muted-foreground italic mt-3">{data.diagram.caption}</p>
      </div>
      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm font-mono uppercase tracking-wider">Enterprise Workflow</h3>
        </div>
        <ol className="space-y-2">
          {data.diagram.workflow.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="font-mono text-xs w-6 h-6 rounded-full border border-[var(--cyan)]/50 text-[var(--cyan)] flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ---------------- Tab: Enterprise (GFS) ---------------- */
function EnterpriseTab({ moduleId, slug }: { moduleId: string; slug: string }) {
  const data = getEnterpriseData(slug);
  if (!data) return <p className="text-sm text-muted-foreground">No enterprise mission authored for module {moduleId}.</p>;
  return (
    <div className="space-y-4">
      <div className="panel panel-accent p-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cyan)] mb-1">Client Engagement</div>
        <h3 className="text-lg font-bold">{data.scenario.client}</h3>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Assessment: </span>{data.scenario.assessment}</div>
          <div><span className="text-muted-foreground">Outcome: </span>{data.scenario.outcome}</div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 border-l-2 border-[var(--cyan)]/40 pl-3">
          <span className="font-semibold text-foreground">Why: </span>{data.scenario.why}
        </p>
      </div>

      <div className="panel p-5">
        <h4 className="text-sm font-mono uppercase tracking-wider mb-3">Engagement Workflow</h4>
        <div className="space-y-3">
          {data.workflow.map((w: any, i: number) => (
            <div key={i} className="border-l-2 border-[var(--cyan)]/40 pl-3">
              <div className="font-semibold text-sm">{w.tool}</div>
              <div className="text-xs text-muted-foreground mt-1"><b className="text-foreground">Finding:</b> {w.finding}</div>
              <div className="text-xs text-muted-foreground"><b className="text-foreground">Risk:</b> {w.risk}</div>
              <div className="text-xs text-muted-foreground"><b className="text-[var(--cyan)]">Rec:</b> {w.recommendation}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel p-5">
        <h4 className="text-sm font-mono uppercase tracking-wider mb-3">Deliverables</h4>
        <ul className="space-y-1.5">
          {data.deliverables.map((d: any) => (
            <li key={d.id} className="flex items-start gap-2 text-sm">
              <Check className="h-3.5 w-3.5 text-[var(--cyan)] mt-1" /><span>{d.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function getEnterpriseData(slug: string) {
  // Lazy-imported to keep bundle graph flat
  switch (slug) {
    case "hacking-wireless-networks":
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return dataM("m16");
    case "hacking-mobile-platforms": return dataM("m17");
    case "iot-hacking": return dataM("m18");
    case "cloud-computing": return dataM("m19");
    case "cryptography": return dataM("m20");
  }
  return null;
}

function dataM(key: "m16" | "m17" | "m18" | "m19" | "m20") {
  // Static require via dynamic import map handled at build time
  const mod = MODMAP[key];
  return mod;
}

// Static static imports so bundler resolves them
import * as M16 from "@/data/modules/m16";
import * as M17 from "@/data/modules/m17";
import * as M18 from "@/data/modules/m18";
import * as M19 from "@/data/modules/m19";
import * as M20 from "@/data/modules/m20";

const MODMAP: Record<string, any> = {
  m16: { scenario: M16.M16_SCENARIO, workflow: M16.M16_WORKFLOW, deliverables: M16.M16_DELIVERABLES },
  m17: { scenario: M17.M17_SCENARIO, workflow: M17.M17_WORKFLOW, deliverables: M17.M17_DELIVERABLES },
  m18: { scenario: M18.M18_SCENARIO, workflow: M18.M18_WORKFLOW, deliverables: M18.M18_DELIVERABLES },
  m19: { scenario: M19.M19_SCENARIO, workflow: M19.M19_WORKFLOW, deliverables: M19.M19_DELIVERABLES },
  m20: { scenario: M20.M20_SCENARIO, workflow: M20.M20_WORKFLOW, deliverables: M20.M20_DELIVERABLES },
};

/* ---------------- Tab: Commands ---------------- */
function CommandsTab({ data }: { data: GfsTemplate }) {
  return (
    <div className="space-y-5">
      {/* KEY TOOLS */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-[var(--cyan)]">
          <Wrench className="h-4 w-4" />
          <h3 className="text-xs font-mono uppercase tracking-[0.2em]">Key Tools</h3>
        </div>
        <div className="space-y-2">
          {data.keyTools.map((t) => (
            <div key={t.name} className="panel p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="font-semibold">{t.name}</div>
                <code className="font-mono text-xs text-[var(--cyan)]">$ {t.cmd}</code>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Traditional Usage</div>
                  <p className="text-xs">{t.traditional}</p>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--cyan)] mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> AI-Powered Evolution
                  </div>
                  <p className="text-xs">{t.aiEvolution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TERMINAL COMMANDS */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-[var(--cyan)]">
          <TerminalIcon className="h-4 w-4" />
          <h3 className="text-xs font-mono uppercase tracking-[0.2em]">Enterprise Terminal Commands</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-center text-xs font-mono uppercase tracking-wider text-muted-foreground border border-border bg-secondary/40 rounded-t py-2 flex items-center justify-center gap-2">
              <Apple className="h-3 w-3" /> Windows Equivalent
            </div>
            <div className="space-y-2 mt-2">
              {data.commandsWindows.map((c, i) => <CommandCard key={i} c={c} tint="windows" />)}
            </div>
          </div>
          <div>
            <div className="text-center text-xs font-mono uppercase tracking-wider text-[var(--cyan)] border border-[var(--cyan)]/40 bg-[var(--cyan)]/5 rounded-t py-2 flex items-center justify-center gap-2">
              <Cpu className="h-3 w-3" /> Kali Linux
            </div>
            <div className="space-y-2 mt-2">
              {data.commandsKali.map((c, i) => <CommandCard key={i} c={c} tint="kali" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommandCard({ c, tint }: { c: GfsTemplate["commandsWindows"][number]; tint: "windows" | "kali" }) {
  const [copied, setCopied] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const border = tint === "kali" ? "border-[var(--cyan)]/30" : "border-border";
  return (
    <div className={`panel p-3 ${border}`}>
      <div className="flex items-start justify-between gap-2">
        <code className={`font-mono text-xs px-2 py-1 rounded bg-black/40 ${tint === "kali" ? "text-[var(--cyan)]" : "text-foreground"}`}>
          {c.cmd}
        </code>
        {c.mitre && <span className="chip text-[10px] shrink-0">MITRE: {c.mitre}</span>}
      </div>
      <p className="text-xs mt-2"><b>Purpose:</b> {c.purpose}</p>
      <p className="text-xs text-muted-foreground"><b className="text-foreground">Expected Output:</b> {c.expected}</p>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => { navigator.clipboard.writeText(c.cmd); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="inline-flex items-center gap-1 text-xs rounded border border-border px-2 py-1 hover:border-[var(--cyan)]/50">
          {copied ? <><Check className="h-3 w-3 text-[var(--cyan)]" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
        </button>
        <button
          onClick={() => setShowExplain((v) => !v)}
          className="inline-flex items-center gap-1 text-xs rounded border border-border px-2 py-1 hover:border-[var(--cyan)]/50">
          <BookOpen className="h-3 w-3" /> Explain
        </button>
      </div>
      {showExplain && (
        <p className="mt-2 text-xs text-muted-foreground border-l-2 border-[var(--cyan)]/40 pl-3">
          Runs in an authorised assessment host only. Purpose: {c.purpose.toLowerCase()} Confirm scope and rules-of-engagement before executing against any GFS asset.
        </p>
      )}
    </div>
  );
}

/* ---------------- Tab: Pitfalls & Security ---------------- */
function PitfallsTab({ data }: { data: GfsTemplate }) {
  return (
    <div className="space-y-3">
      {data.pitfalls.map((p, i) => (
        <div key={i} className="panel p-4 border-l-4 border-red-500/60">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <div className="font-semibold text-sm">{p.mistake}</div>
          </div>
          <div className="text-xs text-muted-foreground grid sm:grid-cols-2 gap-2 mt-2">
            <div><b className="text-red-400">Why it's dangerous: </b>{p.why}</div>
            <div><b className="text-[var(--cyan)]">Fix: </b>{p.fix}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Tab: Hands-On Lab ---------------- */
function HandsOnTab({ data, labsHref, hasLabs }: { data: GfsTemplate; labsHref: string; hasLabs: boolean }) {
  return (
    <div className="space-y-4">
      <div className="panel panel-accent p-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cyan)] mb-1">Guided Exercise</div>
        <h3 className="text-lg font-bold mb-1">{data.handsOn.title}</h3>
        <p className="text-xs text-muted-foreground">Follow the steps in order. Cross-check with the Commands tab as you go.</p>
      </div>
      <div className="panel p-5">
        <h4 className="text-sm font-mono uppercase tracking-wider mb-3">Steps</h4>
        <ol className="space-y-2">
          {data.handsOn.steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="font-mono text-xs w-6 h-6 rounded-full border border-[var(--cyan)]/50 text-[var(--cyan)] flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 pt-3 border-t border-border text-xs">
          <b className="text-[var(--cyan)]">Expected deliverable: </b><span className="text-muted-foreground">{data.handsOn.expected}</span>
        </div>
      </div>
      {hasLabs && (
        <Link to={labsHref} className="panel p-4 flex items-center justify-between hover:border-[var(--cyan)]/50 transition">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-[var(--cyan)]" />
            <div>
              <div className="text-sm font-semibold">Open the interactive lab environment</div>
              <div className="text-xs text-muted-foreground">Full terminal + AI analyst + objectives</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-[var(--cyan)]" />
        </Link>
      )}
    </div>
  );
}

/* ---------------- Tab: Summary ---------------- */
function SummaryTab({ data }: { data: GfsTemplate }) {
  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm font-mono uppercase tracking-wider">Key Points</h3>
        </div>
        <ul className="space-y-2">
          {data.summary.keyPoints.map((k) => (
            <li key={k} className="flex items-start gap-2 text-sm">
              <Check className="h-3.5 w-3.5 text-[var(--cyan)] mt-1 shrink-0" /><span>{k}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="panel p-5 border-l-4 border-yellow-500/60">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="h-4 w-4 text-yellow-400" />
          <h3 className="text-sm font-mono uppercase tracking-wider">CEH v13 Exam Traps</h3>
        </div>
        <ul className="space-y-1.5">
          {data.summary.examTraps.map((t) => (
            <li key={t} className="text-sm">→ {t}</li>
          ))}
        </ul>
      </div>
      <div className="panel panel-accent p-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Up next</div>
          <div className="font-semibold text-sm">{data.summary.nextModule}</div>
        </div>
        <ArrowRight className="h-5 w-5 text-[var(--cyan)]" />
      </div>
    </div>
  );
}
