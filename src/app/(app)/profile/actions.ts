"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/server";
import { preferencesSchema, profileSchema } from "@/lib/validation/profile";

export interface FormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const fieldErrors = (issues: { path: PropertyKey[]; message: string }[]) =>
  Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message]));

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  const s = await getCurrentUser();
  if (!s) return { error: "Sign in to save your profile (demo mode is read-only)." };
  const { error } = await s.supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      headline: parsed.data.headline || null,
      timezone: parsed.data.timezone,
      learning_goals: parsed.data.learningGoals,
    })
    .eq("id", s.user.id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updatePreferences(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = preferencesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  const s = await getCurrentUser();
  if (!s) return { error: "Sign in to save settings (demo mode is read-only)." };
  const { error } = await s.supabase
    .from("user_preferences")
    .upsert({
      owner_id: s.user.id,
      region_code: parsed.data.regionCode,
      units_system: parsed.data.unitsSystem,
      reminder_time: parsed.data.reminderTime,
    });
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}
