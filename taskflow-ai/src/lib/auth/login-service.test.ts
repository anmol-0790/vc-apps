import { describe, expect, it } from "vitest";
import { authenticateUser } from "@/lib/auth/login-service";

describe("authenticateUser", () => {
  it("returns validation errors for empty credentials", () => {
    const result = authenticateUser({ email: "", password: "" });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.error.kind).toBe("validation");
    if (result.error.kind !== "validation") return;
    expect(result.error.fields).toEqual({
      email: "Email is required.",
      password: "Password is required.",
    });
  });

  it("rejects invalid credentials for the POC failure email", () => {
    const result = authenticateUser({
      email: "fail@example.com",
      password: "password1",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        kind: "invalid_credentials",
        message: "Invalid email or password.",
      },
    });
  });

  it("returns a token and user on success", () => {
    const result = authenticateUser({
      email: "user@example.com",
      password: "password1",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.user.email).toBe("user@example.com");
    expect(result.data.token).toMatch(/^poc-token-/);
    expect(result.data.user.id).toMatch(/^user-/);
  });
});
