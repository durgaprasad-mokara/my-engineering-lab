"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { safeNextPath, signInSchema, signUpSchema } from "@/lib/validation/auth";

export interface AuthState {
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
  message?: string;
}

const firstErrors = (issues: { path: PropertyKey[]; message: string }[]) => {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[0] ?? "form");
    out[k] ??= i.message;
  }
  return out;
};

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured. The app is running in demo mode." };

  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return { error: error.message };
  redirect(safeNextPath(parsed.data.next));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured. The app is running in demo mode." };

  const origin = (await headers()).get("origin") ?? publicEnv.siteUrl;
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/dashboard");
  return { message: "Check your inbox to confirm your email, then sign in." };
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}

export async function resendConfirmation(email: string): Promise<AuthState> {
  if (!email.trim()) return { error: "Enter your email address above first." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured. The app is running in demo mode." };

  const origin = (await headers()).get("origin") ?? publicEnv.siteUrl;
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
    options: { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` },
  });
  if (error) return { error: error.message };
  return { message: "Confirmation email resent. Check your inbox (and spam folder)." };
}
