// "Welcome Back — Continue Learning" card. Pure read from engine; no fetch.
import { useProgress } from "@/lib/progress/engine";
import { Link } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";

export function ContinueLearningCard() {
  const session = useProgress((s) => s.session);
  if (!session?.lastRoute || session.lastRoute === "/" || session.lastRoute === "/dashboard") return null;

  return (
    <div className="panel panel-accent p-5 flex items-center gap-4">
      <div className="rounded-full bg-primary/15 p-3 text-primary">
        <PlayCircle className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Welcome Back</div>
        <div className="text-sm font-semibold mt-0.5">Last activity found</div>
        <div className="text-xs text-muted-foreground mt-0.5 font-mono truncate">{session.lastRoute}</div>
      </div>
      <Link
        to={session.lastRoute}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Continue Learning
      </Link>
    </div>
  );
}
