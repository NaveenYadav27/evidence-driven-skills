import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Lock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password · CEH v13 Cyber Range" },
      { name: "description", content: "Set a new password for your ShadowXLab operator account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-exchanges the recovery token from the URL hash on load.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated", { description: "You're signed in." });
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <div className="panel panel-accent p-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Recovery</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Set new password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {ready
            ? "Choose a new password for your operator account."
            : "Waiting for recovery link… open this page from the email we sent you."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">New password</span>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-secondary/40 border border-border pl-9 pr-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/60"
                placeholder="••••••••" disabled={!ready}
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Confirm password</span>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-md bg-secondary/40 border border-border pl-9 pr-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/60"
                placeholder="••••••••" disabled={!ready}
              />
            </div>
          </label>
          <button
            type="submit" disabled={busy || !ready}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </button>
        </form>

        <div className="mt-5 text-center text-[10px] text-muted-foreground">
          <Link to="/auth" className="hover:text-foreground">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
