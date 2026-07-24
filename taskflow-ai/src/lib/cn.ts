export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Shared interactive focus treatment */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded";

/** Primary text action (e.g. Forgot password) */
export const linkPrimary = cn(
  "text-[13px] font-medium text-blue-600 transition-colors hover:text-blue-700",
  focusRing,
);

/** Muted underline links (terms / privacy) */
export const linkMuted = cn(
  "underline underline-offset-2 transition-colors hover:text-slate-600",
  focusRing,
);

/** Compact bordered surface control */
export const surfaceControl = cn(
  "rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-colors",
  "hover:border-slate-300 hover:bg-slate-50",
  focusRing,
);
