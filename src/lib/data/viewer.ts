import "server-only";
import { getCurrentUser } from "@/lib/supabase/server";
import { DEMO_VIEWER, demoNotifications } from "./demo";
import type { NotificationSummary, Viewer } from "./types";

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("") || "?";

export async function getViewer(): Promise<{ viewer: Viewer; notifications: NotificationSummary[] }> {
  const session = await getCurrentUser();
  if (!session) return { viewer: DEMO_VIEWER, notifications: demoNotifications() };
  const { supabase, user } = session;
  const [{ data: profile }, { data: notes }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase.from("notifications").select("id,title,body,created_at,read_at").order("created_at", { ascending: false }).limit(10),
  ]);
  const name = profile?.display_name || user.email?.split("@")[0] || "Engineer";
  return {
    viewer: { mode: "live", id: user.id, name, email: user.email ?? null, initials: initialsOf(name) },
    notifications: (notes ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      createdAt: n.created_at,
      read: Boolean(n.read_at),
    })),
  };
}
