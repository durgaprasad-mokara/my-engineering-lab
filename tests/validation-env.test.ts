import { describe, expect, it } from "vitest";
import { safeNextPath, signInSchema, signUpSchema } from "@/lib/validation/auth";
import { preferencesSchema, profileSchema } from "@/lib/validation/profile";
import { readPublicEnv, resolveMode } from "@/lib/env";
import { mapLiveStats } from "@/lib/data/stats";
import { demoDashboard } from "@/lib/data/demo";

describe("auth validation", () => {
  it("normalises email and requires a password", () => {
    const r = signInSchema.safeParse({ email: "  Me@Example.COM ", password: "x" });
    expect(r.success && r.data.email).toBe("me@example.com");
    expect(signInSchema.safeParse({ email: "bad", password: "" }).success).toBe(false);
  });

  it("enforces password rules and confirmation", () => {
    const ok = { displayName: "Ravi", email: "r@x.io", password: "abcdefgh12", confirmPassword: "abcdefgh12" };
    expect(signUpSchema.safeParse(ok).success).toBe(true);
    expect(signUpSchema.safeParse({ ...ok, password: "short1", confirmPassword: "short1" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...ok, password: "onlyletters", confirmPassword: "onlyletters" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...ok, confirmPassword: "different12" }).success).toBe(false);
  });

  it("prevents open redirects", () => {
    expect(safeNextPath("/sensors?x=1")).toBe("/sensors?x=1");
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.example")).toBe("/dashboard");
    expect(safeNextPath(undefined)).toBe("/dashboard");
  });
});

describe("profile validation", () => {
  it("validates time zones and splits goals", () => {
    const r = profileSchema.safeParse({ displayName: "Ravi", timezone: "Asia/Kolkata", learningGoals: "A\n\n B \n" });
    expect(r.success && r.data.learningGoals).toEqual(["A", "B"]);
    expect(profileSchema.safeParse({ displayName: "Ravi", timezone: "Mars/Olympus" }).success).toBe(false);
  });

  it("validates preferences", () => {
    const r = preferencesSchema.safeParse({ regionCode: "in", unitsSystem: "metric", reminderTime: "07:30" });
    expect(r.success && r.data.regionCode).toBe("IN");
    expect(preferencesSchema.safeParse({ regionCode: "IND", unitsSystem: "metric" }).success).toBe(false);
    expect(preferencesSchema.safeParse({ regionCode: "IN", unitsSystem: "metric", reminderTime: "25:00" }).success).toBe(false);
    const empty = preferencesSchema.safeParse({ regionCode: "IN", unitsSystem: "metric", reminderTime: "" });
    expect(empty.success && empty.data.reminderTime).toBeNull();
  });
});

describe("mode detection", () => {
  it("is live only with both Supabase variables", () => {
    expect(resolveMode(readPublicEnv({}))).toBe("demo");
    expect(resolveMode(readPublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co" }))).toBe("demo");
    expect(resolveMode(readPublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: " " }))).toBe("demo");
    expect(resolveMode(readPublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "k" }))).toBe("live");
  });
});

describe("dashboard stats", () => {
  it("maps RPC output and never invents learning totals", () => {
    const stats = mapLiveStats({ components: 3, sensors: "2", learning_completed_days: 0, learning_total_days: 0 });
    expect(stats).toHaveLength(10);
    expect(stats.find((s) => s.key === "components")?.value).toBe(3);
    expect(stats.find((s) => s.key === "sensors")?.value).toBe(2);
    expect(stats.find((s) => s.key === "antenna_types")?.value).toBeNull();
    expect(stats.find((s) => s.key === "learning_progress")?.display).toBe("—");
  });

  it("demo dashboard is flagged as demo", () => {
    const d = demoDashboard(new Date("2026-11-25T10:00:00Z"));
    expect(d.mode).toBe("demo");
    expect(d.telemetry.source).toBe("demo");
    expect(d.configurations).toHaveLength(5);
    expect(d.recentComponents.length).toBeGreaterThan(0);
    expect(d.recentComponents.every((c) => Boolean(c.slug))).toBe(true);
  });
});
