import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, BarChart3, UserPlus, LifeBuoy, Activity, Eye, History,
  RefreshCw, Search, X, KeyRound, Trash2, UserMinus, UserCheck, ShieldCheck, Loader2,
} from "lucide-react";
import {
  checkAmIAdmin, listUsers, getUserDetail, setSuspended, resetPassword,
  deleteUser, setEnrollment, setSocTier, listCatalog, inviteUser,
  listInvites, listAudit,
} from "@/lib/admin.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · ShadowXLab LMS" }] }),
  component: AdminConsole,
});

const TABS = [
  { id: "users", label: "Users", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "invite", label: "Invite", icon: UserPlus },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "traffic", label: "Traffic", icon: Activity },
  { id: "visitors", label: "Visitors", icon: Eye },
  { id: "audit", label: "Audit", icon: History },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminConsole() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<"loading" | "ok" | "deny">("loading");
  const [tab, setTab] = useState<TabId>("users");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate({ to: "/auth" }); return; }
      try {
        const r = await checkAmIAdmin();
        if (!alive) return;
        setAuthState(r.isAdmin ? "ok" : "deny");
        if (!r.isAdmin) navigate({ to: "/access-restricted" });
      } catch {
        if (alive) { setAuthState("deny"); navigate({ to: "/access-restricted" }); }
      }
    })();
    return () => { alive = false; };
  }, [navigate]);

  if (authState !== "ok") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-400" />
          <h1 className="text-2xl font-bold">SHADOWXLAB<span className="text-amber-400">®</span> Centre for Cybersecurity Excellence</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Click on any user to manage courses, modules, and access</p>
      </header>

      <div className="border-b border-border mb-6">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative inline-flex items-center gap-2 px-5 py-3 text-sm transition ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {active && <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-[var(--cyan)] rounded" />}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "users" && <UsersTab />}
      {tab === "reports" && <ReportsTab />}
      {tab === "invite" && <InviteTab />}
      {tab === "support" && <Placeholder title="Support" body="Inbox for student tickets — coming next." />}
      {tab === "traffic" && <Placeholder title="Traffic" body="Real-time platform traffic — coming next." />}
      {tab === "visitors" && <Placeholder title="Visitors" body="Anonymous visitor analytics — coming next." />}
      {tab === "audit" && <AuditTab />}
    </div>
  );
}

/* ─────────── Users ─────────── */

function UsersTab() {
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: () => listUsers() });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "subscribed" | "demo" | "registered">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = users.data ?? [];
    return list.filter((u) => {
      if (statusFilter !== "all" && u.segment !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (u.email ?? "").toLowerCase().includes(q) ||
        (u.fullName ?? "").toLowerCase().includes(q) ||
        (u.ssid ?? "").toLowerCase().includes(q);
    });
  }, [users.data, search, statusFilter]);

  const grouped = useMemo(() => {
    return {
      subscribed: filtered.filter((u) => u.segment === "subscribed"),
      demo: filtered.filter((u) => u.segment === "demo"),
      registered: filtered.filter((u) => u.segment === "registered"),
    };
  }, [filtered]);

  const totals = users.data ?? [];

  return (
    <>
      <div className="panel p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">All Users ({totals.length})</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="text-emerald-400">{totals.filter((u) => u.segment === "subscribed").length} subscribed</span>
              {" · "}
              <span className="text-amber-400">{totals.filter((u) => u.segment === "demo").length} demo</span>
              {" · "}
              <span>{totals.filter((u) => u.segment === "registered").length} registered</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Click any user row to manage their access, courses, and modules</p>
          </div>
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ["admin", "users"] })}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:border-primary/60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${users.isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="mt-4 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, name, or SSID..."
              className="w-full rounded-md bg-secondary/40 border border-border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary/60"
            />
          </div>
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-md bg-secondary/40 border border-border px-3 py-2.5 text-sm min-w-[180px]"
          >
            <option value="all">All Status</option>
            <option value="subscribed">Subscribed</option>
            <option value="demo">Demo</option>
            <option value="registered">Registered</option>
          </select>
        </div>
      </div>

      <UserSection title={`Subscribed Users (${grouped.subscribed.length})`} desc="Active course enrollments (paid users)" dot="bg-emerald-500" users={grouped.subscribed} onOpen={setOpenId} />
      <UserSection title={`Demo Users (${grouped.demo.length})`} desc="Trial access — limited modules" dot="bg-amber-500" users={grouped.demo} onOpen={setOpenId} />
      <UserSection title={`Registered Users (${grouped.registered.length})`} desc="Signed up — no course assigned" dot="bg-zinc-500" users={grouped.registered} onOpen={setOpenId} />

      {openId && <UserDetailSheet userId={openId} onClose={() => setOpenId(null)} />}
    </>
  );
}

function UserSection({ title, desc, dot, users, onOpen }: {
  title: string; desc: string; dot: string; users: any[]; onOpen: (id: string) => void;
}) {
  if (users.length === 0) return null;
  return (
    <div className="panel p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <h3 className="text-base font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">SSID</th>
              <th className="py-2 pr-4">Courses</th>
              <th className="py-2 pr-4">Progress</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Hours</th>
              <th className="py-2 pr-4 text-right">Manage</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/40 hover:bg-secondary/30 cursor-pointer" onClick={() => onOpen(u.id)}>
                <td className="py-3 pr-4">
                  <div className="font-medium">{u.fullName}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="py-3 pr-4">
                  <span className="rounded-md border border-border px-2 py-0.5 text-xs font-mono">{u.ssid ?? "—"}</span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {u.courses.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    {u.courses.map((c: any) => (
                      <span key={c.id} className="rounded-md bg-blue-500/15 text-blue-300 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                        {c.slug?.split("-")[0] ?? c.title}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 pr-4 min-w-[120px]">
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-[var(--cyan)]" style={{ width: `${u.progressPct}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{u.progressPct}%</div>
                </td>
                <td className="py-3 pr-4">
                  <StatusPill segment={u.segment} suspended={u.suspended} />
                </td>
                <td className="py-3 pr-4 text-xs">{u.hoursSpent}h</td>
                <td className="py-3 pr-4 text-right">
                  <button className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-border hover:border-primary/60" onClick={(e) => { e.stopPropagation(); onOpen(u.id); }}>
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ segment, suspended }: { segment: string; suspended: boolean }) {
  if (suspended) return <span className="rounded-md bg-red-500/15 text-red-300 px-2 py-0.5 text-xs">Suspended</span>;
  if (segment === "subscribed") return <span className="rounded-md bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-xs">Full Access</span>;
  if (segment === "demo") return <span className="rounded-md bg-amber-500/15 text-amber-300 px-2 py-0.5 text-xs">Demo</span>;
  return <span className="rounded-md bg-zinc-500/15 text-zinc-300 px-2 py-0.5 text-xs">Registered</span>;
}

/* ─────────── User detail sheet ─────────── */

function UserDetailSheet({ userId, onClose }: { userId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const detail = useQuery({ queryKey: ["admin", "user", userId], queryFn: () => getUserDetail({ data: { userId } }) });
  const catalog = useQuery({ queryKey: ["admin", "catalog"], queryFn: () => listCatalog() });
  const [tab, setTab] = useState<"overview" | "courses" | "modules" | "access" | "assignment" | "mentor">("overview");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "user", userId] });
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const mSuspend = useMutation({ mutationFn: setSuspended, onSuccess: () => { toast.success("Updated"); invalidate(); } });
  const mReset = useMutation({
    mutationFn: resetPassword,
    onSuccess: (r) => {
      toast.success("Recovery link generated");
      if (r.link) navigator.clipboard.writeText(r.link).then(() => toast.message("Link copied to clipboard"));
    },
  });
  const mDelete = useMutation({ mutationFn: deleteUser, onSuccess: () => { toast.success("User deleted"); onClose(); invalidate(); } });
  const mEnroll = useMutation({ mutationFn: setEnrollment, onSuccess: () => { toast.success("Enrollment updated"); invalidate(); } });
  const mTier = useMutation({ mutationFn: setSocTier, onSuccess: () => { toast.success("Tier updated"); invalidate(); } });

  if (detail.isLoading) {
    return (
      <Sheet onClose={onClose}>
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </Sheet>
    );
  }

  const d = detail.data!;
  const p = d.profile;
  const name = p?.full_name ?? d.auth?.email?.split("@")[0] ?? "User";
  const initial = name?.[0]?.toUpperCase() ?? "?";
  const totalHours = d.enrollments.reduce((s: number, e: any) => s + Number(e.hours_spent || 0), 0);
  const avgPct = d.enrollments.length
    ? Math.round(d.enrollments.reduce((s: number, e: any) => s + Number(e.progress_pct || 0), 0) / d.enrollments.length)
    : 0;
  const isSuspended = !!p?.suspended;
  const hasFull = d.enrollments.some((e: any) => e.status === "full");

  return (
    <Sheet onClose={onClose}>
      <div className="flex items-start gap-4 mb-6">
        <div className="h-14 w-14 rounded-full bg-cyan-500/20 flex items-center justify-center text-2xl font-semibold text-cyan-300">{initial}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold truncate">{name}</h2>
          <div className="text-sm text-muted-foreground truncate">{d.auth?.email}</div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="rounded-md border border-border px-2 py-0.5 text-xs font-mono">{p?.ssid ?? "—"}</span>
            <StatusPill segment={hasFull ? "subscribed" : (d.enrollments.length ? "demo" : "registered")} suspended={isSuspended} />
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          Joined {d.auth?.created_at ? new Date(d.auth.created_at).toLocaleDateString() : "—"}
          <button onClick={onClose} className="ml-3 inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard value={d.enrollments.length} label="Courses" />
        <StatCard value={d.moduleAssignments.length} label="Modules" />
        <StatCard value={`${totalHours}h`} label="Learning" />
        <StatCard value={`${avgPct}%`} label="Complete" />
      </div>

      <div className="border-b border-border mb-5">
        <div className="flex gap-1 overflow-x-auto">
          {(["overview", "courses", "modules", "access", "assignment", "mentor"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`relative px-4 py-2.5 text-sm capitalize ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t}
              {tab === t && <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-[var(--cyan)] rounded" />}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
            <div>Email Verified: <span className={d.auth?.email_confirmed_at ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>{d.auth?.email_confirmed_at ? "Yes" : "No"}</span></div>
            <div>Country: <span className="text-muted-foreground">{p?.country ?? "—"}</span></div>
            <div>Last Active: <span className="font-medium">{d.auth?.last_sign_in_at ? new Date(d.auth.last_sign_in_at).toLocaleString() : "Never"}</span></div>
            <div>Demo Used: <span className="font-medium">N/A</span></div>
          </div>
          <div className="border-t border-border pt-5">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => mSuspend.mutate({ data: { userId, suspended: !isSuspended } })} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:border-primary/60">
                {isSuspended ? <UserCheck className="h-3.5 w-3.5" /> : <UserMinus className="h-3.5 w-3.5" />}
                {isSuspended ? "Unsuspend" : "Suspend"}
              </button>
              <button onClick={() => mReset.mutate({ data: { userId } })} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:border-primary/60">
                <KeyRound className="h-3.5 w-3.5" /> Reset Password
              </button>
              <button
                onClick={() => { if (confirm("Permanently delete this user?")) mDelete.mutate({ data: { userId } }); }}
                className="inline-flex items-center gap-2 rounded-md bg-red-500/90 hover:bg-red-500 px-3 py-2 text-sm text-white"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
          <div className="border-t border-border pt-5 mt-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-400" /> CyberOPS Analyst Tier</h3>
            <p className="text-xs text-muted-foreground mb-3">Assign a SOC analyst role to control which tools, alerts, and actions this student can access in the CyberOPS platform.</p>
            <select
              value={d.socTier ?? ""}
              onChange={(e) => mTier.mutate({ data: { userId, tier: e.target.value || null } })}
              className="w-full rounded-md bg-secondary/40 border border-border px-3 py-2.5 text-sm"
            >
              <option value="">— Not Assigned —</option>
              <option value="tier1">Tier 1 — Analyst</option>
              <option value="tier2">Tier 2 — Senior Analyst</option>
              <option value="tier3">Tier 3 — Incident Responder</option>
              <option value="lead">SOC Lead</option>
            </select>
          </div>
        </div>
      )}

      {(tab === "courses" || tab === "access") && (
        <div className="space-y-2">
          {(catalog.data?.courses ?? []).map((c: any) => {
            const e = d.enrollments.find((x: any) => x.course_id === c.id);
            const status = e?.status ?? "revoked";
            return (
              <div key={c.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.description}</div>
                </div>
                <select
                  value={status}
                  onChange={(ev) => mEnroll.mutate({ data: { userId, courseId: c.id, status: ev.target.value as any } })}
                  className="rounded-md bg-secondary/40 border border-border px-2 py-1.5 text-xs"
                >
                  <option value="revoked">No Access</option>
                  <option value="demo">Demo</option>
                  <option value="full">Full Access</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            );
          })}
        </div>
      )}

      {tab === "modules" && (
        <div className="space-y-2">
          {(catalog.data?.modules ?? []).map((m: any) => {
            const assigned = d.moduleAssignments.some((x: any) => x.module_id === m.id);
            return (
              <div key={m.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <div className="font-medium text-sm">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.hours}h</div>
                </div>
                <span className={`text-xs ${assigned ? "text-emerald-400" : "text-muted-foreground"}`}>{assigned ? "Assigned" : "Not assigned"}</span>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground pt-2">Bulk module assignment coming in next release. Use Courses tab to grant full access today.</p>
        </div>
      )}

      {tab === "assignment" && (
        <div className="text-sm text-muted-foreground">Lab assignment tracker — coming next.</div>
      )}
      {tab === "mentor" && (
        <div className="text-sm text-muted-foreground">Mentor assignment — coming next.</div>
      )}
    </Sheet>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl h-full overflow-y-auto bg-background border-l border-border p-6" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: any; label: string }) {
  return (
    <div className="rounded-md bg-secondary/40 border border-border p-4 text-center">
      <div className="text-3xl font-bold text-[var(--cyan)]">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/* ─────────── Other tabs ─────────── */

function ReportsTab() {
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: () => listUsers() });
  const list = users.data ?? [];
  const total = list.length;
  const sub = list.filter((u) => u.segment === "subscribed").length;
  const demo = list.filter((u) => u.segment === "demo").length;
  const reg = list.filter((u) => u.segment === "registered").length;
  const hours = list.reduce((s, u) => s + u.hoursSpent, 0);
  const avg = total ? Math.round(list.reduce((s, u) => s + u.progressPct, 0) / total) : 0;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <StatCard value={total} label="Total users" />
      <StatCard value={sub} label="Subscribed" />
      <StatCard value={demo} label="Demo" />
      <StatCard value={reg} label="Registered" />
      <StatCard value={`${hours}h`} label="Learning hours" />
      <StatCard value={`${avg}%`} label="Avg completion" />
    </div>
  );
}

function InviteTab() {
  const qc = useQueryClient();
  const catalog = useQuery({ queryKey: ["admin", "catalog"], queryFn: () => listCatalog() });
  const invites = useQuery({ queryKey: ["admin", "invites"], queryFn: () => listInvites() });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "instructor" | "admin">("student");
  const [selected, setSelected] = useState<string[]>([]);
  const m = useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      toast.success("Invitation sent");
      setEmail(""); setSelected([]);
      qc.invalidateQueries({ queryKey: ["admin", "invites"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="panel p-6">
        <h3 className="font-semibold mb-4">Invite operator</h3>
        <form onSubmit={(e) => { e.preventDefault(); m.mutate({ data: { email, role, courseIds: selected } }); }} className="space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="user@company.com" className="w-full rounded-md bg-secondary/40 border border-border px-3 py-2.5 text-sm" />
          <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full rounded-md bg-secondary/40 border border-border px-3 py-2.5 text-sm">
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
          <div>
            <div className="text-xs text-muted-foreground mb-2">Grant courses</div>
            <div className="space-y-1">
              {(catalog.data?.courses ?? []).map((c: any) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selected.includes(c.id)} onChange={(e) => {
                    setSelected((s) => e.target.checked ? [...s, c.id] : s.filter((x) => x !== c.id));
                  }} />
                  {c.title}
                </label>
              ))}
            </div>
          </div>
          <button disabled={m.isPending} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {m.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send invitation
          </button>
        </form>
      </div>

      <div className="panel p-6">
        <h3 className="font-semibold mb-4">Recent invites</h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {(invites.data ?? []).length === 0 && <div className="text-xs text-muted-foreground">No invites yet</div>}
          {(invites.data ?? []).map((i: any) => (
            <div key={i.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
              <div>
                <div className="font-medium">{i.email}</div>
                <div className="text-xs text-muted-foreground">{i.role} · {new Date(i.invited_at).toLocaleString()}</div>
              </div>
              <span className={`text-xs ${i.accepted_at ? "text-emerald-400" : "text-amber-400"}`}>{i.accepted_at ? "Accepted" : "Pending"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditTab() {
  const q = useQuery({ queryKey: ["admin", "audit"], queryFn: () => listAudit() });
  return (
    <div className="panel p-6">
      <h3 className="font-semibold mb-4">Audit log</h3>
      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {(q.data ?? []).map((row: any) => (
          <div key={row.id} className="flex items-start gap-3 border-b border-border/40 py-2 text-sm">
            <span className="font-mono text-xs text-muted-foreground w-40 shrink-0">{new Date(row.created_at).toLocaleString()}</span>
            <span className="rounded-md bg-cyan-500/15 text-cyan-300 px-2 py-0.5 text-xs">{row.action}</span>
            <span className="text-xs text-muted-foreground truncate">{JSON.stringify(row.payload)}</span>
          </div>
        ))}
        {(q.data ?? []).length === 0 && <div className="text-xs text-muted-foreground">No activity yet</div>}
      </div>
    </div>
  );
}

function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel p-10 text-center">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
