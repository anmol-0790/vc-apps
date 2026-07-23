import { NextResponse } from "next/server";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(
  code: string,
  message: string,
  status: number,
  fields?: Record<string, string | undefined>,
) {
  const cleanedFields = fields
    ? Object.fromEntries(
        Object.entries(fields).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      )
    : undefined;

  const body: ApiErrorBody = {
    error: {
      code,
      message,
      ...(cleanedFields && Object.keys(cleanedFields).length > 0
        ? { fields: cleanedFields }
        : {}),
    },
  };

  return NextResponse.json(body, { status });
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!value || typeof value !== "object") return false;
  const error = (value as { error?: unknown }).error;
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: unknown; message?: unknown };
  return typeof record.code === "string" && typeof record.message === "string";
}

export function isLoginSuccess(value: unknown): value is {
  token: string;
  user: { id: string; email: string };
} {
  if (!value || typeof value !== "object") return false;
  const record = value as {
    token?: unknown;
    user?: { id?: unknown; email?: unknown };
  };
  return (
    typeof record.token === "string" &&
    !!record.user &&
    typeof record.user.id === "string" &&
    typeof record.user.email === "string"
  );
}
