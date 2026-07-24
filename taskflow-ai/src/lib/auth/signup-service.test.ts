import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { registerUser } from "@/lib/auth/signup-service";

function mockSupabase(
  result: Awaited<ReturnType<SupabaseClient["auth"]["signUp"]>>,
) {
  return {
    auth: {
      signUp: vi.fn().mockResolvedValue(result),
    },
  } as unknown as SupabaseClient;
}

const valid = {
  name: "Jane Smith",
  email: "jane@example.com",
  password: "password1",
  confirmPassword: "password1",
  termsAccepted: true,
};

describe("registerUser", () => {
  it("returns validation errors for empty input", async () => {
    const result = await registerUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("validation");
  });

  it("maps already-registered errors to email_taken", async () => {
    const supabase = mockSupabase({
      data: { user: null, session: null },
      error: {
        message: "User already registered",
        name: "AuthApiError",
        status: 422,
      } as never,
    });

    const result = await registerUser(valid, supabase);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("email_taken");
  });

  it("returns token and user when session is present", async () => {
    const supabase = mockSupabase({
      data: {
        user: { id: "user-1", email: "jane@example.com" } as never,
        session: { access_token: "jwt-token" } as never,
      },
      error: null,
    });

    const result = await registerUser(valid, supabase);

    expect(result).toEqual({
      ok: true,
      data: {
        token: "jwt-token",
        user: { id: "user-1", email: "jane@example.com" },
      },
    });
  });

  it("returns empty token when email confirmation is required", async () => {
    const supabase = mockSupabase({
      data: {
        user: { id: "user-1", email: "jane@example.com" } as never,
        session: null,
      },
      error: null,
    });

    const result = await registerUser(valid, supabase);

    expect(result).toEqual({
      ok: true,
      data: {
        token: "",
        user: { id: "user-1", email: "jane@example.com" },
      },
    });
  });
});
