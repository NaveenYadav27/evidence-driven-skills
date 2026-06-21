// Provider that wires the Progress Engine to:
//   - Supabase auth (per-user storage scope)
//   - IndexedDB (layer 2)
//   - Supabase tables (layer 3) via server fns
//   - autosave (debounced + interval + visibility/online/beforeunload)
//   - silent session refresh
//   - route memory
// No UI of its own.

import { useEffect, useRef } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { useProgress } from "@/lib/progress/engine";
import type { ProgressSnapshot } from "@/lib/progress/types";
import { idbLoad, idbSave, idbClear } from "@/lib/progress/idb";
import { pullProgress, pushProgress } from "@/lib/progress.functions";
import { toast } from "sonner";

const LAST_UID_KEY = "shadowxlab-progress-last-uid";
const FLUSH_INTERVAL_MS = 5_000;
const REFRESH_LEAD_MS = 60_000;

function snapshot(): ProgressSnapshot {
  const s = useProgress.getState();
  return {
    lessons: s.lessons,
    videos: s.videos,
    assessments: s.assessments,
    labs: s.labs,
    session: s.session,
    lastUpdated: s.lastUpdated,
  };
}

export function ProgressProvider() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const pull = useServerFn(pullProgress);
  const push = useServerFn(pushProgress);
  const userIdRef = useRef<string | null>(null);
  const dirtyRef = useRef(false);
  const onlineRef = useRef<boolean>(typeof navigator === "undefined" ? true : navigator.onLine);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Auth & multi-layer hydration ----
  useEffect(() => {
    let mounted = true;

    // Wait for zustand `persist` to rehydrate from localStorage before any
    // cloud comparison — otherwise lastUpdated is 0 and stale cloud data
    // overwrites the user's real local progress on refresh.
    async function waitForRehydration() {
      const p = (useProgress as any).persist;
      if (p?.hasHydrated && !p.hasHydrated()) {
        await new Promise<void>((resolve) => {
          const unsub = p.onFinishHydration?.(() => { unsub?.(); resolve(); });
          // Safety timeout in case onFinishHydration isn't available
          setTimeout(resolve, 1500);
        });
      }
    }

    async function hydrateFor(uid: string) {
      await waitForRehydration();
      const prev = typeof window !== "undefined" ? localStorage.getItem(LAST_UID_KEY) : null;
      if (prev !== uid) {
        // Different user on this device — clear local stores
        useProgress.getState().reset();
        if (typeof window !== "undefined") localStorage.setItem(LAST_UID_KEY, uid);
        if (prev) await idbClear(prev);
      }


      // Layer 2: IndexedDB
      const idb = await idbLoad(uid);
      if (idb && idb.lastUpdated > useProgress.getState().lastUpdated) {
        useProgress.getState().replaceFromCloud(idb);
      }

      // Layer 3: Supabase (only if online)
      if (!onlineRef.current) return;
      try {
        const remote = await pull();
        if (!remote) return;
        const cloudSnap = remoteToSnapshot(remote);
        if (cloudSnap.lastUpdated > useProgress.getState().lastUpdated) {
          useProgress.getState().replaceFromCloud(cloudSnap);
          toast.success("Resumed from cloud", { description: "Your progress was restored from this account." });
        } else if (useProgress.getState().lastUpdated > 0) {
          // Local newer → push
          dirtyRef.current = true;
          void flush();
        }
      } catch (err) {
        console.warn("[progress] pull failed", err);
      }
    }

    function scheduleRefresh(expiresAtSec: number | null | undefined) {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (!expiresAtSec) return;
      const ms = Math.max(5_000, expiresAtSec * 1000 - Date.now() - REFRESH_LEAD_MS);
      refreshTimerRef.current = setTimeout(async () => {
        try {
          // Save first → refresh → restore (state is already in store)
          await flush();
          await supabase.auth.refreshSession();
        } catch (err) {
          console.warn("[progress] silent refresh failed", err);
        }
      }, ms);
    }

    const apply = (session: { user: { id: string }; expires_at?: number | null } | null) => {
      if (!mounted) return;
      if (session?.user) {
        userIdRef.current = session.user.id;
        scheduleRefresh(session.expires_at ?? null);
        void hydrateFor(session.user.id);
      } else {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        userIdRef.current = null;
        useProgress.getState().reset();
        if (typeof window !== "undefined") localStorage.removeItem(LAST_UID_KEY);
      }
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
        apply(session ?? null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Mark dirty on any state mutation ----
  useEffect(() => {
    const unsub = useProgress.subscribe((state, prev) => {
      if (state.lastUpdated !== prev.lastUpdated) dirtyRef.current = true;
    });
    return () => unsub();
  }, []);

  // ---- Route memory: write last_route on every navigation ----
  useEffect(() => {
    if (!pathname) return;
    const full = pathname + (search ? `?${search}` : "");
    useProgress.getState().updateSession({ lastRoute: full });
  }, [pathname, search]);

  // ---- Autosave loop ----
  useEffect(() => {
    const i = setInterval(() => { void flush(); }, FLUSH_INTERVAL_MS);
    const onVisibility = () => { if (document.visibilityState === "hidden") void flush(); };
    const onPageHide = () => { void flush(); };
    const onBeforeUnload = () => { void flush(); };
    const onOnline = () => {
      onlineRef.current = true;
      toast.success("Back online — syncing progress");
      void flush();
    };
    const onOffline = () => {
      onlineRef.current = false;
      toast.message("Offline mode active", { description: "Progress saved locally. Sync will resume automatically." });
    };
    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      clearInterval(i);
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function flush() {
    const uid = userIdRef.current;
    if (!uid || !dirtyRef.current) return;
    dirtyRef.current = false;
    const snap = snapshot();
    // Layer 2 always
    await idbSave(uid, snap);
    // Layer 3 only if online
    if (!onlineRef.current) return;
    try {
      await push({ data: snap });
    } catch (err) {
      console.warn("[progress] push failed — will retry", err);
      dirtyRef.current = true;
    }
  }

  return null;
}

function remoteToSnapshot(remote: Awaited<ReturnType<typeof pullProgress>>): ProgressSnapshot {
  const lessons: ProgressSnapshot["lessons"] = {};
  for (const r of remote.lessons as any[]) {
    lessons[r.lesson_id] = {
      lessonId: r.lesson_id,
      courseId: r.course_id,
      moduleId: r.module_id ?? undefined,
      slideId: r.slide_id ?? undefined,
      scrollY: r.scroll_y ?? 0,
      viewedRatio: Number(r.viewed_ratio ?? 0),
      timeSpentMs: Number(r.time_spent_ms ?? 0),
      requiredTimeMs: 60_000,
      status: r.status ?? "in_progress",
      lastActivity: new Date(r.last_activity ?? r.updated_at ?? Date.now()).getTime(),
      updatedAt: new Date(r.updated_at ?? Date.now()).getTime(),
    };
  }
  const videos: ProgressSnapshot["videos"] = {};
  for (const r of remote.videos as any[]) {
    videos[r.video_id] = {
      videoId: r.video_id,
      positionSec: Number(r.position_sec ?? 0),
      durationSec: Number(r.duration_sec ?? 0),
      watchedSec: Number(r.watched_sec ?? 0),
      completion: Number(r.completion ?? 0),
      finished: !!r.finished,
      playbackSpeed: Number(r.playback_speed ?? 1),
      updatedAt: new Date(r.updated_at ?? Date.now()).getTime(),
    };
  }
  const assessments: ProgressSnapshot["assessments"] = {};
  for (const r of remote.assessments as any[]) {
    assessments[r.assessment_id] = {
      assessmentId: r.assessment_id,
      moduleId: r.module_id ?? undefined,
      answers: r.answers ?? {},
      currentQuestion: r.current_question ?? 0,
      remainingTimeSec: r.remaining_time_sec ?? undefined,
      score: r.score ?? undefined,
      passThreshold: Number(r.pass_threshold ?? 70),
      status: r.status ?? "in_progress",
      attempts: r.attempts ?? 0,
      submittedAt: r.submitted_at ? new Date(r.submitted_at).getTime() : undefined,
      updatedAt: new Date(r.updated_at ?? Date.now()).getTime(),
    };
  }
  const labs: ProgressSnapshot["labs"] = {};
  for (const r of remote.labs as any[]) {
    labs[r.lab_id] = {
      labId: r.lab_id,
      moduleId: r.module_id ?? undefined,
      currentStep: r.current_step ?? 0,
      completedSteps: r.completed_steps ?? [],
      objectives: r.objectives ?? {},
      commands: r.commands ?? [],
      flags: r.flags ?? [],
      notes: r.notes ?? undefined,
      score: r.score ?? undefined,
      status: r.status ?? "in_progress",
      timeSpentMs: Number(r.time_spent_ms ?? 0),
      updatedAt: new Date(r.updated_at ?? Date.now()).getTime(),
    };
  }
  const s = remote.session as any;
  const session: ProgressSnapshot["session"] = s
    ? {
        lastRoute: s.last_route ?? undefined,
        lastCourseId: s.last_course_id ?? undefined,
        lastModuleId: s.last_module_id ?? undefined,
        lastLessonId: s.last_lesson_id ?? undefined,
        lastSlideId: s.last_slide_id ?? undefined,
        scrollY: s.scroll_y ?? 0,
        updatedAt: new Date(s.updated_at ?? Date.now()).getTime(),
      }
    : { scrollY: 0, updatedAt: 0 };

  const lastUpdated = Math.max(
    session.updatedAt,
    ...Object.values(lessons).map((x) => x.updatedAt),
    ...Object.values(videos).map((x) => x.updatedAt),
    ...Object.values(assessments).map((x) => x.updatedAt),
    ...Object.values(labs).map((x) => x.updatedAt),
    0,
  );
  return { lessons, videos, assessments, labs, session, lastUpdated };
}
