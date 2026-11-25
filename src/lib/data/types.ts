import type { AppMode } from "@/lib/env";

export type DataSource = "live" | "demo" | "illustrative";

export type StatKey =
  | "components"
  | "sensors"
  | "microcontrollers"
  | "communication_modules"
  | "antenna_types"
  | "iot_projects"
  | "robotics_projects"
  | "saved_configurations"
  | "completed_experiments"
  | "learning_progress";

export interface Stat {
  key: StatKey;
  label: string;
  value: number | null;
  /** Display string overriding value, e.g. "12 / 365 days". */
  display?: string;
  hint?: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  kind: "iot" | "robotics" | "iot_robotics" | "general";
  industry: string | null;
  status: "planning" | "research" | "design" | "development" | "testing" | "completed";
  updatedAt: string;
}

export interface ConfigurationSummary {
  id: string;
  name: string;
  selected: boolean;
  /** Relative scores 1–5 (5 best). */
  scores: Record<"cost" | "power" | "performance" | "compatibility" | "scalability", number>;
}

export interface TaskSummary {
  id: string;
  title: string;
  status: "pending" | "completed" | "missed" | "rescheduled";
  dueTime: string | null;
}

export interface ComponentSummary {
  id: string;
  name: string;
  partNumber: string | null;
  category: string | null;
}

export interface DesignSummary {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
}

export interface TelemetryPoint {
  t: string; // ISO timestamp
  value: number;
}

export interface NotificationSummary {
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
  read: boolean;
}

export interface DashboardData {
  mode: AppMode;
  errors: string[];
  stats: Stat[];
  recentProjects: ProjectSummary[];
  configurations: ConfigurationSummary[];
  configurationsProject: string | null;
  tasksToday: TaskSummary[];
  taskDates: string[]; // YYYY-MM-DD within the current month
  recentComponents: ComponentSummary[];
  savedDesigns: DesignSummary[];
  telemetry: { metric: string; unit: string; points: TelemetryPoint[]; source: DataSource | "none" };
}

export interface Viewer {
  mode: AppMode;
  id: string | null;
  name: string;
  email: string | null;
  initials: string;
}
