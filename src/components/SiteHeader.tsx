import { Link } from "@tanstack/react-router";
import { PlatformBadge } from "./Brand";
import { Activity, Shield, Terminal, LayoutDashboard, BookOpen } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Shield },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/modules", label: "Modules", icon: BookOpen },
  { to: "/labs/whois-recon", label: "Quick Lab", icon: Terminal },
];

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
          <span className="chip chip-live"><span className="dot-live" /> Range Online</span>
          <span className="chip hidden sm:inline-flex"><Activity className="h-3 w-3" /> v13.0</span>
        </div>
      </div>
    </header>
  );
}
