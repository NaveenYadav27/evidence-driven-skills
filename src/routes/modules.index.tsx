import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";

import { MODULES } from "@/data/modules";

export const Route = createFileRoute("/modules/")({
  head: () => ({
    meta: [
      { title: "All Modules · CEH v13 Cyber Range" },
      { name: "description", content: "Browse all 20 official CEH v13 modules — from Footprinting to Cryptography. Each module has labs, challenges and assessments." },
    ],
  }),
  component: ModulesPage,
});

function ModulesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="chip chip-red mb-2">Learning Path</div>
        <h1 className="text-3xl sm:text-4xl font-bold">CEH v13 Modules</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Each module includes Learn, Labs, Challenges, Assessment and a Mastery Report. Progress only advances through evidence — tracked commands, validated findings, solved challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((m) => (
          <Link key={m.id} to="/modules/$slug" params={{ slug: m.slug }}
                className="panel panel-accent p-5 group hover:translate-y-[-2px] transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">MODULE {m.number.toString().padStart(2, "0")}</span>
              {m.status === "available"
                ? <span className="chip chip-live"><span className="dot-live" /> Available</span>
                : <span className="chip"><Lock className="h-3 w-3" /> Preview</span>}
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">{m.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{m.short}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {m.tools.slice(0, 4).map((t) => (
                <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-secondary/40 text-muted-foreground">{t}</span>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>{m.labCount} labs · {m.challengeCount} challenges</span>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--cyan)] group-hover:translate-x-1 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}