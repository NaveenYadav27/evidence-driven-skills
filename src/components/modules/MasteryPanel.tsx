import { useMemo } from "react";
import { GraduationCap, BookOpen, Terminal, Trophy, ClipboardCheck, Award } from "lucide-react";
import { useProgress } from "@/lib/progress/engine";
import { getModuleLabs } from "@/data/labs";
import { getAssessment } from "@/data/assessments";
import { getModuleChallenges, getSolves } from "@/data/challenges";

function tier(pct: number): { label: string; color: string } {
  if (pct >= 90) return { label: "Elite", color: "text-[var(--cyan)]" };
  if (pct >= 75) return { label: "Proficient", color: "text-emerald-400" };
  if (pct >= 50) return { label: "Developing", color: "text-yellow-400" };
  if (pct > 0) return { label: "Novice", color: "text-orange-400" };
  return { label: "Not started", color: "text-muted-foreground" };
}

export function MasteryPanel({ moduleId }: { moduleId: string }) {
  const labs = useProgress((s) => s.labs);
  const assessments = useProgress((s) => s.assessments);
  const moduleLabs = getModuleLabs(moduleId);
  const mcqs = getAssessment(moduleId);
  const challenges = getModuleChallenges(moduleId);

  const stats = useMemo(() => {
    const labIds = moduleLabs.map((l) => l.id);
    const labsCompleted = labIds.filter((id) => labs[id]?.status === "completed").length;
    const labPct = labIds.length ? (labsCompleted / labIds.length) * 100 : 0;

    const a = assessments[`assessment-${moduleId}`];
    const assessmentScore = a?.score ?? 0;
    const assessmentDone = a?.status === "passed" || a?.status === "submitted" || a?.status === "failed";

    const solves = getSolves();
    const solved = challenges.filter((c) => solves[c.id]?.solvedAt).length;
    const chPct = challenges.length ? (solved / challenges.length) * 100 : 0;

    // Weighted mastery: labs 50, assessment 30, challenges 20.
    const mastery = Math.round(labPct * 0.5 + assessmentScore * 0.3 + chPct * 0.2);

    return { labsCompleted, labTotal: labIds.length, labPct, assessmentScore, assessmentDone, solved, chTotal: challenges.length, chPct, mastery };
  }, [labs, assessments, moduleId, moduleLabs, challenges]);

  const t = tier(stats.mastery);

  return (
    <div className="space-y-6">
      {/* Overall */}
      <div className="panel panel-accent p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-full border border-border bg-secondary/40 p-4"><Award className={`h-8 w-8 ${t.color}`} /></div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Mastery Score</div>
              <div className="text-4xl font-bold">{stats.mastery}%</div>
              <div className={`text-sm font-semibold ${t.color}`}>{t.label}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Weighting</div>
            <div className="text-xs text-muted-foreground">Labs 50% · Assessment 30% · Challenges 20%</div>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-secondary/40 overflow-hidden">
          <div className="h-full bg-[var(--cyan)] transition-all" style={{ width: `${stats.mastery}%` }} />
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Terminal} label="Labs" value={`${stats.labsCompleted} / ${stats.labTotal}`} pct={stats.labPct} />
        <StatCard icon={ClipboardCheck} label="Assessment" value={stats.assessmentDone ? `${stats.assessmentScore}%` : "—"} pct={stats.assessmentScore} sub={mcqs.length ? `${mcqs.length} MCQs` : ""} />
        <StatCard icon={Trophy} label="Challenges" value={`${stats.solved} / ${stats.chTotal}`} pct={stats.chPct} />
      </div>

      {/* Guidance */}
      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm uppercase tracking-wider font-semibold">Next steps</h3>
        </div>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          {stats.labPct < 100 && <li>• Complete {stats.labTotal - stats.labsCompleted} remaining lab(s) — every objective ships evidence to your engine.</li>}
          {!stats.assessmentDone && mcqs.length > 0 && <li>• Sit the module assessment ({mcqs.length} MCQs, 70% to pass).</li>}
          {stats.assessmentDone && stats.assessmentScore < 70 && <li>• Retake the assessment — review Learn tab explanations first.</li>}
          {stats.solved < stats.chTotal && stats.chTotal > 0 && <li>• Solve {stats.chTotal - stats.solved} remaining challenge(s) for bonus XP.</li>}
          {stats.mastery >= 90 && <li>• You&apos;re Elite on this module. Move to the next module or attempt the challenges again for time-based drills.</li>}
        </ul>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="text-sm uppercase tracking-wider font-semibold">Mastery report</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          This score is computed locally from your lab telemetry, assessment result, and challenge solves — it syncs with your account so re-signing in preserves your standing.
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, pct, sub }: { icon: any; label: string; value: string; pct: number; sub?: string }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase tracking-wider">
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        {sub && <span className="text-[10px] font-mono text-muted-foreground">{sub}</span>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-2 h-1.5 rounded-full bg-secondary/40 overflow-hidden">
        <div className="h-full bg-[var(--cyan)]" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
