// Per-lab transcript ring buffer used by the AI Analyst / Report / Grader.
// Lives only in-memory on the client; recon outputs can be large so we cap
// each entry's output and the number of retained entries per lab.
import { create } from "zustand";

export interface TranscriptEntry {
  ts: number;
  tool: string;
  args: string;
  success: boolean;
  output: string; // truncated
}

interface TranscriptStore {
  byLab: Record<string, TranscriptEntry[]>;
  push: (labId: string, e: Omit<TranscriptEntry, "ts">) => void;
  clear: (labId: string) => void;
}

const MAX_ENTRIES = 12;
const MAX_OUTPUT_CHARS = 4000;

export const useLabTranscript = create<TranscriptStore>((set) => ({
  byLab: {},
  push: (labId, e) =>
    set((s) => {
      const trimmed: TranscriptEntry = {
        ts: Date.now(),
        ...e,
        output: (e.output ?? "").slice(0, MAX_OUTPUT_CHARS),
      };
      const next = [...(s.byLab[labId] ?? []), trimmed].slice(-MAX_ENTRIES);
      return { byLab: { ...s.byLab, [labId]: next } };
    }),
  clear: (labId) =>
    set((s) => {
      const { [labId]: _drop, ...rest } = s.byLab;
      return { byLab: rest };
    }),
}));

export function transcriptToPrompt(entries: TranscriptEntry[]): string {
  if (!entries.length) return "(no commands executed yet)";
  return entries
    .map(
      (e, i) =>
        `#${i + 1} [${e.success ? "ok" : "err"}] $ ${e.tool} ${e.args}\n${e.output || "(empty)"}`,
    )
    .join("\n\n---\n\n");
}
