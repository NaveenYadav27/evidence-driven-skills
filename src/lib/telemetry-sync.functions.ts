import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const StateSchema = z.object({
  commands: z.array(z.any()).max(2000),
  labs: z.record(z.string(), z.any()),
  totalTimeMs: z.number().nonnegative(),
  streak: z.number().nonnegative(),
  lastActiveDay: z.string().optional(),
  lastUpdated: z.number().nonnegative(),
});

export const getCloudTelemetry = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_telemetry_state")
      .select("state, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? null;
  });

export const saveCloudTelemetry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => StateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_telemetry_state")
      .upsert({ user_id: context.userId, state: data }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
