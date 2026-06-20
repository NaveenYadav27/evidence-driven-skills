
-- =====================================================================
-- CEH Operations Center: Ticketing System
-- =====================================================================

-- Ticket status enum
DO $$ BEGIN
  CREATE TYPE public.ticket_status AS ENUM ('open','in_progress','submitted','reviewed','resolved','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_priority AS ENUM ('low','medium','high','critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- ticket_progress
-- ---------------------------------------------------------------------
CREATE TABLE public.ticket_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_id TEXT NOT NULL,
  hour_slug TEXT,
  status public.ticket_status NOT NULL DEFAULT 'open',
  current_step INTEGER NOT NULL DEFAULT 0,
  completed_steps INTEGER[] NOT NULL DEFAULT '{}',
  decisions JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  auto_score NUMERIC,
  instructor_score NUMERIC,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, ticket_id)
);
CREATE INDEX idx_ticket_progress_user ON public.ticket_progress(user_id);
CREATE INDEX idx_ticket_progress_status ON public.ticket_progress(status);
CREATE INDEX idx_ticket_progress_hour ON public.ticket_progress(hour_slug);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_progress TO authenticated;
GRANT ALL ON public.ticket_progress TO service_role;
ALTER TABLE public.ticket_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ticket progress" ON public.ticket_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all ticket progress" ON public.ticket_progress
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_ticket_progress_touch BEFORE UPDATE ON public.ticket_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------
-- ticket_evidence
-- ---------------------------------------------------------------------
CREATE TABLE public.ticket_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  kind TEXT NOT NULL,            -- screenshot|command|log|note|whois|dns|mapping|link|file
  label TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ticket_evidence_user_ticket ON public.ticket_evidence(user_id, ticket_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_evidence TO authenticated;
GRANT ALL ON public.ticket_evidence TO service_role;
ALTER TABLE public.ticket_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own evidence" ON public.ticket_evidence
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all evidence" ON public.ticket_evidence
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_ticket_evidence_touch BEFORE UPDATE ON public.ticket_evidence
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------
-- ticket_deliverables
-- ---------------------------------------------------------------------
CREATE TABLE public.ticket_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_id TEXT NOT NULL,
  kind TEXT NOT NULL,            -- exec_summary|technical|risk|incident|mitigation|recon|threat_intel|mitre|detection_rule
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ticket_deliverables_user_ticket ON public.ticket_deliverables(user_id, ticket_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_deliverables TO authenticated;
GRANT ALL ON public.ticket_deliverables TO service_role;
ALTER TABLE public.ticket_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own deliverables" ON public.ticket_deliverables
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all deliverables" ON public.ticket_deliverables
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_ticket_deliverables_touch BEFORE UPDATE ON public.ticket_deliverables
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------
-- ticket_reviews (instructor)
-- ---------------------------------------------------------------------
CREATE TABLE public.ticket_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- student
  ticket_id TEXT NOT NULL,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  feedback TEXT NOT NULL DEFAULT '',
  rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ticket_reviews_user_ticket ON public.ticket_reviews(user_id, ticket_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_reviews TO authenticated;
GRANT ALL ON public.ticket_reviews TO service_role;
ALTER TABLE public.ticket_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students read own reviews" ON public.ticket_reviews
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all reviews" ON public.ticket_reviews
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_ticket_reviews_touch BEFORE UPDATE ON public.ticket_reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------
-- xp_ledger
-- ---------------------------------------------------------------------
CREATE TABLE public.xp_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_id TEXT,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_xp_ledger_user ON public.xp_ledger(user_id);

GRANT SELECT, INSERT ON public.xp_ledger TO authenticated;
GRANT ALL ON public.xp_ledger TO service_role;
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read/insert own xp" ON public.xp_ledger
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own xp" ON public.xp_ledger
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all xp" ON public.xp_ledger
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- user_badges
-- ---------------------------------------------------------------------
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL,
  awarded_for TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_code)
);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);

GRANT SELECT, INSERT ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own badges" ON public.user_badges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badges" ON public.user_badges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all badges" ON public.user_badges
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
