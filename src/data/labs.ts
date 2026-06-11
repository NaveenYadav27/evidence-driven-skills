// Lab catalog. Each lab declares objectives that must be satisfied by REAL
// telemetry events (commands executed, findings submitted) before completion
// is awarded. No manual "Mark Complete" buttons anywhere.

export type LabKind = "terminal" | "challenge";

export interface LabObjective {
  id: string;
  label: string;
  type: "command" | "finding";
  tool?: string;                  // for "command"
  argMatch?: string;              // substring required in args
  key?: string;                   // for "finding"
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
  /* ──────────── Module 02 — Footprinting & Reconnaissance ──────────── */
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
      { key: "createdYear", label: "Domain Creation Year", placeholder: "e.g. 1995", help: "4-digit year from the Creation Date." },
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
      "Every TLS certificate ever issued for a domain is logged publicly in Certificate Transparency. Use `subs owasp.org` to harvest the subdomain attack surface, then submit one verified subdomain plus the total unique count you observed.",
    tools: ["subs"],
    objectives: [
      { id: "o-subs-run", label: "Run subs against owasp.org", type: "command", tool: "subs", argMatch: "owasp.org" },
      { id: "o-subs-count", label: "Submit count of unique subdomains found", type: "finding", key: "subdomainCount", hint: "integer ≥ 1" },
      { id: "o-subs-one", label: "Submit one valid subdomain (must end in owasp.org)", type: "finding", key: "subdomain" },
    ],
    findingFields: [
      { key: "subdomainCount", label: "Unique subdomain count", placeholder: "e.g. 47" },
      { key: "subdomain", label: "A discovered subdomain", placeholder: "e.g. wiki.owasp.org", help: "Must be present in the CT logs we pulled." },
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
    scenario:
      "Sites leak old admin paths, dev URLs and legacy stacks in archived snapshots. Use `wayback mit.edu` to enumerate Internet Archive snapshots and submit the year of the first capture.",
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
    title: "Challenge — Recon Brief: acme-training.local",
    kind: "challenge",
    difficulty: "intermediate",
    estMinutes: 30,
    target: "cloudflare.com",
    scenario:
      "Operational target swap: your training tenant 'acme-training.local' has no public surface. Run the full recon playbook against cloudflare.com and submit the registrar, primary nameserver, primary MX, and one CT-discovered subdomain. All must validate against live data to clear the challenge.",
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

  /* ──────────────── Module 13 — Hacking Web Servers ──────────────── */
  {
    id: "lab-m13-headers",
    moduleId: "m13",
    slug: "security-headers-audit",
    title: "Security Header Audit",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 20,
    target: "example.com",
    scenario:
      "A misconfigured web server quietly leaks its tech stack and skips defence-in-depth headers like HSTS, CSP, X-Frame-Options. Use `headers example.com` to audit the target and submit (a) the Server header and (b) whether HSTS is present.",
    tools: ["headers"],
    objectives: [
      { id: "o-h-run", label: "Run headers against example.com", type: "command", tool: "headers", argMatch: "example.com" },
      { id: "o-h-server", label: "Submit the Server header value", type: "finding", key: "serverHeader" },
      { id: "o-h-hsts", label: "Submit HSTS presence (present / missing)", type: "finding", key: "hstsPresent", hint: "answer: present | missing" },
    ],
    findingFields: [
      { key: "serverHeader", label: "Server header", placeholder: "e.g. nginx", help: "Case-insensitive substring match." },
      { key: "hstsPresent", label: "HSTS header present?", placeholder: "present | missing" },
    ],
  },
  {
    id: "lab-m13-robots",
    moduleId: "m13",
    slug: "robots-intelligence",
    title: "robots.txt — Forbidden Path Intelligence",
    kind: "terminal",
    difficulty: "beginner",
    estMinutes: 15,
    target: "wikipedia.org",
    scenario:
      "Paths an admin wants hidden from search engines often signal admin panels, sensitive endpoints, or staging URLs. Use `robots wikipedia.org` to harvest Disallow entries and submit one verified Disallow path.",
    tools: ["robots"],
    objectives: [
      { id: "o-r-run", label: "Run robots against wikipedia.org", type: "command", tool: "robots", argMatch: "wikipedia.org" },
      { id: "o-r-path", label: "Submit one Disallow path", type: "finding", key: "disallowPath", hint: "Exact path string, e.g. /wiki/Special:Random" },
    ],
    findingFields: [
      { key: "disallowPath", label: "A Disallow path", placeholder: "e.g. /w/" },
    ],
  },
  {
    id: "lab-m13-fingerprint",
    moduleId: "m13",
    slug: "stack-fingerprinting",
    title: "Web Server Stack Fingerprinting",
    kind: "terminal",
    difficulty: "intermediate",
    estMinutes: 25,
    target: "github.com",
    scenario:
      "Combine HTTP header probing with security-header analysis to fingerprint a hardened web server. Run `headers github.com` and report the Server software plus CSP and X-Frame-Options presence.",
    tools: ["headers"],
    objectives: [
      { id: "o-fp-run", label: "Run headers against github.com", type: "command", tool: "headers", argMatch: "github.com" },
      { id: "o-fp-server", label: "Submit Server software", type: "finding", key: "serverHeader" },
      { id: "o-fp-csp", label: "Submit CSP presence (present/missing)", type: "finding", key: "cspPresent" },
      { id: "o-fp-xfo", label: "Submit X-Frame-Options presence", type: "finding", key: "xfoPresent" },
    ],
    findingFields: [
      { key: "serverHeader", label: "Server software", placeholder: "e.g. github.com" },
      { key: "cspPresent", label: "Content-Security-Policy present?", placeholder: "present | missing" },
      { key: "xfoPresent", label: "X-Frame-Options present?", placeholder: "present | missing" },
    ],
  },
  {
    id: "lab-m13-challenge",
    moduleId: "m13",
    slug: "web-server-hardening-challenge",
    title: "Challenge — Hardened vs Exposed",
    kind: "challenge",
    difficulty: "intermediate",
    estMinutes: 35,
    target: "github.com",
    scenario:
      "Compare a hardened server (github.com) against your audit baseline. Pull headers, parse robots.txt, and submit Server header, HSTS presence, CSP presence, and one Disallow path. All four must validate.",
    tools: ["headers", "robots"],
    objectives: [
      { id: "c13-h", label: "Run headers", type: "command", tool: "headers", argMatch: "github.com" },
      { id: "c13-r", label: "Run robots", type: "command", tool: "robots", argMatch: "github.com" },
      { id: "c13-server", label: "Submit Server header", type: "finding", key: "serverHeader" },
      { id: "c13-hsts", label: "Submit HSTS presence", type: "finding", key: "hstsPresent" },
      { id: "c13-csp", label: "Submit CSP presence", type: "finding", key: "cspPresent" },
      { id: "c13-dis", label: "Submit one Disallow path", type: "finding", key: "disallowPath" },
    ],
    findingFields: [
      { key: "serverHeader", label: "Server header", placeholder: "e.g. github.com" },
      { key: "hstsPresent", label: "HSTS present?", placeholder: "present | missing" },
      { key: "cspPresent", label: "CSP present?", placeholder: "present | missing" },
      { key: "disallowPath", label: "A Disallow path", placeholder: "e.g. /gist/" },
    ],
  },
];

export const getLab = (slug: string) => LABS.find(l => l.slug === slug);
export const getModuleLabs = (moduleId: string) => LABS.filter(l => l.moduleId === moduleId);
