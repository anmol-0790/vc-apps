import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-200"
        aria-hidden
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 10.5L8.5 15L16 6"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-slate-800">
        Meridian
      </span>
    </div>
  );
}
