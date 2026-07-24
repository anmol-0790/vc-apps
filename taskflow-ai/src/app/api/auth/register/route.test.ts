import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/signup-service", () => ({
  registerUser: vi.fn(),
}));

import { registerUser } from "@/lib/auth/signup-service";
import { POST } from "@/app/api/auth/register/route";

const mockedRegister = vi.mocked(registerUser);

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Jane Smith",
  email: "jane@example.com",
  password: "password1",
  confirmPassword: "password1",
  termsAccepted: true,
};

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    mockedRegister.mockReset();
  });

  it("returns 201 on successful registration", async () => {
    mockedRegister.mockReturnValue({
      ok: true,
      data: {
        token: "tok_123",
        user: { id: "user_1", email: "jane@example.com" },
      },
    });

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual({
      token: "tok_123",
      user: { id: "user_1", email: "jane@example.com" },
    });
  });

  it("returns 409 when email is already taken", async () => {
    mockedRegister.mockReturnValue({
      ok: false,
      error: {
        kind: "email_taken",
        message: "An account with this email already exists.",
        fields: { email: "An account with this email already exists." },
      },
    });

    const response = await POST(
      makeRequest({ ...validBody, email: "taken@example.com" }),
    );
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error.code).toBe("EMAIL_TAKEN");
  });

  it("returns 400 when field types are invalid", async () => {
    const response = await POST(
      makeRequest({ name: 1, email: true, password: null }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it("returns 400 when the service reports validation errors", async () => {
    mockedRegister.mockReturnValue({
      ok: false,
      error: {
        kind: "validation",
        message: "Please correct the highlighted fields.",
        fields: { email: "Email is required." },
      },
    });

    const response = await POST(makeRequest({ ...validBody, email: "" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error.fields).toEqual({ email: "Email is required." });
  });
});
