// Module 02 — Footprinting & Reconnaissance
// Enhancement data: scenario, workflow, analyst-thinking, guided investigation,
// real incidents, deliverables, lab augmentation. Module-02-only.

export const M02_SCENARIO = {
  client: "Acme Financial Services",
  assessment: "External Reconnaissance Review",
  scope: "Public-facing assets only · no authenticated tests · no DoS",
  available: [
    "Primary domain: acmefin.example",
    "Two known subsidiaries (M&A 2023)",
    "Permission letter signed by CISO",
  ],
  outcome: "Reconnaissance Assessment Report with exposure register and executive summary",
  why: "Attackers footprint your perimeter every day at zero cost. The first asset you can't see is the first one you can't defend. This engagement establishes the ground truth of what the internet actually knows about Acme — before any noisy scanning begins.",
};

export const M02_WORKFLOW = [
  { tool: "WHOIS / RDAP", finding: "Registrant org & contacts", exposure: "Privacy not enforced", opportunity: "Targeted phishing of named admins", risk: "Initial-access foothold", recommendation: "Enable registrar privacy + DMARC quarantine" },
  { tool: "crt.sh (CT logs)", finding: "Forgotten dev-* / staging-* hosts", exposure: "Shadow IT outside inventory", opportunity: "Default creds, stale auth", risk: "Lateral pivot, data exposure", recommendation: "Reconcile CT against CMDB; decommission" },
  { tool: "DNS (MX/TXT/SPF/DMARC)", finding: "SPF ~all, no DMARC", exposure: "Spoofable mail domain", opportunity: "BEC / invoice fraud", risk: "Financial loss, reputational damage", recommendation: "DMARC p=reject + DKIM rotation" },
  { tool: "Wayback / archive.org", finding: "Removed admin paths, old stacks", exposure: "Historical tech disclosure", opportunity: "Known-CVE targeting", risk: "RCE on legacy endpoints", recommendation: "Validate decommission, block archived paths" },
  { tool: "Shodan / Censys", finding: "Exposed RDP / Elastic / Mongo", exposure: "Internet-facing admin plane", opportunity: "Credential spraying, NoSQL pillage", risk: "Domain compromise, breach", recommendation: "Bastion + allow-list + MFA" },
];

export const M02_ANALYST_FRAMEWORK = [
  {
    observation: "crt.sh returns 47 *.acmefin.example subdomains; CMDB lists 22.",
    finding: "25 unknown subdomains, including jenkins-old.acmefin.example",
    exposure: "Unmanaged CI host, likely unpatched",
    opportunity: "Pre-auth Jenkins RCE (CVE-2024-23897 class)",
    risk: "Source-code theft, build-pipeline poisoning",
    recommendation: "Immediate takedown + retrospective access review",
  },
  {
    observation: "TXT record shows v=spf1 include:_spf.google.com ~all; no DMARC.",
    finding: "Mail domain spoofable with soft-fail only",
    exposure: "Brand impersonation surface",
    opportunity: "Wire-transfer BEC against finance staff",
    risk: "Direct financial loss; FCA/regulator notification",
    recommendation: "Publish DMARC p=quarantine → p=reject within 60 days",
  },
];

export const M02_GUIDED = [
  {
    topic: "Certificate Transparency (crt.sh)",
    look: "Unusual subdomains (dev-*, internal-*, *-staging), wildcard certs, surprise sibling domains (M&A footprint).",
    expected: "10–50× more hostnames than CMDB; at least one forgotten host per business unit.",
    mistakes: "Treating CT as noise. Skipping wildcard analysis. Not deduping against CNAME chains.",
    attackers: "Build a target list of shadow assets, then mass-fingerprint for known CVEs.",
    defenders: "Run CT diff weekly against CMDB; alert on new issuance for owned roots.",
  },
  {
    topic: "WHOIS / RDAP",
    look: "Non-privacy contacts, registrar, creation/expiry dates, name servers, status flags.",
    expected: "Either privacy-proxied (good) or named admins with corporate emails (recon gold).",
    mistakes: "Trusting WHOIS as authoritative for ownership. Ignoring expiry (lapse = takeover).",
    attackers: "Harvest named contacts for spear-phishing; watch for domain expiry to hijack.",
    defenders: "Enforce registrar privacy, registry-lock, and auto-renew with multi-year terms.",
  },
  {
    topic: "DNS posture (MX/TXT/SPF/DKIM/DMARC)",
    look: "SPF strictness (~all vs -all), DMARC policy, DKIM selectors, SOA serial freshness.",
    expected: "Most orgs sit at SPF ~all + no DMARC — the BEC sweet spot.",
    mistakes: "Calling zone transfer (AXFR) passive — it's active. Missing _dmarc TXT lookup.",
    attackers: "Spoof the domain for invoice fraud; map mail providers for credential phishing.",
    defenders: "DMARC p=reject, rua reports to a monitored mailbox, rotate DKIM annually.",
  },
  {
    topic: "Wayback Machine (CDX API)",
    look: "Removed admin paths, old framework versions, leaked internal hostnames in HTML.",
    expected: "At least one /admin, /phpmyadmin, /jmx-console, or removed staging link.",
    mistakes: "Only checking the latest snapshot. Missing the CDX bulk endpoint.",
    attackers: "Resurrect dead paths against current infrastructure; harvest old API keys.",
    defenders: "Use robots noarchive sparingly; audit historical leaks; rotate any cited secrets.",
  },
];

export const M02_INCIDENTS = [
  {
    org: "Uber (2022)",
    method: "MFA-fatigue + leaked contractor creds",
    recon: "LinkedIn enumeration of IT staff + exposed PowerShell scripts on an SMB share discovered via prior recon",
    impact: "Full HackerOne, GSuite, Slack, vSphere access; internal data leaked",
    lesson: "External recon (people + exposed file shares) is the seed that lets social engineering land.",
  },
  {
    org: "SolarWinds (2020)",
    method: "Supply-chain implant in Orion update",
    recon: "Months of footprinting the build pipeline and code-signing infrastructure",
    impact: "~18,000 customers compromised including US federal agencies",
    lesson: "Footprinting at attacker dwell-time scale (months) is invisible to defenders without CT/DNS monitoring.",
  },
  {
    org: "MGM Resorts (2023)",
    method: "Vishing the helpdesk after LinkedIn-sourced impersonation",
    recon: "LinkedIn org chart + employee name format from public sources",
    impact: "$100M+ loss, 10-day operational outage",
    lesson: "People-layer footprinting (org chart + email format) is as dangerous as infrastructure recon.",
  },
];

export const M02_DELIVERABLES = [
  { id: "scope", label: "Scope validation & permission letter logged" },
  { id: "domain-inventory", label: "Domain & subdomain inventory (CT + DNS)" },
  { id: "dns", label: "DNS assessment (MX / SPF / DKIM / DMARC / SOA)" },
  { id: "email", label: "Email posture & spoofability assessment" },
  { id: "infra", label: "Infrastructure exposure (Shodan/Censys, ASN map)" },
  { id: "wayback", label: "Historical exposure review (Wayback CDX)" },
  { id: "people", label: "People-layer footprint (LinkedIn, GitHub, leaks)" },
  { id: "exposure", label: "Consolidated exposure register" },
  { id: "exec", label: "Executive summary (1 page, business-language)" },
];

export const M02_AI_ACTIONS = [
  {
    id: "analyze",
    label: "Analyze Findings",
    output: "Across 47 CT-discovered hosts, 25 fall outside the CMDB. 6 carry production-grade TLS but resolve to retired IP ranges — classic decommission-without-DNS-cleanup. Two (jenkins-old, gitlab-legacy) match known pre-auth RCE classes. Severity-weighted exposure score: 7.4 / 10.",
  },
  {
    id: "correlate",
    label: "Correlate Evidence",
    output: "WHOIS named-admin (j.doe@acmefin.example) ↔ LinkedIn (J. Doe, IT Director) ↔ GitHub commit history exposing internal hostname `vpn-int.acmefin.local`. Combined, this enables targeted spear-phishing of a privileged user against a now-confirmed internal endpoint name.",
  },
  {
    id: "assess",
    label: "Generate Assessment",
    output: "External attack surface posture: BELOW INDUSTRY MEAN. Drivers: (1) SPF soft-fail with no DMARC, (2) shadow CI infrastructure indexed in CT, (3) named admin contacts in WHOIS. Quick wins exist (DMARC, registrar privacy); strategic work needed on CMDB-CT reconciliation.",
  },
  {
    id: "recommend",
    label: "Generate Recommendations",
    output: "Priority 1 (≤7d): Decommission jenkins-old & gitlab-legacy; publish DMARC p=quarantine. Priority 2 (≤30d): Registrar privacy + registry-lock; weekly CT-diff alerting. Priority 3 (≤90d): CMDB integration with CT feed; quarterly external-recon retest.",
  },
  {
    id: "exec",
    label: "Executive Summary",
    output: "Acme's externally-visible footprint is materially larger than its internal asset inventory. Two forgotten development systems are directly exploitable; the corporate mail domain is spoofable, enabling invoice fraud against finance. Three controls — DMARC enforcement, decommission of two legacy hosts, and registrar privacy — eliminate the highest-likelihood attack paths within 30 days at negligible cost.",
  },
];

export const M02_SLUG = "footprinting-and-reconnaissance";
export const M02_HOUR_SLUGS = ["footprinting-fundamentals", "recon-simulators"];
