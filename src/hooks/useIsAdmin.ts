import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const [state, setState] = useState<{ loading: boolean; isAdmin: boolean; userId: string | null }>({
    loading: true, isAdmin: false, userId: null,
  });

  useEffect(() => {
    let alive = true;
    async function check() {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id ?? null;
      if (!uid) { if (alive) setState({ loading: false, isAdmin: false, userId: null }); return; }
      const { data, error } = await supabase.rpc("is_admin", { _user: uid });
      if (alive) setState({ loading: false, isAdmin: !error && !!data, userId: uid });
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((evt) => {
      if (evt === "SIGNED_IN" || evt === "SIGNED_OUT") check();
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  return state;
}
