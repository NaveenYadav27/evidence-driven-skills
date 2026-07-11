import { useState } from "react";
import { Trophy, Check, X, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { getModuleChallenges, checkAnswer, isSolved, recordAttempt, type Challenge } from "@/data/challenges";
import { toast } from "sonner";

export function ChallengesPanel({ moduleId }: { moduleId: string }) {
  const items = getModuleChallenges(moduleId);
  if (!items.length) return <p className="text-sm text-muted-foreground">No challenges yet for this module.</p>;
  const solvedCount = items.filter((c) => isSolved(c.id)).length;

  return (
    <div className="space-y-4">
      <div className="panel panel-accent p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Progress</div>
          <div className="text-lg font-bold">{solvedCount} / {items.length} solved</div>
        </div>
        <Trophy className="h-6 w-6 text-[var(--cyan)]" />
      </div>
      {items.map((ch) => <ChallengeCard key={ch.id} ch={ch} />)}
    </div>
  );
}

function ChallengeCard({ ch }: { ch: Challenge }) {
  const [input, setInput] = useState("");
  const [openHint, setOpenHint] = useState(false);
  const [solved, setSolved] = useState(isSolved(ch.id));
  const [lastWrong, setLastWrong] = useState(false);

  const submit = () => {
    const ok = checkAnswer(ch, input);
    recordAttempt(ch.id, ok);
    if (ok) {
      setSolved(true);
      setLastWrong(false);
      toast.success(`Solved — +${ch.points} XP`, { description: ch.title });
    } else {
      setLastWrong(true);
      toast.error("Not quite", { description: "Check the hint or your syntax." });
    }
  };

  return (
    <div className={`panel p-5 ${solved ? "border-[var(--cyan)]/50" : ""}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="chip chip-red"><Trophy className="h-3 w-3" /> Challenge</span>
          <span className="chip">{ch.difficulty}</span>
          <span className="font-mono text-xs text-muted-foreground">{ch.points} XP</span>
        </div>
        {solved && <span className="chip chip-live"><Check className="h-3 w-3" /> Solved</span>}
      </div>
      <h3 className="font-semibold">{ch.title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{ch.scenario}</p>

      <div className="mt-4 flex gap-2 flex-wrap">
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setLastWrong(false); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Your answer…"
          disabled={solved}
          className={`flex-1 min-w-[220px] rounded-md bg-secondary/50 border px-3 py-2 text-sm font-mono outline-none ${
            lastWrong ? "border-red-500/60" : "border-border focus:border-[var(--cyan)]/60"
          }`}
        />
        <button
          onClick={submit}
          disabled={solved || !input.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          {solved ? "Solved" : "Submit"}
        </button>
      </div>

      <button
        onClick={() => setOpenHint((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <Lightbulb className="h-3 w-3" /> Hint
        {openHint ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {openHint && (
        <p className="mt-2 text-xs text-muted-foreground border-l-2 border-[var(--cyan)]/40 pl-3">{ch.hint}</p>
      )}
      {lastWrong && !solved && (
        <p className="mt-2 text-xs text-red-400 inline-flex items-center gap-1"><X className="h-3 w-3" /> Wrong answer — try a different format or open the hint.</p>
      )}
    </div>
  );
}
