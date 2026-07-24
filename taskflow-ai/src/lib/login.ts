import type { AuthSuccess } from "@/lib/auth/types";
import { isAuthSuccess } from "@/lib/api/response";
import { apiJsonPost } from "@/lib/api/client";
import { isValidEmail } from "@/lib/validation/email";

export { isValidEmail };
export const REMEMBERED_EMAIL_KEY = "taskflow.login.email";

export type LoginFieldErrors = {
  email?: string;
  password?: string;
};

export function validateLoginFields(
  email: string,
  password: string,
): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

export function readRememberedEmail() {
  try {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeRememberedEmail(email: string | null) {
  try {
    if (email) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  } catch {
    // Ignore storage access errors (private mode, etc.)
  }
}

export class LoginRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: LoginFieldErrors;

  constructor(
    message: string,
    options: { status: number; code: string; fields?: LoginFieldErrors },
  ) {
    super(message);
    this.name = "LoginRequestError";
    this.status = options.status;
    this.code = options.code;
    this.fields = options.fields;
  }
}

function toFieldErrors(
  fields?: Record<string, string>,
): LoginFieldErrors | undefined {
  if (!fields) return undefined;

  const next: LoginFieldErrors = {};
  if (typeof fields.email === "string") next.email = fields.email;
  if (typeof fields.password === "string") next.password = fields.password;
  return next.email || next.password ? next : undefined;
}

/** Client helper that calls POST /api/auth/login. */
export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthSuccess> {
  return apiJsonPost<AuthSuccess, LoginFieldErrors>(
    "/api/auth/login",
    { email, password },
    {
      ErrorClass: LoginRequestError,
      fallbackMessage: "Unable to sign in. Please try again.",
      mapFields: toFieldErrors,
      parseSuccess: isAuthSuccess,
    },
  );
}
