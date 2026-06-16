import { createFileRoute, Link } from "@tanstack/react-router";
import { DAY1_HOURS } from "@/data/day1";
import { useTelemetry } from "@/lib/telemetry";
import { ArrowRight, Clock, Lock, CheckCircle2, Calendar } from "lucide-react";

export const Route = createFileRoute("/day1/")({
  head: () => ({
    meta: [
      { title: "CEH v13 · Week 1 — Foundations & Reconnaissance · ShadowXLab" },
      { name: "description", content: "Week 1 of the ShadowXLab CEH v13 cyber range: 8 mission-driven hours covering Modules 01 + 02 with 27 interactive labs and live recon simulators." },
      { property: "og:title", content: "CEH v13 · Week 1 — Foundations & Reconnaissance" },
      { property: "og:description", content: "Story-driven, lab-driven CEH v13 Week 1. 27 micro-labs, knowledge maps, live WHOIS/DNS/CT/Wayback simulators, evidence-based progress." },
    ],
  }),
  component: Day1Hub,
});

function Day1Hub() {
  const labs = useTelemetry((s) => s.labs);
  const totalLabs = DAY1_HOURS.reduce((a, h) => a + h.labs.length, 0);
  const doneLabs = DAY1_HOURS.flatMap((h) => h.labs).filter((l) => labs[l.id]?.completedAt || Object.values(labs[l.id]?.objectives ?? {}).some(o => o.satisfied)).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="panel panel-accent p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--cyan)] uppercase tracking-[0.25em]">
          <Calendar className="h-3 w-3" /> Week 1 · 8 Hours · Modules 01 + 02
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2">Foundations &amp; Reconnaissance</h1>
        <p className="mt-3 text-muted-foreground max-w-3xl">
          You're a junior consultant at ShadowX Labs starting a 90-day engagement with Glasshouse Bank. Eight hours of mission-driven training take you from "what even is risk?" all the way to corporate footprinting — every concept paired with an interactive lab, knowledge map, and exam-aligned drill.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-4 text-sm font-mono max-w-md">
          <div><div className="text-2xl">{DAY1_HOURS.length}</div><div className="text-xs text-muted-foreground">hours</div></div>
          <div><div className="text-2xl">{totalLabs}+</div><div className="text-xs text-muted-foreground">labs scaffolded</div></div>
          <div><div className="text-2xl text-[var(--cyan)]">{doneLabs}</div><div className="text-xs text-muted-foreground">your completions</div></div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAY1_HOURS.map((h) => {
          const Icon = h.icon;
          const hourLabsDone = h.labs.filter((l) => Object.values(labs[l.id]?.objectives ?? {}).some(o => o.satisfied)).length;
          const pct = h.labs.length ? Math.round((hourLabsDone / h.labs.length) * 100) : 0;
          const isAvail = h.status === "available";
          return isAvail ? (
            <Link key={h.hour} to="/day1/$hour" params={{ hour: h.slug }}
              className="panel p-5 hover:border-[var(--cyan)]/50 transition group">
              <HourCard h={h} Icon={Icon} pct={pct} hourLabsDone={hourLabsDone} avail />
            </Link>
          ) : (
            <div key={h.hour} className="panel p-5 opacity-60 cursor-not-allowed">
              <HourCard h={h} Icon={Icon} pct={pct} hourLabsDone={hourLabsDone} avail={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HourCard({ h, Icon, pct, hourLabsDone, avail }: any) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-md border border-border bg-secondary/40 p-2.5">
            <Icon className="h-5 w-5 text-[var(--cyan)]" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Hour {h.hour}</div>
            <div className="font-semibold mt-0.5">{h.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{h.subtitle}</div>
          </div>
        </div>
        {avail ? (
          pct === 100
            ? <CheckCircle2 className="h-5 w-5 text-[var(--cyan)] shrink-0" />
            : <ArrowRight className="h-5 w-5 text-[var(--cyan)] shrink-0 group-hover:translate-x-1 transition" />
        ) : <Lock className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{h.estMinutes}m</span>
          {avail && <span>{h.labs.length} labs</span>}
        </div>
        {avail
          ? <span className="font-mono text-[var(--cyan)]">{hourLabsDone}/{h.labs.length} · {pct}%</span>
          : <span className="chip">Phase 2</span>}
      </div>
      {avail && (
        <div className="mt-2 h-1 rounded bg-secondary overflow-hidden">
          <div className="h-full bg-[var(--cyan)] transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
    </>
  );
}
