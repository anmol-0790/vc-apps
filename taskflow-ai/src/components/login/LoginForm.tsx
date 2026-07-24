"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { AuthFormCard } from "@/components/auth/AuthPageShell";
import {
  GoogleIcon,
  MicrosoftIcon,
  StatusIcon,
  SubmitArrowIcon,
} from "@/components/auth/icons";
import { PasswordEyeToggle } from "@/components/auth/PasswordEyeToggle";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/login/Divider";
import { SSOButton } from "@/components/login/SSOButton";
import { cn, linkPrimary } from "@/lib/cn";
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
      setSuccessMessage("Signed in successfully.");
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

      <AuthFormCard
        headingId="login-heading"
        title="Welcome back"
        subtitle="Sign in to continue to Meridian"
      >
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
            suffix={
              <PasswordEyeToggle
                show={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                disabled={isLoading}
              />
            }
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
            <a
              href="#"
              className={cn(linkPrimary, "inline-flex min-h-9 items-center")}
            >
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
              <SubmitArrowIcon />
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-[13.5px] text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={cn(linkPrimary, "font-semibold")}>
            Sign Up
          </Link>
        </p>
      </AuthFormCard>
    </div>
  );
}
