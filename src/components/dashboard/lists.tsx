import Link from "next/link";
import { CheckCircle2, Circle, CircleAlert, Clock, FolderKanban, History, Lightbulb, PenTool } from "lucide-react";
import type { ComponentSummary, DesignSummary, ProjectSummary, Stat, TaskSummary } from "@/lib/data/types";
import type { AppMode } from "@/lib/env";
import { relativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

const STATUS_VARIANT: Record<ProjectSummary["status"], "outline" | "default" | "accent" | "warning" | "success"> = {
  planning: "outline",
  research: "default",
  design: "accent",
  development: "accent",
  testing: "warning",
  completed: "success",
};

const KIND_LABEL: Record<ProjectSummary["kind"], string> = { iot: "IoT", robotics: "Robotics", iot_robotics: "IoT + Robotics", general: "General" };

const src = (mode: AppMode, hasData: boolean) => (mode === "demo" ? "demo" : hasData ? "live" : "none") as "demo" | "live" | "none";

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-dashed p-5 text-center text-xs text-muted-foreground">{children}</div>;
}

export function RecentProjects({ projects, mode }: { projects: ProjectSummary[]; mode: AppMode }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FolderKanban className="size-4 text-accent" /> Recent projects</CardTitle>
        <DataSourceBadge source={src(mode, projects.length > 0)} />
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <Empty>No projects yet. The project workspace arrives in Phase 7.</Empty>
        ) : (
          <ul className="divide-y">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-sm">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {KIND_LABEL[p.kind]}{p.industry ? ` · ${p.industry.replace("_", " ")}` : ""} · {relativeTime(p.updatedAt)}
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[p.status]} className="capitalize">{p.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function TodayTasks({ tasks, mode }: { tasks: TaskSummary[]; mode: AppMode }) {
  const done = tasks.filter((t) => t.status === "completed").length;
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2"><Clock className="size-4 text-accent" /> Today&apos;s tasks</CardTitle>
          {tasks.length > 0 && <CardDescription>{done} of {tasks.length} done</CardDescription>}
        </div>
        <DataSourceBadge source={src(mode, tasks.length > 0)} />
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <Empty>Nothing scheduled for today. Task scheduling arrives with the calendar in Phase 12.</Empty>
        ) : (
          <ul className="space-y-1.5">
            {tasks.map((t) => {
              const Icon = t.status === "completed" ? CheckCircle2 : t.status === "missed" ? CircleAlert : Circle;
              const tone = t.status === "completed" ? "text-success" : t.status === "missed" ? "text-danger" : "text-muted-foreground";
              return (
                <li key={t.id} className="flex items-start gap-2.5 rounded-md border bg-surface-raised/30 p-2.5">
                  <Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} aria-label={t.status} />
                  <span className={`flex-1 text-xs ${t.status === "completed" ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
                  {t.dueTime && <span className="font-mono text-[10px] text-muted-foreground">{t.dueTime}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function LearningCalendar({ taskDates, mode, now = new Date() }: { taskDates: string[]; mode: AppMode; now?: Date }) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday-first
  const marked = new Set(taskDates);
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const key = (d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Learning calendar</CardTitle>
          <CardDescription>{first.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</CardDescription>
        </div>
        <DataSourceBadge source={src(mode, taskDates.length > 0)} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="pb-1 font-medium">{d}</div>
          ))}
          {cells.map((d, i) =>
            d === null ? (
              <div key={`e${i}`} />
            ) : (
              <div
                key={d}
                className={`relative flex aspect-square items-center justify-center rounded text-[11px] ${
                  d === now.getDate() ? "bg-primary font-semibold text-primary-foreground" : "text-foreground/80"
                }`}
                aria-label={`${d}${marked.has(key(d)) ? ", has tasks" : ""}`}
              >
                {d}
                {marked.has(key(d)) && d !== now.getDate() && <span className="absolute bottom-0.5 size-1 rounded-full bg-accent" />}
              </div>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function Recommendations({ stats }: { stats: Stat[] }) {
  const get = (k: Stat["key"]) => stats.find((s) => s.key === k)?.value ?? 0;
  const recs: { title: string; body: string; href: string }[] = [];
  recs.push({
    title: "Month 1 · Electronics fundamentals",
    body: "Work through Ohm's law and power dissipation — try the quick calculator with an LED series resistor.",
    href: "/documentation/roadmap",
  });
  if (!get("components")) {
    recs.push({ title: "Knowledge base is empty", body: "Seed your Supabase catalogue or browse component, sensor and MCU records.", href: "/components" });
  }
  recs.push({
    title: "Estimate a battery budget",
    body: "Model a 15-minute reporting interval and see how sleep current dominates runtime.",
    href: "/dashboard#calculators",
  });
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2"><Lightbulb className="size-4 text-violet" /> Recommendations</CardTitle>
          <CardDescription>AI-generated recommendations arrive in Phase 10.</CardDescription>
        </div>
        <DataSourceBadge source="rule-based" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {recs.map((r) => (
            <li key={r.title}>
              <Link href={r.href} className="block rounded-md border bg-surface-raised/30 p-2.5 hover:border-violet/40">
                <div className="text-xs font-medium">{r.title}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{r.body}</div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function RecentComponents({ items, mode }: { items: ComponentSummary[]; mode: AppMode }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><History className="size-4 text-accent" /> Recently viewed components</CardTitle>
        <DataSourceBadge source={src(mode, items.length > 0)} />
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <Empty>
            No components viewed yet.{" "}
            <Link href="/components" className="text-accent hover:underline">
              Browse the Components Library
            </Link>{" "}
            to record history.
          </Empty>
        ) : (
          <ul className="divide-y">
            {items.map((c) => (
              <li key={c.id} className="py-2">
                {c.slug ? (
                  <Link href={`/components/${c.slug}`} className="group block">
                    <div className="text-sm group-hover:text-accent">{c.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{c.partNumber ?? "—"} · {c.category ?? "Uncategorised"}</div>
                  </Link>
                ) : (
                  <>
                    <div className="text-sm">{c.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{c.partNumber ?? "—"} · {c.category ?? "Uncategorised"}</div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function SavedDesigns({ items, mode }: { items: DesignSummary[]; mode: AppMode }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><PenTool className="size-4 text-accent" /> Saved designs</CardTitle>
        <DataSourceBadge source={src(mode, items.length > 0)} />
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <Empty>No saved designs. The circuit and architecture designers arrive in Phase 5.</Empty>
        ) : (
          <ul className="divide-y">
            {items.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-sm">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground">{relativeTime(d.updatedAt)}</div>
                </div>
                <Badge variant="outline" className="capitalize">{d.type}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
