// Engagement validators — prevent false completion / skip-to-end inflation.
import type { LessonState, VideoState, LabState, AssessmentState } from "./types";

export const isLessonComplete = (l: LessonState): boolean =>
  l.viewedRatio >= 0.9 && l.timeSpentMs >= l.requiredTimeMs;

export const isVideoComplete = (v: VideoState): boolean =>
  v.finished || v.completion >= 0.9;

export const isLabComplete = (l: LabState): boolean => {
  const objs = Object.values(l.objectives);
  if (!objs.length) return false;
  return objs.every((o) => o.satisfied);
};

export const isAssessmentComplete = (a: AssessmentState): boolean =>
  a.status === "submitted" || a.status === "passed" || a.status === "failed";

export interface AggregateProgress {
  lessonsCompleted: number;
  lessonsStarted: number;
  videosCompleted: number;
  labsCompleted: number;
  labsStarted: number;
  assessmentsCompleted: number;
  assessmentsPassed: number;
  totalActivities: number;
  completedActivities: number;
  completionPercentage: number;
}

export function aggregate(snap: {
  lessons: Record<string, LessonState>;
  videos: Record<string, VideoState>;
  labs: Record<string, LabState>;
  assessments: Record<string, AssessmentState>;
}): AggregateProgress {
  const lessons = Object.values(snap.lessons);
  const videos = Object.values(snap.videos);
  const labs = Object.values(snap.labs);
  const assess = Object.values(snap.assessments);

  const lessonsCompleted = lessons.filter(isLessonComplete).length;
  const videosCompleted = videos.filter(isVideoComplete).length;
  const labsCompleted = labs.filter(isLabComplete).length;
  const assessmentsCompleted = assess.filter(isAssessmentComplete).length;
  const assessmentsPassed = assess.filter((a) => a.status === "passed").length;

  const totalActivities = lessons.length + videos.length + labs.length + assess.length;
  const completedActivities =
    lessonsCompleted + videosCompleted + labsCompleted + assessmentsCompleted;
  const completionPercentage = totalActivities
    ? Math.round((completedActivities / totalActivities) * 100)
    : 0;

  return {
    lessonsCompleted,
    lessonsStarted: lessons.length,
    videosCompleted,
    labsCompleted,
    labsStarted: labs.length,
    assessmentsCompleted,
    assessmentsPassed,
    totalActivities,
    completedActivities,
    completionPercentage,
  };
}
