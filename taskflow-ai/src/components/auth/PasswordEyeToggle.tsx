"use client";

import { cn, focusRing } from "@/lib/cn";
import { EyeIcon } from "@/components/auth/icons";

type PasswordEyeToggleProps = {
  show: boolean;
  onToggle: () => void;
  disabled?: boolean;
  labelShow?: string;
  labelHide?: string;
};

export function PasswordEyeToggle({
  show,
  onToggle,
  disabled,
  labelShow = "Show password",
  labelHide = "Hide password",
}: PasswordEyeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "rounded p-1 text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50",
        focusRing,
      )}
      aria-label={show ? labelHide : labelShow}
      aria-pressed={show}
    >
      <EyeIcon crossed={show} />
    </button>
  );
}
