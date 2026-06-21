"use client";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, FileText, ScanSearch, Loader2, Trash2, ClipboardCheck, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { Lab } from "@/data/labs";
import { useTelemetry } from "@/lib/telemetry";
import { useLabTranscript, transcriptToPrompt, type TranscriptEntry } from "@/lib/lab-transcript";
import { analyzeLabOutput, generateLabReport, gradeLabFinding } from "@/lib/lab-ai.functions";

const EMPTY_ENTRIES: TranscriptEntry[] = [];

type Tab = "analyst" | "report" | "grader";

export function LabAIPanel({ lab, compact = false }: { lab: Lab; compact?: boolean }) {
  const entriesMap = useLabTranscript((s) => s.byLab);
  const entries = useMemo(() => entriesMap[lab.id] ?? EMPTY_ENTRIES, [entriesMap, lab.id]);
  const clear = useLabTranscript((s) => s.clear);
  const labState = useTelemetry((s) => s.labs[lab.id]);

  const analyze = useServerFn(analyzeLabOutput);
  const report = useServerFn(generateLabReport);
  const grade = useServerFn(gradeLabFinding);

  const [tab, setTab] = useState<Tab>("analyst");
  const [busy, setBusy] = useState<Tab | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [reportMd, setReportMd] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [gradeResult, setGradeResult] = useState<{ pass: boolean; confidence: number; reasoning: string; evidence?: string } | null>(null);

  const transcript = useMemo(() => transcriptToPrompt(entries), [entries]);
  const hasData = entries.length > 0;

  const findingObjectives = useMemo(
    () => lab.objectives.filter((o) => o.type === "finding"),
    [lab.objectives],
  );

  const runAnalysis = async () => {
    if (!hasData) { toast.error("Run a command first — the analyst needs output to read."); return; }
    setBusy("analyst");
    try {
      const r = await analyze({
        data: {
          labId: lab.id,
          labTitle: lab.title,
          scenario: lab.scenario,
          target: lab.target,
          objectives: lab.objectives.map((o) => ({ label: o.label, satisfied: !!labState?.objectives[o.id]?.satisfied })),
          transcript,
        },
      });
      setAnalysis(r.markdown);
    } catch (e: any) {
      toast.error(e?.message ?? "Analysis failed");
    } finally { setBusy(null); }
  };

  const runReport = async () => {
    if (!hasData) { toast.error("No transcript yet — execute some recon commands first."); return; }
    setBusy("report");
    try {
      const r = await report({ data: { labId: lab.id, labTitle: lab.title, target: lab.target, transcript } });
      setReportMd(r.markdown);
    } catch (e: any) {
      toast.error(e?.message ?? "Report failed");
    } finally { setBusy(null); }
  };

  const runGrader = async () => {
    if (!question.trim() || !answer.trim()) { toast.error("Enter both the question and your answer."); return; }
    setBusy("grader");
    setGradeResult(null);
    try {
      const r = await grade({
        data: {
          labId: lab.id,
          labTitle: lab.title,
          target: lab.target,
          question,
          studentAnswer: answer,
          transcript: hasData ? transcript : "(no commands run)",
        },
      });
      setGradeResult({ pass: r.pass, confidence: r.confidence, reasoning: r.reasoning, evidence: r.evidence });
    } catch (e: any) {
      toast.error(e?.message ?? "Grading failed");
    } finally { setBusy(null); }
  };

  const copyMd = async (md: string) => {
    try { await navigator.clipboard.writeText(md); toast.success("Copied to clipboard"); } catch { toast.error("Copy failed"); }
  };

  const TabBtn = ({ id, icon: Icon, label }: { id: Tab; icon: any; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
        tab === id ? "bg-[var(--cyan)]/15 text-[var(--cyan)] border border-[var(--cyan)]/40" : "text-muted-foreground hover:text-foreground border border-transparent"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <div className={`panel ${compact ? "p-4" : "p-5"} space-y-3`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm font-semibold tracking-tight">AI Lab Agent</h3>
          <span className="chip chip-live !py-0 !px-1.5 text-[10px]">{entries.length} {entries.length === 1 ? "cmd" : "cmds"}</span>
        </div>
        <button
          onClick={() => {
            clear(lab.id);
            setAnalysis("");
            setReportMd("");
            setAnswer("");
            setQuestion("");
            setGradeResult(null);
            toast.success("AI agent reset for this lab");
          }}
          title="Clears transcript & AI output for this lab only (local)"
          className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded border border-border px-2 py-1"
        >
          <Trash2 className="h-3 w-3" /> Reset
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <TabBtn id="analyst" icon={ScanSearch} label="Analyst" />
        <TabBtn id="report" icon={FileText} label="Report" />
        <TabBtn id="grader" icon={ClipboardCheck} label="Grader" />
      </div>

      {tab === "analyst" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Summarizes recent lab output: key findings, security signals, and next moves.</p>
          <button onClick={runAnalysis} disabled={busy === "analyst"} className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold disabled:opacity-40">
            {busy === "analyst" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Analyze transcript
          </button>
          {analysis && (
            <div className="rounded-md border border-border bg-black/30 p-3 text-[12px] leading-relaxed whitespace-pre-wrap font-sans max-h-[420px] overflow-auto">
              {analysis}
              <div className="mt-2 flex justify-end">
                <button onClick={() => copyMd(analysis)} className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><Copy className="h-3 w-3" /> copy</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "report" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Generates a full recon brief: inventory, footprint, exposures, recommendations, evidence.</p>
          <button onClick={runReport} disabled={busy === "report"} className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold disabled:opacity-40">
            {busy === "report" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            Generate report
          </button>
          {reportMd && (
            <div className="rounded-md border border-border bg-black/30 p-3 text-[12px] leading-relaxed whitespace-pre-wrap font-mono max-h-[520px] overflow-auto">
              {reportMd}
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => copyMd(reportMd)} className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><Copy className="h-3 w-3" /> copy markdown</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "grader" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Ask the agent to judge a free-text answer against your actual transcript evidence.</p>
          {findingObjectives.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {findingObjectives.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setQuestion(o.label)}
                  className="text-[10px] uppercase tracking-wider font-mono rounded border border-border px-1.5 py-0.5 text-muted-foreground hover:text-[var(--cyan)] hover:border-[var(--cyan)]/40"
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is the primary MX host of iana.org?"
            className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--cyan)]/60"
          />
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            placeholder="Your answer..."
            className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--cyan)]/60"
          />
          <button onClick={runGrader} disabled={busy === "grader"} className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold disabled:opacity-40">
            {busy === "grader" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ClipboardCheck className="h-3.5 w-3.5" />}
            Grade answer
          </button>
          {gradeResult && (
            <div className={`rounded-md border p-3 text-[12px] space-y-1 ${gradeResult.pass ? "border-[var(--success)]/40 bg-[var(--success)]/5" : "border-primary/40 bg-primary/5"}`}>
              <div className="flex items-center gap-2 font-semibold">
                {gradeResult.pass ? <ClipboardCheck className="h-4 w-4 text-[var(--success)]" /> : <AlertTriangle className="h-4 w-4 text-primary" />}
                {gradeResult.pass ? "Correct" : "Not yet"} <span className="text-[10px] font-mono text-muted-foreground ml-auto">conf {(gradeResult.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="text-foreground/90">{gradeResult.reasoning}</div>
              {gradeResult.evidence && <div className="text-muted-foreground font-mono text-[11px]">evidence: {gradeResult.evidence}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
