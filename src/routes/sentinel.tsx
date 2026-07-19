import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sentinel")({
  head: () => ({
    meta: [
      { title: "Sentinel — Wireless & Mobile IoT Security" },
      { name: "description", content: "Sentinel dashboard for wireless, mobile, and IoT security operations." },
      { property: "og:title", content: "Sentinel — Wireless & Mobile IoT Security" },
      { property: "og:description", content: "Sentinel dashboard for wireless, mobile, and IoT security operations." },
    ],
  }),
  component: SentinelPage,
});

function SentinelPage() {
  return (
    <iframe
      src="/sentinel.html"
      title="Sentinel"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", border: 0 }}
    />
  );
}
