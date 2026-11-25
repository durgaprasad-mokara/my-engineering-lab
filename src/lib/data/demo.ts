/**
 * DEMO DATA — shown only when Supabase is not configured.
 * Every surface that renders these values displays a "Demo data" badge.
 * Values are deliberately generic and do not describe real products, prices or measurements.
 */
import type {
  ConfigurationSummary,
  DashboardData,
  DesignSummary,
  NotificationSummary,
  ProjectSummary,
  Stat,
  TaskSummary,
  TelemetryPoint,
  Viewer,
} from "./types";
import { STAT_LABELS } from "./stats";

const hoursAgo = (h: number, now: Date) => new Date(now.getTime() - h * 3600_000).toISOString();

export function demoStats(): Stat[] {
  const v: Record<string, number> = {
    components: 48,
    sensors: 22,
    microcontrollers: 9,
    communication_modules: 7,
    antenna_types: 6,
    iot_projects: 3,
    robotics_projects: 1,
    saved_configurations: 5,
    completed_experiments: 4,
  };
  return STAT_LABELS.map(({ key, label }) =>
    key === "learning_progress"
      ? { key, label, value: 18, display: "18 / 365", hint: "days completed" }
      : { key, label, value: v[key] ?? 0 },
  );
}

export function demoProjects(now = new Date()): ProjectSummary[] {
  return [
    { id: "demo-p1", name: "Smart Water Meter (4G)", kind: "iot", industry: "water", status: "design", updatedAt: hoursAgo(3, now) },
    { id: "demo-p2", name: "Motor Vibration Monitor", kind: "iot", industry: "industrial", status: "research", updatedAt: hoursAgo(28, now) },
    { id: "demo-p3", name: "Soil Moisture Node (LoRaWAN)", kind: "iot", industry: "agriculture", status: "planning", updatedAt: hoursAgo(75, now) },
    { id: "demo-p4", name: "Differential-drive Rover", kind: "robotics", industry: null, status: "development", updatedAt: hoursAgo(130, now) },
  ];
}

export function demoConfigurations(): ConfigurationSummary[] {
  return [
    { id: "c1", name: "Config A — Cat 1 modem", selected: true, scores: { cost: 3, power: 3, performance: 4, compatibility: 5, scalability: 4 } },
    { id: "c2", name: "Config B — LTE-M / NB-IoT", selected: false, scores: { cost: 3, power: 5, performance: 3, compatibility: 4, scalability: 5 } },
    { id: "c3", name: "Config C — LoRaWAN", selected: false, scores: { cost: 4, power: 5, performance: 2, compatibility: 4, scalability: 3 } },
    { id: "c4", name: "Config D — Cat 4 modem", selected: false, scores: { cost: 2, power: 2, performance: 5, compatibility: 4, scalability: 4 } },
    { id: "c5", name: "Config E — Wi-Fi bridge", selected: false, scores: { cost: 5, power: 2, performance: 4, compatibility: 3, scalability: 2 } },
  ];
}

export function demoTasks(): TaskSummary[] {
  return [
    { id: "t1", title: "Study: Ohm's law and power dissipation", status: "completed", dueTime: "07:30" },
    { id: "t2", title: "Exercise: measure a resistor divider with a multimeter", status: "pending", dueTime: "18:00" },
    { id: "t3", title: "Quiz: resistor colour codes", status: "pending", dueTime: "21:00" },
  ];
}

export function demoTaskDates(now = new Date()): string[] {
  const y = now.getFullYear();
  const m = now.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  const days = [2, 3, 5, 8, 9, 12, 15, 16, 19, 22, 23, 26, now.getDate()].filter((d) => d <= last);
  return [...new Set(days)].map((d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
}

export function demoDesigns(now = new Date()): DesignSummary[] {
  return [
    { id: "d1", name: "Water meter — block diagram", type: "diagram", updatedAt: hoursAgo(5, now) },
    { id: "d2", name: "Sensor-to-cloud architecture", type: "architecture", updatedAt: hoursAgo(50, now) },
    { id: "d3", name: "Config A shortlist", type: "configuration", updatedAt: hoursAgo(96, now) },
  ];
}

/** Synthetic household-style flow profile (morning and evening peaks). Not a measurement. */
export function demoTelemetry(now = new Date()): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  for (let i = 47; i >= 0; i--) {
    const t = new Date(start.getTime() - i * 30 * 60_000);
    const h = t.getHours() + t.getMinutes() / 60;
    const peak = (c: number, w: number, a: number) => a * Math.exp(-((h - c) ** 2) / (2 * w * w));
    const value = 0.2 + peak(7.5, 1.1, 9) + peak(13, 0.8, 3) + peak(20, 1.4, 6.5) + 0.4 * Math.sin(i * 1.7);
    points.push({ t: t.toISOString(), value: Math.max(0, Number(value.toFixed(2))) });
  }
  return points;
}

export function demoNotifications(now = new Date()): NotificationSummary[] {
  return [
    { id: "n1", title: "Daily lesson ready", body: "Day 19 — Capacitors: charge, discharge and time constants.", createdAt: hoursAgo(1, now), read: false },
    { id: "n2", title: "Phase 1 foundation deployed", body: "Dashboard, navigation and authentication are available.", createdAt: hoursAgo(20, now), read: true },
  ];
}

export const DEMO_VIEWER: Viewer = { mode: "demo", id: null, name: "Demo Engineer", email: null, initials: "DE" };

export function demoDashboard(now = new Date()): DashboardData {
  return {
    mode: "demo",
    errors: [],
    stats: demoStats(),
    recentProjects: demoProjects(now),
    configurations: demoConfigurations(),
    configurationsProject: "Smart Water Meter (4G)",
    tasksToday: demoTasks(),
    taskDates: demoTaskDates(now),
    recentComponents: [],
    savedDesigns: demoDesigns(now),
    telemetry: { metric: "Flow rate", unit: "L/min", points: demoTelemetry(now), source: "demo" },
  };
}
