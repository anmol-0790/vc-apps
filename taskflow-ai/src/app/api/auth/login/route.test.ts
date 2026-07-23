import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/login-service", () => ({
  authenticateUser: vi.fn(),
}));

import { authenticateUser } from "@/lib/auth/login-service";
import { POST } from "@/app/api/auth/login/route";

const mockedAuthenticate = vi.mocked(authenticateUser);

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    mockedAuthenticate.mockReset();
  });

  it("returns 200 on successful authentication", async () => {
    mockedAuthenticate.mockReturnValue({
      ok: true,
      data: {
        token: "tok_123",
        user: { id: "user_1", email: "user@example.com" },
      },
    });

    const response = await POST(
      makeRequest({ email: "user@example.com", password: "password1" }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      token: "tok_123",
      user: { id: "user_1", email: "user@example.com" },
    });
  });

  it("returns 401 when credentials are invalid", async () => {
    mockedAuthenticate.mockReturnValue({
      ok: false,
      error: {
        kind: "invalid_credentials",
        message: "Invalid email or password.",
      },
    });

    const response = await POST(
      makeRequest({ email: "fail@example.com", password: "password1" }),
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password.",
      },
    });
  });

  it("returns 400 when field types are invalid", async () => {
    const response = await POST(
      makeRequest({ email: 123, password: true }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(mockedAuthenticate).not.toHaveBeenCalled();
  });

  it("returns 400 when the service reports validation errors", async () => {
    mockedAuthenticate.mockReturnValue({
      ok: false,
      error: {
        kind: "validation",
        message: "Please correct the highlighted fields.",
        fields: { email: "Email is required." },
      },
    });

    const response = await POST(makeRequest({ email: "", password: "password1" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fields: { email: "Email is required." },
      },
    });
  });
});
