import { Link, useNavigate } from "@tanstack/react-router";
import { PlatformBadge } from "./Brand";
import { Activity, Shield, Terminal, LayoutDashboard, BookOpen, Calendar, Cloud, CloudOff, CheckCircle2, LogOut, LogIn, Loader2 } from "lucide-react";
import { useCloudSync } from "./CloudSyncProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navItems = [
  { to: "/", label: "Home", icon: Shield },
  { to: "/day1", label: "Day 1", icon: Calendar },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/modules", label: "Modules", icon: BookOpen },
  { to: "/labs/whois-recon", label: "Quick Lab", icon: Terminal },
];

function SyncBadge() {
  const { userId, email, status } = useCloudSync();
  if (!userId) {
    return (
      <span className="chip" title="Not synced — telemetry is local-only">
        <CloudOff className="h-3 w-3" /> Local
      </span>
    );
  }
  const map = {
    loading: { icon: Loader2, label: "Syncing", cls: "chip-cyan animate-pulse" },
    synced:  { icon: CheckCircle2, label: "Synced", cls: "chip-cyan" },
    error:   { icon: CloudOff, label: "Sync error", cls: "chip-red" },
    idle:    { icon: Cloud, label: "Cloud", cls: "chip-cyan" },
    offline: { icon: CloudOff, label: "Offline", cls: "" },
  }[status];
  const Icon = map.icon;
  return (
    <span className={`chip ${map.cls}`} title={email ?? undefined}>
      <Icon className={`h-3 w-3 ${status === "loading" ? "animate-spin" : ""}`} /> {map.label}
    </span>
  );
}

function AuthButton() {
  const { userId, email } = useCloudSync();
  const navigate = useNavigate();

  if (!userId) {
    return (
      <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary/60 hover:text-foreground text-muted-foreground">
        <LogIn className="h-3.5 w-3.5" /> Sign in
      </Link>
    );
  }
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        toast.success("Signed out");
        navigate({ to: "/" });
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary/60 text-muted-foreground hover:text-foreground"
      title={email ?? undefined}
    >
      <LogOut className="h-3.5 w-3.5" />
      <span className="hidden sm:inline max-w-[140px] truncate">{email}</span>
    </button>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="shrink-0">
          <PlatformBadge />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
              activeProps={{ className: "text-foreground bg-secondary/80" }}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <SyncBadge />
          <span className="chip hidden lg:inline-flex"><Activity className="h-3 w-3" /> v13.0</span>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
