import type { LoginSuccess } from "@/lib/auth/types";
import { isApiErrorBody, isLoginSuccess } from "@/lib/api/response";
import { isValidEmail } from "@/lib/login";

export type SignupFieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Weak" | "Fair" | "Good" | "Strong" | null;
};

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: null };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ["Weak", "Fair", "Good", "Strong"] as const;
  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

  return {
    score: clamped,
    label: clamped > 0 ? labels[clamped - 1] : null,
  };
}

export function validateSignupFields(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}): SignupFieldErrors {
  const errors: SignupFieldErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();

  if (!name) {
    errors.name = "Full name is required.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!input.password) {
    errors.password = "Password is required.";
  } else if (input.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!input.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!input.termsAccepted) {
    errors.terms = "You must agree to the Terms of Service and Privacy Policy.";
  }

  return errors;
}

export class SignupRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: SignupFieldErrors;

  constructor(
    message: string,
    options: { status: number; code: string; fields?: SignupFieldErrors },
  ) {
    super(message);
    this.name = "SignupRequestError";
    this.status = options.status;
    this.code = options.code;
    this.fields = options.fields;
  }
}

function toFieldErrors(
  fields?: Record<string, string>,
): SignupFieldErrors | undefined {
  if (!fields) return undefined;

  const next: SignupFieldErrors = {};
  if (typeof fields.name === "string") next.name = fields.name;
  if (typeof fields.email === "string") next.email = fields.email;
  if (typeof fields.password === "string") next.password = fields.password;
  if (typeof fields.confirmPassword === "string") {
    next.confirmPassword = fields.confirmPassword;
  }
  if (typeof fields.terms === "string") next.terms = fields.terms;

  return Object.keys(next).length > 0 ? next : undefined;
}

/** Client helper that calls POST /api/auth/register. */
export async function signupRequest(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}): Promise<LoginSuccess> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    throw new SignupRequestError("Unable to create account. Please try again.", {
      status: response.status,
      code: "INVALID_RESPONSE",
    });
  }

  if (!response.ok) {
    if (isApiErrorBody(payload)) {
      throw new SignupRequestError(payload.error.message, {
        status: response.status,
        code: payload.error.code,
        fields: toFieldErrors(payload.error.fields),
      });
    }

    throw new SignupRequestError("Unable to create account. Please try again.", {
      status: response.status,
      code: "UNKNOWN_ERROR",
    });
  }

  if (!isLoginSuccess(payload)) {
    throw new SignupRequestError("Unable to create account. Please try again.", {
      status: response.status,
      code: "INVALID_RESPONSE",
    });
  }

  return payload;
}
