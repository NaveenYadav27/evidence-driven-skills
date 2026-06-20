
-- ============ user_progress ============
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL DEFAULT 'ceh-v13',
  module_id TEXT,
  lesson_id TEXT NOT NULL,
  slide_id TEXT,
  completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  time_spent_ms BIGINT NOT NULL DEFAULT 0,
  viewed_ratio NUMERIC(5,4) NOT NULL DEFAULT 0,
  scroll_y INTEGER NOT NULL DEFAULT 0,
  current_route TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress read" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "own progress write" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own progress update" ON public.user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own progress delete" ON public.user_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_up_touch BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_up_user ON public.user_progress(user_id);
CREATE INDEX idx_up_last_activity ON public.user_progress(last_activity DESC);

-- ============ user_videos ============
CREATE TABLE public.user_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  position_sec NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_sec NUMERIC(10,2) NOT NULL DEFAULT 0,
  watched_sec NUMERIC(10,2) NOT NULL DEFAULT 0,
  completion NUMERIC(5,4) NOT NULL DEFAULT 0,
  finished BOOLEAN NOT NULL DEFAULT false,
  playback_speed NUMERIC(4,2) NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_videos TO authenticated;
GRANT ALL ON public.user_videos TO service_role;
ALTER TABLE public.user_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own videos read" ON public.user_videos FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "own videos write" ON public.user_videos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own videos update" ON public.user_videos FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own videos delete" ON public.user_videos FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_uv_touch BEFORE UPDATE ON public.user_videos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ user_assessments ============
CREATE TABLE public.user_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL,
  module_id TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_question INTEGER NOT NULL DEFAULT 0,
  remaining_time_sec INTEGER,
  score NUMERIC(6,2),
  pass_threshold NUMERIC(5,2) NOT NULL DEFAULT 70,
  status TEXT NOT NULL DEFAULT 'in_progress',
  attempts INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, assessment_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_assessments TO authenticated;
GRANT ALL ON public.user_assessments TO service_role;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assess read" ON public.user_assessments FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "own assess write" ON public.user_assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own assess update" ON public.user_assessments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own assess delete" ON public.user_assessments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_ua_touch BEFORE UPDATE ON public.user_assessments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ user_labs ============
CREATE TABLE public.user_labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id TEXT NOT NULL,
  module_id TEXT,
  current_step INTEGER NOT NULL DEFAULT 0,
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  objectives JSONB NOT NULL DEFAULT '{}'::jsonb,
  commands JSONB NOT NULL DEFAULT '[]'::jsonb,
  flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  score NUMERIC(6,2),
  status TEXT NOT NULL DEFAULT 'in_progress',
  time_spent_ms BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lab_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_labs TO authenticated;
GRANT ALL ON public.user_labs TO service_role;
ALTER TABLE public.user_labs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own labs read" ON public.user_labs FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "own labs write" ON public.user_labs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own labs update" ON public.user_labs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own labs delete" ON public.user_labs FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_ul_touch BEFORE UPDATE ON public.user_labs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ user_bookmarks ============
CREATE TABLE public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL DEFAULT 'ceh-v13',
  lesson_id TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_bookmarks TO authenticated;
GRANT ALL ON public.user_bookmarks TO service_role;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bm read" ON public.user_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "own bm write" ON public.user_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own bm delete" ON public.user_bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ user_session_state ============
CREATE TABLE public.user_session_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_route TEXT,
  last_course_id TEXT,
  last_module_id TEXT,
  last_lesson_id TEXT,
  last_slide_id TEXT,
  scroll_y INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_session_state TO authenticated;
GRANT ALL ON public.user_session_state TO service_role;
ALTER TABLE public.user_session_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ss read" ON public.user_session_state FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "own ss upsert" ON public.user_session_state FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own ss update" ON public.user_session_state FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_uss_touch BEFORE UPDATE ON public.user_session_state FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ recalculate_user_progress ============
CREATE OR REPLACE FUNCTION public.recalculate_user_progress(_user UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lessons_done INTEGER;
  videos_done INTEGER;
  labs_done INTEGER;
  assess_done INTEGER;
  total INTEGER;
  pct NUMERIC;
BEGIN
  SELECT count(*) INTO lessons_done FROM public.user_progress WHERE user_id = _user AND status = 'completed';
  SELECT count(*) INTO videos_done FROM public.user_videos WHERE user_id = _user AND (finished = true OR completion >= 0.9);
  SELECT count(*) INTO labs_done FROM public.user_labs WHERE user_id = _user AND status = 'completed';
  SELECT count(*) INTO assess_done FROM public.user_assessments WHERE user_id = _user AND status IN ('submitted','passed');
  total := GREATEST(lessons_done + videos_done + labs_done + assess_done, 0);
  pct := total;
  RETURN pct;
END;
$$;
