import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AccessGuard } from "@/components/AccessGuard";

export const Route = createFileRoute("/modules")({
  component: () => <AccessGuard><Outlet /></AccessGuard>,
});
