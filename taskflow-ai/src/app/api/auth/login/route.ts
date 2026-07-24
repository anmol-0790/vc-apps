import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/auth/login-service";
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

  const { email, password } = body as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string") {
    return jsonError(
      "VALIDATION_ERROR",
      "Email and password must be strings.",
      400,
    );
  }

  try {
    const result = await authenticateUser({ email, password });

    if (!result.ok) {
      if (result.error.kind === "validation") {
        return jsonError(
          "VALIDATION_ERROR",
          result.error.message,
          400,
          result.error.fields,
        );
      }

      if (result.error.kind === "config") {
        return jsonError("INTERNAL_ERROR", result.error.message, 500);
      }

      return jsonError("INVALID_CREDENTIALS", result.error.message, 401);
    }

    return jsonOk(result.data);
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Unable to sign in. Please try again.",
      500,
    );
  }
}
