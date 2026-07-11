// Module 13 — Hacking Web Servers (Day 6)
// Enterprise mission: Global Financial Services (GFS) — Digital Banking web tier.
// Concepts: (1) Web Server Reconnaissance & Fingerprinting, (2) Exploiting
// Misconfigurations with AI Assistance.

export const M13_SCENARIO = {
  client: "Global Financial Services — Digital Banking",
  assessment: "External Web Server Hardening Review",
  scope: "Authorised black-box assessment of 6 internet-facing web servers behind the retail banking CDN · no exploitation of live customer data · no DoS",
  available: [
    "6 public hostnames (portal, api, m, static, status, dev-preview)",
    "CDN egress IP allow-list from Network Ops",
    "Written scope + change-window from CISO office",
  ],
  outcome: "Web Server Posture Report — stack inventory, misconfiguration register, exploit-path narrative, and 30/60/90-day remediation plan",
  why: "The retail banking web tier terminates customer sessions and brokers API calls into core banking. A single leaking Server header or unauthenticated admin path here is the shortest route from the open internet to money.",
};

export const M13_WORKFLOW = [
  { tool: "Passive DNS & CT log recon", finding: "All customer-facing subdomains + forgotten dev/staging hosts", exposure: "dev-preview / uat surfaces exposed to internet with weaker controls", opportunity: "Attack the weakest twin of production", risk: "Same code, no WAF → direct compromise", recommendation: "Remove/authenticate non-prod; enforce single ingress" },
  { tool: "HTTP header & method audit", finding: "Server, X-Powered-By, X-AspNet-Version, allowed verbs", exposure: "Exact stack disclosed; TRACE/PUT/DELETE allowed", opportunity: "Version→CVE lookup; XST; arbitrary upload", risk: "RCE, session theft, defacement", recommendation: "Strip banners; restrict methods to GET/POST/HEAD; add HSTS/CSP/XFO/Referrer-Policy" },
  { tool: "robots.txt / sitemap / .well-known", finding: "Hidden admin paths, backup URLs, staging references", exposure: "/admin, /backup.zip, /server-status leaked", opportunity: "Auth bypass, source disclosure, PHP-info leak", risk: "Credential harvest, config exfil", recommendation: "Remove disclosures; authenticate all admin; block metadata endpoints at edge" },
  { tool: "TLS certificate inspection", finding: "SANs, issuer, expiry, weak ciphers", exposure: "Internal hostnames in SAN; TLS 1.0/1.1 still accepted", opportunity: "Internal-name enumeration; downgrade attacks", risk: "MITM on legacy clients; internal recon", recommendation: "Issue per-service certs; enforce TLS 1.2+; disable weak suites; enable OCSP stapling" },
  { tool: "Directory brute-force (wordlist)", finding: "Legacy /phpmyadmin, /jenkins, /actuator paths", exposure: "Dev tooling reachable on production hostnames", opportunity: "Default creds; unauthenticated actuator endpoints", risk: "Full application compromise", recommendation: "Remove dev tooling from prod; move to bastion; deny at WAF" },
  { tool: "AI-assisted config diff (Ansible/Nginx)", finding: "Drift between hardened baseline and live config", exposure: "Missing security headers, verbose error pages", opportunity: "Info disclosure that feeds later attack chains", risk: "Reduces attacker cost per stage", recommendation: "Continuous config drift alerting; block deploy on baseline violation" },
];

export const M13_ANALYST_FRAMEWORK = [
  {
    observation: "portal.gfs-bank.example returns `Server: Apache/2.4.29 (Ubuntu)` and `X-Powered-By: PHP/7.2.24`.",
    finding: "End-of-life Apache and PHP on the customer-facing portal.",
    exposure: "Every attacker now knows the exact stack + patch surface.",
    opportunity: "Pivot from banner → CVE feed → weaponised exploit in minutes.",
    risk: "Direct RCE on the host terminating customer sessions.",
    recommendation: "Upgrade to vendor-supported LTS branches; strip banners at reverse proxy; add virtual-patching WAF rules for known CVEs.",
  },
  {
    observation: "dev-preview.gfs-bank.example serves the same code as prod, no WAF, HTTP Basic with default creds.",
    finding: "A shadow twin of production with weaker controls is publicly reachable.",
    exposure: "Attackers ignore hardened prod and pop the twin.",
    opportunity: "Extract session logic, discover unauthenticated APIs, replay against prod.",
    risk: "Full parity compromise via the weakest ingress.",
    recommendation: "Remove dev/preview from public DNS; require VPN + SSO; if kept public, mirror the prod control set.",
  },
];

export const M13_GUIDED = [
  {
    topic: "HTTP fingerprinting (banners vs behaviour)",
    look: "Server / X-Powered-By / X-AspNet-Version headers, cookie names (PHPSESSID, JSESSIONID, ASP.NET_SessionId), error-page fingerprints.",
    expected: "Banners are usually truthful; admins rarely strip them. Behaviour (e.g. TRACE, OPTIONS) confirms the version class.",
    mistakes: "Trusting a stripped Server header as 'hardened' when behavioural fingerprints still leak the stack.",
    attackers: "Fingerprint first, then load the smallest CVE surface that matches — noisy scans get you caught.",
    defenders: "Suppress banners AND normalise error pages; alert on unusual OPTIONS/TRACE traffic.",
  },
  {
    topic: "Security header hygiene",
    look: "Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.",
    expected: "A regulated bank should ship all six on every response, with `default-src 'self'` CSP baseline and `max-age>=15552000; includeSubDomains; preload` HSTS.",
    mistakes: "Setting headers only on the login page. CSP with `unsafe-inline` everywhere.",
    attackers: "Missing XFO → clickjacking of transfer forms. Weak CSP → stored XSS delivers keyloggers.",
    defenders: "Enforce headers at the reverse proxy; block deploy on missing headers.",
  },
  {
    topic: "Robots, sitemaps and metadata endpoints",
    look: "/robots.txt Disallow lines, /sitemap.xml, /.well-known/*, /server-status, /server-info, /actuator, /trace, /phpinfo.",
    expected: "Public banks expose only /.well-known/security.txt and /.well-known/change-password. Everything else is either authenticated or blocked at edge.",
    mistakes: "Treating robots.txt as security control. Leaving Spring Boot actuator exposed without auth.",
    attackers: "robots.txt is a menu of hidden admin paths — first thing to read.",
    defenders: "Deny /actuator, /trace, /server-status, /server-info at edge; monitor for scans of these URIs.",
  },
  {
    topic: "TLS surface — beyond just 'green padlock'",
    look: "Certificate SANs, issuer chain, key length, cipher list, HSTS preload state, OCSP stapling, renegotiation flag.",
    expected: "TLS 1.2+ only, AEAD ciphers, 2048-bit RSA / P-256 ECDSA minimum, no legacy renegotiation.",
    mistakes: "Renewing certs annually without reviewing SANs — internal hostnames leak into public SANs.",
    attackers: "SANs are a free internal-hostname disclosure and a subdomain-takeover map.",
    defenders: "Per-service certs; monitor CT logs for unexpected issuances of *.gfs-bank.example.",
  },
];

export const M13_INCIDENTS = [
  { org: "Equifax (2017)", method: "Unpatched Apache Struts (CVE-2017-5638) on customer portal", recon: "Internet-wide banner scanning for Struts endpoints", impact: "147M records; ~$1.4B in costs", lesson: "Public web server + missing patch = catastrophic. Banner disclosure shortens attacker triage to minutes." },
  { org: "British Airways (2018)", method: "Magecart-style script injection via a vulnerable third-party JS on the payment page", recon: "Enumeration of externally-loaded scripts and CSP gaps", impact: "£20M ICO fine; 400k+ card records", lesson: "Missing/weak CSP on the checkout web tier turns any supply-chain script into a payment skimmer." },
  { org: "Capital One (2019)", method: "SSRF against a mis-configured WAF web tier → IMDS → S3", recon: "Enumeration of the WAF host and cloud metadata endpoints", impact: "100M+ records; $190M settlement", lesson: "Web server hardening now includes cloud metadata isolation — the perimeter is not just TCP/443." },
];

export const M13_DELIVERABLES = [
  { id: "scope", label: "Written scope + change-window logged" },
  { id: "inventory", label: "Full web-tier hostname & IP inventory (incl. shadow surfaces)" },
  { id: "headers", label: "Security header audit table" },
  { id: "methods", label: "HTTP method / TRACE / OPTIONS audit" },
  { id: "tls", label: "TLS surface report (SANs, ciphers, HSTS state)" },
  { id: "metadata", label: "robots.txt / actuator / server-status disclosure register" },
  { id: "misconfig", label: "Misconfiguration register with severity + owner" },
  { id: "chain", label: "Exploit-path narrative (recon → foothold → impact)" },
  { id: "plan", label: "30/60/90-day remediation plan with SLAs" },
  { id: "exec", label: "Executive summary (1 page, business-language)" },
];

export const M13_AI_ACTIONS = [
  { id: "analyze", label: "Analyze Findings", output: "Of 6 GFS web hosts, 4 disclose full stack via Server/X-Powered-By, 3 accept TRACE, and 1 (dev-preview) mirrors production code with HTTP Basic + default creds. Two hosts run EOL Apache/PHP. Severity-weighted exposure score: 8.2 / 10 — above tolerance for a regulated bank." },
  { id: "correlate", label: "Correlate Evidence", output: "The TLS certificate on portal.gfs-bank.example lists internal hostnames `corp-nginx01` and `corp-nginx02` in SAN — the same cert is deployed to m., api., and status., meaning one private-key compromise pivots to the entire customer-facing fleet." },
  { id: "assess", label: "Generate Assessment", output: "Web server posture: BELOW REGULATORY EXPECTATION. Drivers: (1) EOL runtimes on customer portal, (2) shadow dev surface with weak auth, (3) leaking internal hostnames via shared TLS cert. Quick wins (banner strip, header baseline) close 40% of exposure inside a sprint." },
  { id: "recommend", label: "Generate Recommendations", output: "Priority 1 (≤7d): Remove dev-preview from public DNS; strip Server/X-Powered-By at reverse proxy; disable TRACE. Priority 2 (≤30d): Upgrade Apache+PHP to LTS; enforce security-header baseline at edge; per-service TLS certs. Priority 3 (≤90d): Continuous config-drift alerting; CT-log monitoring for *.gfs-bank.example; quarterly external re-scan." },
  { id: "exec", label: "Executive Summary", output: "GFS's public banking web tier discloses more about itself than industry peers and hosts a shadow copy of production code that is easier to attack than production itself. An attacker performing only the checks we did could identify a viable RCE path within one working day. Three actions — strip banners, retire the dev twin, and rotate the shared TLS cert — remove the highest-likelihood entry points inside 30 days at minimal cost." },
];

export const M13_SLUG = "hacking-web-servers";
