
-- 1. Remove self-insert privilege escalation on xp_ledger and user_badges
DROP POLICY IF EXISTS "Users insert own xp" ON public.xp_ledger;
DROP POLICY IF EXISTS "Users insert own badges" ON public.user_badges;
REVOKE INSERT ON public.xp_ledger FROM authenticated;
REVOKE INSERT ON public.user_badges FROM authenticated;

-- 2. Lock down profile columns - users cannot self-modify suspended or ssid
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, country, last_active_at, updated_at) ON public.profiles TO authenticated;

-- 3. Add missing UPDATE policy for user_bookmarks
CREATE POLICY "Users update own bookmarks"
  ON public.user_bookmarks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
