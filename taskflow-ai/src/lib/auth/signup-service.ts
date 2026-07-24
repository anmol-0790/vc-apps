import {
  validateSignupFields,
  type SignupFieldErrors,
} from "@/lib/signup";
import type { LoginSuccess } from "@/lib/auth/types";

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
    };

export type SignupResult =
  | { ok: true; data: LoginSuccess }
  | { ok: false; error: SignupFailure };

function toStableId(prefix: string, value: string) {
  const normalized = value.toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return `${prefix}-${hash.toString(16)}`;
}

/**
 * Register a new account. POC: no real user store.
 * `taken@example.com` always fails as already registered.
 */
export function registerUser(credentials: SignupCredentials): SignupResult {
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

  if (email.toLowerCase() === "taken@example.com") {
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
