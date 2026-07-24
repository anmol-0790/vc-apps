import type { SupabaseClient } from "@supabase/supabase-js";
import {
  validateSignupFields,
  type SignupFieldErrors,
} from "@/lib/signup";
import type { AuthSuccess } from "@/lib/auth/types";
import { getSupabaseAuthClient } from "@/lib/supabase/auth-client";
import { logAuth } from "@/lib/logger";

export type SignupCredentials = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

export type SignupFailure =
  | {
      kind: "validation";
      fields: SignupFieldErrors;
      message: string;
    }
  | {
      kind: "email_taken";
      message: string;
      fields: SignupFieldErrors;
    }
  | {
      kind: "config";
      message: string;
    }
  | {
      kind: "provider";
      message: string;
    };

export type SignupResult =
  | { ok: true; data: AuthSuccess }
  | { ok: false; error: SignupFailure };

function isEmailTakenError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("user already exists")
  );
}

/**
 * Register with Supabase Auth (email/password).
 * Stores full name in user metadata. Prefer disabling email confirmation for local POC.
 */
export async function registerUser(
  credentials: SignupCredentials,
  supabase?: SupabaseClient,
): Promise<SignupResult> {
  const name = credentials.name?.trim() ?? "";
  const email = credentials.email?.trim() ?? "";
  const password = credentials.password ?? "";
  const confirmPassword = credentials.confirmPassword ?? "";
  const termsAccepted = Boolean(credentials.termsAccepted);

  const fields = validateSignupFields({
    name,
    email,
    password,
    confirmPassword,
    termsAccepted,
  });

  if (Object.keys(fields).length > 0) {
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

  const { data, error } = await clientResult.client.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });

  if (error) {
    logAuth("warn", "signup_failed", {
      status: error.status ?? 0,
      providerCode: error.code ?? "none",
    });

    if (isEmailTakenError(error.message)) {
      return {
        ok: false,
        error: {
          kind: "email_taken",
          message: "An account with this email already exists.",
          fields: { email: "An account with this email already exists." },
        },
      };
    }

    return {
      ok: false,
      error: {
        kind: "provider",
        message: "Unable to create account. Please try again.",
      },
    };
  }

  if (!data.user) {
    logAuth("error", "signup_missing_user");
    return {
      ok: false,
      error: {
        kind: "provider",
        message: "Unable to create account. Please try again.",
      },
    };
  }

  logAuth("info", "signup_succeeded", {
    userId: data.user.id,
    hasSession: Boolean(data.session),
  });

  // When email confirmation is enabled, session may be null until the user confirms.
  return {
    ok: true,
    data: {
      token: data.session?.access_token ?? "",
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
      },
    },
  };
}
