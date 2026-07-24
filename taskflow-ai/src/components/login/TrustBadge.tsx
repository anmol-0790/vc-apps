import type { ReactNode } from "react";

export function TrustBadge({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[11.5px] text-slate-400">{label}</span>
    </div>
  );
}
