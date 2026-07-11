import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getModule, MODULES } from "@/data/modules";
import { getModuleLabs } from "@/data/labs";
import { hoursForModule } from "@/data/day1";
import { BookOpen, Terminal, Trophy, ClipboardCheck, GraduationCap, ArrowRight, Lock, AlertTriangle, Lightbulb, Eye, BookMarked, Calendar } from "lucide-react";
import { M02ModuleEnhancements } from "@/components/modules/m02/M02Enhancements";
import { M03ModuleEnhancements } from "@/components/modules/m03/M03Enhancements";
import { GenericModuleEnhancements, MODULE_ENHANCEMENTS } from "@/components/modules/GenericModuleEnhancements";

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

      {/* Week 1 cross-reference */}
      {(() => {
        const hours = hoursForModule(m.id);
        if (!hours.length) return null;
        return (
          <div className="mt-6 panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-[var(--cyan)]" />
              <h3 className="text-sm uppercase tracking-wider font-semibold">Covered in Week 1 — Mission-driven walkthrough</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Every concept in this module is taught hour-by-hour in Week 1 with story, knowledge maps, and interactive labs.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {hours.map((h) => {
                const Icon = h.icon;
                return (
                  <Link key={h.slug} to="/day1/$hour" params={{ hour: h.slug }}
                    className="rounded-md border border-border bg-secondary/30 p-3 flex items-center gap-3 hover:border-[var(--cyan)]/50 transition group">
                    <div className="rounded border border-border bg-background/50 p-2"><Icon className="h-4 w-4 text-[var(--cyan)]" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Hour {h.hour} · {h.labs.length} labs</div>
                      <div className="text-sm font-semibold truncate">{h.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{h.subtitle}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--cyan)] group-hover:translate-x-1 transition" />
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })()}

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
        {tab === "learn" && m.slug === "footprinting-and-reconnaissance" && (
          <div className="mb-8"><M02ModuleEnhancements /></div>
        )}
        {tab === "learn" && m.slug === "scanning-networks" && (
          <div className="mb-8"><M03ModuleEnhancements /></div>
        )}
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
  m01: {
    sections: [
      { icon: Eye, title: "What is Ethical Hacking?", body: "Ethical hacking is the authorised, scoped, and lawful emulation of adversary tradecraft against an organisation's assets to expose weaknesses before criminals do. The defining word is authorisation — written, signed, with explicit scope, time-box, and rules of engagement. Without it the same actions are felonies under laws like the US CFAA, the UK Computer Misuse Act, and India's IT Act §43/§66." },
      { icon: BookMarked, title: "The CIA Triad + DAD", body: "Every defensive control and every offensive objective ultimately maps to Confidentiality, Integrity, or Availability. Attackers chase the inverse — Disclosure, Alteration, Destruction (DAD). CEH expects you to classify any incident into one of these six outcomes, e.g. ransomware = Availability loss + Disclosure (double-extortion), defacement = Integrity loss." },
      { icon: Terminal, title: "Threat actors & motivations", body: "Script kiddies (low skill, opportunistic), hacktivists (ideology), organised cybercrime (financial), insiders (access + grievance), state-sponsored APTs (espionage/sabotage), and cyber-terrorists (disruption). Motivation drives TTPs — APTs invest in zero-days and long-dwell persistence; ransomware crews prefer IAB-sourced VPN access and rapid encryption." },
      { icon: Eye, title: "Cyber Kill Chain (Lockheed Martin)", body: "Seven phases: Recon → Weaponization → Delivery → Exploitation → Installation → Command & Control → Actions on Objectives. Breaking any single link disrupts the attack. CEH commonly tests which phase a control mitigates — e.g. EDR memory scanning hits Installation, egress filtering hits C2, user awareness training hits Delivery." },
      { icon: BookMarked, title: "MITRE ATT&CK Framework", body: "A living matrix of 14 Enterprise tactics (the adversary's goal — Initial Access, Execution, Persistence, …, Impact) and hundreds of techniques (the how — T1059 Command Interpreter, T1547.001 Registry Run Keys, T1105 Ingress Tool Transfer). Sub-techniques use dotted notation (T1059.001 = PowerShell). Unlike the Kill Chain, ATT&CK is non-linear and built from observed in-the-wild behaviour." },
      { icon: Terminal, title: "Penetration-testing methodology", body: "Pre-engagement (scope, ROE, NDA, get-out-of-jail letter) → Reconnaissance → Scanning & Enumeration → Vulnerability Analysis → Exploitation → Post-Exploitation (privilege escalation, lateral movement, persistence, exfil simulation) → Reporting & Re-test. Engagement types: Black-box (zero knowledge), Grey-box (limited credentials/docs), White-box (full source + architecture). Modes: External, Internal, Web App, Wireless, Social-Engineering, Red Team, Purple Team." },
      { icon: Lightbulb, title: "Standards, laws & frameworks", body: "Risk frameworks: NIST CSF (Identify-Protect-Detect-Respond-Recover) and NIST SP 800-30 (risk = likelihood × impact). Governance: ISO/IEC 27001 (ISMS), SOC 2 (trust services). Privacy: GDPR (EU), HIPAA (US healthcare), PCI-DSS (cardholder data — pen-test required §11.3), DPDP Act 2023 (India). Pentest methodologies: PTES, OSSTMM, OWASP WSTG, NIST SP 800-115." },
      { icon: AlertTriangle, title: "CEH v13 exam focus & common traps", body: "Memorise: 7 kill-chain phases in order, 14 ATT&CK tactics, CIA vs DAD, hat colours (white/black/grey/red/blue/purple/green), vulnerability vs threat vs risk vs exposure, defence-in-depth layers, and the CVSS v3.1 metric groups (Base / Temporal / Environmental). Common traps: confusing risk and threat, calling zone transfer 'passive' (it's active), assuming ATT&CK and Kill Chain are interchangeable (they aren't — ATT&CK starts after Initial Access in Lockheed terms)." },
    ],
  },
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
