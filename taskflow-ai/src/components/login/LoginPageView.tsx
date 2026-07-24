"use client";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/login/LoginForm";

export function LoginPageView() {
  return (
    <AuthPageShell
      mainId="login-main"
      skipLabel="Skip to sign in"
      headerHint="Don't have an account?"
      headerAction={{ href: "/signup", label: "Create account" }}
      legalPrefix="By signing in, you agree to our"
    >
      <LoginForm />
    </AuthPageShell>
  );
}
