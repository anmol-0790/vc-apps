type LogFields = Record<string, string | number | boolean | undefined | null>;

/**
 * Minimal structured logger for server-side auth paths.
 * Never pass passwords, tokens, or full request bodies.
 */
export function logAuth(
  level: "info" | "warn" | "error",
  message: string,
  fields: LogFields = {},
) {
  const payload = {
    scope: "auth",
    message,
    ...Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value != null),
    ),
  };

  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
