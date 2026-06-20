import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AccessGuard } from "@/components/AccessGuard";
import { ALL_TICKETS } from "@/data/tickets";
import { listMyProgress, getMyXp } from "@/lib/tickets.functions";
import { Ticket as TicketIcon, Clock, Shield, ChevronRight, Award } from "lucide-react";

export const Route = createFileRoute("/ops/")({
  head: () => ({
    meta: [
      { title: "Operations Center · CEH Tickets" },
      { name: "description", content: "Solve real-world cybersecurity tickets mapped to CEH v13, NIST CSF, MITRE ATT&CK." },
    ],
  }),
  component: () => <AccessGuard><OpsQueue /></AccessGuard>,
});

const PRIORITY_COLOR: Record<string, string> = {
  low: "text-muted-foreground border-border",
  medium: "text-amber-400 border-amber-500/40",
  high: "text-orange-400 border-orange-500/40",
  critical: "text-red-400 border-red-500/40",
};
const STATUS_COLOR: Record<string, string> = {
  open: "text-muted-foreground",
  in_progress: "text-[var(--cyan)]",
  submitted: "text-amber-400",
  reviewed: "text-amber-400",
  resolved: "text-emerald-400",
  closed: "text-emerald-400",
};

function OpsQueue() {
  const progress = useQuery({ queryKey: ["ops", "progress"], queryFn: () => listMyProgress() });
  const xp = useQuery({ queryKey: ["ops", "xp"], queryFn: () => getMyXp() });

  const progressById = new Map<string, any>();
  for (const p of progress.data ?? []) progressById.set(p.ticket_id, p);

  const resolved = (progress.data ?? []).filter((p: any) => p.status === "resolved" || p.status === "closed").length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      <header className="panel panel-accent p-6">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--cyan)]">
          <Shield className="h-3.5 w-3.5" /> CEH Operations Center
        </div>
        <h1 className="text-3xl font-bold mt-2 tracking-tight">Ticket Queue</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Every ticket is a real enterprise security task. Collect evidence, make decisions, write deliverables. Instructor reviews and scores your work.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="chip"><Award className="h-3 w-3" /> {xp.data?.total ?? 0} XP</span>
          <span className="chip"><TicketIcon className="h-3 w-3" /> {resolved} resolved</span>
          <span className="chip">{(xp.data?.badges ?? []).length} badges</span>
        </div>
      </header>

      <section className="space-y-3">
        {ALL_TICKETS.map((t) => {
          const p = progressById.get(t.id);
          const status = p?.status ?? "open";
          return (
            <Link
              key={t.id}
              to="/ops/$ticketId"
              params={{ ticketId: t.id }}
              className="block panel p-4 hover:border-[var(--cyan)]/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <span className="text-[var(--cyan)]">{t.id}</span>
                    <span>·</span>
                    <span>{t.ticketTag}</span>
                    <span>·</span>
                    <span>{t.category}</span>
                  </div>
                  <h3 className="font-semibold mt-1">{t.title}</h3>
                  <div className="text-xs text-muted-foreground mt-1">{t.client} · {t.frameworks.ceh.join(" · ")}</div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    <span className={`chip border ${PRIORITY_COLOR[t.priority]}`}>{t.priority.toUpperCase()}</span>
                    <span className="chip"><Clock className="h-3 w-3" /> ~{t.estMinutes} min</span>
                    <span className="chip">{t.difficulty}</span>
                    <span className="chip">{t.xp} XP</span>
                    {(t.frameworks.mitre_attack ?? []).slice(0, 2).map((m) => (
                      <span key={m} className="chip font-mono">{m}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-[11px] font-mono uppercase ${STATUS_COLOR[status]}`}>{status.replace("_", " ")}</div>
                  {typeof p?.auto_score === "number" && (
                    <div className="text-xs mt-1">Auto {Number(p.auto_score).toFixed(0)}/100</div>
                  )}
                  {typeof p?.instructor_score === "number" && (
                    <div className="text-xs mt-0.5 text-emerald-400">Instr {Number(p.instructor_score).toFixed(0)}/100</div>
                  )}
                  <ChevronRight className="h-4 w-4 mt-2 inline" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
