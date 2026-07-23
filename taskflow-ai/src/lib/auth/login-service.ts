import {
  validateLoginFields,
  type LoginFieldErrors,
} from "@/lib/login";
import type { LoginCredentials, LoginSuccess } from "@/lib/auth/types";

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
    };

export type LoginResult =
  | { ok: true; data: LoginSuccess }
  | { ok: false; error: LoginFailure };

function toStableId(prefix: string, value: string) {
  const normalized = value.toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return `${prefix}-${hash.toString(16)}`;
}

/**
 * Authenticate credentials. POC: no real user store.
 * `fail@example.com` always fails; other valid credentials succeed.
 */
export function authenticateUser(
  credentials: LoginCredentials,
): LoginResult {
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

  if (email.toLowerCase() === "fail@example.com") {
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
      token: toStableId("poc-token", email),
      user: {
        id: toStableId("user", email),
        email,
      },
    },
  };
}
