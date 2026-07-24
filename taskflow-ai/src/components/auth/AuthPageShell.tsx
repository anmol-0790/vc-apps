"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  LoginBackground,
  useLoginCanvasPointer,
} from "@/components/login/LoginBackground";
import { Logo } from "@/components/login/Logo";
import {
  AuthLegalFooter,
  AuthTrustBadges,
} from "@/components/auth/AuthTrustBadges";
import { cn, linkMuted, surfaceControl } from "@/lib/cn";

export type AuthHeaderLink = {
  href: string;
  label: string;
};

export type AuthPageShellProps = {
  mainId: string;
  skipLabel: string;
  headerHint: string;
  headerAction: AuthHeaderLink;
  children: ReactNode;
  legalPrefix: string;
};

export function AuthPageShell({
  mainId,
  skipLabel,
  headerHint,
  headerAction,
  children,
  legalPrefix,
}: AuthPageShellProps) {
  const { hovering, cursor, canvasHandlers } = useLoginCanvasPointer();

  return (
    <div
      className="relative min-h-dvh overflow-hidden bg-login-canvas font-sans"
      {...canvasHandlers}
    >
      <LoginBackground cursor={cursor} hovering={hovering} />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <a
          href={`#${mainId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-20 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-800 focus:shadow-md"
        >
          {skipLabel}
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
              {headerHint}
            </span>
            <Link
              href={headerAction.href}
              className={cn(
                surfaceControl,
                "inline-flex h-9 min-h-9 items-center px-3.5 text-[13px] font-medium text-slate-700 sm:px-4",
              )}
            >
              {headerAction.label}
            </Link>
          </div>
        </header>

        <main
          id={mainId}
          className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12"
        >
          <div className="w-full max-w-[400px] animate-fade-up">
            {children}
            <AuthTrustBadges />
            <AuthLegalFooter prefix={legalPrefix}>
              <a href="#" className={linkMuted}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className={linkMuted}>
                Privacy Policy
              </a>
            </AuthLegalFooter>
          </div>
        </main>
      </div>
    </div>
  );
}

export function AuthFormCard({
  headingId,
  title,
  subtitle,
  children,
}: {
  headingId: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/95 p-5 shadow-[var(--login-card-shadow)] backdrop-blur-md sm:p-8">
      <header className="mb-6 space-y-1.5 text-center sm:mb-7">
        <div className="mb-5 flex justify-center sm:mb-6">
          <Logo />
        </div>
        <h1
          id={headingId}
          className="text-[22px] leading-tight font-bold tracking-[-0.025em] text-slate-900 sm:text-[26px]"
        >
          {title}
        </h1>
        <p className="text-[14px] text-slate-500">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}
