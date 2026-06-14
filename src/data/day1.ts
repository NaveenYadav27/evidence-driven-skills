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

const HOUR3: HourSpec = {
  hour: 3,
  slug: "threat-actors-vectors",
  title: "Threat Actors & Attack Vectors",
  subtitle: "Script kiddies · Hacktivists · Crime · Insiders · APTs",
  icon: Users,
  status: "available",
  cehObjectives: [
    "Classify threat actors by capability, intent, resources, and motivation",
    "Map common attack vectors to actor classes",
    "Use threat-actor profiles to prioritise controls",
  ],
  estMinutes: 60,
  mission: {
    codename: "OP. KNOW-THY-ENEMY",
    brief: "Glasshouse Bank's risk register lists 'cyber attack' as a single line item. The CISO wants you to decompose it into named adversaries with realistic playbooks so the defence budget can be aimed, not sprayed.",
    success: [
      "Profile 4 threat-actor classes most relevant to a regional bank",
      "Match 8 real-world incidents to the actor type behind them",
      "Recommend the top control per actor based on their preferred vector",
    ],
  },
  story: {
    title: "Three breaches, three very different attackers",
    body: [
      "In one month Glasshouse's industry peers suffered three incidents. A small credit union was crippled by LockBit ransomware demanding $2.1M. A government-owned bank in a neighbouring country had wire-transfer instructions silently altered for 11 days — fingerprints pointed to a state-sponsored APT. A fintech lost a confidential merger memo: posted to a leak forum by a contractor who'd been let go the prior Friday.",
      "Same word — 'breach'. Three completely different attackers, with different goals, tools, patience, and tells. A defence built only for ransomware would have missed the APT and the insider entirely.",
      "Threat-actor literacy is what turns generic security spending into targeted spending. By the end of this hour you'll read an incident summary and name the likely actor class within thirty seconds.",
    ],
  },
  trainer: {
    sections: [
      { title: "Script Kiddie", body: "Low skill, runs off-the-shelf tooling (Metasploit modules, leaked exploit kits). Motivation: bragging rights, curiosity. Targets are opportunistic — whoever is exposed. Defends easily with patching, MFA, basic hygiene. They are noisy and unsubtle, which makes them the most common reason for a SOC alert." },
      { title: "Hacktivist", body: "Skill ranges low to medium. Motivation is ideological (political, environmental, religious). Common vectors: web defacement, DDoS, doxxing, hack-and-leak. Anonymous, LulzSec, and modern groups like KillNet are archetypes. They want visibility, so attacks are public-facing and timed to events (elections, conflicts, protests)." },
      { title: "Organised Cybercrime", body: "Skilled, well-resourced, financially motivated. Ransomware-as-a-Service crews (LockBit, BlackCat, Cl0p), business-email-compromise rings, banking trojan operators, initial-access brokers. They run businesses — affiliates, ransom negotiators, leak sites. Their preferred vectors: phishing, exposed RDP/VPN, exploited public CVEs, MSP supply chain." },
      { title: "Insider Threat", body: "Has legitimate access already. Sub-types: MALICIOUS (disgruntled, espionage-for-hire, ideological), NEGLIGENT (clicks the phishing link, misconfigures the S3 bucket), COMPROMISED (account taken over without their knowledge). Hardest class to detect because their behaviour starts inside the trust boundary. UEBA, DLP, least-privilege, and offboarding rigor are the main controls." },
      { title: "Advanced Persistent Threat (APT)", body: "Nation-state or state-sponsored. Highest skill, long-term resources, willing to spend months staging an operation. Goals: espionage, IP theft, sabotage, financial gain for the state (e.g. DPRK's Lazarus stealing crypto). Operate slowly, blend with legitimate admin activity, use zero-days when needed. Detection requires threat-intel-driven hunting and high-fidelity telemetry." },
      { title: "Cyber Terrorist & state-aligned hybrid", body: "Aim to cause physical or societal disruption (power grids, transport, hospitals). Often state-tolerated or state-aligned. Vectors blur with APTs: spear-phish into OT environments, then destructive payloads. CEH groups them under 'cyber terrorism' but their tradecraft overlaps with both hacktivists and APTs." },
    ],
  },
  knowledgeMap: {
    nodes: [
      { id: "sk", label: "Script Kiddie", group: "asset", def: "Low skill · off-the-shelf tools · opportunistic" },
      { id: "ha", label: "Hacktivist", group: "adv", def: "Ideological · public-facing · timed to events" },
      { id: "cc", label: "Cybercrime", group: "adv", def: "Financial · RaaS / BEC / IABs" },
      { id: "in", label: "Insider", group: "weak", def: "Legitimate access · malicious / negligent / compromised" },
      { id: "apt", label: "APT", group: "risk", def: "Nation-state · persistent · stealthy" },
      { id: "ph", label: "Phishing", group: "ctrl", def: "Top initial vector for crime + APT" },
      { id: "cve", label: "Public CVE", group: "ctrl", def: "Exposed unpatched service" },
      { id: "rdp", label: "Exposed RDP/VPN", group: "ctrl", def: "Cred-stuffed → ransomware" },
      { id: "sc", label: "Supply Chain", group: "ctrl", def: "Vendor / MSP / library compromise" },
      { id: "zd", label: "Zero-Day", group: "ctrl", def: "Unknown vulnerability — APT signature" },
    ],
    edges: [
      ["sk", "cve", "scans-for"],
      ["ha", "ph", "uses"],
      ["cc", "ph", "uses"],
      ["cc", "rdp", "exploits"],
      ["cc", "sc", "abuses"],
      ["apt", "zd", "deploys"],
      ["apt", "sc", "abuses"],
      ["apt", "ph", "spear-phishes"],
    ],
  },
  labs: [
    {
      id: "d1h3-l7-actors",
      number: 7,
      title: "Lab 7 · Profile the Actor",
      kind: "classify",
      brief: "Read each incident summary. Tag with the most likely threat-actor class.",
      data: {
        buckets: [
          { id: "sk", label: "Script Kiddie", hint: "Noisy, opportunistic, low skill" },
          { id: "ha", label: "Hacktivist", hint: "Ideological, public-facing" },
          { id: "cc", label: "Cybercrime", hint: "Financially motivated, organised" },
          { id: "in", label: "Insider", hint: "Already has access" },
          { id: "apt", label: "APT", hint: "Stealth, persistence, state resources" },
        ],
        items: [
          { id: "a", label: "Bank's homepage defaced with anti-globalisation slogans during a G20 summit", correct: "ha" },
          { id: "b", label: "Ransomware encrypts 400 servers; affiliate of LockBit cartel claims responsibility", correct: "cc" },
          { id: "c", label: "Departing relationship manager downloads client list to personal Dropbox on last day", correct: "in" },
          { id: "d", label: "Stealth implants in the SWIFT terminal silently re-routing wires for 9 months", correct: "apt" },
          { id: "e", label: "Defaced WordPress site running a 2-year-old exploit; attacker left 'pwned by xX' tag", correct: "sk" },
          { id: "f", label: "Spear-phish to CFO's assistant; malware blends with admin tools and exfiltrates M&A docs over months", correct: "apt" },
          { id: "g", label: "Initial-access broker sells working VPN credentials on a dark-web forum for $4,800", correct: "cc" },
          { id: "h", label: "DBA emails customer table to wrong vendor address by accident", correct: "in" },
        ],
      },
    },
    {
      id: "d1h3-l8-vectors",
      number: 8,
      title: "Lab 8 · Map Actor → Preferred Vector",
      kind: "match",
      brief: "Match each actor class to the attack vector that statistically appears most in their playbooks.",
      data: {
        left: [
          { id: "sk", label: "Script Kiddie" },
          { id: "ha", label: "Hacktivist collective" },
          { id: "cc", label: "Ransomware affiliate" },
          { id: "in", label: "Disgruntled insider" },
          { id: "apt", label: "Nation-state APT" },
        ],
        right: [
          { id: "r1", label: "Mass-scan for public CVEs / default credentials" },
          { id: "r2", label: "DDoS + web defacement timed to political event" },
          { id: "r3", label: "Phish + exposed RDP/VPN → encrypt + extort" },
          { id: "r4", label: "Authorised access abused → bulk export to personal storage" },
          { id: "r5", label: "Spear-phish + supply-chain compromise + zero-day, multi-month staging" },
        ],
        pairs: { sk: "r1", ha: "r2", cc: "r3", in: "r4", apt: "r5" },
      },
    },
    {
      id: "d1h3-l9-control",
      number: 9,
      title: "Lab 9 · Pick the High-Leverage Control",
      kind: "decision",
      brief: "For each threat-actor profile, which single control gives the most defensive leverage per dollar?",
      data: {
        scenarios: [
          {
            id: "s1",
            ask: "Regional bank's biggest risk is ransomware (organised cybercrime). Limited budget for one initiative this quarter.",
            choice: "best",
            reasons: [
              { id: "a", text: "Mandatory MFA on every external-facing service (VPN, email, admin portals)", correct: true },
              { id: "b", text: "Buy a deception/honeypot platform", correct: false },
              { id: "c", text: "Hire two more SOC analysts", correct: false },
            ],
          },
          {
            id: "s2",
            ask: "Threat model now adds APT (state-sponsored economic espionage). Top single investment?",
            choice: "best",
            reasons: [
              { id: "a", text: "Pay for a higher-tier next-gen antivirus", correct: false },
              { id: "b", text: "Threat-intel-driven hunting + EDR with high-fidelity telemetry retained 1 year+", correct: true },
              { id: "c", text: "Block all USB ports company-wide", correct: false },
            ],
          },
          {
            id: "s3",
            ask: "Insider risk is rising — three contractor terminations next month. Single biggest control?",
            choice: "best",
            reasons: [
              { id: "a", text: "Enforce a strict joiner-mover-leaver process with same-day access revocation and DLP egress alerts", correct: true },
              { id: "b", text: "Install full keystroke logging on every endpoint", correct: false },
              { id: "c", text: "Issue a stronger acceptable-use policy memo", correct: false },
            ],
          },
        ],
      },
    },
  ],
  knowledgeCheck: [
    { q: "Which actor class is MOST likely to use a zero-day exploit?", options: ["Script kiddie", "Hacktivist", "Ransomware affiliate", "APT"], answer: 3, explain: "Zero-days are expensive to develop and burn quickly once used. Only state-sponsored APTs typically have the resources, patience, and target value to justify deploying them." },
    { q: "An attack defaces a corporate site with political slogans during an election week. Most likely actor?", options: ["Cybercrime", "Insider", "Hacktivist", "Script kiddie"], answer: 2, explain: "Public-facing, ideologically themed, timed to a political event = hacktivist hallmark." },
    { q: "A negligent employee misconfiguring an S3 bucket counts as a…", options: ["Hacktivist incident", "Insider incident", "APT incident", "Not a security incident"], answer: 1, explain: "Insider threats include negligent insiders, not only malicious ones — they cause some of the largest data exposures on record." },
    { q: "Initial-access brokers (IABs) primarily serve…", options: ["Script kiddies", "Organised cybercrime / ransomware affiliates", "Hacktivists", "Auditors"], answer: 1, explain: "IABs sell footholds (VPN creds, web-shells) to ransomware affiliates and other monetising crime crews — a key step in the modern criminal supply chain." },
    { q: "The single biggest distinguishing trait of an APT vs. cybercrime is…", options: ["Use of malware", "Persistence and patience (months of dwell)", "Use of phishing", "Operating across borders"], answer: 1, explain: "Both use malware and phishing. APTs are defined by long-term, low-and-slow operations aimed at strategic value, not quick monetisation." },
  ],
  challenge: {
    title: "Challenge · The 30-Second Triage",
    brief: "Pick any one of Lab 7's scenarios. In ≤30 seconds, state: (1) actor class, (2) probable next move, (3) the ONE control that would have stopped them earliest in the kill chain.",
    victory: "Naming the actor, predicting their next move, and pinning the earliest-kill control = you're thinking like a defender, not a checklist.",
  },
  exam: {
    rating: 4,
    tested: [
      "Threat-actor classes and distinguishing motivations",
      "Mapping actor → typical TTPs / vectors",
      "Insider sub-types: malicious vs. negligent vs. compromised",
      "Why zero-days correlate with APTs",
    ],
    mnemonics: [
      "SHCIA — Script-kiddie, Hacktivist, Cybercrime, Insider, APT (low → high capability).",
      "MNC insiders — Malicious, Negligent, Compromised: three flavours, one access path.",
    ],
    traps: [
      "Equating 'sophisticated attack' with 'APT' — ransomware crews are sophisticated too.",
      "Forgetting that negligent insiders count even without intent.",
      "Calling state-aligned hacktivists 'just hacktivists' — tradecraft may overlap APT.",
    ],
    rapid: [
      "Lone wolf / vandal = script kiddie",
      "Ideology + public = hacktivist",
      "Money + business model = cybercrime",
      "Already inside = insider",
      "Stealth + state = APT",
    ],
  },
  interview: [
    { level: "Junior", q: "Name three threat-actor classes and what motivates each.", answer: "Script kiddies — curiosity / bragging rights, using off-the-shelf tools. Cybercriminals — money, via ransomware, BEC, fraud. APTs — state strategic goals like espionage, IP theft, or sabotage." },
    { level: "Mid", q: "How would you decide whether an incident is the work of an APT or a crime crew?", answer: "Look at dwell time, tooling sophistication, target selection, exfiltration patterns, and infrastructure. APTs show long dwell, custom tooling, strategic targets (R&D, M&A docs), and operational security on infra. Crime crews monetise quickly — ransomware deployment, data leak threats, predictable affiliate TTPs." },
    { level: "Senior", q: "Walk me through how a threat-actor profile changes your control prioritisation.", answer: "Start from likely actors against the business model — a bank's top three are usually cybercrime (ransomware), insiders, and APTs targeting wires. For each, identify their preferred initial vector and pivot patterns, then layer controls per kill-chain phase. Spend is concentrated on the early phases of the actors most likely AND impactful — MFA, EDR, email security, JML for insiders, intel-led hunting for APTs." },
    { level: "Manager", q: "Board asks why you spend on threat intelligence when an EDR vendor already 'covers everything'.", answer: "EDR is a detection capability tuned for known patterns; threat intel is the input that tells us which patterns matter to us this quarter and what novel TTPs to hunt for. Without intel we react to vendor signatures designed for the global average — with it we focus our analysts on the actors actually likely to come for us." },
  ],
};

/* ──────────────────────────────────────────────────────────────────────── */

const HOUR4: HourSpec = {
  hour: 4,
  slug: "cia-dad-controls",
  title: "CIA / DAD & Security Controls",
  subtitle: "Confidentiality · Integrity · Availability · Controls taxonomy",
  icon: Network,
  status: "available",
  cehObjectives: [
    "Apply the CIA triad and its inverse DAD to incident analysis",
    "Differentiate Preventive / Detective / Corrective / Compensating / Deterrent controls",
    "Differentiate Administrative / Technical / Physical control families",
    "Pick the right control combination for a stated risk",
  ],
  estMinutes: 60,
  mission: {
    codename: "OP. TRIAD",
    brief: "Three recent incidents at Glasshouse each broke one leg of the CIA triad. Your job: diagnose which property failed, classify the controls that should have been there, and design a layered defence the auditor can map line-by-line to NIST.",
    success: [
      "Tag 8 events by which CIA property they violated (using DAD)",
      "Sort 8 controls into Preventive / Detective / Corrective / Compensating / Deterrent",
      "Layer three controls across Admin / Technical / Physical for one scenario",
    ],
  },
  story: {
    title: "Three letters that explain every incident",
    body: [
      "Quarter close. Three incidents arrive on the CISO's desk in a single week. Monday: a customer statements bucket is found indexed by Google — anyone could read PDFs containing PAN-truncated account numbers. Wednesday: a ledger reconciliation flags that 27 wire amounts were silently changed by one penny each over three months. Friday: the online banking portal is down for four hours after a botnet hits the WAF.",
      "Same week. Same word in the headlines — 'cyber incident'. Yet each broke a completely different security property: confidentiality, integrity, availability. The defensive playbook for each is also completely different — encryption and access control vs. hashing and tamper-evident logging vs. capacity, anti-DDoS and resilient architecture.",
      "CIA is the simplest, most useful triangle in security. Its dark mirror — Disclosure, Alteration, Destruction (DAD) — is how attackers think. Spend this hour mastering both, plus the control taxonomy that maps every defence to a slot, and you'll never lose an architecture argument again.",
    ],
  },
  trainer: {
    sections: [
      { title: "Confidentiality", body: "Only those authorised can read the data. Broken by: data leakage, unencrypted transit, weak access control, insider exfiltration. Controlled by: encryption (rest + transit), classification + handling, MFA + least privilege, DLP, key management." },
      { title: "Integrity", body: "Data and systems are accurate and unaltered except by authorised processes. Broken by: tampering, MITM injection, malware modifying code, unauthorised privilege changes. Controlled by: hashing, digital signatures, code-signing, file-integrity monitoring, change management, separation of duties." },
      { title: "Availability", body: "Authorised users can reach the resource when they need it. Broken by: DDoS, ransomware, hardware failure, misconfiguration, natural disaster. Controlled by: capacity planning, redundancy, backups (tested!), DDoS mitigation, BCP / DR, geo-distribution." },
      { title: "DAD — the attacker's mirror", body: "Disclosure attacks Confidentiality. Alteration attacks Integrity. Destruction attacks Availability. Every offensive technique on the CEH syllabus can be slotted into one of these three buckets. When a SOC analyst reads an alert, asking 'which leg of CIA is this hitting?' instantly narrows triage." },
      { title: "Control types · by function", body: "PREVENTIVE — stop the event (firewalls, MFA, encryption, hardened images). DETECTIVE — surface that it happened (SIEM, IDS, FIM, audit logs). CORRECTIVE — restore after (backups, patching, incident-response runbooks). COMPENSATING — substitute when the primary control is impractical (e.g. extra monitoring because you can't patch a legacy box). DETERRENT — discourage the actor (warning banners, visible cameras, prosecution policies)." },
      { title: "Control families · by domain", body: "ADMINISTRATIVE — policies, procedures, training, background checks, separation of duties. TECHNICAL (logical) — hardware/software: MFA, encryption, firewalls, EDR. PHYSICAL — locks, badges, mantraps, cameras, environmental (HVAC, fire suppression). Every mature defence layers all three families — never just technical." },
      { title: "Defence in Depth", body: "Layer controls so failure of any single control doesn't cause failure of the whole system. Concentric defences (perimeter → network → host → app → data), supported by Admin / Technical / Physical and Preventive / Detective / Corrective. Auditors map your architecture to this matrix — and so should you." },
    ],
  },
  knowledgeMap: {
    nodes: [
      { id: "c", label: "Confidentiality", group: "core", def: "Only authorised can read" },
      { id: "i", label: "Integrity", group: "core", def: "Data not altered without authority" },
      { id: "a", label: "Availability", group: "core", def: "Authorised users can access when needed" },
      { id: "d1", label: "Disclosure", group: "illegal", def: "Attacks Confidentiality" },
      { id: "d2", label: "Alteration", group: "illegal", def: "Attacks Integrity" },
      { id: "d3", label: "Destruction", group: "illegal", def: "Attacks Availability" },
      { id: "pv", label: "Preventive", group: "ctrl", def: "Stop the event before it happens" },
      { id: "dt", label: "Detective", group: "ctrl", def: "Surface that it happened" },
      { id: "cr", label: "Corrective", group: "ctrl", def: "Restore after the event" },
      { id: "cp", label: "Compensating", group: "ctrl", def: "Substitute when primary is impractical" },
      { id: "dr", label: "Deterrent", group: "ctrl", def: "Discourage the actor" },
    ],
    edges: [
      ["d1", "c", "attacks"],
      ["d2", "i", "attacks"],
      ["d3", "a", "attacks"],
      ["pv", "c", "protects"],
      ["pv", "i", "protects"],
      ["pv", "a", "protects"],
      ["dt", "d1", "surfaces"],
      ["dt", "d2", "surfaces"],
      ["dt", "d3", "surfaces"],
      ["cr", "a", "restores"],
      ["cp", "pv", "substitutes-for"],
    ],
  },
  labs: [
    {
      id: "d1h4-l10-cia",
      number: 10,
      title: "Lab 10 · CIA / DAD Diagnoser",
      kind: "classify",
      brief: "Tag each event by which CIA property was violated (or DAD action observed).",
      data: {
        buckets: [
          { id: "c", label: "Confidentiality / Disclosure", hint: "Data exposed to the unauthorised" },
          { id: "i", label: "Integrity / Alteration", hint: "Data or system silently changed" },
          { id: "a", label: "Availability / Destruction", hint: "Resource unreachable or destroyed" },
        ],
        items: [
          { id: "a", label: "Customer statements PDF bucket indexed by Google", correct: "c" },
          { id: "b", label: "27 wire transfer amounts silently changed by one penny over 3 months", correct: "i" },
          { id: "c", label: "DDoS knocks the online banking portal offline for 4 hours", correct: "a" },
          { id: "d", label: "Ransomware encrypts the loan-origination database; backups corrupted", correct: "a" },
          { id: "e", label: "Insider replaces beneficiary IBANs in nightly batch with attacker-controlled accounts", correct: "i" },
          { id: "f", label: "Source code repository leaked to Pastebin", correct: "c" },
          { id: "g", label: "Web shell modifies legitimate index.php to add hidden admin route", correct: "i" },
          { id: "h", label: "Stolen backup tape with cleartext PII recovered in a market raid", correct: "c" },
        ],
      },
    },
    {
      id: "d1h4-l11-controltype",
      number: 11,
      title: "Lab 11 · Control Type Classifier",
      kind: "classify",
      brief: "Sort each control by FUNCTION — Preventive / Detective / Corrective / Compensating / Deterrent.",
      data: {
        buckets: [
          { id: "pv", label: "Preventive", hint: "Blocks before the event" },
          { id: "dt", label: "Detective", hint: "Surfaces during/after" },
          { id: "cr", label: "Corrective", hint: "Restores after" },
          { id: "cp", label: "Compensating", hint: "Substitutes for an impractical primary control" },
          { id: "dr", label: "Deterrent", hint: "Discourages the actor" },
        ],
        items: [
          { id: "a", label: "MFA on the VPN", correct: "pv" },
          { id: "b", label: "SIEM rule alerting on impossible-travel sign-ins", correct: "dt" },
          { id: "c", label: "Nightly off-site backups + tested restore runbook", correct: "cr" },
          { id: "d", label: "Visible CCTV signage at the datacentre entrance", correct: "dr" },
          { id: "e", label: "24×7 SOC monitoring an unsupported legacy app that cannot be patched", correct: "cp" },
          { id: "f", label: "Warning banner: 'Authorised use only — activity is monitored'", correct: "dr" },
          { id: "g", label: "Disk encryption on all corporate laptops", correct: "pv" },
          { id: "h", label: "File-integrity monitoring (FIM) on /etc and web roots", correct: "dt" },
        ],
      },
    },
    {
      id: "d1h4-l12-layering",
      number: 12,
      title: "Lab 12 · Layered Defence Picker",
      kind: "decision",
      brief: "For each risk, pick the layered control set (Administrative + Technical + Physical) that an auditor will accept.",
      data: {
        scenarios: [
          {
            id: "s1",
            ask: "Risk: insider exfiltrates customer PII via USB from a branch workstation.",
            choice: "best",
            reasons: [
              { id: "a", text: "Issue a strongly-worded data-handling policy — staff will comply", correct: false },
              { id: "b", text: "ADMIN: data-handling policy + signed acceptable-use · TECHNICAL: USB port DLP block on managed images · PHYSICAL: locked workstation tower with intrusion sensor", correct: true },
              { id: "c", text: "Install a NGFW at the branch perimeter and call it done", correct: false },
            ],
          },
          {
            id: "s2",
            ask: "Risk: ransomware encrypts the primary fileserver; attackers also delete the backup volume.",
            choice: "best",
            reasons: [
              { id: "a", text: "Pay an insurer to cover the ransom; no architectural changes", correct: false },
              { id: "b", text: "ADMIN: incident-response runbook with tabletop drills · TECHNICAL: EDR + segmented backup network with immutable / air-gapped copies · PHYSICAL: locked backup appliance offsite", correct: true },
              { id: "c", text: "Tell users to be careful with email attachments", correct: false },
            ],
          },
          {
            id: "s3",
            ask: "Risk: silent integrity attack on the wire-payments queue.",
            choice: "best",
            reasons: [
              { id: "a", text: "Read all transactions out loud at end of day", correct: false },
              { id: "b", text: "ADMIN: separation of duties (initiator ≠ approver) + dual-control policy · TECHNICAL: signed message digests + tamper-evident WORM log + FIM · PHYSICAL: HSM in a locked rack with witnessed key ceremonies", correct: true },
              { id: "c", text: "Disable logging to reduce noise the SOC investigates", correct: false },
            ],
          },
        ],
      },
    },
  ],
  knowledgeCheck: [
    { q: "An attacker silently modifies records in a database. Which CIA property is primarily violated?", options: ["Confidentiality", "Integrity", "Availability", "Authorization"], answer: 1, explain: "Modification = Alteration in DAD terms = Integrity attack. Confidentiality is unaffected if the data is not read; availability is unaffected if the system still responds." },
    { q: "A SIEM rule that alerts on impossible-travel logins is a…", options: ["Preventive control", "Detective control", "Corrective control", "Deterrent control"], answer: 1, explain: "It does not block the login (so not preventive) — it surfaces the suspicious event for response. That is the textbook definition of detective." },
    { q: "Visible CCTV signage at a datacentre is BEST classified as…", options: ["Detective only", "Physical preventive", "Deterrent (with detective if cameras are real)", "Compensating"], answer: 2, explain: "Signage discourages would-be intruders (deterrent). The actual camera feed is detective. The control's category depends on intent + effect — CEH frequently tests this nuance." },
    { q: "Choosing 24×7 monitoring because a legacy app cannot be patched is a…", options: ["Detective control", "Corrective control", "Compensating control", "Preventive control"], answer: 2, explain: "Compensating controls substitute for a primary control (here, patching) when implementing it isn't feasible. Auditors require explicit documentation as a compensating control." },
    { q: "Which of these is an ADMINISTRATIVE control?", options: ["Disk encryption", "Background checks for staff handling cash", "A door lock", "An IDS"], answer: 1, explain: "Administrative controls are policies, procedures, training, and personnel controls like background checks. The others are technical (encryption, IDS) and physical (lock)." },
    { q: "DAD stands for…", options: ["Disclosure · Alteration · Destruction", "Deny · Allow · Detect", "Discover · Attack · Destroy", "Data · Authorisation · Defence"], answer: 0, explain: "DAD is the attacker's inverse of CIA: Disclosure breaks Confidentiality, Alteration breaks Integrity, Destruction breaks Availability." },
  ],
  challenge: {
    title: "Challenge · The Audit-Proof Triangle",
    brief: "Pick one CIA leg and one threat-actor class from Hour 3. Design ONE preventive + ONE detective + ONE corrective control across Admin / Technical / Physical. Aim for a defence the auditor cannot mark 'compensating only'.",
    victory: "If every cell of the {function × family} matrix has at least one control AND the CIA leg + actor are addressed, you've delivered audit-grade defence in depth.",
  },
  exam: {
    rating: 5,
    tested: [
      "CIA triad definitions and concrete examples per leg",
      "DAD as the inverse of CIA",
      "Five control functions: Preventive / Detective / Corrective / Compensating / Deterrent",
      "Three control families: Administrative / Technical / Physical",
      "Compensating vs. corrective control distinction",
    ],
    mnemonics: [
      "CIA inverts to DAD — Disclosure / Alteration / Destruction.",
      "PDCCD — Preventive, Detective, Corrective, Compensating, Deterrent (five control functions).",
      "ATP — Administrative · Technical · Physical (three families; layer all three).",
    ],
    traps: [
      "Calling a backup a 'preventive' control — it's CORRECTIVE (restores after).",
      "Calling a SIEM 'preventive' — it's DETECTIVE.",
      "Mixing up compensating (substitute) with corrective (restore).",
      "Forgetting that signage / banners are DETERRENT, not detective.",
    ],
    rapid: [
      "Encryption = preventive (confidentiality)",
      "FIM = detective (integrity)",
      "Backup = corrective (availability)",
      "Extra monitoring on unpatchable system = compensating",
      "Warning banner / 'prosecution will follow' = deterrent",
      "Policy / training / background check = administrative",
    ],
  },
  interview: [
    { level: "Junior", q: "Explain the CIA triad with one concrete example each.", answer: "Confidentiality: encrypt the customer database so only authorised services can read it. Integrity: digitally sign transaction logs so silent tampering is detectable. Availability: deploy the banking portal across two regions with auto-failover so a single outage doesn't take it down." },
    { level: "Mid", q: "Walk me through the difference between corrective and compensating controls with examples.", answer: "Corrective controls restore normal operations after an event — backups, IR runbooks, patching, rebuilding from gold images. Compensating controls substitute for a primary control you cannot implement — e.g. you can't patch a legacy SCADA box, so you network-segment it and add 24×7 monitoring as a compensating control. Auditors require explicit justification and risk acceptance for compensating choices." },
    { level: "Senior", q: "Design a defence-in-depth approach for a wire-transfer system protecting integrity.", answer: "Administrative: separation of duties (initiator ≠ approver), dual-control policy, mandatory training, signed risk acceptance for residuals. Technical: signed and hashed messages, tamper-evident WORM transaction log, FIM, change management workflow, HSM-backed key signing, anomaly detection on value/beneficiary drift. Physical: HSM in a locked rack, witnessed key ceremonies, restricted datacentre access. Detective + corrective: SIEM rules on log gaps and value anomalies; runbook for quarantining queue + reconciliation playbook." },
    { level: "Manager", q: "Board challenges you: 'we already have a firewall and EDR — why invest in detective and corrective controls?'", answer: "Preventive controls fail. Even the best EDR misses novel TTPs; firewalls don't stop authorised users abusing access. Detective controls give us time-to-detect, corrective controls give us time-to-recover — both directly reduce business impact when prevention fails. Industry benchmarks (Mandiant M-Trends, Verizon DBIR) show median dwell time and recovery costs drop sharply with mature detect + respond. The investment is in resilience, not paranoia." },
  ],
};

/* ──────────────────────────────────────────────────────────────────────── */

export const DAY1_HOURS: HourSpec[] = [
  HOUR1,
  HOUR2,
  HOUR3,
  HOUR4,
  { hour: 5, slug: "kill-chain-mitre", title: "Cyber Kill Chain & MITRE ATT&CK", subtitle: "Adversary lifecycle frameworks", icon: GitBranch, status: "upcoming", cehObjectives: [], estMinutes: 70, mission: { codename: "", brief: "", success: [] }, story: { title: "", body: [] }, trainer: { sections: [] }, knowledgeMap: { nodes: [], edges: [] }, labs: [], knowledgeCheck: [], exam: { rating: 5, tested: [], mnemonics: [], traps: [], rapid: [] }, interview: [] },
  { hour: 6, slug: "hacking-methodology", title: "Ethical Hacking Methodology", subtitle: "Recon → Reporting", icon: Workflow, status: "upcoming", cehObjectives: [], estMinutes: 60, mission: { codename: "", brief: "", success: [] }, story: { title: "", body: [] }, trainer: { sections: [] }, knowledgeMap: { nodes: [], edges: [] }, labs: [], knowledgeCheck: [], exam: { rating: 4, tested: [], mnemonics: [], traps: [], rapid: [] }, interview: [] },
  { hour: 7, slug: "footprinting-fundamentals", title: "Footprinting & Reconnaissance", subtitle: "Passive / Active / OSINT", icon: Search, status: "upcoming", cehObjectives: [], estMinutes: 60, mission: { codename: "", brief: "", success: [] }, story: { title: "", body: [] }, trainer: { sections: [] }, knowledgeMap: { nodes: [], edges: [] }, labs: [], knowledgeCheck: [], exam: { rating: 5, tested: [], mnemonics: [], traps: [], rapid: [] }, interview: [] },
  { hour: 8, slug: "recon-simulators", title: "Interactive Reconnaissance Labs", subtitle: "WHOIS / DNS / OSINT simulators", icon: Crosshair, status: "upcoming", cehObjectives: [], estMinutes: 80, mission: { codename: "", brief: "", success: [] }, story: { title: "", body: [] }, trainer: { sections: [] }, knowledgeMap: { nodes: [], edges: [] }, labs: [], knowledgeCheck: [], exam: { rating: 5, tested: [], mnemonics: [], traps: [], rapid: [] }, interview: [] },
];

export function getHour(slug: string) {
  return DAY1_HOURS.find((h) => h.slug === slug);
}
