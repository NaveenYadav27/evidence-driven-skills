
-- 1. profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  ssid text UNIQUE,
  country text,
  suspended boolean NOT NULL DEFAULT false,
  last_active_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- is_admin helper
CREATE OR REPLACE FUNCTION public.is_admin(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user AND role IN ('admin'::app_role, 'super_admin'::app_role)
  )
$$;

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY profiles_admin_all ON public.profiles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 2. courses
CREATE TABLE public.lms_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  tier text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lms_courses TO authenticated;
GRANT ALL ON public.lms_courses TO service_role;
ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY courses_read ON public.lms_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY courses_admin ON public.lms_courses FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 3. modules
CREATE TABLE public.lms_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  hours numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);
GRANT SELECT ON public.lms_modules TO authenticated;
GRANT ALL ON public.lms_modules TO service_role;
ALTER TABLE public.lms_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY modules_read ON public.lms_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY modules_admin ON public.lms_modules FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 4. enrollments
CREATE TYPE public.enrollment_status AS ENUM ('full','demo','suspended','revoked');
CREATE TABLE public.lms_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  status public.enrollment_status NOT NULL DEFAULT 'demo',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  hours_spent numeric NOT NULL DEFAULT 0,
  progress_pct numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lms_enrollments TO authenticated;
GRANT ALL ON public.lms_enrollments TO service_role;
ALTER TABLE public.lms_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY enroll_select_own ON public.lms_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY enroll_admin ON public.lms_enrollments FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 5. module assignments
CREATE TABLE public.lms_module_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.lms_modules(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);
GRANT SELECT, INSERT, DELETE ON public.lms_module_assignments TO authenticated;
GRANT ALL ON public.lms_module_assignments TO service_role;
ALTER TABLE public.lms_module_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY massign_select_own ON public.lms_module_assignments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY massign_admin ON public.lms_module_assignments FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 6. mentor assignments
CREATE TABLE public.lms_mentor_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, mentor_id)
);
GRANT SELECT, INSERT, DELETE ON public.lms_mentor_assignments TO authenticated;
GRANT ALL ON public.lms_mentor_assignments TO service_role;
ALTER TABLE public.lms_mentor_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY mentor_select_own ON public.lms_mentor_assignments FOR SELECT TO authenticated USING (auth.uid() = student_id OR auth.uid() = mentor_id);
CREATE POLICY mentor_admin ON public.lms_mentor_assignments FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 7. soc tiers
CREATE TABLE public.lms_soc_tiers (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lms_soc_tiers TO authenticated;
GRANT ALL ON public.lms_soc_tiers TO service_role;
ALTER TABLE public.lms_soc_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY soc_select_own ON public.lms_soc_tiers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY soc_admin ON public.lms_soc_tiers FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 8. invites
CREATE TABLE public.lms_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  course_ids uuid[] DEFAULT '{}'::uuid[]
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lms_invites TO authenticated;
GRANT ALL ON public.lms_invites TO service_role;
ALTER TABLE public.lms_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY invites_admin ON public.lms_invites FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 9. audit log
CREATE TABLE public.lms_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_user_id uuid,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.lms_audit_log TO authenticated;
GRANT ALL ON public.lms_audit_log TO service_role;
ALTER TABLE public.lms_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_admin ON public.lms_audit_log FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 10. updated_at triggers
CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_enroll_touch BEFORE UPDATE ON public.lms_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 11. SSID generator + auto profile on signup
CREATE OR REPLACE FUNCTION public.gen_ssid() RETURNS text LANGUAGE sql AS $$
  SELECT 'SX-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, ssid)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), public.gen_ssid())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. backfill profiles for existing users
INSERT INTO public.profiles (id, full_name, ssid)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), public.gen_ssid()
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- 13. Seed superadmin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role FROM auth.users WHERE email = 'nkyadav@shadowxlab.com'
ON CONFLICT DO NOTHING;

-- 14. Seed starter courses
INSERT INTO public.lms_courses (slug, title, description, tier) VALUES
  ('ceh-v13', 'CEH v13 — Certified Ethical Hacker', 'Full 20-module CEH v13 curriculum with hands-on labs.', 'pro'),
  ('cyberops', 'CyberOPS Analyst', 'SOC analyst tier-based training: triage, hunting, IR.', 'pro')
ON CONFLICT (slug) DO NOTHING;

-- Seed Week 1 modules for CEH
INSERT INTO public.lms_modules (course_id, slug, title, order_index, hours)
SELECT c.id, m.slug, m.title, m.idx, 1
FROM public.lms_courses c, (VALUES
  ('m01-intro','Module 01 — Intro to Ethical Hacking',1),
  ('m02-footprinting','Module 02 — Footprinting & Recon',2)
) AS m(slug,title,idx)
WHERE c.slug = 'ceh-v13'
ON CONFLICT DO NOTHING;
