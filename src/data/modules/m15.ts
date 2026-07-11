// Module 15 — SQL Injection (Day 6)
// Enterprise mission: GFS Loans Origination — SQLi assessment of the loan-application
// intake and internal loan-officer search tools.
// Concepts: (1) Classical & Blind SQLi, (2) AI-Assisted Payload Crafting and Detection.

export const M15_SCENARIO = {
  client: "Global Financial Services — Loans Origination Platform",
  assessment: "SQL Injection Assessment — customer intake + internal search",
  scope: "Grey-box test of loan-apply.gfs-bank.example and internal loan-officer console · read-only proofs only · no bulk exfil · no DROP/DELETE/UPDATE",
  available: [
    "Public intake form (address, income, employer)",
    "Internal officer console (search by SSN last-4, name, application ID)",
    "Redacted schema summary from data platform team",
  ],
  outcome: "SQLi Assessment Report with reproducible payloads, blast-radius per finding, and code-level remediation for each affected query",
  why: "Loans systems concatenate customer identity, income, employer, and credit-bureau responses. A single unparameterised query here can leak the entire pipeline that regulators care most about.",
};

export const M15_WORKFLOW = [
  { tool: "Injection surface mapping", finding: "Every input reflected in a DB query (forms, headers, cookies, JSON fields, sort/order params)", exposure: "Sort/order-by params rarely parameterised", opportunity: "Error-based or UNION SQLi via ORDER BY", risk: "Data exfil, auth bypass, RCE via UDF", recommendation: "Whitelist allowed sort columns; never concatenate identifiers" },
  { tool: "Error-based detection", finding: "Verbose DB errors in responses (ORA-, MySQL, PG, MSSQL fingerprints)", exposure: "Confirms injection + DB engine + often schema fragments", opportunity: "Rapid enumeration of tables & columns", risk: "Full schema disclosure", recommendation: "Server-side custom error pages; log detail, return generic to user" },
  { tool: "UNION-based extraction", finding: "Column-count discovery, data-type alignment", exposure: "Direct data pull with a single request", opportunity: "Exfil PII/PANs at page load speed", risk: "Mass data breach", recommendation: "Parameterised queries; least-privilege DB user; column-level encryption for sensitive fields" },
  { tool: "Boolean / time-based blind", finding: "No output, but response differs on true/false or delays on SLEEP()", exposure: "Injection viable even with silent errors", opportunity: "Bit-by-bit exfil of hashes/tokens", risk: "Password/hash exfil over minutes-hours", recommendation: "Same fix — parameterise. Monitor query duration outliers." },
  { tool: "AI-assisted payload crafting", finding: "WAF-aware payloads adapted to DB flavour and quoting", exposure: "Naive WAFs bypassed with comment/whitespace tricks", opportunity: "Bypass legacy signature-based WAFs", risk: "WAF becomes false comfort", recommendation: "Use positive-security WAF profiles; parameterise regardless of WAF" },
  { tool: "Second-order / stored SQLi hunt", finding: "Inputs stored now, used unsafely later (audit log renderer, report builder)", exposure: "Reflected-safe form still leads to injection in nightly report", opportunity: "Delayed compromise via trusted internal tool", risk: "Compromise of internal ops user, higher privileges", recommendation: "Parameterise EVERY query, including internal/reporting; never trust source" },
];

export const M15_ANALYST_FRAMEWORK = [
  {
    observation: "Officer console `/search?q=Smith&sort=income` returns 500 on `sort=income);--`.",
    finding: "Non-parameterised ORDER BY on the officer search endpoint.",
    exposure: "Authenticated internal SQLi against the loan applications table.",
    opportunity: "UNION-based extraction of full applicant records including SSN, income, employer.",
    risk: "Wholesale PII breach via a trusted internal tool; officer accounts become high-value targets.",
    recommendation: "Whitelist allowed sort columns server-side; never concatenate identifiers into SQL; parameterise all WHERE clauses on this endpoint.",
  },
  {
    observation: "Public intake `POST /apply` employer field: `Acme' OR SLEEP(3)-- ` causes 3.1s response.",
    finding: "Time-based blind SQLi in an unauthenticated form.",
    exposure: "Unauthenticated data exfil path from the open internet.",
    opportunity: "Slow but total extraction of applications, credit-bureau responses, and internal officer notes.",
    risk: "Highest-severity breach class for a loans platform.",
    recommendation: "Immediate hotfix to parameterise the intake insert; add WAF virtual-patch for SLEEP/BENCHMARK; alert on any query >500ms from this endpoint.",
  },
];

export const M15_GUIDED = [
  {
    topic: "Classical vs blind SQLi",
    look: "Verbose errors, boolean-differential responses, controlled delay via SLEEP/BENCHMARK/pg_sleep/WAITFOR.",
    expected: "Modern apps rarely show verbose errors — expect boolean or time-based blind on the interesting endpoints.",
    mistakes: "Giving up when the error page is generic. Not testing JSON fields, headers, or sort/order params.",
    attackers: "Time-based is slow but silent — favoured for extractions that must not trigger DLP.",
    defenders: "Alert on query-duration outliers by endpoint; log parameterised vs concatenated query origins.",
  },
  {
    topic: "ORDER BY, LIMIT, and identifier injection",
    look: "Any endpoint with sort/order/direction/columns query params. These often can't be parameterised as values.",
    expected: "Server-side whitelist of allowed sort keys mapped to fixed SQL fragments — never string interpolation.",
    mistakes: "Assuming parameterised queries covers identifiers. Trusting client `columns=` arrays.",
    attackers: "Sort-param SQLi is disproportionately common because devs think 'the ORM handles it'.",
    defenders: "Ban raw SQL fragments in code review; add lint rule for string concatenation into query builders.",
  },
  {
    topic: "Second-order SQLi",
    look: "User input stored now, rendered/reused unsafely in reports, exports, audit logs, or admin dashboards.",
    expected: "Every SQL usage of a stored value must be parameterised even if the write path was safe.",
    mistakes: "Sanitising on input only. Assuming internal tools have 'trusted' data.",
    attackers: "Plant benign-looking payload today, wait for the nightly report to fire it inside the DBA-adjacent tool.",
    defenders: "Parameterise everywhere; canary-string honeytokens in fields that should never appear in reports.",
  },
  {
    topic: "AI-assisted payload crafting & detection",
    look: "AI helps enumerate WAF-bypass encodings and probe DB-flavour quirks; also helps defenders classify anomalous query shapes.",
    expected: "AI accelerates BOTH sides — WAFs and code review need to move to positive-security models.",
    mistakes: "Treating a WAF as the remediation. Ignoring AI-generated payload classes in test suites.",
    attackers: "Use AI to iterate payloads against the live WAF until one passes, then automate.",
    defenders: "Use AI to cluster query fingerprints, flag never-before-seen shapes per endpoint, and generate parameterised patches.",
  },
];

export const M15_INCIDENTS = [
  { org: "Heartland Payment Systems (2008)", method: "SQLi on the payment-processing web layer", recon: "Enumeration of the corporate site's login form", impact: "134M card records; $145M in costs", lesson: "One unparameterised query cost more than a decade of the security programme's budget." },
  { org: "TalkTalk (2015)", method: "SQLi via a legacy web page never decommissioned", recon: "Automated scan of forgotten subdomains", impact: "£77M loss; £400k ICO fine", lesson: "Legacy web assets that touch the same DB are the same risk as production — retire or harden them." },
  { org: "7-Eleven / Heartland-era wave (2007-2012)", method: "Multi-target SQLi campaign by Albert Gonzalez et al.", recon: "Wide scanning for common injection points on retail commerce sites", impact: "Hundreds of millions of records across victims", lesson: "SQLi is not historical — it remains one of the most exploited web vulnerabilities in real breach data." },
];

export const M15_DELIVERABLES = [
  { id: "scope", label: "Scope + read-only proof constraint acknowledged" },
  { id: "surface", label: "Injection-surface inventory (endpoint × parameter)" },
  { id: "confirm", label: "Confirmed injectable endpoints with minimal PoC" },
  { id: "blast", label: "Blast-radius analysis per finding (tables reachable, DB user privileges)" },
  { id: "second", label: "Second-order / stored SQLi findings" },
  { id: "waf", label: "WAF bypass evidence + recommended positive-security rules" },
  { id: "code", label: "Code-level remediation snippet per finding" },
  { id: "monitor", label: "Detection recommendations (query-duration outliers, DLP)" },
  { id: "plan", label: "Remediation plan with SLAs by severity" },
  { id: "exec", label: "Executive summary framing regulatory impact" },
];

export const M15_AI_ACTIONS = [
  { id: "analyze", label: "Analyze Findings", output: "3 confirmed SQLi: (1) time-based blind on unauth intake /apply.employer, (2) UNION-viable on internal officer /search sort param, (3) second-order in the nightly report renderer. DB user for /apply has SELECT/INSERT on 47 tables — least-privilege violated. Severity-weighted exposure: 9.1 / 10." },
  { id: "correlate", label: "Correlate Evidence", output: "The intake DB user shares a role with the credit-bureau response cache table — a successful UNION off the intake endpoint reaches bureau responses (FICO, employment verification) that the intake path has no business reading. Blast radius is the entire loans data domain, not just applications." },
  { id: "assess", label: "Generate Assessment", output: "SQLi posture: CRITICAL. One unauthenticated internet-facing injection with cross-table blast radius meets the bank's own definition of a reportable incident under FCA rules if exploited. Detection would only fire on query-duration outliers, which are not currently monitored per-endpoint." },
  { id: "recommend", label: "Generate Recommendations", output: "Priority 0 (≤24h): Hotfix intake /apply — parameterise; WAF virtual-patch SLEEP/BENCHMARK; alert on any /apply query >500ms. Priority 1 (≤7d): Fix officer /search sort whitelist; parameterise report renderer. Priority 2 (≤30d): Split DB roles per app; column-level encryption for SSN/income; positive-security WAF; CI lint against raw SQL concatenation." },
  { id: "exec", label: "Executive Summary", output: "GFS Loans currently exposes a single unauthenticated injection point that would allow an attacker to read the entire loans data domain, including credit-bureau responses, from the open internet. The immediate fix is one code change and one WAF rule — deployable inside a day. The wider issue is that database privileges do not follow the principle of least privilege, which is a one-sprint architectural fix." },
];

export const M15_SLUG = "sql-injection";
