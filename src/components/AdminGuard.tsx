import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useIsAdmin } from "@/hooks/useIsAdmin";

/**
 * Wrap any route subtree that should be admin-only.
 * Signed-in non-admins are redirected to /access-restricted.
 * Signed-out users are redirected to /auth.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin, userId } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!userId) { navigate({ to: "/auth" }); return; }
    if (!isAdmin) { navigate({ to: "/access-restricted" }); }
  }, [loading, isAdmin, userId, navigate]);

  if (loading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground text-sm">
        Verifying access…
      </div>
    );
  }
  return <>{children}</>;
}
