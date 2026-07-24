import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authenticateUser } from "@/lib/auth/login-service";

function mockSupabase(
  result: Awaited<ReturnType<SupabaseClient["auth"]["signInWithPassword"]>>,
) {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue(result),
    },
  } as unknown as SupabaseClient;
}

describe("authenticateUser", () => {
  it("returns validation errors for empty credentials", async () => {
    const result = await authenticateUser({ email: "", password: "" });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.error.kind).toBe("validation");
    if (result.error.kind !== "validation") return;
    expect(result.error.fields).toEqual({
      email: "Email is required.",
      password: "Password is required.",
    });
  });

  it("rejects invalid credentials from Supabase", async () => {
    const supabase = mockSupabase({
      data: { user: null, session: null },
      error: {
        message: "Invalid login credentials",
        name: "AuthApiError",
        status: 400,
      } as never,
    });

    const result = await authenticateUser(
      { email: "user@example.com", password: "password1" },
      supabase,
    );

    expect(result).toEqual({
      ok: false,
      error: {
        kind: "invalid_credentials",
        message: "Invalid email or password.",
      },
    });
  });

  it("returns a token and user on success", async () => {
    const supabase = mockSupabase({
      data: {
        user: { id: "user-1", email: "user@example.com" } as never,
        session: { access_token: "jwt-token" } as never,
      },
      error: null,
    });

    const result = await authenticateUser(
      { email: "user@example.com", password: "password1" },
      supabase,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data).toEqual({
      token: "jwt-token",
      user: { id: "user-1", email: "user@example.com" },
    });
  });
});
