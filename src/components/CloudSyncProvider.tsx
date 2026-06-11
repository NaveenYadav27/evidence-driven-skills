import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTelemetry, type TelemetrySnapshot } from "@/lib/telemetry";
import { getCloudTelemetry, saveCloudTelemetry } from "@/lib/telemetry-sync.functions";
import { useServerFn } from "@tanstack/react-start";
import { create } from "zustand";
import { toast } from "sonner";

interface SyncState {
  userId: string | null;
  email: string | null;
  status: "idle" | "loading" | "synced" | "error" | "offline";
  lastSyncedAt: number | null;
  setUser: (id: string | null, email: string | null) => void;
  setStatus: (s: SyncState["status"], at?: number) => void;
}

export const useCloudSync = create<SyncState>((set) => ({
  userId: null,
  email: null,
  status: "offline",
  lastSyncedAt: null,
  setUser: (userId, email) => set({ userId, email }),
  setStatus: (status, at) => set({ status, lastSyncedAt: at ?? null }),
}));

function snapshot(): TelemetrySnapshot {
  const s = useTelemetry.getState();
  return {
    commands: s.commands,
    labs: s.labs,
    totalTimeMs: s.totalTimeMs,
    lastActiveDay: s.lastActiveDay,
    streak: s.streak,
    lastUpdated: s.lastUpdated,
  };
}

export function CloudSyncProvider() {
  const getCloud = useServerFn(getCloudTelemetry);
  const saveCloud = useServerFn(saveCloudTelemetry);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userIdRef = useRef<string | null>(null);

  // Auth listener
  useEffect(() => {
    let mounted = true;

    const apply = (session: { user: { id: string; email?: string | null } } | null) => {
      if (!mounted) return;
      if (session?.user) {
        userIdRef.current = session.user.id;
        useCloudSync.getState().setUser(session.user.id, session.user.email ?? null);
        void hydrate();
      } else {
        userIdRef.current = null;
        useCloudSync.getState().setUser(null, null);
        useCloudSync.getState().setStatus("offline");
      }
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        apply(session);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push subscriber - debounce upload on state change
  useEffect(() => {
    const unsub = useTelemetry.subscribe((state, prev) => {
      if (!userIdRef.current) return;
      const changed =
        state.commands !== prev.commands ||
        state.labs !== prev.labs ||
        state.totalTimeMs !== prev.totalTimeMs ||
        state.streak !== prev.streak ||
        state.lastActiveDay !== prev.lastActiveDay;
      if (!changed) return;
      // bump lastUpdated (without retriggering this branch — markUpdated only changes lastUpdated)
      if (state.lastUpdated <= prev.lastUpdated) {
        useTelemetry.getState().markUpdated();
      }
      schedulePush();
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function schedulePush() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void push(), 1500);
  }

  async function push() {
    if (!userIdRef.current) return;
    try {
      useCloudSync.getState().setStatus("loading");
      const snap = snapshot();
      await saveCloud({ data: snap });
      useCloudSync.getState().setStatus("synced", Date.now());
    } catch (err) {
      console.error("telemetry push failed", err);
      useCloudSync.getState().setStatus("error");
    }
  }

  async function hydrate() {
    try {
      useCloudSync.getState().setStatus("loading");
      const row = await getCloud();
      const local = snapshot();
      if (row?.state && typeof row.state === "object") {
        const cloud = row.state as TelemetrySnapshot;
        const cloudTs = cloud.lastUpdated ?? 0;
        if (cloudTs > local.lastUpdated) {
          useTelemetry.getState().replaceFromCloud(cloud);
          toast.success("Cloud progress restored", { description: "Your telemetry was pulled from this account." });
          useCloudSync.getState().setStatus("synced", Date.now());
          return;
        }
      }
      // Local is newer or cloud empty → push
      if (local.lastUpdated > 0 || local.commands.length > 0) {
        await saveCloud({ data: { ...local, lastUpdated: local.lastUpdated || Date.now() } });
      }
      useCloudSync.getState().setStatus("synced", Date.now());
    } catch (err) {
      console.error("telemetry hydrate failed", err);
      useCloudSync.getState().setStatus("error");
    }
  }

  return null;
}
