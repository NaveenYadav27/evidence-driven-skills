"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTelemetry } from "@/lib/telemetry";
import { Check, X, RotateCcw, Trophy } from "lucide-react";

/* ─── Classifier Lab ──────────────────────────────────────────────────── */

interface ClassifyData {
  buckets: { id: string; label: string; hint: string }[];
  items: { id: string; label: string; correct: string }[];
}

export function ClassifyLab({ labId, data }: { labId: string; data: ClassifyData }) {
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const ensureLab = useTelemetry((s) => s.ensureLab);
  const satisfy = useTelemetry((s) => s.satisfyObjective);
  const attempt = useTelemetry((s) => s.attemptObjective);
  useEffect(() => { ensureLab(labId); }, [labId, ensureLab]);

  const allPlaced = data.items.every((i) => placement[i.id]);
  const correctCount = data.items.filter((i) => placement[i.id] === i.correct).length;
  const total = data.items.length;
  const allRight = correctCount === total;

  const onCheck = () => {
    setChecked(true);
    attempt(labId, labId);
    if (allRight) satisfy(labId, labId);
  };
  const onReset = () => { setPlacement({}); setChecked(false); };

  return (
    <div className="panel p-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Items · drag to a bucket</div>
          {data.items.map((item) => {
            const placed = placement[item.id];
            const isRight = checked && placed === item.correct;
            const isWrong = checked && placed && placed !== item.correct;
            return (
              <motion.div
                key={item.id}
                layout
                className={`rounded-md border bg-secondary/30 p-3 flex items-center justify-between gap-3 text-sm
                  ${isRight ? "border-[var(--cyan)]/60 bg-[var(--cyan)]/5" : ""}
                  ${isWrong ? "border-destructive/60 bg-destructive/5" : "border-border"}`}
              >
                <span className="flex-1">{item.label}</span>
                <div className="flex gap-1">
                  {data.buckets.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setPlacement((p) => ({ ...p, [item.id]: b.id }))}
                      className={`text-[10px] font-mono px-2 py-1 rounded border transition
                        ${placed === b.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground/40 text-muted-foreground"}`}
                    >{b.label.split(" ")[0]}</button>
                  ))}
                  {checked && (isRight ? <Check className="h-4 w-4 text-[var(--cyan)]" /> : isWrong ? <X className="h-4 w-4 text-destructive" /> : null)}
                </div>
              </motion.div>
            );
          })}
        </div>
        <aside className="space-y-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Buckets</div>
          {data.buckets.map((b) => (
            <div key={b.id} className="rounded-md border border-border p-3">
              <div className="text-sm font-semibold">{b.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{b.hint}</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1">
                {Object.values(placement).filter((v) => v === b.id).length} placed
              </div>
            </div>
          ))}
        </aside>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground font-mono">
          {checked ? `Score: ${correctCount}/${total}` : `${Object.keys(placement).length}/${total} placed`}
        </div>
        <div className="flex gap-2">
          <button onClick={onReset} className="text-xs px-3 py-1.5 rounded border border-border inline-flex items-center gap-1.5">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button disabled={!allPlaced} onClick={onCheck}
            className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground disabled:opacity-40 font-semibold">
            Check answers
          </button>
        </div>
      </div>
      <AnimatePresence>
        {checked && allRight && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-md border border-[var(--cyan)]/40 bg-[var(--cyan)]/5 px-3 py-2 text-sm inline-flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[var(--cyan)]" /> Objective satisfied — saved to your progress.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Match Lab ───────────────────────────────────────────────────────── */

interface MatchData {
  left: { id: string; label: string }[];
  right: { id: string; label: string }[];
  pairs: Record<string, string>;
}

export function MatchLab({ labId, data }: { labId: string; data: MatchData }) {
  const [selL, setSelL] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const ensureLab = useTelemetry((s) => s.ensureLab);
  const satisfy = useTelemetry((s) => s.satisfyObjective);
  const attempt = useTelemetry((s) => s.attemptObjective);
  useEffect(() => { ensureLab(labId); }, [labId, ensureLab]);

  const pickRight = (rId: string) => {
    if (!selL) return;
    setMatches((m) => ({ ...m, [selL]: rId }));
    setSelL(null);
  };
  const allDone = Object.keys(matches).length === data.left.length;
  const correct = Object.entries(matches).filter(([l, r]) => data.pairs[l] === r).length;
  const allRight = correct === data.left.length;

  return (
    <div className="panel p-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Vulnerability</div>
          {data.left.map((l) => {
            const m = matches[l.id];
            const isRight = checked && m && data.pairs[l.id] === m;
            const isWrong = checked && m && data.pairs[l.id] !== m;
            return (
              <button key={l.id} onClick={() => setSelL(l.id)}
                className={`w-full text-left rounded-md border p-3 text-sm transition
                  ${selL === l.id ? "border-primary bg-primary/5" : "border-border"}
                  ${isRight ? "border-[var(--cyan)]/60 bg-[var(--cyan)]/5" : ""}
                  ${isWrong ? "border-destructive/60 bg-destructive/5" : ""}`}>
                <div>{l.label}</div>
                {m && <div className="mt-1 text-[10px] font-mono text-muted-foreground">→ {data.right.find(r => r.id === m)?.label.slice(0, 40)}…</div>}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Risk statement</div>
          {data.right.map((r) => (
            <button key={r.id} onClick={() => pickRight(r.id)}
              className="w-full text-left rounded-md border border-border p-3 text-sm hover:border-foreground/40 transition">
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground font-mono">
          {checked ? `Score: ${correct}/${data.left.length}` : selL ? "Pick the matching risk →" : `${Object.keys(matches).length}/${data.left.length} matched`}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setMatches({}); setChecked(false); setSelL(null); }}
            className="text-xs px-3 py-1.5 rounded border border-border inline-flex items-center gap-1.5">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button disabled={!allDone} onClick={() => { setChecked(true); attempt(labId, labId); if (allRight) satisfy(labId, labId); }}
            className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground disabled:opacity-40 font-semibold">
            Check
          </button>
        </div>
      </div>
      {checked && allRight && (
        <div className="mt-3 rounded-md border border-[var(--cyan)]/40 bg-[var(--cyan)]/5 px-3 py-2 text-sm inline-flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[var(--cyan)]" /> Perfect mapping — risk thinking locked in.
        </div>
      )}
    </div>
  );
}

/* ─── Decision Simulator Lab ──────────────────────────────────────────── */

interface DecisionData {
  scenarios: {
    id: string;
    ask: string;
    choice: string;
    reasons: { id: string; text: string; correct: boolean }[];
  }[];
}

export function DecisionLab({ labId, data }: { labId: string; data: DecisionData }) {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const ensureLab = useTelemetry((s) => s.ensureLab);
  const satisfy = useTelemetry((s) => s.satisfyObjective);
  const attempt = useTelemetry((s) => s.attemptObjective);
  useEffect(() => { ensureLab(labId); }, [labId, ensureLab]);

  const correct = data.scenarios.filter((s) => {
    const p = picks[s.id]; if (!p) return false;
    return s.reasons.find((r) => r.id === p)?.correct;
  }).length;
  const total = data.scenarios.length;
  const allDone = Object.keys(picks).length === total;
  const allRight = correct === total;

  return (
    <div className="panel p-5 space-y-4">
      {data.scenarios.map((s, i) => {
        const p = picks[s.id];
        return (
          <div key={s.id} className="rounded-md border border-border p-4">
            <div className="text-[10px] font-mono text-muted-foreground mb-1">SCENARIO {i + 1}</div>
            <p className="text-sm">{s.ask}</p>
            <div className="mt-3 space-y-1.5">
              {s.reasons.map((r) => {
                const sel = p === r.id;
                const isRight = checked && sel && r.correct;
                const isWrong = checked && sel && !r.correct;
                const reveal = checked && r.correct;
                return (
                  <button key={r.id} onClick={() => setPicks((x) => ({ ...x, [s.id]: r.id }))}
                    className={`w-full text-left text-sm rounded-md border px-3 py-2 transition flex items-center gap-2
                      ${sel && !checked ? "border-primary bg-primary/5" : "border-border"}
                      ${isRight ? "border-[var(--cyan)]/60 bg-[var(--cyan)]/5" : ""}
                      ${isWrong ? "border-destructive/60 bg-destructive/5" : ""}
                      ${reveal && !sel ? "border-[var(--cyan)]/30" : ""}`}>
                    <span className="flex-1">{r.text}</span>
                    {isRight && <Check className="h-4 w-4 text-[var(--cyan)]" />}
                    {isWrong && <X className="h-4 w-4 text-destructive" />}
                    {reveal && !sel && <span className="text-[10px] text-[var(--cyan)] font-mono">correct</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground font-mono">
          {checked ? `Score: ${correct}/${total}` : `${Object.keys(picks).length}/${total} decided`}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setPicks({}); setChecked(false); }}
            className="text-xs px-3 py-1.5 rounded border border-border inline-flex items-center gap-1.5">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button disabled={!allDone} onClick={() => { setChecked(true); attempt(labId, labId); if (allRight) satisfy(labId, labId); }}
            className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground disabled:opacity-40 font-semibold">
            Submit decisions
          </button>
        </div>
      </div>
      {checked && allRight && (
        <div className="rounded-md border border-[var(--cyan)]/40 bg-[var(--cyan)]/5 px-3 py-2 text-sm inline-flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[var(--cyan)]" /> All authorization calls correct. You won't get knocked-on-the-door.
        </div>
      )}
    </div>
  );
}
