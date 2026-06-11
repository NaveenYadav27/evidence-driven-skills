import type { LucideIcon } from "lucide-react";

export function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  tone?: "default" | "red" | "cyan" | "success";
}) {
  const toneRing = {
    default: "before:opacity-30",
    red: "before:!bg-[linear-gradient(135deg,var(--primary),transparent_60%)] before:opacity-80",
    cyan: "before:!bg-[linear-gradient(135deg,var(--cyan),transparent_60%)] before:opacity-80",
    success: "before:!bg-[linear-gradient(135deg,var(--success),transparent_60%)] before:opacity-80",
  }[tone];
  const iconTone = {
    default: "text-muted-foreground",
    red: "text-primary",
    cyan: "text-[var(--cyan)]",
    success: "text-[var(--success)]",
  }[tone];

  return (
    <div className={`panel panel-accent ${toneRing} relative p-5 overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
          <div className="mt-2 font-mono text-3xl font-semibold tabular-nums">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <Icon className={`h-5 w-5 ${iconTone}`} />
      </div>
    </div>
  );
}
