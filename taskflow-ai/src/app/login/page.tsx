import type { Metadata } from "next";
import { LoginForm } from "@/components/login/LoginForm";

export const metadata: Metadata = {
  title: "Log in | TaskFlow AI",
  description: "Sign in to your TaskFlow AI account",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <header className="mb-8 flex flex-col gap-2 text-center sm:text-left">
          <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            TaskFlow AI
          </p>
          <h1
            id="login-heading"
            className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50"
          >
            Log in
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter your email and password to continue.
          </p>
        </header>

        <LoginForm labelledBy="login-heading" />
      </div>
    </main>
  );
}
