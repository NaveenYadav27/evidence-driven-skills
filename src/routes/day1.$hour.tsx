import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { DAY1_HOURS, getHour } from "@/data/day1";
import { MissionBrief, StoryPanel, TrainerExplain, KnowledgeMap, KnowledgeCheck, ChallengeCard, ExamFocus, InterviewPrep } from "@/components/day1/Lesson";
import { ClassifyLab, MatchLab, DecisionLab } from "@/components/day1/Labs";
import { SimulatorLab } from "@/components/day1/SimulatorLab";
import { LabVisual } from "@/components/day1/LabVisual";
import { ArrowLeft, ArrowRight, Clock, Terminal, BookOpen, Ticket as TicketIcon } from "lucide-react";
import { MODULES } from "@/data/modules";
import { MODULE_TO_HOURS } from "@/data/day1";
import { useProgress } from "@/lib/progress/engine";
import { ticketsForHour } from "@/data/tickets";
import { M02LessonEnhancements } from "@/components/modules/m02/M02Enhancements";
import { M02_HOUR_SLUGS } from "@/data/modules/m02";

export const Route = createFileRoute("/day1/$hour")({
  loader: ({ params }) => {
    const h = getHour(params.hour);
    if (!h || h.status !== "available") throw notFound();
    return { h };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Hour ${loaderData?.h.hour} · ${loaderData?.h.title} — CEH v13 Week 1` },
      { name: "description", content: loaderData?.h.subtitle ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl py-24 px-6 text-center">
      <h1 className="text-2xl font-bold">Hour not available yet</h1>
      <p className="text-sm text-muted-foreground mt-2">This hour is still in build.</p>
      <Link to="/day1" className="text-[var(--cyan)] hover:underline mt-3 inline-block">← Week 1 hub</Link>
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

  // Engine: track lesson view + time + scroll + resume metadata
  const touchLesson = useProgress((s) => s.touchLesson);
  const addLessonTime = useProgress((s) => s.addLessonTime);
  const setLessonScroll = useProgress((s) => s.setLessonScroll);
  const setLessonViewed = useProgress((s) => s.setLessonViewed);
  const updateSession = useProgress((s) => s.updateSession);
  const lessonId = `week1-hour-${h.slug}`;
  const tStart = useRef(Date.now());

  useEffect(() => {
    touchLesson(lessonId, {
      courseId: "ceh-v13",
      requiredTimeMs: Math.max(60_000, Math.round((h.estMinutes ?? 15) * 60 * 1000 * 0.66)),
    });
    updateSession({ lastCourseId: "ceh-v13", lastLessonId: lessonId });
    const tick = setInterval(() => addLessonTime(lessonId, 5_000), 5_000);
    let lastScroll = 0;
    let scrollT: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      lastScroll = window.scrollY;
      if (scrollT) clearTimeout(scrollT);
      scrollT = setTimeout(() => {
        setLessonScroll(lessonId, lastScroll);
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - window.innerHeight);
        setLessonViewed(lessonId, Math.min(1, (lastScroll + window.innerHeight) / doc.scrollHeight) || 0);
        // also feed viewed as fraction scrolled
        setLessonViewed(lessonId, Math.min(1, lastScroll / max));
      }, 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearInterval(tick);
      window.removeEventListener("scroll", onScroll);
      if (scrollT) clearTimeout(scrollT);
      addLessonTime(lessonId, Date.now() - tStart.current);
    };
  }, [lessonId, h.estMinutes, touchLesson, addLessonTime, setLessonScroll, setLessonViewed, updateSession]);


  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
      <Link to="/day1" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
        <ArrowLeft className="h-3 w-3" /> Week 1 hub
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
        {(() => {
          const moduleId = Object.entries(MODULE_TO_HOURS).find(([, slugs]) => slugs.includes(h.slug))?.[0];
          const mod = moduleId ? MODULES.find((m) => m.id === moduleId) : undefined;
          if (!mod) return null;
          return (
            <Link to="/modules/$slug" params={{ slug: mod.slug }}
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded border border-[var(--cyan)]/40 text-[var(--cyan)] hover:bg-[var(--cyan)]/5">
              <BookOpen className="h-3 w-3" /> Maps to Module {String(mod.number).padStart(2, "0")} · {mod.title}
            </Link>
          );
        })()}
      </header>

      {M02_HOUR_SLUGS.includes(h.slug) && <M02LessonEnhancements />}
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
          {h.labs.map((lab: typeof h.labs[number]) => (
            <div key={lab.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-muted-foreground">{lab.kind.toUpperCase()}</span>
                <h4 className="font-semibold">{lab.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{lab.brief}</p>
              <LabVisual labId={lab.id} />
              {lab.kind === "classify" && <ClassifyLab labId={lab.id} data={lab.data as any} />}
              {lab.kind === "match" && <MatchLab labId={lab.id} data={lab.data as any} />}
              {lab.kind === "decision" && <DecisionLab labId={lab.id} data={lab.data as any} />}
              {lab.kind === "simulator" && <SimulatorLab labId={lab.id} data={lab.data as any} />}
            </div>
          ))}
        </div>
      </section>

      {/* CEH Operations Center — ticket queue for this hour */}
      {(() => {
        const tickets = ticketsForHour(h.slug);
        if (tickets.length === 0) return null;
        return (
          <section className="panel panel-accent p-5">
            <div className="flex items-center gap-2 mb-3">
              <TicketIcon className="h-4 w-4 text-[var(--cyan)]" />
              <h3 className="text-sm uppercase tracking-wider font-semibold">CEH Operations Center · Tickets</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Apply this hour to real enterprise work. Each ticket is graded on evidence, analysis, framework mapping, and recommendations — then reviewed by an instructor.
            </p>
            <ul className="space-y-2">
              {tickets.map((t) => (
                <li key={t.id}>
                  <Link
                    to="/ops/$ticketId"
                    params={{ ticketId: t.id }}
                    className="block rounded border border-border p-3 hover:border-[var(--cyan)]/50"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <span className="text-[var(--cyan)]">{t.id}</span>
                      <span>·</span>
                      <span>{t.category}</span>
                      <span>·</span>
                      <span>{t.priority.toUpperCase()}</span>
                      <span>·</span>
                      <span>{t.xp} XP</span>
                    </div>
                    <div className="font-semibold mt-1 text-sm">{t.title}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

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
