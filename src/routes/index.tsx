import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/Brand";
import { LiveDashboard } from "@/components/LiveDashboard";
import { MODULES, TOTAL_LABS, TOTAL_CHALLENGES } from "@/data/modules";
import { ArrowRight, Terminal, LayoutDashboard, Play, Shield, Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CEH v13 Cyber Range · ShadowXLab" },
      { name: "description", content: "Master CEH v13 through real practice. 20 official modules, 221+ hands-on labs, evidence-based progression — not videos, not quizzes." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full opacity-40 blur-3xl"
             style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 60%, transparent), transparent)" }} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 relative">
          <div className="flex items-center gap-3 mb-6">
            <BrandMark className="h-10 w-auto" />
            <div className="flex items-center gap-2">
              <span className="chip chip-red"><Shield className="h-3 w-3" /> ShadowXLab Cyber Range</span>
              <span className="chip chip-cyan">CEH v13</span>
            </div>
          </div>

          <h1 className="font-mono text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
            <span className="text-grad">CEH v13 Cyber Range</span>
          </h1>
          <p className="mt-5 text-xl sm:text-2xl text-muted-foreground max-w-3xl">
            Master Ethical Hacking Through <span className="text-foreground">Real Practice</span>.
          </p>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
            Not videos. Not click-to-complete. Every objective is earned through commands executed, findings validated, and challenges solved.
          </p>

          {/* PILLARS */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl">
            {[
              { k: "20", v: "Official Modules" },
              { k: `${TOTAL_LABS}+`, v: "Hands-On Labs" },
              { k: `${TOTAL_CHALLENGES}+`, v: "Challenges" },
              { k: "100%", v: "Evidence-Based" },
              { k: "Live", v: "Tool Telemetry" },
            ].map((p) => (
              <div key={p.v} className="panel p-4">
                <div className="font-mono text-2xl font-bold text-grad">{p.k}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{p.v}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/modules/$slug" params={{ slug: "footprinting-and-reconnaissance" }}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
                  style={{ boxShadow: "var(--shadow-glow-red)" }}>
              <Play className="h-4 w-4" /> Continue Learning
            </Link>
            <Link to="/labs/$slug" params={{ slug: "whois-recon" }}
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--cyan)]/40 bg-[var(--cyan)]/10 px-5 py-3 text-sm font-semibold text-[var(--cyan)] hover:bg-[var(--cyan)]/20 transition"
                  style={{ boxShadow: "var(--shadow-glow-cyan)" }}>
              <Terminal className="h-4 w-4" /> Launch Lab
            </Link>
            <Link to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary transition">
              <LayoutDashboard className="h-4 w-4" /> Open Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* LIVE DASHBOARD */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="chip chip-live mb-3"><span className="dot-live" /> Live Telemetry</div>
            <h2 className="text-2xl sm:text-3xl font-bold">Your Cyber Range Activity</h2>
            <p className="text-sm text-muted-foreground mt-1">Real metrics from your own actions — no fake percentages.</p>
          </div>
          <Link to="/dashboard" className="text-sm text-[var(--cyan)] hover:underline inline-flex items-center gap-1">
            Full dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <LiveDashboard />
      </section>

      {/* MODULES PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="chip mb-3">Learning Path</div>
            <h2 className="text-2xl sm:text-3xl font-bold">20 Official CEH v13 Modules</h2>
          </div>
          <Link to="/modules" className="text-sm text-[var(--cyan)] hover:underline inline-flex items-center gap-1">
            All modules <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.slice(0, 6).map((m) => (
            <Link
              key={m.id}
              to="/modules/$slug"
              params={{ slug: m.slug }}
              className="panel panel-accent p-5 group hover:translate-y-[-2px] transition relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="chip chip-red">Module {m.number.toString().padStart(2, "0")}</span>
                {m.status === "available" ? (
                  <span className="chip chip-live"><span className="dot-live" /> Available</span>
                ) : (
                  <span className="chip"><Lock className="h-3 w-3" /> Preview</span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{m.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{m.short}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>{m.labCount} labs · {m.challengeCount} challenges</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition text-[var(--cyan)]" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
