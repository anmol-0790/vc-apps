import { Fragment, type ReactNode } from "react";
import { TrustBadge } from "@/components/login/TrustBadge";

const trustItems = [
  {
    label: "SOC 2 Type II",
    icon: (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: "GDPR Compliant",
    icon: (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  },
  {
    label: "256-bit Encryption",
    icon: (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
] as const;

export function AuthTrustBadges() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
      {trustItems.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 ? (
            <span
              className="hidden h-3 w-px bg-slate-300 sm:block"
              aria-hidden
            />
          ) : null}
          <TrustBadge label={item.label} icon={item.icon} />
        </Fragment>
      ))}
    </div>
  );
}

export function AuthLegalFooter({
  prefix,
  children,
}: {
  prefix: string;
  children?: ReactNode;
}) {
  return (
    <p className="mt-5 text-center text-[12px] leading-relaxed text-slate-400 sm:mt-6">
      {prefix}{" "}
      {children ?? (
        <>
          <a href="#" className="underline underline-offset-2 transition-colors hover:text-slate-600">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-2 transition-colors hover:text-slate-600">
            Privacy Policy
          </a>
        </>
      )}
    </p>
  );
}
