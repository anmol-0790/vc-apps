import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn, focusRing } from "@/lib/cn";

type ButtonVariant = "default" | "primary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
};

export function Button({
  children,
  loading = false,
  loadingText = "Loading…",
  fullWidth = false,
  variant = "default",
  disabled,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={cn(
        "inline-flex h-11 min-h-11 items-center justify-center gap-2 px-4 font-semibold transition-[transform,box-shadow,background-color,opacity] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60",
        focusRing,
        variant === "default" &&
          "rounded-lg bg-zinc-900 text-sm text-white hover:bg-zinc-800 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
        variant === "primary" &&
          "rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-[14.5px] tracking-[-0.01em] text-white shadow-[0_4px_14px_rgba(37,99,235,0.35),0_1px_2px_rgba(37,99,235,0.2)] hover:from-blue-700 hover:to-blue-600 active:scale-[0.985] active:shadow-[0_1px_4px_rgba(37,99,235,0.3)] focus-visible:ring-offset-2",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="size-[18px] shrink-0 animate-spin rounded-full border-[3px] border-white/30 border-t-white"
            aria-hidden
          />
          {loadingText ? (
            <span>{loadingText}</span>
          ) : (
            <span className="sr-only">Loading</span>
          )}
        </>
      ) : (
        (children as ReactNode)
      )}
    </button>
  );
}
