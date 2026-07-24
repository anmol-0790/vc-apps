import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { id, label, className, disabled, checked, ...props },
    ref,
  ) {
    const inputId = id ?? props.name;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "group inline-flex items-center gap-2.5 text-[13.5px] text-slate-600 select-none",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          className,
        )}
      >
        <span className="relative inline-flex size-[18px] shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            {...props}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none flex size-[18px] items-center justify-center rounded-md border-[1.5px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors",
              "border-slate-300 bg-white [&_svg]:opacity-0",
              "peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:[&_svg]:opacity-100",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-1",
            )}
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4L3.8 7L9 1"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
        <span className="transition-colors group-hover:text-slate-800">
          {label}
        </span>
      </label>
    );
  },
);
