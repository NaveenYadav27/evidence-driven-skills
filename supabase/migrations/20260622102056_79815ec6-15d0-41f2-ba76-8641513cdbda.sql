-- Phase 2: schema gap migration for stabilization sprint

-- user_labs extensions
ALTER TABLE public.user_labs
  ADD COLUMN IF NOT EXISTS collected_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS submitted_findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS generated_reports  jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS started_at timestamptz;

-- ensure updated_at trigger on user_labs
DROP TRIGGER IF EXISTS trg_user_labs_updated_at ON public.user_labs;
CREATE TRIGGER trg_user_labs_updated_at
BEFORE UPDATE ON public.user_labs
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- user_assessments extensions
ALTER TABLE public.user_assessments
  ADD COLUMN IF NOT EXISTS last_answered_at timestamptz;

DROP TRIGGER IF EXISTS trg_user_assessments_updated_at ON public.user_assessments;
CREATE TRIGGER trg_user_assessments_updated_at
BEFORE UPDATE ON public.user_assessments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- user_challenges
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id text NOT NULL,
  module_id text,
  flag_status text NOT NULL DEFAULT 'unsubmitted',
  completion_status text NOT NULL DEFAULT 'in_progress',
  attempts integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  solved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_challenges TO authenticated;
GRANT ALL ON public.user_challenges TO service_role;

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_challenges_select_own" ON public.user_challenges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_challenges_insert_own" ON public.user_challenges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_challenges_update_own" ON public.user_challenges
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_challenges_delete_own" ON public.user_challenges
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_challenges_admin_read" ON public.user_challenges
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_user_challenges_updated_at
BEFORE UPDATE ON public.user_challenges
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON public.user_challenges(user_id);

-- lab_command_log
CREATE TABLE IF NOT EXISTS public.lab_command_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id text NOT NULL,
  module_id text,
  command text NOT NULL,
  normalized text NOT NULL,
  accepted boolean NOT NULL DEFAULT false,
  objective_id text,
  output_summary text,
  ts timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.lab_command_log TO authenticated;
GRANT ALL ON public.lab_command_log TO service_role;

ALTER TABLE public.lab_command_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lab_command_log_select_own" ON public.lab_command_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "lab_command_log_insert_own" ON public.lab_command_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lab_command_log_admin_read" ON public.lab_command_log
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_lab_command_log_user_ts ON public.lab_command_log(user_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_lab_command_log_user_lab ON public.lab_command_log(user_id, lab_id);

-- recalculate_user_progress incl. challenges
CREATE OR REPLACE FUNCTION public.recalculate_user_progress(_user uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lessons_done INTEGER;
  videos_done INTEGER;
  labs_done INTEGER;
  assess_done INTEGER;
  chals_done INTEGER;
  total INTEGER;
BEGIN
  SELECT count(*) INTO lessons_done FROM public.user_progress WHERE user_id = _user AND status = 'completed';
  SELECT count(*) INTO videos_done  FROM public.user_videos   WHERE user_id = _user AND (finished = true OR completion >= 0.9);
  SELECT count(*) INTO labs_done    FROM public.user_labs     WHERE user_id = _user AND status = 'completed';
  SELECT count(*) INTO assess_done  FROM public.user_assessments WHERE user_id = _user AND status IN ('submitted','passed');
  SELECT count(*) INTO chals_done   FROM public.user_challenges  WHERE user_id = _user AND completion_status = 'completed';
  total := GREATEST(lessons_done + videos_done + labs_done + assess_done + chals_done, 0);
  RETURN total;
END;
$$;