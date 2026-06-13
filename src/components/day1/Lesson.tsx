"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Background, Controls, ReactFlow, type Node, type Edge, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { HourSpec, KCQuestion, InterviewQ } from "@/data/day1";
import { Check, X, Target, BookOpen, Brain, GraduationCap, MessageSquare, Eye, AlertTriangle, Lightbulb, Trophy, ChevronDown } from "lucide-react";

/* ─── Mission Brief ───────────────────────────────────────────────────── */

export function MissionBrief({ mission }: { mission: HourSpec["mission"] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="panel panel-accent p-6 relative overflow-hidden">
      <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--cyan)] font-mono">{mission.codename}</div>
      <h3 className="text-xl font-bold mt-2 inline-flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Mission Brief</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{mission.brief}</p>
      <div className="mt-4 grid gap-1.5">
        {mission.success.map((s, i) => (
          <div key={i} className="text-xs flex gap-2 items-start">
            <span className="font-mono text-[var(--cyan)] mt-0.5">▸</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Story Panel ─────────────────────────────────────────────────────── */

export function StoryPanel({ story }: { story: HourSpec["story"] }) {
  return (
    <section className="panel p-6">
      <div className="flex items-center gap-2 text-[var(--cyan)] mb-3">
        <BookOpen className="h-4 w-4" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">Story · {story.title}</h3>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {story.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </section>
  );
}

/* ─── Trainer Explanation ─────────────────────────────────────────────── */

export function TrainerExplain({ sections }: { sections: HourSpec["trainer"]["sections"] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-4 w-4 text-[var(--cyan)]" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">Trainer · Core Concepts</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.05 }}
            className="panel p-4">
            <div className="text-sm font-semibold text-[var(--cyan)]">{s.title}</div>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Knowledge Map (React Flow) ──────────────────────────────────────── */

const groupColor: Record<string, string> = {
  asset: "#22d3ee", adv: "#ef4444", weak: "#f59e0b", risk: "#a855f7", ctrl: "#10b981",
  core: "#22d3ee", ethical: "#10b981", ambiguous: "#f59e0b", illegal: "#ef4444",
};

export function KnowledgeMap({ map }: { map: HourSpec["knowledgeMap"] }) {
  const nodes = useMemo<Node[]>(() => map.nodes.map((n, i) => {
    const cols = 4;
    const x = (i % cols) * 220;
    const y = Math.floor(i / cols) * 130;
    const c = groupColor[n.group] ?? "#94a3b8";
    return {
      id: n.id,
      position: { x, y },
      data: { label: (<div style={{ padding: "8px 12px" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: c, textTransform: "uppercase", letterSpacing: 1 }}>{n.group}</div>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{n.label}</div>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, maxWidth: 180 }}>{n.def}</div>
      </div>) },
      style: { background: "rgba(15,23,42,0.9)", border: `1px solid ${c}55`, borderRadius: 8, color: "#fff", width: 200 },
    };
  }), [map.nodes]);

  const edges = useMemo<Edge[]>(() => map.edges.map(([s, t, label], i) => ({
    id: `e${i}`, source: s, target: t, label,
    style: { stroke: "#64748b" }, labelStyle: { fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
  })), [map.edges]);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4 text-[var(--cyan)]" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">Knowledge Map · drag to explore</h3>
      </div>
      <div className="panel p-2 h-[420px]">
        <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }} colorMode="dark">
          <Background gap={20} color="#1e293b" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </section>
  );
}

/* ─── Knowledge Check ─────────────────────────────────────────────────── */

export function KnowledgeCheck({ qs }: { qs: KCQuestion[] }) {
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const correct = qs.filter((q, i) => picks[i] === q.answer).length;
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap className="h-4 w-4 text-[var(--cyan)]" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">Knowledge Check</h3>
      </div>
      <div className="space-y-3">
        {qs.map((q, qi) => (
          <div key={qi} className="panel p-4">
            <div className="text-sm font-medium">{qi + 1}. {q.q}</div>
            <div className="mt-2 grid gap-1.5">
              {q.options.map((o, oi) => {
                const sel = picks[qi] === oi;
                const isRight = checked && oi === q.answer;
                const isWrong = checked && sel && oi !== q.answer;
                return (
                  <button key={oi} onClick={() => setPicks((p) => ({ ...p, [qi]: oi }))}
                    className={`text-left text-sm rounded-md border px-3 py-2 transition flex items-center gap-2
                      ${sel && !checked ? "border-primary bg-primary/5" : "border-border"}
                      ${isRight ? "border-[var(--cyan)]/60 bg-[var(--cyan)]/5" : ""}
                      ${isWrong ? "border-destructive/60 bg-destructive/5" : ""}`}>
                    <span className="font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + oi)}</span>
                    <span className="flex-1">{o}</span>
                    {isRight && <Check className="h-4 w-4 text-[var(--cyan)]" />}
                    {isWrong && <X className="h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {checked && (
              <div className="mt-2 text-xs text-muted-foreground border-l-2 border-[var(--cyan)]/40 pl-2">
                <span className="text-[var(--cyan)] font-semibold">Why:</span> {q.explain}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-muted-foreground font-mono">
          {checked ? `Score: ${correct}/${qs.length}` : `${Object.keys(picks).length}/${qs.length} answered`}
        </div>
        <button disabled={Object.keys(picks).length !== qs.length}
          onClick={() => setChecked(true)}
          className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground disabled:opacity-40 font-semibold">
          Submit
        </button>
      </div>
    </section>
  );
}

/* ─── Challenge ───────────────────────────────────────────────────────── */

export function ChallengeCard({ ch }: { ch: NonNullable<HourSpec["challenge"]> }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <section className="panel panel-accent p-5">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-4 w-4 text-primary" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">{ch.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{ch.brief}</p>
      <button onClick={() => setRevealed((r) => !r)}
        className="mt-3 text-xs px-3 py-1.5 rounded border border-[var(--cyan)]/40 text-[var(--cyan)] inline-flex items-center gap-1.5">
        <ChevronDown className={`h-3 w-3 transition ${revealed ? "rotate-180" : ""}`} />
        {revealed ? "Hide victory criteria" : "Reveal victory criteria"}
      </button>
      {revealed && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="mt-2 text-sm border-l-2 border-[var(--cyan)] pl-3 text-foreground">
          {ch.victory}
        </motion.div>
      )}
    </section>
  );
}

/* ─── Exam Focus ──────────────────────────────────────────────────────── */

export function ExamFocus({ exam }: { exam: HourSpec["exam"] }) {
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm uppercase tracking-wider font-semibold">CEH v13 Exam Focus</h3>
        </div>
        <div className="font-mono text-amber-400 text-sm">{"★".repeat(exam.rating)}{"☆".repeat(5 - exam.rating)}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Frequently tested</div>
          <ul className="space-y-1">{exam.tested.map((t, i) => <li key={i} className="text-xs flex gap-2"><span className="text-[var(--cyan)]">·</span>{t}</li>)}</ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Memory tricks</div>
          <ul className="space-y-1">{exam.mnemonics.map((m, i) => <li key={i} className="text-xs flex gap-2"><span className="text-amber-400">·</span>{m}</li>)}</ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Common traps</div>
          <ul className="space-y-1">{exam.traps.map((t, i) => <li key={i} className="text-xs flex gap-2 text-muted-foreground"><span className="text-destructive">⚠</span>{t}</li>)}</ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Rapid revision</div>
          <ul className="space-y-1">{exam.rapid.map((r, i) => <li key={i} className="text-xs flex gap-2"><span className="text-[var(--cyan)]">▸</span>{r}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

/* ─── Interview Prep ──────────────────────────────────────────────────── */

const levelColor: Record<string, string> = { Junior: "text-emerald-400", Mid: "text-cyan-400", Senior: "text-amber-400", Manager: "text-fuchsia-400" };

export function InterviewPrep({ qs }: { qs: InterviewQ[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-[var(--cyan)]" />
        <h3 className="text-sm uppercase tracking-wider font-semibold">Interview Prep</h3>
      </div>
      <div className="space-y-2">
        {qs.map((q, i) => (
          <div key={i} className="panel p-4">
            <button onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} className="w-full text-left">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono uppercase ${levelColor[q.level]}`}>{q.level}</span>
                <span className="text-sm font-medium flex-1">{q.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${open[i] ? "rotate-180" : ""}`} />
              </div>
            </button>
            {open[i] && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-3 text-sm text-muted-foreground leading-relaxed border-l-2 border-[var(--cyan)]/40 pl-3">
                {q.answer}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
