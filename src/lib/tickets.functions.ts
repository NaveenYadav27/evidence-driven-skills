// Tickets — server functions for the CEH Operations Center.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { getTicket, ALL_TICKETS } from "@/data/tickets";
import { XP_BY_PRIORITY } from "@/data/tickets/types";

/* ────────────── progress ────────────── */

export const ensureProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ ticketId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const t = getTicket(data.ticketId);
    if (!t) throw new Error("Unknown ticket");
    const { data: existing } = await context.supabase
      .from("ticket_progress")
      .select("*")
      .eq("user_id", context.userId)
      .eq("ticket_id", data.ticketId)
      .maybeSingle();
    if (existing) return existing;
    const { data: inserted, error } = await context.supabase
      .from("ticket_progress")
      .insert({
        user_id: context.userId,
        ticket_id: data.ticketId,
        hour_slug: t.hourSlug,
        status: "in_progress",
      })
      .select()
      .single();
    if (error) throw error;
    return inserted;
  });

export const getMyProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ ticketId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("ticket_progress")
      .select("*")
      .eq("user_id", context.userId)
      .eq("ticket_id", data.ticketId)
      .maybeSingle();
    return row;
  });

export const listMyProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("ticket_progress")
      .select("*")
      .eq("user_id", context.userId);
    return data ?? [];
  });

export const patchProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      ticketId: z.string(),
      currentStep: z.number().int().min(0).optional(),
      completedSteps: z.array(z.number().int()).optional(),
      decisions: z.record(z.string(), z.any()).optional(),
      notes: z.record(z.string(), z.any()).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const patch: {
      current_step?: number;
      completed_steps?: number[];
      decisions?: Record<string, unknown>;
      notes?: Record<string, unknown>;
    } = {};
    if (data.currentStep !== undefined) patch.current_step = data.currentStep;
    if (data.completedSteps !== undefined) patch.completed_steps = data.completedSteps;
    if (data.decisions !== undefined) patch.decisions = data.decisions;
    if (data.notes !== undefined) patch.notes = data.notes;
    const { error } = await context.supabase
      .from("ticket_progress")
      .update(patch as never)
      .eq("user_id", context.userId)
      .eq("ticket_id", data.ticketId);
    if (error) throw error;
    return { ok: true };
  });

/* ────────────── evidence ────────────── */

export const addEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      ticketId: z.string(),
      stepId: z.string(),
      kind: z.string(),
      label: z.string().max(200).optional(),
      content: z.record(z.string(), z.any()).default({}),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("ticket_evidence")
      .insert({
        user_id: context.userId,
        ticket_id: data.ticketId,
        step_id: data.stepId,
        kind: data.kind,
        label: data.label ?? null,
        content: data.content,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const listEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ ticketId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase
      .from("ticket_evidence")
      .select("*")
      .eq("user_id", context.userId)
      .eq("ticket_id", data.ticketId)
      .order("created_at", { ascending: true });
    return rows ?? [];
  });

export const deleteEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("ticket_evidence")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

/* ────────────── deliverables ────────────── */

export const saveDeliverable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      ticketId: z.string(),
      kind: z.string(),
      title: z.string().min(1).max(200),
      body: z.string().max(20000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // upsert-by-(user,ticket,kind): delete + insert keeps logic simple
    await context.supabase
      .from("ticket_deliverables")
      .delete()
      .eq("user_id", context.userId)
      .eq("ticket_id", data.ticketId)
      .eq("kind", data.kind);
    const { data: row, error } = await context.supabase
      .from("ticket_deliverables")
      .insert({
        user_id: context.userId,
        ticket_id: data.ticketId,
        kind: data.kind,
        title: data.title,
        body: data.body,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const listDeliverables = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ ticketId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase
      .from("ticket_deliverables")
      .select("*")
      .eq("user_id", context.userId)
      .eq("ticket_id", data.ticketId);
    return rows ?? [];
  });

/* ────────────── submit + score ────────────── */

function computeAutoScore(ticket: ReturnType<typeof getTicket>, evidence: any[], deliverables: any[], decisions: Record<string, string>): number {
  if (!ticket) return 0;
  // Evidence (30) — fraction of required evidence items captured
  let reqCount = 0, gotCount = 0;
  for (const step of ticket.steps) {
    for (const req of step.evidence) {
      const need = req.count ?? 1;
      reqCount += need;
      const have = evidence.filter((e) => e.step_id === step.id && e.kind === req.kind).length;
      gotCount += Math.min(need, have);
    }
  }
  const evidenceScore = reqCount === 0 ? 30 : Math.round((gotCount / reqCount) * 30);

  // Analysis (30) — average length of notes + analyst-notes evidence as proxy
  const noteEv = evidence.filter((e) => e.kind === "note").length;
  const analysisScore = Math.min(30, noteEv * 6);

  // Framework mapping (20) — number of 'mapping' or 'risk_matrix' evidence
  const mapEv = evidence.filter((e) => e.kind === "mapping" || e.kind === "risk_matrix").length;
  const frameworkScore = Math.min(20, mapEv * 4);

  // Recommendations (20) — deliverables present + decisions correct
  let recScore = 0;
  if (deliverables.length > 0) recScore += 10;
  // correctness of decisions
  let decTotal = 0, decRight = 0;
  for (const step of ticket.steps) {
    if (!step.decision) continue;
    decTotal++;
    const chosen = decisions[step.id];
    const opt = step.decision.options.find((o) => o.id === chosen);
    if (opt?.correct) decRight++;
  }
  if (decTotal > 0) recScore += Math.round((decRight / decTotal) * 10);
  recScore = Math.min(20, recScore);

  return Math.min(100, evidenceScore + analysisScore + frameworkScore + recScore);
}

export const submitTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ ticketId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const ticket = getTicket(data.ticketId);
    if (!ticket) throw new Error("Unknown ticket");

    const [{ data: prog }, { data: ev }, { data: dels }] = await Promise.all([
      context.supabase.from("ticket_progress").select("*").eq("user_id", context.userId).eq("ticket_id", data.ticketId).single(),
      context.supabase.from("ticket_evidence").select("*").eq("user_id", context.userId).eq("ticket_id", data.ticketId),
      context.supabase.from("ticket_deliverables").select("*").eq("user_id", context.userId).eq("ticket_id", data.ticketId),
    ]);

    const decisions = (prog?.decisions ?? {}) as Record<string, string>;
    const score = computeAutoScore(ticket, ev ?? [], dels ?? [], decisions);
    const passed = score >= ticket.passingScore;
    const xp = passed ? (ticket.xp ?? XP_BY_PRIORITY[ticket.priority]) : 0;

    const { error } = await context.supabase
      .from("ticket_progress")
      .update({
        status: "submitted",
        auto_score: score,
        xp_earned: xp,
        submitted_at: new Date().toISOString(),
      })
      .eq("user_id", context.userId)
      .eq("ticket_id", data.ticketId);
    if (error) throw error;

    if (xp > 0) {
      await context.supabase.from("xp_ledger").insert({
        user_id: context.userId,
        ticket_id: data.ticketId,
        points: xp,
        reason: `Auto-score ${score} on ${data.ticketId}`,
      });
    }
    if (passed && ticket.badge) {
      await context.supabase.from("user_badges").insert({
        user_id: context.userId,
        badge_code: ticket.badge,
        awarded_for: data.ticketId,
      }).select().maybeSingle();   // ignore duplicate
    }

    return { ok: true, score, passed, xp };
  });

/* ────────────── XP / badges ────────────── */

export const getMyXp = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("xp_ledger").select("points").eq("user_id", context.userId);
    const total = (data ?? []).reduce((acc: number, r: any) => acc + (r.points ?? 0), 0);
    const { data: badges } = await context.supabase
      .from("user_badges").select("badge_code,awarded_for,created_at").eq("user_id", context.userId);
    return { total, badges: badges ?? [] };
  });

/* ────────────── instructor review ────────────── */

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("is_admin", { _user: ctx.userId });
  if (!data) throw new Error("Forbidden: admin only");
}

export const listSubmittedForReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data: progs } = await context.supabase
      .from("ticket_progress").select("*")
      .in("status", ["submitted", "reviewed"])
      .order("submitted_at", { ascending: false });
    const userIds = Array.from(new Set((progs ?? []).map((p: any) => p.user_id)));
    const { data: profiles } = userIds.length
      ? await context.supabase.from("profiles").select("id,full_name,ssid").in("id", userIds)
      : { data: [] as any[] };
    return (progs ?? []).map((p: any) => ({
      ...p,
      profile: (profiles ?? []).find((pr: any) => pr.id === p.user_id) ?? null,
    }));
  });

export const getStudentTicketBundle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), ticketId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const [prog, ev, dels, rev] = await Promise.all([
      context.supabase.from("ticket_progress").select("*").eq("user_id", data.userId).eq("ticket_id", data.ticketId).single(),
      context.supabase.from("ticket_evidence").select("*").eq("user_id", data.userId).eq("ticket_id", data.ticketId).order("created_at"),
      context.supabase.from("ticket_deliverables").select("*").eq("user_id", data.userId).eq("ticket_id", data.ticketId),
      context.supabase.from("ticket_reviews").select("*").eq("user_id", data.userId).eq("ticket_id", data.ticketId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    return {
      progress: prog.data,
      evidence: ev.data ?? [],
      deliverables: dels.data ?? [],
      lastReview: rev.data ?? null,
    };
  });

export const reviewTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      userId: z.string().uuid(),
      ticketId: z.string(),
      score: z.number().min(0).max(100),
      feedback: z.string().max(5000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error: revErr } = await context.supabase.from("ticket_reviews").insert({
      user_id: data.userId,
      ticket_id: data.ticketId,
      reviewer_id: context.userId,
      score: data.score,
      feedback: data.feedback,
    });
    if (revErr) throw revErr;
    const passing = data.score >= 70;
    await context.supabase.from("ticket_progress").update({
      status: passing ? "resolved" : "reviewed",
      instructor_score: data.score,
      completed_at: passing ? new Date().toISOString() : null,
    }).eq("user_id", data.userId).eq("ticket_id", data.ticketId);
    return { ok: true };
  });

/* ────────────── catalog ────────────── */

export function allTicketIds() {
  return ALL_TICKETS.map((t) => t.id);
}
