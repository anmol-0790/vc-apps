import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logAuth } from "@/lib/logger";

export type SupabaseClientResult =
  | { ok: true; client: SupabaseClient }
  | { ok: false; message: string };

/** Resolve a Supabase server client or a config error (no secrets logged). */
export async function getSupabaseAuthClient(
  injected?: SupabaseClient,
): Promise<SupabaseClientResult> {
  if (injected) return { ok: true, client: injected };

  try {
    return { ok: true, client: await createSupabaseServerClient() };
  } catch (error) {
    logAuth("error", "supabase_client_unavailable", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return {
      ok: false,
      message: "Authentication is not configured. Set Supabase env vars.",
    };
  }
}
