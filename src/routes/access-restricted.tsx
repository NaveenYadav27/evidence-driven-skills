import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/access-restricted")({
  head: () => ({ meta: [{ title: "Access restricted · ShadowXLab" }] }),
  component: AccessRestricted,
});

function AccessRestricted() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <div className="panel panel-accent p-10 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-400" />
        <h1 className="mt-4 text-2xl font-bold">Access restricted</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your account is not enabled for the ShadowXLab learning platform. Access is controlled by the administrator.
          Contact your admin to be granted a course or trial.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" /> admin@shadowxlab.com
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
          className="mt-6 rounded-md border border-border px-4 py-2 text-xs hover:border-primary/60"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
