import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AccessGuard } from "@/components/AccessGuard";
import { getTicket } from "@/data/tickets";
import type { InvestigationStep, DeliverableSpec } from "@/data/tickets/types";
import {
  ensureProgress, getMyProgress, patchProgress,
  addEvidence, listEvidence, deleteEvidence,
  saveDeliverable, listDeliverables,
  submitTicket,
} from "@/lib/tickets.functions";
import {
  ArrowLeft, ChevronRight, ChevronLeft, Plus, Trash2, Check,
  FileText, Shield, ClipboardList, Send, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { M02LabEnhancements } from "@/components/modules/m02/M02Enhancements";
import { M02_HOUR_SLUGS } from "@/data/modules/m02";

export const Route = createFileRoute("/ops/$ticketId")({
  loader: ({ params }) => {
    const t = getTicket(params.ticketId);
    if (!t) throw notFound();
    return { ticketId: params.ticketId };
  },
  head: ({ params }) => {
    const t = getTicket(params.ticketId);
    return { meta: [{ title: `${t?.id} · ${t?.title ?? "Ticket"}` }] };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl py-24 px-6 text-center">
      <h1 className="text-2xl font-bold">Ticket not found</h1>
      <Link to="/ops" className="text-[var(--cyan)] hover:underline mt-3 inline-block">← Back to queue</Link>
    </div>
  ),
  component: () => <AccessGuard><Workspace /></AccessGuard>,
});

function Workspace() {
  const { ticketId } = Route.useLoaderData();
  const ticket = getTicket(ticketId)!;
  const qc = useQueryClient();

  // Ensure progress row exists on mount
  useEffect(() => { ensureProgress({ data: { ticketId } }).catch(() => {}); }, [ticketId]);

  const progress = useQuery({
    queryKey: ["ops", "progress", ticketId],
    queryFn: () => getMyProgress({ data: { ticketId } }),
  });
  const evidence = useQuery({
    queryKey: ["ops", "evidence", ticketId],
    queryFn: () => listEvidence({ data: { ticketId } }),
  });
  const deliverables = useQuery({
    queryKey: ["ops", "deliverables", ticketId],
    queryFn: () => listDeliverables({ data: { ticketId } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["ops", "progress", ticketId] });
    qc.invalidateQueries({ queryKey: ["ops", "evidence", ticketId] });
    qc.invalidateQueries({ queryKey: ["ops", "deliverables", ticketId] });
    qc.invalidateQueries({ queryKey: ["ops", "progress"] });
    qc.invalidateQueries({ queryKey: ["ops", "xp"] });
  };

  const currentStepIdx = progress.data?.current_step ?? 0;
  const decisions = (progress.data?.decisions ?? {}) as Record<string, string>;
  const notes = (progress.data?.notes ?? {}) as Record<string, string>;
  const completedSteps: number[] = progress.data?.completed_steps ?? [];

  const mPatch = useMutation({
    mutationFn: patchProgress,
    onSuccess: invalidate,
  });
  const mSubmit = useMutation({
    mutationFn: submitTicket,
    onSuccess: (res) => {
      invalidate();
      if (res.passed) {
        toast.success(`Submitted — auto-score ${res.score}/100 · +${res.xp} XP`);
      } else {
        toast.warning(`Submitted — auto-score ${res.score}/100 (below ${ticket.passingScore} passing). Instructor will review.`);
      }
    },
    onError: (e: any) => toast.error(e?.message ?? "Submit failed"),
  });

  const step: InvestigationStep | undefined = ticket.steps[currentStepIdx];

  const goStep = (idx: number) => {
    mPatch.mutate({ data: { ticketId, currentStep: idx } });
  };
  const markStepDone = (idx: number) => {
    const cs = Array.from(new Set([...completedSteps, idx])).sort((a, b) => a - b);
    mPatch.mutate({ data: { ticketId, completedSteps: cs } });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <Link to="/ops" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
        <ArrowLeft className="h-3 w-3" /> Back to queue
      </Link>

      <TicketHeader ticket={ticket} progress={progress.data} />

      {M02_HOUR_SLUGS.includes(ticket.hourSlug) && <M02LabEnhancements ticketId={ticketId} />}



      <div className="grid grid-cols-12 gap-6">
        {/* LEFT — step stepper */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="panel p-4 sticky top-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Investigation Workflow
            </div>
            <ol className="space-y-1">
              {ticket.steps.map((s, i) => {
                const done = completedSteps.includes(i);
                const active = i === currentStepIdx;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => goStep(i)}
                      className={`w-full text-left rounded px-2 py-2 text-xs flex items-start gap-2 ${
                        active ? "bg-[var(--cyan)]/10 border border-[var(--cyan)]/40" : "hover:bg-accent"
                      }`}
                    >
                      <span className={`mt-0.5 flex-shrink-0 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                        done ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
                      }`}>{done ? <Check className="h-3 w-3" /> : i + 1}</span>
                      <span className="flex-1">
                        <div className="font-semibold leading-snug">{s.title}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.phase}</div>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
              <div className="text-muted-foreground">Status</div>
              <div className="font-mono text-[var(--cyan)]">{(progress.data?.status ?? "open").replace("_", " ")}</div>
              {typeof progress.data?.auto_score === "number" && (
                <div>Auto-score: <span className="font-semibold">{Number(progress.data.auto_score).toFixed(0)}/100</span></div>
              )}
              {typeof progress.data?.instructor_score === "number" && (
                <div className="text-emerald-400">Instructor: {Number(progress.data.instructor_score).toFixed(0)}/100</div>
              )}
            </div>
          </div>
        </aside>

        {/* CENTER — current step */}
        <main className="col-span-12 lg:col-span-6 space-y-4">
          <AnalystBrief ticket={ticket} />
          {step && (
            <StepPanel
              step={step}
              stepIdx={currentStepIdx}
              total={ticket.steps.length}
              ticketId={ticketId}
              evidence={evidence.data ?? []}
              decisions={decisions}
              onDecision={(stepId, optionId) => {
                mPatch.mutate({
                  data: { ticketId, decisions: { ...decisions, [stepId]: optionId } },
                });
              }}
              onAddEvidence={async (payload) => {
                await addEvidence({ data: { ticketId, stepId: step.id, ...payload } });
                invalidate();
              }}
              onDeleteEvidence={async (id) => {
                await deleteEvidence({ data: { id } });
                invalidate();
              }}
              onPrev={currentStepIdx > 0 ? () => goStep(currentStepIdx - 1) : undefined}
              onNext={currentStepIdx < ticket.steps.length - 1 ? () => { markStepDone(currentStepIdx); goStep(currentStepIdx + 1); } : undefined}
              onComplete={() => markStepDone(currentStepIdx)}
            />
          )}

          <DeliverablesPanel
            ticketId={ticketId}
            specs={ticket.deliverables}
            saved={deliverables.data ?? []}
            onSave={async (kind, title, body) => {
              await saveDeliverable({ data: { ticketId, kind, title, body } });
              invalidate();
              toast.success("Deliverable saved");
            }}
          />

          <SubmitBar
            ticketPassing={ticket.passingScore}
            progress={progress.data}
            onSubmit={() => mSubmit.mutate({ data: { ticketId } })}
            submitting={mSubmit.isPending}
          />
        </main>

        {/* RIGHT — notes + framework rail */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <FrameworkRail ticket={ticket} />
          <NotesPanel
            value={notes._global ?? ""}
            onChange={(v) => mPatch.mutate({ data: { ticketId, notes: { ...notes, _global: v } } })}
          />
          <EvidenceList evidence={evidence.data ?? []} />
        </aside>
      </div>
    </div>
  );
}

/* ─────────────────────── sub-components ─────────────────────── */

function TicketHeader({ ticket, progress }: { ticket: ReturnType<typeof getTicket>; progress: any }) {
  if (!ticket) return null;
  const status = progress?.status ?? "open";
  return (
    <header className="panel panel-accent p-6">
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--cyan)]">
        <Shield className="h-3.5 w-3.5" />
        {ticket.id} · {ticket.ticketTag} · {ticket.category}
      </div>
      <h1 className="text-2xl font-bold mt-2 tracking-tight">{ticket.title}</h1>
      <div className="text-sm text-muted-foreground mt-1">{ticket.client} · {ticket.difficulty} · ~{ticket.estMinutes} min · {ticket.xp} XP</div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        <span className="chip">{ticket.priority.toUpperCase()}</span>
        <span className="chip font-mono">{status.replace("_", " ")}</span>
        {ticket.badge && <span className="chip">🏅 {ticket.badge}</span>}
      </div>
    </header>
  );
}

function AnalystBrief({ ticket }: { ticket: ReturnType<typeof getTicket> }) {
  if (!ticket) return null;
  return (
    <section className="panel p-5">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Analyst Brief</div>
      <p className="text-sm leading-relaxed">{ticket.analystBrief}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {ticket.contextFacts.map((f) => (
          <div key={f.label} className="rounded border border-border p-2">
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</dt>
            <dd className="mt-0.5 font-mono">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function FrameworkRail({ ticket }: { ticket: ReturnType<typeof getTicket> }) {
  if (!ticket) return null;
  const f = ticket.frameworks;
  const rows: [string, string[] | undefined][] = [
    ["CEH", f.ceh], ["NIST CSF", f.nist_csf], ["MITRE ATT&CK", f.mitre_attack],
    ["OWASP", f.owasp], ["ISO 27001", f.iso_27001], ["CIS", f.cis],
    ["PCI DSS", f.pci_dss], ["NIST 800-53", f.nist_800_53], ["Kill Chain", f.kill_chain],
  ];
  return (
    <section className="panel p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Framework Alignment</div>
      <dl className="space-y-2 text-xs">
        {rows.filter(([, v]) => v && v.length).map(([k, v]) => (
          <div key={k}>
            <dt className="text-[10px] uppercase tracking-wider text-[var(--cyan)]">{k}</dt>
            <dd className="mt-0.5 font-mono leading-relaxed">{v!.join(" · ")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function StepPanel(props: {
  step: InvestigationStep;
  stepIdx: number;
  total: number;
  ticketId: string;
  evidence: any[];
  decisions: Record<string, string>;
  onDecision: (stepId: string, optionId: string) => void;
  onAddEvidence: (e: { kind: string; label?: string; content: Record<string, unknown> }) => Promise<void> | void;
  onDeleteEvidence: (id: string) => Promise<void> | void;
  onPrev?: () => void;
  onNext?: () => void;
  onComplete: () => void;
}) {
  const { step, stepIdx, total, evidence, decisions } = props;
  const stepEv = evidence.filter((e) => e.step_id === step.id);
  const choice = decisions[step.id];

  return (
    <section className="panel p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Step {stepIdx + 1} of {total} · {step.phase}
          </div>
          <h2 className="text-lg font-bold mt-1">{step.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{step.objective}</p>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Instructions</div>
        <ul className="space-y-1 text-sm list-disc list-inside marker:text-[var(--cyan)]">
          {step.instructions.map((i, k) => <li key={k}>{i}</li>)}
        </ul>
      </div>

      <div className="rounded border border-border bg-muted/30 p-3 text-xs">
        <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Expected outcome</div>
        <div className="mt-1">{step.expected}</div>
      </div>

      {step.commonMistakes && step.commonMistakes.length > 0 && (
        <div className="rounded border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/>Common mistakes</div>
          <ul className="mt-1 space-y-0.5 list-disc list-inside">{step.commonMistakes.map((m, k) => <li key={k}>{m}</li>)}</ul>
        </div>
      )}

      {step.analystNotes && (
        <div className="rounded border border-[var(--cyan)]/30 bg-[var(--cyan)]/5 p-3 text-xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--cyan)]">Analyst tip</div>
          <div className="mt-1">{step.analystNotes}</div>
        </div>
      )}

      {/* Evidence collector */}
      {step.evidence.length > 0 && (
        <EvidenceCollector
          stepId={step.id}
          requirements={step.evidence}
          existing={stepEv}
          onAdd={props.onAddEvidence}
          onDelete={props.onDeleteEvidence}
        />
      )}

      {/* Decision tree */}
      {step.decision && (
        <DecisionTreePanel
          tree={step.decision}
          chosen={choice}
          onChoose={(id) => props.onDecision(step.id, id)}
        />
      )}

      <div className="flex justify-between pt-2 border-t border-border">
        <Button variant="outline" size="sm" onClick={props.onPrev} disabled={!props.onPrev}>
          <ChevronLeft className="h-3 w-3" /> Prev
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={props.onComplete}>
            <Check className="h-3 w-3" /> Mark step complete
          </Button>
          <Button size="sm" onClick={props.onNext} disabled={!props.onNext}>
            Next step <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function EvidenceCollector({
  stepId, requirements, existing, onAdd, onDelete,
}: {
  stepId: string;
  requirements: { kind: string; label: string; hint?: string; count?: number }[];
  existing: any[];
  onAdd: (e: { kind: string; label?: string; content: Record<string, unknown> }) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}) {
  const [activeKind, setActiveKind] = useState<string>(requirements[0]?.kind ?? "note");
  const [text, setText] = useState("");
  const [label, setLabel] = useState("");

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of existing) m[e.kind] = (m[e.kind] ?? 0) + 1;
    return m;
  }, [existing]);

  const req = requirements.find((r) => r.kind === activeKind);
  const have = counts[activeKind] ?? 0;
  const need = req?.count ?? 1;

  const submit = async () => {
    if (!text.trim()) { toast.error("Evidence body required"); return; }
    await onAdd({ kind: activeKind, label: label.trim() || undefined, content: { text: text.trim() } });
    setText(""); setLabel("");
    toast.success("Evidence saved");
  };

  return (
    <div className="rounded border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Evidence Required (step {stepId})</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {requirements.map((r) => {
          const h = counts[r.kind] ?? 0;
          const n = r.count ?? 1;
          const ok = h >= n;
          return (
            <button
              key={r.kind}
              onClick={() => setActiveKind(r.kind)}
              className={`text-[10px] font-mono px-2 py-1 rounded border ${
                activeKind === r.kind ? "border-[var(--cyan)] text-[var(--cyan)]" : "border-border text-muted-foreground"
              } ${ok ? "bg-emerald-500/10" : ""}`}
            >
              {r.kind.toUpperCase()} {h}/{n} {ok && "✓"}
            </button>
          );
        })}
      </div>
      {req?.hint && <div className="text-[11px] text-muted-foreground">{req.hint}</div>}
      <div className="space-y-2">
        <Input
          placeholder={`Label (optional) — ${req?.label ?? activeKind}`}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="text-xs"
        />
        <Textarea
          placeholder={`Add ${activeKind} (${have}/${need} captured)…`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="text-xs min-h-20"
        />
        <Button size="sm" onClick={submit}><Plus className="h-3 w-3" /> Add evidence</Button>
      </div>

      {existing.length > 0 && (
        <ul className="space-y-1.5 pt-2 border-t border-border">
          {existing.map((e) => (
            <li key={e.id} className="flex items-start gap-2 text-xs">
              <span className="font-mono text-[10px] uppercase text-[var(--cyan)] mt-0.5">{e.kind}</span>
              <div className="flex-1">
                {e.label && <div className="font-semibold">{e.label}</div>}
                <div className="text-muted-foreground whitespace-pre-wrap">{e.content?.text}</div>
              </div>
              <button onClick={() => onDelete(e.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DecisionTreePanel({
  tree, chosen, onChoose,
}: {
  tree: { prompt: string; options: { id: string; label: string; correct?: boolean; finding?: { severity: string; label: string } }[] };
  chosen?: string;
  onChoose: (id: string) => void;
}) {
  const chosenOpt = tree.options.find((o) => o.id === chosen);
  return (
    <div className="rounded border border-[var(--cyan)]/40 bg-[var(--cyan)]/5 p-4 space-y-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--cyan)]">Decision Required</div>
      <div className="text-sm font-semibold">{tree.prompt}</div>
      <div className="space-y-2">
        {tree.options.map((o) => {
          const isChosen = chosen === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChoose(o.id)}
              className={`w-full text-left rounded border p-2 text-xs ${
                isChosen
                  ? o.correct ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10"
                  : "border-border hover:border-[var(--cyan)]/50"
              }`}
            >
              <div className="font-semibold">{o.label}</div>
              {isChosen && o.correct && <div className="text-[11px] text-emerald-400 mt-1">✓ Correct — recorded</div>}
              {isChosen && !o.correct && o.finding && (
                <div className="text-[11px] text-red-400 mt-1">
                  ⚠ Finding ({o.finding.severity}): {o.finding.label}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {chosenOpt && !chosenOpt.correct && (
        <div className="text-[11px] text-muted-foreground">You can revise your decision — only the latest choice counts toward scoring.</div>
      )}
    </div>
  );
}

function DeliverablesPanel({
  ticketId, specs, saved, onSave,
}: {
  ticketId: string;
  specs: DeliverableSpec[];
  saved: any[];
  onSave: (kind: string, title: string, body: string) => Promise<void> | void;
}) {
  return (
    <section className="panel p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-[var(--cyan)]" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Deliverables</h3>
      </div>
      <div className="space-y-4">
        {specs.map((spec) => {
          const existing = saved.find((d) => d.kind === spec.kind);
          return (
            <DeliverableEditor
              key={spec.kind}
              spec={spec}
              existing={existing}
              onSave={(title, body) => onSave(spec.kind, title, body)}
            />
          );
        })}
      </div>
    </section>
  );
}

function DeliverableEditor({
  spec, existing, onSave,
}: {
  spec: DeliverableSpec;
  existing?: { title: string; body: string };
  onSave: (title: string, body: string) => Promise<void> | void;
}) {
  const [title, setTitle] = useState(existing?.title ?? spec.title);
  const [body, setBody] = useState(existing?.body ?? "");
  useEffect(() => {
    if (existing) { setTitle(existing.title); setBody(existing.body); }
  }, [existing?.title, existing?.body]);
  const min = spec.minChars ?? 0;
  const ok = body.length >= min;
  return (
    <div className="rounded border border-border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm">{spec.title}</div>
        <span className={`text-[10px] font-mono ${ok ? "text-emerald-400" : "text-muted-foreground"}`}>
          {body.length}{min ? `/${min}` : ""} chars
        </span>
      </div>
      <div className="text-[11px] text-muted-foreground whitespace-pre-line">{spec.prompt}</div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xs" />
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="text-xs min-h-32 font-mono"
        placeholder="Write the deliverable here…"
      />
      <div className="flex justify-end">
        <Button size="sm" variant={ok ? "default" : "outline"} onClick={() => onSave(title, body)}>
          <Check className="h-3 w-3" /> Save deliverable
        </Button>
      </div>
    </div>
  );
}

function NotesPanel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // debounce save
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);
  useEffect(() => {
    const t = setTimeout(() => { if (v !== value) onChange(v); }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);
  return (
    <section className="panel p-4">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList className="h-3 w-3 text-[var(--cyan)]" />
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Analyst Notes (autosaved)</div>
      </div>
      <Textarea
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="text-xs min-h-40 font-mono"
        placeholder="Observations · Hypotheses · IOCs · Findings · Conclusions · Recommendations · Lessons learned"
      />
    </section>
  );
}

function EvidenceList({ evidence }: { evidence: any[] }) {
  return (
    <section className="panel p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Evidence ({evidence.length})</div>
      {evidence.length === 0 ? (
        <div className="text-xs text-muted-foreground">No evidence yet — collect from each step.</div>
      ) : (
        <ul className="space-y-1 text-xs max-h-64 overflow-y-auto">
          {evidence.map((e) => (
            <li key={e.id} className="border-l-2 border-[var(--cyan)]/40 pl-2">
              <div className="font-mono text-[10px] uppercase text-[var(--cyan)]">{e.kind} · {e.step_id}</div>
              {e.label && <div className="font-semibold">{e.label}</div>}
              <div className="text-muted-foreground truncate">{e.content?.text}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SubmitBar({
  ticketPassing, progress, onSubmit, submitting,
}: {
  ticketPassing: number;
  progress: any;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const submitted = progress?.status === "submitted" || progress?.status === "reviewed" || progress?.status === "resolved";
  return (
    <section className="panel panel-accent p-4 flex items-center justify-between gap-3">
      <div className="text-xs">
        <div className="font-semibold">Ready to submit?</div>
        <div className="text-muted-foreground">
          Passing score: {ticketPassing}/100 · re-submission allowed before instructor review.
        </div>
        {typeof progress?.auto_score === "number" && (
          <div className="mt-1">Last auto-score: <span className="font-bold">{Number(progress.auto_score).toFixed(0)}/100</span></div>
        )}
      </div>
      <Button onClick={onSubmit} disabled={submitting}>
        <Send className="h-3 w-3" /> {submitted ? "Re-submit" : "Submit for review"}
      </Button>
    </section>
  );
}
