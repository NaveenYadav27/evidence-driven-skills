// Server functions for the Progress Engine. Authenticated, RLS-scoped.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SnapshotSchema = z.object({
  lessons: z.record(z.string(), z.any()),
  videos: z.record(z.string(), z.any()),
  assessments: z.record(z.string(), z.any()),
  labs: z.record(z.string(), z.any()),
  session: z.any(),
  lastUpdated: z.number().nonnegative(),
});

export const pullProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const uid = context.userId;
    const [lessons, videos, assessments, labs, session] = await Promise.all([
      sb.from("user_progress").select("*").eq("user_id", uid),
      sb.from("user_videos").select("*").eq("user_id", uid),
      sb.from("user_assessments").select("*").eq("user_id", uid),
      sb.from("user_labs").select("*").eq("user_id", uid),
      sb.from("user_session_state").select("*").eq("user_id", uid).maybeSingle(),
    ]);
    return {
      lessons: lessons.data ?? [],
      videos: videos.data ?? [],
      assessments: assessments.data ?? [],
      labs: labs.data ?? [],
      session: session.data ?? null,
    };
  });

export const pushProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => SnapshotSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const uid = context.userId;

    // Lessons
    const lessonRows = Object.values(data.lessons).map((l: any) => ({
      user_id: uid,
      course_id: l.courseId ?? "ceh-v13",
      module_id: l.moduleId ?? null,
      lesson_id: l.lessonId,
      slide_id: l.slideId ?? null,
      viewed_ratio: l.viewedRatio ?? 0,
      time_spent_ms: l.timeSpentMs ?? 0,
      scroll_y: l.scrollY ?? 0,
      status: l.status ?? "in_progress",
      completion_percentage:
        (l.viewedRatio ?? 0) >= 0.9 && (l.timeSpentMs ?? 0) >= (l.requiredTimeMs ?? 60_000) ? 100 : Math.round((l.viewedRatio ?? 0) * 100),
      last_activity: new Date(l.lastActivity ?? Date.now()).toISOString(),
    }));
    if (lessonRows.length) {
      await sb.from("user_progress").upsert(lessonRows, { onConflict: "user_id,course_id,lesson_id" });
    }

    // Videos
    const videoRows = Object.values(data.videos).map((v: any) => ({
      user_id: uid,
      video_id: v.videoId,
      position_sec: v.positionSec ?? 0,
      duration_sec: v.durationSec ?? 0,
      watched_sec: v.watchedSec ?? 0,
      completion: v.completion ?? 0,
      finished: !!v.finished,
      playback_speed: v.playbackSpeed ?? 1,
    }));
    if (videoRows.length) {
      await sb.from("user_videos").upsert(videoRows, { onConflict: "user_id,video_id" });
    }

    // Assessments
    const assessRows = Object.values(data.assessments).map((a: any) => ({
      user_id: uid,
      assessment_id: a.assessmentId,
      module_id: a.moduleId ?? null,
      answers: a.answers ?? {},
      current_question: a.currentQuestion ?? 0,
      remaining_time_sec: a.remainingTimeSec ?? null,
      score: a.score ?? null,
      pass_threshold: a.passThreshold ?? 70,
      status: a.status ?? "in_progress",
      attempts: a.attempts ?? 0,
      submitted_at: a.submittedAt ? new Date(a.submittedAt).toISOString() : null,
    }));
    if (assessRows.length) {
      await sb.from("user_assessments").upsert(assessRows, { onConflict: "user_id,assessment_id" });
    }

    // Labs
    const labRows = Object.values(data.labs).map((l: any) => ({
      user_id: uid,
      lab_id: l.labId,
      module_id: l.moduleId ?? null,
      current_step: l.currentStep ?? 0,
      completed_steps: l.completedSteps ?? [],
      objectives: l.objectives ?? {},
      commands: (l.commands ?? []).slice(0, 50),
      flags: l.flags ?? [],
      notes: l.notes ?? null,
      score: l.score ?? null,
      status: l.status ?? "in_progress",
      time_spent_ms: l.timeSpentMs ?? 0,
    }));
    if (labRows.length) {
      await sb.from("user_labs").upsert(labRows, { onConflict: "user_id,lab_id" });
    }

    // Session
    const s = data.session ?? {};
    await sb.from("user_session_state").upsert(
      {
        user_id: uid,
        last_route: s.lastRoute ?? null,
        last_course_id: s.lastCourseId ?? null,
        last_module_id: s.lastModuleId ?? null,
        last_lesson_id: s.lastLessonId ?? null,
        last_slide_id: s.lastSlideId ?? null,
        scroll_y: s.scrollY ?? 0,
        payload: { lastUpdated: data.lastUpdated },
      },
      { onConflict: "user_id" },
    );

    return { ok: true };
  });

export const getResumePoint = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_session_state").select("*").eq("user_id", context.userId).maybeSingle();
    return data ?? null;
  });
