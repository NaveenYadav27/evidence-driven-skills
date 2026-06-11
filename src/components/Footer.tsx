import { BrandMark } from "./Brand";

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandMark className="h-7 w-auto opacity-90" />
          <div className="text-xs text-muted-foreground">
            <div className="font-semibold text-foreground">ShadowXLab · CEH v13 Cyber Range</div>
            <div>Empower · Illuminate · Uphold</div>
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
          Evidence-based learning · No scripted progress · Tracked telemetry
        </div>
      </div>
    </footer>
  );
}
