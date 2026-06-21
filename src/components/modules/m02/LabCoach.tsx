import { useState } from "react";
import { Lightbulb, Terminal as TerminalIcon, KeyRound, ChevronDown, Eye, EyeOff } from "lucide-react";
import { M02_LAB_COACH } from "@/data/modules/m02-lab-tips";

export function M02LabCoach({ labId }: { labId: string }) {
  const data = M02_LAB_COACH[labId];
  const [open, setOpen] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  if (!data) return null;

  return (
    <div className="panel p-4 space-y-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--cyan)] font-mono">
          <Lightbulb className="h-3 w-3" /> Coach · Tips & Answer Key
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4">
          {/* Tips */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Tips</div>
            <ul className="space-y-1 text-xs text-foreground/90 leading-relaxed">
              {data.tips.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--cyan)]">▸</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Commands */}
          {data.commands.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                <TerminalIcon className="h-3 w-3" /> Suggested commands
              </div>
              <ul className="space-y-1">
                {data.commands.map((c, i) => (
                  <li key={i} className="text-xs">
                    <code className="font-mono text-[var(--cyan)] bg-black/40 border border-border rounded px-1.5 py-0.5">
                      {c.cmd}
                    </code>
                    {c.note && <span className="text-muted-foreground ml-2">— {c.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Answer key */}
          <div className="space-y-2 border-t border-border pt-3">
            <button
              onClick={() => setShowAnswers((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-amber-400/40 bg-amber-400/5 text-amber-300 hover:bg-amber-400/10 transition"
            >
              {showAnswers ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showAnswers ? "Hide answer key" : "Reveal answer key"}
            </button>
            {!showAnswers && (
              <p className="text-[11px] text-muted-foreground/80">
                Try the lab first — answers spoil the learning. Live values are validated against the target regardless.
              </p>
            )}
            {showAnswers && (
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                  <KeyRound className="h-3 w-3" /> Expected values
                </div>
                <ul className="space-y-1.5 text-xs">
                  {data.answers.map((a, i) => (
                    <li key={i} className="grid grid-cols-[110px_1fr] gap-2 items-start">
                      <div className="font-mono uppercase tracking-wider text-[10px] text-muted-foreground pt-0.5">
                        {a.label}
                      </div>
                      <div>
                        <code className="font-mono text-emerald-300 bg-emerald-400/5 border border-emerald-400/20 rounded px-1.5 py-0.5">
                          {a.value}
                        </code>
                        {a.note && <div className="text-[11px] text-muted-foreground/80 mt-0.5">{a.note}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
