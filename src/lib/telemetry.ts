import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CommandEvent {
  id: string;
  ts: number;
  labId?: string;
  moduleId?: string;
  tool: string;            // whois, dig, nslookup, ...
  args: string;            // raw command tail
  success: boolean;
  durationMs: number;
}

export interface ObjectiveState {
  satisfied: boolean;
  at?: number;
  attempts: number;
}

export interface LabProgress {
  labId: string;
  startedAt: number;
  completedAt?: number;
  objectives: Record<string, ObjectiveState>;
  findings: Record<string, string>;
  hintsUsed: number;
  errors: number;
  commands: number;
  timeMs: number;
}

export interface TelemetrySnapshot {
  commands: CommandEvent[];
  labs: Record<string, LabProgress>;
  totalTimeMs: number;
  lastActiveDay?: string;
  streak: number;
  lastUpdated: number;
}

interface TelemetryState extends TelemetrySnapshot {
  // actions
  recordCommand: (e: Omit<CommandEvent, "id" | "ts">) => void;
  satisfyObjective: (labId: string, objId: string) => void;
  attemptObjective: (labId: string, objId: string) => void;
  ensureLab: (labId: string) => void;
  setFinding: (labId: string, key: string, value: string) => void;
  completeLab: (labId: string) => void;
  tick: (ms: number) => void;
  reset: () => void;
  replaceFromCloud: (snap: TelemetrySnapshot) => void;
  markUpdated: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const useTelemetry = create<TelemetryState>()(
  persist(
    (set, get) => ({
      commands: [],
      labs: {},
      totalTimeMs: 0,
      streak: 0,
      lastUpdated: 0,


      ensureLab: (labId) => {
        if (get().labs[labId]) return;
        set((s) => ({
          labs: {
            ...s.labs,
            [labId]: {
              labId,
              startedAt: Date.now(),
              objectives: {},
              findings: {},
              hintsUsed: 0,
              errors: 0,
              commands: 0,
              timeMs: 0,
            },
          },
        }));
      },

      recordCommand: (e) => {
        const id = crypto.randomUUID();
        const ts = Date.now();
        set((s) => {
          const next: CommandEvent[] = [{ id, ts, ...e }, ...s.commands].slice(0, 500);
          let labs = s.labs;
          if (e.labId && labs[e.labId]) {
            labs = {
              ...labs,
              [e.labId]: {
                ...labs[e.labId],
                commands: labs[e.labId].commands + 1,
                errors: labs[e.labId].errors + (e.success ? 0 : 1),
              },
            };
          }
          // streak update
          const d = today();
          let streak = s.streak;
          if (s.lastActiveDay !== d) {
            const prev = s.lastActiveDay ? new Date(s.lastActiveDay) : null;
            const oneDay = 86400000;
            if (prev && Date.now() - prev.getTime() < oneDay * 2) streak = streak + 1;
            else streak = 1;
          }
          return { commands: next, labs, lastActiveDay: d, streak };
        });
      },

      attemptObjective: (labId, objId) => {
        set((s) => {
          const lab = s.labs[labId];
          if (!lab) return s;
          const o = lab.objectives[objId] ?? { satisfied: false, attempts: 0 };
          return {
            labs: {
              ...s.labs,
              [labId]: {
                ...lab,
                objectives: { ...lab.objectives, [objId]: { ...o, attempts: o.attempts + 1 } },
              },
            },
          };
        });
      },

      satisfyObjective: (labId, objId) => {
        set((s) => {
          const lab = s.labs[labId];
          if (!lab) return s;
          const o = lab.objectives[objId] ?? { satisfied: false, attempts: 0 };
          if (o.satisfied) return s;
          return {
            labs: {
              ...s.labs,
              [labId]: {
                ...lab,
                objectives: {
                  ...lab.objectives,
                  [objId]: { ...o, satisfied: true, at: Date.now(), attempts: o.attempts + 1 },
                },
              },
            },
          };
        });
      },

      setFinding: (labId, key, value) => {
        set((s) => {
          const lab = s.labs[labId];
          if (!lab) return s;
          return {
            labs: {
              ...s.labs,
              [labId]: { ...lab, findings: { ...lab.findings, [key]: value } },
            },
          };
        });
      },

      completeLab: (labId) => {
        set((s) => {
          const lab = s.labs[labId];
          if (!lab || lab.completedAt) return s;
          return { labs: { ...s.labs, [labId]: { ...lab, completedAt: Date.now() } } };
        });
      },

      tick: (ms) => set((s) => ({ totalTimeMs: s.totalTimeMs + ms })),

      reset: () => set({ commands: [], labs: {}, totalTimeMs: 0, streak: 0, lastActiveDay: undefined, lastUpdated: Date.now() }),

      replaceFromCloud: (snap) => set({
        commands: snap.commands ?? [],
        labs: snap.labs ?? {},
        totalTimeMs: snap.totalTimeMs ?? 0,
        streak: snap.streak ?? 0,
        lastActiveDay: snap.lastActiveDay,
        lastUpdated: snap.lastUpdated ?? Date.now(),
      }),

      markUpdated: () => set({ lastUpdated: Date.now() }),
    }),
    { name: "shadowx-ceh-telemetry-v1" },
  ),
);

/** Aggregate selectors */
export const selectStats = (s: TelemetryState) => {
  const labIds = Object.keys(s.labs);
  const completed = labIds.filter((id) => s.labs[id].completedAt).length;
  const started = labIds.length;
  const commands = s.commands.length;
  const errors = s.commands.filter((c) => !c.success).length;
  const successRate = commands ? Math.round(((commands - errors) / commands) * 100) : 0;
  const challengesSolved = labIds.filter((id) => id.includes("challenge") && s.labs[id].completedAt).length;
  return { started, completed, commands, errors, successRate, challengesSolved, streak: s.streak, totalTimeMs: s.totalTimeMs };
};

export const selectToolMastery = (s: TelemetryState) => {
  const byTool: Record<string, { runs: number; ok: number }> = {};
  for (const c of s.commands) {
    byTool[c.tool] ??= { runs: 0, ok: 0 };
    byTool[c.tool].runs++;
    if (c.success) byTool[c.tool].ok++;
  }
  return Object.entries(byTool)
    .map(([tool, v]) => ({
      tool,
      runs: v.runs,
      successRate: v.runs ? Math.round((v.ok / v.runs) * 100) : 0,
      mastery: Math.min(100, Math.round((v.ok / 8) * 70 + (v.runs >= 12 ? 30 : (v.runs / 12) * 30))),
    }))
    .sort((a, b) => b.mastery - a.mastery);
};
