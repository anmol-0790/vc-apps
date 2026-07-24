"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/login/Divider";
import { Logo } from "@/components/login/Logo";
import { SSOButton } from "@/components/login/SSOButton";
import { PasswordStrengthMeter } from "@/components/signup/PasswordStrengthMeter";
import { cn, focusRing, linkPrimary } from "@/lib/cn";
import {
  SignupRequestError,
  signupRequest,
  validateSignupFields,
  type SignupFieldErrors,
} from "@/lib/signup";

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

function EyeToggle({
  show,
  onToggle,
  disabled,
  labelShow,
  labelHide,
}: {
  show: boolean;
  onToggle: () => void;
  disabled?: boolean;
  labelShow: string;
  labelHide: string;
}) {
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
      {show ? (
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
}

type FocusField = keyof SignupFieldErrors;

export function SignupForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const pendingFocusRef = useRef<FocusField | null>(null);
  const formErrorId = useId();
  const termsErrorId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !pendingFocusRef.current) return;
    const field = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (field === "name") nameRef.current?.focus();
    else if (field === "email") emailRef.current?.focus();
    else if (field === "password") passwordRef.current?.focus();
    else if (field === "confirmPassword") confirmRef.current?.focus();
    else if (field === "terms") termsRef.current?.focus();
  }, [isLoading, fieldErrors]);

  function clearStatus() {
    if (formError) setFormError(null);
    if (successMessage) setSuccessMessage(null);
  }

  function clearFieldError(field: keyof SignupFieldErrors) {
    if (!fieldErrors[field]) return;
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function focusFirstInvalid(errors: SignupFieldErrors) {
    if (errors.name) {
      nameRef.current?.focus();
      return;
    }
    if (errors.email) {
      emailRef.current?.focus();
      return;
    }
    if (errors.password) {
      passwordRef.current?.focus();
      return;
    }
    if (errors.confirmPassword) {
      confirmRef.current?.focus();
      return;
    }
    if (errors.terms) termsRef.current?.focus();
  }

  function queueFocusFirstInvalid(errors: SignupFieldErrors) {
    if (errors.name) pendingFocusRef.current = "name";
    else if (errors.email) pendingFocusRef.current = "email";
    else if (errors.password) pendingFocusRef.current = "password";
    else if (errors.confirmPassword) pendingFocusRef.current = "confirmPassword";
    else if (errors.terms) pendingFocusRef.current = "terms";
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
    clearFieldError("name");
    clearStatus();
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
    clearFieldError("email");
    clearStatus();
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    clearFieldError("password");
    if (confirmPassword && event.target.value === confirmPassword) {
      clearFieldError("confirmPassword");
    }
    clearStatus();
  }

  function handleConfirmChange(event: ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(event.target.value);
    clearFieldError("confirmPassword");
    clearStatus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearStatus();

    const errors = validateSignupFields({
      name,
      email,
      password,
      confirmPassword,
      termsAccepted,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      focusFirstInvalid(errors);
      return;
    }

    setIsLoading(true);
    try {
      await signupRequest({
        name,
        email,
        password,
        confirmPassword,
        termsAccepted,
      }).then((result) => {
        setSuccessMessage(
          result.token
            ? "Account created successfully. Redirecting…"
            : "Account created. Check your email to confirm, then sign in.",
        );
      });
    } catch (error) {
      if (error instanceof SignupRequestError && error.fields) {
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

  const showMismatchHint =
    confirmPassword.length > 0 &&
    password !== confirmPassword &&
    !fieldErrors.confirmPassword;

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

      <div className="rounded-2xl bg-white/95 p-5 shadow-[var(--login-card-shadow)] backdrop-blur-md sm:p-8">
        <header className="mb-6 space-y-1.5 text-center sm:mb-7">
          <div className="mb-5 flex justify-center sm:mb-6">
            <Logo />
          </div>
          <h1
            id="signup-heading"
            className="text-[22px] leading-tight font-bold tracking-[-0.025em] text-slate-900 sm:text-[26px]"
          >
            Create an account
          </h1>
          <p className="text-[14px] text-slate-500">
            Get started — it only takes a minute
          </p>
        </header>

        <div className="mb-5">
          <SSOButton
            label="Sign up with Google"
            icon={<GoogleIcon />}
            disabled={isLoading}
            className="w-full flex-none"
            aria-label="Sign up with Google"
          />
        </div>

        <Divider label="or" />

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby="signup-heading"
          aria-describedby={formError ? formErrorId : undefined}
          className="mt-5 flex flex-col gap-4 sm:gap-[1.125rem]"
        >
          <Input
            ref={nameRef}
            id="signup-name"
            name="name"
            type="text"
            label="Full name"
            autoComplete="name"
            placeholder="Jane Smith"
            value={name}
            required
            disabled={isLoading}
            error={fieldErrors.name}
            onChange={handleNameChange}
          />

          <Input
            ref={emailRef}
            id="signup-email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            required
            disabled={isLoading}
            error={fieldErrors.email}
            onChange={handleEmailChange}
          />

          <div>
            <Input
              ref={passwordRef}
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              required
              disabled={isLoading}
              error={fieldErrors.password}
              suffix={
                <EyeToggle
                  show={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                  disabled={isLoading}
                  labelShow="Show password"
                  labelHide="Hide password"
                />
              }
              onChange={handlePasswordChange}
            />
            {password.length > 0 ? (
              <PasswordStrengthMeter password={password} />
            ) : null}
          </div>

          <div>
            <Input
              ref={confirmRef}
              id="signup-confirm-password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirmPassword}
              required
              disabled={isLoading}
              error={fieldErrors.confirmPassword}
              suffix={
                <EyeToggle
                  show={showConfirm}
                  onToggle={() => setShowConfirm((value) => !value)}
                  disabled={isLoading}
                  labelShow="Show confirm password"
                  labelHide="Hide confirm password"
                />
              }
              onChange={handleConfirmChange}
            />
            {showMismatchHint ? (
              <p className="mt-1.5 text-[12px] text-red-500">
                Passwords do not match
              </p>
            ) : null}
          </div>

          <div>
            <Checkbox
              ref={termsRef}
              id="signup-terms"
              name="termsAccepted"
              checked={termsAccepted}
              disabled={isLoading}
              aria-invalid={fieldErrors.terms ? true : undefined}
              aria-describedby={
                fieldErrors.terms ? termsErrorId : undefined
              }
              onChange={(event) => {
                setTermsAccepted(event.target.checked);
                clearFieldError("terms");
                clearStatus();
              }}
              label={
                <span className="text-[13px] leading-relaxed text-slate-500">
                  I agree to the{" "}
                  <a href="#" className={linkPrimary}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className={linkPrimary}>
                    Privacy Policy
                  </a>
                </span>
              }
              className="items-start"
            />
            {fieldErrors.terms ? (
              <p id={termsErrorId} className="mt-1.5 text-[13px] text-red-600">
                {fieldErrors.terms}
              </p>
            ) : null}
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              loadingText=""
            >
              Create account
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
          Already have an account?{" "}
          <Link href="/login" className={cn(linkPrimary, "font-semibold")}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
