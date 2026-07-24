import type { SupabaseClient } from "@supabase/supabase-js";
import {
  validateLoginFields,
  type LoginFieldErrors,
} from "@/lib/login";
import type { LoginCredentials, LoginSuccess } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type { LoginCredentials, LoginSuccess, LoginUser } from "@/lib/auth/types";

export type LoginFailure =
  | {
      kind: "validation";
      fields: LoginFieldErrors;
      message: string;
    }
  | {
      kind: "invalid_credentials";
      message: string;
    }
  | {
      kind: "config";
      message: string;
    };

export type LoginResult =
  | { ok: true; data: LoginSuccess }
  | { ok: false; error: LoginFailure };

/**
 * Authenticate with Supabase email/password.
 * Sets auth cookies via the server client and returns the access token.
 */
export async function authenticateUser(
  credentials: LoginCredentials,
  supabase?: SupabaseClient,
): Promise<LoginResult> {
  const email = credentials.email?.trim() ?? "";
  const password = credentials.password ?? "";

  const fields = validateLoginFields(email, password);
  if (fields.email || fields.password) {
    return {
      ok: false,
      error: {
        kind: "validation",
        fields,
        message: "Please correct the highlighted fields.",
      },
    };
  }

  let client: SupabaseClient;
  try {
    client = supabase ?? (await createSupabaseServerClient());
  } catch {
    return {
      ok: false,
      error: {
        kind: "config",
        message: "Authentication is not configured. Set Supabase env vars.",
      },
    };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    return {
      ok: false,
      error: {
        kind: "invalid_credentials",
        message: "Invalid email or password.",
      },
    };
  }

  return {
    ok: true,
    data: {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
      },
    },
  };
}
