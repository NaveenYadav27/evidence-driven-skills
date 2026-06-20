
REVOKE EXECUTE ON FUNCTION public.recalculate_user_progress(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_user_progress(UUID) TO service_role;
