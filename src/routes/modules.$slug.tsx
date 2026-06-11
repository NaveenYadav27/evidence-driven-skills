import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getModule, MODULES } from "@/data/modules";
import { getModuleLabs } from "@/data/labs";
import { BookOpen, Terminal, Trophy, ClipboardCheck, GraduationCap, ArrowRight, Lock, AlertTriangle, Lightbulb, Eye, BookMarked } from "lucide-react";

export const Route = createFileRoute("/modules/$slug")({
  loader: ({ params }) => {
    const m = getModule(params.slug);
    if (!m) throw notFound();
    return { module: m };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.module.title} · CEH v13 Cyber Range` },
      { name: "description", content: loaderData?.module.short ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl py-24 px-6 text-center">
      <h1 className="text-2xl font-bold">Module not found</h1>
      <Link to="/modules" className="text-[var(--cyan)] hover:underline mt-3 inline-block">← All modules</Link>
    </div>
  ),
  component: ModuleDetail,
});

const TABS = [
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "labs", label: "Labs", icon: Terminal },
  { id: "challenges", label: "Challenges", icon: Trophy },
  { id: "assessment", label: "Assessment", icon: ClipboardCheck },
  { id: "mastery", label: "Mastery", icon: GraduationCap },
] as const;

type TabId = typeof TABS[number]["id"];

function ModuleDetail() {
  const { module: m } = Route.useLoaderData();
  const [tab, setTab] = useState<TabId>("learn");
  const labs = getModuleLabs(m.id);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="panel panel-accent p-6 sm:p-8 overflow-hidden relative">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-muted-foreground">MODULE {m.number.toString().padStart(2, "0")} · {m.domain.toUpperCase()}</span>
              {m.status === "available"
                ? <span className="chip chip-live"><span className="dot-live" /> Available</span>
                : <span className="chip chip-red"><Lock className="h-3 w-3" /> Preview Build</span>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{m.title}</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">{m.short}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {m.tools.map((t: string) => (
                <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded border border-border bg-secondary/50">{t}</span>
              ))}
            </div>
          </div>
          <div className="font-mono text-xs text-right text-muted-foreground space-y-1">
            <div><span className="text-foreground text-base">{m.labCount}</span> labs</div>
            <div><span className="text-foreground text-base">{m.challengeCount}</span> challenges</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-border flex gap-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-3 text-sm inline-flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              tab === id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "learn" && <LearnTab moduleTitle={m.title} moduleId={m.id} />}
        {tab === "labs" && <LabsTab labs={labs} status={m.status} />}
        {tab === "challenges" && <ChallengesTab labs={labs.filter(l => l.kind === "challenge")} status={m.status} />}
        {tab === "assessment" && <AssessmentTab moduleId={m.id} status={m.status} />}
        {tab === "mastery" && <MasteryTab moduleId={m.id} />}
      </div>

      {/* Nav */}
      <div className="mt-12 flex justify-between text-sm">
        {(() => {
          const idx = MODULES.findIndex(x => x.id === m.id);
          const prev = MODULES[idx - 1]; const next = MODULES[idx + 1];
          return (
            <>
              {prev ? <Link to="/modules/$slug" params={{ slug: prev.slug }} className="text-muted-foreground hover:text-foreground">← {prev.title}</Link> : <span />}
              {next ? <Link to="/modules/$slug" params={{ slug: next.slug }} className="text-[var(--cyan)] hover:underline">{next.title} →</Link> : <span />}
            </>
          );
        })()}
      </div>
    </div>
  );
}

/* -------- Learn -------- */
const LEARN_CONTENT: Record<string, { sections: { icon: any; title: string; body: string }[] }> = {
  m02: {
    sections: [
      { icon: Eye, title: "What is Footprinting?", body: "Footprinting is the methodical collection of information about a target — its domains, IPs, technologies, people, and exposed services — *before* sending any disruptive traffic. It is the first phase of the ethical-hacking lifecycle." },
      { icon: BookMarked, title: "Why it matters", body: "Strong footprinting shrinks the attack surface to the parts that actually exist. Lazy recon = noisy scans, missed assets, and false positives in later phases." },
      { icon: Terminal, title: "How it works", body: "Passive recon uses public sources only (WHOIS/RDAP, DNS, Certificate Transparency, search engines, Wayback Machine). Active recon issues queries to the target directly. CEH expects you to know both, and the legal boundary between them." },
      { icon: Lightbulb, title: "CEH v13 exam focus", body: "Expect MCQs on: WHOIS fields (registrar, registrant, dates), DNS record types (A/AAAA/MX/NS/TXT/SOA), Google dorks, tools (theHarvester, Sublist3r, Maltego), Certificate Transparency, and OSINT methodology." },
      { icon: AlertTriangle, title: "Common mistakes", body: "Confusing passive vs. active. Forgetting that DNS zone transfers are an *active* technique. Ignoring SOA & TXT records (SPF/DKIM leak mail infrastructure)." },
    ],
  },
  m13: {
    sections: [
      { icon: Eye, title: "What is web server hacking?", body: "Attacking the HTTP server itself — Apache, Nginx, IIS, or the load balancer in front of them — rather than the web application running on top. Targets misconfiguration, default credentials, exposed admin panels, missing security headers, and known CVEs in the server software." },
      { icon: BookMarked, title: "Why it matters", body: "A single weak header (no HSTS), a leaked Server banner, or a Disallow path pointing to /admin can give an attacker the foothold they need long before any app-level vulnerability is exploited. CEH treats the server tier as a first-class attack surface." },
      { icon: Terminal, title: "How it works", body: "Probe HTTP response headers to fingerprint server software and audit defence-in-depth headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options). Parse robots.txt and sitemap.xml to discover paths the operator wanted hidden. Cross-reference banner versions with CVE databases." },
      { icon: Lightbulb, title: "CEH v13 exam focus", body: "Web server architecture, common misconfigurations (directory listing, default pages, verbose errors), banner grabbing, security headers, robots.txt as recon, and server-specific vulnerabilities (IIS short-name, Apache module flaws, Nginx alias traversal)." },
      { icon: AlertTriangle, title: "Common mistakes", body: "Treating robots.txt as a security control (it's a recon goldmine). Trusting the Server header as ground truth (it can be spoofed). Skipping HEAD vs GET differential analysis. Ignoring the CDN/WAF layer when fingerprinting." },
    ],
  },
};

function LearnTab({ moduleId, moduleTitle }: { moduleId: string; moduleTitle: string }) {
  const c = LEARN_CONTENT[moduleId];
  if (!c) {
    return (
      <div className="panel p-8 text-center text-muted-foreground">
        <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Learn content for <span className="text-foreground font-semibold">{moduleTitle}</span> is being authored.</p>
        <p className="text-xs mt-1">Module 02 (Footprinting) is fully available now — open it to see the format.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {c.sections.map((s, i) => (
        <div key={i} className="panel p-5">
          <div className="flex items-center gap-2 mb-2 text-[var(--cyan)]"><s.icon className="h-4 w-4" /><h3 className="text-sm font-semibold uppercase tracking-wider">{s.title}</h3></div>
          <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  );
}

/* -------- Labs -------- */
function LabsTab({ labs, status }: { labs: ReturnType<typeof getModuleLabs>; status: "available" | "preview" | "locked" }) {
  if (status !== "available") return <PreviewNotice />;
  const real = labs.filter(l => l.kind === "terminal");
  return (
    <div className="space-y-3">
      {real.map((l) => (
        <Link key={l.id} to="/labs/$slug" params={{ slug: l.slug }}
              className="panel p-5 flex items-center justify-between gap-4 hover:border-[var(--cyan)]/50 transition">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="chip chip-cyan">{l.difficulty}</span>
              <span className="text-xs text-muted-foreground font-mono">~{l.estMinutes}m</span>
            </div>
            <div className="font-semibold">{l.title}</div>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{l.scenario}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-[var(--cyan)] shrink-0" />
        </Link>
      ))}
    </div>
  );
}

/* -------- Challenges -------- */
function ChallengesTab({ labs, status }: { labs: ReturnType<typeof getModuleLabs>; status: "available" | "preview" | "locked" }) {
  if (status !== "available") return <PreviewNotice />;
  if (!labs.length) return <p className="text-sm text-muted-foreground">No challenges yet for this module.</p>;
  return (
    <div className="space-y-3">
      {labs.map((l) => (
        <Link key={l.id} to="/labs/$slug" params={{ slug: l.slug }}
              className="panel panel-accent p-5 flex items-center justify-between gap-4 group">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="chip chip-red"><Trophy className="h-3 w-3" /> Challenge</span>
              <span className="chip">{l.difficulty}</span>
            </div>
            <div className="font-semibold">{l.title}</div>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{l.scenario}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-primary shrink-0 group-hover:translate-x-1 transition" />
        </Link>
      ))}
    </div>
  );
}

/* -------- Assessment -------- */
function AssessmentTab({ status }: { moduleId: string; status: "available" | "preview" | "locked" }) {
  if (status !== "available") return <PreviewNotice />;
  return (
    <div className="panel p-8 text-center">
      <ClipboardCheck className="h-8 w-8 mx-auto mb-3 text-[var(--cyan)]" />
      <h3 className="font-semibold">Assessment Engine</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
        Scenario-based MCQs, tool-output analysis and viva-style questions. Unlock by completing the module's labs first — assessment results feed your readiness score.
      </p>
      <span className="mt-4 inline-block chip">Unlocks after labs</span>
    </div>
  );
}

/* -------- Mastery -------- */
function MasteryTab({ moduleId: _moduleId }: { moduleId: string }) {
  return (
    <div className="panel p-8 text-center">
      <GraduationCap className="h-8 w-8 mx-auto mb-3 text-[var(--cyan)]" />
      <h3 className="font-semibold">Mastery Report</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
        Generated automatically from your lab telemetry, command accuracy, challenge results and assessment scores. Will populate as you complete this module.
      </p>
    </div>
  );
}

function PreviewNotice() {
  return (
    <div className="panel p-8 text-center">
      <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
      <h3 className="font-semibold">Preview build</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
        This module is on the public roadmap. <span className="text-foreground">Module 02 — Footprinting</span> is fully playable now and demonstrates the production format: real tools, real outputs, evidence-based completion.
      </p>
      <Link to="/modules/$slug" params={{ slug: "footprinting-and-reconnaissance" }}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        Open Module 02 <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
