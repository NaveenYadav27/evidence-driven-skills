import { createServerFn } from "@tanstack/react-start";

/**
 * Recon server functions. The Cloudflare Worker runtime has no `whois` or
 * `dig` binaries, so we use the equivalent standardized network APIs:
 *   - WHOIS  → RDAP (https://www.rfc-editor.org/rfc/rfc7483) via rdap.org
 *   - DNS    → DNS-over-HTTPS via Cloudflare (RFC 8484, JSON variant)
 * Results are REAL public data — not mocked.
 */

const ALLOWED = /^[a-z0-9.-]+\.[a-z]{2,}$/i;
const sanitize = (d: string) => d.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];

const RDAP_BASE = "https://rdap.org/domain/";
const DOH_BASE = "https://cloudflare-dns.com/dns-query";

const DNS_TYPES: Record<string, number> = {
  A: 1, NS: 2, CNAME: 5, SOA: 6, PTR: 12, MX: 15, TXT: 16, AAAA: 28, SRV: 33, CAA: 257,
};

export interface WhoisResult {
  ok: boolean;
  domain: string;
  registrar?: string;
  createdDate?: string;
  expiresDate?: string;
  updatedDate?: string;
  nameservers?: string[];
  statuses?: string[];
  raw: string;
  error?: string;
}

export const whoisLookup = createServerFn({ method: "POST" })
  .inputValidator((input: { domain: string }) => input)
  .handler(async ({ data }): Promise<WhoisResult> => {
    const domain = sanitize(data.domain || "");
    if (!ALLOWED.test(domain)) {
      return { ok: false, domain, raw: "", error: "Invalid domain format" };
    }
    try {
      const res = await fetch(RDAP_BASE + domain, { headers: { Accept: "application/rdap+json" } });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, domain, raw: body.slice(0, 2000), error: `RDAP ${res.status}` };
      }
      const json: any = await res.json();

      const events: Array<{ eventAction: string; eventDate: string }> = json.events ?? [];
      const created = events.find(e => e.eventAction === "registration")?.eventDate;
      const expires = events.find(e => e.eventAction === "expiration")?.eventDate;
      const updated = events.find(e => e.eventAction === "last changed" || e.eventAction === "last update of RDAP database")?.eventDate;

      const registrarEntity = (json.entities ?? []).find((e: any) =>
        (e.roles ?? []).includes("registrar"),
      );
      let registrar: string | undefined;
      if (registrarEntity?.vcardArray) {
        const arr = registrarEntity.vcardArray[1] ?? [];
        const fn = arr.find((v: any) => v[0] === "fn");
        registrar = fn?.[3];
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
        "",
        ">>> RDAP query complete.",
      ].join("\n");

      return { ok: true, domain, registrar, createdDate: created, expiresDate: expires, updatedDate: updated, nameservers, statuses, raw };
    } catch (e: any) {
      return { ok: false, domain, raw: "", error: e?.message ?? "Network error" };
    }
  });

export interface DnsAnswer { name: string; type: number; TTL: number; data: string; }
export interface DnsResult {
  ok: boolean;
  domain: string;
  type: string;
  answers: DnsAnswer[];
  raw: string;
  error?: string;
}

export const dnsLookup = createServerFn({ method: "POST" })
  .inputValidator((input: { domain: string; type?: string }) => input)
  .handler(async ({ data }): Promise<DnsResult> => {
    const domain = sanitize(data.domain || "");
    const type = (data.type || "A").toUpperCase();
    if (!ALLOWED.test(domain)) {
      return { ok: false, domain, type, answers: [], raw: "", error: "Invalid domain format" };
    }
    if (!(type in DNS_TYPES)) {
      return { ok: false, domain, type, answers: [], raw: "", error: `Unsupported type ${type}` };
    }
    try {
      const url = `${DOH_BASE}?name=${encodeURIComponent(domain)}&type=${type}`;
      const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
      if (!res.ok) {
        return { ok: false, domain, type, answers: [], raw: "", error: `DoH ${res.status}` };
      }
      const json: any = await res.json();
      const answers: DnsAnswer[] = json.Answer ?? [];
      const header = [
        `;; DiG-equivalent over DoH (Cloudflare 1.1.1.1)`,
        `;; QUESTION SECTION:`,
        `;${domain}.\t\tIN\t${type}`,
        ``,
        `;; ANSWER SECTION:`,
      ].join("\n");
      const body = answers.length
        ? answers.map(a => `${a.name}\t${a.TTL}\tIN\t${typeName(a.type)}\t${a.data}`).join("\n")
        : ";; (no answer)";
      const footer = `\n\n;; Query time: live\n;; SERVER: 1.1.1.1#443(DoH)\n;; MSG SIZE  rcvd: ${JSON.stringify(json).length}`;
      return { ok: true, domain, type, answers, raw: header + "\n" + body + footer };
    } catch (e: any) {
      return { ok: false, domain, type, answers: [], raw: "", error: e?.message ?? "Network error" };
    }
  });

function typeName(n: number): string {
  const entry = Object.entries(DNS_TYPES).find(([, v]) => v === n);
  return entry?.[0] ?? String(n);
}
