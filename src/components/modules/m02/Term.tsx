import { ReactNode, useMemo } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

// Module 02 glossary. Keys are matched case-insensitively as whole tokens.
// Use the longest, most specific phrase as the key — matcher prefers longer matches first.
export const M02_GLOSSARY: Record<string, { title: string; def: string; why?: string }> = {
  "WHOIS": {
    title: "WHOIS",
    def: "Public registration lookup for a domain — registrar, registrant org/contact, name servers, creation & expiry dates.",
    why: "Named admins and corporate emails fuel targeted phishing; expiry dates flag domain-hijack windows.",
  },
  "RDAP": {
    title: "RDAP",
    def: "Registration Data Access Protocol — the modern, structured JSON replacement for WHOIS.",
    why: "Machine-readable, rate-limited, and authoritative — the right API for automated recon.",
  },
  "crt.sh": {
    title: "crt.sh (Certificate Transparency)",
    def: "Public search over Certificate Transparency logs: every TLS cert issued for a domain is permanently logged.",
    why: "Reveals shadow subdomains (dev-*, staging-*, internal-*) the org forgot it owns.",
  },
  "Certificate Transparency": {
    title: "Certificate Transparency (CT)",
    def: "Append-only public logs of every TLS certificate issued by participating CAs.",
    why: "An attacker's free subdomain inventory — and a defender's early-warning system.",
  },
  "CT logs": {
    title: "Certificate Transparency Logs",
    def: "Append-only public ledgers of every TLS certificate issued by participating CAs.",
    why: "An attacker's free subdomain inventory — and a defender's early-warning system.",
  },
  "CMDB": {
    title: "CMDB",
    def: "Configuration Management Database — the org's internal inventory of systems, owners, and dependencies.",
    why: "If CT shows hosts the CMDB doesn't, you've found shadow IT.",
  },
  "SPF": {
    title: "SPF",
    def: "Sender Policy Framework — DNS TXT record listing which servers may send mail for a domain.",
    why: "`~all` (soft-fail) lets spoofed mail through; `-all` (hard-fail) rejects it.",
  },
  "DKIM": {
    title: "DKIM",
    def: "DomainKeys Identified Mail — cryptographic signature on outbound mail proving it came from the domain.",
    why: "Without DKIM rotation, leaked selectors enable persistent spoofing.",
  },
  "DMARC": {
    title: "DMARC",
    def: "Policy layered on SPF+DKIM telling receivers what to do with failing mail (none / quarantine / reject) and where to send reports.",
    why: "No DMARC = the org's mail domain is trivially spoofable for BEC and invoice fraud.",
  },
  "BEC": {
    title: "BEC (Business Email Compromise)",
    def: "Fraud scheme where attackers impersonate executives or vendors via spoofed or look-alike email to redirect payments.",
    why: "Top financial-loss category in IC3 reports for years running.",
  },
  "Shodan": {
    title: "Shodan",
    def: "Search engine for internet-connected devices — banners, ports, services, geolocation.",
    why: "Finds exposed RDP, Elasticsearch, MongoDB, and admin panels in seconds.",
  },
  "Censys": {
    title: "Censys",
    def: "Internet-wide scanner indexing certificates, hosts, and services with rich query syntax.",
    why: "Complements Shodan with deeper certificate and host pivoting.",
  },
  "Wayback": {
    title: "Wayback Machine",
    def: "archive.org's historical snapshots of public web pages, queryable via the CDX API.",
    why: "Surfaces removed admin paths, leaked secrets, and prior tech stacks attackers can target today.",
  },
  "CDX API": {
    title: "Wayback CDX API",
    def: "Bulk endpoint that lists every snapshot Wayback holds for a URL prefix.",
    why: "The right tool for systematic historical recon — not the website UI.",
  },
  "AXFR": {
    title: "AXFR (DNS Zone Transfer)",
    def: "DNS request to copy an entire zone from an authoritative server.",
    why: "Counts as active recon — and almost always disabled today; an open AXFR is a critical finding.",
  },
  "ASN": {
    title: "ASN",
    def: "Autonomous System Number — identifier for an IP-routing administrative domain.",
    why: "Maps an org's full network footprint, not just one /24.",
  },
  "RCE": {
    title: "RCE",
    def: "Remote Code Execution — an attacker runs arbitrary code on a target without prior access.",
    why: "Highest-severity bug class; pre-auth RCE on internet-facing hosts = game over.",
  },
  "MFA": {
    title: "MFA",
    def: "Multi-Factor Authentication — at least two of: something you know / have / are.",
    why: "Defeats most credential-stuffing and phishing — unless users approve fatigue prompts.",
  },
  "MFA-fatigue": {
    title: "MFA Fatigue",
    def: "Attacker spams push notifications until a tired user approves one.",
    why: "How Uber 2022 fell; fixed by number-matching and rate limits.",
  },
  "vishing": {
    title: "Vishing",
    def: "Voice phishing — social engineering over the phone, often impersonating IT or vendors.",
    why: "MGM 2023 was a 10-minute vishing call to the helpdesk.",
  },
  "registrar privacy": {
    title: "Registrar Privacy",
    def: "WHOIS/RDAP proxy that hides registrant identity behind the registrar's contact details.",
    why: "Removes named admins from the public attack surface.",
  },
  "registry-lock": {
    title: "Registry Lock",
    def: "Registry-level flag requiring out-of-band confirmation before any change to a domain.",
    why: "Defeats registrar-account takeover — the only reliable defense against high-value domain hijack.",
  },

  // ---------- Common abbreviations ----------
  "CEH": { title: "CEH", def: "Certified Ethical Hacker — EC-Council's offensive-security certification. v13 is the current AI-augmented track." },
  "OSINT": { title: "OSINT", def: "Open-Source Intelligence — information collected from publicly available sources (web, social, public records, DNS, certs).", why: "Footprinting is OSINT applied to a target organization." },
  "DNS": { title: "DNS", def: "Domain Name System — translates names (acmefin.example) to IPs and carries auxiliary records (MX, TXT, SPF, DKIM, DMARC)." },
  "TLS": { title: "TLS", def: "Transport Layer Security — the encryption protocol behind HTTPS; certificates issued for TLS are logged to Certificate Transparency." },
  "SSL": { title: "SSL", def: "Secure Sockets Layer — the deprecated predecessor to TLS. The term is still used colloquially for 'TLS certificate'." },
  "MX": { title: "MX record", def: "DNS Mail Exchanger record — identifies the mail servers that accept email for a domain.", why: "Reveals the mail provider (Google, Microsoft 365, on-prem) — a phishing target indicator." },
  "TXT": { title: "TXT record", def: "Free-form DNS text record — carries SPF, DKIM, DMARC, domain-ownership proofs, and other metadata." },
  "SOA": { title: "SOA record", def: "Start of Authority — the authoritative metadata record for a DNS zone (primary NS, admin email, serial, refresh timers)." },
  "NS": { title: "NS record", def: "Name Server record — points a zone at its authoritative DNS servers." },
  "CNAME": { title: "CNAME record", def: "Canonical Name — DNS alias from one hostname to another. Stale CNAMEs to deprovisioned cloud resources enable subdomain takeover." },
  "CA": { title: "CA", def: "Certificate Authority — issues TLS certificates and submits them to Certificate Transparency logs." },
  "CAs": { title: "Certificate Authorities", def: "Issuers of TLS certificates; all major public CAs are required to submit issued certs to CT logs." },
  "IP": { title: "IP", def: "Internet Protocol address — the numeric identifier for a host on the internet (IPv4 / IPv6)." },
  "URL": { title: "URL", def: "Uniform Resource Locator — full address of a web resource (scheme + host + path + query)." },
  "API": { title: "API", def: "Application Programming Interface — a programmatic contract for talking to a service (REST, GraphQL, RPC)." },
  "CVE": { title: "CVE", def: "Common Vulnerabilities and Exposures — the public catalogue of disclosed software vulnerabilities (CVE-YYYY-NNNNN).", why: "Footprinted tech stacks let attackers pivot to known CVEs in minutes." },
  "RDP": { title: "RDP", def: "Remote Desktop Protocol — Microsoft's GUI remote-access protocol on TCP/3389.", why: "Internet-exposed RDP is a top initial-access vector; ransomware crews scan for it daily." },
  "SMB": { title: "SMB", def: "Server Message Block — Windows file-sharing protocol on TCP/445.", why: "Public SMB shares routinely leak scripts, configs, and credentials." },
  "VPN": { title: "VPN", def: "Virtual Private Network — encrypted tunnel into a private network." },
  "BGP": { title: "BGP", def: "Border Gateway Protocol — the routing protocol between ASNs that runs the public internet." },
  "M&A": { title: "M&A", def: "Mergers & Acquisitions — when one org buys or merges with another.", why: "Acquired entities bring forgotten subdomains, certs, and IP space into the parent's attack surface." },
  "CISO": { title: "CISO", def: "Chief Information Security Officer — the executive accountable for an organization's security program." },
  "DoS": { title: "DoS", def: "Denial of Service — making a system unavailable to legitimate users. Almost always out-of-scope for footprinting engagements." },
  "DDoS": { title: "DDoS", def: "Distributed Denial of Service — DoS launched from many sources at once." },
  "PII": { title: "PII", def: "Personally Identifiable Information — data that can identify a specific person (names, emails, IDs)." },
  "FCA": { title: "FCA", def: "Financial Conduct Authority — UK financial-services regulator with breach-notification powers." },
  "IC3": { title: "IC3", def: "FBI Internet Crime Complaint Center — publishes annual cybercrime loss statistics." },
  "GSuite": { title: "GSuite / Google Workspace", def: "Google's enterprise productivity suite (Gmail, Drive, Calendar, Admin). Renamed Google Workspace in 2020." },
  "vSphere": { title: "vSphere", def: "VMware's enterprise virtualization platform — compromise typically means full datacenter takeover." },
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
        <div className="text-sm font-semibold text-[var(--cyan)] mb-1">{entry.title}</div>
        <div className="text-xs text-foreground leading-relaxed">{entry.def}</div>
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
