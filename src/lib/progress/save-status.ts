// Authoritative save-status store, written by ProgressProvider and read by SaveStatusPill.
// Status semantics:
//   idle       — nothing pending
//   saving     — flush in progress (debounced/coalesced)
//   saved      — DB ack received for the last flush
//   restored   — pulled a newer snapshot from DB; UI hydrated
//   retrying   — last push failed, will retry on next tick
//   failed     — last push failed AND offline; will retry when back online
// `Synced` is intentionally not in this list — we never claim sync without a DB ack.

import { create } from "zustand";

export type SaveStatus = "idle" | "saving" | "saved" | "restored" | "retrying" | "failed";

interface SaveStatusState {
  status: SaveStatus;
  lastSavedAt: number | null;
  lastError: string | null;
  set: (status: SaveStatus, extra?: { at?: number; error?: string | null }) => void;
}

export const useSaveStatus = create<SaveStatusState>((set) => ({
  status: "idle",
  lastSavedAt: null,
  lastError: null,
  set: (status, extra) =>
    set((prev) => ({
      status,
      lastSavedAt: status === "saved" ? (extra?.at ?? Date.now()) : prev.lastSavedAt,
      lastError: extra?.error ?? (status === "failed" || status === "retrying" ? prev.lastError : null),
    })),
}));
