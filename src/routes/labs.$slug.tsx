import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { getLab, getModuleLabs } from "@/data/labs";
import { MODULES } from "@/data/modules";
import { Terminal } from "@/components/Terminal";
import { LabObjectives } from "@/components/LabObjectives";
import { useTelemetry } from "@/lib/telemetry";
import { useProgress } from "@/lib/progress/engine";
import { ArrowLeft, ArrowRight, Target, Wrench, Clock } from "lucide-react";
import { AccessGuard } from "@/components/AccessGuard";
import { M02LabCoach } from "@/components/modules/m02/LabCoach";

export const Route = createFileRoute("/labs/$slug")({
  loader: ({ params }) => {
    const lab = getLab(params.slug);
    if (!lab) throw notFound();
    const mod = MODULES.find((m) => m.id === lab.moduleId);
    const siblings = getModuleLabs(lab.moduleId);
    const idx = siblings.findIndex((l) => l.id === lab.id);
    const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
    const prev = idx > 0 ? siblings[idx - 1] : null;
    return { lab, moduleSlug: mod?.slug ?? "footprinting-and-reconnaissance", next, prev };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.lab.title} · CEH v13 Cyber Range` },
      { name: "description", content: loaderData?.lab.scenario.slice(0, 160) ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl py-24 px-6 text-center">
      <h1 className="text-2xl font-bold">Lab not found</h1>
      <Link to="/modules" className="text-[var(--cyan)] hover:underline mt-3 inline-block">← Modules</Link>
    </div>
  ),
  component: () => <AccessGuard><LabPage /></AccessGuard>,
});

function LabPage() {
  const { lab, moduleSlug } = Route.useLoaderData();
  const ensureLab = useTelemetry((s) => s.ensureLab);
  const satisfy = useTelemetry((s) => s.satisfyObjective);
  const attempt = useTelemetry((s) => s.attemptObjective);
  const tick = useTelemetry((s) => s.tick);
  // Progress engine bindings
  const pEnsure = useProgress((s) => s.ensureLab);
  const pCmd = useProgress((s) => s.recordLabCommand);
  const pSat = useProgress((s) => s.setObjective);
  const pAttempt = useProgress((s) => s.attemptObjective);
  const pAddTime = useProgress((s) => s.addLabTime);
  const updateSession = useProgress((s) => s.updateSession);
  const tStart = useRef(Date.now());

  useEffect(() => {
    ensureLab(lab.id);
    pEnsure(lab.id, lab.moduleId);
    updateSession({
      lastCourseId: "ceh-v13",
      lastModuleId: lab.moduleId,
      lastLessonId: lab.id,
    });
  }, [lab.id, lab.moduleId, ensureLab, pEnsure, updateSession]);

  // Time-on-lab tracker
  useEffect(() => {
    const i = setInterval(() => {
      tick(5000);
      pAddTime(lab.id, 5000);
    }, 5000);
    const onUnload = () => {
      const delta = Date.now() - tStart.current;
      tick(delta);
      pAddTime(lab.id, delta);
    };
    window.addEventListener("beforeunload", onUnload);
    return () => { clearInterval(i); window.removeEventListener("beforeunload", onUnload); };
  }, [tick, pAddTime, lab.id]);

  const onCommand = (tool: string, args: string, success: boolean) => {
    pCmd(lab.id, tool, args, success);
    // Match command-type objectives.
    for (const o of lab.objectives) {
      if (o.type !== "command") continue;
      if (o.tool && o.tool !== tool) continue;
      attempt(lab.id, o.id);
      pAttempt(lab.id, o.id);
      if (success) {
        const argText = args.toLowerCase();
        if (!o.argMatch || argText.includes(o.argMatch.toLowerCase())) {
          satisfy(lab.id, o.id);
          pSat(lab.id, o.id, true);
        }
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <Link to="/modules/$slug" params={{ slug: moduleSlug }}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-4">
        <ArrowLeft className="h-3 w-3" /> Back to module
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-4">
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="chip chip-red">{lab.kind === "challenge" ? "Challenge" : "Lab"}</span>
              <span className="chip">{lab.difficulty}</span>
              <span className="chip"><Clock className="h-3 w-3" /> ~{lab.estMinutes}m</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{lab.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{lab.scenario}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground"><Target className="h-3 w-3" /> Target</div>
                <div className="font-mono mt-0.5">{lab.target ?? "—"}</div>
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground"><Wrench className="h-3 w-3" /> Tools</div>
                <div className="font-mono mt-0.5">{lab.tools.join(", ")}</div>
              </div>
            </div>
          </div>
          <Terminal lab={lab} onCommand={onCommand} />
          <div className="panel p-4 text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">Tip:</span> Commands are executed against real public infrastructure (RDAP & DNS-over-HTTPS).
            No mock outputs — your results are live. Use <code className="text-[var(--cyan)] font-mono">help</code> in the terminal to see the toolset.
          </div>
        </div>

        <aside className="space-y-4">
          <LabObjectives lab={lab} />
          {lab.moduleId === "m02" && <M02LabCoach labId={lab.id} />}
        </aside>
      </div>
    </div>
  );
}
