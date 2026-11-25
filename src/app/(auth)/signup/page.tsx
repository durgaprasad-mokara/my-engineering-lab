import Link from "next/link";
import type { Metadata } from "next";
import { isDemoMode } from "@/lib/env";
import { AuthCard, DemoNotice } from "../auth-card";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your lab"
      subtitle="Your projects, designs and progress stay private to your account."
      footer={<>Already have an account? <Link href="/login" className="text-accent hover:underline">Sign in</Link></>}
    >
      {isDemoMode && <DemoNotice />}
      <SignupForm disabled={isDemoMode} />
    </AuthCard>
  );
}
