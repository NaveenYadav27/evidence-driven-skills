// IndexedDB layer (layer 2) using idb-keyval — survives localStorage eviction.
import { get, set, del } from "idb-keyval";
import type { ProgressSnapshot } from "./types";

const KEY = (uid: string) => `progress:${uid}`;

export async function idbLoad(userId: string): Promise<ProgressSnapshot | null> {
  if (typeof indexedDB === "undefined") return null;
  try { return ((await get(KEY(userId))) as ProgressSnapshot) ?? null; } catch { return null; }
}
export async function idbSave(userId: string, snap: ProgressSnapshot): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try { await set(KEY(userId), snap); } catch { /* swallow */ }
}
export async function idbClear(userId: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try { await del(KEY(userId)); } catch { /* swallow */ }
}
