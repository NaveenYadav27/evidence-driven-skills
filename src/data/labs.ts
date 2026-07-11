// Lab catalog. Each objective is satisfied by REAL telemetry events.
// No "Mark Complete" buttons anywhere — students must run tools and submit
// findings that validate against live data or strict format checks.

export type LabKind = "terminal" | "challenge";

export interface LabObjective {
  id: string;
  label: string;
  type: "command" | "finding";
  tool?: string;
  argMatch?: string;
  key?: string;
  hint?: string;
}

export interface Lab {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  kind: LabKind;
  difficulty: "beginner" | "intermediate" | "advanced";
  estMinutes: number;
  scenario: string;
  target?: string;
  tools: string[];
  objectives: LabObjective[];
  findingFields?: { key: string; label: string; placeholder?: string; help?: string }[];
}

export const LABS: Lab[] = [
  /* ════════════ Module 01 — Introduction to Ethical Hacking ════════════ */
  {
    id: "lab-m01-killchain",
    moduleId: "m01",
    slug: "kill-chain-mapping",
    title: "Cyber Kill Chain — Map Real CVE to Phase",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "log4j",
    scenario:
      "Pick a real CVE (use `cve log4j`) and map it to the correct Cyber Kill Chain phase. Submit a valid CVE-ID returned by NVD and the kill-chain phase that best matches the exploitation pattern.",
    tools: ["cve"],
    objectives: [
      { id: "o-m01-cve", label: "Run cve search against log4j", type: "command", tool: "cve", argMatch: "log4j" },
      { id: "o-m01-id", label: "Submit a CVE-ID from results", type: "finding", key: "cveId", hint: "format CVE-YYYY-NNNN+" },
      { id: "o-m01-phase", label: "Submit kill-chain phase", type: "finding", key: "killChainPhase", hint: "one of: recon, weaponization, delivery, exploitation, installation, c2, actions" },
    ],
    findingFields: [
      { key: "cveId", label: "CVE Identifier", placeholder: "e.g. CVE-2021-44228" },
      { key: "killChainPhase", label: "Kill-chain phase", placeholder: "exploitation", help: "Lowercase; Lockheed Martin 7-phase model." },
    ],
  },
  {
    id: "lab-m01-attack",
    moduleId: "m01",
    slug: "mitre-attack-id",
    title: "MITRE ATT&CK — Technique ID Practice",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    scenario:
      "Translate a real-world TTP into a MITRE ATT&CK Technique ID. Submit a valid technique ID and the tactic it belongs to.",
    target: "MITRE ATT&CK Framework (knowledge check)",
    tools: ["reference"],
    objectives: [
      { id: "o-m01-tid", label: "Submit a valid ATT&CK Technique ID", type: "finding", key: "attackTechniqueId", hint: "T#### or T####.###" },
      { id: "o-m01-tac", label: "Submit the parent tactic", type: "finding", key: "attackTactic", hint: "e.g. initial-access, execution, persistence" },
    ],
    findingFields: [
      { key: "attackTechniqueId", label: "Technique ID", placeholder: "e.g. T1059.001" },
      { key: "attackTactic", label: "Tactic", placeholder: "e.g. execution" },
    ],
  },
  {
    id: "lab-m01-cvss",
    moduleId: "m01",
    slug: "cvss-triage",
    title: "CVSS v3.1 — Risk Triage of a Real CVE",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 25,
    target: "log4j",
    scenario:
      "An ethical hacker must justify severity to executives using a recognised scoring system. Search NVD for a Log4Shell-class CVE, then craft a CVSS v3.1 base vector and matching score that defends a Critical rating (RCE, network, no auth).",
    tools: ["cve", "cvss"],
    objectives: [
      { id: "o-m01-cvss-cve", label: "Run cve search against log4j", type: "command", tool: "cve", argMatch: "log4j" },
      { id: "o-m01-cvss-cmd", label: "Compute a CVSS score with the cvss tool", type: "command", tool: "cvss" },
      { id: "o-m01-cvss-vec", label: "Submit the CVSS v3.1 base vector", type: "finding", key: "cvssVector", hint: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" },
      { id: "o-m01-cvss-sc",  label: "Submit the resulting base score", type: "finding", key: "cvssScore", hint: "0.0 – 10.0, one decimal" },
    ],
    findingFields: [
      { key: "cvssVector", label: "CVSS v3.1 vector", placeholder: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", help: "Lowercase or uppercase accepted." },
      { key: "cvssScore",  label: "Base score",        placeholder: "9.8" },
    ],
  },
  {
    id: "lab-m01-persistence",
    moduleId: "m01",
    slug: "attack-persistence-mapping",
    title: "ATT&CK — Persistence Technique Mapping",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 15,
    scenario:
      "Blue team detected a new value under HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run pointing to a binary in %APPDATA%. Identify the MITRE ATT&CK Technique ID for this persistence behaviour and the parent tactic.",
    target: "Windows Registry Run Keys persistence",
    tools: ["reference"],
    objectives: [
      { id: "o-m01-per-tid", label: "Submit the ATT&CK Technique ID for Registry Run Keys persistence", type: "finding", key: "attackTechniqueId", hint: "Hint: T1547.001" },
      { id: "o-m01-per-tac", label: "Submit the parent tactic", type: "finding", key: "attackTactic", hint: "persistence" },
    ],
    findingFields: [
      { key: "attackTechniqueId", label: "Technique ID", placeholder: "T####.###" },
      { key: "attackTactic",      label: "Tactic",        placeholder: "persistence" },
    ],
  },
  {
    id: "lab-m01-incident",
    moduleId: "m01",
    slug: "incident-decomposition",
    title: "Incident Decomposition — Real Breach to Frameworks",
    kind: "challenge",
    difficulty: "advanced",
    estMinutes: 35,
    target: "log4j",
    scenario:
      "End-to-end analyst challenge. Pick a Log4Shell-related CVE from NVD, identify the Cyber Kill Chain phase where the vulnerability is weaponised against the target, and map the post-exploitation behaviour (downloading a second-stage payload over HTTP from a C2 host) to a MITRE ATT&CK Technique ID and tactic.",
    tools: ["cve"],
    objectives: [
      { id: "o-m01-inc-cve",   label: "Run cve search against log4j",                                  type: "command", tool: "cve", argMatch: "log4j" },
      { id: "o-m01-inc-id",    label: "Submit a CVE-ID returned by NVD",                              type: "finding", key: "cveId" },
      { id: "o-m01-inc-phase", label: "Submit the kill-chain phase for RCE via crafted JNDI string",  type: "finding", key: "killChainPhase", hint: "exploitation" },
      { id: "o-m01-inc-tid",   label: "Submit ATT&CK Technique ID for stage-2 payload download",       type: "finding", key: "attackTechniqueId", hint: "Hint: T1105 — Ingress Tool Transfer" },
      { id: "o-m01-inc-tac",   label: "Submit the parent tactic",                                      type: "finding", key: "attackTactic", hint: "command-and-control" },
    ],
    findingFields: [
      { key: "cveId",              label: "CVE Identifier",   placeholder: "CVE-2021-44228" },
      { key: "killChainPhase",     label: "Kill-chain phase", placeholder: "exploitation" },
      { key: "attackTechniqueId",  label: "Technique ID",     placeholder: "T1105" },
      { key: "attackTactic",       label: "Tactic",            placeholder: "command-and-control" },
    ],
  },

  /* ══════════ Module 02 — Footprinting & Reconnaissance ══════════ */
  {
    id: "lab-m02-whois",
    moduleId: "m02",
    slug: "whois-recon",
    title: "WHOIS — Registration Intelligence",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    target: "example.com",
    scenario:
      "Your client suspects domain squatting against their brand. Use WHOIS / RDAP to pull authoritative registration data for example.com and submit the registrar and creation date.",
    tools: ["whois"],
    objectives: [
      { id: "o-whois-run", label: "Run whois against example.com", type: "command", tool: "whois", argMatch: "example.com" },
      { id: "o-whois-registrar", label: "Submit correct Registrar", type: "finding", key: "registrar" },
      { id: "o-whois-created", label: "Submit correct Creation Year", type: "finding", key: "createdYear", hint: "4-digit year" },
    ],
    findingFields: [
      { key: "registrar", label: "Registrar Name", placeholder: "e.g. RESERVED-Internet Assigned Numbers Authority", help: "Copy from the WHOIS 'Registrar' field." },
      { key: "createdYear", label: "Domain Creation Year", placeholder: "e.g. 1995" },
    ],
  },
  {
    id: "lab-m02-dns",
    moduleId: "m02",
    slug: "dns-enumeration",
    title: "DNS Enumeration — A, MX, NS, TXT",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "iana.org",
    scenario:
      "Map the public DNS footprint of iana.org. Resolve the A record, find its mail exchanger(s), authoritative nameservers, and any SPF TXT record.",
    tools: ["dig", "nslookup"],
    objectives: [
      { id: "o-dns-a", label: "Resolve an A record for iana.org", type: "command", tool: "dig", argMatch: "iana.org" },
      { id: "o-dns-mx", label: "Query MX records (use type MX)", type: "command", tool: "dig", argMatch: "mx" },
      { id: "o-dns-ns", label: "Query NS records (use type NS)", type: "command", tool: "dig", argMatch: "ns" },
      { id: "o-dns-mxhost", label: "Submit primary MX hostname", type: "finding", key: "mx" },
    ],
    findingFields: [
      { key: "mx", label: "Primary MX hostname", placeholder: "e.g. mail.example.com", help: "Lowercase; host with lowest preference." },
    ],
  },
  {
    id: "lab-m02-subs",
    moduleId: "m02",
    slug: "subdomain-enumeration",
    title: "Subdomain Enumeration via Certificate Transparency",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "owasp.org",
    scenario:
      "Every TLS certificate ever issued for a domain is logged publicly. Use `subs owasp.org` to harvest the subdomain attack surface, then submit one verified subdomain plus the total count.",
    tools: ["subs"],
    objectives: [
      { id: "o-subs-run", label: "Run subs against owasp.org", type: "command", tool: "subs", argMatch: "owasp.org" },
      { id: "o-subs-count", label: "Submit count of unique subdomains", type: "finding", key: "subdomainCount", hint: "integer ≥ 1" },
      { id: "o-subs-one", label: "Submit one valid subdomain", type: "finding", key: "subdomain" },
    ],
    findingFields: [
      { key: "subdomainCount", label: "Unique subdomain count", placeholder: "e.g. 47" },
      { key: "subdomain", label: "A discovered subdomain", placeholder: "e.g. wiki.owasp.org" },
    ],
  },
  {
    id: "lab-m02-wayback",
    moduleId: "m02",
    slug: "wayback-historical",
    title: "Historical Footprint — Wayback Machine",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    target: "mit.edu",
    scenario: "Use `wayback mit.edu` to enumerate Internet Archive snapshots and submit the year of the first capture.",
    tools: ["wayback"],
    objectives: [
      { id: "o-wb-run", label: "Run wayback against mit.edu", type: "command", tool: "wayback", argMatch: "mit.edu" },
      { id: "o-wb-year", label: "Submit year of earliest snapshot", type: "finding", key: "firstSeenYear", hint: "4-digit year" },
      { id: "o-wb-count", label: "Submit total snapshots returned", type: "finding", key: "snapshotCount" },
    ],
    findingFields: [
      { key: "firstSeenYear", label: "First snapshot year", placeholder: "e.g. 1997" },
      { key: "snapshotCount", label: "Total snapshots returned", placeholder: "integer" },
    ],
  },
  {
    id: "lab-m02-challenge",
    moduleId: "m02",
    slug: "acme-recon-challenge",
    title: "Challenge — Recon Brief: cloudflare.com",
    kind: "challenge",
    difficulty: "intermediate",
    estMinutes: 30,
    target: "cloudflare.com",
    scenario:
      "Full recon playbook: registrar, primary nameserver, primary MX, and one CT-discovered subdomain. All must validate against live data.",
    tools: ["whois", "dig", "subs"],
    objectives: [
      { id: "c-whois", label: "Run whois on the target", type: "command", tool: "whois", argMatch: "cloudflare.com" },
      { id: "c-ns", label: "Query NS records", type: "command", tool: "dig", argMatch: "ns" },
      { id: "c-mx", label: "Query MX records", type: "command", tool: "dig", argMatch: "mx" },
      { id: "c-subs", label: "Enumerate subdomains via CT", type: "command", tool: "subs", argMatch: "cloudflare.com" },
      { id: "c-registrar", label: "Submit Registrar", type: "finding", key: "registrar" },
      { id: "c-ns-host", label: "Submit a valid Nameserver", type: "finding", key: "ns" },
      { id: "c-mx-host", label: "Submit primary MX hostname", type: "finding", key: "mx" },
      { id: "c-sub", label: "Submit one valid subdomain", type: "finding", key: "subdomain" },
    ],
    findingFields: [
      { key: "registrar", label: "Registrar Name", placeholder: "exact value from WHOIS" },
      { key: "ns", label: "Authoritative Nameserver", placeholder: "e.g. ns1.example.com" },
      { key: "mx", label: "Primary MX hostname", placeholder: "e.g. mail.example.com" },
      { key: "subdomain", label: "Discovered subdomain", placeholder: "e.g. blog.cloudflare.com" },
    ],
  },
  {
    id: "lab-m02-robots",
    moduleId: "m02",
    slug: "website-footprinting-robots",
    title: "Website Footprinting — robots.txt Intel",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    target: "github.com",
    scenario:
      "robots.txt often discloses staging paths, admin panels, and crawl-restricted directories. Use `robots github.com` to enumerate disallowed paths and submit one Disallow entry plus the User-agent it applies to.",
    tools: ["robots"],
    objectives: [
      { id: "o-m02-rob-run", label: "Fetch robots.txt for github.com", type: "command", tool: "robots", argMatch: "github.com" },
      { id: "o-m02-rob-ua", label: "Submit a User-agent declared in robots.txt", type: "finding", key: "robotsUserAgent", hint: "e.g. * or Googlebot" },
      { id: "o-m02-rob-path", label: "Submit one Disallowed path", type: "finding", key: "robotsDisallow", hint: "begins with /" },
    ],
    findingFields: [
      { key: "robotsUserAgent", label: "User-agent", placeholder: "e.g. *" },
      { key: "robotsDisallow", label: "Disallowed path", placeholder: "e.g. /gist/" },
    ],
  },
  {
    id: "lab-m02-tech-headers",
    moduleId: "m02",
    slug: "website-footprinting-headers",
    title: "Website Footprinting — Server & Security Headers",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    target: "mozilla.org",
    scenario:
      "HTTP response headers leak server software, frameworks, and CDN providers — and missing security headers reveal weaknesses. Use `headers mozilla.org` to fingerprint the stack and audit defensive headers.",
    tools: ["headers"],
    objectives: [
      { id: "o-m02-hd-run", label: "Fetch response headers for mozilla.org", type: "command", tool: "headers", argMatch: "mozilla.org" },
      { id: "o-m02-hd-server", label: "Submit the Server header value", type: "finding", key: "serverHeader", hint: "e.g. nginx, cloudflare" },
      { id: "o-m02-hd-hsts", label: "Submit value of Strict-Transport-Security max-age", type: "finding", key: "hstsMaxAge", hint: "integer seconds" },
    ],
    findingFields: [
      { key: "serverHeader", label: "Server header", placeholder: "e.g. cloudflare" },
      { key: "hstsMaxAge", label: "HSTS max-age (seconds)", placeholder: "e.g. 31536000" },
    ],
  },
  {
    id: "lab-m02-email-spf",
    moduleId: "m02",
    slug: "email-footprinting-spf-dmarc",
    title: "Email Footprinting — SPF, DKIM & DMARC Posture",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    target: "paypal.com",
    scenario:
      "Spoofability of a brand depends on its SPF, DKIM, and DMARC posture. Query TXT records for paypal.com and _dmarc.paypal.com, then submit the SPF qualifier (~all/-all) and the DMARC policy (none/quarantine/reject).",
    tools: ["dig"],
    objectives: [
      { id: "o-m02-em-spf", label: "Query TXT records for paypal.com", type: "command", tool: "dig", argMatch: "txt" },
      { id: "o-m02-em-dmarc", label: "Query TXT for _dmarc.paypal.com", type: "command", tool: "dig", argMatch: "_dmarc" },
      { id: "o-m02-em-spfq", label: "Submit the SPF all-qualifier", type: "finding", key: "spfQualifier", hint: "one of: ~all, -all, ?all, +all" },
      { id: "o-m02-em-pol", label: "Submit the DMARC policy", type: "finding", key: "dmarcPolicy", hint: "p= value: none|quarantine|reject" },
    ],
    findingFields: [
      { key: "spfQualifier", label: "SPF all-qualifier", placeholder: "e.g. -all" },
      { key: "dmarcPolicy", label: "DMARC policy", placeholder: "e.g. reject" },
    ],
  },
  {
    id: "lab-m02-reverse-dns",
    moduleId: "m02",
    slug: "network-footprinting-reverse-dns",
    title: "Network Footprinting — IP, ASN & Reverse DNS",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    target: "wikipedia.org",
    scenario:
      "Pivot from a hostname to network-level intel. Resolve wikipedia.org, run ASN intel against it, then perform reverse DNS (PTR) on the resulting IP. Submit IP, ASN org, and PTR hostname.",
    tools: ["ip", "dig"],
    objectives: [
      { id: "o-m02-rev-ip", label: "Run ip intel on wikipedia.org", type: "command", tool: "ip", argMatch: "wikipedia.org" },
      { id: "o-m02-rev-ptr", label: "Query a PTR record (use type PTR or in-addr.arpa)", type: "command", tool: "dig", argMatch: "ptr" },
      { id: "o-m02-rev-addr", label: "Submit the resolved IPv4", type: "finding", key: "ipAddress" },
      { id: "o-m02-rev-org", label: "Submit the ASN org/owner", type: "finding", key: "asnOrg", hint: "e.g. WIKIMEDIA" },
      { id: "o-m02-rev-ptrh", label: "Submit the PTR hostname", type: "finding", key: "ptrHost", hint: "fully qualified" },
    ],
    findingFields: [
      { key: "ipAddress", label: "Resolved IPv4", placeholder: "e.g. 208.80.154.224" },
      { key: "asnOrg", label: "ASN organisation", placeholder: "e.g. WIKIMEDIA" },
      { key: "ptrHost", label: "PTR hostname", placeholder: "e.g. text-lb.eqiad.wikimedia.org" },
    ],
  },
  {
    id: "lab-m02-tls-cert",
    moduleId: "m02",
    slug: "tls-certificate-footprint",
    title: "TLS Certificate Footprinting — SAN Harvest",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    target: "stripe.com",
    scenario:
      "A live TLS certificate's Subject Alternative Name (SAN) list is a high-signal source of related hostnames and infrastructure. Use `tls stripe.com` to inspect the active cert and submit the issuer CN plus one SAN entry beyond the apex.",
    tools: ["tls"],
    objectives: [
      { id: "o-m02-tls-run", label: "Inspect TLS certificate for stripe.com", type: "command", tool: "tls", argMatch: "stripe.com" },
      { id: "o-m02-tls-iss", label: "Submit the certificate Issuer (CN/O)", type: "finding", key: "tlsIssuer", hint: "e.g. DigiCert, Let's Encrypt" },
      { id: "o-m02-tls-san", label: "Submit a SAN entry other than the apex", type: "finding", key: "tlsSan", hint: "e.g. api.stripe.com" },
    ],
    findingFields: [
      { key: "tlsIssuer", label: "Certificate Issuer", placeholder: "e.g. DigiCert Inc" },
      { key: "tlsSan", label: "SAN hostname", placeholder: "e.g. checkout.stripe.com" },
    ],
  },
  {
    id: "lab-m02-osint-challenge",
    moduleId: "m02",
    slug: "full-osint-brief",
    title: "Challenge — Full OSINT Brief: github.com",
    kind: "challenge",
    difficulty: "advanced",
    estMinutes: 40,
    target: "github.com",
    scenario:
      "Deliver a complete reconnaissance brief on github.com using passive sources only: WHOIS registrar, authoritative NS, CT-discovered subdomain, certificate issuer, DMARC policy, and ASN org. Every value must validate against live data.",
    tools: ["whois", "dig", "subs", "tls", "ip"],
    objectives: [
      { id: "c-m02-osint-whois", label: "Run whois on github.com", type: "command", tool: "whois", argMatch: "github.com" },
      { id: "c-m02-osint-ns", label: "Query NS records", type: "command", tool: "dig", argMatch: "ns" },
      { id: "c-m02-osint-subs", label: "Enumerate subdomains via CT", type: "command", tool: "subs", argMatch: "github.com" },
      { id: "c-m02-osint-tls", label: "Inspect the TLS certificate", type: "command", tool: "tls", argMatch: "github.com" },
      { id: "c-m02-osint-ip", label: "Run ASN intel on the host", type: "command", tool: "ip", argMatch: "github.com" },
      { id: "c-m02-osint-dmarc", label: "Query _dmarc TXT", type: "command", tool: "dig", argMatch: "_dmarc" },
      { id: "c-m02-osint-reg", label: "Submit Registrar", type: "finding", key: "registrar" },
      { id: "c-m02-osint-nsv", label: "Submit a valid Nameserver", type: "finding", key: "ns" },
      { id: "c-m02-osint-sub", label: "Submit one valid subdomain", type: "finding", key: "subdomain" },
      { id: "c-m02-osint-iss", label: "Submit certificate Issuer", type: "finding", key: "tlsIssuer" },
      { id: "c-m02-osint-pol", label: "Submit DMARC policy", type: "finding", key: "dmarcPolicy", hint: "none|quarantine|reject" },
      { id: "c-m02-osint-org", label: "Submit ASN organisation", type: "finding", key: "asnOrg" },
    ],
    findingFields: [
      { key: "registrar", label: "Registrar", placeholder: "exact value from WHOIS" },
      { key: "ns", label: "Authoritative Nameserver", placeholder: "e.g. ns-1283.awsdns-32.org" },
      { key: "subdomain", label: "Discovered subdomain", placeholder: "e.g. api.github.com" },
      { key: "tlsIssuer", label: "Certificate Issuer", placeholder: "e.g. DigiCert Inc" },
      { key: "dmarcPolicy", label: "DMARC policy", placeholder: "reject" },
      { key: "asnOrg", label: "ASN organisation", placeholder: "e.g. GITHUB" },
    ],
  },



  /* ════════════════ Module 03 — Scanning Networks ════════════════ */
  {
    id: "lab-m03-ipintel",
    moduleId: "m03",
    slug: "ip-asn-intelligence",
    title: "Host Discovery — IP & ASN Intelligence",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "scanme.nmap.org",
    scenario:
      "Before scanning ports, you map *where* the target lives. Use `ip scanme.nmap.org` to resolve the IPv4 and pull ASN/country/org from ipapi.co. Submit IP, country code, and ASN.",
    tools: ["ip", "dig"],
    objectives: [
      { id: "o-m03-dig", label: "Resolve A record via dig", type: "command", tool: "dig", argMatch: "scanme.nmap.org" },
      { id: "o-m03-ip", label: "Run ip intel on the host", type: "command", tool: "ip", argMatch: "scanme.nmap.org" },
      { id: "o-m03-ipv4", label: "Submit the resolved IPv4", type: "finding", key: "ipAddress" },
      { id: "o-m03-cc", label: "Submit the country code", type: "finding", key: "ipCountry", hint: "ISO-3166 alpha-2" },
      { id: "o-m03-asn", label: "Submit the ASN", type: "finding", key: "asn", hint: "format AS####" },
    ],
    findingFields: [
      { key: "ipAddress", label: "Resolved IPv4", placeholder: "e.g. 45.33.32.156" },
      { key: "ipCountry", label: "Country code", placeholder: "e.g. US" },
      { key: "asn", label: "ASN", placeholder: "e.g. AS63949" },
    ],
  },
  {
    id: "lab-m03-methods",
    moduleId: "m03",
    slug: "service-fingerprint",
    title: "Service Fingerprint via HTTP OPTIONS",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    target: "httpbin.org",
    scenario:
      "Use `methods httpbin.org` to discover which HTTP verbs the server advertises. Submit one risky method (PUT/DELETE/TRACE/PATCH) and the server software.",
    tools: ["methods", "headers"],
    objectives: [
      { id: "o-m03-met-run", label: "Run methods probe", type: "command", tool: "methods", argMatch: "httpbin.org" },
      { id: "o-m03-h", label: "Run headers", type: "command", tool: "headers", argMatch: "httpbin.org" },
      { id: "o-m03-risky", label: "Submit a risky method advertised", type: "finding", key: "riskyMethod", hint: "PUT|DELETE|TRACE|CONNECT|PATCH" },
    ],
    findingFields: [
      { key: "riskyMethod", label: "Risky method", placeholder: "e.g. DELETE" },
    ],
  },

  /* ════════════════════ Module 04 — Enumeration ════════════════════ */
  {
    id: "lab-m04-dns-enum",
    moduleId: "m04",
    slug: "dns-zone-enumeration",
    title: "DNS Zone Enumeration — TXT & SPF/DMARC",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 25,
    target: "google.com",
    scenario:
      "TXT records leak mail infrastructure and SaaS providers. Pull TXT for google.com, identify the SPF record, and submit a single included sender domain.",
    tools: ["dig"],
    objectives: [
      { id: "o-m04-txt", label: "Query TXT records", type: "command", tool: "dig", argMatch: "txt" },
      { id: "o-m04-spf", label: "Submit SPF include domain", type: "finding", key: "spfInclude", hint: "value of an include:domain in SPF" },
    ],
    findingFields: [
      { key: "spfInclude", label: "SPF include domain", placeholder: "e.g. _spf.google.com" },
    ],
  },
  {
    id: "lab-m04-caa",
    moduleId: "m04",
    slug: "caa-enumeration",
    title: "CAA Enumeration — Trusted Issuers",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 15,
    target: "github.com",
    scenario:
      "CAA records pin which CAs may issue certificates. Query CAA for github.com and submit one allowed CA.",
    tools: ["dig"],
    objectives: [
      { id: "o-m04-caa", label: "Query CAA records", type: "command", tool: "dig", argMatch: "caa" },
      { id: "o-m04-issuer", label: "Submit an allowed issuer", type: "finding", key: "caaIssuer", hint: "e.g. digicert.com" },
    ],
    findingFields: [
      { key: "caaIssuer", label: "Allowed CA issuer", placeholder: "e.g. digicert.com" },
    ],
  },

  /* ══════════════════ Module 05 — Vulnerability Analysis ══════════════════ */
  {
    id: "lab-m05-cve",
    moduleId: "m05",
    slug: "cve-triage",
    title: "CVE Triage — NVD Lookup",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "openssl",
    scenario:
      "Run `cve openssl` to pull recent OpenSSL CVEs from NIST NVD. Submit a CVE-ID and its CVSS base score.",
    tools: ["cve"],
    objectives: [
      { id: "o-m05-run", label: "Search NVD for openssl", type: "command", tool: "cve", argMatch: "openssl" },
      { id: "o-m05-id", label: "Submit a CVE-ID from the results", type: "finding", key: "cveId" },
      { id: "o-m05-score", label: "Submit the CVSS base score", type: "finding", key: "cvssScore", hint: "0.0–10.0" },
    ],
    findingFields: [
      { key: "cveId", label: "CVE-ID", placeholder: "CVE-YYYY-NNNN" },
      { key: "cvssScore", label: "CVSS base score", placeholder: "e.g. 9.8" },
    ],
  },
  {
    id: "lab-m05-cvss",
    moduleId: "m05",
    slug: "cvss-vector",
    title: "CVSS v3.1 Vector Construction",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 25,
    scenario:
      "Use `cvss CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` to score a vector. Submit a valid CVSS:3.1 vector string and the computed base score.",
    target: "CVE-2021-44228 (Log4Shell)",
    tools: ["cvss", "cve"],
    objectives: [
      { id: "o-m05-cvss-run", label: "Run cvss with a 3.1 vector", type: "command", tool: "cvss", argMatch: "CVSS:3.1" },
      { id: "o-m05-vec", label: "Submit a valid CVSS:3.1 vector", type: "finding", key: "cvssVector" },
      { id: "o-m05-score", label: "Submit the computed score", type: "finding", key: "cvssScore" },
    ],
    findingFields: [
      { key: "cvssVector", label: "CVSS:3.1 vector", placeholder: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" },
      { key: "cvssScore", label: "Base score", placeholder: "0.0–10.0" },
    ],
  },

  /* ═══════════════════ Module 06 — System Hacking ═══════════════════ */
  {
    id: "lab-m06-crack",
    moduleId: "m06",
    slug: "hash-cracking",
    title: "Hash Cracking — Identify & Recover",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 25,
    scenario:
      "Run `hash sha256 password` to derive a hash, then run `crack 5f4dcc3b5aa765d61d8327deb882cf99` to recover a password from a tiny built-in wordlist. Submit the recovered cleartext.",
    target: "MD5: 5f4dcc3b5aa765d61d8327deb882cf99",
    tools: ["hash", "crack"],
    objectives: [
      { id: "o-m06-hash", label: "Compute a hash", type: "command", tool: "hash", argMatch: "" },
      { id: "o-m06-crack", label: "Run dictionary crack against the demo MD5", type: "command", tool: "crack", argMatch: "5f4dcc3b5aa765d61d8327deb882cf99" },
      { id: "o-m06-pass", label: "Submit recovered password", type: "finding", key: "crackedPassword", hint: "the cleartext word" },
    ],
    findingFields: [
      { key: "crackedPassword", label: "Cleartext password", placeholder: "the recovered word" },
    ],
  },
  {
    id: "lab-m06-priv",
    moduleId: "m06",
    slug: "privilege-escalation-paths",
    title: "Privilege Escalation — Linux SUID Map",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    scenario:
      "Memorise the most-abused Linux SUID binaries. Submit one GTFOBins SUID binary commonly used for local privilege escalation.",
    target: "Post-exploitation privilege paths",
    tools: ["reference"],
    objectives: [
      { id: "o-m06-bin", label: "Submit a known SUID-abusable binary", type: "finding", key: "suidBinary", hint: "from GTFOBins set" },
    ],
    findingFields: [
      { key: "suidBinary", label: "SUID binary", placeholder: "e.g. find, vim, nmap, bash, less" },
    ],
  },

  /* ═══════════════════ Module 07 — Malware Threats ═══════════════════ */
  {
    id: "lab-m07-hash",
    moduleId: "m07",
    slug: "malware-hashing",
    title: "Malware IoC — Hash a Sample String",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    scenario:
      "Hashes are the most basic malware IoC. Use `hash sha256 EICAR-STANDARD-ANTIVIRUS-TEST-FILE` and submit the resulting SHA-256 digest.",
    target: "EICAR test string",
    tools: ["hash"],
    objectives: [
      { id: "o-m07-h", label: "Hash the EICAR string with SHA-256", type: "command", tool: "hash", argMatch: "sha256" },
      { id: "o-m07-d", label: "Submit the SHA-256 digest", type: "finding", key: "sha256Hex", hint: "64 hex chars" },
    ],
    findingFields: [
      { key: "sha256Hex", label: "SHA-256 digest (hex)", placeholder: "64 hex chars" },
    ],
  },
  {
    id: "lab-m07-cve",
    moduleId: "m07",
    slug: "malware-cve-link",
    title: "Malware-to-CVE Mapping",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    target: "wannacry",
    scenario:
      "Many malware families exploit a single signature CVE. Run `cve wannacry` and submit the SMB-related CVE the family abuses.",
    tools: ["cve"],
    objectives: [
      { id: "o-m07-c", label: "Search NVD for wannacry", type: "command", tool: "cve", argMatch: "wannacry" },
      { id: "o-m07-id", label: "Submit a related CVE-ID", type: "finding", key: "cveId" },
    ],
    findingFields: [
      { key: "cveId", label: "Signature CVE", placeholder: "e.g. CVE-2017-0144" },
    ],
  },

  /* ═══════════════════════ Module 08 — Sniffing ═══════════════════════ */
  {
    id: "lab-m08-arp",
    moduleId: "m08",
    slug: "arp-spoof-theory",
    title: "ARP — Layer 2 Sniffing Concepts",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    scenario:
      "Submit the EtherType of an ARP frame (hex), and the ARP opcode value used in an ARP *reply*.",
    target: "Layer-2 LAN segment",
    tools: ["reference"],
    objectives: [
      { id: "o-m08-et", label: "Submit ARP EtherType", type: "finding", key: "ethertype", hint: "0x0806" },
      { id: "o-m08-op", label: "Submit ARP-reply opcode", type: "finding", key: "arpOpcode", hint: "integer 1 or 2" },
    ],
    findingFields: [
      { key: "ethertype", label: "EtherType (hex)", placeholder: "0x0806" },
      { key: "arpOpcode", label: "ARP reply opcode", placeholder: "2" },
    ],
  },
  {
    id: "lab-m08-b64",
    moduleId: "m08",
    slug: "credential-decoding",
    title: "Sniffed HTTP Basic Auth — Decode",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    scenario:
      "Wireshark captured `Authorization: Basic YWRtaW46aHVudGVyMg==`. Use `b64 decode YWRtaW46aHVudGVyMg==` to recover the credentials. Submit the username and password.",
    target: "HTTP Basic auth header",
    tools: ["b64"],
    objectives: [
      { id: "o-m08-d", label: "Base64-decode the credential", type: "command", tool: "b64", argMatch: "YWRtaW46aHVudGVyMg" },
      { id: "o-m08-u", label: "Submit username", type: "finding", key: "username", hint: "lowercase" },
      { id: "o-m08-p", label: "Submit password", type: "finding", key: "password" },
    ],
    findingFields: [
      { key: "username", label: "Username", placeholder: "from decoded value" },
      { key: "password", label: "Password", placeholder: "from decoded value" },
    ],
  },

  /* ═══════════════ Module 09 — Social Engineering ═══════════════ */
  {
    id: "lab-m09-pretext",
    moduleId: "m09",
    slug: "phishing-domain-recon",
    title: "Phishing Domain — Lookalike Recon",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "paypal.com",
    scenario:
      "Real phishing kits register lookalike domains and apply for TLS certs. Run `subs paypal.com` and submit one CT-logged subdomain (skill: spotting the difference between brand-owned and rogue).",
    tools: ["subs"],
    objectives: [
      { id: "o-m09-s", label: "Run subs against paypal.com", type: "command", tool: "subs", argMatch: "paypal.com" },
      { id: "o-m09-sub", label: "Submit one verified subdomain", type: "finding", key: "subdomain" },
    ],
    findingFields: [
      { key: "subdomain", label: "Verified subdomain", placeholder: "e.g. www.paypal.com" },
    ],
  },
  {
    id: "lab-m09-dmarc",
    moduleId: "m09",
    slug: "dmarc-spoof-check",
    title: "Email Spoof Defense — DMARC Policy",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    target: "_dmarc.google.com",
    scenario:
      "Anti-phishing posture starts with DMARC. Query `dig _dmarc.google.com txt` and submit the policy value (`p=`).",
    tools: ["dig"],
    objectives: [
      { id: "o-m09-d", label: "Query DMARC TXT", type: "command", tool: "dig", argMatch: "_dmarc" },
      { id: "o-m09-p", label: "Submit DMARC policy", type: "finding", key: "dmarcPolicy", hint: "none | quarantine | reject" },
    ],
    findingFields: [
      { key: "dmarcPolicy", label: "DMARC policy", placeholder: "none|quarantine|reject" },
    ],
  },

  /* ═════════════════ Module 10 — Denial of Service ═════════════════ */
  {
    id: "lab-m10-amp",
    moduleId: "m10",
    slug: "amplification-factors",
    title: "Amplification — Know Your Vectors",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    scenario:
      "Reflection/amplification attacks weaponise protocols. Submit the typical amplification factor *range* of an open DNS resolver (integer) and one classic amplification protocol.",
    target: "UDP reflectors (DNS/NTP/Memcached)",
    tools: ["reference"],
    objectives: [
      { id: "o-m10-af", label: "Submit DNS amplification factor (~)", type: "finding", key: "ampFactor", hint: "integer 30–80" },
      { id: "o-m10-pr", label: "Submit an amplification protocol", type: "finding", key: "ampProtocol", hint: "dns|ntp|memcached|ssdp|chargen|snmp" },
    ],
    findingFields: [
      { key: "ampFactor", label: "Amplification factor", placeholder: "e.g. 50" },
      { key: "ampProtocol", label: "Protocol", placeholder: "e.g. memcached" },
    ],
  },

  /* ═══════════════ Module 11 — Session Hijacking ═══════════════ */
  {
    id: "lab-m11-jwt",
    moduleId: "m11",
    slug: "jwt-decoding",
    title: "JWT — Decode & Identify alg=none",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    scenario:
      "Run `jwt eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiYWRtaW4ifQ.` to decode a token. Submit the algorithm and the username claim.",
    target: "Sample JWT bearer token",
    tools: ["jwt", "b64"],
    objectives: [
      { id: "o-m11-j", label: "Decode a JWT", type: "command", tool: "jwt", argMatch: "eyJ" },
      { id: "o-m11-alg", label: "Submit alg header", type: "finding", key: "jwtAlg", hint: "lowercase, e.g. none|hs256|rs256" },
      { id: "o-m11-user", label: "Submit user claim", type: "finding", key: "jwtUser" },
    ],
    findingFields: [
      { key: "jwtAlg", label: "alg", placeholder: "e.g. none" },
      { key: "jwtUser", label: "user claim", placeholder: "e.g. admin" },
    ],
  },
  {
    id: "lab-m11-cookies",
    moduleId: "m11",
    slug: "cookie-flag-audit",
    title: "Cookie Flag Audit",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    target: "github.com",
    scenario:
      "Run `headers github.com` and inspect Set-Cookie. Submit `present` or `missing` for HttpOnly and Secure flags on the response cookies.",
    tools: ["headers"],
    objectives: [
      { id: "o-m11-h", label: "Run headers", type: "command", tool: "headers", argMatch: "github.com" },
      { id: "o-m11-ho", label: "Submit HttpOnly flag status", type: "finding", key: "cookieHttpOnly", hint: "present|missing" },
      { id: "o-m11-se", label: "Submit Secure flag status", type: "finding", key: "cookieSecure", hint: "present|missing" },
    ],
    findingFields: [
      { key: "cookieHttpOnly", label: "HttpOnly", placeholder: "present|missing" },
      { key: "cookieSecure", label: "Secure", placeholder: "present|missing" },
    ],
  },

  /* ══════ Module 12 — Evading IDS, Firewalls and Honeypots ══════ */
  {
    id: "lab-m12-evasion",
    moduleId: "m12",
    slug: "evasion-fundamentals",
    title: "Evasion Fundamentals — Frag & Decoy",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    scenario:
      "Submit the nmap flag for IP fragmentation and the nmap flag for spoofed source IPs (decoys).",
    target: "IDS/AV evasion concepts",
    tools: ["reference"],
    objectives: [
      { id: "o-m12-f", label: "Submit fragmentation flag", type: "finding", key: "nmapFrag", hint: "-f" },
      { id: "o-m12-d", label: "Submit decoy flag", type: "finding", key: "nmapDecoy", hint: "-D" },
    ],
    findingFields: [
      { key: "nmapFrag", label: "nmap fragmentation flag", placeholder: "-f" },
      { key: "nmapDecoy", label: "nmap decoy flag", placeholder: "-D" },
    ],
  },

  /* ═════════════ Module 13 — Enterprise Web Server Assessment ═════════════ */
  {
    id: "lab-m13-discovery",
    moduleId: "m13",
    slug: "enterprise-webserver-discovery",
    title: "LAB-13-01 · Enterprise Web Server Discovery",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 25,
    target: "example.com",
    scenario:
      "GFS-WS-001 · A new Digital Banking web server has been deployed. Before production cut-over, discover its stack (server, banners, version) and confirm no version disclosure reaches the internet. Use `headers example.com` and `tls example.com`.",
    tools: ["headers", "tls", "methods"],
    objectives: [
      { id: "o-m13-01-h", label: "Pull HTTP response headers", type: "command", tool: "headers", argMatch: "example.com" },
      { id: "o-m13-01-t", label: "Inspect the TLS certificate", type: "command", tool: "tls", argMatch: "example.com" },
      { id: "o-m13-01-s", label: "Submit the Server header value", type: "finding", key: "serverHeader" },
      { id: "o-m13-01-i", label: "Submit the certificate issuer", type: "finding", key: "certIssuer" },
    ],
    findingFields: [
      { key: "serverHeader", label: "Server header", placeholder: "e.g. ECAcc / nginx" },
      { key: "certIssuer", label: "Certificate issuer", placeholder: "e.g. DigiCert" },
    ],
  },
  {
    id: "lab-m13-headers",
    moduleId: "m13",
    slug: "http-security-header-assessment",
    title: "LAB-13-02 · HTTP Security Header Assessment",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 25,
    target: "github.com",
    scenario:
      "GFS-WS-002 · The online banking portal must ship a defined header baseline (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) on every response. Run `headers github.com` and record HSTS max-age plus CSP and X-Frame-Options presence.",
    tools: ["headers"],
    objectives: [
      { id: "o-m13-02-h", label: "Run headers against the portal", type: "command", tool: "headers", argMatch: "github.com" },
      { id: "o-m13-02-hs", label: "Submit HSTS max-age (seconds)", type: "finding", key: "hstsMaxAge", hint: "integer seconds, e.g. 31536000" },
      { id: "o-m13-02-csp", label: "Submit CSP presence", type: "finding", key: "cspPresent", hint: "present|missing" },
      { id: "o-m13-02-xfo", label: "Submit X-Frame-Options presence", type: "finding", key: "xfoPresent", hint: "present|missing" },
    ],
    findingFields: [
      { key: "hstsMaxAge", label: "HSTS max-age", placeholder: "e.g. 31536000" },
      { key: "cspPresent", label: "CSP present?", placeholder: "present|missing" },
      { key: "xfoPresent", label: "X-Frame-Options present?", placeholder: "present|missing" },
    ],
  },
  {
    id: "lab-m13-directory",
    moduleId: "m13",
    slug: "directory-enumeration-assessment",
    title: "LAB-13-03 · Directory Enumeration Assessment",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "wikipedia.org",
    scenario:
      "GFS-WS-003 · Legacy directories, backup files and metadata endpoints frequently outlive the projects that created them. Run `robots wikipedia.org` to enumerate Disallow paths and identify one that would be interesting to re-probe.",
    tools: ["robots"],
    objectives: [
      { id: "o-m13-03-r", label: "Run robots against the target", type: "command", tool: "robots", argMatch: "wikipedia.org" },
      { id: "o-m13-03-p", label: "Submit one Disallow path", type: "finding", key: "disallowPath" },
      { id: "o-m13-03-ua", label: "Submit a robots User-agent token", type: "finding", key: "robotsUserAgent", hint: "e.g. * or Googlebot" },
    ],
    findingFields: [
      { key: "disallowPath", label: "A Disallow path", placeholder: "e.g. /wiki/Special:Random" },
      { key: "robotsUserAgent", label: "User-agent token", placeholder: "e.g. *" },
    ],
  },
  {
    id: "lab-m13-tls",
    moduleId: "m13",
    slug: "tls-assessment",
    title: "LAB-13-04 · TLS Assessment",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 25,
    target: "github.com",
    scenario:
      "GFS-WS-004 · The banking TLS surface is the customer's only visible trust signal. Run `tls github.com` to pull the certificate and report the issuer plus one SAN. Flag internal-hostname disclosure in SANs.",
    tools: ["tls"],
    objectives: [
      { id: "o-m13-04-t", label: "Inspect the TLS certificate", type: "command", tool: "tls", argMatch: "github.com" },
      { id: "o-m13-04-i", label: "Submit the certificate issuer", type: "finding", key: "certIssuer" },
      { id: "o-m13-04-s", label: "Submit one SAN", type: "finding", key: "subdomain" },
    ],
    findingFields: [
      { key: "certIssuer", label: "Issuer", placeholder: "e.g. DigiCert" },
      { key: "subdomain", label: "SAN entry", placeholder: "e.g. www.github.com" },
    ],
  },
  {
    id: "lab-m13-hardening",
    moduleId: "m13",
    slug: "enterprise-hardening-review",
    title: "LAB-13-05 · Enterprise Hardening Review",
    kind: "challenge",
    difficulty: "intermediate",
    estMinutes: 40,
    target: "github.com",
    scenario:
      "GFS-WS-005 · Consolidate the four prior assessments into a single hardening report. Re-run `headers github.com` and `robots github.com`, then submit Server, HSTS presence, CSP presence and one Disallow path. All four must validate.",
    tools: ["headers", "robots"],
    objectives: [
      { id: "c13-05-h", label: "Run headers", type: "command", tool: "headers", argMatch: "github.com" },
      { id: "c13-05-r", label: "Run robots", type: "command", tool: "robots", argMatch: "github.com" },
      { id: "c13-05-server", label: "Submit Server header", type: "finding", key: "serverHeader" },
      { id: "c13-05-hsts", label: "Submit HSTS presence", type: "finding", key: "hstsPresent", hint: "present|missing" },
      { id: "c13-05-csp", label: "Submit CSP presence", type: "finding", key: "cspPresent", hint: "present|missing" },
      { id: "c13-05-dis", label: "Submit one Disallow path", type: "finding", key: "disallowPath" },
    ],
    findingFields: [
      { key: "serverHeader", label: "Server header", placeholder: "e.g. github.com" },
      { key: "hstsPresent", label: "HSTS present?", placeholder: "present|missing" },
      { key: "cspPresent", label: "CSP present?", placeholder: "present|missing" },
      { key: "disallowPath", label: "A Disallow path", placeholder: "e.g. /gist/" },
    ],
  },

  /* ═════════════ Module 14 — Web Application Assessment ═════════════ */
  {
    id: "lab-m14-authflow",
    moduleId: "m14",
    slug: "authentication-flow-assessment",
    title: "LAB-14-01 · Authentication Flow Assessment",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 25,
    target: "Login → MFA → Session → Reset workflow",
    scenario:
      "GFS-WEBAPP-001 · The login journey is the app's most-attacked surface. Weak MFA turns credential stuffing into account takeover. Map the flow and identify the MITRE ATT&CK technique for credential stuffing.",
    tools: ["reference"],
    objectives: [
      { id: "o-m14-01-tid", label: "Submit ATT&CK technique for credential stuffing", type: "finding", key: "attackTechniqueId", hint: "T1110.004" },
      { id: "o-m14-01-tac", label: "Submit the parent tactic", type: "finding", key: "attackTactic", hint: "credential-access" },
    ],
    findingFields: [
      { key: "attackTechniqueId", label: "Technique ID", placeholder: "T1110.004" },
      { key: "attackTactic", label: "Tactic", placeholder: "credential-access" },
    ],
  },
  {
    id: "lab-m14-session",
    moduleId: "m14",
    slug: "session-management-assessment",
    title: "LAB-14-02 · Session Management Assessment",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "github.com",
    scenario:
      "GFS-WEBAPP-002 · Session cookies without HttpOnly and Secure are trivially stolen via XSS or MITM. Run `headers github.com` and submit the HttpOnly and Secure flag status on the session cookie.",
    tools: ["headers"],
    objectives: [
      { id: "o-m14-02-h", label: "Run headers", type: "command", tool: "headers", argMatch: "github.com" },
      { id: "o-m14-02-ho", label: "Submit HttpOnly status", type: "finding", key: "cookieHttpOnly", hint: "present|missing" },
      { id: "o-m14-02-se", label: "Submit Secure status", type: "finding", key: "cookieSecure", hint: "present|missing" },
    ],
    findingFields: [
      { key: "cookieHttpOnly", label: "HttpOnly", placeholder: "present|missing" },
      { key: "cookieSecure", label: "Secure", placeholder: "present|missing" },
    ],
  },
  {
    id: "lab-m14-idor",
    moduleId: "m14",
    slug: "authorization-idor-assessment",
    title: "LAB-14-03 · Authorization Assessment (IDOR)",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 25,
    target: "/api/transfers/{transferId} (Corporate Banking)",
    scenario:
      "GFS-WEBAPP-003 · Object references in URLs are trusted by developers and mutable by attackers. In corporate banking, that mismatch moves money. Identify the MITRE ATT&CK technique used when authenticated users abuse a public-facing endpoint.",
    tools: ["reference"],
    objectives: [
      { id: "o-m14-03-tid", label: "Submit ATT&CK technique", type: "finding", key: "attackTechniqueId", hint: "T1190" },
      { id: "o-m14-03-tac", label: "Submit the parent tactic", type: "finding", key: "attackTactic", hint: "initial-access" },
    ],
    findingFields: [
      { key: "attackTechniqueId", label: "Technique ID", placeholder: "T1190" },
      { key: "attackTactic", label: "Tactic", placeholder: "initial-access" },
    ],
  },
  {
    id: "lab-m14-input",
    moduleId: "m14",
    slug: "input-validation-assessment",
    title: "LAB-14-04 · AI-Guided Input Validation Assessment",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "Transfer reference field (reflected input)",
    scenario:
      "GFS-WEBAPP-004 · The transfer reference field reflects unencoded input. Craft a reflected XSS payload (must trigger JS execution) that demonstrates the missing output-encoding on a banking form.",
    tools: ["reference"],
    objectives: [
      { id: "o-m14-04-x", label: "Submit a reflected XSS payload", type: "finding", key: "xssPayload", hint: "<script>, onerror=, javascript:, etc." },
    ],
    findingFields: [
      { key: "xssPayload", label: "XSS payload", placeholder: "<script>alert(1)</script>" },
    ],
  },
  {
    id: "lab-m14-buslogic",
    moduleId: "m14",
    slug: "business-logic-assessment",
    title: "LAB-14-05 · Business Logic Assessment",
    kind: "terminal",
    difficulty: "advanced",
    estMinutes: 30,
    target: "Transfer + Approval workflow (Corporate Banking)",
    scenario:
      "GFS-WEBAPP-005 · A manager approves his own payment — dual-control defeated. Business-logic flaws pass every scanner because the payload is legal. Map this workflow abuse to the Cyber Kill Chain phase where the attacker acts on their objective.",
    tools: ["reference"],
    objectives: [
      { id: "o-m14-05-kc", label: "Submit the Cyber Kill Chain phase", type: "finding", key: "killChainPhase", hint: "actions" },
    ],
    findingFields: [
      { key: "killChainPhase", label: "Kill-chain phase", placeholder: "actions" },
    ],
  },

  /* ═════════════ Module 15 — Enterprise Database Security Assessment ═════════════ */
  {
    id: "lab-m15-authquery",
    moduleId: "m15",
    slug: "authentication-query-assessment",
    title: "LAB-15-01 · Authentication Query Assessment",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "AuthDAO.checkLogin() concatenated query",
    scenario:
      "GFS-DB-001 · The login query is the highest-value single query in the bank. Submit a tautology payload that bypasses `WHERE user='X' AND pass='Y'` to prove the concatenated query is an authentication bypass.",
    tools: ["reference"],
    objectives: [
      { id: "o-m15-01-p", label: "Submit tautology SQLi payload", type: "finding", key: "sqliPayload", hint: "must include OR 1=1 or '--" },
    ],
    findingFields: [
      { key: "sqliPayload", label: "SQLi payload", placeholder: "' OR 1=1 -- " },
    ],
  },
  {
    id: "lab-m15-customerdb",
    moduleId: "m15",
    slug: "customer-database-assessment",
    title: "LAB-15-02 · Customer Database Assessment",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 25,
    target: "products.php?id= → information_schema → customer.*",
    scenario:
      "GFS-DB-002 · Once a query surface accepts injection, the attacker enumerates the DB and reaches PII tables. Submit the SQL keyword used to discover column count for UNION-based extraction, plus a valid UNION payload.",
    tools: ["reference"],
    objectives: [
      { id: "o-m15-02-k", label: "Submit the enumeration keyword", type: "finding", key: "sqlKeyword", hint: "UNION" },
      { id: "o-m15-02-p", label: "Submit a UNION-based payload", type: "finding", key: "sqliPayload", hint: "must contain UNION SELECT" },
    ],
    findingFields: [
      { key: "sqlKeyword", label: "Keyword", placeholder: "UNION" },
      { key: "sqliPayload", label: "UNION payload", placeholder: "' UNION SELECT null,version()-- " },
    ],
  },
  {
    id: "lab-m15-blind",
    moduleId: "m15",
    slug: "blind-sql-assessment",
    title: "LAB-15-03 · Blind SQL Assessment",
    kind: "terminal",
    difficulty: "advanced",
    estMinutes: 30,
    target: "/api/orders?id= (no response body reflection)",
    scenario:
      "GFS-DB-003 · Blind SQLi returns no data — the attacker infers content bit-by-bit via boolean or time signals. Submit a boolean-based blind payload demonstrating the exploit primitive.",
    tools: ["reference"],
    objectives: [
      { id: "o-m15-03-p", label: "Submit blind SQLi payload", type: "finding", key: "sqliPayload", hint: "e.g. ' AND 1=1 --" },
    ],
    findingFields: [
      { key: "sqliPayload", label: "Blind SQLi payload", placeholder: "' AND 1=1 -- " },
    ],
  },
  {
    id: "lab-m15-secure",
    moduleId: "m15",
    slug: "secure-query-assessment",
    title: "LAB-15-04 · Secure Query Assessment",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    target: "Remediated /api/orders (prepared statements + WAF)",
    scenario:
      "GFS-DB-004 · Prove the remediation actually removes the vulnerability class. Identify the MITRE ATT&CK technique that the prepared-statement + WAF stack defeats.",
    tools: ["reference"],
    objectives: [
      { id: "o-m15-04-tid", label: "Submit ATT&CK technique defeated", type: "finding", key: "attackTechniqueId", hint: "T1190" },
      { id: "o-m15-04-tac", label: "Submit the parent tactic", type: "finding", key: "attackTactic", hint: "initial-access" },
    ],
    findingFields: [
      { key: "attackTechniqueId", label: "Technique ID", placeholder: "T1190" },
      { key: "attackTactic", label: "Tactic", placeholder: "initial-access" },
    ],
  },
  {
    id: "lab-m15-incident",
    moduleId: "m15",
    slug: "database-incident-investigation",
    title: "LAB-15-05 · Database Incident Investigation",
    kind: "challenge",
    difficulty: "advanced",
    estMinutes: 35,
    target: "Customer DB breach — post-incident evidence pack",
    scenario:
      "GFS-DB-005 · A customer-DB breach has been declared and you are the lead responder. Reconstruct the timeline, identify the root cause, and submit the Cyber Kill Chain phase where the attacker acted on their objective (data exfiltration).",
    tools: ["reference"],
    objectives: [
      { id: "o-m15-05-kc", label: "Submit the Cyber Kill Chain phase", type: "finding", key: "killChainPhase", hint: "actions" },
      { id: "o-m15-05-tid", label: "Submit exfiltration ATT&CK technique", type: "finding", key: "attackTechniqueId", hint: "T1213 (Data from Information Repositories)" },
      { id: "o-m15-05-tac", label: "Submit the tactic", type: "finding", key: "attackTactic", hint: "collection" },
    ],
    findingFields: [
      { key: "killChainPhase", label: "Kill-chain phase", placeholder: "actions" },
      { key: "attackTechniqueId", label: "Technique ID", placeholder: "T1213" },
      { key: "attackTactic", label: "Tactic", placeholder: "collection" },
    ],
  },

  /* ═════════════ Module 16 — Wireless Security Assessment ═════════════ */
  {
    id: "lab-m16-survey",
    moduleId: "m16",
    slug: "enterprise-wireless-survey",
    title: "LAB-16-01 · Enterprise Wireless Survey",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "GFS-Corp / GFS-Guest / GFS-Legacy SSIDs",
    scenario:
      "GFS-WIFI-001 · Wireless coverage extends beyond the walls. Passive-scan the corporate estate and submit the algorithm used to derive the PMK from a WPA2 passphrase (baseline security posture).",
    tools: ["reference"],
    objectives: [
      { id: "o-m16-01-a", label: "Submit PMK derivation algorithm", type: "finding", key: "pmkAlgo", hint: "pbkdf2 family" },
      { id: "o-m16-01-m", label: "Submit 4-way handshake message count", type: "finding", key: "handshakeMessages", hint: "integer" },
    ],
    findingFields: [
      { key: "pmkAlgo", label: "PMK algorithm", placeholder: "PBKDF2-SHA1" },
      { key: "handshakeMessages", label: "Handshake messages", placeholder: "4" },
    ],
  },
  {
    id: "lab-m16-auth",
    moduleId: "m16",
    slug: "wireless-authentication-assessment",
    title: "LAB-16-02 · Wireless Authentication Assessment",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 25,
    target: "GFS-Corp SSID · WPA2-Enterprise / EAP-TLS",
    scenario:
      "GFS-WIFI-002 · Corporate wireless must authenticate users, not devices. Identify the MITRE ATT&CK technique used by an evil-twin AP that harvests corporate credentials when supplicants skip RADIUS certificate validation.",
    tools: ["reference"],
    objectives: [
      { id: "o-m16-02-tid", label: "Submit ATT&CK technique (adversary in the middle)", type: "finding", key: "attackTechniqueId", hint: "T1557" },
      { id: "o-m16-02-tac", label: "Submit the parent tactic", type: "finding", key: "attackTactic", hint: "credential-access" },
    ],
    findingFields: [
      { key: "attackTechniqueId", label: "Technique ID", placeholder: "T1557" },
      { key: "attackTactic", label: "Tactic", placeholder: "credential-access" },
    ],
  },
  {
    id: "lab-m16-rogue",
    moduleId: "m16",
    slug: "rogue-ap-assessment",
    title: "LAB-16-03 · Rogue AP Assessment",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 25,
    target: "Unauthorised AP broadcasting GFS-Corp SSID",
    scenario:
      "GFS-WIFI-003 · An unauthorised AP inside the bank is a covert MITM. Execute the response workflow (discover → validate → investigate → contain → report) and identify the MITRE ATT&CK technique for physical hardware additions.",
    tools: ["reference"],
    objectives: [
      { id: "o-m16-03-tid", label: "Submit ATT&CK technique (hardware additions)", type: "finding", key: "attackTechniqueId", hint: "T1200" },
      { id: "o-m16-03-tac", label: "Submit the parent tactic", type: "finding", key: "attackTactic", hint: "initial-access" },
    ],
    findingFields: [
      { key: "attackTechniqueId", label: "Technique ID", placeholder: "T1200" },
      { key: "attackTactic", label: "Tactic", placeholder: "initial-access" },
    ],
  },
  {
    id: "lab-m16-traffic",
    moduleId: "m16",
    slug: "wireless-traffic-assessment",
    title: "LAB-16-04 · Wireless Traffic Assessment",
    kind: "terminal",
    difficulty: "advanced",
    estMinutes: 25,
    target: "Beacon · Probe · Association · 4-way Handshake · CCMP",
    scenario:
      "GFS-WIFI-004 · Frame-level inspection reveals whether MFP is enforced, how handshakes complete, and whether encryption meets baseline. Submit the message count for a WPA2 4-way handshake and the PMK derivation algorithm.",
    tools: ["reference"],
    objectives: [
      { id: "o-m16-04-m", label: "Submit 4-way handshake message count", type: "finding", key: "handshakeMessages", hint: "integer" },
      { id: "o-m16-04-a", label: "Submit PMK derivation algorithm", type: "finding", key: "pmkAlgo", hint: "pbkdf2 family" },
    ],
    findingFields: [
      { key: "handshakeMessages", label: "Handshake messages", placeholder: "4" },
      { key: "pmkAlgo", label: "PMK algorithm", placeholder: "PBKDF2-SHA1" },
    ],
  },
  {
    id: "lab-m16-review",
    moduleId: "m16",
    slug: "wireless-security-review",
    title: "LAB-16-05 · Enterprise Wireless Security Review",
    kind: "challenge",
    difficulty: "advanced",
    estMinutes: 40,
    target: "Consolidated GFS wireless estate",
    scenario:
      "GFS-WIFI-005 · Consolidate the survey, auth, rogue-AP and traffic assessments into an audit report. Demonstrate the offline-crack primitive against a captured hash by running `crack 5f4dcc3b5aa765d61d8327deb882cf99`, then submit the recovered passphrase.",
    tools: ["crack"],
    objectives: [
      { id: "o-m16-05-c", label: "Run the dictionary crack", type: "command", tool: "crack", argMatch: "5f4dcc3b5aa765d61d8327deb882cf99" },
      { id: "o-m16-05-pw", label: "Submit the recovered passphrase", type: "finding", key: "crackedPassword" },
      { id: "o-m16-05-a", label: "Submit PMK derivation algorithm", type: "finding", key: "pmkAlgo", hint: "pbkdf2 family" },
    ],
    findingFields: [
      { key: "crackedPassword", label: "Recovered passphrase", placeholder: "the cleartext word" },
      { key: "pmkAlgo", label: "PMK algorithm", placeholder: "PBKDF2-SHA1" },
    ],
  },

  /* ═════════════ Module 17 — Hacking Mobile Platforms ═════════════ */
  {
    id: "lab-m17-android",
    moduleId: "m17",
    slug: "android-permissions",
    title: "Android — Dangerous Permission ID",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    scenario:
      "Submit one Android permission classified as dangerous, in canonical form (android.permission.X).",
    target: "AndroidManifest.xml",
    tools: ["reference"],
    objectives: [
      { id: "o-m17-p", label: "Submit a dangerous permission", type: "finding", key: "androidPermission", hint: "android.permission.XXX" },
    ],
    findingFields: [
      { key: "androidPermission", label: "Permission", placeholder: "e.g. android.permission.READ_SMS" },
    ],
  },

  /* ═════════════════ Module 18 — IoT and OT Hacking ═════════════════ */
  {
    id: "lab-m18-mqtt",
    moduleId: "m18",
    slug: "mqtt-port-id",
    title: "MQTT — Protocol Footprint",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 10,
    scenario:
      "Submit the default MQTT TCP port and the default MQTT-over-TLS port.",
    target: "MQTT broker (default port)",
    tools: ["reference"],
    objectives: [
      { id: "o-m18-p1", label: "Submit MQTT plaintext port", type: "finding", key: "mqttPort", hint: "integer" },
      { id: "o-m18-p2", label: "Submit MQTT TLS port", type: "finding", key: "mqttTlsPort", hint: "integer" },
    ],
    findingFields: [
      { key: "mqttPort", label: "MQTT plaintext", placeholder: "1883" },
      { key: "mqttTlsPort", label: "MQTT over TLS", placeholder: "8883" },
    ],
  },

  /* ═══════════════════ Module 19 — Cloud Computing ═══════════════════ */
  {
    id: "lab-m19-s3",
    moduleId: "m19",
    slug: "s3-bucket-recon",
    title: "AWS S3 — Bucket Subdomain Recon",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    target: "s3.amazonaws.com",
    scenario:
      "S3 buckets resolve via *.s3.amazonaws.com. Submit the AWS S3 website-endpoint suffix pattern.",
    tools: ["reference"],
    objectives: [
      { id: "o-m19-s", label: "Submit S3 endpoint suffix", type: "finding", key: "s3Suffix", hint: "starts with s3" },
    ],
    findingFields: [
      { key: "s3Suffix", label: "S3 endpoint suffix", placeholder: "s3.amazonaws.com" },
    ],
  },
  {
    id: "lab-m19-imds",
    moduleId: "m19",
    slug: "imds-attack-path",
    title: "Cloud Metadata — IMDS Endpoint",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 10,
    scenario:
      "SSRF into a cloud workload pivots through the metadata service. Submit the AWS IMDS link-local IP address.",
    target: "AWS EC2 IMDSv1 (169.254.169.254)",
    tools: ["reference"],
    objectives: [
      { id: "o-m19-i", label: "Submit IMDS IP", type: "finding", key: "imdsIp", hint: "169.254.x.x" },
    ],
    findingFields: [
      { key: "imdsIp", label: "IMDS IP", placeholder: "169.254.169.254" },
    ],
  },

  /* ═══════════════════ Module 20 — Cryptography ═══════════════════ */
  {
    id: "lab-m20-hash",
    moduleId: "m20",
    slug: "hash-derivation",
    title: "Hashing — MD5/SHA1/SHA256 Side-by-Side",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    scenario:
      "Run `hash md5 hello`, `hash sha1 hello`, `hash sha256 hello`. Submit the SHA-256 digest of `hello`.",
    target: "Password string: \"password\"",
    tools: ["hash"],
    objectives: [
      { id: "o-m20-md5", label: "Compute md5", type: "command", tool: "hash", argMatch: "md5" },
      { id: "o-m20-sha1", label: "Compute sha1", type: "command", tool: "hash", argMatch: "sha1" },
      { id: "o-m20-sha256", label: "Compute sha256", type: "command", tool: "hash", argMatch: "sha256" },
      { id: "o-m20-d", label: "Submit SHA-256(hello) digest", type: "finding", key: "helloSha256" },
    ],
    findingFields: [
      { key: "helloSha256", label: "SHA-256(hello)", placeholder: "64 hex chars" },
    ],
  },
  {
    id: "lab-m20-xor",
    moduleId: "m20",
    slug: "xor-cipher",
    title: "Symmetric Cipher — XOR Toy",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    scenario:
      "Run `xor key=shadow ciphertext_hex=...` to recover plaintext from an XOR-encrypted message. Submit the recovered plaintext (lowercase).",
    target: "XOR-encrypted hex ciphertext",
    tools: ["xor"],
    objectives: [
      { id: "o-m20-x", label: "Run xor decrypt", type: "command", tool: "xor", argMatch: "shadow" },
      { id: "o-m20-pt", label: "Submit recovered plaintext", type: "finding", key: "xorPlaintext", hint: "lowercase string `xlab is fun`" },
    ],
    findingFields: [
      { key: "xorPlaintext", label: "Plaintext", placeholder: "lowercase" },
    ],
  },

  /* ══════════════ Supplementary labs (M03–M16 depth) ══════════════ */

  /* Module 03 — historical exposure */
  {
    id: "lab-m03-wayback",
    moduleId: "m03",
    slug: "historical-exposure",
    title: "Historical Exposure — Wayback Snapshots",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    target: "scanme.nmap.org",
    scenario:
      "Old snapshots often expose staging pages and forgotten admin endpoints. Run `wayback scanme.nmap.org` and submit a subdomain or path seen in the archive.",
    tools: ["wayback", "subs"],
    objectives: [
      { id: "o-m03-wb", label: "Query the Wayback archive", type: "command", tool: "wayback", argMatch: "scanme.nmap.org" },
      { id: "o-m03-wbs", label: "Submit one archived subdomain", type: "finding", key: "subdomain" },
    ],
    findingFields: [
      { key: "subdomain", label: "Archived subdomain", placeholder: "e.g. scanme.nmap.org" },
    ],
  },

  /* Module 04 — MX / NS enumeration */
  {
    id: "lab-m04-mx",
    moduleId: "m04",
    slug: "mx-ns-enumeration",
    title: "Mail & Nameserver Enumeration",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    target: "google.com",
    scenario:
      "Mail and NS records reveal the operational providers behind a domain. Query MX for google.com and submit one MX host.",
    tools: ["dig"],
    objectives: [
      { id: "o-m04-mx-run", label: "Query MX records", type: "command", tool: "dig", argMatch: "mx" },
      { id: "o-m04-mx-h", label: "Submit an MX host", type: "finding", key: "mx" },
      { id: "o-m04-ns-run", label: "Query NS records", type: "command", tool: "dig", argMatch: "ns" },
      { id: "o-m04-ns-h", label: "Submit an NS host", type: "finding", key: "ns" },
    ],
    findingFields: [
      { key: "mx", label: "MX host", placeholder: "e.g. smtp.google.com" },
      { key: "ns", label: "NS host", placeholder: "e.g. ns1.google.com" },
    ],
  },

  /* Module 05 — kill-chain mapping */
  {
    id: "lab-m05-killchain",
    moduleId: "m05",
    slug: "vuln-to-killchain",
    title: "Map a CVE to a Kill-Chain Phase",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    target: "log4j",
    scenario:
      "Vulnerability triage isn't just CVSS — you must know *where* an attacker will use it. Look up `cve log4j` and submit the CVE-ID plus the kill-chain phase it enables.",
    tools: ["cve"],
    objectives: [
      { id: "o-m05-kc-run", label: "Search NVD for log4j", type: "command", tool: "cve", argMatch: "log4j" },
      { id: "o-m05-kc-id", label: "Submit CVE-ID", type: "finding", key: "cveId" },
      { id: "o-m05-kc-ph", label: "Submit kill-chain phase", type: "finding", key: "killChainPhase", hint: "recon|weaponization|delivery|exploitation|installation|c2|actions" },
    ],
    findingFields: [
      { key: "cveId", label: "CVE-ID", placeholder: "CVE-YYYY-NNNN" },
      { key: "killChainPhase", label: "Kill-chain phase", placeholder: "e.g. exploitation" },
    ],
  },

  /* Module 07 — MITRE ATT&CK technique for malware */
  {
    id: "lab-m07-attack",
    moduleId: "m07",
    slug: "malware-attack-technique",
    title: "Malware → MITRE ATT&CK Technique",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    scenario:
      "Detection engineering pivots on MITRE ATT&CK IDs, not malware names. Submit the ATT&CK technique ID for `Command and Scripting Interpreter` and the parent tactic.",
    target: "Emotet/TrickBot behaviour",
    tools: ["reference"],
    objectives: [
      { id: "o-m07-tid", label: "Submit ATT&CK technique ID", type: "finding", key: "attackTechniqueId", hint: "format T####[.###]" },
      { id: "o-m07-tac", label: "Submit ATT&CK tactic", type: "finding", key: "attackTactic", hint: "e.g. execution" },
    ],
    findingFields: [
      { key: "attackTechniqueId", label: "Technique ID", placeholder: "e.g. T1059" },
      { key: "attackTactic", label: "Tactic", placeholder: "e.g. execution" },
    ],
  },

  /* Module 09 — SPF qualifier hardening */
  {
    id: "lab-m09-spf-qual",
    moduleId: "m09",
    slug: "spf-qualifier",
    title: "SPF Qualifier — Hard vs Soft Fail",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    target: "google.com",
    scenario:
      "SPF ends in an `all` qualifier that decides how forged mail is treated. Query TXT for google.com and submit the qualifier used at the end of the SPF record.",
    tools: ["dig"],
    objectives: [
      { id: "o-m09-sq-run", label: "Query TXT records", type: "command", tool: "dig", argMatch: "txt" },
      { id: "o-m09-sq-q", label: "Submit SPF all-qualifier", type: "finding", key: "spfQualifier", hint: "~all | -all | ?all | +all" },
    ],
    findingFields: [
      { key: "spfQualifier", label: "SPF qualifier", placeholder: "e.g. ~all" },
    ],
  },

  /* Module 10 — amplification: NTP / memcached */
  {
    id: "lab-m10-ntp",
    moduleId: "m10",
    slug: "ntp-amplification",
    title: "NTP monlist — Classic Amplifier",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 15,
    scenario:
      "The NTP `monlist` query is a textbook amplifier used in the 400 Gbps CloudFlare-era attacks. Submit the protocol name and a typical amplification factor for it.",
    target: "Open NTP server (UDP/123)",
    tools: ["reference"],
    objectives: [
      { id: "o-m10-ntp-pr", label: "Submit amplifier protocol", type: "finding", key: "ampProtocol", hint: "ntp" },
      { id: "o-m10-ntp-af", label: "Submit NTP amplification factor (~)", type: "finding", key: "ampFactor", hint: "integer 20–80" },
    ],
    findingFields: [
      { key: "ampProtocol", label: "Protocol", placeholder: "ntp" },
      { key: "ampFactor", label: "Amplification factor", placeholder: "e.g. 55" },
    ],
  },
  {
    id: "lab-m10-methods",
    moduleId: "m10",
    slug: "verb-abuse-dos",
    title: "Verb Abuse — Slow / Costly Methods",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    target: "httpbin.org",
    scenario:
      "Attackers pick verbs that force expensive server-side work. Run `methods httpbin.org` and submit one risky method advertised (PUT/DELETE/TRACE/CONNECT/PATCH).",
    tools: ["methods"],
    objectives: [
      { id: "o-m10-m-run", label: "Probe HTTP methods", type: "command", tool: "methods", argMatch: "httpbin.org" },
      { id: "o-m10-m-risk", label: "Submit a risky method", type: "finding", key: "riskyMethod" },
    ],
    findingFields: [
      { key: "riskyMethod", label: "Risky method", placeholder: "e.g. TRACE" },
    ],
  },

  /* Module 12 — evasion via historical intel */
  {
    id: "lab-m12-wayback",
    moduleId: "m12",
    slug: "waf-bypass-recon",
    title: "Recon Around the WAF — Archived Endpoints",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 20,
    target: "github.com",
    scenario:
      "When the WAF blocks direct enumeration, historical archives still remember. Run `wayback github.com` and submit one archived subdomain or path that would be interesting to re-probe.",
    tools: ["wayback"],
    objectives: [
      { id: "o-m12-wb", label: "Query the Wayback archive", type: "command", tool: "wayback", argMatch: "github.com" },
      { id: "o-m12-wbs", label: "Submit one archived subdomain", type: "finding", key: "subdomain" },
    ],
    findingFields: [
      { key: "subdomain", label: "Archived host", placeholder: "e.g. gist.github.com" },
    ],
  },
  /* Modules 13–16 are covered by the LAB-13-01 → LAB-16-05 Assessment
   * Workflow suite defined earlier in this file. Legacy supplementary
   * labs were consolidated to avoid duplication. */
];

export const getLab = (slug: string) => LABS.find(l => l.slug === slug);
export const getModuleLabs = (moduleId: string) => LABS.filter(l => l.moduleId === moduleId);
