import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Shield, Mail, Lock, Loader2, User } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · CEH v13 Cyber Range" },
      { name: "description", content: "Sign in to sync your CEH v13 lab telemetry across devices." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created", { description: "Check your inbox to confirm, then sign in." });
        setMode("sign-in");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in", { description: "Syncing your telemetry…" });
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <div className="panel panel-accent p-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Operator Access</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">{mode === "sign-in" ? "Sign in" : "Create operator profile"}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sync your lab telemetry, streaks, and exam readiness across every device.
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-secondary/40 px-4 py-2.5 text-sm font-medium hover:bg-secondary/70 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.45.34-2.11V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/></svg>
          )}
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or email <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">Email</span>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-secondary/40 border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/60"
                placeholder="operator@shadowxlab.io"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Password</span>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-secondary/40 border border-border pl-9 pr-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/60"
                placeholder="••••••••"
              />
            </div>
          </label>
          <button
            type="submit" disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-muted-foreground">
          {mode === "sign-in" ? (
            <>New operator? <button onClick={() => setMode("sign-up")} className="text-[var(--cyan)] hover:underline">Create profile</button></>
          ) : (
            <>Already enrolled? <button onClick={() => setMode("sign-in")} className="text-[var(--cyan)] hover:underline">Sign in</button></>
          )}
        </div>
        <div className="mt-3 text-center text-[10px] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to range</Link>
        </div>
      </div>
    </div>
  );
}
