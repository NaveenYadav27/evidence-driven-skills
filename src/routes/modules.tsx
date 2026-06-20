import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AdminGuard } from "@/components/AdminGuard";

export const Route = createFileRoute("/modules")({
  component: () => <AdminGuard><Outlet /></AdminGuard>,
});
