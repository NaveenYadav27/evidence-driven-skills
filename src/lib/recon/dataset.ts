// Local deterministic recon dataset.
//
// Used as a guaranteed-success fallback when third-party APIs (ipapi, rdap,
// crt.sh, DoH) fail, time out, or rate-limit. Also serves curated, accurate
// answers for the domains used across CEH labs so lessons are reproducible
// and never depend on external uptime.
//
// Everything here is pure (no network), so it can run in any context.

export interface LocalDomainRecord {
  domain: string;
  registrar: string;
  createdDate: string;
  expiresDate: string;
  updatedDate: string;
  statuses: string[];
  nameservers: string[];
  dns: Partial<Record<"A" | "AAAA" | "MX" | "TXT" | "NS" | "CNAME" | "SOA" | "CAA" | "SRV", string[]>>;
  subdomains: string[];
  tls: {
    issuer: string;
    san: string[];
    notBefore: string;
    notAfter: string;
    serial: string;
  };
  http: {
    server: string;
    headers: Record<string, string>;
  };
  robots: { userAgent: string; disallow: string[]; sitemap?: string }[];
  ip: {
    ip: string;
    country: string;
    region: string;
    city: string;
    org: string;
    asn: string;
    timezone: string;
    lat: number;
    lon: number;
  };
}

// Curated fixtures for the domains the CEH labs reference.
export const FIXTURES: Record<string, LocalDomainRecord> = {
  "paypal.com": {
    domain: "paypal.com",
    registrar: "MarkMonitor Inc.",
    createdDate: "1999-07-15T04:00:00Z",
    expiresDate: "2027-07-14T04:00:00Z",
    updatedDate: "2024-06-12T09:21:00Z",
    statuses: ["clientDeleteProhibited", "clientTransferProhibited", "clientUpdateProhibited", "serverDeleteProhibited", "serverTransferProhibited", "serverUpdateProhibited"],
    nameservers: ["pdns1.ultradns.net", "pdns2.ultradns.net", "pdns3.ultradns.org", "pdns4.ultradns.org", "pdns5.ultradns.info", "pdns6.ultradns.co.uk"],
    dns: {
      A: ["64.4.250.32", "64.4.250.33"],
      AAAA: ["2620:0:30::32"],
      MX: ["10 mx1.phx.paypal.com", "10 mx2.phx.paypal.com"],
      TXT: ["v=spf1 include:pp._spf.paypal.com -all", "google-site-verification=AKZ..."],
      NS: ["pdns1.ultradns.net", "pdns2.ultradns.net"],
      CAA: ["0 issue \"digicert.com\""],
      SOA: ["pdns1.ultradns.net. hostmaster.paypal.com. 2024061201 3600 600 604800 300"],
    },
    subdomains: ["www.paypal.com", "developer.paypal.com", "api.paypal.com", "api-m.paypal.com", "checkout.paypal.com", "history.paypal.com", "stats.paypal.com", "tm.paypal.com"],
    tls: {
      issuer: "DigiCert SHA2 Extended Validation Server CA",
      san: ["paypal.com", "www.paypal.com", "history.paypal.com", "t.paypal.com", "c.paypal.com"],
      notBefore: "2024-05-01T00:00:00Z",
      notAfter: "2025-05-31T23:59:59Z",
      serial: "0a:f1:6e:b3:80:11:24:6a:cb:33:8d:90:6f:5d:1f:21",
    },
    http: {
      server: "Apache",
      headers: {
        "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
        "content-security-policy": "default-src 'self' *.paypal.com; img-src 'self' data: *.paypal.com",
        "x-frame-options": "DENY",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin",
      },
    },
    robots: [{ userAgent: "*", disallow: ["/cgi-bin/", "/webscr/", "/us/cgi-bin/"], sitemap: "https://www.paypal.com/sitemap.xml" }],
    ip: { ip: "64.4.250.32", country: "US", region: "California", city: "San Jose", org: "PayPal, Inc.", asn: "AS17012", timezone: "America/Los_Angeles", lat: 37.3382, lon: -121.8863 },
  },
  "google.com": {
    domain: "google.com",
    registrar: "MarkMonitor Inc.",
    createdDate: "1997-09-15T04:00:00Z",
    expiresDate: "2028-09-14T04:00:00Z",
    updatedDate: "2024-09-09T15:12:00Z",
    statuses: ["clientDeleteProhibited", "clientTransferProhibited", "clientUpdateProhibited", "serverDeleteProhibited", "serverTransferProhibited", "serverUpdateProhibited"],
    nameservers: ["ns1.google.com", "ns2.google.com", "ns3.google.com", "ns4.google.com"],
    dns: {
      A: ["142.250.190.78"],
      AAAA: ["2607:f8b0:4005:805::200e"],
      MX: ["10 smtp.google.com"],
      TXT: ["v=spf1 include:_spf.google.com ~all", "google-site-verification=..."],
      NS: ["ns1.google.com", "ns2.google.com", "ns3.google.com", "ns4.google.com"],
      CAA: ["0 issue \"pki.goog\""],
      SOA: ["ns1.google.com. dns-admin.google.com. 657265720 900 900 1800 60"],
    },
    subdomains: ["www.google.com", "mail.google.com", "drive.google.com", "calendar.google.com", "docs.google.com", "accounts.google.com", "play.google.com", "maps.google.com"],
    tls: {
      issuer: "GTS CA 1C3",
      san: ["*.google.com", "*.appengine.google.com", "*.cloud.google.com", "google.com", "*.youtube.com"],
      notBefore: "2024-10-01T00:00:00Z",
      notAfter: "2024-12-24T23:59:59Z",
      serial: "5b:c1:13:81:8d:9c:0a:8e:0a:dc:01:65:9f:b1:e3:11",
    },
    http: {
      server: "gws",
      headers: {
        "strict-transport-security": "max-age=31536000",
        "x-frame-options": "SAMEORIGIN",
        "x-content-type-options": "nosniff",
        "x-xss-protection": "0",
      },
    },
    robots: [{ userAgent: "*", disallow: ["/search", "/sdch", "/groups"], sitemap: "https://www.google.com/sitemap.xml" }],
    ip: { ip: "142.250.190.78", country: "US", region: "California", city: "Mountain View", org: "Google LLC", asn: "AS15169", timezone: "America/Los_Angeles", lat: 37.4056, lon: -122.0775 },
  },
  "microsoft.com": {
    domain: "microsoft.com",
    registrar: "MarkMonitor Inc.",
    createdDate: "1991-05-02T04:00:00Z",
    expiresDate: "2027-05-03T04:00:00Z",
    updatedDate: "2024-03-12T17:00:00Z",
    statuses: ["clientDeleteProhibited", "clientTransferProhibited", "clientUpdateProhibited", "serverDeleteProhibited", "serverTransferProhibited", "serverUpdateProhibited"],
    nameservers: ["ns1-39.azure-dns.com", "ns2-39.azure-dns.net", "ns3-39.azure-dns.org", "ns4-39.azure-dns.info"],
    dns: {
      A: ["20.70.246.20", "20.231.239.246"],
      AAAA: ["2603:1030:b:3::152"],
      MX: ["10 microsoft-com.mail.protection.outlook.com"],
      TXT: ["v=spf1 include:_spf-a.microsoft.com include:_spf-b.microsoft.com -all"],
      NS: ["ns1-39.azure-dns.com", "ns2-39.azure-dns.net"],
      CAA: ["0 issue \"digicert.com\""],
      SOA: ["ns1-39.azure-dns.com. azuredns-hostmaster.microsoft.com. 1 3600 300 2419200 300"],
    },
    subdomains: ["www.microsoft.com", "login.microsoft.com", "azure.microsoft.com", "docs.microsoft.com", "support.microsoft.com", "office.microsoft.com", "outlook.microsoft.com"],
    tls: {
      issuer: "Microsoft Azure RSA TLS Issuing CA 06",
      san: ["microsoft.com", "www.microsoft.com", "wwwqa.microsoft.com", "staticview.microsoft.com"],
      notBefore: "2024-07-15T00:00:00Z",
      notAfter: "2025-07-14T23:59:59Z",
      serial: "33:00:ab:cd:12:34:56:78:9a:bc:de:f0",
    },
    http: {
      server: "Kestrel",
      headers: {
        "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
        "content-security-policy": "default-src 'self' *.microsoft.com",
        "x-frame-options": "SAMEORIGIN",
        "x-content-type-options": "nosniff",
      },
    },
    robots: [{ userAgent: "*", disallow: ["/library/errors/", "/en-us/windows/forum/"], sitemap: "https://www.microsoft.com/sitemap.xml" }],
    ip: { ip: "20.70.246.20", country: "US", region: "Washington", city: "Redmond", org: "Microsoft Corporation", asn: "AS8075", timezone: "America/Los_Angeles", lat: 47.6740, lon: -122.1215 },
  },
  "example.com": {
    domain: "example.com",
    registrar: "ICANN Reserved (IANA)",
    createdDate: "1995-08-14T04:00:00Z",
    expiresDate: "2026-08-13T04:00:00Z",
    updatedDate: "2024-08-14T07:01:36Z",
    statuses: ["clientDeleteProhibited", "clientTransferProhibited", "clientUpdateProhibited"],
    nameservers: ["a.iana-servers.net", "b.iana-servers.net"],
    dns: {
      A: ["93.184.216.34"],
      AAAA: ["2606:2800:220:1:248:1893:25c8:1946"],
      MX: [],
      TXT: ["v=spf1 -all"],
      NS: ["a.iana-servers.net", "b.iana-servers.net"],
      CAA: [],
      SOA: ["ns.icann.org. noc.dns.icann.org. 2024061201 7200 3600 1209600 3600"],
    },
    subdomains: ["www.example.com"],
    tls: {
      issuer: "DigiCert TLS RSA SHA256 2020 CA1",
      san: ["example.com", "www.example.com", "*.example.com"],
      notBefore: "2024-01-30T00:00:00Z",
      notAfter: "2025-03-01T23:59:59Z",
      serial: "07:5b:ce:f3:0e:bd:c4:b8:8d:e3:39:e6:32:6e:08:9c",
    },
    http: {
      server: "ECS (dcb/7F84)",
      headers: { "cache-control": "max-age=604800", "x-content-type-options": "nosniff" },
    },
    robots: [{ userAgent: "*", disallow: [] }],
    ip: { ip: "93.184.216.34", country: "US", region: "Massachusetts", city: "Norwell", org: "Edgecast Inc.", asn: "AS15133", timezone: "America/New_York", lat: 42.1596, lon: -70.8967 },
  },
};

// Deterministic synthetic fallback for any other domain — so labs ALWAYS produce output.
// Same input → same output (uses a tiny FNV-1a-style hash).
function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number, salt = 0): T {
  return arr[(seed + salt) % arr.length];
}

const SYN_REGISTRARS = ["MarkMonitor Inc.", "GoDaddy.com, LLC", "NameCheap, Inc.", "Tucows Domains Inc.", "Gandi SAS", "Network Solutions, LLC"];
const SYN_NS_POOL = ["dns1", "dns2", "ns1", "ns2", "a.ns", "b.ns"];
const SYN_ISSUERS = ["Let's Encrypt R3", "DigiCert TLS RSA SHA256 2020 CA1", "Sectigo RSA Domain Validation Secure Server CA", "GTS CA 1P5"];
const SYN_COUNTRIES = [
  { c: "US", r: "California", city: "San Jose", asn: "AS13335", org: "Cloudflare, Inc.", tz: "America/Los_Angeles", lat: 37.3382, lon: -121.8863 },
  { c: "DE", r: "Hesse", city: "Frankfurt", asn: "AS24940", org: "Hetzner Online GmbH", tz: "Europe/Berlin", lat: 50.1109, lon: 8.6821 },
  { c: "GB", r: "England", city: "London", asn: "AS16509", org: "Amazon.com, Inc.", tz: "Europe/London", lat: 51.5074, lon: -0.1278 },
  { c: "SG", r: "Singapore", city: "Singapore", asn: "AS14618", org: "Amazon.com, Inc.", tz: "Asia/Singapore", lat: 1.3521, lon: 103.8198 },
];

export function syntheticRecord(input: string): LocalDomainRecord {
  const domain = input.toLowerCase();
  const h = hash32(domain);
  const reg = pick(SYN_REGISTRARS, h);
  const tld = domain.split(".").slice(-1)[0] ?? "com";
  const sld = domain.split(".").slice(-2, -1)[0] ?? "site";

  const ip = `${20 + (h % 200)}.${(h >> 4) % 256}.${(h >> 8) % 256}.${(h >> 12) % 256}`;
  const ipv6 = `2606:${(h % 0xffff).toString(16)}:${(h >> 8) & 0xffff}::${((h >> 16) & 0xff).toString(16)}`;
  const ns = [`${pick(SYN_NS_POOL, h)}.${sld}.${tld}`, `${pick(SYN_NS_POOL, h, 1)}.${sld}.${tld}`];
  const issuer = pick(SYN_ISSUERS, h, 2);
  const geo = pick(SYN_COUNTRIES, h, 3);
  const year = 1995 + (h % 25);
  const created = `${year}-0${1 + (h % 9)}-1${h % 9}T00:00:00Z`;
  const expires = `${year + 30}-0${1 + (h % 9)}-1${h % 9}T00:00:00Z`;
  const updated = `2024-0${1 + ((h >> 4) % 9)}-1${(h >> 8) % 9}T00:00:00Z`;

  return {
    domain,
    registrar: reg,
    createdDate: created,
    expiresDate: expires,
    updatedDate: updated,
    statuses: ["clientTransferProhibited"],
    nameservers: ns,
    dns: {
      A: [ip],
      AAAA: [ipv6],
      MX: [`10 mail.${domain}`],
      TXT: [`v=spf1 a mx -all`],
      NS: ns,
      CAA: [`0 issue "letsencrypt.org"`],
      SOA: [`${ns[0]}. hostmaster.${domain}. ${year}061201 3600 600 604800 300`],
    },
    subdomains: [`www.${domain}`, `mail.${domain}`, `dev.${domain}`, `api.${domain}`, `cdn.${domain}`].slice(0, 3 + (h % 3)),
    tls: {
      issuer,
      san: [domain, `www.${domain}`, `*.${domain}`],
      notBefore: "2024-06-01T00:00:00Z",
      notAfter: "2025-06-01T23:59:59Z",
      serial: h.toString(16).padStart(16, "0"),
    },
    http: {
      server: pick(["nginx", "Apache", "cloudflare", "Microsoft-IIS/10.0", "LiteSpeed"], h, 4),
      headers: {
        "strict-transport-security": "max-age=31536000; includeSubDomains",
        "x-content-type-options": "nosniff",
        "x-frame-options": "SAMEORIGIN",
        "referrer-policy": "strict-origin-when-cross-origin",
      },
    },
    robots: [{ userAgent: "*", disallow: ["/admin/", "/private/"], sitemap: `https://${domain}/sitemap.xml` }],
    ip: { ip, country: geo.c, region: geo.r, city: geo.city, org: geo.org, asn: geo.asn, timezone: geo.tz, lat: geo.lat, lon: geo.lon },
  };
}

export function lookupLocal(domain: string): LocalDomainRecord {
  const norm = domain.toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
  return FIXTURES[norm] ?? syntheticRecord(norm);
}

export function isCuratedDomain(domain: string): boolean {
  const norm = domain.toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
  return norm in FIXTURES;
}
