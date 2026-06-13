// CEH v13 Day 1 — Hour-by-hour interactive curriculum.
// Phase 1 = Hours 1 & 2 (others scaffolded with status "upcoming").

import type { LucideIcon } from "lucide-react";
import {
  ShieldAlert, Scale, Users, Network, GitBranch, Workflow, Search, Crosshair,
} from "lucide-react";

export type HourStatus = "available" | "upcoming";

export interface MicroLabSpec {
  id: string;                // unique objective id; used with telemetry
  number: number;            // 1..30
  title: string;
  kind: "classify" | "match" | "decision" | "dragdrop" | "sequence" | "simulator";
  brief: string;
  /** Data for the lab. Shape depends on `kind`. */
  data: unknown;
}

export interface KCQuestion {
  q: string;
  options: string[];
  answer: number;          // index
  explain: string;
}

export interface InterviewQ {
  level: "Junior" | "Mid" | "Senior" | "Manager";
  q: string;
  answer: string;
}

export interface HourSpec {
  hour: number;              // 1..8
  slug: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  status: HourStatus;
  cehObjectives: string[];
  estMinutes: number;
  // Lesson sections
  mission: { codename: string; brief: string; success: string[] };
  story: { title: string; body: string[] };
  trainer: { sections: { title: string; body: string }[] };
  knowledgeMap: { nodes: { id: string; label: string; def: string; group: string }[]; edges: [string, string, string?][] };
  labs: MicroLabSpec[];
  knowledgeCheck: KCQuestion[];
  challenge?: { title: string; brief: string; victory: string };
  exam: { rating: 1 | 2 | 3 | 4 | 5; tested: string[]; mnemonics: string[]; traps: string[]; rapid: string[] };
  interview: InterviewQ[];
}

/* ──────────────────────────────────────────────────────────────────────── */

const HOUR1: HourSpec = {
  hour: 1,
  slug: "why-cybersecurity-exists",
  title: "Why Cybersecurity Exists",
  subtitle: "Information · Asset · Threat · Vulnerability · Risk · Security",
  icon: ShieldAlert,
  status: "available",
  cehObjectives: [
    "Define information, asset, threat, vulnerability, risk, exposure",
    "Differentiate risk vs. threat vs. vulnerability",
    "Map controls to asset value & business impact",
  ],
  estMinutes: 55,
  mission: {
    codename: "OP. GLASSHOUSE",
    brief: "You're the new junior consultant at ShadowX Labs. A regional fintech, Glasshouse Bank, signs a 90-day engagement after a near-miss incident. Your first deliverable: a one-page asset/threat/risk register the CISO can present to the board on Monday.",
    success: [
      "Identify 5 critical assets the bank must protect",
      "Pair each asset with its primary threat and vulnerability",
      "Express each pairing as a risk statement in business terms",
    ],
  },
  story: {
    title: "A 02:14 a.m. phone call",
    body: [
      "It's Tuesday, 02:14 a.m. The Glasshouse SOC analyst sees a spike of failed logins against the customer banking portal — 41,000 in eight minutes, sourced from 1,200 residential IPs. Credentials are valid pairs leaked from an unrelated breach two years ago. Three accounts succeed before MFA blocks the rest.",
      "Nothing is stolen. The CEO still calls the CISO at 06:30. 'Why are we exposed to a breach we had nothing to do with?' The CISO has no good one-sentence answer.",
      "That sentence is what you're about to learn to write. It lives at the intersection of six words: information, asset, threat, vulnerability, risk, security. Get those six straight and every other CEH topic — kill chain, MITRE, controls, pentesting — snaps onto a frame that already makes sense.",
    ],
  },
  trainer: {
    sections: [
      { title: "Information vs. Asset", body: "Information is raw data with meaning (a customer's date of birth). An asset is anything of value to the organisation — could be information, but also a person, a process, a server, a brand. Every asset has an owner, a value, and a sensitivity classification." },
      { title: "Threat = adversary × intent × capability", body: "A threat is a potential cause of harm. It needs an adversary (who), intent (why), and capability (how). Lightning is a threat to a datacentre even without intent — natural threats count too. CEH cares mostly about human/adversarial threats: criminals, insiders, nation-states." },
      { title: "Vulnerability = the weakness", body: "A vulnerability is a flaw the threat can exploit — unpatched software, weak passwords, a process gap, an untrained user. No vulnerability = the threat has nothing to grab onto. Most controls target vulnerabilities, not threats." },
      { title: "Risk = likelihood × impact", body: "Risk is the *probability that a threat exploits a vulnerability and causes business impact*. Risk only exists when threat AND vulnerability AND impact line up. Remove any one and risk collapses. CEH frames every defensive decision as risk treatment: accept, avoid, mitigate, transfer." },
      { title: "Exposure & Security", body: "Exposure is the period or state where the vulnerability is reachable by the threat (an unpatched server published to the internet). Security is the set of people, process, and technology controls that reduce risk to an acceptable level — never zero." },
    ],
  },
  knowledgeMap: {
    nodes: [
      { id: "info", label: "Information", group: "asset", def: "Data with meaning (customer PII, IP, source code)" },
      { id: "asset", label: "Asset", group: "asset", def: "Anything of value — info, system, person, process, brand" },
      { id: "threat", label: "Threat", group: "adv", def: "Adversary × intent × capability that could cause harm" },
      { id: "vuln", label: "Vulnerability", group: "weak", def: "Weakness a threat can exploit" },
      { id: "expo", label: "Exposure", group: "weak", def: "Window during which vulnerability is reachable" },
      { id: "risk", label: "Risk", group: "risk", def: "Likelihood × impact of threat exploiting vulnerability" },
      { id: "ctrl", label: "Security Control", group: "ctrl", def: "People/process/tech that reduces risk" },
      { id: "impact", label: "Impact", group: "risk", def: "Business consequence (financial, reputational, legal)" },
    ],
    edges: [
      ["info", "asset", "is-a"],
      ["threat", "vuln", "exploits"],
      ["vuln", "expo", "creates"],
      ["threat", "risk", "drives"],
      ["vuln", "risk", "enables"],
      ["impact", "risk", "scales"],
      ["ctrl", "vuln", "mitigates"],
      ["ctrl", "risk", "reduces"],
    ],
  },
  labs: [
    {
      id: "d1h1-l1-assets",
      number: 1,
      title: "Lab 1 · Identify Assets",
      kind: "classify",
      brief: "Glasshouse Bank inventory — classify each item as a CRITICAL ASSET, supporting asset, or NOT an asset.",
      data: {
        buckets: [
          { id: "critical", label: "Critical Asset", hint: "Core to mission; loss = severe business impact" },
          { id: "supporting", label: "Supporting Asset", hint: "Enables critical assets but not core itself" },
          { id: "none", label: "Not an Asset", hint: "Has no business value to protect" },
        ],
        items: [
          { id: "a", label: "Customer banking database (12M PII records)", correct: "critical" },
          { id: "b", label: "Office coffee machine", correct: "none" },
          { id: "c", label: "Lead developer's laptop with prod SSH keys", correct: "critical" },
          { id: "d", label: "Internal Confluence wiki (architecture docs)", correct: "supporting" },
          { id: "e", label: "Bank's brand reputation", correct: "critical" },
          { id: "f", label: "The CEO's published LinkedIn profile", correct: "none" },
          { id: "g", label: "DNS infrastructure for online banking", correct: "supporting" },
        ],
      },
    },
    {
      id: "d1h1-l2-threats",
      number: 2,
      title: "Lab 2 · Identify Threats",
      kind: "classify",
      brief: "Tag each scenario by threat category. Think: who is the adversary?",
      data: {
        buckets: [
          { id: "criminal", label: "Organised Cybercrime", hint: "Financial motive" },
          { id: "nation", label: "Nation-State / APT", hint: "Espionage or sabotage" },
          { id: "insider", label: "Insider", hint: "Access + grievance/error" },
          { id: "natural", label: "Natural / Environmental", hint: "No intent" },
        ],
        items: [
          { id: "a", label: "Ransomware gang encrypts the loan-origination system, demands $4M", correct: "criminal" },
          { id: "b", label: "Recently-fired DBA exfiltrates a customer list to a USB stick", correct: "insider" },
          { id: "c", label: "A foreign intelligence service plants implants in the SWIFT gateway", correct: "nation" },
          { id: "d", label: "Monsoon flooding takes the primary datacentre offline for 36h", correct: "natural" },
          { id: "e", label: "An employee accidentally emails a CSV of accounts to the wrong vendor", correct: "insider" },
          { id: "f", label: "Phishing-as-a-service crew sells access to the bank's VPN on a dark-web forum", correct: "criminal" },
        ],
      },
    },
    {
      id: "d1h1-l3-risk-map",
      number: 3,
      title: "Lab 3 · Map Vulnerability → Risk",
      kind: "match",
      brief: "Match each vulnerability to the most precise resulting risk statement.",
      data: {
        left: [
          { id: "v1", label: "Online banking portal allows unlimited login attempts" },
          { id: "v2", label: "S3 bucket holding statements is world-readable" },
          { id: "v3", label: "Branch staff share a single Windows admin password on a sticky note" },
          { id: "v4", label: "Loan-app server runs Apache 2.4.49 (CVE-2021-41773)" },
        ],
        right: [
          { id: "r1", label: "Credential-stuffing attackers compromise customer accounts using leaked passwords from third-party breaches" },
          { id: "r2", label: "Public disclosure of 12M customer statements → GDPR fines, brand damage" },
          { id: "r3", label: "Insider or visitor escalates to local admin and pivots into the LAN" },
          { id: "r4", label: "Internet attacker achieves RCE on the loan-application server" },
        ],
        pairs: { v1: "r1", v2: "r2", v3: "r3", v4: "r4" },
      },
    },
  ],
  knowledgeCheck: [
    { q: "An attacker exists with the skills and motive to attack you, but your systems are fully patched and segmented. What do you have?", options: ["Risk", "Threat", "Vulnerability", "Exposure"], answer: 1, explain: "Threat exists (adversary + intent + capability), but with no vulnerability the risk is near-zero." },
    { q: "Risk is best expressed as…", options: ["Threat + Vulnerability", "Likelihood × Impact", "Vulnerability × Exposure", "Threat × Asset Value"], answer: 1, explain: "Risk = the probability (likelihood) of a threat exploiting a vulnerability × the business impact if it succeeds." },
    { q: "Which of the following is NOT an asset?", options: ["Brand reputation", "Customer database", "An unpatched legacy server", "An employee with privileged knowledge"], answer: 2, explain: "An unpatched server may host an asset, but the unpatched state itself is a vulnerability, not an asset. (The server hardware/service IS an asset.) Trap question — read carefully." },
    { q: "Removing a vulnerability eliminates risk only if…", options: ["The threat actor is also removed", "There is no other vulnerability the same threat can exploit", "The asset value drops to zero", "Compensating controls are in place"], answer: 1, explain: "Risk = threat × vulnerability × impact. Removing one vuln still leaves residual risk if other vulns enable the same threat path." },
    { q: "A datacentre in a flood zone has no backup site. The flood-zone location is the…", options: ["Threat", "Vulnerability", "Risk", "Impact"], answer: 1, explain: "Flooding is the threat. The location/lack-of-DR is the vulnerability. Risk is the combination, and the outage is the impact." },
  ],
  challenge: {
    title: "Challenge · Board-Brief in 90 seconds",
    brief: "Pick ONE asset from Lab 1, ONE threat from Lab 2, ONE vulnerability you can imagine, and write the resulting risk in board language (≤25 words). Self-grade against the rubric.",
    victory: "If your sentence names the asset, the threat actor, the vulnerability, and the business consequence — you've understood Hour 1.",
  },
  exam: {
    rating: 5,
    tested: [
      "Risk vs. threat vs. vulnerability vs. exposure (definitions)",
      "Risk = likelihood × impact formula",
      "Risk treatment options: accept / avoid / mitigate / transfer",
      "Asset valuation drives control prioritisation",
    ],
    mnemonics: [
      "TVRE — Threat needs Vulnerability to create Risk; Exposure is the window.",
      "AAMT — Accept / Avoid / Mitigate / Transfer (the only four risk responses).",
    ],
    traps: [
      "'Risk' and 'threat' used as synonyms in the answer options — pick the one matching the textbook formula.",
      "A vulnerability that nobody can reach is exposure-zero, not risk-zero (capable threat could appear).",
    ],
    rapid: [
      "Insurance = risk TRANSFER (not mitigate)",
      "Decommissioning a service = risk AVOID",
      "Patching a CVE = risk MITIGATE",
      "Knowing-and-accepting = risk ACCEPT (must be documented + signed)",
    ],
  },
  interview: [
    { level: "Junior", q: "Define threat, vulnerability, and risk in one sentence each.", answer: "Threat = a potential cause of harm (adversary with intent and capability). Vulnerability = a weakness an adversary could exploit. Risk = the likelihood that a threat exploits a vulnerability multiplied by the business impact." },
    { level: "Mid", q: "Walk me through how you'd build a risk register for a new web app.", answer: "Enumerate assets and their value owners → map threats by adversary class → identify vulnerabilities via design review + SAST/DAST + threat modelling → rate each (likelihood × impact) on a 5×5 → recommend treatment per item → sign-off with the business owner and re-test cadence." },
    { level: "Senior", q: "How do you decide whether to ACCEPT a risk rather than MITIGATE it?", answer: "Cost-benefit: if the cost of mitigation exceeds the expected loss (annualised), and the business owner formally signs off knowing the residual exposure, acceptance is rational. Document it, set a review date, and add detective controls so an actual incident is still caught fast." },
    { level: "Manager", q: "The CEO says 'we just need to be unhackable'. How do you respond?", answer: "Reframe: zero risk doesn't exist — controls reduce risk to a tolerated level set by the business. Together we agree the risk appetite, then I show you how the security budget moves us from current residual to target residual, and what we choose to accept along the way." },
  ],
};

/* ──────────────────────────────────────────────────────────────────────── */

const HOUR2: HourSpec = {
  hour: 2,
  slug: "ethical-hacking-foundations",
  title: "Ethical Hacking Foundations",
  subtitle: "Hats · Authorization · Scope · Rules of Engagement",
  icon: Scale,
  status: "available",
  cehObjectives: [
    "Differentiate white/black/grey/red/blue/purple/green hats",
    "Define authorization, scope, RoE, and legal exposure",
    "Recognise unethical/illegal behaviour even when 'helpful'",
  ],
  estMinutes: 55,
  mission: {
    codename: "OP. PAPER-SHIELD",
    brief: "Glasshouse signed your test — but the engagement letter is two paragraphs of vague language. Before you touch a single packet, you must turn that into a defensible Rules-of-Engagement document. The wrong word here is a criminal record.",
    success: [
      "Classify 6 actions as ethical / unethical / illegal",
      "Validate that an RoE covers scope, timing, contacts, get-out-of-jail",
      "Decide go/no-go on three real-world authorization scenarios",
    ],
  },
  story: {
    title: "The friend who 'just took a look'",
    body: [
      "Three years ago a freelance pentester named Marcus got a casual ask from a friend who ran a SaaS startup: 'see if you can break in, I'll buy you dinner'. No paperwork. He found an IDOR, dumped 4,000 user records to show severity, and emailed a PDF report.",
      "Two weeks later his front door was knocked on at 06:00. The startup's lawyers had escalated to the police because the dump showed exfiltration of PII without written authorization. The 'verbal' agreement vanished in negotiation.",
      "The CFAA in the US, the Computer Misuse Act in the UK, India's IT Act §43/§66 — none of them care how nice your intent was. Authorization in writing, with scope, time-box, signatories and contacts, is the only thing standing between you and the same knock.",
    ],
  },
  trainer: {
    sections: [
      { title: "The hat colours", body: "WHITE = authorised, ethical, helps defenders. BLACK = unauthorised, criminal intent. GREY = blends — may break the law without malicious intent (vigilante disclosure). BLUE = defender / SOC. RED = offensive emulation team. PURPLE = red + blue collaborating live. GREEN = curious newcomer learning. Hats describe authorisation + intent, not skill." },
      { title: "Authorization — the only line that matters", body: "Authorization must be: WRITTEN, SIGNED by someone with authority over the asset, SCOPED to specific systems/IPs/URLs, TIME-BOXED with start and end, with named POINTS OF CONTACT both sides, and ideally include a 'get-out-of-jail' letter you can present to law enforcement. No paperwork = no engagement. Period." },
      { title: "Scope — explicit IN, explicit OUT", body: "Scope lists exact targets (IPs, domains, applications, accounts) and exclusions (production payment processors, third-party SaaS, customer data exfiltration limits). Anything not listed is assumed OUT. 'Test the whole environment' is not scope — it's an invitation to disaster." },
      { title: "Rules of Engagement (RoE)", body: "Beyond scope, RoE answers: WHAT actions are permitted (passive recon, active scan, exploitation, social engineering, DoS)? WHEN can you act (windows, blackout periods)? HOW do you handle sensitive data you discover? WHO do you contact on a critical finding mid-test? WHAT triggers an emergency stop? Sign two copies." },
      { title: "Bug bounty ≠ pentest authorization", body: "A bounty programme's 'safe harbour' clause IS a form of authorization but only for the scope and methods listed. Testing an out-of-scope subdomain because 'it's the same company' is still unauthorized access. Read the policy before every test." },
    ],
  },
  knowledgeMap: {
    nodes: [
      { id: "auth", label: "Written Authorization", group: "core", def: "Signed contract listing scope, time, contacts" },
      { id: "scope", label: "Scope", group: "core", def: "Explicit targets in/out" },
      { id: "roe", label: "Rules of Engagement", group: "core", def: "Permitted methods, timing, escalation" },
      { id: "white", label: "White Hat", group: "ethical", def: "Authorised, ethical" },
      { id: "grey", label: "Grey Hat", group: "ambiguous", def: "Acts without authorization but without malicious intent" },
      { id: "black", label: "Black Hat", group: "illegal", def: "Unauthorised, criminal intent" },
      { id: "red", label: "Red Team", group: "ethical", def: "Authorised adversary emulation" },
      { id: "purple", label: "Purple Team", group: "ethical", def: "Red + Blue collaboration" },
      { id: "law", label: "Legal Exposure", group: "risk", def: "CFAA / CMA / IT Act §43/§66" },
    ],
    edges: [
      ["auth", "white", "enables"],
      ["scope", "auth", "completes"],
      ["roe", "auth", "completes"],
      ["grey", "law", "exposes-to"],
      ["black", "law", "violates"],
      ["red", "purple", "evolves-to"],
      ["red", "white", "is-a"],
    ],
  },
  labs: [
    {
      id: "d1h2-l4-ethical",
      number: 4,
      title: "Lab 4 · Ethical vs Illegal Classifier",
      kind: "classify",
      brief: "Tag each action assuming no prior written authorization unless stated.",
      data: {
        buckets: [
          { id: "ethical", label: "Ethical & Legal", hint: "Authorised + within scope + lawful" },
          { id: "unethical", label: "Unethical but Legal", hint: "Allowed by law but breaks professional ethics" },
          { id: "illegal", label: "Illegal", hint: "Violates CFAA / CMA / IT Act regardless of intent" },
        ],
        items: [
          { id: "a", label: "Run nmap against a client's IP listed in a signed SoW during the agreed window", correct: "ethical" },
          { id: "b", label: "Run nmap against a random company because 'they look insecure'", correct: "illegal" },
          { id: "c", label: "Reveal a client's critical finding to a competitor's CISO 'as a heads-up'", correct: "unethical" },
          { id: "d", label: "Submit a vulnerability via an out-of-scope subdomain on a bug-bounty programme", correct: "illegal" },
          { id: "e", label: "Send a phishing email to your client's employees with HR-approved SE clause in RoE", correct: "ethical" },
          { id: "f", label: "Brute-force the login of an ex-employer 'to prove a point'", correct: "illegal" },
        ],
      },
    },
    {
      id: "d1h2-l5-roe",
      number: 5,
      title: "Lab 5 · Rules of Engagement Validation",
      kind: "classify",
      brief: "Review this draft RoE. Mark each clause as PRESENT, MISSING, or DANGEROUSLY VAGUE.",
      data: {
        buckets: [
          { id: "present", label: "Present & Clear", hint: "Specific enough to act on" },
          { id: "vague", label: "Dangerously Vague", hint: "Reads OK but lawyers will fight over it" },
          { id: "missing", label: "Missing", hint: "Not in the draft at all" },
        ],
        items: [
          { id: "a", label: "'Test the entire production environment'", correct: "vague" },
          { id: "b", label: "Scope IPs listed: 203.0.113.10–203.0.113.40, app.glasshouse.test", correct: "present" },
          { id: "c", label: "Test window: 2026-06-15 00:00 IST → 2026-06-29 23:59 IST", correct: "present" },
          { id: "d", label: "Emergency stop contact: (no entry)", correct: "missing" },
          { id: "e", label: "'Social engineering allowed if reasonable'", correct: "vague" },
          { id: "f", label: "DoS testing permitted against load-balanced staging only, NOT prod", correct: "present" },
          { id: "g", label: "Handling of discovered PII: (no entry)", correct: "missing" },
        ],
      },
    },
    {
      id: "d1h2-l6-authz",
      number: 6,
      title: "Lab 6 · Authorization Decision Simulator",
      kind: "decision",
      brief: "Three scenarios land in your inbox. Decide GO / NO-GO / HOLD and pick the right reason.",
      data: {
        scenarios: [
          {
            id: "s1",
            ask: "Client CTO replies 'yes go ahead, start tonight' via Slack. Master Services Agreement is signed but no Statement of Work for THIS engagement yet.",
            choice: "hold",
            reasons: [
              { id: "a", text: "GO — CTO has authority", correct: false },
              { id: "b", text: "NO-GO — verbal/Slack approval is worthless", correct: false },
              { id: "c", text: "HOLD — MSA exists, request signed SoW with scope/time before any traffic", correct: true },
            ],
          },
          {
            id: "s2",
            ask: "Bug-bounty researcher asks you to 'collaborate' on a Fortune 500 target. Their account has safe-harbour for in-scope assets only. They want to test an out-of-scope CRM 'because they bought the company last week'.",
            choice: "no",
            reasons: [
              { id: "a", text: "GO — acquisition transfers safe harbour", correct: false },
              { id: "b", text: "NO-GO — out-of-scope is out-of-scope until the policy text is updated", correct: true },
              { id: "c", text: "HOLD — wait 24h then proceed", correct: false },
            ],
          },
          {
            id: "s3",
            ask: "Internal red-team engagement. CISO signed SoW. Mid-test you discover a critical RCE in a SaaS the client uses (Slack, Zoom-like). Do you exploit it?",
            choice: "no",
            reasons: [
              { id: "a", text: "GO — the SaaS is in the client's environment", correct: false },
              { id: "b", text: "NO-GO — third-party SaaS is out-of-scope; disclose to the SaaS vendor and the client", correct: true },
              { id: "c", text: "HOLD — get verbal approval from CISO", correct: false },
            ],
          },
        ],
      },
    },
  ],
  knowledgeCheck: [
    { q: "Which alone makes a security test legal?", options: ["Good intent", "Written, signed, scoped authorization", "A bug-bounty account", "An NDA"], answer: 1, explain: "Intent does not grant authorization. Only a written, scoped, signed agreement (or a bounty's published safe-harbour for in-scope assets) does." },
    { q: "Acting without authorization but without malicious intent describes a…", options: ["White hat", "Black hat", "Grey hat", "Red team operator"], answer: 2, explain: "Grey hats may find and disclose vulns 'helpfully' but operate without permission — still legally exposed." },
    { q: "Purple teaming is best described as…", options: ["A solo pentester wearing many hats", "Red team attacking blue team in secret", "Red and blue collaborating with shared visibility to improve detections", "An external consultant grading the SOC"], answer: 2, explain: "Purple = transparent, collaborative red+blue exercise where attacks are run with detection engineering happening alongside." },
    { q: "The single most important element of a Rules of Engagement document is…", options: ["The legal jurisdiction clause", "The list of tools that may be used", "Explicit scope (in and out) and an emergency-stop contact", "The price"], answer: 2, explain: "CEH and real practice both stress scope clarity + a 24/7 contact for catastrophic findings. Everything else flows from those." },
  ],
  challenge: {
    title: "Challenge · Spot the Booby-Trapped Engagement",
    brief: "You're handed: an email from a Director ('go ahead, I cleared it'), a 5-line scope ('everything internet-facing'), and a 'do whatever it takes' instruction. List THREE things you must demand before sending one packet.",
    victory: "Written signed SoW from someone with asset authority · explicit IPs/URLs in scope and OUT · 24/7 escalation contact + emergency stop trigger.",
  },
  exam: {
    rating: 4,
    tested: [
      "Hat colour definitions (white/black/grey/red/blue/purple/green)",
      "Required elements of authorization & RoE",
      "Bug-bounty safe-harbour scope limits",
      "Pentest types: black-box / grey-box / white-box, external/internal/red-team/purple-team",
    ],
    mnemonics: [
      "SWAT — Scope, Window, Authorization-signed, Termination contact: must be in every RoE.",
      "Hat = Authorization + Intent. Skill doesn't change the colour.",
    ],
    traps: [
      "Verbal/Slack approval being treated as authorization in answer options.",
      "Confusing grey hat (no auth, no malice) with white hat (auth + ethics).",
      "Assuming 'bug bounty programme' = blanket permission for everything the company owns.",
    ],
    rapid: [
      "Black-box = zero prior knowledge",
      "Grey-box = limited info / standard user creds",
      "White-box = full source + architecture",
      "Red team = goal-oriented adversary emulation",
      "Purple team = red + blue working together live",
    ],
  },
  interview: [
    { level: "Junior", q: "Difference between a white hat and a grey hat?", answer: "White hat = authorised AND ethical. Grey hat = no authorisation but no malicious intent — still legally exposed because authorisation is the only line that matters." },
    { level: "Mid", q: "Walk me through the contents of a Rules of Engagement document.", answer: "Scope (explicit in/out targets), test window, permitted methods, prohibited actions, data-handling rules, emergency stop trigger, 24/7 contact both sides, escalation path for critical findings, evidence-handling and retention, and signatures from someone with authority over the assets." },
    { level: "Senior", q: "Mid-test you find a critical zero-day in a third-party SaaS the client uses. Walk me through your next 30 minutes.", answer: "Stop further testing of that path. Notify the client's primary contact under the RoE escalation clause. Coordinate disclosure to the SaaS vendor via their security.txt / responsible disclosure channel. Document timeline and evidence. Do NOT exploit further or pivot — the SaaS is out of scope regardless of impact." },
    { level: "Manager", q: "How do you protect your consultants from CFAA / IT Act exposure?", answer: "Standardised SoW template requiring written authorization from an authority-bearing signatory, scope and exclusions explicit, a get-out-of-jail letter on the engagement, mandatory pre-flight checklist before any traffic, insurance, named legal counsel on retainer, and a strict rule that verbal/Slack changes don't constitute scope changes." },
  ],
};

/* ──────────────────────────────────────────────────────────────────────── */

export const DAY1_HOURS: HourSpec[] = [
  HOUR1,
  HOUR2,
  { hour: 3, slug: "threat-actors-vectors", title: "Threat Actors & Attack Vectors", subtitle: "Script kiddies → Nation-states", icon: Users, status: "upcoming", cehObjectives: [], estMinutes: 60, mission: { codename: "", brief: "", success: [] }, story: { title: "", body: [] }, trainer: { sections: [] }, knowledgeMap: { nodes: [], edges: [] }, labs: [], knowledgeCheck: [], exam: { rating: 4, tested: [], mnemonics: [], traps: [], rapid: [] }, interview: [] },
  { hour: 4, slug: "cia-dad-controls", title: "CIA / DAD / Security Controls", subtitle: "Confidentiality · Integrity · Availability", icon: Network, status: "upcoming", cehObjectives: [], estMinutes: 60, mission: { codename: "", brief: "", success: [] }, story: { title: "", body: [] }, trainer: { sections: [] }, knowledgeMap: { nodes: [], edges: [] }, labs: [], knowledgeCheck: [], exam: { rating: 5, tested: [], mnemonics: [], traps: [], rapid: [] }, interview: [] },
  { hour: 5, slug: "kill-chain-mitre", title: "Cyber Kill Chain & MITRE ATT&CK", subtitle: "Adversary lifecycle frameworks", icon: GitBranch, status: "upcoming", cehObjectives: [], estMinutes: 70, mission: { codename: "", brief: "", success: [] }, story: { title: "", body: [] }, trainer: { sections: [] }, knowledgeMap: { nodes: [], edges: [] }, labs: [], knowledgeCheck: [], exam: { rating: 5, tested: [], mnemonics: [], traps: [], rapid: [] }, interview: [] },
  { hour: 6, slug: "hacking-methodology", title: "Ethical Hacking Methodology", subtitle: "Recon → Reporting", icon: Workflow, status: "upcoming", cehObjectives: [], estMinutes: 60, mission: { codename: "", brief: "", success: [] }, story: { title: "", body: [] }, trainer: { sections: [] }, knowledgeMap: { nodes: [], edges: [] }, labs: [], knowledgeCheck: [], exam: { rating: 4, tested: [], mnemonics: [], traps: [], rapid: [] }, interview: [] },
  { hour: 7, slug: "footprinting-fundamentals", title: "Footprinting & Reconnaissance", subtitle: "Passive / Active / OSINT", icon: Search, status: "upcoming", cehObjectives: [], estMinutes: 60, mission: { codename: "", brief: "", success: [] }, story: { title: "", body: [] }, trainer: { sections: [] }, knowledgeMap: { nodes: [], edges: [] }, labs: [], knowledgeCheck: [], exam: { rating: 5, tested: [], mnemonics: [], traps: [], rapid: [] }, interview: [] },
  { hour: 8, slug: "recon-simulators", title: "Interactive Reconnaissance Labs", subtitle: "WHOIS / DNS / OSINT simulators", icon: Crosshair, status: "upcoming", cehObjectives: [], estMinutes: 80, mission: { codename: "", brief: "", success: [] }, story: { title: "", body: [] }, trainer: { sections: [] }, knowledgeMap: { nodes: [], edges: [] }, labs: [], knowledgeCheck: [], exam: { rating: 5, tested: [], mnemonics: [], traps: [], rapid: [] }, interview: [] },
];

export function getHour(slug: string) {
  return DAY1_HOURS.find((h) => h.slug === slug);
}
