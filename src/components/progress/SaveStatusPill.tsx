import { useSaveStatus } from "@/lib/progress/save-status";
import { Loader2, CheckCircle2, RefreshCw, AlertTriangle, CloudDownload, CircleDashed } from "lucide-react";

const META = {
  idle:     { icon: CircleDashed,   label: "Idle",        cls: "text-muted-foreground" },
  saving:   { icon: Loader2,        label: "Saving…",     cls: "text-cyan-300",        spin: true },
  saved:    { icon: CheckCircle2,   label: "Saved",       cls: "text-emerald-300" },
  restored: { icon: CloudDownload,  label: "Restored",    cls: "text-sky-300" },
  retrying: { icon: RefreshCw,      label: "Retrying",    cls: "text-amber-300",       spin: true },
  failed:   { icon: AlertTriangle,  label: "Sync Failed", cls: "text-red-400" },
} as const;

export function SaveStatusPill() {
  const status = useSaveStatus((s) => s.status);
  const lastSavedAt = useSaveStatus((s) => s.lastSavedAt);
  const m = META[status];
  const Icon = m.icon;
  const ts = lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : "never";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] ${m.cls}`}
      title={`Database save status: ${m.label} · last saved ${ts}`}
    >
      <Icon className={`h-3 w-3 ${"spin" in m && m.spin ? "animate-spin" : ""}`} />
      <span className="hidden sm:inline">{m.label}</span>
    </span>
  );
}
