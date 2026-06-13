import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DAY1_HOURS, getHour } from "@/data/day1";
import { MissionBrief, StoryPanel, TrainerExplain, KnowledgeMap, KnowledgeCheck, ChallengeCard, ExamFocus, InterviewPrep } from "@/components/day1/Lesson";
import { ClassifyLab, MatchLab, DecisionLab } from "@/components/day1/Labs";
import { ArrowLeft, ArrowRight, Clock, Terminal } from "lucide-react";

export const Route = createFileRoute("/day1/$hour")({
  loader: ({ params }) => {
    const h = getHour(params.hour);
    if (!h || h.status !== "available") throw notFound();
    return { h };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Hour ${loaderData?.h.hour} · ${loaderData?.h.title} — CEH v13 Day 1` },
      { name: "description", content: loaderData?.h.subtitle ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl py-24 px-6 text-center">
      <h1 className="text-2xl font-bold">Hour not available yet</h1>
      <p className="text-sm text-muted-foreground mt-2">This hour is in Phase 2 of the build.</p>
      <Link to="/day1" className="text-[var(--cyan)] hover:underline mt-3 inline-block">← Day 1 hub</Link>
    </div>
  ),
  component: HourPage,
});

function HourPage() {
  const { h } = Route.useLoaderData();
  const idx = DAY1_HOURS.findIndex((x) => x.slug === h.slug);
  const prev = DAY1_HOURS.slice(0, idx).reverse().find((x) => x.status === "available");
  const next = DAY1_HOURS.slice(idx + 1).find((x) => x.status === "available");
  const Icon = h.icon;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
      <Link to="/day1" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
        <ArrowLeft className="h-3 w-3" /> Day 1 hub
      </Link>

      {/* Header */}
      <header className="panel panel-accent p-6">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--cyan)]">
          <Icon className="h-3.5 w-3.5" /> Hour {h.hour} of 8
        </div>
        <h1 className="text-3xl font-bold mt-2 tracking-tight">{h.title}</h1>
        <div className="text-sm text-muted-foreground mt-1">{h.subtitle}</div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="chip"><Clock className="h-3 w-3" />~{h.estMinutes} min</span>
          <span className="chip"><Terminal className="h-3 w-3" />{h.labs.length} interactive labs</span>
        </div>
        {h.cehObjectives.length > 0 && (
          <div className="mt-4 text-xs text-muted-foreground">
            <span className="font-mono text-[var(--cyan)]">CEH Objectives ▸</span> {h.cehObjectives.join(" · ")}
          </div>
        )}
      </header>

      <MissionBrief mission={h.mission} />
      <StoryPanel story={h.story} />
      <TrainerExplain sections={h.trainer.sections} />
      <KnowledgeMap map={h.knowledgeMap} />

      {/* Labs */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm uppercase tracking-wider font-semibold">Micro Labs</h3>
        </div>
        <div className="space-y-5">
          {h.labs.map((lab) => (
            <div key={lab.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-muted-foreground">{lab.kind.toUpperCase()}</span>
                <h4 className="font-semibold">{lab.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{lab.brief}</p>
              {lab.kind === "classify" && <ClassifyLab labId={lab.id} data={lab.data as any} />}
              {lab.kind === "match" && <MatchLab labId={lab.id} data={lab.data as any} />}
              {lab.kind === "decision" && <DecisionLab labId={lab.id} data={lab.data as any} />}
            </div>
          ))}
        </div>
      </section>

      <KnowledgeCheck qs={h.knowledgeCheck} />
      {h.challenge && <ChallengeCard ch={h.challenge} />}
      <ExamFocus exam={h.exam} />
      <InterviewPrep qs={h.interview} />

      {/* Nav */}
      <div className="flex items-center justify-between pt-6 border-t border-border text-sm">
        {prev
          ? <Link to="/day1/$hour" params={{ hour: prev.slug }} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"><ArrowLeft className="h-3 w-3" /> Hour {prev.hour}: {prev.title}</Link>
          : <span />}
        {next
          ? <Link to="/day1/$hour" params={{ hour: next.slug }} className="text-[var(--cyan)] hover:underline inline-flex items-center gap-1.5">Hour {next.hour}: {next.title} <ArrowRight className="h-3 w-3" /></Link>
          : <Link to="/day1" className="text-[var(--cyan)] hover:underline">Back to hub</Link>}
      </div>
    </div>
  );
}
