// HOUR 1 — Operation GlassHouse (Why Cybersecurity Exists)
// 5 enterprise tickets: Asset ID, Threat Classification, Risk Assessment,
// Countermeasure Selection, Business Impact Analysis.

import type { Ticket } from "./types";
import { DEFAULT_RUBRIC, XP_BY_PRIORITY } from "./types";

export const HOUR1_TICKETS: Ticket[] = [
  /* ───────────────── TICKET 1 — Asset Identification ───────────────── */
  {
    id: "GH-1001",
    hourSlug: "why-cybersecurity-exists",
    title: "Inventory & Classify Critical Assets — Branch Acquisition",
    category: "Asset Identification",
    priority: "high",
    difficulty: "analyst",
    estMinutes: 25,
    xp: XP_BY_PRIORITY.high,
    badge: "risk-analyst",
    client: "GlassHouse Bank",
    ticketTag: "OPERATION GLASSHOUSE",
    analystBrief:
      "GlassHouse Bank just acquired CoastalTrust — three branches, a customer portal, an ACH gateway, a Windows file server with mortgage PDFs, and a public marketing site. CISO needs a triaged asset inventory before any control work begins. Classify each asset by value (Crown Jewel → Background) and the CIA impact of compromise.",
    contextFacts: [
      { label: "Acquired entity", value: "CoastalTrust Federal Credit Union" },
      { label: "In-scope assets", value: "5 systems handed off from CoastalTrust IT" },
      { label: "Regulatory", value: "GLBA · PCI DSS (level 2) · State banking" },
      { label: "Deadline", value: "CISO briefing — 48 hours" },
    ],
    frameworks: {
      ceh: ["Asset identification", "Value-based risk triage"],
      nist_csf: ["Identify"],
      mitre_attack: ["TA0043 Reconnaissance"],
      iso_27001: ["A.5.9 Inventory of information and other associated assets"],
      cis: ["Control 1 — Inventory and Control of Enterprise Assets", "Control 3 — Data Protection"],
      nist_800_53: ["CM-8 System Component Inventory", "RA-2 Security Categorization"],
    },
    steps: [
      {
        id: "s1",
        phase: "understand",
        title: "Read the handoff and identify scope",
        objective: "Confirm exactly which 5 assets are in-scope and which regulations apply.",
        instructions: [
          "Re-read the analyst brief and the Context Facts panel.",
          "Write a one-paragraph 'scope statement' in the Analyst Notes capturing the assets, the regulations, and what is explicitly OUT of scope.",
        ],
        expected: "Scope paragraph in Analyst Notes mentions GLBA, PCI DSS, and the 5 systems by name.",
        evidence: [
          { kind: "note", label: "Scope statement (Analyst Notes)", count: 1, hint: "Use the Notes panel — one paragraph is enough." },
        ],
        commonMistakes: [
          "Treating the marketing site as out-of-scope because it 'has no PII' — it can still be defaced for reputational damage.",
          "Ignoring regulatory mapping at this step.",
        ],
      },
      {
        id: "s2",
        phase: "collect",
        title: "Classify each asset by business value",
        objective: "Tag every asset as Crown Jewel · High · Medium · Background and justify it.",
        instructions: [
          "For each of the 5 assets, attach an evidence card of kind 'mapping' with the asset name, your tier, and a 1-line justification.",
          "Use this scale: Crown Jewel = loss ends the business · High = material regulatory or revenue impact · Medium = recoverable disruption · Background = low business consequence.",
        ],
        expected: "5 mapping cards, one per asset, each with a tier and justification.",
        evidence: [
          { kind: "mapping", label: "Asset valuation card", count: 5, hint: "Customer portal · ACH gateway · Mortgage file server · 3-branch network · Marketing site" },
        ],
        commonMistakes: [
          "Tagging everything Crown Jewel — dilutes prioritization.",
          "Justifying tiers from technical complexity instead of business impact.",
        ],
      },
      {
        id: "s3",
        phase: "analyze",
        title: "Map CIA impact for the top two assets",
        objective: "For your two highest-tier assets, score Confidentiality / Integrity / Availability impact on a 1–5 scale.",
        instructions: [
          "Attach two 'risk_matrix' evidence cards — one per asset — containing your C/I/A scores and the dominant impact dimension.",
          "Justify the dominant dimension in 1–2 sentences (e.g. ACH gateway → Integrity dominates: a tampered transaction settles in seconds).",
        ],
        expected: "2 risk_matrix cards with C/I/A scores 1–5 and a written dominant-dimension rationale.",
        evidence: [
          { kind: "risk_matrix", label: "CIA impact scoring", count: 2 },
        ],
        analystNotes: "If two assets tie on C/I/A score, break the tie with regulatory exposure (GLBA > marketing brand).",
      },
      {
        id: "s4",
        phase: "map",
        title: "Decision — does the marketing site need Crown Jewel controls?",
        objective: "Make a defensible business decision and record it.",
        instructions: ["Pick the option that matches your inventory and CIA analysis."],
        expected: "Decision recorded; rationale captured in notes.",
        evidence: [],
        decision: {
          prompt: "The CISO asks: 'Do we put the marketing site under the same controls as the ACH gateway?'",
          options: [
            { id: "yes", label: "Yes — apply Crown Jewel controls to everything public-facing", correct: false,
              finding: { severity: "medium", label: "Over-spend on a low-value asset; budget pulled from real Crown Jewels" } },
            { id: "no", label: "No — marketing site is Medium tier; apply hardening + monitoring, not full CJ controls", correct: true },
            { id: "defer", label: "Defer — need penetration test results first", correct: false,
              finding: { severity: "low", label: "Decision avoidance; CISO needs a tier today, not a pen-test" } },
          ],
        },
      },
      {
        id: "s5",
        phase: "deliver",
        title: "Produce the Executive Summary deliverable",
        objective: "Write the 1-page exec summary the CISO will read.",
        instructions: [
          "Open the Deliverables panel and write the Executive Summary.",
          "Cover: scope, top-2 Crown Jewels, the marketing-site decision, and the next 3 actions you recommend.",
        ],
        expected: "Executive Summary deliverable saved (≥ 400 chars).",
        evidence: [{ kind: "report", label: "Executive Summary saved (Deliverables tab)" }],
      },
    ],
    deliverables: [
      {
        kind: "exec_summary",
        title: "Executive Summary — Acquired Asset Inventory",
        prompt:
          "1 page for the CISO. Sections:\n• Scope (assets + regulations)\n• Top 2 Crown Jewels and why\n• Marketing-site decision and rationale\n• Next 3 recommended actions (with owners)",
        minChars: 400,
      },
    ],
    rubric: DEFAULT_RUBRIC,
    passingScore: 70,
  },

  /* ───────────────── TICKET 2 — Threat Classification ───────────────── */
  {
    id: "GH-1002",
    hourSlug: "why-cybersecurity-exists",
    title: "Classify Three Active Threats Hitting the Customer Portal",
    category: "Threat Classification",
    priority: "high",
    difficulty: "analyst",
    estMinutes: 20,
    xp: XP_BY_PRIORITY.high,
    badge: "threat-hunter",
    client: "GlassHouse Bank",
    ticketTag: "OPERATION GLASSHOUSE",
    analystBrief:
      "The SOC triage queue surfaced three signals against the customer portal in the last 24h: (1) a burst of failed logins from a single ASN, (2) an inbound phishing wave referencing the recent acquisition, (3) a researcher email about an outdated jQuery on the marketing site. Classify each by threat actor type, motive, and capability.",
    contextFacts: [
      { label: "Signal 1", value: "12,400 failed logins · 1 ASN · 6h window" },
      { label: "Signal 2", value: "Phish lures: 'CoastalTrust merger DocuSign'" },
      { label: "Signal 3", value: "Researcher report: jQuery 1.7 on marketing.glasshouse.test" },
    ],
    frameworks: {
      ceh: ["Threat actors", "Motives / means / opportunity"],
      nist_csf: ["Identify", "Detect"],
      mitre_attack: ["T1110 Brute Force", "T1566 Phishing", "T1190 Exploit Public-Facing Application"],
      iso_27001: ["A.5.7 Threat intelligence"],
      cis: ["Control 13 — Network Monitoring and Defense"],
    },
    steps: [
      {
        id: "s1",
        phase: "understand",
        title: "Restate each signal in plain language",
        objective: "Make sure you understand what each signal actually IS before you classify the actor.",
        instructions: [
          "Add one 'note' evidence per signal — what is happening, observable, and the asset affected.",
        ],
        expected: "3 notes describing the three signals.",
        evidence: [{ kind: "note", label: "Signal restatement", count: 3 }],
      },
      {
        id: "s2",
        phase: "analyze",
        title: "Map each signal to actor + motive + capability",
        objective: "Assign one of: Script Kiddie · Cybercriminal · Hacktivist · Insider · Nation-State · Researcher.",
        instructions: [
          "Attach a 'mapping' evidence per signal with: actor type · motive · capability (low/med/high) · primary MITRE technique.",
        ],
        expected: "3 mapping cards, one per signal.",
        evidence: [{ kind: "mapping", label: "Actor + motive + technique", count: 3 }],
        commonMistakes: [
          "Calling credential stuffing 'nation-state' — the ASN + volume pattern is classic cybercrime.",
          "Treating the researcher as a threat instead of an informant.",
        ],
      },
      {
        id: "s3",
        phase: "map",
        title: "Decision — which signal escalates to Incident Response NOW?",
        objective: "Pick exactly one for immediate IR engagement.",
        instructions: ["Pick the signal that meets BOTH active-exploitation and high business-impact bars."],
        expected: "Decision recorded.",
        evidence: [],
        decision: {
          prompt: "You only have one IR analyst free. Who do they help first?",
          options: [
            { id: "brute", label: "Credential-stuffing burst — active and targeting Crown Jewel portal", correct: true },
            { id: "phish", label: "Phishing wave — handle via email security & user awareness", correct: false,
              finding: { severity: "low", label: "Misallocation: phish is in-flight but not actively breaching auth" } },
            { id: "jq", label: "jQuery report — patch & re-scan, not an active incident", correct: false,
              finding: { severity: "medium", label: "Misallocation: vulnerability ≠ active incident" } },
          ],
        },
      },
      {
        id: "s4",
        phase: "deliver",
        title: "Write the Threat Intelligence Brief",
        objective: "1-page brief summarizing actors, prioritization, and short-term defensive moves.",
        instructions: ["Save the Threat Intelligence deliverable."],
        expected: "Threat Intel deliverable saved (≥ 350 chars).",
        evidence: [{ kind: "report", label: "Threat Intel Brief saved" }],
      },
    ],
    deliverables: [
      {
        kind: "threat_intel",
        title: "Threat Intelligence Brief — 24h Window",
        prompt:
          "Sections:\n• Three signals (1 line each)\n• Actor type + motive + capability per signal\n• Which signal escalates to IR and why\n• 3 defensive actions for the next 24h",
        minChars: 350,
      },
    ],
    rubric: DEFAULT_RUBRIC,
    passingScore: 70,
  },

  /* ───────────────── TICKET 3 — Risk Assessment ───────────────── */
  {
    id: "GH-1003",
    hourSlug: "why-cybersecurity-exists",
    title: "Risk Score the Top 3 Acquired Vulnerabilities",
    category: "Risk Assessment",
    priority: "critical",
    difficulty: "senior",
    estMinutes: 30,
    xp: XP_BY_PRIORITY.critical,
    badge: "risk-analyst",
    client: "GlassHouse Bank",
    ticketTag: "OPERATION GLASSHOUSE",
    analystBrief:
      "Acquisition diligence surfaced three unresolved findings on CoastalTrust systems: (V1) ACH gateway running TLS 1.0, (V2) Mortgage file server SMBv1 enabled, (V3) Customer portal IDOR letting a logged-in user read another user's statement. Compute Risk = Likelihood × Impact for each and rank them.",
    contextFacts: [
      { label: "V1", value: "ACH gateway · TLS 1.0 supported · listed on Internet" },
      { label: "V2", value: "File server · SMBv1 enabled · internal-only" },
      { label: "V3", value: "Portal IDOR · authenticated · /statements?id=N" },
      { label: "Scale", value: "Likelihood 1–5 · Impact 1–5 · Risk = L × I" },
    ],
    frameworks: {
      ceh: ["Risk = Likelihood × Impact", "Vulnerability vs Threat vs Risk"],
      nist_csf: ["Identify", "Protect"],
      mitre_attack: ["T1190 Exploit Public-Facing Application", "T1210 Exploitation of Remote Services"],
      owasp: ["A01:2021 Broken Access Control", "A02:2021 Cryptographic Failures"],
      pci_dss: ["Req 4.2.1 Strong cryptography for cardholder data in transit"],
      cis: ["Control 7 — Continuous Vulnerability Management"],
    },
    steps: [
      {
        id: "s1",
        phase: "collect",
        title: "Score each vulnerability",
        objective: "Likelihood and Impact 1–5 per vulnerability, with a 1-line rationale.",
        instructions: [
          "Attach 3 'risk_matrix' evidence cards (one per V) with L, I, and L×I.",
          "Anchor likelihood in exposure (internet vs internal) and exploit maturity, NOT vendor severity ratings.",
        ],
        expected: "3 risk_matrix cards with L, I, and computed risk.",
        evidence: [{ kind: "risk_matrix", label: "L × I per vulnerability", count: 3 }],
        commonMistakes: [
          "Copying the CVSS base score as Likelihood — CVSS is severity, not contextual likelihood.",
          "Scoring SMBv1 high likelihood despite the asset being internal-only with no foothold.",
        ],
      },
      {
        id: "s2",
        phase: "map",
        title: "Map each finding to OWASP / PCI / MITRE",
        objective: "Show the auditor why each finding matters beyond a CVE number.",
        instructions: ["Attach 3 'mapping' cards with the OWASP / PCI / MITRE references that apply."],
        expected: "3 mapping cards.",
        evidence: [{ kind: "mapping", label: "Framework references", count: 3 }],
      },
      {
        id: "s3",
        phase: "recommend",
        title: "Decision — fix order",
        objective: "Recommend the fix order to the CISO.",
        instructions: ["Pick the order that reflects risk score AND regulatory exposure."],
        expected: "Decision recorded.",
        evidence: [],
        decision: {
          prompt: "Which order goes to engineering this sprint?",
          options: [
            { id: "v3v1v2", label: "V3 IDOR → V1 TLS 1.0 → V2 SMBv1", correct: true },
            { id: "v2v1v3", label: "V2 SMBv1 → V1 TLS 1.0 → V3 IDOR", correct: false,
              finding: { severity: "high", label: "Internal-only SMBv1 ranked above an authenticated data-leakage on a Crown Jewel — wrong prioritization" } },
            { id: "v1v3v2", label: "V1 TLS 1.0 → V3 IDOR → V2 SMBv1", correct: false,
              finding: { severity: "medium", label: "TLS 1.0 is real but IDOR is already leaking customer data" } },
          ],
        },
      },
      {
        id: "s4",
        phase: "deliver",
        title: "Risk Assessment deliverable",
        objective: "Produce the written Risk Assessment.",
        instructions: ["Save the Risk Assessment deliverable."],
        expected: "Risk Assessment saved (≥ 400 chars).",
        evidence: [{ kind: "report", label: "Risk Assessment saved" }],
      },
    ],
    deliverables: [
      {
        kind: "risk",
        title: "Risk Assessment — Acquired Vulnerabilities",
        prompt:
          "Sections:\n• Method (L × I scale + rationale)\n• Per-vuln scoring table (V1/V2/V3)\n• Framework references\n• Recommended fix order with owners and SLAs",
        minChars: 400,
      },
    ],
    rubric: DEFAULT_RUBRIC,
    passingScore: 75,
  },

  /* ───────────────── TICKET 4 — Countermeasure Selection ───────────────── */
  {
    id: "GH-1004",
    hourSlug: "why-cybersecurity-exists",
    title: "Select Countermeasures for the Credential-Stuffing Burst",
    category: "Countermeasure Selection",
    priority: "high",
    difficulty: "analyst",
    estMinutes: 20,
    xp: XP_BY_PRIORITY.high,
    client: "GlassHouse Bank",
    ticketTag: "OPERATION GLASSHOUSE",
    analystBrief:
      "Building on Ticket GH-1002: the credential-stuffing burst is still active. Select layered controls (preventive · detective · corrective) that reduce both likelihood and impact without breaking legitimate customer login.",
    contextFacts: [
      { label: "Traffic", value: "12.4k failed logins · 1 ASN · UA spoofed to mobile Chrome" },
      { label: "Constraint", value: "Cannot block ASN outright — overlaps with 2 ISPs serving real customers" },
      { label: "Available controls", value: "WAF · MFA · rate-limit · CAPTCHA · device fingerprint · IP reputation" },
    ],
    frameworks: {
      ceh: ["Defense in depth", "Preventive / Detective / Corrective"],
      nist_csf: ["Protect", "Detect", "Respond"],
      mitre_attack: ["T1110.004 Credential Stuffing"],
      cis: ["Control 6 — Access Control Mgmt", "Control 13 — Network Monitoring"],
      nist_800_53: ["IA-2 Identification & Authentication", "SC-5 Denial of Service Protection"],
    },
    steps: [
      {
        id: "s1",
        phase: "analyze",
        title: "Classify each available control",
        objective: "Tag each of the 6 controls as Preventive / Detective / Corrective and rate effectiveness vs credential stuffing (low/med/high).",
        instructions: ["Attach a 'mapping' card per control (6 total)."],
        expected: "6 mapping cards.",
        evidence: [{ kind: "mapping", label: "Control type + effectiveness", count: 6 }],
      },
      {
        id: "s2",
        phase: "recommend",
        title: "Decision — recommended bundle",
        objective: "Pick the bundle that survives the ASN constraint.",
        instructions: ["Read each bundle carefully — only one respects the constraint AND covers all three control types."],
        expected: "Decision recorded.",
        evidence: [],
        decision: {
          prompt: "Which bundle do you recommend to the CISO?",
          options: [
            { id: "block", label: "Block the ASN at the WAF", correct: false,
              finding: { severity: "high", label: "Breaks legitimate customers on the overlapping ISPs" } },
            { id: "balanced", label: "MFA enforce + per-account rate limit + device fingerprint + alert on velocity", correct: true },
            { id: "captcha", label: "Add CAPTCHA only", correct: false,
              finding: { severity: "medium", label: "Modern stuffers solve CAPTCHA as a service; not sufficient alone" } },
          ],
        },
      },
      {
        id: "s3",
        phase: "deliver",
        title: "Mitigation Plan deliverable",
        objective: "Produce the written Mitigation Plan.",
        instructions: ["Save the Mitigation Plan deliverable."],
        expected: "Mitigation Plan saved (≥ 350 chars).",
        evidence: [{ kind: "report", label: "Mitigation Plan saved" }],
      },
    ],
    deliverables: [
      {
        kind: "mitigation",
        title: "Mitigation Plan — Credential Stuffing on Customer Portal",
        prompt:
          "Sections:\n• Threat recap (1 paragraph)\n• Layered controls (Preventive / Detective / Corrective) with owners\n• Rollout order and rollback plan\n• Success metrics (e.g. failed-login rate, MFA enrollment %)",
        minChars: 350,
      },
    ],
    rubric: DEFAULT_RUBRIC,
    passingScore: 70,
  },

  /* ───────────────── TICKET 5 — Business Impact Analysis ───────────────── */
  {
    id: "GH-1005",
    hourSlug: "why-cybersecurity-exists",
    title: "Business Impact Analysis — 4-Hour ACH Gateway Outage Scenario",
    category: "Business Impact Analysis",
    priority: "critical",
    difficulty: "senior",
    estMinutes: 25,
    xp: XP_BY_PRIORITY.critical,
    badge: "ceh-day1-operator",
    client: "GlassHouse Bank",
    ticketTag: "OPERATION GLASSHOUSE",
    analystBrief:
      "Treasury wants a BIA for a 4-hour outage of the ACH gateway during business hours. Quantify financial, regulatory, and reputational impact. Recommend RTO/RPO that the business will actually buy.",
    contextFacts: [
      { label: "Daily ACH volume", value: "$48M across 22,000 transactions" },
      { label: "Late-settlement penalty", value: "$0.40 per delayed item · regulator escalation > 2h" },
      { label: "Customer notification SLA", value: "≤ 30 min after declared incident" },
      { label: "Current DR", value: "Cold standby in secondary region, untested in 14 months" },
    ],
    frameworks: {
      ceh: ["Business impact", "RTO / RPO"],
      nist_csf: ["Identify", "Recover"],
      iso_27001: ["A.5.29 Information security during disruption", "A.5.30 ICT readiness for business continuity"],
      nist_800_53: ["CP-2 Contingency Plan", "CP-4 Contingency Plan Testing"],
      cis: ["Control 11 — Data Recovery"],
    },
    steps: [
      {
        id: "s1",
        phase: "collect",
        title: "Quantify the impact dimensions",
        objective: "Estimate Financial · Regulatory · Reputational · Operational impact for the 4h outage.",
        instructions: [
          "Attach 4 'risk_matrix' evidence cards (one per dimension) with a $ or qualitative score and a 1-line basis.",
        ],
        expected: "4 risk_matrix cards.",
        evidence: [{ kind: "risk_matrix", label: "Impact dimension scoring", count: 4 }],
        commonMistakes: [
          "Forgetting per-item late-settlement penalties multiply fast.",
          "Treating reputational impact as un-quantifiable instead of estimating customer churn.",
        ],
      },
      {
        id: "s2",
        phase: "recommend",
        title: "Decision — RTO target you'll defend to Treasury",
        objective: "Pick a defensible RTO.",
        instructions: ["Pick the option that matches penalty curves and the customer-notification SLA."],
        expected: "Decision recorded.",
        evidence: [],
        decision: {
          prompt: "Which RTO do you recommend the business fund?",
          options: [
            { id: "rto_30", label: "RTO 30 min — hot/hot active-active", correct: false,
              finding: { severity: "low", label: "Likely over-spend unless Treasury accepts the cost — defend with math, not vibes" } },
            { id: "rto_2h", label: "RTO 2 hours — warm standby, automated failover, quarterly DR test", correct: true },
            { id: "rto_8h", label: "RTO 8 hours — keep current cold standby", correct: false,
              finding: { severity: "critical", label: "Blows regulator-escalation threshold and customer notification SLA" } },
          ],
        },
      },
      {
        id: "s3",
        phase: "deliver",
        title: "BIA deliverable",
        objective: "Produce the BIA Treasury can sign.",
        instructions: ["Save the BIA deliverable."],
        expected: "BIA saved (≥ 500 chars).",
        evidence: [{ kind: "report", label: "BIA saved" }],
      },
    ],
    deliverables: [
      {
        kind: "exec_summary",
        title: "Business Impact Analysis — ACH Gateway (4h scenario)",
        prompt:
          "Sections:\n• Scenario\n• Impact across Financial / Regulatory / Reputational / Operational\n• Recommended RTO and RPO with math\n• Investment ask and the risk if Treasury declines",
        minChars: 500,
      },
    ],
    rubric: DEFAULT_RUBRIC,
    passingScore: 75,
  },
];
