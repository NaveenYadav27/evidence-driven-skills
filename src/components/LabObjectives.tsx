import { useEffect, useMemo, useState } from "react";
import type { Lab } from "@/data/labs";
import { useTelemetry } from "@/lib/telemetry";
import { CheckCircle2, Circle, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

/** Validators for finding-type objectives. Cross-check live data when possible;
 *  otherwise apply strict format/value rules so guessing is hard. */
const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/;
const HEX_64 = /^[0-9a-f]{64}$/;
const CVE_RX = /^cve-\d{4}-\d{4,7}$/;

const KILL_CHAIN = new Set(["recon","reconnaissance","weaponization","delivery","exploitation","installation","c2","command-and-control","actions","actions-on-objectives"]);
const ATTACK_TACTICS = new Set(["reconnaissance","resource-development","initial-access","execution","persistence","privilege-escalation","defense-evasion","credential-access","discovery","lateral-movement","collection","command-and-control","exfiltration","impact"]);
const AMP_PROTOS = new Set(["dns","ntp","memcached","ssdp","chargen","snmp","ldap"]);
const RISKY_METHODS = new Set(["put","delete","trace","connect","patch"]);
const SUID_BINS = new Set(["find","vim","nmap","bash","less","more","awk","perl","python","tar","zip","cp","mv","tee","nano","env","wget","curl","gdb","ftp","sed","man","sudo","systemctl"]);

async function validateFinding(target: string | undefined, key: string, value: string): Promise<boolean> {
  const v = value.trim().toLowerCase();
  if (!v) return false;

  // ── format-only checks (no network) ─────────────────────────────────
  switch (key) {
    case "createdYear":
    case "firstSeenYear": {
      const y = parseInt(v, 10); return Number.isFinite(y) && y >= 1990 && y <= new Date().getFullYear();
    }
    case "subdomainCount":
    case "snapshotCount":
    case "hstsMaxAge":
    case "handshakeMessages":
    case "mqttPort":
    case "mqttTlsPort":
    case "arpOpcode":
    case "ampFactor": {
      const n = parseInt(v, 10);
      if (!Number.isFinite(n)) return false;
      if (key === "handshakeMessages") return n === 4;
      if (key === "mqttPort") return n === 1883;
      if (key === "mqttTlsPort") return n === 8883;
      if (key === "arpOpcode") return n === 1 || n === 2;
      if (key === "ampFactor") return n >= 20 && n <= 80;
      if (key === "hstsMaxAge") return n >= 0;
      return n >= 1;
    }
    case "cveId": return CVE_RX.test(v);
    case "cvssScore": { const f = parseFloat(v); return Number.isFinite(f) && f >= 0 && f <= 10; }
    case "cvssVector": return /^cvss:3\.[01]\/av:[nalp]\/ac:[lh]\/pr:[nlh]\/ui:[nr]\/s:[uc]\/c:[nlh]\/i:[nlh]\/a:[nlh]$/.test(v);
    case "killChainPhase": return KILL_CHAIN.has(v);
    case "attackTechniqueId": return /^t\d{4}(\.\d{3})?$/.test(v);
    case "attackTactic": return ATTACK_TACTICS.has(v);
    case "ipAddress": return IPV4.test(v);
    case "ipCountry": return /^[a-z]{2}$/.test(v);
    case "asn": return /^as\d{1,7}$/.test(v);
    case "riskyMethod": return RISKY_METHODS.has(v);
    case "spfInclude": return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(v);
    case "caaIssuer": return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(v);
    case "crackedPassword": return ["password","123456","qwerty","letmein","admin","welcome","hunter2","shadow","dragon","monkey","iloveyou","abc123","ceh","shadowxlab","hacker","root"].includes(v);
    case "suidBinary": return SUID_BINS.has(v);
    case "sha256Hex": return HEX_64.test(v);
    case "helloSha256": return v === "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";
    case "username": return v === "admin";
    case "password": return v === "hunter2";
    case "dmarcPolicy": return ["none","quarantine","reject"].includes(v);
    case "ampProtocol": return AMP_PROTOS.has(v);
    case "jwtAlg": return ["none","hs256","hs384","hs512","rs256","rs384","rs512","es256","es384","ps256"].includes(v);
    case "jwtUser": return v === "admin";
    case "cookieHttpOnly":
    case "cookieSecure": return v === "present" || v === "missing";
    case "nmapFrag": return v === "-f";
    case "nmapDecoy": return v === "-d";
    case "xssPayload": return /<\s*script|onerror\s*=|onload\s*=|javascript:|<\s*img[^>]+src/i.test(value);
    case "sqliPayload": return /('|")?\s*or\s+1\s*=\s*1/i.test(value) || /--\s*$/.test(value) || /union\s+select/i.test(value);
    case "sqlKeyword": return v === "union";
    case "ethertype": return v === "0x0806" || v === "0806";
    case "pmkAlgo": return /pbkdf2/.test(v);
    case "androidPermission": return /^android\.permission\.[a-z_]+$/i.test(value);
    case "s3Suffix": return /^s3([.-][a-z0-9-]+)?\.amazonaws\.com$/.test(v);
    case "imdsIp": return v === "169.254.169.254";
    case "xorPlaintext": return v === "xlab is fun";
    case "certIssuer":
    case "tlsIssuer":
    case "asnOrg": return v.length >= 2;
    case "spfQualifier": return ["~all","-all","?all","+all"].includes(v);
    case "ptrHost": return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(v);
  }

  // ── live cross-checks (need target) ─────────────────────────────────
  if (!target) return false;
  try {
    if (key === "mx") {
      const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${target}&type=MX`, { headers: { Accept: "application/dns-json" } });
      const j: any = await r.json();
      const hosts: string[] = (j.Answer ?? []).map((a: any) => String(a.data).trim().toLowerCase().replace(/\.$/, "").split(/\s+/).pop() ?? "");
      return hosts.some((h) => h === v.replace(/\.$/, ""));
    }
    if (key === "ns") {
      const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${target}&type=NS`, { headers: { Accept: "application/dns-json" } });
      const j: any = await r.json();
      const hosts: string[] = (j.Answer ?? []).map((a: any) => String(a.data).trim().toLowerCase().replace(/\.$/, ""));
      return hosts.includes(v.replace(/\.$/, ""));
    }
    if (key === "registrar") {
      const r = await fetch(`https://rdap.org/domain/${target}`, { headers: { Accept: "application/rdap+json" } });
      const j: any = await r.json();
      const entity = (j.entities ?? []).find((e: any) => (e.roles ?? []).includes("registrar"));
      const fn = entity?.vcardArray?.[1]?.find((x: any) => x[0] === "fn")?.[3] ?? entity?.handle ?? "";
      const f = String(fn).trim().toLowerCase();
      return !!f && (f.includes(v) || v.includes(f));
    }
    if (key === "subdomain") {
      if (!v.endsWith(target.toLowerCase())) return false;
      const r = await fetch(`https://crt.sh/?output=json&q=${encodeURIComponent("%." + target)}`);
      const j: any[] = await r.json().catch(() => []);
      const set = new Set<string>();
      for (const row of j) for (const n of String(row.name_value || "").split("\n")) {
        set.add(n.trim().toLowerCase().replace(/^\*\./, ""));
      }
      return set.has(v);
    }
    if (key === "serverHeader") {
      const r = await fetch(`https://${target}/`, { method: "GET", redirect: "follow" });
      const s = (r.headers.get("server") || "").trim().toLowerCase();
      return !!s && (s.includes(v) || v.includes(s));
    }
    if (key === "hstsPresent" || key === "cspPresent" || key === "xfoPresent") {
      const r = await fetch(`https://${target}/`, { method: "GET", redirect: "follow" });
      const map: Record<string, string> = { hstsPresent: "strict-transport-security", cspPresent: "content-security-policy", xfoPresent: "x-frame-options" };
      const present = !!r.headers.get(map[key]);
      if (["yes","true","present"].includes(v)) return present;
      if (["no","false","missing"].includes(v)) return !present;
      return false;
    }
    if (key === "disallowPath" || key === "robotsDisallow") {
      if (!v.startsWith("/")) return false;
      const r = await fetch(`https://${target}/robots.txt`);
      if (!r.ok) return false;
      const txt = (await r.text()).toLowerCase();
      const paths = new Set<string>();
      for (const line of txt.split(/\r?\n/)) { const m = line.match(/^\s*disallow\s*:\s*(\S+)/i); if (m) paths.add(m[1].trim().toLowerCase()); }
      return paths.has(v) || paths.has(v.replace(/\/$/, "")) || paths.has(v + "/");
    }
    if (key === "robotsUserAgent") {
      const r = await fetch(`https://${target}/robots.txt`);
      if (!r.ok) return false;
      const txt = (await r.text()).toLowerCase();
      const uas = new Set<string>();
      for (const line of txt.split(/\r?\n/)) { const m = line.match(/^\s*user-agent\s*:\s*(.+?)\s*$/i); if (m) uas.add(m[1].trim().toLowerCase()); }
      return uas.has(v);
    }
    if (key === "tlsSan") {
      if (!v.endsWith(target.toLowerCase())) return false;
      const r = await fetch(`https://crt.sh/?output=json&q=${encodeURIComponent("%." + target)}`);
      const j: any[] = await r.json().catch(() => []);
      const set = new Set<string>();
      for (const row of j) for (const n of String(row.name_value || "").split("\n")) {
        set.add(n.trim().toLowerCase().replace(/^\*\./, ""));
      }
      return set.has(v);
    }
  } catch {
    return false;
  }
  return false;
}

export function LabObjectives({ lab }: { lab: Lab }) {
  const ensureLab = useTelemetry((s) => s.ensureLab);
  const labState = useTelemetry((s) => s.labs[lab.id]);
  const satisfy = useTelemetry((s) => s.satisfyObjective);
  const attempt = useTelemetry((s) => s.attemptObjective);
  const completeLab = useTelemetry((s) => s.completeLab);
  const setFinding = useTelemetry((s) => s.setFinding);

  const [validating, setValidating] = useState<string | null>(null);

  useEffect(() => { ensureLab(lab.id); }, [lab.id, ensureLab]);

  const allDone = useMemo(
    () => lab.objectives.every((o) => labState?.objectives[o.id]?.satisfied),
    [lab.objectives, labState],
  );

  useEffect(() => {
    if (allDone && labState && !labState.completedAt) {
      completeLab(lab.id);
      toast.success(`Lab completed: ${lab.title}`, { description: "Evidence validated. Credit awarded." });
    }
  }, [allDone, labState, lab.id, lab.title, completeLab]);

  const submitFinding = async (key: string) => {
    const value = (labState?.findings[key] ?? "").trim();
    if (!value) return;
    setValidating(key);
    const obj = lab.objectives.find((o) => o.type === "finding" && o.key === key);
    if (obj) attempt(lab.id, obj.id);
    const ok = await validateFinding(lab.target, key, value);
    setValidating(null);
    if (ok && obj) {
      satisfy(lab.id, obj.id);
      toast.success(`✓ ${obj.label}`);
    } else {
      toast.error("Finding rejected", { description: "Value did not validate against the live target." });
    }
  };

  return (
    <div className="panel p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Objectives</h3>
        {allDone ? (
          <span className="chip chip-live"><Trophy className="h-3 w-3" /> Completed</span>
        ) : (
          <span className="chip chip-red">{lab.objectives.filter(o => labState?.objectives[o.id]?.satisfied).length}/{lab.objectives.length}</span>
        )}
      </div>

      <ul className="space-y-2">
        {lab.objectives.map((o) => {
          const state = labState?.objectives[o.id];
          const done = !!state?.satisfied;
          return (
            <li key={o.id} className="flex items-start gap-3 text-sm">
              {done ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-[var(--success)]" /> : <Circle className="h-4 w-4 mt-0.5 text-muted-foreground" />}
              <div className="flex-1">
                <div className={done ? "line-through text-muted-foreground" : ""}>{o.label}</div>
                {o.hint && <div className="text-xs text-muted-foreground/80 mt-0.5">{o.hint}</div>}
              </div>
              {state && state.attempts > 0 && (
                <span className="text-[10px] text-muted-foreground font-mono">×{state.attempts}</span>
              )}
            </li>
          );
        })}
      </ul>

      {lab.findingFields && lab.findingFields.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Submit Findings</div>
          {lab.findingFields.map((f) => {
            const objective = lab.objectives.find((o) => o.type === "finding" && o.key === f.key);
            const done = objective && labState?.objectives[objective.id]?.satisfied;
            return (
              <div key={f.key} className="space-y-1.5">
                <label className="text-xs text-muted-foreground flex items-center gap-2">
                  {f.label}
                  {done && <span className="chip chip-live !py-0 !px-1.5 text-[10px]">verified</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    disabled={done}
                    placeholder={f.placeholder}
                    value={labState?.findings[f.key] ?? ""}
                    onChange={(e) => setFinding(lab.id, f.key, e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background/60 px-3 py-2 text-sm font-mono outline-none focus:border-[var(--cyan)] disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={done || validating === f.key}
                    onClick={() => submitFinding(f.key)}
                    className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40 inline-flex items-center gap-1.5"
                  >
                    {validating === f.key && <Loader2 className="h-3 w-3 animate-spin" />}
                    Validate
                  </button>
                </div>
                {f.help && <p className="text-[11px] text-muted-foreground/80">{f.help}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
