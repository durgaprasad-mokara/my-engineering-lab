import "server-only";
import { getCurrentUser } from "@/lib/supabase/server";
import { demoDashboard } from "./demo";
import { mapLiveStats } from "./stats";
import type { ConfigurationSummary, DashboardData, ProjectSummary } from "./types";

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const clampScore = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(5, Math.max(1, Math.round(n))) : 0;
};

export async function getDashboardData(now = new Date()): Promise<DashboardData> {
  const session = await getCurrentUser();
  if (!session) return demoDashboard(now);
  const { supabase } = session;
  const errors: string[] = [];
  const note = (what: string, e: { message: string } | null) => {
    if (e) errors.push(`${what}: ${e.message}`);
  };

  const today = ymd(now);
  const monthStart = ymd(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const since = new Date(now.getTime() - 24 * 3600_000).toISOString();

  const [stats, projects, tasksToday, taskDates, views, designs, latestConfig, telemetry] = await Promise.all([
    supabase.rpc("dashboard_stats"),
    supabase
      .from("projects")
      .select("id,name,kind,industry,status,updated_at")
      .eq("is_archived", false)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase.from("daily_tasks").select("id,title,status,due_time").eq("due_date", today).order("due_time"),
    supabase.from("daily_tasks").select("due_date").gte("due_date", monthStart).lte("due_date", monthEnd),
    supabase
      .from("component_views")
      .select("viewed_at, components(id,slug,name,part_number,component_categories(name))")
      .order("viewed_at", { ascending: false })
      .limit(5),
    supabase.from("saved_designs").select("id,name,design_type,updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase
      .from("hardware_configurations")
      .select("project_id, projects(name)")
      .not("project_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1),
    supabase
      .from("telemetry_data")
      .select("recorded_at,metric,value")
      .gte("recorded_at", since)
      .order("recorded_at", { ascending: true })
      .limit(500),
  ]);

  note("Statistics", stats.error);
  note("Projects", projects.error);
  note("Tasks", tasksToday.error);
  note("Calendar", taskDates.error);
  note("Recently viewed", views.error);
  note("Saved designs", designs.error);
  note("Configurations", latestConfig.error);
  note("Telemetry", telemetry.error);

  // Five-configuration comparison for the most recently edited project
  let configurations: ConfigurationSummary[] = [];
  let configurationsProject: string | null = null;
  const latest = latestConfig.data?.[0] as { project_id: string; projects: { name: string } | null } | undefined;
  if (latest?.project_id) {
    configurationsProject = latest.projects?.name ?? null;
    const { data, error } = await supabase
      .from("hardware_configurations")
      .select("id,name,is_selected,scores,rank")
      .eq("project_id", latest.project_id)
      .order("rank", { ascending: true, nullsFirst: false })
      .limit(5);
    note("Configurations", error);
    configurations = (data ?? []).map((c) => {
      const s = (c.scores ?? {}) as Record<string, unknown>;
      return {
        id: c.id,
        name: c.name,
        selected: c.is_selected,
        scores: {
          cost: clampScore(s.cost),
          power: clampScore(s.power),
          performance: clampScore(s.performance),
          compatibility: clampScore(s.compatibility),
          scalability: clampScore(s.scalability),
        },
      };
    });
  }

  const rows = (telemetry.data ?? []) as { recorded_at: string; metric: string; value: number | null }[];
  const metric = rows[0]?.metric;
  const points = metric
    ? rows.filter((r) => r.metric === metric && r.value !== null).map((r) => ({ t: r.recorded_at, value: r.value as number }))
    : [];

  type ViewRow = {
    components: { id: string; slug: string; name: string; part_number: string | null; component_categories: { name: string } | null } | null;
  };

  return {
    mode: "live",
    errors,
    stats: mapLiveStats((stats.data as Record<string, number> | null) ?? null),
    recentProjects: (projects.data ?? []).map(
      (p): ProjectSummary => ({
        id: p.id,
        name: p.name,
        kind: p.kind,
        industry: p.industry,
        status: p.status,
        updatedAt: p.updated_at,
      }),
    ),
    configurations,
    configurationsProject,
    tasksToday: (tasksToday.data ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      dueTime: t.due_time ? String(t.due_time).slice(0, 5) : null,
    })),
    taskDates: [...new Set((taskDates.data ?? []).map((t) => t.due_date as string))],
    recentComponents: ((views.data ?? []) as unknown as ViewRow[])
      .filter((v) => v.components)
      .map((v) => ({
        id: v.components!.id,
        slug: v.components!.slug,
        name: v.components!.name,
        partNumber: v.components!.part_number,
        category: v.components!.component_categories?.name ?? null,
      })),
    savedDesigns: (designs.data ?? []).map((d) => ({ id: d.id, name: d.name, type: d.design_type, updatedAt: d.updated_at })),
    telemetry: { metric: metric ?? "Telemetry", unit: "", points, source: points.length ? "live" : "none" },
  };
}
