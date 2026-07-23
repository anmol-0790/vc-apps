import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type AlertVariant = "error" | "success";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant: AlertVariant;
};

const variantClasses: Record<AlertVariant, string> = {
  error:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
};

export function Alert({
  variant,
  className,
  children,
  role,
  ...props
}: AlertProps) {
  return (
    <div
      role={role ?? (variant === "error" ? "alert" : "status")}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
