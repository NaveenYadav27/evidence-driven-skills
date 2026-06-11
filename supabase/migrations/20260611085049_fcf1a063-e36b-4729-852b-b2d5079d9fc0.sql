
CREATE TABLE public.user_telemetry_state (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_telemetry_state TO authenticated;
GRANT ALL ON public.user_telemetry_state TO service_role;

ALTER TABLE public.user_telemetry_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "telemetry_select_own" ON public.user_telemetry_state
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "telemetry_insert_own" ON public.user_telemetry_state
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "telemetry_update_own" ON public.user_telemetry_state
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "telemetry_delete_own" ON public.user_telemetry_state
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER user_telemetry_state_touch
  BEFORE UPDATE ON public.user_telemetry_state
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
