import logoAsset from "@/assets/shadowxlab-logo.png.asset.json";

export function BrandMark({ className = "h-8 w-auto" }: { className?: string }) {
  return <img src={logoAsset.url} alt="ShadowXLab" className={className} />;
}

export function PlatformBadge() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark className="h-9 w-auto" />
      <div className="hidden md:flex flex-col leading-none">
        <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">ShadowXLab</span>
        <span className="text-sm font-semibold tracking-tight">CEH v13 Cyber Range</span>
      </div>
    </div>
  );
}
