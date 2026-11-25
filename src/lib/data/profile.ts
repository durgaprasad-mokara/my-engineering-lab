import "server-only";
import { getCurrentUser } from "@/lib/supabase/server";
import type { AppMode } from "@/lib/env";

export interface ProfileData {
  mode: AppMode;
  email: string | null;
  displayName: string;
  headline: string;
  timezone: string;
  learningGoals: string[];
  memberSince: string | null;
}

export interface PreferencesData {
  mode: AppMode;
  regionCode: string;
  unitsSystem: "metric" | "imperial";
  reminderTime: string | null;
}

export async function getProfile(): Promise<ProfileData> {
  const s = await getCurrentUser();
  if (!s) {
    return {
      mode: "demo",
      email: null,
      displayName: "Demo Engineer",
      headline: "Learning embedded systems and industrial IoT",
      timezone: "Asia/Kolkata",
      learningGoals: ["Design a 4G smart water meter end to end", "Get comfortable with STM32 and ESP32", "Learn ROS 2 basics"],
      memberSince: null,
    };
  }
  const { data } = await s.supabase
    .from("profiles")
    .select("display_name,headline,timezone,learning_goals,created_at")
    .eq("id", s.user.id)
    .maybeSingle();
  return {
    mode: "live",
    email: s.user.email ?? null,
    displayName: data?.display_name ?? "",
    headline: data?.headline ?? "",
    timezone: data?.timezone ?? "UTC",
    learningGoals: data?.learning_goals ?? [],
    memberSince: data?.created_at ?? null,
  };
}

export async function getPreferences(): Promise<PreferencesData> {
  const s = await getCurrentUser();
  if (!s) return { mode: "demo", regionCode: "IN", unitsSystem: "metric", reminderTime: "19:00" };
  const { data } = await s.supabase
    .from("user_preferences")
    .select("region_code,units_system,reminder_time")
    .eq("owner_id", s.user.id)
    .maybeSingle();
  return {
    mode: "live",
    regionCode: data?.region_code ?? "IN",
    unitsSystem: (data?.units_system as "metric" | "imperial") ?? "metric",
    reminderTime: data?.reminder_time ? String(data.reminder_time).slice(0, 5) : null,
  };
}
