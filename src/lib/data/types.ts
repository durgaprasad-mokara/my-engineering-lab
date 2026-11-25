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
  slug?: string;
  name: string;
  partNumber: string | null;
  category: string | null;
}

export type VerificationStatus =
  | "verified"
  | "typical"
  | "estimated"
  | "user_provided"
  | "simulated"
  | "unverified";

export interface PinoutEntry {
  pin: string;
  name: string;
  function: string;
}

export interface ComponentRating {
  key: string;
  label: string;
  min: number | null;
  typ: number | null;
  max: number | null;
  unit: string;
  conditions: string | null;
  verificationStatus: VerificationStatus;
  source: string;
}

export interface ComponentAlternative {
  slug: string;
  name: string;
  relation: "alternative" | "compatible";
  notes?: string | null;
}

export interface CatalogueComponent {
  id: string;
  slug: string;
  name: string;
  manufacturer: string | null;
  partNumber: string | null;
  package: string | null;
  description: string | null;
  category: string;
  categorySlug: string;
  operatingPrinciple: string | null;
  interfaces: string[];
  applications: string[];
  advantages: string[];
  limitations: string[];
  verificationStatus: VerificationStatus;
  sourceUrl: string | null;
  datasheetUrl: string | null;
  internalStructure?: string | null;
  pinout?: PinoutEntry[];
  ratings?: ComponentRating[];
  sourceTitle?: string | null;
  documentRev?: string | null;
  alternatives?: ComponentAlternative[];
}

export interface SensorSpec {
  key: string;
  minValue: number | null;
  typValue: number | null;
  maxValue: number | null;
  unit: string;
  conditions: string | null;
  verificationStatus: VerificationStatus;
  source?: string | null;
}

export interface CatalogueSensor {
  id: string;
  slug: string;
  name: string;
  sensorGroup: string;
  measurand: string;
  measurementPrinciple: string | null;
  howItWorks: string | null;
  outputType: string | null;
  protocols: string[];
  applications: string[];
  advantages: string[];
  disadvantages: string[];
  verificationStatus: VerificationStatus;
  sourceUrl: string | null;
  specs: SensorSpec[];
  internalConstruction?: string | null;
  calibrationProcedure?: string | null;
  environmentalLimits?: string | null;
  sourceTitle?: string | null;
  documentRev?: string | null;
}

export interface McuPowerSpec {
  activeMa: number | null;
  deepSleepUa: number | null;
  supplyVoltageMin: number | null;
  supplyVoltageMax: number | null;
  verificationStatus: VerificationStatus;
  source: string;
}

export interface CatalogueMcu {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  architecture: string | null;
  cpu: string | null;
  maxClockMhz: number | null;
  flashKb: number | null;
  ramKb: number | null;
  gpioCount: number | null;
  wireless: string[];
  devTools: string[];
  languages: string[];
  applications: string[];
  verificationStatus: VerificationStatus;
  sourceUrl: string | null;
  adc?: { channels: number | null; bits: number | null } | null;
  dac?: { channels: number | null; bits: number | null } | null;
  peripherals?: Record<string, number | string>;
  power?: McuPowerSpec | null;
  sourceTitle?: string | null;
  documentRev?: string | null;
}

// --- Phase 3: Communication & Antennas Types -------------------------

export type CommunicationCategory = "cellular" | "lpwan" | "wired" | "application";

export type ApplicationDomain =
  | "smart_water_meter"
  | "smart_energy_meter"
  | "railway_track"
  | "railway_bridge"
  | "agriculture"
  | "industrial_telemetry";

export type SuitabilityScore = 1 | 2 | 3 | 4 | 5;

export interface DomainSuitability {
  domain: ApplicationDomain;
  score: SuitabilityScore;
  label: "Unsuitable" | "Poor" | "Moderate" | "Good" | "Excellent";
  rationale: string;
}

export interface CommunicationSpecRow {
  label: string;
  value: string;
  status: VerificationStatus;
  source?: string;
}

export interface CatalogueCommunicationModule {
  id: string;
  slug: string;
  name: string;
  category: CommunicationCategory;
  standard: string;
  frequencyBands: string[];
  dataRate: string;
  typicalRange: string;
  topology: string;
  powerConsumption: string;
  latency: string;
  payloadSize: string;
  security: string;
  deploymentCost: "Low" | "Medium" | "High";
  infrastructure: string;
  typicalHardware: string;
  description: string;
  advantages: string[];
  limitations: string[];
  applications: string[];
  regionalBands: { region: string; band: string; notes: string }[];
  suitability: DomainSuitability[];
  verificationStatus: VerificationStatus;
  sourceUrl: string | null;
  sourceTitle?: string | null;
  documentRev?: string | null;
}

export type AntennaType =
  | "dipole"
  | "monopole"
  | "patch"
  | "pcb"
  | "fpc"
  | "ceramic"
  | "yagi"
  | "helical"
  | "combo";

export interface RadiationPatternPoint {
  angle: number; // 0 to 360 degrees
  ePlaneDbi: number;
  hPlaneDbi: number;
}

export interface CatalogueAntenna {
  id: string;
  slug: string;
  name: string;
  manufacturer: string;
  partNumber: string;
  antennaType: AntennaType;
  services: string[];
  freqMinMhz: number;
  freqMaxMhz: number;
  peakGainDbi: number;
  impedanceOhm: number;
  vswrMax: number;
  returnLossDb: number | null;
  polarization: string;
  connector: string;
  cableLengthMm?: number | null;
  groundPlane: string;
  dimensionsMm: string;
  efficiencyPercent: number | null;
  radiationPatternType: "omnidirectional" | "directional" | "hemispherical";
  patternData: RadiationPatternPoint[];
  description: string;
  designConsiderations: string[];
  matchingNotes: string;
  applications: string[];
  verificationStatus: VerificationStatus;
  sourceUrl: string | null;
  sourceTitle?: string | null;
  documentRev?: string | null;
}

export interface SpectrumRegulationEntry {
  id: string;
  region: "India (WPC/TEC)" | "Europe (ETSI)" | "North America (FCC)" | "Global (ITU)";
  bandName: string;
  frequencyRange: string;
  licensedStatus: "De-licensed (Unlicensed)" | "Licensed (Cellular)" | "Restricted";
  maxEirpPower: string;
  dutyCycleLimit: string;
  mandatoryCert: string;
  keyApplications: string[];
  regulatoryRef: string;
  notes: string;
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
