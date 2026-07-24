"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/login/Divider";
import { Logo } from "@/components/login/Logo";
import { SSOButton } from "@/components/login/SSOButton";
import { cn, focusRing, linkPrimary } from "@/lib/cn";
import {
  LoginRequestError,
  loginRequest,
  readRememberedEmail,
  validateLoginFields,
  writeRememberedEmail,
  type LoginFieldErrors,
} from "@/lib/login";

function subscribeToStorage() {
  return () => {};
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 21 21" aria-hidden>
      <rect x="0" y="0" width="10" height="10" fill="#f25022" />
      <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
      <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
      <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
    </svg>
  );
}

function StatusIcon({ variant }: { variant: "success" | "error" }) {
  if (variant === "success") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
          <path
            d="M1 4L3.5 7L9 1"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path
          d="M2.5 2.5l5 5M7.5 2.5l-5 5"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function LoginForm() {
  const rememberedEmail = useSyncExternalStore(
    subscribeToStorage,
    readRememberedEmail,
    () => "",
  );

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const pendingFocusRef = useRef<keyof LoginFieldErrors | null>(null);
  const formErrorId = useId();

  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const emailValue = email ?? rememberedEmail;
  const rememberMeValue = rememberMe ?? Boolean(rememberedEmail);

  useEffect(() => {
    if (isLoading || !pendingFocusRef.current) return;
    const field = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (field === "email") emailRef.current?.focus();
    else passwordRef.current?.focus();
  }, [isLoading, fieldErrors]);

  function clearStatus() {
    if (formError) setFormError(null);
    if (successMessage) setSuccessMessage(null);
  }

  function clearFieldError(field: keyof LoginFieldErrors) {
    if (!fieldErrors[field]) return;
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
    clearFieldError("email");
    clearStatus();
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    clearFieldError("password");
    clearStatus();
  }

  function focusFirstInvalid(errors: LoginFieldErrors) {
    if (errors.email) {
      emailRef.current?.focus();
      return;
    }
    if (errors.password) passwordRef.current?.focus();
  }

  function queueFocusFirstInvalid(errors: LoginFieldErrors) {
    if (errors.email) pendingFocusRef.current = "email";
    else if (errors.password) pendingFocusRef.current = "password";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearStatus();

    const errors = validateLoginFields(emailValue, password);
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      focusFirstInvalid(errors);
      return;
    }

    setIsLoading(true);
    try {
      await loginRequest(emailValue, password);
      writeRememberedEmail(rememberMeValue ? emailValue.trim() : null);
      setSuccessMessage("Signed in successfully. Redirecting…");
    } catch (error) {
      if (error instanceof LoginRequestError && error.fields) {
        setFieldErrors(error.fields);
        queueFocusFirstInvalid(error.fields);
      }
      setFormError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const eyeToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((value) => !value)}
      disabled={isLoading}
      className={cn(
        "rounded p-1 text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50",
        focusRing,
      )}
      aria-label={showPassword ? "Hide password" : "Show password"}
      aria-pressed={showPassword}
    >
      {showPassword ? (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="w-full">
      <div className="mb-4 space-y-3" aria-live="polite">
        {successMessage ? (
          <Alert variant="success" className="animate-slide-down">
            <StatusIcon variant="success" />
            <span>{successMessage}</span>
          </Alert>
        ) : null}

        {formError ? (
          <Alert
            id={formErrorId}
            variant="error"
            className="animate-slide-down"
            aria-live="assertive"
          >
            <StatusIcon variant="error" />
            <span>{formError}</span>
          </Alert>
        ) : null}
      </div>

      <div
        className="rounded-2xl bg-white/95 p-5 shadow-[var(--login-card-shadow)] backdrop-blur-md sm:p-8"
      >
        <header className="mb-6 space-y-1.5 text-center sm:mb-7">
          <div className="mb-5 flex justify-center sm:mb-6">
            <Logo />
          </div>
          <h1
            id="login-heading"
            className="text-[22px] leading-tight font-bold tracking-[-0.025em] text-slate-900 sm:text-[26px]"
          >
            Welcome back
          </h1>
          <p className="text-[14px] text-slate-500">
            Sign in to continue to Meridian
          </p>
        </header>

        <div className="mb-5 flex flex-col gap-2.5 min-[380px]:flex-row">
          <SSOButton
            label="Google"
            icon={<GoogleIcon />}
            disabled={isLoading}
            aria-label="Sign in with Google"
          />
          <SSOButton
            label="Microsoft"
            icon={<MicrosoftIcon />}
            disabled={isLoading}
            aria-label="Sign in with Microsoft"
          />
        </div>

        <Divider label="or continue with email" />

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby="login-heading"
          aria-describedby={formError ? formErrorId : undefined}
          className="mt-5 flex flex-col gap-4 sm:gap-[1.125rem]"
        >
          <Input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            label="Work email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@company.com"
            value={emailValue}
            required
            disabled={isLoading}
            error={fieldErrors.email}
            onChange={handleEmailChange}
          />

          <Input
            ref={passwordRef}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            required
            disabled={isLoading}
            error={fieldErrors.password}
            suffix={eyeToggle}
            onChange={handlePasswordChange}
          />

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <Checkbox
              id="remember"
              name="rememberMe"
              label="Remember me"
              checked={rememberMeValue}
              disabled={isLoading}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <a href="#" className={cn(linkPrimary, "min-h-9 inline-flex items-center")}>
              Forgot password?
            </a>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              loadingText=""
            >
              Sign in
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 7.5h9M8.5 4l3.5 3.5L8.5 11"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-[13.5px] text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={cn(linkPrimary, "font-semibold")}>
            Create a free account
          </Link>
        </p>
      </div>
    </div>
  );
}
