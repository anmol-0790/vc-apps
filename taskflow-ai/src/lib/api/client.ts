import { isApiErrorBody } from "@/lib/api/response";

type ApiRequestOptions<TFields> = {
  fallbackMessage: string;
  mapFields?: (fields?: Record<string, string>) => TFields | undefined;
  parseSuccess: (payload: unknown) => boolean;
  ErrorClass: new (
    message: string,
    options: { status: number; code: string; fields?: TFields },
  ) => Error & { status: number; code: string; fields?: TFields };
};

/**
 * Shared JSON POST helper for auth client calls.
 * Wraps fetch + JSON parse into a typed ErrorClass.
 */
export async function apiJsonPost<TSuccess, TFields>(
  url: string,
  body: unknown,
  options: ApiRequestOptions<TFields>,
): Promise<TSuccess> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new options.ErrorClass(options.fallbackMessage, {
      status: 0,
      code: "NETWORK_ERROR",
    });
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    throw new options.ErrorClass(options.fallbackMessage, {
      status: response.status,
      code: "INVALID_RESPONSE",
    });
  }

  if (!response.ok) {
    if (isApiErrorBody(payload)) {
      throw new options.ErrorClass(payload.error.message, {
        status: response.status,
        code: payload.error.code,
        fields: options.mapFields?.(payload.error.fields),
      });
    }

    throw new options.ErrorClass(options.fallbackMessage, {
      status: response.status,
      code: "UNKNOWN_ERROR",
    });
  }

  if (!options.parseSuccess(payload)) {
    throw new options.ErrorClass(options.fallbackMessage, {
      status: response.status,
      code: "INVALID_RESPONSE",
    });
  }

  return payload as TSuccess;
}
