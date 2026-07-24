"use client";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { SignupForm } from "@/components/signup/SignupForm";

export function SignupPageView() {
  return (
    <AuthPageShell
      mainId="signup-main"
      skipLabel="Skip to create account"
      headerHint="Already have an account?"
      headerAction={{ href: "/login", label: "Sign in" }}
      legalPrefix="By creating an account, you agree to our"
    >
      <SignupForm />
    </AuthPageShell>
  );
}
