import { ReactNode, useMemo } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

// Module 02 glossary. Keys are matched case-insensitively as whole tokens.
// Use the longest, most specific phrase as the key — matcher prefers longer matches first.
// Optional `attackerValue` (what an attacker gains) and `impact` (Low/Medium/High/Critical)
// render as a "How attackers value this" block in the hover card.
export type ImpactLevel = "Low" | "Medium" | "High" | "Critical";
type Entry = { title: string; def: string; why?: string; attackerValue?: string; impact?: ImpactLevel };

export const M02_GLOSSARY: Record<string, Entry> = {
  "WHOIS": {
    title: "WHOIS",
    def: "Public registration lookup for a domain — registrar, registrant org/contact, name servers, creation & expiry dates.",
    why: "Named admins and corporate emails fuel targeted phishing; expiry dates flag domain-hijack windows.",
    attackerValue: "Free target list of admins + a hijack window when the domain expires.",
    impact: "Medium",
  },
  "RDAP": {
    title: "RDAP",
    def: "Registration Data Access Protocol — the modern, structured JSON replacement for WHOIS.",
    why: "Machine-readable, rate-limited, and authoritative — the right API for automated recon.",
    attackerValue: "Same data as WHOIS but scriptable across thousands of domains.",
    impact: "Low",
  },
  "crt.sh": {
    title: "crt.sh (Certificate Transparency)",
    def: "Public search over Certificate Transparency logs: every TLS cert issued for a domain is permanently logged.",
    why: "Reveals shadow subdomains (dev-*, staging-*, internal-*) the org forgot it owns.",
    attackerValue: "Free, exhaustive subdomain inventory — including pre-prod hosts with weaker controls.",
    impact: "High",
  },
  "Certificate Transparency": {
    title: "Certificate Transparency (CT)",
    def: "Append-only public logs of every TLS certificate issued by participating CAs.",
    why: "An attacker's free subdomain inventory — and a defender's early-warning system.",
    attackerValue: "Persistent, un-removable record of every hostname the org has ever certified.",
    impact: "High",
  },
  "CT logs": {
    title: "Certificate Transparency Logs",
    def: "Append-only public ledgers of every TLS certificate issued by participating CAs.",
    why: "An attacker's free subdomain inventory — and a defender's early-warning system.",
    attackerValue: "Persistent, un-removable record of every hostname the org has ever certified.",
    impact: "High",
  },
  "CMDB": {
    title: "CMDB",
    def: "Configuration Management Database — the org's internal inventory of systems, owners, and dependencies.",
    why: "If CT shows hosts the CMDB doesn't, you've found shadow IT.",
    attackerValue: "Gap between CMDB and CT = unmanaged, unpatched, ownerless hosts — prime initial-access targets.",
    impact: "High",
  },
  "SPF": {
    title: "SPF",
    def: "Sender Policy Framework — DNS TXT record listing which servers may send mail for a domain.",
    why: "`~all` (soft-fail) lets spoofed mail through; `-all` (hard-fail) rejects it.",
    attackerValue: "Weak SPF = direct spoofing of executives without buying a look-alike domain.",
    impact: "High",
  },
  "DKIM": {
    title: "DKIM",
    def: "DomainKeys Identified Mail — cryptographic signature on outbound mail proving it came from the domain.",
    why: "Without DKIM rotation, leaked selectors enable persistent spoofing.",
    attackerValue: "A leaked or weak (≤1024-bit) DKIM key = forged mail that passes auth indefinitely.",
    impact: "High",
  },
  "DMARC": {
    title: "DMARC",
    def: "Policy layered on SPF+DKIM telling receivers what to do with failing mail (none / quarantine / reject) and where to send reports.",
    why: "No DMARC = the org's mail domain is trivially spoofable for BEC and invoice fraud.",
    attackerValue: "p=none or missing DMARC = free, high-deliverability spoofing for invoice fraud and BEC.",
    impact: "Critical",
  },
  "BEC": {
    title: "BEC (Business Email Compromise)",
    def: "Fraud scheme where attackers impersonate executives or vendors via spoofed or look-alike email to redirect payments.",
    why: "Top financial-loss category in IC3 reports for years running.",
    attackerValue: "Six- to seven-figure wire transfers per successful campaign — highest ROI in cybercrime.",
    impact: "Critical",
  },
  "Shodan": {
    title: "Shodan",
    def: "Search engine for internet-connected devices — banners, ports, services, geolocation.",
    why: "Finds exposed RDP, Elasticsearch, MongoDB, and admin panels in seconds.",
    attackerValue: "Pre-indexed list of exposed services with versions — straight to known-CVE exploitation.",
    impact: "High",
  },
  "Censys": {
    title: "Censys",
    def: "Internet-wide scanner indexing certificates, hosts, and services with rich query syntax.",
    why: "Complements Shodan with deeper certificate and host pivoting.",
    attackerValue: "Pivot from one leaked cert to every related host across the org's full IP space.",
    impact: "High",
  },
  "Wayback": {
    title: "Wayback Machine",
    def: "archive.org's historical snapshots of public web pages, queryable via the CDX API.",
    why: "Surfaces removed admin paths, leaked secrets, and prior tech stacks attackers can target today.",
    attackerValue: "Recovers deleted /admin paths, old API keys in JS, and prior endpoints attackers can probe.",
    impact: "Medium",
  },
  "CDX API": {
    title: "Wayback CDX API",
    def: "Bulk endpoint that lists every snapshot Wayback holds for a URL prefix.",
    why: "The right tool for systematic historical recon — not the website UI.",
    attackerValue: "Bulk-diff every snapshot to find the exact day a secret or admin path was committed.",
    impact: "Medium",
  },
  "AXFR": {
    title: "AXFR (DNS Zone Transfer)",
    def: "DNS request to copy an entire zone from an authoritative server.",
    why: "Counts as active recon — and almost always disabled today; an open AXFR is a critical finding.",
    attackerValue: "Complete internal hostname map handed over in one query — devastating recon win.",
    impact: "Critical",
  },
  "ASN": {
    title: "ASN",
    def: "Autonomous System Number — identifier for an IP-routing administrative domain.",
    why: "Maps an org's full network footprint, not just one /24.",
    attackerValue: "Whole-org IP footprint in a single lookup — feeds mass scanning.",
    impact: "Medium",
  },
  "RCE": {
    title: "RCE",
    def: "Remote Code Execution — an attacker runs arbitrary code on a target without prior access.",
    why: "Highest-severity bug class; pre-auth RCE on internet-facing hosts = game over.",
    attackerValue: "Initial foothold without credentials — typically sold for $10k–$1M+ on exploit markets.",
    impact: "Critical",
  },
  "MFA": {
    title: "MFA",
    def: "Multi-Factor Authentication — at least two of: something you know / have / are.",
    why: "Defeats most credential-stuffing and phishing — unless users approve fatigue prompts.",
    attackerValue: "Absence of MFA = stolen password is a working login; presence forces phishing or fatigue.",
    impact: "High",
  },
  "MFA-fatigue": {
    title: "MFA Fatigue",
    def: "Attacker spams push notifications until a tired user approves one.",
    why: "How Uber 2022 fell; fixed by number-matching and rate limits.",
    attackerValue: "Bypasses MFA with zero technical exploit — pure social cost of a phone call.",
    impact: "High",
  },
  "vishing": {
    title: "Vishing",
    def: "Voice phishing — social engineering over the phone, often impersonating IT or vendors.",
    why: "MGM 2023 was a 10-minute vishing call to the helpdesk.",
    attackerValue: "10-minute call → helpdesk-assisted account reset → domain admin in hours.",
    impact: "Critical",
  },
  "registrar privacy": {
    title: "Registrar Privacy",
    def: "WHOIS/RDAP proxy that hides registrant identity behind the registrar's contact details.",
    why: "Removes named admins from the public attack surface.",
    attackerValue: "Without it: named admin emails for direct spear-phishing. With it: dead end.",
    impact: "Medium",
  },
  "registry-lock": {
    title: "Registry Lock",
    def: "Registry-level flag requiring out-of-band confirmation before any change to a domain.",
    why: "Defeats registrar-account takeover — the only reliable defense against high-value domain hijack.",
    attackerValue: "Without it: registrar-account takeover redirects the whole brand. With it: hijack blocked.",
    impact: "Critical",
  },

  // ---------- Common abbreviations ----------
  "CEH": { title: "CEH", def: "Certified Ethical Hacker — EC-Council's offensive-security certification. v13 is the current AI-augmented track." },
  "OSINT": { title: "OSINT", def: "Open-Source Intelligence — information collected from publicly available sources (web, social, public records, DNS, certs).", why: "Footprinting is OSINT applied to a target organization.", attackerValue: "Zero-touch reconnaissance — target never sees the collection.", impact: "Medium" },
  "DNS": { title: "DNS", def: "Domain Name System — translates names to IPs and carries auxiliary records (MX, TXT, SPF, DKIM, DMARC).", attackerValue: "One protocol leaks mail provider, mail-auth posture, ownership proofs, and host inventory.", impact: "Medium" },
  "TLS": { title: "TLS", def: "Transport Layer Security — the encryption protocol behind HTTPS; TLS certificates are logged to Certificate Transparency." },
  "SSL": { title: "SSL", def: "Secure Sockets Layer — the deprecated predecessor to TLS. The term is still used colloquially for 'TLS certificate'." },
  "MX": { title: "MX record", def: "DNS Mail Exchanger record — identifies the mail servers that accept email for a domain.", why: "Reveals the mail provider (Google, Microsoft 365, on-prem) — a phishing-target indicator.", attackerValue: "Tells the attacker which phishing-kit template to use (M365 vs Google login page).", impact: "Low" },
  "TXT": { title: "TXT record", def: "Free-form DNS text record — carries SPF, DKIM, DMARC, domain-ownership proofs, and other metadata." },
  "SOA": { title: "SOA record", def: "Start of Authority — the authoritative metadata record for a DNS zone (primary NS, admin email, serial, refresh timers)." },
  "NS": { title: "NS record", def: "Name Server record — points a zone at its authoritative DNS servers." },
  "CNAME": { title: "CNAME record", def: "Canonical Name — DNS alias from one hostname to another. Stale CNAMEs to deprovisioned cloud resources enable subdomain takeover.", attackerValue: "Dangling CNAME → register the orphaned cloud resource → serve attacker content on the victim's subdomain.", impact: "High" },
  "CA": { title: "CA", def: "Certificate Authority — issues TLS certificates and submits them to Certificate Transparency logs." },
  "CAs": { title: "Certificate Authorities", def: "Issuers of TLS certificates; all major public CAs are required to submit issued certs to CT logs." },
  "IP": { title: "IP", def: "Internet Protocol address — the numeric identifier for a host on the internet (IPv4 / IPv6)." },
  "URL": { title: "URL", def: "Uniform Resource Locator — full address of a web resource (scheme + host + path + query)." },
  "API": { title: "API", def: "Application Programming Interface — a programmatic contract for talking to a service (REST, GraphQL, RPC)." },
  "CVE": { title: "CVE", def: "Common Vulnerabilities and Exposures — the public catalogue of disclosed software vulnerabilities (CVE-YYYY-NNNNN).", why: "Footprinted tech stacks let attackers pivot to known CVEs in minutes.", attackerValue: "Version banner → CVE → public PoC → exploitation, often in the same hour.", impact: "High" },
  "RDP": { title: "RDP", def: "Remote Desktop Protocol — Microsoft's GUI remote-access protocol on TCP/3389.", why: "Internet-exposed RDP is a top initial-access vector; ransomware crews scan for it daily.", attackerValue: "Exposed RDP + leaked creds = ransomware-grade initial access, sold for $200–$10k on access-broker markets.", impact: "Critical" },
  "SMB": { title: "SMB", def: "Server Message Block — Windows file-sharing protocol on TCP/445.", why: "Public SMB shares routinely leak scripts, configs, and credentials.", attackerValue: "Anonymous SMB share → harvested scripts/configs/creds → lateral movement without an exploit.", impact: "Critical" },
  "VPN": { title: "VPN", def: "Virtual Private Network — encrypted tunnel into a private network." },
  "BGP": { title: "BGP", def: "Border Gateway Protocol — the routing protocol between ASNs that runs the public internet." },
  "M&A": { title: "M&A", def: "Mergers & Acquisitions — when one org buys or merges with another.", why: "Acquired entities bring forgotten subdomains, certs, and IP space into the parent's attack surface.", attackerValue: "Acquired company's neglected infra is the easiest path into the parent enterprise.", impact: "High" },
  "CISO": { title: "CISO", def: "Chief Information Security Officer — the executive accountable for an organization's security program." },
  "DoS": { title: "DoS", def: "Denial of Service — making a system unavailable to legitimate users. Almost always out-of-scope for footprinting engagements." },
  "DDoS": { title: "DDoS", def: "Distributed Denial of Service — DoS launched from many sources at once." },
  "PII": { title: "PII", def: "Personally Identifiable Information — data that can identify a specific person (names, emails, IDs).", attackerValue: "Fuel for spear-phishing, identity fraud, and regulatory-fine extortion.", impact: "High" },
  "FCA": { title: "FCA", def: "Financial Conduct Authority — UK financial-services regulator with breach-notification powers." },
  "IC3": { title: "IC3", def: "FBI Internet Crime Complaint Center — publishes annual cybercrime loss statistics." },
  "GSuite": { title: "GSuite / Google Workspace", def: "Google's enterprise productivity suite (Gmail, Drive, Calendar, Admin). Renamed Google Workspace in 2020." },
  "vSphere": { title: "vSphere", def: "VMware's enterprise virtualization platform — compromise typically means full datacenter takeover.", attackerValue: "One vCenter compromise = every VM in the datacenter; favourite ransomware target.", impact: "Critical" },
};

const IMPACT_STYLES: Record<ImpactLevel, string> = {
  Low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  High: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  Critical: "bg-red-500/20 text-red-300 border-red-500/40",
};

// Build a single regex matching any glossary key as a whole token.
const KEYS = Object.keys(M02_GLOSSARY).sort((a, b) => b.length - a.length);
const ESCAPED = KEYS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const PATTERN = new RegExp(`\\b(${ESCAPED.join("|")})\\b`, "gi");

function findKey(match: string): string | null {
  const lower = match.toLowerCase();
  for (const k of KEYS) if (k.toLowerCase() === lower) return k;
  return null;
}

export function Term({ children, term }: { children: ReactNode; term?: string }) {
  const key = term ?? (typeof children === "string" ? findKey(children) : null);
  const entry = key ? M02_GLOSSARY[key] : null;
  if (!entry) return <>{children}</>;
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <span
          tabIndex={0}
          className="underline decoration-dotted decoration-[var(--cyan)]/70 underline-offset-4 text-[var(--cyan)]/90 cursor-help focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cyan)] rounded-sm"
        >
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 border-[var(--cyan)]/30">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-sm font-semibold text-[var(--cyan)]">{entry.title}</div>
          {entry.impact && (
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${IMPACT_STYLES[entry.impact]}`}
              aria-label={`Impact level ${entry.impact}`}
            >
              {entry.impact}
            </span>
          )}
        </div>
        <div className="text-xs text-foreground leading-relaxed">{entry.def}</div>
        {entry.attackerValue && (
          <div className="mt-2 text-xs leading-relaxed border-t border-border pt-2">
            <span className="text-red-300/90 font-semibold">Attacker value · </span>
            <span className="text-foreground/90">{entry.attackerValue}</span>
          </div>
        )}
        {entry.why && (
          <div className="mt-2 text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">
            <span className="text-[var(--cyan)]/80 font-semibold">Why it matters · </span>{entry.why}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

/** Auto-wrap glossary terms inside a plain text string. */
export function TermText({ children, className }: { children: string; className?: string }) {
  const parts = useMemo(() => {
    const text = children ?? "";
    const out: ReactNode[] = [];
    let last = 0;
    PATTERN.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = PATTERN.exec(text)) !== null) {
      if (m.index > last) out.push(text.slice(last, m.index));
      const key = findKey(m[0]);
      out.push(
        key
          ? <Term key={`${m.index}-${m[0]}`} term={key}>{m[0]}</Term>
          : m[0]
      );
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }, [children]);
  return <span className={className}>{parts}</span>;
}
