import { Fragment } from "react";
import { ListChecks, Terminal as TerminalIcon, Flag } from "lucide-react";
import type { Lab } from "@/data/labs";

/**
 * LabGuide — minimal 5W1H + step-by-step completion guide.
 * Steps are auto-derived from the lab's own objectives so nothing is duplicated
 * or dumped; only what the student must do to finish THIS lab.
 */
export function LabGuide({ lab }: { lab: Lab }) {
  const why = lab.scenario.split(/(?<=[.!?])\s/)[0] ?? lab.scenario;
  const primaryTool = lab.tools[0] ?? "reference";

  const steps = lab.objectives.map((o) => {
    if (o.type === "command") {
      const cmd = `${o.tool ?? primaryTool}${o.argMatch ? ` ${o.argMatch}` : lab.target ? ` ${lab.target}` : ""}`;
      return { kind: "cmd" as const, label: o.label, cmd, hint: o.hint };
    }
    return { kind: "find" as const, label: o.label, hint: o.hint };
  });

  const w = [
    { k: "What", v: lab.title },
    { k: "Why", v: why },
    { k: "Where", v: lab.target ?? "—" },
    { k: "When", v: `${lab.kind === "challenge" ? "Challenge" : "Guided lab"} · ~${lab.estMinutes}m` },
    { k: "Who", v: "You, as the assessor" },
    { k: "How", v: `Use ${lab.tools.join(", ")} in the terminal, then submit findings.` },
  ];

  return (
    <div className="panel p-4 space-y-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--cyan)] font-mono">
        <ListChecks className="h-3 w-3" /> Lab Guide
      </div>

      <div className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-1 text-[11px]">
        {w.map(({ k, v }) => (
          <Fragment key={k}>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground pt-0.5">{k}</div>
            <div className="text-foreground/90 leading-snug">{v}</div>
          </Fragment>
        ))}
      </div>

      <div className="pt-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1.5">Steps</div>
        <ol className="space-y-1.5">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2 text-[12px] leading-snug">
              <span className="shrink-0 w-5 h-5 rounded bg-[var(--cyan)]/10 border border-[var(--cyan)]/30 text-[var(--cyan)] text-[10px] font-mono flex items-center justify-center">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-foreground/90 flex items-center gap-1.5">
                  {s.kind === "cmd" ? <TerminalIcon className="h-3 w-3 text-[var(--cyan)]" /> : <Flag className="h-3 w-3 text-amber-400" />}
                  {s.label}
                </div>
                {s.kind === "cmd" && (
                  <code className="mt-0.5 inline-block rounded bg-black/40 border border-border px-1.5 py-0.5 font-mono text-[11px] text-[var(--cyan)]">
                    {s.cmd}
                  </code>
                )}
                {s.hint && <div className="mt-0.5 text-[10px] text-muted-foreground">{s.hint}</div>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
