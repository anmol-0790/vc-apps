import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn, surfaceControl } from "@/lib/cn";

type SSOButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
};

export function SSOButton({
  icon,
  label,
  className,
  type = "button",
  ...props
}: SSOButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        surfaceControl,
        "flex h-10 min-h-10 flex-1 items-center justify-center gap-2 text-[13px] font-medium text-slate-600",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <span className="shrink-0" aria-hidden>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
