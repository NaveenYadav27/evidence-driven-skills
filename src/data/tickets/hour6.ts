// HOUR 6 — Hacking Methodology (5-phase pen-test methodology)
import type { Ticket } from "./types";
import { DEFAULT_RUBRIC, XP_BY_PRIORITY } from "./types";

export const HOUR6_TICKETS: Ticket[] = [
  {
    id: "GH-6001",
    hourSlug: "hacking-methodology",
    title: "Plan the 5-Phase Methodology for the Customer Portal Test",
    category: "Methodology Planning",
    priority: "high",
    difficulty: "analyst",
    estMinutes: 28,
    xp: XP_BY_PRIORITY.high,
    badge: "methodology-architect",
    client: "GlassHouse Bank",
    ticketTag: "OPERATION GLASSHOUSE",
    analystBrief:
      "ROE is signed (GH-2001). Build the per-phase test plan: Reconnaissance · Scanning & Enumeration · Gaining Access · Maintaining Access · Clearing Tracks (latter two simulated only). Per phase: objectives, techniques, tools, deliverables, time-box.",
    contextFacts: [
      { label: "Target", value: "portal.glasshouse.test + 2 supporting APIs" },
      { label: "Duration", value: "10 business days" },
    ],
    frameworks: {
      ceh: ["5-phase methodology", "Test planning"],
      nist_csf: ["Identify", "Detect"],
      nist_800_53: ["CA-8 Penetration Testing"],
    },
    steps: [
      {
        id: "s1", phase: "collect",
        title: "Phase plan cards", objective: "One per phase.",
        instructions: ["Attach 5 mapping cards (objectives, techniques, tools, deliverable, time-box) per phase."],
        expected: "5 mapping cards.",
        evidence: [{ kind: "mapping", label: "Phase plan entry", count: 5 }],
      },
      {
        id: "s2", phase: "analyze",
        title: "Risk-rank the phases",
        objective: "Which phase carries most engagement risk?",
        instructions: ["Attach 1 risk_matrix card with L × I per phase."],
        expected: "1 risk_matrix card.",
        evidence: [{ kind: "risk_matrix", label: "Phase risk ranking", count: 1 }],
      },
      {
        id: "s3", phase: "map",
        title: "Decision — exploit window",
        objective: "When to run exploitation safely.",
        instructions: ["Choose the option."],
        expected: "Decision recorded.",
        evidence: [],
        decision: {
          prompt: "When do we run authenticated exploit attempts on the portal?",
          options: [
            { id: "after", label: "After business hours, with SOC + on-call dev notified", correct: true },
            { id: "daytime", label: "Daytime — easier to coordinate", correct: false,
              finding: { severity: "medium", label: "Customer impact risk during business hours" } },
            { id: "any", label: "Anytime — ROE allows it", correct: false,
              finding: { severity: "high", label: "ROE allowance ≠ wisdom; coordinate to avoid impact" } },
          ],
        },
      },
      {
        id: "s4", phase: "deliver",
        title: "Methodology plan",
        objective: "Save the plan.",
        instructions: ["Write the deliverable."],
        expected: "Saved (≥ 450 chars).",
        evidence: [{ kind: "report", label: "Methodology plan" }],
      },
    ],
    deliverables: [
      { kind: "technical", title: "Portal Pen Test — 5-Phase Plan",
        prompt: "Sections:\n• Phase cards (5)\n• Phase risk ranking\n• Exploit window + comms\n• Daily schedule",
        minChars: 450 },
    ],
    rubric: DEFAULT_RUBRIC, passingScore: 70,
  },
  {
    id: "GH-6002",
    hourSlug: "hacking-methodology",
    title: "Triage a Mid-Engagement Finding — Decide Stop / Continue",
    category: "Engagement Governance",
    priority: "critical",
    difficulty: "senior",
    estMinutes: 18,
    xp: XP_BY_PRIORITY.critical,
    client: "GlassHouse Bank",
    ticketTag: "OPERATION GLASSHOUSE",
    analystBrief:
      "During scanning, the tester observed what appears to be a live attacker session in the customer portal admin panel (foreign IP, off-hours, command-history not theirs). Decide whether to halt the test, switch to IR support, or continue with notice.",
    contextFacts: [
      { label: "Observation", value: "Active session from 185.X.X.X, last cmd 'wget /pwn.sh'" },
      { label: "Tester action", value: "Already paused their own activity" },
    ],
    frameworks: {
      ceh: ["Engagement governance", "Active incident handling"],
      nist_csf: ["Respond"],
    },
    steps: [
      {
        id: "s1", phase: "collect",
        title: "Capture observation", objective: "Save observable evidence.",
        instructions: ["Attach a screenshot/log capturing the foreign session."],
        expected: "Evidence captured.",
        evidence: [
          { kind: "log", label: "Foreign session log", count: 1 },
          { kind: "note", label: "Tester action note", count: 1 },
        ],
      },
      {
        id: "s2", phase: "recommend",
        title: "Decision — engagement state change",
        objective: "Stop / pivot to IR / continue.",
        instructions: ["Pick the option that aligns with ROE and ethics."],
        expected: "Decision recorded.",
        evidence: [],
        decision: {
          prompt: "What does the engagement lead do in the next 15 minutes?",
          options: [
            { id: "stop", label: "Halt the pen test, preserve evidence, notify CISO; offer IR assist if requested", correct: true },
            { id: "ir", label: "Switch unilaterally into IR mode and start kicking the attacker", correct: false,
              finding: { severity: "high", label: "Outside ROE; risk of contaminating evidence" } },
            { id: "continue", label: "Continue scanning — different scope", correct: false,
              finding: { severity: "critical", label: "Risks confusing live attacker telemetry with test traffic" } },
          ],
        },
      },
      {
        id: "s3", phase: "deliver",
        title: "Comms note to CISO",
        objective: "Save the deliverable.",
        instructions: ["Write the comms note."],
        expected: "Saved (≥ 350 chars).",
        evidence: [{ kind: "report", label: "CISO comms note" }],
      },
    ],
    deliverables: [
      { kind: "incident", title: "Mid-Engagement Active Attacker — Comms Note",
        prompt: "Sections:\n• Observation summary\n• Action taken (halt + preserve)\n• Recommendation to client\n• Re-start criteria",
        minChars: 350 },
    ],
    rubric: DEFAULT_RUBRIC, passingScore: 75,
  },
  {
    id: "GH-6003",
    hourSlug: "hacking-methodology",
    title: "Author the Final Pen Test Report Outline",
    category: "Reporting",
    priority: "medium",
    difficulty: "analyst",
    estMinutes: 20,
    xp: XP_BY_PRIORITY.medium,
    client: "GlassHouse Bank",
    ticketTag: "OPERATION GLASSHOUSE",
    analystBrief:
      "Engagement nears end. Produce the full report outline the client will read: exec summary, scope, methodology, findings (with CVSS + business impact), evidence, remediation, retest plan. Hit both exec and technical audiences.",
    contextFacts: [
      { label: "Audience", value: "CISO + engineering leads" },
      { label: "Style", value: "Crisp; no padding" },
    ],
    frameworks: {
      ceh: ["Reporting standards"],
      nist_csf: ["Govern", "Identify"],
    },
    steps: [
      {
        id: "s1", phase: "collect",
        title: "Section outline",
        objective: "List ≥ 8 sections with 1-line description each.",
        instructions: ["Attach a note containing the outline."],
        expected: "1 note.",
        evidence: [{ kind: "note", label: "Section outline", count: 1 }],
      },
      {
        id: "s2", phase: "analyze",
        title: "Finding template",
        objective: "Standard fields for every finding.",
        instructions: ["Attach a mapping card with finding fields: title, severity, CVSS, asset, evidence ref, impact, remediation, retest."],
        expected: "1 mapping card.",
        evidence: [{ kind: "mapping", label: "Finding template", count: 1 }],
      },
      {
        id: "s3", phase: "deliver",
        title: "Full report outline",
        objective: "Save the deliverable.",
        instructions: ["Write the outline."],
        expected: "Saved (≥ 400 chars).",
        evidence: [{ kind: "report", label: "Report outline" }],
      },
    ],
    deliverables: [
      { kind: "technical", title: "Pen Test Report — Outline",
        prompt: "Sections:\n• Section list\n• Finding template fields\n• Style guide notes",
        minChars: 400 },
    ],
    rubric: DEFAULT_RUBRIC, passingScore: 65,
  },
];
