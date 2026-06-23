// Centralized Progress Engine — Zustand store with LocalStorage persistence.
// IndexedDB + Supabase layers live in persistence.ts/sync.ts.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ProgressSnapshot, LessonState, VideoState, AssessmentState, LabState, SessionState,
} from "./types";
import { emptySnapshot } from "./types";
import { aggregate, isLabComplete, isLessonComplete, isVideoComplete } from "./validators";

interface EngineActions {
  // session/route
  updateSession: (patch: Partial<SessionState>) => void;

  // lesson
  touchLesson: (
    lessonId: string,
    init: { courseId: string; moduleId?: string; requiredTimeMs?: number },
  ) => void;
  setLessonSlide: (lessonId: string, slideId: string) => void;
  setLessonScroll: (lessonId: string, scrollY: number) => void;
  setLessonViewed: (lessonId: string, viewedRatio: number) => void;
  addLessonTime: (lessonId: string, deltaMs: number) => void;

  // video
  updateVideo: (videoId: string, patch: Partial<VideoState>) => void;

  // assessment
  initAssessment: (assessmentId: string, init: Partial<AssessmentState>) => void;
  setAnswer: (assessmentId: string, questionId: string, value: unknown) => void;
  setCurrentQuestion: (assessmentId: string, q: number) => void;
  setRemainingTime: (assessmentId: string, sec: number) => void;
  submitAssessment: (assessmentId: string, score: number) => void;

  // lab
  ensureLab: (labId: string, moduleId?: string) => void;
  recordLabCommand: (labId: string, tool: string, args: string, success: boolean) => void;
  setObjective: (labId: string, objId: string, satisfied: boolean) => void;
  attemptObjective: (labId: string, objId: string) => void;
  setLabStep: (labId: string, step: number) => void;
  addLabTime: (labId: string, deltaMs: number) => void;
  setLabNotes: (labId: string, notes: string) => void;
  addFlag: (labId: string, flag: string) => void;

  // wholesale
  replaceFromCloud: (snap: ProgressSnapshot) => void;
  reset: () => void;
}

export type EngineState = ProgressSnapshot & EngineActions;

const now = () => Date.now();

export const useProgress = create<EngineState>()(
  persist(
    (set, _get) => ({
      ...emptySnapshot(),

      updateSession: (patch) =>
        set((s) => ({
          session: { ...s.session, ...patch, updatedAt: now() },
          lastUpdated: now(),
        })),

      touchLesson: (lessonId, init) =>
        set((s) => {
          const prev = s.lessons[lessonId];
          const lesson: LessonState = prev ?? {
            lessonId,
            courseId: init.courseId,
            moduleId: init.moduleId,
            scrollY: 0,
            viewedRatio: 0,
            timeSpentMs: 0,
            requiredTimeMs: init.requiredTimeMs ?? 60_000,
            status: "in_progress",
            lastActivity: now(),
            updatedAt: now(),
          };
          return {
            lessons: { ...s.lessons, [lessonId]: { ...lesson, lastActivity: now(), updatedAt: now() } },
            lastUpdated: now(),
          };
        }),

      setLessonSlide: (lessonId, slideId) =>
        set((s) => {
          const l = s.lessons[lessonId];
          if (!l) return s;
          return {
            lessons: { ...s.lessons, [lessonId]: { ...l, slideId, lastActivity: now(), updatedAt: now() } },
            lastUpdated: now(),
          };
        }),

      setLessonScroll: (lessonId, scrollY) =>
        set((s) => {
          const l = s.lessons[lessonId];
          if (!l) return s;
          return {
            lessons: { ...s.lessons, [lessonId]: { ...l, scrollY, updatedAt: now() } },
            lastUpdated: now(),
          };
        }),

      setLessonViewed: (lessonId, viewedRatio) =>
        set((s) => {
          const l = s.lessons[lessonId];
          if (!l) return s;
          const updated: LessonState = {
            ...l,
            viewedRatio: Math.max(l.viewedRatio, Math.min(1, viewedRatio)),
            updatedAt: now(),
            lastActivity: now(),
          };
          if (isLessonComplete(updated)) updated.status = "completed";
          return { lessons: { ...s.lessons, [lessonId]: updated }, lastUpdated: now() };
        }),

      addLessonTime: (lessonId, deltaMs) =>
        set((s) => {
          const l = s.lessons[lessonId];
          if (!l) return s;
          const updated: LessonState = {
            ...l,
            timeSpentMs: l.timeSpentMs + Math.max(0, deltaMs),
            updatedAt: now(),
            lastActivity: now(),
          };
          if (isLessonComplete(updated)) updated.status = "completed";
          return { lessons: { ...s.lessons, [lessonId]: updated }, lastUpdated: now() };
        }),

      updateVideo: (videoId, patch) =>
        set((s) => {
          const prev = s.videos[videoId] ?? {
            videoId, positionSec: 0, durationSec: 0, watchedSec: 0,
            completion: 0, finished: false, playbackSpeed: 1, updatedAt: now(),
          };
          const v: VideoState = { ...prev, ...patch, videoId, updatedAt: now() };
          if (v.durationSec > 0) v.completion = Math.min(1, v.watchedSec / v.durationSec);
          if (isVideoComplete(v)) v.finished = true;
          return { videos: { ...s.videos, [videoId]: v }, lastUpdated: now() };
        }),

      initAssessment: (assessmentId, init) =>
        set((s) => {
          if (s.assessments[assessmentId]) return s;
          const a: AssessmentState = {
            assessmentId,
            answers: {},
            currentQuestion: 0,
            passThreshold: 70,
            status: "in_progress",
            attempts: 0,
            updatedAt: now(),
            ...init,
          };
          return { assessments: { ...s.assessments, [assessmentId]: a }, lastUpdated: now() };
        }),

      setAnswer: (assessmentId, questionId, value) =>
        set((s) => {
          const a = s.assessments[assessmentId];
          if (!a) return s;
          return {
            assessments: {
              ...s.assessments,
              [assessmentId]: { ...a, answers: { ...a.answers, [questionId]: value }, updatedAt: now() },
            },
            lastUpdated: now(),
          };
        }),

      setCurrentQuestion: (assessmentId, q) =>
        set((s) => {
          const a = s.assessments[assessmentId];
          if (!a) return s;
          return {
            assessments: { ...s.assessments, [assessmentId]: { ...a, currentQuestion: q, updatedAt: now() } },
            lastUpdated: now(),
          };
        }),

      setRemainingTime: (assessmentId, sec) =>
        set((s) => {
          const a = s.assessments[assessmentId];
          if (!a) return s;
          return {
            assessments: { ...s.assessments, [assessmentId]: { ...a, remainingTimeSec: sec, updatedAt: now() } },
            lastUpdated: now(),
          };
        }),

      submitAssessment: (assessmentId, score) =>
        set((s) => {
          const a = s.assessments[assessmentId];
          if (!a) return s;
          const status: AssessmentState["status"] =
            score >= (a.passThreshold ?? 70) ? "passed" : "failed";
          return {
            assessments: {
              ...s.assessments,
              [assessmentId]: {
                ...a, score, status, attempts: a.attempts + 1,
                submittedAt: now(), updatedAt: now(),
              },
            },
            lastUpdated: now(),
          };
        }),

      ensureLab: (labId, moduleId) =>
        set((s) => {
          if (s.labs[labId]) return s;
          const lab: LabState = {
            labId, moduleId, currentStep: 0, completedSteps: [],
            objectives: {}, commands: [], flags: [],
            status: "in_progress", timeSpentMs: 0, updatedAt: now(),
          };
          return { labs: { ...s.labs, [labId]: lab }, lastUpdated: now() };
        }),

      recordLabCommand: (labId, tool, args, success) =>
        set((s) => {
          const l = s.labs[labId];
          if (!l) return s;
          const commands = [{ ts: now(), tool, args, success }, ...l.commands].slice(0, 200);
          return { labs: { ...s.labs, [labId]: { ...l, commands, updatedAt: now() } }, lastUpdated: now() };
        }),

      setObjective: (labId, objId, satisfied) =>
        set((s) => {
          const l = s.labs[labId];
          if (!l) return s;
          const prev = l.objectives[objId] ?? { satisfied: false, attempts: 0 };
          if (prev.satisfied && satisfied) return s;
          const objectives = {
            ...l.objectives,
            [objId]: { ...prev, satisfied, at: satisfied ? now() : prev.at, attempts: prev.attempts + 1 },
          };
          const updated: LabState = { ...l, objectives, updatedAt: now() };
          if (isLabComplete(updated)) updated.status = "completed";
          return { labs: { ...s.labs, [labId]: updated }, lastUpdated: now() };
        }),

      attemptObjective: (labId, objId) =>
        set((s) => {
          const l = s.labs[labId];
          if (!l) return s;
          const prev = l.objectives[objId] ?? { satisfied: false, attempts: 0 };
          return {
            labs: {
              ...s.labs,
              [labId]: {
                ...l,
                objectives: { ...l.objectives, [objId]: { ...prev, attempts: prev.attempts + 1 } },
                updatedAt: now(),
              },
            },
            lastUpdated: now(),
          };
        }),

      setLabStep: (labId, step) =>
        set((s) => {
          const l = s.labs[labId];
          if (!l) return s;
          return { labs: { ...s.labs, [labId]: { ...l, currentStep: step, updatedAt: now() } }, lastUpdated: now() };
        }),

      addLabTime: (labId, deltaMs) =>
        set((s) => {
          const l = s.labs[labId];
          if (!l) return s;
          return {
            labs: { ...s.labs, [labId]: { ...l, timeSpentMs: l.timeSpentMs + Math.max(0, deltaMs), updatedAt: now() } },
            lastUpdated: now(),
          };
        }),

      setLabNotes: (labId, notes) =>
        set((s) => {
          const l = s.labs[labId];
          if (!l) return s;
          return { labs: { ...s.labs, [labId]: { ...l, notes, updatedAt: now() } }, lastUpdated: now() };
        }),

      addFlag: (labId, flag) =>
        set((s) => {
          const l = s.labs[labId];
          if (!l) return s;
          if (l.flags.includes(flag)) return s;
          return { labs: { ...s.labs, [labId]: { ...l, flags: [...l.flags, flag], updatedAt: now() } }, lastUpdated: now() };
        }),

      replaceFromCloud: (snap) =>
        set(() => ({ ...snap, lastUpdated: snap.lastUpdated ?? now() })),

      // IMPORTANT: lastUpdated MUST be 0 after reset. If we used now(), the next
      // sign-in would see local-newer-than-cloud and push the empty snapshot,
      // wiping the user's real progress in Supabase.
      reset: () => set(() => ({ ...emptySnapshot(), lastUpdated: 0 })),
    }),
    {
      name: "shadowxlab-progress-v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : ({ getItem: () => null, setItem: () => {}, removeItem: () => {} } as unknown as Storage),
      ),
      version: 1,
      partialize: (s) => ({
        lessons: s.lessons,
        videos: s.videos,
        assessments: s.assessments,
        labs: s.labs,
        session: s.session,
        lastUpdated: s.lastUpdated,
      }),
    },
  ),
);

export const selectAggregate = (s: EngineState) =>
  aggregate({ lessons: s.lessons, videos: s.videos, labs: s.labs, assessments: s.assessments });

export const selectResumePoint = (s: EngineState) => s.session;
