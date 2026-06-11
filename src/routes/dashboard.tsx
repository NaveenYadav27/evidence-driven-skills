import { createFileRoute } from "@tanstack/react-router";
import { LiveDashboard } from "@/components/LiveDashboard";
import { useTelemetry } from "@/lib/telemetry";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · CEH v13 Cyber Range" },
      { name: "description", content: "Live telemetry of your CEH v13 lab activity, tool mastery, and exam readiness." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const reset = useTelemetry((s) => s.reset);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="chip chip-live mb-2"><span className="dot-live" /> Telemetry Live</div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Every number on this page is computed from your real, tracked actions.</p>
        </div>
        <button
          onClick={() => { if (confirm("Reset all local telemetry? This cannot be undone.")) reset(); }}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:text-primary hover:border-primary/50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Reset Telemetry
        </button>
      </div>
      <LiveDashboard />
    </div>
  );
}
