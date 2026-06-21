// Module 02 lab coaching: tips, suggested commands, and answer key.
// Answers are gated behind a reveal so students try first.

export interface LabCoachEntry {
  tips: string[];
  commands: { cmd: string; note?: string }[];
  answers: { label: string; value: string; note?: string }[];
}

export const M02_LAB_COACH: Record<string, LabCoachEntry> = {
  "lab-m02-whois": {
    tips: [
      "RDAP is the modern JSON replacement for legacy WHOIS — same data, structured.",
      "Look for the entity with role 'registrar' for the registrar name.",
      "The 'events' array has an event with eventAction 'registration' — its date is creation.",
    ],
    commands: [{ cmd: "whois example.com", note: "Runs RDAP under the hood." }],
    answers: [
      { label: "Registrar", value: "RESERVED-Internet Assigned Numbers Authority", note: "example.com is reserved by IANA." },
      { label: "Creation Year", value: "1995" },
    ],
  },
  "lab-m02-dns": {
    tips: [
      "Primary MX = lowest preference number (priority).",
      "Use DNS-over-HTTPS via the dig tool — no UDP needed.",
      "TXT can contain SPF (v=spf1 …); _dmarc.<domain> holds the DMARC TXT.",
    ],
    commands: [
      { cmd: "dig iana.org A" },
      { cmd: "dig iana.org MX" },
      { cmd: "dig iana.org NS" },
    ],
    answers: [
      { label: "Primary MX", value: "(varies — submit the host with the lowest priority returned live)", note: "Validated against live DoH; expect a single mail.iana.org-style host." },
    ],
  },
  "lab-m02-subs": {
    tips: [
      "crt.sh returns wildcard entries (*.owasp.org) — dedupe and strip the leading *.",
      "Sub count varies week-to-week; pull the live integer from your output.",
      "Pick a clearly-owned host (wiki.*, www.*, learn.*) for the verified submission.",
    ],
    commands: [{ cmd: "subs owasp.org" }],
    answers: [
      { label: "Verified subdomain (example)", value: "wiki.owasp.org", note: "Any live-validated *.owasp.org host works." },
      { label: "Count", value: "(live integer — submit what your run returned)" },
    ],
  },
  "lab-m02-wayback": {
    tips: [
      "Use the CDX API: from=19960101 yields the earliest snapshots.",
      "Sort by timestamp ascending; first row = first capture.",
      "Snapshot count comes from total results, not unique URLs.",
    ],
    commands: [{ cmd: "wayback mit.edu" }],
    answers: [
      { label: "First snapshot year", value: "1997", note: "MIT's first archive.org capture is in 1997." },
      { label: "Snapshot count", value: "(live integer)" },
    ],
  },
  "lab-m02-challenge": {
    tips: [
      "Run all four commands before submitting any finding.",
      "Cloudflare's registrar is itself (MarkMonitor historically, now CSC/Cloudflare Registrar).",
      "NS hostnames look like *.ns.cloudflare.com.",
    ],
    commands: [
      { cmd: "whois cloudflare.com" },
      { cmd: "dig cloudflare.com NS" },
      { cmd: "dig cloudflare.com MX" },
      { cmd: "subs cloudflare.com" },
    ],
    answers: [
      { label: "Registrar", value: "Cloudflare, Inc.", note: "Validates fuzzy-match against live RDAP." },
      { label: "Nameserver (example)", value: "ns3.cloudflare.com" },
      { label: "Primary MX (example)", value: "mailstream-east.mxrecord.io", note: "Live — submit what your dig returns." },
      { label: "Subdomain (example)", value: "blog.cloudflare.com" },
    ],
  },
  "lab-m02-robots": {
    tips: [
      "robots.txt groups directives under User-agent: lines. '*' = all crawlers.",
      "Disallow paths begin with '/'. Trailing slashes are matched leniently.",
      "GitHub publishes many disallow rules — pick any one returned live.",
    ],
    commands: [{ cmd: "robots github.com" }],
    answers: [
      { label: "User-agent", value: "*" },
      { label: "Disallow path (example)", value: "/gist/", note: "Any live-published Disallow value validates." },
    ],
  },
  "lab-m02-tech-headers": {
    tips: [
      "The 'Server' header may be deliberately generic (cloudflare, nginx).",
      "HSTS max-age is in seconds; 31536000 = 1 year.",
      "Use HEAD-style fetch — only headers are inspected.",
    ],
    commands: [{ cmd: "headers mozilla.org" }],
    answers: [
      { label: "Server header", value: "cloudflare", note: "Mozilla fronts via Cloudflare; live-validated." },
      { label: "HSTS max-age", value: "31536000" },
    ],
  },
  "lab-m02-email-spf": {
    tips: [
      "SPF lives in the apex TXT record. Find the segment starting with v=spf1; the last token is the all-qualifier.",
      "DMARC lives at _dmarc.<domain>. Look for p= value.",
      "PayPal publishes a strict posture — expect -all and reject.",
    ],
    commands: [
      { cmd: "dig paypal.com TXT" },
      { cmd: "dig _dmarc.paypal.com TXT" },
    ],
    answers: [
      { label: "SPF qualifier", value: "-all", note: "Hard-fail." },
      { label: "DMARC policy", value: "reject" },
    ],
  },
  "lab-m02-reverse-dns": {
    tips: [
      "Resolve A first, then PTR on the reversed IP under in-addr.arpa.",
      "ASN org for Wikipedia infra is WIKIMEDIA.",
      "PTR hosts often follow role-lb.region.wikimedia.org naming.",
    ],
    commands: [
      { cmd: "ip wikipedia.org" },
      { cmd: "dig 224.154.80.208.in-addr.arpa PTR", note: "Reverse the IPv4 octets you resolved." },
    ],
    answers: [
      { label: "IPv4 (example)", value: "208.80.154.224", note: "Live anycast — your run may differ." },
      { label: "ASN org", value: "WIKIMEDIA" },
      { label: "PTR host (example)", value: "text-lb.eqiad.wikimedia.org" },
    ],
  },
  "lab-m02-tls-cert": {
    tips: [
      "Issuer is in the certificate's Issuer CN/O. Stripe uses a major commercial CA.",
      "SAN list is the gold mine — any entry other than stripe.com qualifies.",
      "TLS inspection is passive — a single handshake, no scanning.",
    ],
    commands: [{ cmd: "tls stripe.com" }],
    answers: [
      { label: "Issuer (example)", value: "DigiCert Inc", note: "May rotate — submit live value." },
      { label: "SAN (example)", value: "api.stripe.com" },
    ],
  },
  "lab-m02-osint-challenge": {
    tips: [
      "Six commands before any finding — they all run against the same target.",
      "GitHub uses MarkMonitor as registrar; NS are *.dns.icann.org-style or AWS Route53.",
      "DMARC for github.com is p=reject.",
    ],
    commands: [
      { cmd: "whois github.com" },
      { cmd: "dig github.com NS" },
      { cmd: "subs github.com" },
      { cmd: "tls github.com" },
      { cmd: "ip github.com" },
      { cmd: "dig _dmarc.github.com TXT" },
    ],
    answers: [
      { label: "Registrar", value: "MarkMonitor Inc." },
      { label: "Nameserver (example)", value: "dns1.p08.nsone.net", note: "Live — submit what dig returns." },
      { label: "Subdomain (example)", value: "api.github.com" },
      { label: "Issuer (example)", value: "DigiCert Inc" },
      { label: "DMARC policy", value: "reject" },
    ],
  },
};
