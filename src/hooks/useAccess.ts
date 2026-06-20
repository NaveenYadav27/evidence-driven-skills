import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type State = {
  loading: boolean;
  userId: string | null;
  isAdmin: boolean;
  hasEnrollment: boolean;
  suspended: boolean;
};

/**
 * Resolves the current viewer's access tier:
 *  - admin/super_admin → full platform access
 *  - has any non-suspended enrollment (full/demo) → student access
 *  - otherwise → no access (redirect to /access-restricted)
 */
export function useAccess() {
  const [state, setState] = useState<State>({
    loading: true, userId: null, isAdmin: false, hasEnrollment: false, suspended: false,
  });

  useEffect(() => {
    let alive = true;
    async function check() {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id ?? null;
      if (!uid) {
        if (alive) setState({ loading: false, userId: null, isAdmin: false, hasEnrollment: false, suspended: false });
        return;
      }
      const [{ data: admin }, { data: enr }, { data: prof }] = await Promise.all([
        supabase.rpc("is_admin", { _user: uid }),
        supabase.from("lms_enrollments").select("status").eq("user_id", uid),
        supabase.from("profiles").select("suspended").eq("id", uid).maybeSingle(),
      ]);
      const isAdmin = !!admin;
      const suspended = !!prof?.suspended;
      const hasEnrollment = (enr ?? []).some((e: any) => e.status === "full" || e.status === "demo");
      if (alive) setState({ loading: false, userId: uid, isAdmin, hasEnrollment, suspended });
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((evt) => {
      if (evt === "SIGNED_IN" || evt === "SIGNED_OUT") check();
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  return { ...state, hasAccess: !state.suspended && (state.isAdmin || state.hasEnrollment) };
}
