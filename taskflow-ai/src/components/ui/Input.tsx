import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    error,
    hint,
    className,
    disabled,
    required,
    ...props
  },
  ref,
) {
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
      >
        {label}
        {required ? (
          <span className="text-red-600 dark:text-red-400" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-3 text-sm text-zinc-900 outline-none transition-colors",
          "placeholder:text-zinc-400",
          "focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60",
          "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-100",
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500",
          className,
        )}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="text-sm text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
});
