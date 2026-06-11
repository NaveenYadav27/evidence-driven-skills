// Lab catalog. Each lab declares objectives that must be satisfied by REAL
// telemetry events (commands executed, findings submitted) before completion
// is awarded. No manual "Mark Complete" buttons anywhere.

export type LabKind = "terminal" | "challenge";

export interface LabObjective {
  id: string;
  label: string;
  // A command-pattern objective is satisfied when a matching tool+arg is
  // successfully executed. A finding objective requires a submitted finding
  // whose normalized value matches `expect`.
  type: "command" | "finding";
  tool?: string;                  // for "command"
  argMatch?: string;              // substring required in args, e.g. domain
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
  target?: string;                // e.g. acme-training.local / example.com
  tools: string[];
  objectives: LabObjective[];
  findingFields?: { key: string; label: string; placeholder?: string; help?: string }[];
}

// Module 02 — Footprinting & Reconnaissance
export const LABS: Lab[] = [
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
      { key: "mx", label: "Primary MX hostname", placeholder: "e.g. mail.example.com", help: "Lowercase; the host with lowest preference." },
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
      "Operational target swap: your training tenant 'acme-training.local' has no public surface. Run the same recon playbook against cloudflare.com and submit the registrar, primary nameserver, and primary MX. All three must validate to clear the challenge.",
    tools: ["whois", "dig"],
    objectives: [
      { id: "c-whois", label: "Run whois on the target", type: "command", tool: "whois", argMatch: "cloudflare.com" },
      { id: "c-ns", label: "Query NS records", type: "command", tool: "dig", argMatch: "ns" },
      { id: "c-mx", label: "Query MX records", type: "command", tool: "dig", argMatch: "mx" },
      { id: "c-registrar", label: "Submit Registrar", type: "finding", key: "registrar" },
      { id: "c-ns-host", label: "Submit a valid Nameserver", type: "finding", key: "ns" },
      { id: "c-mx-host", label: "Submit primary MX hostname", type: "finding", key: "mx" },
    ],
    findingFields: [
      { key: "registrar", label: "Registrar Name", placeholder: "exact value from WHOIS" },
      { key: "ns", label: "Authoritative Nameserver", placeholder: "e.g. ns1.example.com" },
      { key: "mx", label: "Primary MX hostname", placeholder: "e.g. mail.example.com" },
    ],
  },
];

export const getLab = (slug: string) => LABS.find(l => l.slug === slug);
export const getModuleLabs = (moduleId: string) => LABS.filter(l => l.moduleId === moduleId);
