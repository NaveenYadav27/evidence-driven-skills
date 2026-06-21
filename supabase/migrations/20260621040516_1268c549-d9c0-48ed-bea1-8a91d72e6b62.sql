
-- 1) profiles: prevent users updating ssid / suspended via Data API
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, country, last_active_at, updated_at) ON public.profiles TO authenticated;

-- 2) xp_ledger: only service_role may write
REVOKE INSERT, UPDATE, DELETE ON public.xp_ledger FROM authenticated, anon;
DROP POLICY IF EXISTS "xp_ledger_no_user_insert" ON public.xp_ledger;
CREATE POLICY "xp_ledger_no_user_insert" ON public.xp_ledger
  FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "xp_ledger_no_user_update" ON public.xp_ledger;
CREATE POLICY "xp_ledger_no_user_update" ON public.xp_ledger
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "xp_ledger_no_user_delete" ON public.xp_ledger;
CREATE POLICY "xp_ledger_no_user_delete" ON public.xp_ledger
  FOR DELETE TO authenticated USING (false);

-- 3) user_badges: only service_role / admins may write
REVOKE INSERT, UPDATE, DELETE ON public.user_badges FROM authenticated, anon;
DROP POLICY IF EXISTS "user_badges_no_user_insert" ON public.user_badges;
CREATE POLICY "user_badges_no_user_insert" ON public.user_badges
  FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "user_badges_no_user_update" ON public.user_badges;
CREATE POLICY "user_badges_no_user_update" ON public.user_badges
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "user_badges_no_user_delete" ON public.user_badges;
CREATE POLICY "user_badges_no_user_delete" ON public.user_badges
  FOR DELETE TO authenticated USING (false);
