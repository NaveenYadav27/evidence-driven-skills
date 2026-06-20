import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("is_admin", { _user: ctx.userId });
  if (error) throw new Error("Authz check failed: " + error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

async function audit(ctx: { supabase: any; userId: string }, action: string, target?: string, payload?: any) {
  await ctx.supabase.from("lms_audit_log").insert({
    actor_id: ctx.userId, action, target_user_id: target ?? null, payload: payload ?? {},
  });
}

/* ────────────── identity ────────────── */

export const checkAmIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("is_admin", { _user: context.userId });
    const { data: roles } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId);
    return { isAdmin: !!data, roles: (roles ?? []).map((r: any) => r.role) };
  });

/* ────────────── users ────────────── */

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: authList, error: authErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (authErr) throw authErr;

    const ids = authList.users.map((u) => u.id);
    const [profiles, roles, enrollments, courses] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").in("id", ids),
      supabaseAdmin.from("user_roles").select("user_id,role").in("user_id", ids),
      supabaseAdmin.from("lms_enrollments").select("user_id,course_id,status,hours_spent,progress_pct").in("user_id", ids),
      supabaseAdmin.from("lms_courses").select("id,slug,title"),
    ]);

    const pmap = new Map((profiles.data ?? []).map((p: any) => [p.id, p]));
    const rmap = new Map<string, string[]>();
    (roles.data ?? []).forEach((r: any) => {
      const arr = rmap.get(r.user_id) ?? []; arr.push(r.role); rmap.set(r.user_id, arr);
    });
    const emap = new Map<string, any[]>();
    (enrollments.data ?? []).forEach((e: any) => {
      const arr = emap.get(e.user_id) ?? []; arr.push(e); emap.set(e.user_id, arr);
    });
    const cmap = new Map((courses.data ?? []).map((c: any) => [c.id, c]));

    return authList.users.map((u) => {
      const p: any = pmap.get(u.id) ?? {};
      const enr = emap.get(u.id) ?? [];
      const hasFull = enr.some((e) => e.status === "full");
      const hasDemo = enr.some((e) => e.status === "demo");
      const segment = hasFull ? "subscribed" : hasDemo ? "demo" : "registered";
      const totalHours = enr.reduce((s, e) => s + Number(e.hours_spent || 0), 0);
      const avgPct = enr.length ? Math.round(enr.reduce((s, e) => s + Number(e.progress_pct || 0), 0) / enr.length) : 0;
      return {
        id: u.id,
        email: u.email,
        emailVerified: !!u.email_confirmed_at,
        joinedAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
        fullName: p.full_name ?? u.email?.split("@")[0],
        ssid: p.ssid,
        country: p.country,
        suspended: !!p.suspended,
        roles: rmap.get(u.id) ?? [],
        segment,
        courses: enr.map((e) => ({ ...(cmap.get(e.course_id) as any), status: e.status })),
        hoursSpent: totalHours,
        progressPct: avgPct,
      };
    });
  });

export const getUserDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: au }, profile, enroll, modAssign, soc, mentor, audit] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(data.userId),
      supabaseAdmin.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
      supabaseAdmin.from("lms_enrollments").select("*, course:lms_courses(*)").eq("user_id", data.userId),
      supabaseAdmin.from("lms_module_assignments").select("*, module:lms_modules(*)").eq("user_id", data.userId),
      supabaseAdmin.from("lms_soc_tiers").select("*").eq("user_id", data.userId).maybeSingle(),
      supabaseAdmin.from("lms_mentor_assignments").select("*").eq("student_id", data.userId),
      supabaseAdmin.from("lms_audit_log").select("*").eq("target_user_id", data.userId).order("created_at", { ascending: false }).limit(20),
    ]);
    return {
      auth: au.user ? { email: au.user.email, created_at: au.user.created_at, email_confirmed_at: au.user.email_confirmed_at, last_sign_in_at: au.user.last_sign_in_at } : null,
      profile: profile.data,
      enrollments: enroll.data ?? [],
      moduleAssignments: modAssign.data ?? [],
      socTier: soc.data?.tier ?? null,
      mentors: mentor.data ?? [],
      audit: audit.data ?? [],
    };
  });

/* ────────────── mutations ────────────── */

export const setSuspended = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; suspended: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").update({ suspended: data.suspended }).eq("id", data.userId);
    if (data.suspended) {
      await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration: "876000h" });
    } else {
      await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration: "none" });
    }
    await audit(context, data.suspended ? "user.suspend" : "user.unsuspend", data.userId);
    return { ok: true };
  });

export const resetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(data.userId);
    if (!u.user?.email) throw new Error("User has no email");
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery", email: u.user.email,
    });
    if (error) throw error;
    await audit(context, "user.reset_password", data.userId, { email: u.user.email });
    return { ok: true, link: link.properties?.action_link ?? null };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error("Cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw error;
    await audit(context, "user.delete", data.userId);
    return { ok: true };
  });

export const setEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; courseId: string; status: "full" | "demo" | "suspended" | "revoked" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.status === "revoked") {
      await supabaseAdmin.from("lms_enrollments").delete().eq("user_id", data.userId).eq("course_id", data.courseId);
    } else {
      await supabaseAdmin.from("lms_enrollments").upsert({
        user_id: data.userId, course_id: data.courseId, status: data.status,
      }, { onConflict: "user_id,course_id" });
    }
    await audit(context, "enrollment.set", data.userId, { courseId: data.courseId, status: data.status });
    return { ok: true };
  });

export const setSocTier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; tier: string | null }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (!data.tier) {
      await supabaseAdmin.from("lms_soc_tiers").delete().eq("user_id", data.userId);
    } else {
      await supabaseAdmin.from("lms_soc_tiers").upsert({
        user_id: data.userId, tier: data.tier, updated_by: context.userId, updated_at: new Date().toISOString(),
      });
    }
    await audit(context, "soc.tier_set", data.userId, { tier: data.tier });
    return { ok: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: "super_admin" | "admin" | "instructor" | "student"; grant: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // Only super_admin can grant super_admin / admin
    const { data: isSuper } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId).eq("role", "super_admin").maybeSingle();
    if ((data.role === "super_admin" || data.role === "admin") && !isSuper) {
      throw new Error("Only super_admin can manage admin roles");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    } else {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
    }
    await audit(context, data.grant ? "role.grant" : "role.revoke", data.userId, { role: data.role });
    return { ok: true };
  });

/* ────────────── catalog ────────────── */

export const listCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: courses }, { data: modules }] = await Promise.all([
      supabaseAdmin.from("lms_courses").select("*").order("title"),
      supabaseAdmin.from("lms_modules").select("*").order("order_index"),
    ]);
    return { courses: courses ?? [], modules: modules ?? [] };
  });

/* ────────────── invite ────────────── */

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; role: "student" | "instructor" | "admin"; courseIds?: string[] }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inv, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email);
    if (error) throw error;
    await supabaseAdmin.from("lms_invites").insert({
      email: data.email, role: data.role, invited_by: context.userId,
      course_ids: data.courseIds ?? [],
    });
    if (inv.user) {
      await supabaseAdmin.from("user_roles").insert({ user_id: inv.user.id, role: data.role }).then();
      for (const cid of data.courseIds ?? []) {
        await supabaseAdmin.from("lms_enrollments").upsert({
          user_id: inv.user.id, course_id: cid, status: "full",
        }, { onConflict: "user_id,course_id" });
      }
    }
    await audit(context, "user.invite", inv.user?.id, { email: data.email, role: data.role });
    return { ok: true };
  });

export const listInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("lms_invites").select("*").order("invited_at", { ascending: false }).limit(100);
    return data ?? [];
  });

/* ────────────── audit ────────────── */

export const listAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("lms_audit_log").select("*").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });
