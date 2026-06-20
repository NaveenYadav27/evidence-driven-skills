import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AccessGuard } from "@/components/AccessGuard";

export const Route = createFileRoute("/ops")({
  component: () => <AccessGuard><Outlet /></AccessGuard>,
});
