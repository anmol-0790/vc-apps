import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Checkbox({
  id,
  label,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  const inputId = id ?? props.name;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-zinc-700 select-none",
        "dark:text-zinc-300",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        disabled={disabled}
        className="size-4 rounded border-zinc-300 text-zinc-900 accent-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-1 dark:border-zinc-600 dark:accent-zinc-100"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
