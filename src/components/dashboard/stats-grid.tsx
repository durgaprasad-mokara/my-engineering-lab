import {
  Antenna, Bot, Boxes, Cpu, FlaskConical, Gauge, GraduationCap, Radio, Settings2, Waypoints,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Stat, StatKey } from "@/lib/data/types";
import type { AppMode } from "@/lib/env";
import { formatNumber } from "@/lib/utils";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

const ICONS: Record<StatKey, { icon: LucideIcon; color: string }> = {
  components: { icon: Boxes, color: "text-accent" },
  sensors: { icon: Gauge, color: "text-primary" },
  microcontrollers: { icon: Cpu, color: "text-violet" },
  communication_modules: { icon: Radio, color: "text-accent" },
  antenna_types: { icon: Antenna, color: "text-primary" },
  iot_projects: { icon: Waypoints, color: "text-success" },
  robotics_projects: { icon: Bot, color: "text-violet" },
  saved_configurations: { icon: Settings2, color: "text-accent" },
  completed_experiments: { icon: FlaskConical, color: "text-warning" },
  learning_progress: { icon: GraduationCap, color: "text-success" },
};

export function StatsGrid({ stats, mode }: { stats: Stat[]; mode: AppMode }) {
  return (
    <section aria-labelledby="stats-heading">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="stats-heading" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Lab inventory
        </h2>
        <DataSourceBadge source={mode === "demo" ? "demo" : "live"} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => {
          const { icon: Icon, color } = ICONS[s.key];
          return (
            <div key={s.key} className="rounded-lg border bg-surface p-3 shadow-card sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{s.label}</span>
                <Icon className={`size-4 ${color}`} aria-hidden />
              </div>
              <div className="mt-1.5 text-2xl font-semibold tabular-nums">
                {s.display ?? (s.value === null ? "—" : formatNumber(s.value, 0))}
              </div>
              {s.hint && <div className="text-[10px] text-muted-foreground">{s.hint}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
