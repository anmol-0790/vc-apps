"use client";

import { Fragment } from "react";
import Link from "next/link";
import { LoginBackground, useLoginCanvasPointer } from "@/components/login/LoginBackground";
import { LoginForm } from "@/components/login/LoginForm";
import { Logo } from "@/components/login/Logo";
import { TrustBadge } from "@/components/login/TrustBadge";
import { cn, linkMuted, surfaceControl } from "@/lib/cn";

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

export function LoginPageView() {
  const { hovering, cursor, canvasHandlers } = useLoginCanvasPointer();

  return (
    <div
      className="relative min-h-dvh overflow-hidden bg-login-canvas font-sans"
      {...canvasHandlers}
    >
      <LoginBackground cursor={cursor} hovering={hovering} />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <a
          href="#login-main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-20 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-800 focus:shadow-md"
        >
          Skip to sign in
        </a>

        <header className="flex items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-8 sm:py-5">
          <Link
            href="/"
            className="rounded-xl outline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Meridian home"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-[13px] text-slate-500 md:inline">
              Don&apos;t have an account?
            </span>
            <a
              href="#"
              className={cn(
                surfaceControl,
                "inline-flex h-9 min-h-9 items-center px-3.5 text-[13px] font-medium text-slate-700 sm:px-4",
              )}
            >
              Create account
            </a>
          </div>
        </header>

        <main
          id="login-main"
          className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12"
        >
          <div className="w-full max-w-[400px] animate-fade-up">
            <LoginForm />

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

            <p className="mt-5 text-center text-[12px] leading-relaxed text-slate-400 sm:mt-6">
              By signing in, you agree to our{" "}
              <a href="#" className={linkMuted}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className={linkMuted}>
                Privacy Policy
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
