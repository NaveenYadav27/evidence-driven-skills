import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/AdminGuard";
import { listSubmittedForReview, getStudentTicketBundle, reviewTicket } from "@/lib/tickets.functions";
import { getTicket } from "@/data/tickets";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Shield } from "lucide-react";

export const Route = createFileRoute("/admin/review")({
  head: () => ({ meta: [{ title: "Instructor Review · Ops Tickets" }] }),
  component: () => <AdminGuard><ReviewPage /></AdminGuard>,
});

function ReviewPage() {
  const list = useQuery({ queryKey: ["review", "queue"], queryFn: () => listSubmittedForReview() });
  const [selected, setSelected] = useState<{ userId: string; ticketId: string } | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-6">
      <Link to="/admin" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
        <ArrowLeft className="h-3 w-3" /> Admin
      </Link>
      <header className="panel panel-accent p-6">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--cyan)]">
          <Shield className="h-3.5 w-3.5" /> Instructor Review
        </div>
        <h1 className="text-2xl font-bold mt-2">Submitted Tickets</h1>
        <p className="text-sm text-muted-foreground mt-1">Review evidence, decisions, and deliverables. Score 0–100 and leave feedback.</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-4">
          <div className="panel p-3 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">Queue ({list.data?.length ?? 0})</div>
            {(list.data ?? []).map((p: any) => {
              const t = getTicket(p.ticket_id);
              const active = selected?.userId === p.user_id && selected?.ticketId === p.ticket_id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected({ userId: p.user_id, ticketId: p.ticket_id })}
                  className={`w-full text-left rounded border p-2 text-xs ${active ? "border-[var(--cyan)] bg-[var(--cyan)]/5" : "border-border hover:bg-accent"}`}
                >
                  <div className="font-mono text-[10px] text-[var(--cyan)]">{p.ticket_id} · {p.status}</div>
                  <div className="font-semibold truncate">{t?.title ?? p.ticket_id}</div>
                  <div className="text-muted-foreground truncate">{p.profile?.full_name ?? p.profile?.ssid ?? p.user_id.slice(0, 8)}</div>
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>auto {p.auto_score ?? "—"}/100</span>
                    <span>{p.submitted_at ? new Date(p.submitted_at).toLocaleString() : ""}</span>
                  </div>
                </button>
              );
            })}
            {(list.data ?? []).length === 0 && <div className="text-xs text-muted-foreground p-2">Nothing in the review queue.</div>}
          </div>
        </aside>
        <main className="col-span-12 md:col-span-8">
          {selected ? <ReviewDetail userId={selected.userId} ticketId={selected.ticketId} /> : (
            <div className="panel p-6 text-sm text-muted-foreground">Select a ticket on the left.</div>
          )}
        </main>
      </div>
    </div>
  );
}

function ReviewDetail({ userId, ticketId }: { userId: string; ticketId: string }) {
  const qc = useQueryClient();
  const ticket = getTicket(ticketId);
  const bundle = useQuery({
    queryKey: ["review", "bundle", userId, ticketId],
    queryFn: () => getStudentTicketBundle({ data: { userId, ticketId } }),
  });
  const [score, setScore] = useState<number>(70);
  const [feedback, setFeedback] = useState<string>("");

  const m = useMutation({
    mutationFn: reviewTicket,
    onSuccess: () => {
      toast.success("Review saved");
      qc.invalidateQueries({ queryKey: ["review"] });
      setFeedback("");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (!ticket) return <div className="panel p-6 text-sm">Ticket spec missing.</div>;
  if (bundle.isLoading) return <div className="panel p-6 text-sm">Loading…</div>;
  const { progress, evidence, deliverables, lastReview } = bundle.data ?? {};

  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--cyan)]">{ticket.id} · {ticket.category}</div>
        <h2 className="text-lg font-bold">{ticket.title}</h2>
        <div className="mt-2 text-xs text-muted-foreground">
          Auto-score: <span className="text-foreground font-semibold">{progress?.auto_score ?? "—"}/100</span>
          {lastReview && <> · Last instructor score: <span className="text-emerald-400">{lastReview.score}/100</span></>}
        </div>
      </div>

      <div className="panel p-4">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Decisions</div>
        <ul className="space-y-1 text-xs">
          {ticket.steps.filter((s) => s.decision).map((s) => {
            const chosenId = (progress?.decisions as Record<string, string> | undefined ?? {})[s.id];
            const opt = s.decision!.options.find((o) => o.id === chosenId);
            return (
              <li key={s.id}>
                <span className="font-mono text-[10px] text-[var(--cyan)]">{s.id}</span> {s.title}
                <div className={`pl-3 ${opt?.correct ? "text-emerald-400" : "text-red-400"}`}>
                  → {opt?.label ?? <span className="text-muted-foreground">no decision</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="panel p-4">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Evidence ({evidence?.length ?? 0})</div>
        <ul className="space-y-2 text-xs max-h-72 overflow-y-auto">
          {(evidence ?? []).map((e: any) => (
            <li key={e.id} className="border-l-2 border-[var(--cyan)]/40 pl-2">
              <div className="font-mono text-[10px] text-[var(--cyan)]">{e.kind} · {e.step_id}</div>
              {e.label && <div className="font-semibold">{e.label}</div>}
              <div className="text-muted-foreground whitespace-pre-wrap">{e.content?.text}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel p-4">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2"><FileText className="inline h-3 w-3"/> Deliverables</div>
        {(deliverables ?? []).map((d: any) => (
          <div key={d.id} className="mb-3">
            <div className="font-semibold text-sm">{d.title}</div>
            <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground mt-1">{d.body}</pre>
          </div>
        ))}
        {(deliverables ?? []).length === 0 && <div className="text-xs text-muted-foreground">No deliverables submitted.</div>}
      </div>

      {(() => {
        const globalNote = (progress?.notes as Record<string, string> | undefined)?._global;
        return globalNote ? (
          <div className="panel p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Analyst Notes</div>
            <pre className="text-xs whitespace-pre-wrap font-mono">{globalNote}</pre>
          </div>
        ) : null;
      })()}

      <div className="panel panel-accent p-4 space-y-3">
        <div className="font-semibold text-sm">Leave a review</div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground">Score (0–100)</label>
          <Input type="number" min={0} max={100} value={score}
            onChange={(e) => setScore(Math.max(0, Math.min(100, Number(e.target.value))))} className="w-24 text-xs" />
        </div>
        <Textarea
          placeholder="Written feedback…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="text-xs min-h-32"
        />
        <div className="flex justify-end">
          <Button onClick={() => m.mutate({ data: { userId, ticketId, score, feedback } })} disabled={m.isPending}>
            Save review
          </Button>
        </div>
      </div>
    </div>
  );
}
