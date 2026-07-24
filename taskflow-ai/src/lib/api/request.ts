import type { NextRequest } from "next/server";
import { jsonError } from "@/lib/api/response";

export type JsonObjectBody =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; response: Response };

/** Parse a JSON object body for auth API routes. */
export async function parseJsonObjectBody(
  request: NextRequest | Request,
): Promise<JsonObjectBody> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: jsonError(
        "VALIDATION_ERROR",
        "Request body must be valid JSON.",
        400,
      ),
    };
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      response: jsonError(
        "VALIDATION_ERROR",
        "Request body must be an object.",
        400,
      ),
    };
  }

  return { ok: true, body: body as Record<string, unknown> };
}
