import type { SupabaseClient } from "@supabase/supabase-js";
import {
  validateLoginFields,
  type LoginFieldErrors,
} from "@/lib/login";
import type { LoginCredentials, AuthSuccess } from "@/lib/auth/types";
import { getSupabaseAuthClient } from "@/lib/supabase/auth-client";
import { logAuth } from "@/lib/logger";

export type { LoginCredentials, AuthSuccess, LoginSuccess, LoginUser, AuthUser } from "@/lib/auth/types";

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
    }
  | {
      kind: "provider";
      message: string;
    };

export type LoginResult =
  | { ok: true; data: AuthSuccess }
  | { ok: false; error: LoginFailure };

function isInvalidCredentialError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid credentials") ||
    normalized.includes("email not confirmed")
  );
}

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

  const clientResult = await getSupabaseAuthClient(supabase);
  if (!clientResult.ok) {
    return {
      ok: false,
      error: { kind: "config", message: clientResult.message },
    };
  }

  const { data, error } = await clientResult.client.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    const providerMessage = error?.message ?? "missing_session";
    logAuth("warn", "login_failed", {
      status: error?.status ?? 0,
      providerCode: error?.code ?? "none",
    });

    if (error && !isInvalidCredentialError(providerMessage)) {
      return {
        ok: false,
        error: {
          kind: "provider",
          message: "Unable to sign in. Please try again.",
        },
      };
    }

    return {
      ok: false,
      error: {
        kind: "invalid_credentials",
        message: "Invalid email or password.",
      },
    };
  }

  logAuth("info", "login_succeeded", { userId: data.user.id });

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
