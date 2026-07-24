import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    error,
    hint,
    suffix,
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
        className="text-[13px] font-medium tracking-wide text-slate-600"
      >
        {label}
        {required ? (
          <span className="text-red-500" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full rounded-xl border bg-white px-3.5 text-[14px] text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition-[border-color,box-shadow]",
            "placeholder:text-slate-400",
            "focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.15),0_1px_2px_rgba(0,0,0,0.05)]",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
            suffix ? "pr-11" : undefined,
            error
              ? "border-red-400 focus-visible:border-red-500 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
              : "border-slate-200",
            className,
          )}
          {...props}
        />
        {suffix ? (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {suffix}
          </div>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-[13px] text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[13px] text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
});
