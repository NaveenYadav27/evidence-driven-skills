import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/day1")({
  component: () => <Outlet />,
});
