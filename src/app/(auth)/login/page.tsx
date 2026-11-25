import Link from "next/link";
import type { Metadata } from "next";
import { isDemoMode } from "@/lib/env";
import { AuthCard, DemoNotice } from "../auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back to your lab."
      footer={<>No account? <Link href="/signup" className="text-accent hover:underline">Create one</Link></>}
    >
      {isDemoMode && <DemoNotice />}
      {error === "confirmation" && (
        <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger">
          The confirmation link is invalid or has expired. Sign in or request a new link.
        </p>
      )}
      <LoginForm next={next} disabled={isDemoMode} />
    </AuthCard>
  );
}
