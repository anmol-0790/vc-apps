import { authenticateUser } from "@/lib/auth/login-service";
import { parseJsonObjectBody } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { logAuth } from "@/lib/logger";

export async function POST(request: Request) {
  const parsed = await parseJsonObjectBody(request);
  if (!parsed.ok) return parsed.response;

  const { email, password } = parsed.body;

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

      if (result.error.kind === "config" || result.error.kind === "provider") {
        return jsonError("INTERNAL_ERROR", result.error.message, 500);
      }

      return jsonError("INVALID_CREDENTIALS", result.error.message, 401);
    }

    return jsonOk(result.data);
  } catch (error) {
    logAuth("error", "login_route_unexpected", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return jsonError(
      "INTERNAL_ERROR",
      "Unable to sign in. Please try again.",
      500,
    );
  }
}
