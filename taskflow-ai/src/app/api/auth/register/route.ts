import { registerUser } from "@/lib/auth/signup-service";
import { parseJsonObjectBody } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { logAuth } from "@/lib/logger";

export async function POST(request: Request) {
  const parsed = await parseJsonObjectBody(request);
  if (!parsed.ok) return parsed.response;

  const { name, email, password, confirmPassword, termsAccepted } = parsed.body;

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
    const result = await registerUser({
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

      if (result.error.kind === "config" || result.error.kind === "provider") {
        return jsonError("INTERNAL_ERROR", result.error.message, 500);
      }

      return jsonError(
        "EMAIL_TAKEN",
        result.error.message,
        409,
        result.error.fields,
      );
    }

    return jsonOk(result.data, 201);
  } catch (error) {
    logAuth("error", "register_route_unexpected", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return jsonError(
      "INTERNAL_ERROR",
      "Unable to create account. Please try again.",
      500,
    );
  }
}
