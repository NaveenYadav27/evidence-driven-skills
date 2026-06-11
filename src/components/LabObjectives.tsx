import { useEffect, useMemo, useState } from "react";
import type { Lab } from "@/data/labs";
import { useTelemetry } from "@/lib/telemetry";
import { CheckCircle2, Circle, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

/** Validators for finding-type objectives. Cross-check against live data when possible. */
async function validateFinding(target: string | undefined, key: string, value: string): Promise<boolean> {
  const v = value.trim().toLowerCase();
  if (!v || !target) return false;

  // Numeric / year fields — accept range checks without remote validation.
  if (key === "createdYear" || key === "firstSeenYear") {
    const y = parseInt(v, 10);
    return Number.isFinite(y) && y >= 1990 && y <= new Date().getFullYear();
  }
  if (key === "subdomainCount" || key === "snapshotCount") {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 1;
  }

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
      const map: Record<string, string> = {
        hstsPresent: "strict-transport-security",
        cspPresent: "content-security-policy",
        xfoPresent: "x-frame-options",
      };
      const present = !!r.headers.get(map[key]);
      if (v === "yes" || v === "true" || v === "present") return present;
      if (v === "no" || v === "false" || v === "missing") return !present;
      return false;
    }
    if (key === "disallowPath") {
      const r = await fetch(`https://${target}/robots.txt`);
      if (!r.ok) return false;
      const txt = (await r.text()).toLowerCase();
      const paths = new Set<string>();
      for (const line of txt.split(/\r?\n/)) {
        const m = line.match(/^\s*disallow\s*:\s*(\S+)/i);
        if (m) paths.add(m[1].trim().toLowerCase());
      }
      return paths.has(v) || paths.has(v.replace(/\/$/, "")) || paths.has(v + "/");
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
