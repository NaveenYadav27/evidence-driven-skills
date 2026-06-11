import { useMemo } from "react";
import { useTelemetry } from "@/lib/telemetry";
import { StatTile } from "./StatTile";
import {
  Activity, Bug, CheckCircle2, Clock, Cpu, Flame, Target, Trophy,
} from "lucide-react";
import { MODULES } from "@/data/modules";
import { Link } from "@tanstack/react-router";

function fmtTime(ms: number) {
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function LiveDashboard() {
  const commands = useTelemetry((s) => s.commands);
  const labs = useTelemetry((s) => s.labs);
  const streak = useTelemetry((s) => s.streak);
  const totalTimeMs = useTelemetry((s) => s.totalTimeMs);

  const stats = useMemo(() => {
    const labIds = Object.keys(labs);
    const completed = labIds.filter((id) => labs[id].completedAt).length;
    const started = labIds.length;
    const cmd = commands.length;
    const errors = commands.filter((c) => !c.success).length;
    const successRate = cmd ? Math.round(((cmd - errors) / cmd) * 100) : 0;
    const challengesSolved = labIds.filter((id) => id.includes("challenge") && labs[id].completedAt).length;
    const startedModuleIds = new Set(labIds.map((id) => id.split("-")[1]).filter(Boolean));
    const readiness = Math.min(100, Math.round(completed * 8 + challengesSolved * 12 + successRate * 0.2));
    return { completed, started, commands: cmd, errors, successRate, challengesSolved, startedModuleIds, readiness };
  }, [commands, labs]);

  const mastery = useMemo(() => {
    const byTool: Record<string, { runs: number; ok: number }> = {};
    for (const c of commands) {
      byTool[c.tool] ??= { runs: 0, ok: 0 };
      byTool[c.tool].runs++;
      if (c.success) byTool[c.tool].ok++;
    }
    return Object.entries(byTool)
      .map(([tool, v]) => ({
        tool, runs: v.runs,
        successRate: v.runs ? Math.round((v.ok / v.runs) * 100) : 0,
        mastery: Math.min(100, Math.round((v.ok / 8) * 70 + (v.runs >= 12 ? 30 : (v.runs / 12) * 30))),
      }))
      .sort((a, b) => b.mastery - a.mastery);
  }, [commands]);

  const recent = useMemo(() => commands.slice(0, 8), [commands]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile icon={Target} label="Modules Started" value={stats.startedModuleIds.size} sub={`of ${MODULES.length}`} />
        <StatTile icon={CheckCircle2} label="Labs Completed" value={stats.completed} sub={`${stats.started} started`} tone="success" />
        <StatTile icon={Trophy} label="Challenges Solved" value={stats.challengesSolved} tone="red" />
        <StatTile icon={Cpu} label="Commands Executed" value={stats.commands} sub={`${stats.successRate}% success`} tone="cyan" />
        <StatTile icon={Bug} label="Errors Encountered" value={stats.errors} sub="Learning signal" />
        <StatTile icon={Flame} label="Current Streak" value={`${streak}d`} />
        <StatTile icon={Clock} label="Range Time" value={fmtTime(totalTimeMs)} />
        <StatTile icon={Activity} label="Exam Readiness" value={`${stats.readiness}%`} sub="Earned via evidence" tone="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Command Stream</h3>
            <span className="chip chip-live"><span className="dot-live" /> Live</span>
          </div>
          {recent.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No telemetry yet. <Link to="/labs/$slug" params={{ slug: "whois-recon" }} className="text-[var(--cyan)] hover:underline">Launch a lab</Link> and your commands will stream here.
            </div>
          ) : (
            <ul className="font-mono text-xs space-y-1.5 max-h-[280px] overflow-auto">
              {recent.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${c.success ? "bg-[var(--success)]" : "bg-primary"}`} />
                  <span className="text-muted-foreground">{new Date(c.ts).toLocaleTimeString()}</span>
                  <span className="text-[var(--cyan)]">$</span>
                  <span className="truncate"><span className="text-foreground">{c.tool}</span> {c.args}</span>
                  <span className="ml-auto text-muted-foreground">{c.durationMs}ms</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel p-5">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">Tool Mastery</h3>
          {mastery.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tool usage recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {mastery.slice(0, 6).map((m) => (
                <li key={m.tool}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono">{m.tool}</span>
                    <span className="text-muted-foreground">{m.mastery}% · {m.runs} runs</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--cyan)] to-primary" style={{ width: `${m.mastery}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
