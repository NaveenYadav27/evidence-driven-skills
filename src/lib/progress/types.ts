// Centralized Progress Engine types — single source of truth for the LMS.

export type LessonStatus = "in_progress" | "completed";
export type AssessmentStatus = "in_progress" | "submitted" | "passed" | "failed";
export type LabStatus = "in_progress" | "completed";

export interface LessonState {
  lessonId: string;
  courseId: string;
  moduleId?: string;
  slideId?: string;
  scrollY: number;
  viewedRatio: number;          // 0..1
  timeSpentMs: number;
  requiredTimeMs: number;       // e.g. 0.66 * estimated lesson time
  status: LessonStatus;
  lastActivity: number;
  updatedAt: number;
}

export interface VideoState {
  videoId: string;
  positionSec: number;
  durationSec: number;
  watchedSec: number;
  completion: number;           // 0..1
  finished: boolean;
  playbackSpeed: number;
  updatedAt: number;
}

export interface AssessmentState {
  assessmentId: string;
  moduleId?: string;
  answers: Record<string, unknown>;
  currentQuestion: number;
  remainingTimeSec?: number;
  score?: number;
  passThreshold: number;
  status: AssessmentStatus;
  attempts: number;
  submittedAt?: number;
  updatedAt: number;
}

export interface LabState {
  labId: string;
  moduleId?: string;
  currentStep: number;
  completedSteps: string[];
  objectives: Record<string, { satisfied: boolean; at?: number; attempts: number }>;
  commands: { ts: number; tool: string; args: string; success: boolean }[];
  flags: string[];
  notes?: string;
  score?: number;
  status: LabStatus;
  timeSpentMs: number;
  updatedAt: number;
}

export interface SessionState {
  lastRoute?: string;
  lastCourseId?: string;
  lastModuleId?: string;
  lastLessonId?: string;
  lastSlideId?: string;
  scrollY: number;
  updatedAt: number;
}

export interface ProgressSnapshot {
  lessons: Record<string, LessonState>;
  videos: Record<string, VideoState>;
  assessments: Record<string, AssessmentState>;
  labs: Record<string, LabState>;
  session: SessionState;
  /** monotonic, set on every mutation; conflict resolution uses this */
  lastUpdated: number;
}

export const emptySnapshot = (): ProgressSnapshot => ({
  lessons: {},
  videos: {},
  assessments: {},
  labs: {},
  session: { scrollY: 0, updatedAt: 0 },
  lastUpdated: 0,
});
