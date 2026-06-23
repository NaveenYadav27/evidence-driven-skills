// Module 03 — Scanning Networks
// Enhancement data: scenario, workflow, analyst-thinking, guided investigation,
// real incidents, deliverables, AI actions. Module-03-only.

export const M03_SCENARIO = {
  client: "Northwind Manufacturing",
  assessment: "External Network Scanning & Service Discovery",
  scope: "Authorised external scan of /24 perimeter range · TCP & UDP top-1000 · no exploitation · no DoS",
  available: [
    "Public IP range: 198.51.100.0/24 (sample)",
    "Two known web hosts and a VPN gateway",
    "Permission letter signed by Head of IT",
  ],
  outcome: "Network Scanning Report with host inventory, service matrix, fingerprint deltas, and remediation plan",
  why: "Recon told you what *might* be there. Scanning proves what *is* there, what version it runs, and how it responds under controlled probing. Get this phase wrong and every later finding inherits your false positives.",
};

export const M03_WORKFLOW = [
  { tool: "Host Discovery (ICMP/TCP-ping)", finding: "Live hosts in /24 range", exposure: "Unmanaged hosts answering on perimeter", opportunity: "Map shadow IT outside CMDB", risk: "Unmonitored attack surface", recommendation: "Reconcile against asset inventory; block ICMP from untrusted nets if not needed" },
  { tool: "TCP SYN scan (top-1000)", finding: "Open service ports per host", exposure: "Internet-facing admin services (22/3389/5985)", opportunity: "Credential spraying, brute force", risk: "Initial access, lateral movement", recommendation: "Move admin behind bastion; enforce MFA + allow-list" },
  { tool: "Service / version detection (-sV)", finding: "Banner & version per service", exposure: "EOL or unpatched daemons (e.g. OpenSSH 7.2, Apache 2.2)", opportunity: "Known-CVE chain (RCE / auth bypass)", risk: "Direct compromise of perimeter host", recommendation: "Patch to vendor-supported; suppress banners; subscribe to CVE feeds" },
  { tool: "OS fingerprinting (-O)", finding: "OS family & kernel guess", exposure: "Legacy Windows / EOL Linux on perimeter", opportunity: "Target OS-specific exploits (SMBv1, EternalBlue class)", risk: "Worming, ransomware ingress", recommendation: "Upgrade or isolate EOL OS; disable SMBv1; segment legacy zone" },
  { tool: "HTTP header & method audit", finding: "Server stack & allowed verbs", exposure: "PUT/DELETE enabled, Server header leaks version", opportunity: "Arbitrary file upload, info disclosure", risk: "Webshell, defacement", recommendation: "Restrict methods to GET/POST/HEAD; strip Server/X-Powered-By; add security headers" },
  { tool: "IP / ASN / reverse-DNS intel", finding: "Hosting provider, geo, PTR pattern", exposure: "Mixed-tenant cloud IPs reused after release", opportunity: "Subdomain takeover, dangling DNS", risk: "Phishing on owned brand", recommendation: "Audit DNS for dangling A/CNAME; reclaim or remove" },
];

export const M03_ANALYST_FRAMEWORK = [
  {
    observation: "TCP/22 open on 6 hosts; -sV reports OpenSSH 7.2p2 on three of them.",
    finding: "Three perimeter hosts run an OpenSSH version with multiple CVEs (auth bypass, user enum).",
    exposure: "Username enumeration + brute-forceable SSH on the public internet.",
    opportunity: "Credential spraying with harvested usernames → foothold on perimeter Linux.",
    risk: "Initial access leading to lateral movement into the internal network.",
    recommendation: "Patch to a vendor-supported OpenSSH; restrict SSH to bastion + key-only + MFA; alert on auth failures.",
  },
  {
    observation: "Two web hosts return Server: Apache/2.2.15 and allow TRACE.",
    finding: "End-of-life Apache with cross-site tracing enabled.",
    exposure: "Disclosure of stack version + XST primitive for session theft.",
    opportunity: "Chain TRACE with an XSS to exfiltrate HttpOnly cookies.",
    risk: "Account takeover of authenticated users.",
    recommendation: "Upgrade Apache to a supported branch; disable TRACE; strip Server header; add HSTS/CSP.",
  },
];

export const M03_GUIDED = [
  {
    topic: "Host discovery (alive vs filtered)",
    look: "ICMP echo reply, TCP SYN/ACK on 80/443, ARP responses on local segments.",
    expected: "5–20% of a /24 typically alive on the perimeter; far more on internal ranges.",
    mistakes: "Treating ICMP-filtered as 'down'. Skipping TCP-ping (-PS) when ICMP is blocked.",
    attackers: "Build a live-host list before any service probing — every wasted probe is detection risk.",
    defenders: "Rate-limit and log ICMP/TCP probe storms; alert on sequential /24 sweeps.",
  },
  {
    topic: "TCP scan types (SYN / Connect / FIN / NULL / XMAS)",
    look: "Half-open SYN (-sS) is fastest & stealthier; Connect (-sT) when no root; FIN/NULL/XMAS for IDS evasion on stateless firewalls.",
    expected: "Modern stateful firewalls drop FIN/NULL/XMAS — they are diagnostic, not silver bullets.",
    mistakes: "Believing FIN scan bypasses every firewall. Forgetting that -sT logs a full TCP handshake on the target.",
    attackers: "Pick the quietest scan that still returns truth in the target's network posture.",
    defenders: "Detect SYN floods, half-open backlogs, and unusual flag combinations at the perimeter.",
  },
  {
    topic: "UDP scanning (-sU)",
    look: "ICMP port-unreachable = closed; no reply = open|filtered; many services answer only to a protocol-specific payload.",
    expected: "UDP scanning is slow and noisy — focus on top-50 (53, 67, 123, 161, 500, …).",
    mistakes: "Trusting 'open|filtered' as 'open'. Running full UDP sweeps without payload templates.",
    attackers: "Hunt SNMP (161) with default communities; NTP (123) for amplification; IKE (500) for VPN fingerprinting.",
    defenders: "Disable unused UDP services; rate-limit; ensure SNMP uses v3 with auth+priv.",
  },
  {
    topic: "Service / version & OS fingerprinting",
    look: "Banner strings, TLS cert SANs, response timing, TCP/IP stack quirks.",
    expected: "Most banners truthfully report version; admins rarely strip them.",
    mistakes: "Acting on a banner alone — patches can be backported; cross-check with behaviour.",
    attackers: "Pivot from version → CVE → exploit selection in minutes.",
    defenders: "Suppress banners; deploy WAF/IPS signatures; patch faster than attacker triage time.",
  },
];

export const M03_INCIDENTS = [
  {
    org: "Equifax (2017)",
    method: "Unpatched Apache Struts (CVE-2017-5638)",
    recon: "Internet-wide scanning for vulnerable Struts endpoints; banner & path enumeration.",
    impact: "147M records breached; ~$1.4B in costs and settlements.",
    lesson: "Public scanning + missing patch = catastrophic. The vulnerable host was discoverable for months.",
  },
  {
    org: "Capital One (2019)",
    method: "SSRF → IMDS → S3 exfil",
    recon: "External enumeration of cloud-hosted WAF, then internal metadata service discovery.",
    impact: "100M+ customer records exposed; $190M settlement.",
    lesson: "Scanning blends with cloud metadata — discovery doesn't stop at the perimeter.",
  },
  {
    org: "WannaCry (2017)",
    method: "EternalBlue (SMBv1) worm",
    recon: "Mass internet scanning of TCP/445 to locate vulnerable SMBv1 hosts.",
    impact: "200,000+ machines across 150 countries; NHS disruption.",
    lesson: "Exposing legacy protocols (SMBv1) to the internet is an open invitation — scan your own perimeter first.",
  },
];

export const M03_DELIVERABLES = [
  { id: "scope", label: "Scope validation & permission letter logged" },
  { id: "discovery", label: "Live-host inventory (ICMP + TCP ping)" },
  { id: "tcp", label: "TCP top-1000 service matrix per host" },
  { id: "udp", label: "UDP top-50 service matrix per host" },
  { id: "versions", label: "Service version & banner catalogue" },
  { id: "os", label: "OS fingerprint summary" },
  { id: "http", label: "HTTP header & methods audit" },
  { id: "asn", label: "IP / ASN / reverse-DNS intel mapping" },
  { id: "exposure", label: "Consolidated exposure register" },
  { id: "exec", label: "Executive summary (1 page, business-language)" },
];

export const M03_AI_ACTIONS = [
  {
    id: "analyze",
    label: "Analyze Findings",
    output: "Across 18 live hosts in 198.51.100.0/24, 11 expose at least one admin-tier port (22/3389/5985) to the public internet. Three OpenSSH 7.2p2 daemons match a known user-enumeration CVE class. Two Apache 2.2.15 hosts are end-of-life and allow TRACE. Severity-weighted exposure score: 7.8 / 10.",
  },
  {
    id: "correlate",
    label: "Correlate Evidence",
    output: "TLS SAN on 198.51.100.42 lists internal hostname `corp-jump01.northwind.local`, matching a reverse-DNS PTR pattern repeated on three other perimeter IPs. This implies a single misconfigured certificate template is shared across the bastion fleet — one private-key compromise pivots to all four.",
  },
  {
    id: "assess",
    label: "Generate Assessment",
    output: "External scanning posture: BELOW INDUSTRY MEAN. Drivers: (1) unsuppressed banners disclosing exact versions, (2) EOL Apache on production endpoints, (3) admin SSH/RDP reachable from the open internet. Quick wins exist (banner suppression, ACLs); strategic work needed on patch SLA and bastion architecture.",
  },
  {
    id: "recommend",
    label: "Generate Recommendations",
    output: "Priority 1 (≤7d): Patch OpenSSH on perimeter Linux; disable TRACE; restrict SSH/RDP to bastion. Priority 2 (≤30d): Upgrade Apache to supported branch; suppress Server/X-Powered-By; deploy security headers. Priority 3 (≤90d): Continuous external scanning with diff alerting; quarterly perimeter pentest; segment legacy OS into isolated VLAN.",
  },
  {
    id: "exec",
    label: "Executive Summary",
    output: "Northwind's externally-reachable network exposes more administrative services than industry peers, and two production web servers run software the vendor stopped supporting. An attacker performing the same scans we did could move from discovery to exploitation in under a working day. Three actions — patch SSH, retire end-of-life Apache, and hide admin services behind a bastion — eliminate the highest-likelihood attack paths within 30 days at minimal cost.",
  },
];

export const M03_SLUG = "scanning-networks";
