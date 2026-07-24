import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type AlertVariant = "error" | "success";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant: AlertVariant;
};

const variantClasses: Record<AlertVariant, string> = {
  error:
    "border-red-200 bg-red-50 text-red-700 shadow-[0_8px_24px_rgba(220,38,38,0.12)]",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_8px_24px_rgba(22,163,74,0.2)]",
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
        "flex items-start gap-2.5 rounded-xl border p-3.5 text-[13px] leading-snug font-medium sm:items-center",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
