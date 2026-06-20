import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAccess } from "@/hooks/useAccess";

/**
 * Permits admins AND enrolled students (full/demo).
 * - Signed-out → /auth
 * - Signed-in but no enrollment / suspended → /access-restricted
 */
export function AccessGuard({ children }: { children: React.ReactNode }) {
  const { loading, userId, hasAccess } = useAccess();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!userId) { navigate({ to: "/auth" }); return; }
    if (!hasAccess) { navigate({ to: "/access-restricted" }); }
  }, [loading, userId, hasAccess, navigate]);

  if (loading || !userId || !hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground text-sm">
        Verifying access…
      </div>
    );
  }
  return <>{children}</>;
}
