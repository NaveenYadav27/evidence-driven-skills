REVOKE EXECUTE ON FUNCTION public.recalculate_user_progress(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_user_progress(uuid) TO service_role;