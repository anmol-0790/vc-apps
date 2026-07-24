import { cn } from "@/lib/cn";
import { getPasswordStrength } from "@/lib/signup";

const barColors = [
  "bg-red-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-emerald-500",
] as const;

const labelColors = [
  "text-red-500",
  "text-amber-600",
  "text-teal-600",
  "text-emerald-600",
] as const;

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label } = getPasswordStrength(password);
  const colorIndex = score > 0 ? score - 1 : 0;

  return (
    <div className="mt-2" aria-live="polite">
      <div className="mb-1 flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "h-[3px] flex-1 rounded-sm transition-colors",
              index < score
                ? barColors[colorIndex]
                : "bg-slate-200",
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "text-[11.5px]",
          score > 0 ? labelColors[colorIndex] : "text-slate-400",
        )}
      >
        {label ?? "Enter a password"}
      </p>
    </div>
  );
}
