import type { Metadata } from "next";
import { SignupPageView } from "@/components/signup/SignupPageView";

export const metadata: Metadata = {
  title: "Create account | Meridian",
  description: "Create your Meridian account",
};

export default function SignupPage() {
  return <SignupPageView />;
}
