import { NextRequest } from "next/server";
import { registerUser } from "@/lib/auth/signup-service";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Request body must be valid JSON.", 400);
  }

  if (!body || typeof body !== "object") {
    return jsonError("VALIDATION_ERROR", "Request body must be an object.", 400);
  }

  const { name, email, password, confirmPassword, termsAccepted } = body as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
    confirmPassword?: unknown;
    termsAccepted?: unknown;
  };

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string" ||
    typeof termsAccepted !== "boolean"
  ) {
    return jsonError(
      "VALIDATION_ERROR",
      "Name, email, password, confirmPassword must be strings and termsAccepted a boolean.",
      400,
    );
  }

  try {
    const result = registerUser({
      name,
      email,
      password,
      confirmPassword,
      termsAccepted,
    });

    if (!result.ok) {
      if (result.error.kind === "validation") {
        return jsonError(
          "VALIDATION_ERROR",
          result.error.message,
          400,
          result.error.fields,
        );
      }

      return jsonError(
        "EMAIL_TAKEN",
        result.error.message,
        409,
        result.error.fields,
      );
    }

    return jsonOk(result.data, 201);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Unable to create account. Please try again.",
      500,
    );
  }
}
