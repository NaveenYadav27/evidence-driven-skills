import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAccess } from "@/hooks/useAccess";

/**
 * Temporary open-access window: until OPEN_ACCESS_UNTIL, everyone is let in
 * with no login and no enrollment check. After that timestamp, normal gating
 * (signed-out → /auth, no enrollment → /access-restricted) resumes.
 */
const OPEN_ACCESS_UNTIL = Date.parse("2026-07-13T23:59:59Z"); // 48h open window

export function AccessGuard({ children }: { children: React.ReactNode }) {
  const { loading, userId, hasAccess } = useAccess();
  const navigate = useNavigate();
  const openAccess = Date.now() < OPEN_ACCESS_UNTIL;

  useEffect(() => {
    if (openAccess) return;
    if (loading) return;
    if (!userId) { navigate({ to: "/auth" }); return; }
    if (!hasAccess) { navigate({ to: "/access-restricted" }); }
  }, [openAccess, loading, userId, hasAccess, navigate]);

  if (openAccess) return <>{children}</>;

  if (loading || !userId || !hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground text-sm">
        Verifying access…
      </div>
    );
  }
  return <>{children}</>;
}
