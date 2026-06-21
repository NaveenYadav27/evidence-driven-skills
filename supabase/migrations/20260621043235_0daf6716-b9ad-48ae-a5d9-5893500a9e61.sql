
-- 1) ticket_progress
DROP POLICY IF EXISTS "Users manage own ticket progress" ON public.ticket_progress;
REVOKE UPDATE ON public.ticket_progress FROM authenticated;
REVOKE UPDATE ON public.ticket_progress FROM anon;
GRANT UPDATE (current_step, completed_steps, decisions, notes, updated_at)
  ON public.ticket_progress TO authenticated;

CREATE POLICY "tp_own_select" ON public.ticket_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "tp_own_insert" ON public.ticket_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tp_own_update" ON public.ticket_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tp_own_delete" ON public.ticket_progress
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2) user_assessments
DROP POLICY IF EXISTS "own assess update" ON public.user_assessments;
REVOKE UPDATE ON public.user_assessments FROM authenticated;
REVOKE UPDATE ON public.user_assessments FROM anon;
GRANT UPDATE (answers, current_question, remaining_time_sec, updated_at)
  ON public.user_assessments TO authenticated;

CREATE POLICY "ua_own_update" ON public.user_assessments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3) ticket_deliverables (lock once submitted/reviewed/resolved/closed)
DROP POLICY IF EXISTS "Users manage own deliverables" ON public.ticket_deliverables;

CREATE POLICY "td_own_select" ON public.ticket_deliverables
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "td_own_insert" ON public.ticket_deliverables
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.ticket_progress tp
      WHERE tp.user_id = auth.uid()
        AND tp.ticket_id = ticket_deliverables.ticket_id
        AND tp.status IN ('submitted'::ticket_status,'reviewed'::ticket_status,'resolved'::ticket_status,'closed'::ticket_status)
    )
  );

CREATE POLICY "td_own_update" ON public.ticket_deliverables
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.ticket_progress tp
      WHERE tp.user_id = auth.uid()
        AND tp.ticket_id = ticket_deliverables.ticket_id
        AND tp.status IN ('submitted'::ticket_status,'reviewed'::ticket_status,'resolved'::ticket_status,'closed'::ticket_status)
    )
  )
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "td_own_delete" ON public.ticket_deliverables
  FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.ticket_progress tp
      WHERE tp.user_id = auth.uid()
        AND tp.ticket_id = ticket_deliverables.ticket_id
        AND tp.status IN ('submitted'::ticket_status,'reviewed'::ticket_status,'resolved'::ticket_status,'closed'::ticket_status)
    )
  );

-- 4) user_roles: explicit anon deny
REVOKE ALL ON public.user_roles FROM anon;
CREATE POLICY "roles_deny_anon" ON public.user_roles
  AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);
