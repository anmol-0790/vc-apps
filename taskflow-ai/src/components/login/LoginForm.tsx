"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import {
  LoginRequestError,
  loginRequest,
  readRememberedEmail,
  validateLoginFields,
  writeRememberedEmail,
  type LoginFieldErrors,
} from "@/lib/login";

type LoginFormProps = {
  /** Matches a heading `id` on the page for accessible form naming. */
  labelledBy?: string;
};

function subscribeToStorage() {
  return () => {};
}

export function LoginForm({ labelledBy }: LoginFormProps) {
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

    if (field === "email") {
      emailRef.current?.focus();
      return;
    }

    passwordRef.current?.focus();
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

  function queueFocusFirstInvalid(errors: LoginFieldErrors) {
    if (errors.email) {
      pendingFocusRef.current = "email";
      return;
    }
    if (errors.password) {
      pendingFocusRef.current = "password";
    }
  }

  function focusFirstInvalid(errors: LoginFieldErrors) {
    if (errors.email) {
      emailRef.current?.focus();
      return;
    }
    if (errors.password) {
      passwordRef.current?.focus();
    }
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
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={labelledBy}
      aria-describedby={formError ? formErrorId : undefined}
      className="flex w-full flex-col gap-5"
    >
      <Input
        ref={emailRef}
        id="email"
        name="email"
        type="email"
        label="Email"
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
        type="password"
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={password}
        required
        disabled={isLoading}
        error={fieldErrors.password}
        onChange={handlePasswordChange}
      />

      <Checkbox
        id="remember-me"
        name="rememberMe"
        label="Remember me"
        checked={rememberMeValue}
        disabled={isLoading}
        onChange={(event) => setRememberMe(event.target.checked)}
      />

      {formError ? (
        <Alert id={formErrorId} variant="error">
          {formError}
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert variant="success">{successMessage}</Alert>
      ) : null}

      <Button
        type="submit"
        fullWidth
        loading={isLoading}
        loadingText="Signing in…"
      >
        Log in
      </Button>
    </form>
  );
}
