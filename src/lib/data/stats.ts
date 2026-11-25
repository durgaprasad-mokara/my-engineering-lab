import type { Stat, StatKey } from "./types";

export const STAT_LABELS: { key: StatKey; label: string }[] = [
  { key: "components", label: "Components" },
  { key: "sensors", label: "Sensors" },
  { key: "microcontrollers", label: "Microcontrollers" },
  { key: "communication_modules", label: "Comm. modules" },
  { key: "antenna_types", label: "Antenna types" },
  { key: "iot_projects", label: "IoT projects" },
  { key: "robotics_projects", label: "Robotics projects" },
  { key: "saved_configurations", label: "Saved configs" },
  { key: "completed_experiments", label: "Experiments done" },
  { key: "learning_progress", label: "Learning progress" },
];

type RawStats = Partial<Record<string, number | string | null>>;

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Map the dashboard_stats() RPC JSON onto display stats. */
export function mapLiveStats(raw: RawStats | null): Stat[] {
  return STAT_LABELS.map(({ key, label }) => {
    if (key === "learning_progress") {
      const done = toNum(raw?.learning_completed_days) ?? 0;
      const total = toNum(raw?.learning_total_days) ?? 0;
      return total > 0
        ? { key, label, value: done, display: `${done} / ${total}`, hint: "days completed" }
        : { key, label, value: null, display: "—", hint: "curriculum loads in Phase 12" };
    }
    return { key, label, value: toNum(raw?.[key]) };
  });
}
