"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { AuthFormCard } from "@/components/auth/AuthPageShell";
import {
  GoogleIcon,
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
import { PasswordStrengthMeter } from "@/components/signup/PasswordStrengthMeter";
import { cn, linkPrimary } from "@/lib/cn";
import {
  SignupRequestError,
  signupRequest,
  validateSignupFields,
  type SignupFieldErrors,
} from "@/lib/signup";

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
      const result = await signupRequest({
        name,
        email,
        password,
        confirmPassword,
        termsAccepted,
      });
      setSuccessMessage(
        result.token
          ? "Account created successfully."
          : "Account created. Check your email to confirm, then sign in.",
      );
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

      <AuthFormCard
        headingId="signup-heading"
        title="Create an account"
        subtitle="Get started — it only takes a minute"
      >
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
                <PasswordEyeToggle
                  show={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                  disabled={isLoading}
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
                <PasswordEyeToggle
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
              <SubmitArrowIcon />
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-[13.5px] text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className={cn(linkPrimary, "font-semibold")}>
            Sign in
          </Link>
        </p>
      </AuthFormCard>
    </div>
  );
}
