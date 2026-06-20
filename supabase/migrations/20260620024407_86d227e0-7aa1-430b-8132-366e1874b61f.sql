
-- 1) profiles: restrict UPDATE columns so users cannot self-assign ssid/suspended
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, country, last_active_at, updated_at) ON public.profiles TO authenticated;

-- 2) lms_modules: restrict reads to enrolled users, assigned users, or admins
DROP POLICY IF EXISTS modules_read ON public.lms_modules;
CREATE POLICY modules_read ON public.lms_modules
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.lms_enrollments e
      WHERE e.user_id = auth.uid() AND e.course_id = lms_modules.course_id
    )
    OR EXISTS (
      SELECT 1 FROM public.lms_module_assignments a
      WHERE a.user_id = auth.uid() AND a.module_id = lms_modules.id
    )
  );

-- 3) lms_invites: let an invited user read their own pending invite
CREATE POLICY invites_select_own_email ON public.lms_invites
  FOR SELECT TO authenticated
  USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- 4) recalculate_user_progress: revoke from authenticated, admins/service_role only
REVOKE EXECUTE ON FUNCTION public.recalculate_user_progress(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_user_progress(uuid) TO service_role;
