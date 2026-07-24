import type { Metadata } from "next";
import { LoginPageView } from "@/components/login/LoginPageView";

export const metadata: Metadata = {
  title: "Sign in | Meridian",
  description: "Sign in to continue to Meridian",
};

export default function LoginPage() {
  return <LoginPageView />;
}
