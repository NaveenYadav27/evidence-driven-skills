import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminGuard } from "@/components/AdminGuard";

export const Route = createFileRoute("/day1")({
  component: () => <AdminGuard><Outlet /></AdminGuard>,
});
