import { createServerFn } from "@tanstack/react-start";
import { lookupLocal } from "@/lib/recon/dataset";

/**
 * Recon & web-server server functions.
 *
 * Each function tries a real public API first (RDAP, DoH, crt.sh, NVD,
 * ipapi, etc.) and falls back to a deterministic LOCAL dataset
 * (src/lib/recon/dataset.ts) when the upstream is rate-limited, blocked,
 * times out, or returns an error. The fallback preserves the same return
 * shape so lab objectives validate identically.
 *
 * Result: every accepted command produces output. No lab is ever stuck
 * because of third-party failure or rate limit.
 */

// Allow underscore-prefixed labels (e.g. _dmarc, _spf, _domainkey) and
// numeric labels (e.g. in-addr.arpa for reverse DNS PTR queries).
const ALLOWED_DOMAIN = /^[a-z0-9._-]+\.[a-z0-9]{2,}$/i;
const sanitize = (d: string) => d.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];

const RDAP_BASE = "https://rdap.org/domain/";
const DOH_BASE = "https://cloudflare-dns.com/dns-query";
const CRTSH_BASE = "https://crt.sh/?output=json&q=";
const WAYBACK_CDX = "https://web.archive.org/cdx/search/cdx";
const NVD_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const IPAPI_BASE = "https://ipapi.co";

const DNS_TYPES: Record<string, number> = {
  A: 1, NS: 2, CNAME: 5, SOA: 6, PTR: 12, MX: 15, TXT: 16, AAAA: 28, SRV: 33, CAA: 257,
};

const SAFE_TARGET = /^[a-z0-9._-]+\.[a-z0-9]{2,}$/i;
const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/;

/* ───────────────────────────  WHOIS / RDAP  ─────────────────────────── */

export interface WhoisResult {
  ok: boolean; domain: string;
  registrar?: string; createdDate?: string; expiresDate?: string; updatedDate?: string;
  nameservers?: string[]; statuses?: string[];
  raw: string; error?: string;
}

const RDAP_UA = "ShadowXLab-CyberRange/1.6 (+https://ceh.shadowxlab.com)";
const TLD_RDAP: Record<string, string> = {
  com: "https://rdap.verisign.com/com/v1/domain/",
  net: "https://rdap.verisign.com/net/v1/domain/",
  org: "https://rdap.publicinterestregistry.org/rdap/domain/",
  io: "https://rdap.identitydigital.services/rdap/domain/",
  dev: "https://rdap.nic.google/domain/",
  app: "https://rdap.nic.google/domain/",
};

async function fetchRdap(domain: string): Promise<Response> {
  const tld = domain.split(".").pop()!;
  const headers = { Accept: "application/rdap+json", "User-Agent": RDAP_UA };
  // Prefer the authoritative TLD registry over IANA's stub record (which omits
  // registrar + true registration date for example.com).

  const tldUrl = TLD_RDAP[tld];
  if (tldUrl) {
    const r = await fetch(tldUrl + domain, { headers, redirect: "follow" });
    if (r.ok) return r;
  }
  return fetch(RDAP_BASE + domain, { headers, redirect: "follow" });
}

export const whoisLookup = createServerFn({ method: "POST" })
  .inputValidator((input: { domain: string }) => input)
  .handler(async ({ data }): Promise<WhoisResult> => {
    const domain = sanitize(data.domain || "");
    if (!ALLOWED_DOMAIN.test(domain)) return { ok: false, domain, raw: "", error: "Invalid domain format" };
    const fallback = (): WhoisResult => {
      const f = lookupLocal(domain);
      const raw = [
        `% Local cached WHOIS for ${domain} (upstream RDAP unavailable)`,
        `Domain Name:        ${domain}`,
        `Registrar:          ${f.registrar}`,
        `Creation Date:      ${f.createdDate}`,
        `Updated Date:       ${f.updatedDate}`,
        `Expiration Date:    ${f.expiresDate}`,
        `Domain Status:      ${f.statuses.join(", ")}`,
        ...f.nameservers.map((n) => `Name Server:        ${n}`),
        "", ">>> WHOIS query complete (local dataset).",
      ].join("\n");
      return { ok: true, domain, registrar: f.registrar, createdDate: f.createdDate, expiresDate: f.expiresDate, updatedDate: f.updatedDate, nameservers: f.nameservers, statuses: f.statuses, raw };
    };
    try {
      const res = await fetchRdap(domain);
      if (!res.ok) return fallback();
      const json: any = await res.json();
      const events: Array<{ eventAction: string; eventDate: string }> = json.events ?? [];
      const created = events.find(e => e.eventAction === "registration")?.eventDate;
      const expires = events.find(e => e.eventAction === "expiration")?.eventDate;
      const updated = events.find(e => e.eventAction === "last changed" || e.eventAction === "last update of RDAP database")?.eventDate;
      const registrarEntity = (json.entities ?? []).find((e: any) => (e.roles ?? []).includes("registrar"));
      let registrar: string | undefined;
      if (registrarEntity?.vcardArray) {
        const arr = registrarEntity.vcardArray[1] ?? [];
        registrar = arr.find((v: any) => v[0] === "fn")?.[3];
      }
      registrar = registrar || registrarEntity?.handle;
      const nameservers = (json.nameservers ?? []).map((n: any) => String(n.ldhName ?? "").toLowerCase()).filter(Boolean);
      const statuses = json.status ?? [];
      const raw = [
        `% RDAP query for ${domain} via rdap.org`,
        `Domain Name:        ${json.ldhName ?? domain}`,
        `Registrar:          ${registrar ?? "(unknown)"}`,
        `Creation Date:      ${created ?? "(unknown)"}`,
        `Updated Date:       ${updated ?? "(unknown)"}`,
        `Expiration Date:    ${expires ?? "(unknown)"}`,
        `Domain Status:      ${statuses.join(", ") || "(unknown)"}`,
        ...nameservers.map((n: string) => `Name Server:        ${n}`),
        "", ">>> RDAP query complete.",
      ].join("\n");
      return { ok: true, domain, registrar, createdDate: created, expiresDate: expires, updatedDate: updated, nameservers, statuses, raw };
    } catch {
      return fallback();
    }
  });

/* ───────────────────────────────  DNS  ──────────────────────────────── */

export interface DnsAnswer { name: string; type: number; TTL: number; data: string; }
export interface DnsResult {
  ok: boolean; domain: string; type: string;
  answers: DnsAnswer[]; raw: string; error?: string;
}

export const dnsLookup = createServerFn({ method: "POST" })
  .inputValidator((input: { domain: string; type?: string }) => input)
  .handler(async ({ data }): Promise<DnsResult> => {
    const domain = sanitize(data.domain || "");
    const type = (data.type || "A").toUpperCase();
    if (!ALLOWED_DOMAIN.test(domain)) return { ok: false, domain, type, answers: [], raw: "", error: "Invalid domain format" };
    if (!(type in DNS_TYPES)) return { ok: false, domain, type, answers: [], raw: "", error: `Unsupported type ${type}` };
    const fallback = (): DnsResult => {
      const f = lookupLocal(domain);
      const records = (f.dns[type as keyof typeof f.dns] ?? []) as string[];
      const t = DNS_TYPES[type];
      const answers: DnsAnswer[] = records.map((d) => ({ name: domain, type: t, TTL: 300, data: d }));
      const raw = [
        `;; Local cached DNS for ${domain} (upstream DoH unavailable)`,
        `;; QUESTION SECTION:`,
        `;${domain}.\t\tIN\t${type}`,
        ``,
        `;; ANSWER SECTION:`,
        ...(records.length ? records.map((d) => `${domain}\t300\tIN\t${type}\t${d}`) : [";; (no answer)"]),
        ``,
        `;; SERVER: local-cache`,
      ].join("\n");
      return { ok: true, domain, type, answers, raw };
    };
    try {
      const url = `${DOH_BASE}?name=${encodeURIComponent(domain)}&type=${type}`;
      const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
      if (!res.ok) return fallback();
      const json: any = await res.json();
      const answers: DnsAnswer[] = json.Answer ?? [];
      if (!answers.length) return fallback();
      const header = [
        `;; DiG-equivalent over DoH (Cloudflare 1.1.1.1)`,
        `;; QUESTION SECTION:`,
        `;${domain}.\t\tIN\t${type}`,
        ``,
        `;; ANSWER SECTION:`,
      ].join("\n");
      const body = answers.map(a => `${a.name}\t${a.TTL}\tIN\t${typeName(a.type)}\t${a.data}`).join("\n");
      const footer = `\n\n;; Query time: live\n;; SERVER: 1.1.1.1#443(DoH)\n;; MSG SIZE  rcvd: ${JSON.stringify(json).length}`;
      return { ok: true, domain, type, answers, raw: header + "\n" + body + footer };
    } catch {
      return fallback();
    }
  });

function typeName(n: number): string {
  const entry = Object.entries(DNS_TYPES).find(([, v]) => v === n);
  return entry?.[0] ?? String(n);
}

/* ─────────────────────  SUBDOMAIN ENUM (crt.sh)  ────────────────────── */

export interface SubdomainResult {
  ok: boolean; domain: string; unique: string[]; count: number; raw: string; error?: string;
}

export const subdomainEnum = createServerFn({ method: "POST" })
  .inputValidator((input: { domain: string }) => input)
  .handler(async ({ data }): Promise<SubdomainResult> => {
    const domain = sanitize(data.domain || "");
    if (!ALLOWED_DOMAIN.test(domain)) return { ok: false, domain, unique: [], count: 0, raw: "", error: "Invalid domain" };
    const fallback = (): SubdomainResult => {
      const unique = lookupLocal(domain).subdomains.slice().sort();
      const raw = [
        `;; Local cached subdomain enumeration for ${domain} (upstream crt.sh unavailable)`,
        `;; Unique hosts: ${unique.length}`,
        ``,
        ...unique,
      ].join("\n");
      return { ok: true, domain, unique, count: unique.length, raw };
    };
    try {
      const res = await fetch(`${CRTSH_BASE}%25.${encodeURIComponent(domain)}`, { headers: { Accept: "application/json" } });
      if (!res.ok) return fallback();
      const json: any[] = await res.json().catch(() => []);
      const set = new Set<string>();
      for (const row of json) {
        const names = String(row.name_value || "").split("\n");
        for (const n of names) {
          const s = n.trim().toLowerCase().replace(/^\*\./, "");
          if (s.endsWith(domain)) set.add(s);
        }
      }
      const unique = Array.from(set).sort();
      if (!unique.length) return fallback();
      const raw = [
        `;; Certificate Transparency search via crt.sh`,
        `;; Pattern: %.${domain}    Records: ${json.length}    Unique hosts: ${unique.length}`,
        ``,
        ...unique.slice(0, 200),
        unique.length > 200 ? `... (${unique.length - 200} more truncated)` : ``,
      ].filter(Boolean).join("\n");
      return { ok: true, domain, unique, count: unique.length, raw };
    } catch {
      return fallback();
    }
  });

/* ─────────────────────────  HTTP HEADERS  ───────────────────────────── */

export interface HeadersResult {
  ok: boolean; url: string; status?: number; server?: string;
  headers: Record<string, string>;
  security: { hsts: boolean; csp: boolean; xfo: boolean; xcto: boolean; referrer: boolean; permissions: boolean; score: number };
  raw: string; error?: string;
}

export const httpHeaders = createServerFn({ method: "POST" })
  .inputValidator((input: { target: string }) => input)
  .handler(async ({ data }): Promise<HeadersResult> => {
    const host = sanitize(data.target || "");
    if (!SAFE_TARGET.test(host)) return { ok: false, url: host, headers: {}, security: emptySec(), raw: "", error: "Invalid host" };
    const url = `https://${host}/`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal, headers: { "User-Agent": "ShadowXLab-Range/1.0" } });
      clearTimeout(t);
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
      const security = {
        hsts: !!headers["strict-transport-security"],
        csp: !!headers["content-security-policy"],
        xfo: !!headers["x-frame-options"],
        xcto: !!headers["x-content-type-options"],
        referrer: !!headers["referrer-policy"],
        permissions: !!headers["permissions-policy"],
        score: 0,
      };
      security.score = Object.values(security).filter(v => v === true).length;
      const raw = [
        `GET ${url}`,
        `HTTP/${res.status} ${res.statusText}`,
        ``,
        ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`),
        ``,
        `── Security header audit ──`,
        ` strict-transport-security  ${security.hsts ? "✓" : "✗ missing"}`,
        ` content-security-policy    ${security.csp ? "✓" : "✗ missing"}`,
        ` x-frame-options            ${security.xfo ? "✓" : "✗ missing"}`,
        ` x-content-type-options     ${security.xcto ? "✓" : "✗ missing"}`,
        ` referrer-policy            ${security.referrer ? "✓" : "✗ missing"}`,
        ` permissions-policy         ${security.permissions ? "✓" : "✗ missing"}`,
        ` score: ${security.score}/6`,
      ].join("\n");
      return { ok: true, url, status: res.status, server: headers["server"], headers, security, raw };
    } catch (e: any) {
      return { ok: false, url, headers: {}, security: emptySec(), raw: "", error: e?.message ?? "Network error" };
    }
  });

function emptySec() { return { hsts: false, csp: false, xfo: false, xcto: false, referrer: false, permissions: false, score: 0 }; }

/* ─────────────────────────  ROBOTS / SITEMAP  ───────────────────────── */

export interface RobotsResult {
  ok: boolean; url: string;
  disallow: string[]; allow: string[]; sitemaps: string[]; userAgents: string[];
  raw: string; error?: string;
}

export const robotsScan = createServerFn({ method: "POST" })
  .inputValidator((input: { target: string }) => input)
  .handler(async ({ data }): Promise<RobotsResult> => {
    const host = sanitize(data.target || "");
    if (!SAFE_TARGET.test(host)) return { ok: false, url: host, disallow: [], allow: [], sitemaps: [], userAgents: [], raw: "", error: "Invalid host" };
    const url = `https://${host}/robots.txt`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "ShadowXLab-Range/1.0" } });
      clearTimeout(t);
      if (!res.ok) return { ok: false, url, disallow: [], allow: [], sitemaps: [], userAgents: [], raw: "", error: `HTTP ${res.status}` };
      const text = (await res.text()).slice(0, 64000);
      const disallow: string[] = [], allow: string[] = [], sitemaps: string[] = [], userAgents: string[] = [];
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Za-z-]+)\s*:\s*(.+?)\s*(#.*)?$/);
        if (!m) continue;
        const [, k, v] = m;
        const key = k.toLowerCase();
        if (key === "disallow" && v) disallow.push(v);
        else if (key === "allow" && v) allow.push(v);
        else if (key === "sitemap") sitemaps.push(v);
        else if (key === "user-agent") userAgents.push(v);
      }
      const raw = [
        `GET ${url}    HTTP ${res.status}`,
        `── Parsed ──`,
        `User-agents: ${userAgents.length}    Disallow: ${disallow.length}    Allow: ${allow.length}    Sitemaps: ${sitemaps.length}`,
        ``,
        `── Disallow entries ──`,
        ...disallow.slice(0, 80).map(d => `  ✗ ${d}`),
        disallow.length > 80 ? `  ... (+${disallow.length - 80})` : ``,
        ``,
        `── Sitemaps ──`,
        ...sitemaps.map(s => `  → ${s}`),
        ``,
        `── Raw (first 2KB) ──`,
        text.slice(0, 2048),
      ].filter(Boolean).join("\n");
      return { ok: true, url, disallow, allow, sitemaps, userAgents, raw };
    } catch (e: any) {
      return { ok: false, url, disallow: [], allow: [], sitemaps: [], userAgents: [], raw: "", error: e?.message ?? "Network error" };
    }
  });

/* ────────────────────────  WAYBACK MACHINE  ─────────────────────────── */

export interface WaybackResult {
  ok: boolean; target: string; totalSnapshots: number;
  firstSnapshot?: string; lastSnapshot?: string; firstYear?: string;
  raw: string; error?: string;
}

export const waybackHistory = createServerFn({ method: "POST" })
  .inputValidator((input: { target: string }) => input)
  .handler(async ({ data }): Promise<WaybackResult> => {
    const host = sanitize(data.target || "");
    if (!SAFE_TARGET.test(host)) return { ok: false, target: host, totalSnapshots: 0, raw: "", error: "Invalid host" };
    const headers = {
      "User-Agent": "Mozilla/5.0 (compatible; ShadowXLab-Recon/1.0; +https://ceh.shadowxlab.com)",
      Accept: "application/json,text/plain,*/*",
    };
    const fmt = (ts?: string) => ts ? `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}` : undefined;

    const tryCdx = async (h: string) => {
      const url = `${WAYBACK_CDX}?url=${encodeURIComponent(h)}&output=json&limit=200&fl=timestamp,original,statuscode&collapse=timestamp:6`;
      const res = await fetch(url, { headers });
      return res;
    };

    try {
      // First try host, then *.host as fallback if 400
      let res = await tryCdx(host);
      if (res.status === 400) res = await tryCdx(`*.${host}`);

      if (!res.ok) {
        // Fallback to Availability API so the lab still returns useful data
        try {
          const aRes = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(host)}`, { headers });
          if (aRes.ok) {
            const aJson: any = await aRes.json().catch(() => ({}));
            const snap = aJson?.archived_snapshots?.closest;
            if (snap?.timestamp) {
              const ts = snap.timestamp;
              const raw = [
                `;; Internet Archive — Availability API (CDX returned ${res.status})`,
                `;; Target: ${host}`,
                `;; Closest snapshot: ${fmt(ts)}`,
                `;; URL: ${snap.url}`,
                ``,
                `Note: CDX search rejected this query (HTTP ${res.status}). Showing closest snapshot instead.`,
              ].join("\n");
              return { ok: true, target: host, totalSnapshots: 1, firstSnapshot: fmt(ts), lastSnapshot: fmt(ts), firstYear: ts.slice(0, 4), raw };
            }
          }
        } catch { /* ignore */ }
        return { ok: false, target: host, totalSnapshots: 0, raw: "", error: `Wayback ${res.status} — the Internet Archive may be rate-limiting or temporarily unavailable. Try again in a minute.` };
      }

      const text = await res.text();
      let rows: any[][] = [];
      try { rows = JSON.parse(text); } catch { rows = []; }
      const data2 = rows.slice(1);
      const total = data2.length;
      const first = data2[0]?.[0];
      const last = data2[data2.length - 1]?.[0];
      const raw = [
        `;; Internet Archive Wayback Machine — CDX API`,
        `;; Target: ${host}`,
        `;; Snapshots returned: ${total} (collapsed to monthly)`,
        `;; First seen: ${fmt(first) ?? "—"}`,
        `;; Most recent: ${fmt(last) ?? "—"}`,
        ``,
        `── Sample snapshots ──`,
        ...data2.slice(0, 25).map(r => `  ${fmt(r[0])}  ${r[2]}  https://web.archive.org/web/${r[0]}/${r[1]}`),
      ].join("\n");
      return { ok: true, target: host, totalSnapshots: total, firstSnapshot: fmt(first), lastSnapshot: fmt(last), firstYear: first?.slice(0, 4), raw };
    } catch (e: any) {
      return { ok: false, target: host, totalSnapshots: 0, raw: "", error: e?.message ?? "Network error" };
    }
  });

/* ─────────────────────────  CVE SEARCH (NVD) ─────────────────────────── */

export interface CveSearchResult {
  ok: boolean; query: string; total: number;
  items: { id: string; cvss?: number; severity?: string; published?: string; summary: string }[];
  raw: string; error?: string;
}

export const cveSearch = createServerFn({ method: "POST" })
  .inputValidator((input: { query: string }) => input)
  .handler(async ({ data }): Promise<CveSearchResult> => {
    const q = (data.query || "").trim().slice(0, 80);
    if (!q || !/^[\w .+\-:/]+$/.test(q)) return { ok: false, query: q, total: 0, items: [], raw: "", error: "Invalid query" };
    try {
      const isCveId = /^CVE-\d{4}-\d{4,7}$/i.test(q);
      const url = isCveId
        ? `${NVD_BASE}?cveId=${encodeURIComponent(q.toUpperCase())}`
        : `${NVD_BASE}?keywordSearch=${encodeURIComponent(q)}&resultsPerPage=20`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return { ok: false, query: q, total: 0, items: [], raw: "", error: `NVD ${res.status}` };
      const json: any = await res.json();
      const vulns: any[] = json.vulnerabilities ?? [];
      const items = vulns.map((v) => {
        const c = v.cve ?? {};
        const desc = (c.descriptions ?? []).find((d: any) => d.lang === "en")?.value ?? "";
        const m31 = c.metrics?.cvssMetricV31?.[0]?.cvssData;
        const m30 = c.metrics?.cvssMetricV30?.[0]?.cvssData;
        const m2 = c.metrics?.cvssMetricV2?.[0]?.cvssData;
        const m = m31 ?? m30 ?? m2;
        return {
          id: c.id,
          cvss: m?.baseScore,
          severity: c.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity ?? c.metrics?.cvssMetricV2?.[0]?.baseSeverity,
          published: c.published?.slice(0, 10),
          summary: desc.slice(0, 240),
        };
      });
      const raw = [
        `;; NIST NVD 2.0 search`,
        `;; Query: ${q}    Total: ${json.totalResults ?? items.length}    Showing: ${items.length}`,
        ``,
        ...items.map((i) => `${i.id}   CVSS ${i.cvss ?? "?"} (${i.severity ?? "-"})   ${i.published ?? ""}\n  ${i.summary}`),
      ].join("\n");
      return { ok: true, query: q, total: json.totalResults ?? items.length, items, raw };
    } catch (e: any) {
      return { ok: false, query: q, total: 0, items: [], raw: "", error: e?.message ?? "Network error" };
    }
  });

/* ─────────────────────────  IP INTELLIGENCE  ─────────────────────────── */

export interface IpIntelResult {
  ok: boolean; query: string;
  ip?: string; country?: string; countryCode?: string; region?: string; city?: string;
  org?: string; asn?: string; timezone?: string;
  raw: string; error?: string;
}

export const ipIntel = createServerFn({ method: "POST" })
  .inputValidator((input: { target: string }) => input)
  .handler(async ({ data }): Promise<IpIntelResult> => {
    const t = (data.target || "").trim().toLowerCase();
    if (!t) return { ok: false, query: t, raw: "", error: "Missing target" };
    let ip = t;
    try {
      if (!IPV4.test(t)) {
        if (!SAFE_TARGET.test(t)) return { ok: false, query: t, raw: "", error: "Invalid host/IP" };
        const dns = await fetch(`${DOH_BASE}?name=${encodeURIComponent(t)}&type=A`, { headers: { Accept: "application/dns-json" } });
        const j: any = await dns.json();
        const a = (j.Answer ?? []).find((x: any) => x.type === 1)?.data;
        if (!a) return { ok: false, query: t, raw: "", error: "No A record" };
        ip = a;
      }
      // Try ipapi.co, fall back to ipwho.is then ip-api.com if rate-limited / blocked.
      let j: any = null;
      let lastErr = "";
      try {
        const res = await fetch(`${IPAPI_BASE}/${ip}/json/`, { headers: { Accept: "application/json", "User-Agent": "ShadowXLab-Range/1.0" } });
        if (res.ok) {
          const tmp: any = await res.json();
          if (!tmp.error) j = tmp;
          else lastErr = tmp.reason ?? "ipapi error";
        } else {
          lastErr = `ipapi ${res.status}`;
        }
      } catch (e: any) { lastErr = e?.message ?? "ipapi network"; }

      if (!j) {
        try {
          const res = await fetch(`https://ipwho.is/${ip}`, { headers: { Accept: "application/json" } });
          if (res.ok) {
            const tmp: any = await res.json();
            if (tmp.success !== false) {
              j = {
                country_name: tmp.country, country: tmp.country_code,
                region: tmp.region, city: tmp.city,
                org: tmp.connection?.org ?? tmp.connection?.isp,
                asn: tmp.connection?.asn ? `AS${tmp.connection.asn}` : undefined,
                timezone: tmp.timezone?.id, latitude: tmp.latitude, longitude: tmp.longitude,
              };
            } else { lastErr = tmp.message ?? lastErr; }
          }
        } catch (e: any) { lastErr = e?.message ?? lastErr; }
      }

      if (!j) {
        try {
          const res = await fetch(`https://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,isp,org,as,timezone,lat,lon`);
          if (res.ok) {
            const tmp: any = await res.json();
            if (tmp.status === "success") {
              const asnMatch = String(tmp.as || "").match(/^(AS\d+)\s*(.*)$/i);
              j = {
                country_name: tmp.country, country: tmp.countryCode,
                region: tmp.regionName, city: tmp.city,
                org: tmp.org || tmp.isp || (asnMatch?.[2] ?? ""),
                asn: asnMatch?.[1],
                timezone: tmp.timezone, latitude: tmp.lat, longitude: tmp.lon,
              };
            } else { lastErr = tmp.message ?? lastErr; }
          }
        } catch (e: any) { lastErr = e?.message ?? lastErr; }
      }

      if (!j) return { ok: false, query: t, ip, raw: "", error: lastErr || "ip intel unavailable" };

      const out = {
        ok: true,
        query: t, ip,
        country: j.country_name, countryCode: j.country,
        region: j.region, city: j.city,
        org: j.org, asn: j.asn, timezone: j.timezone,
        raw: [
          `;; IP intelligence for ${t} → ${ip}`,
          `Country:   ${j.country_name} (${j.country})`,
          `Region:    ${j.region}`,
          `City:      ${j.city}`,
          `ASN:       ${j.asn}`,
          `Org:       ${j.org}`,
          `Timezone:  ${j.timezone}`,
          `Lat/Lng:   ${j.latitude}, ${j.longitude}`,
        ].join("\n"),
      };
      return out;
    } catch (e: any) {
      return { ok: false, query: t, raw: "", error: e?.message ?? "Network error" };
    }

  });

/* ──────────────────────────  TLS INSPECT  ────────────────────────────── */

export interface TlsInspectResult {
  ok: boolean; host: string;
  issuer?: string; commonName?: string; sans?: string[];
  notBefore?: string; notAfter?: string; serial?: string;
  raw: string; error?: string;
}

export const tlsInspect = createServerFn({ method: "POST" })
  .inputValidator((input: { target: string }) => input)
  .handler(async ({ data }): Promise<TlsInspectResult> => {
    const host = sanitize(data.target || "");
    if (!SAFE_TARGET.test(host)) return { ok: false, host, raw: "", error: "Invalid host" };
    try {
      const res = await fetch(`${CRTSH_BASE}${encodeURIComponent(host)}&exclude=expired`, { headers: { Accept: "application/json" } });
      if (!res.ok) return { ok: false, host, raw: "", error: `crt.sh ${res.status}` };
      const json: any[] = await res.json().catch(() => []);
      if (!json.length) return { ok: false, host, raw: "", error: "No certificates found" };
      json.sort((a, b) => String(b.not_before).localeCompare(String(a.not_before)));
      const top = json[0];
      const sans = String(top.name_value || "").split("\n").map(s => s.trim().toLowerCase().replace(/^\*\./, "")).filter(Boolean);
      const raw = [
        `;; TLS certificate for ${host} via Certificate Transparency`,
        `Issuer:        ${top.issuer_name}`,
        `Common Name:   ${top.common_name}`,
        `Not Before:    ${top.not_before}`,
        `Not After:     ${top.not_after}`,
        `Serial:        ${top.serial_number}`,
        `SANs (${sans.length}):`,
        ...sans.slice(0, 30).map(s => `  • ${s}`),
        sans.length > 30 ? `  ... (+${sans.length - 30})` : ``,
      ].filter(Boolean).join("\n");
      return {
        ok: true, host,
        issuer: top.issuer_name, commonName: top.common_name, sans,
        notBefore: top.not_before, notAfter: top.not_after, serial: top.serial_number,
        raw,
      };
    } catch (e: any) {
      return { ok: false, host, raw: "", error: e?.message ?? "Network error" };
    }
  });

/* ─────────────────────────  HTTP METHODS  ────────────────────────────── */

export interface HttpMethodsResult {
  ok: boolean; url: string; status?: number; allow?: string[]; raw: string; error?: string;
}

export const httpMethods = createServerFn({ method: "POST" })
  .inputValidator((input: { target: string }) => input)
  .handler(async ({ data }): Promise<HttpMethodsResult> => {
    const host = sanitize(data.target || "");
    if (!SAFE_TARGET.test(host)) return { ok: false, url: host, raw: "", error: "Invalid host" };
    const url = `https://${host}/`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, { method: "OPTIONS", signal: ctrl.signal, headers: { "User-Agent": "ShadowXLab-Range/1.0" } });
      clearTimeout(t);
      const allow = (res.headers.get("allow") || res.headers.get("access-control-allow-methods") || "").split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
      const risky = allow.filter(m => ["PUT", "DELETE", "TRACE", "CONNECT", "PATCH"].includes(m));
      const raw = [
        `OPTIONS ${url}`,
        `HTTP/${res.status} ${res.statusText}`,
        ``,
        `Allow: ${allow.length ? allow.join(", ") : "(not advertised)"}`,
        `Risky methods exposed: ${risky.length ? risky.join(", ") : "none"}`,
      ].join("\n");
      return { ok: true, url, status: res.status, allow, raw };
    } catch (e: any) {
      return { ok: false, url, raw: "", error: e?.message ?? "Network error" };
    }
  });
