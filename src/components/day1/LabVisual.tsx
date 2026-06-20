"use client";
/**
 * LabVisual — animated SVG diagrams + concise "how it works" bullets for every
 * Day-1 (Week-1) lab. Each entry is keyed by the lab id used in src/data/day1.ts.
 *
 * Design intent: less theory, more visual logic. Every visual must convey the
 * core mental model of the lab in under 5 seconds of scanning.
 */
import { motion } from "framer-motion";
import { Eye, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

/* ─── Reusable SVG primitives ─────────────────────────────────────────── */

const cyan = "var(--cyan)";

function Pulse({ cx, cy, r = 6, delay = 0 }: { cx: number; cy: number; r?: number; delay?: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={cyan} />
      <motion.circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={cyan} strokeWidth={1.5}
        initial={{ opacity: 0.7, scale: 1 }}
        animate={{ opacity: 0, scale: 3 }}
        transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
    </>
  );
}

function FlowArrow({ x1, y1, x2, y2, delay = 0, label }: { x1: number; y1: number; x2: number; y2: number; delay?: number; label?: string }) {
  const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2 - 6;
  return (
    <g>
      <motion.line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.2}
        strokeDasharray="3 3"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, delay, repeat: Infinity, repeatType: "loop", repeatDelay: 1.6 }}
      />
      <polygon points={`${x2},${y2} ${x2 - 5},${y2 - 3} ${x2 - 5},${y2 + 3}`} fill="currentColor" opacity={0.55} />
      {label && <text x={mx} y={my} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">{label}</text>}
    </g>
  );
}

function Node({ x, y, w = 90, h = 30, label, accent = false, sub }: { x: number; y: number; w?: number; h?: number; label: string; accent?: boolean; sub?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={accent ? "color-mix(in oklab, var(--cyan) 12%, transparent)" : "color-mix(in oklab, currentColor 4%, transparent)"}
        stroke={accent ? cyan : "currentColor"} strokeOpacity={accent ? 0.7 : 0.35} strokeWidth={1} />
      <text x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fontSize="10" fill="currentColor" fontWeight={accent ? 600 : 500}>{label}</text>
      {sub && <text x={x + w / 2} y={y + h + 11} textAnchor="middle" fontSize="8" fill="currentColor" opacity={0.55} fontFamily="ui-monospace, monospace">{sub}</text>}
    </g>
  );
}

/* ─── Visual scenes ───────────────────────────────────────────────────── */

const RiskEquation = () => (
  <svg viewBox="0 0 480 120" className="w-full h-32 text-foreground">
    <Node x={10}  y={45} label="THREAT" accent sub="adversary + intent" />
    <text x={115} y={66} fontSize="18" fill="currentColor" opacity={0.6}>×</text>
    <Node x={130} y={45} label="VULNERABILITY" sub="weakness" />
    <text x={235} y={66} fontSize="18" fill="currentColor" opacity={0.6}>×</text>
    <Node x={250} y={45} label="IMPACT" sub="business cost" />
    <text x={355} y={66} fontSize="18" fill="currentColor" opacity={0.6}>=</text>
    <Node x={375} y={45} w={95} label="RISK" accent sub="what we measure" />
    <motion.circle cx={420} cy={60} r={48} fill="none" stroke={cyan} strokeOpacity={0.25}
      animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ transformOrigin: "420px 60px" }} />
  </svg>
);

const AssetTriage = () => (
  <svg viewBox="0 0 480 120" className="w-full h-32 text-foreground">
    {[0, 1, 2, 3].map(i => (
      <motion.rect key={i} x={20 + i * 28} y={20} width={20} height={14} rx={2}
        fill="currentColor" opacity={0.35}
        animate={{ y: [20, 50 + (i % 3) * 18, 20] }}
        transition={{ duration: 4, repeat: Infinity, delay: i * 0.4 }} />
    ))}
    <text x={70} y={14} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">INVENTORY</text>
    <FlowArrow x1={150} y1={60} x2={195} y2={60} />
    <Node x={200} y={20}  w={110} h={26} label="CRITICAL" accent />
    <Node x={200} y={52}  w={110} h={26} label="SUPPORTING" />
    <Node x={200} y={84}  w={110} h={26} label="NOT AN ASSET" />
    <text x={400} y={50} fontSize="9" fill="currentColor" opacity={0.7} fontFamily="ui-monospace, monospace">VALUE × LOSS</text>
    <text x={400} y={64} fontSize="9" fill="currentColor" opacity={0.7} fontFamily="ui-monospace, monospace">IMPACT</text>
    <text x={400} y={78} fontSize="9" fill="currentColor" opacity={0.7} fontFamily="ui-monospace, monospace">↑ drives tier</text>
  </svg>
);

const ThreatActors = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    {[
      { x: 30,  label: "Criminal", motive: "$$$" },
      { x: 140, label: "Nation",   motive: "intel" },
      { x: 250, label: "Insider",  motive: "access" },
      { x: 360, label: "Natural",  motive: "no intent" },
    ].map((a, i) => (
      <g key={a.label}>
        <Node x={a.x} y={20} label={a.label} accent={i < 3} sub={a.motive} />
        <FlowArrow x1={a.x + 45} y1={66} x2={a.x + 45} y2={96} delay={i * 0.3} />
      </g>
    ))}
    <rect x={20} y={100} width={440} height={22} rx={3} fill={cyan} fillOpacity={0.08} stroke={cyan} strokeOpacity={0.4} />
    <text x={240} y={115} textAnchor="middle" fontSize="10" fill={cyan} fontWeight={600}>YOUR ASSETS</text>
  </svg>
);

const VulnToRisk = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    <Node x={15}  y={50} w={130} label="Vulnerability" sub="e.g. no rate-limit" />
    <FlowArrow x1={150} y1={65} x2={185} y2={65} label="enables" />
    <Node x={190} y={50} w={110} label="Threat path" accent sub="credential stuffing" />
    <FlowArrow x1={305} y1={65} x2={335} y2={65} label="causes" />
    <Node x={340} y={50} w={130} label="Risk statement" accent sub="account takeover" />
    <Pulse cx={80}  cy={20} r={3} delay={0} />
    <Pulse cx={245} cy={20} r={3} delay={0.6} />
    <Pulse cx={405} cy={20} r={3} delay={1.2} />
  </svg>
);

const HatSpectrum = () => (
  <svg viewBox="0 0 480 110" className="w-full h-28 text-foreground">
    <line x1={30} y1={60} x2={450} y2={60} stroke="currentColor" strokeOpacity={0.3} />
    {[
      { x: 50,  label: "BLACK",  sub: "no auth · criminal", color: "#ef4444" },
      { x: 170, label: "GREY",   sub: "no auth · helpful", color: "#a3a3a3" },
      { x: 290, label: "WHITE",  sub: "authorised", color: cyan },
      { x: 410, label: "PURPLE", sub: "red + blue live", color: "#a855f7" },
    ].map(h => (
      <g key={h.label}>
        <circle cx={h.x} cy={60} r={10} fill={h.color} fillOpacity={0.85} />
        <text x={h.x} y={38} textAnchor="middle" fontSize="10" fill="currentColor" fontWeight={600}>{h.label}</text>
        <text x={h.x} y={86} textAnchor="middle" fontSize="8" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">{h.sub}</text>
      </g>
    ))}
    <text x={30}  y={102} fontSize="8" fill="currentColor" opacity={0.5}>← unethical / illegal</text>
    <text x={450} y={102} textAnchor="end" fontSize="8" fill="currentColor" opacity={0.5}>collaborative →</text>
  </svg>
);

const RoEChecklist = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    <rect x={20} y={15} width={440} height={100} rx={6} fill="none" stroke="currentColor" strokeOpacity={0.25} />
    <text x={32} y={32} fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">RULES OF ENGAGEMENT</text>
    {["Scope (IPs/URLs)", "Timing window", "Contacts both sides", "Methods allowed", "Get-out-of-jail letter"].map((t, i) => (
      <g key={t}>
        <motion.circle cx={42} cy={52 + i * 13} r={4} fill={cyan} fillOpacity={0.85}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2, duration: 0.4 }} />
        <text x={54} y={55 + i * 13} fontSize="10" fill="currentColor">{t}</text>
      </g>
    ))}
    <Node x={330} y={45} w={120} h={30} label="SIGNED" accent />
    <text x={390} y={92}  textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">⇣ legal cover</text>
    <text x={390} y={105} textAnchor="middle" fontSize="9" fill={cyan} fontWeight={600}>ENGAGEMENT VALID</text>
  </svg>
);

const AuthzGate = () => (
  <svg viewBox="0 0 480 120" className="w-full h-32 text-foreground">
    <Node x={15} y={45} w={90} label="Action" sub="nmap / phish / dump" />
    <FlowArrow x1={110} y1={60} x2={170} y2={60} />
    <rect x={170} y={30} width={140} height={60} rx={4} fill={cyan} fillOpacity={0.08} stroke={cyan} strokeOpacity={0.5} strokeDasharray="4 3" />
    <text x={240} y={55} textAnchor="middle" fontSize="10" fontWeight={600} fill={cyan}>AUTHZ GATE</text>
    <text x={240} y={72} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">in scope? in time? signed?</text>
    <FlowArrow x1={315} y1={45} x2={365} y2={25} delay={0.2} label="yes" />
    <FlowArrow x1={315} y1={75} x2={365} y2={95} delay={0.8} label="no" />
    <Node x={370} y={10} w={100} label="GO" accent />
    <rect x={370} y={82} width={100} height={26} rx={4} fill="none" stroke="#ef4444" strokeOpacity={0.7} />
    <text x={420} y={99} textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight={600}>STOP / FELONY</text>
  </svg>
);

const ActorClasses = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    {[
      { x: 25,  label: "Script-kiddie", level: 1 },
      { x: 135, label: "Hacktivist",    level: 2 },
      { x: 245, label: "Criminal",      level: 3 },
      { x: 355, label: "APT / Nation",  level: 4 },
    ].map((a, i) => (
      <g key={a.label}>
        <Node x={a.x} y={20} label={a.label} accent={i >= 2} />
        {[0,1,2,3].map(b => (
          <rect key={b} x={a.x + 10 + b * 18} y={62} width={14} height={10} rx={1}
            fill={b < a.level ? cyan : "currentColor"} fillOpacity={b < a.level ? 0.8 : 0.15} />
        ))}
        <text x={a.x + 45} y={94} textAnchor="middle" fontSize="8" fill="currentColor" opacity={0.55} fontFamily="ui-monospace, monospace">capability</text>
      </g>
    ))}
    <text x={240} y={120} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">attribution = motive × capability × infrastructure</text>
  </svg>
);

const AttackVectors = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    <circle cx={240} cy={70} r={28} fill={cyan} fillOpacity={0.15} stroke={cyan} strokeOpacity={0.6} />
    <text x={240} y={73} textAnchor="middle" fontSize="10" fontWeight={600} fill={cyan}>TARGET</text>
    {[
      { x: 40,  y: 20, label: "Phishing" },
      { x: 40,  y: 110, label: "Web app" },
      { x: 240, y: 12, label: "Supply chain" },
      { x: 440, y: 20, label: "Stolen creds" },
      { x: 440, y: 110, label: "Exposed RDP" },
    ].map((v, i) => (
      <g key={v.label}>
        <Node x={v.x - 45} y={v.y - 10} w={90} h={20} label={v.label} />
        <FlowArrow x1={v.x + (v.x < 240 ? 45 : v.x > 240 ? -45 : 0)} y1={v.y}
          x2={240 + (v.x < 240 ? -28 : v.x > 240 ? 28 : 0)} y2={70} delay={i * 0.25} />
      </g>
    ))}
  </svg>
);

const ControlMix = () => (
  <svg viewBox="0 0 480 120" className="w-full h-32 text-foreground">
    {[
      { x: 30,  label: "Preventive", sub: "MFA, patching" },
      { x: 145, label: "Detective",  sub: "EDR, SIEM" },
      { x: 260, label: "Corrective", sub: "IR, restore" },
      { x: 375, label: "Compensating", sub: "when can't fix" },
    ].map((c, i) => (
      <g key={c.label}>
        <Node x={c.x} y={20} w={95} h={28} label={c.label} accent={i === 0} sub={c.sub} />
        <motion.line x1={c.x + 47} y1={75} x2={c.x + 47} y2={100}
          stroke={cyan} strokeOpacity={0.5}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity, repeatDelay: 2 }} />
      </g>
    ))}
    <rect x={20} y={100} width={440} height={14} rx={2} fill={cyan} fillOpacity={0.08} stroke={cyan} strokeOpacity={0.4} />
    <text x={240} y={110} textAnchor="middle" fontSize="9" fill={cyan}>RISK SURFACE REDUCED</text>
  </svg>
);

const CIATriangle = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    <polygon points="240,15 80,110 400,110" fill={cyan} fillOpacity={0.08} stroke={cyan} strokeOpacity={0.5} />
    <text x={240} y={10} textAnchor="middle" fontSize="10" fontWeight={600} fill={cyan}>C</text>
    <text x={70}  y={120} textAnchor="middle" fontSize="10" fontWeight={600} fill={cyan}>I</text>
    <text x={410} y={120} textAnchor="middle" fontSize="10" fontWeight={600} fill={cyan}>A</text>
    <text x={240} y={28} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>Confidentiality</text>
    <text x={155} y={95} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>Integrity</text>
    <text x={325} y={95} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>Availability</text>
    <text x={240} y={75} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.5} fontFamily="ui-monospace, monospace">⇆ DAD ⇆</text>
    <text x={240} y={90} textAnchor="middle" fontSize="9" fill="#ef4444" opacity={0.8} fontFamily="ui-monospace, monospace">Disclosure · Alteration · Denial</text>
  </svg>
);

const ControlTypes = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    {[
      { x: 30,  label: "Administrative", sub: "policy" },
      { x: 175, label: "Technical",      sub: "tooling" },
      { x: 320, label: "Physical",       sub: "locks" },
    ].map((c, i) => (
      <g key={c.label}>
        <Node x={c.x} y={15} w={130} h={32} label={c.label} accent={i === 1} sub={c.sub} />
        <FlowArrow x1={c.x + 65} y1={75} x2={c.x + 65} y2={100} delay={i * 0.3} />
      </g>
    ))}
    <rect x={20} y={100} width={440} height={22} rx={3} fill={cyan} fillOpacity={0.08} stroke={cyan} strokeOpacity={0.4} />
    <text x={240} y={115} textAnchor="middle" fontSize="10" fill={cyan} fontWeight={600}>3 categories × 4 functions = control matrix</text>
  </svg>
);

const DefenseInDepth = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    {[60, 90, 120, 150, 180].map((r, i) => (
      <motion.circle key={r} cx={240} cy={70} r={r/2 + 20} fill="none" stroke={cyan} strokeOpacity={0.15 + i * 0.08}
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: i * 0.15 }} />
    ))}
    <circle cx={240} cy={70} r={14} fill={cyan} fillOpacity={0.5} />
    <text x={240} y={73} textAnchor="middle" fontSize="9" fill="currentColor" fontWeight={600}>ASSET</text>
    {[
      { x: 80,  label: "Perimeter" },
      { x: 80,  y: 110, label: "Network" },
      { x: 400, label: "Host" },
      { x: 400, y: 110, label: "App" },
      { x: 240, y: 12, label: "Identity" },
    ].map(l => (
      <text key={l.label} x={l.x} y={l.y ?? 28} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7} fontFamily="ui-monospace, monospace">{l.label}</text>
    ))}
    <motion.circle cx={50} cy={70} r={5} fill="#ef4444"
      animate={{ x: [0, 160, 160, 0], opacity: [1, 1, 0, 0] }}
      transition={{ duration: 4, repeat: Infinity }} />
  </svg>
);

const KillChain = () => {
  const stages = ["Recon", "Weapon", "Deliver", "Exploit", "Install", "C2", "Actions"];
  return (
    <svg viewBox="0 0 480 110" className="w-full h-28 text-foreground">
      {stages.map((s, i) => {
        const x = 10 + i * 65;
        return (
          <g key={s}>
            <Node x={x} y={35} w={55} h={28} label={s} accent={i === 2} />
            {i < stages.length - 1 && <FlowArrow x1={x + 55} y1={49} x2={x + 65} y2={49} delay={i * 0.2} />}
          </g>
        );
      })}
      <text x={240} y={20} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">earlier break = cheaper defence →</text>
      <motion.rect x={140} y={32} width={59} height={34} rx={4} fill="none" stroke={cyan}
        animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
      <text x={240} y={92} textAnchor="middle" fontSize="9" fill={cyan}>break here = stop the chain</text>
    </svg>
  );
};

const AttackMatrix = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    <text x={20} y={20} fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">TACTIC (why) →</text>
    {["Init", "Exec", "Persist", "PrivEsc", "Cred", "C2", "Exfil"].map((t, i) => (
      <text key={t} x={70 + i * 55} y={35} textAnchor="middle" fontSize="9" fill={cyan} fontWeight={600}>{t}</text>
    ))}
    {[0,1,2,3].map(row => (
      [0,1,2,3,4,5,6].map(col => {
        const hit = (row + col) % 3 === 0;
        return (
          <motion.rect key={`${row}-${col}`} x={50 + col * 55} y={45 + row * 18} width={42} height={14} rx={2}
            fill={hit ? cyan : "currentColor"} fillOpacity={hit ? 0.55 : 0.08}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (row * 7 + col) * 0.04 }} />
        );
      })
    ))}
    <text x={20} y={70} fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">techniques</text>
    <text x={20} y={120} fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">T1566 · T1059 · T1053 · T1003 · …</text>
  </svg>
);

const BreakChain = () => (
  <svg viewBox="0 0 480 110" className="w-full h-28 text-foreground">
    {["Deliver", "Exploit", "Install", "C2", "Actions"].map((s, i) => {
      const x = 30 + i * 90;
      const broken = i === 0;
      return (
        <g key={s}>
          <Node x={x} y={40} w={70} h={28} label={s} accent={broken} />
          {i < 4 && (
            broken
              ? <text x={x + 78} y={58} fontSize="14" fill="#ef4444" fontWeight={700}>✕</text>
              : <FlowArrow x1={x + 70} y1={54} x2={x + 90} y2={54} delay={i * 0.15} />
          )}
        </g>
      );
    })}
    <text x={240} y={92} textAnchor="middle" fontSize="9" fill={cyan}>cost(break) doubles every stage right →</text>
  </svg>
);

const Methodology = () => {
  const phases = ["Recon", "Scan", "Gain", "Maintain", "Cover", "Report"];
  return (
    <svg viewBox="0 0 480 110" className="w-full h-28 text-foreground">
      {phases.map((p, i) => {
        const x = 12 + i * 78;
        return (
          <g key={p}>
            <Node x={x} y={35} w={68} h={30} label={p} accent={i === 5} />
            {i < phases.length - 1 && <FlowArrow x1={x + 68} y1={50} x2={x + 78} y2={50} delay={i * 0.2} />}
          </g>
        );
      })}
      <text x={240} y={22} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">every step gated by RoE</text>
      <text x={240} y={92} textAnchor="middle" fontSize="9" fill={cyan}>Report = the deliverable that pays the invoice</text>
    </svg>
  );
};

const PassiveActive = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    <Node x={20}  y={20} w={120} h={30} label="YOU" accent />
    <Node x={340} y={20} w={120} h={30} label="TARGET" />
    <Node x={170} y={20} w={140} h={30} label="3rd-party (crt.sh, RDAP, Shodan)" />
    <motion.line x1={140} y1={35} x2={170} y2={35} stroke={cyan} strokeWidth={1.5}
      animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
    <motion.line x1={310} y1={35} x2={340} y2={35} stroke={cyan} strokeWidth={1.5} strokeDasharray="2 2"
      animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
    <text x={240} y={62} textAnchor="middle" fontSize="9" fill={cyan} fontWeight={600}>PASSIVE — no packets to target</text>
    <line x1={20} y1={80} x2={460} y2={80} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="3 3" />
    <motion.line x1={140} y1={105} x2={460} y2={105} stroke="#ef4444" strokeWidth={1.5}
      animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
    <polygon points="460,105 452,101 452,109" fill="#ef4444" />
    <text x={240} y={122} textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight={600}>ACTIVE — packets land on target (nmap, AXFR, banner grab)</text>
  </svg>
);

const SourceToData = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    {[
      { y: 14, src: "MX / SPF / DMARC",  data: "Email infra & spoof posture" },
      { y: 40, src: "crt.sh",            data: "Subdomains" },
      { y: 66, src: "Wayback CDX",       data: "Historical / removed paths" },
      { y: 92, src: "Shodan",            data: "Exposed services, banners" },
    ].map((r, i) => (
      <g key={r.src}>
        <Node x={20}  y={r.y - 8} w={130} h={20} label={r.src} />
        <FlowArrow x1={150} y1={r.y + 2} x2={320} y2={r.y + 2} delay={i * 0.25} />
        <Node x={320} y={r.y - 8} w={140} h={20} label={r.data} accent />
      </g>
    ))}
  </svg>
);

const Countermeasure = () => (
  <svg viewBox="0 0 480 120" className="w-full h-32 text-foreground">
    <Node x={20}  y={45} w={140} label="Leak / exposure" sub="cert · snapshot · secret" />
    <FlowArrow x1={165} y1={60} x2={200} y2={60} label="diagnose" />
    <Node x={205} y={45} w={130} label="Root cause" accent sub="rotation? removal?" />
    <FlowArrow x1={340} y1={60} x2={375} y2={60} label="fix" />
    <Node x={380} y={45} w={90}  label="Mitigation" accent />
    <text x={240} y={100} textAnchor="middle" fontSize="9" fill={cyan}>treat the cause, not the symptom</text>
  </svg>
);

const RDAPRead = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    <rect x={20} y={15} width={210} height={100} rx={4} fill="color-mix(in oklab, currentColor 5%, transparent)" stroke="currentColor" strokeOpacity={0.25} />
    <text x={32} y={32} fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">RDAP JSON</text>
    {["registrar:", "createdDate:", "nameServers:", "status:"].map((k, i) => (
      <text key={k} x={32} y={52 + i * 16} fontSize="10" fill={cyan} fontFamily="ui-monospace, monospace">{k}</text>
    ))}
    <FlowArrow x1={235} y1={65} x2={275} y2={65} label="interpret" />
    {[
      { y: 22, label: "Trust signal" },
      { y: 48, label: "Age = legacy infra" },
      { y: 74, label: "Hosting provider" },
      { y: 100, label: "Transfer-lock hygiene" },
    ].map((r, i) => (
      <g key={r.label}>
        <Node x={280} y={r.y} w={180} h={18} label={r.label} accent={i === 3} />
      </g>
    ))}
  </svg>
);

const DNSPosture = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    <Node x={20} y={50} w={80} label="DoH query" accent />
    <FlowArrow x1={102} y1={65} x2={140} y2={65} />
    {[
      { y: 10, label: "MX → mail provider" },
      { y: 35, label: "SPF → allowed senders" },
      { y: 60, label: "DMARC → enforcement (none/quar/reject)" },
      { y: 85, label: "TXT → SaaS verification tokens" },
      { y: 110, label: "CAA → allowed certificate authorities" },
    ].map((r, i) => (
      <g key={r.label}>
        <motion.circle cx={150} cy={r.y + 8} r={3} fill={cyan}
          animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
        <text x={162} y={r.y + 12} fontSize="10" fill="currentColor">{r.label}</text>
      </g>
    ))}
  </svg>
);

const CTLog = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    {[0,1,2,3,4,5,6,7].map(i => (
      <motion.rect key={i} x={20} y={10 + i * 14} width={160} height={10} rx={1}
        fill={cyan} fillOpacity={0.15 + (i % 3) * 0.15}
        initial={{ x: -30, opacity: 0 }} animate={{ x: 20, opacity: 1 }}
        transition={{ delay: i * 0.1, duration: 0.5 }} />
    ))}
    <text x={20} y={130} fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">append-only · public · permanent</text>
    <FlowArrow x1={185} y1={70} x2={225} y2={70} label="filter" />
    <Node x={230} y={20}  w={230} h={20} label="dev-* / internal-* / *-staging" accent />
    <Node x={230} y={48}  w={230} h={20} label="wildcards = broad surface" />
    <Node x={230} y={76}  w={230} h={20} label="surprise sibling domains (M&A)" />
    <text x={345} y={115} textAnchor="middle" fontSize="9" fill={cyan}>every cert = forever intel</text>
  </svg>
);

const WaybackHistory = () => (
  <svg viewBox="0 0 480 110" className="w-full h-28 text-foreground">
    <line x1={30} y1={70} x2={450} y2={70} stroke="currentColor" strokeOpacity={0.3} />
    {[
      { x: 60,  y: 70, label: "2014", note: "first seen" },
      { x: 170, y: 70, label: "2018", note: "/admin live" },
      { x: 280, y: 50, label: "2021", note: "/admin → 404", removed: true },
      { x: 390, y: 70, label: "2024", note: "new stack" },
    ].map((p, i) => (
      <g key={p.label}>
        <motion.circle cx={p.x} cy={p.y} r={6} fill={p.removed ? "#ef4444" : cyan}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2 }} />
        <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="9" fill="currentColor" fontWeight={600}>{p.label}</text>
        <text x={p.x} y={p.y + 22} textAnchor="middle" fontSize="8" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">{p.note}</text>
      </g>
    ))}
    <text x={240} y={102} textAnchor="middle" fontSize="9" fill={cyan}>removed ≠ gone — Wayback remembers</text>
  </svg>
);

const HeaderScore = () => (
  <svg viewBox="0 0 480 130" className="w-full h-32 text-foreground">
    {["HSTS", "CSP", "X-Frame-Opts", "X-Content-Type", "Referrer-Policy", "Permissions-Policy"].map((h, i) => {
      const present = i < 4;
      return (
        <g key={h}>
          <rect x={20} y={15 + i * 16} width={14} height={14} rx={2}
            fill={present ? cyan : "currentColor"} fillOpacity={present ? 0.8 : 0.15} />
          <text x={40} y={26 + i * 16} fontSize="10" fill="currentColor">{h}</text>
        </g>
      );
    })}
    <rect x={260} y={20} width={200} height={90} rx={6} fill={cyan} fillOpacity={0.08} stroke={cyan} strokeOpacity={0.5} />
    <text x={360} y={50} textAnchor="middle" fontSize="11" fill="currentColor" opacity={0.7}>SCORE</text>
    <motion.text x={360} y={92} textAnchor="middle" fontSize="32" fill={cyan} fontWeight={700}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>4/6</motion.text>
  </svg>
);

const RobotsMap = () => (
  <svg viewBox="0 0 480 120" className="w-full h-32 text-foreground">
    <rect x={20} y={15} width={200} height={90} rx={4} fill="color-mix(in oklab, currentColor 5%, transparent)" stroke="currentColor" strokeOpacity={0.25} />
    <text x={32} y={32} fontSize="9" fill="currentColor" opacity={0.6} fontFamily="ui-monospace, monospace">robots.txt</text>
    {["Disallow: /admin", "Disallow: /old-portal", "Sitemap: /sitemap.xml"].map((l, i) => (
      <text key={l} x={32} y={52 + i * 16} fontSize="10" fill={cyan} fontFamily="ui-monospace, monospace">{l}</text>
    ))}
    <FlowArrow x1={225} y1={60} x2={270} y2={60} label="recon" />
    <Node x={275} y={20} w={190} label="Candidates to probe" accent sub="/admin · /old-portal · sitemap content" />
    <text x={370} y={95} textAnchor="middle" fontSize="9" fill="#ef4444">NOT a security control</text>
  </svg>
);

/* ─── Registry ────────────────────────────────────────────────────────── */

interface VisualSpec {
  title: string;
  bullets: string[];
  scene: ReactNode;
}

const REGISTRY: Record<string, VisualSpec> = {
  // Hour 1
  "d1h1-l1-assets": {
    title: "How asset triage works",
    bullets: ["Rank by business value × loss impact, not by 'cool tech'.", "Critical assets force the security budget; supporting assets enable them.", "Things with no value to protect aren't assets — they're noise."],
    scene: <AssetTriage />,
  },
  "d1h1-l2-threats": {
    title: "Threats grouped by who & why",
    bullets: ["Same outcome can come from very different adversaries.", "Motive (money, intel, grievance, none) drives the playbook.", "Natural threats count — they need controls too (DR, redundancy)."],
    scene: <ThreatActors />,
  },
  "d1h1-l3-risk-map": {
    title: "Vulnerability → Threat → Risk",
    bullets: ["A vulnerability alone isn't risk — it has to be reachable by a threat with impact.", "Map each weakness to the most precise resulting business consequence.", "If you can't name impact in business terms, the board can't act on it."],
    scene: <VulnToRisk />,
  },

  // Hour 2
  "d1h2-l4-ethical": {
    title: "The hat spectrum",
    bullets: ["What separates colours: authorisation + intent, not skill.", "'Helpful' without auth still maps to grey/black in court.", "Scope, signature, and timing turn the same action ethical or illegal."],
    scene: <HatSpectrum />,
  },
  "d1h2-l5-roe": {
    title: "What a valid RoE contains",
    bullets: ["All five fields present + signed = legal cover.", "Missing one field = engagement isn't defensible if challenged.", "RoE is the contract the engagement runs on — every phase is gated by it."],
    scene: <RoEChecklist />,
  },
  "d1h2-l6-authz": {
    title: "Every action passes the gate",
    bullets: ["Before any tool runs: is the target in scope, in time, and signed?", "Yes on all three → GO. Any 'no' → STOP, regardless of intent.", "The gate is a habit — running it slow once is faster than a deposition."],
    scene: <AuthzGate />,
  },

  // Hour 3
  "d1h3-l7-actors": {
    title: "Actor capability ladder",
    bullets: ["Skill, resources, and infrastructure define the tier.", "Higher-tier actors = longer dwell, custom tools, multi-stage ops.", "Attribution = motive × capability × infrastructure overlap."],
    scene: <ActorClasses />,
  },
  "d1h3-l8-vectors": {
    title: "Attack vectors converge on the target",
    bullets: ["A vector is the path in; the target is the asset behind it.", "Most breaches arrive via 3-4 well-known vectors, not zero-days.", "Defending = covering each vector with a control, not chasing tools."],
    scene: <AttackVectors />,
  },
  "d1h3-l9-control": {
    title: "Controls by function",
    bullets: ["Preventive stops it; detective sees it; corrective recovers from it.", "Compensating fills the gap when the ideal control isn't possible.", "Mature programs layer all four — single-function defence breaks easily."],
    scene: <ControlMix />,
  },

  // Hour 4
  "d1h4-l10-cia": {
    title: "CIA ↔ DAD",
    bullets: ["Every attack maps to violating C, I, or A (or several at once).", "DAD = the failure modes: Disclosure, Alteration, Denial.", "Pick controls by which leg of the triangle they protect."],
    scene: <CIATriangle />,
  },
  "d1h4-l11-controltype": {
    title: "Three categories of control",
    bullets: ["Administrative = the rule. Technical = the enforcement. Physical = the barrier.", "A complete control usually has all three behind it.", "Audit by walking down the matrix: every cell filled or accepted."],
    scene: <ControlTypes />,
  },
  "d1h4-l12-layering": {
    title: "Defence in depth",
    bullets: ["No single control is perfect — layer them so one failure isn't fatal.", "An attacker pays the cost of every layer they cross.", "Identity is the modern perimeter; assume earlier layers will fail."],
    scene: <DefenseInDepth />,
  },

  // Hour 5
  "lab-13-killchain-sequence": {
    title: "Cyber Kill Chain — 7 stages",
    bullets: ["Linear narrative: each stage enables the next.", "Earlier breaks are cheaper and have smaller blast radius.", "Each SOC event slots into exactly one stage — that's the lab."],
    scene: <KillChain />,
  },
  "lab-14-attack-tactic-match": {
    title: "ATT&CK — matrix of tactic × technique",
    bullets: ["Tactic = WHY (the adversary's goal). Technique = HOW.", "T-numbers like T1003.003 = parent technique + sub-technique.", "Same event, different lens than Kill Chain — both apply."],
    scene: <AttackMatrix />,
  },
  "lab-15-break-the-chain": {
    title: "Break at the cheapest stage",
    bullets: ["Cost of intervention roughly doubles every stage to the right.", "Choose the leftmost stage where a real control exists.", "If only one control works, build redundancy at the next stage too."],
    scene: <BreakChain />,
  },

  // Hour 6
  "lab-16-methodology-phase": {
    title: "6 CEH phases — the spine",
    bullets: ["Every pentest activity lives in exactly one phase.", "RoE gates every phase — the wrong tool in the right phase still fails.", "Reporting is where the value lands — without it the work didn't happen."],
    scene: <Methodology />,
  },
  "lab-17-passive-vs-active": {
    title: "Passive vs Active recon",
    bullets: ["Passive = third-party sources, no packets to the target.", "Active = packets land on the target (DNS to their NS, banner grabs, scans).", "Passive almost always in scope; active needs explicit RoE approval."],
    scene: <PassiveActive />,
  },
  "lab-18-authorisation-call": {
    title: "Scope-ambiguity decision",
    bullets: ["When in doubt: pause, document, escalate to the named contact.", "'Probably fine' is the line where consultants lose their licence.", "Each decision needs a timestamp + authoriser captured in the log."],
    scene: <AuthzGate />,
  },

  // Hour 7
  "wk1-h7-lab19-passive-active": {
    title: "Tag every recon activity",
    bullets: ["Anchor: 'does a packet hit the target's infrastructure?'", "Cached intel (Shodan, crt.sh) = passive even if originally noisy.", "AXFR and curl -I are ACTIVE — they touch the target directly."],
    scene: <PassiveActive />,
  },
  "wk1-h7-lab20-source-to-data": {
    title: "Pick the source for the data you need",
    bullets: ["Each OSINT source has one or two data types it does best.", "Stack 3-4 sources to triangulate; never rely on a single feed.", "Citing the source per finding is what makes a footprint defensible."],
    scene: <SourceToData />,
  },
  "wk1-h7-lab21-countermeasure": {
    title: "Treat the root cause, not the symptom",
    bullets: ["Hiding a leak (private repo, robots.txt) doesn't undo exposure.", "Rotate credentials, monitor for re-issuance, then close the gap.", "Every mitigation should reduce the next-incident likelihood, not just this one."],
    scene: <Countermeasure />,
  },

  // Hour 8
  "wk1-h8-lab22-whois": {
    title: "Reading RDAP",
    bullets: ["Registrar = who controls the domain (social-eng pretext).", "Creation date = trust + legacy infra signal.", "Status flags reveal hygiene (transfer-lock, hold states)."],
    scene: <RDAPRead />,
  },
  "wk1-h8-lab23-dns": {
    title: "DNS reveals email posture",
    bullets: ["MX = mail provider. SPF = who may send. DMARC = enforcement.", "TXT verification tokens leak which SaaS the org uses.", "p=none in DMARC = spoofing still works → high-value finding."],
    scene: <DNSPosture />,
  },
  "wk1-h8-lab24-subs": {
    title: "CT logs — append-only, public, permanent",
    bullets: ["Every cert ever issued is searchable — forever.", "Anomalous names (dev-*, internal-*, *-staging) = shadow IT.", "Wildcards expand the surface; sibling domains expose M&A."],
    scene: <CTLog />,
  },
  "wk1-h8-lab25-wayback": {
    title: "Wayback exposes the past",
    bullets: ["First-seen date is a useful trust signal.", "Removed paths often still resolve — forgotten admin portals.", "200-status snapshots of now-404 pages = OSINT goldmine."],
    scene: <WaybackHistory />,
  },
  "wk1-h8-lab26-headers": {
    title: "6-point security header score",
    bullets: ["HSTS, CSP, XFO, XCTO, Referrer-Policy, Permissions-Policy.", "<3 present = immature posture. 6 = mature defensive engineering.", "Server header still leaks the stack — high-signal cheap finding."],
    scene: <HeaderScore />,
  },
  "wk1-h8-lab27-robots": {
    title: "robots.txt as recon",
    bullets: ["NOT security — it's a sign-posted map of what was hidden.", "Every Disallow path = candidate for manual probing.", "Sitemaps reveal content inventories the operator forgot about."],
    scene: <RobotsMap />,
  },
};

/* ─── Public component ────────────────────────────────────────────────── */

export function LabVisual({ labId }: { labId: string }) {
  const v = REGISTRY[labId];
  if (!v) return null;
  return (
    <div className="panel p-4 mb-3 border border-border bg-secondary/20">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[var(--cyan)] mb-2 font-mono">
        <Eye className="h-3 w-3" /> How it works · {v.title}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 items-center">
        <div className="overflow-hidden">{v.scene}</div>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          {v.bullets.map((b, i) => (
            <li key={i} className="flex gap-1.5">
              <Lightbulb className="h-3 w-3 text-[var(--cyan)] shrink-0 mt-0.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
