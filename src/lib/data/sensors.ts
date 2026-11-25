import "server-only";
import { isDemoMode, type AppMode } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { demoCatalogueSensors } from "./demo";
import type { CatalogueSensor, SensorSpec, VerificationStatus } from "./types";

const VALID_STATUSES = new Set<VerificationStatus>([
  "verified",
  "typical",
  "estimated",
  "user_provided",
  "simulated",
  "unverified",
]);

function toStatus(value: unknown): VerificationStatus {
  return typeof value === "string" && VALID_STATUSES.has(value as VerificationStatus)
    ? (value as VerificationStatus)
    : "unverified";
}

function toNumOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

interface RawSensorSpecRow {
  key: string;
  min_value: number | string | null;
  typ_value: number | string | null;
  max_value: number | string | null;
  unit: string;
  conditions: string | null;
  verification_status: unknown;
  sources: { url: string | null } | null;
}

interface RawSensorRow {
  id: string;
  slug: string;
  name: string;
  sensor_group: string;
  measurand: string;
  measurement_principle: string | null;
  how_it_works: string | null;
  internal_construction: string | null;
  output_type: string | null;
  protocols: unknown;
  calibration_procedure: string | null;
  environmental_limits: string | null;
  applications: unknown;
  advantages: unknown;
  disadvantages: unknown;
  verification_status: unknown;
  sources: { url: string | null; title: string | null; document_rev: string | null } | null;
  sensor_specifications?: RawSensorSpecRow[] | null;
}

function mapSensorRow(row: RawSensorRow): CatalogueSensor {
  const fallbackUrl = row.sources?.url ?? null;
  const specs: SensorSpec[] = (row.sensor_specifications ?? []).map((s) => ({
    key: s.key,
    minValue: toNumOrNull(s.min_value),
    typValue: toNumOrNull(s.typ_value),
    maxValue: toNumOrNull(s.max_value),
    unit: s.unit,
    conditions: s.conditions,
    verificationStatus: toStatus(s.verification_status),
    source: s.sources?.url ?? fallbackUrl,
  }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sensorGroup: row.sensor_group,
    measurand: row.measurand,
    measurementPrinciple: row.measurement_principle,
    howItWorks: row.how_it_works,
    internalConstruction: row.internal_construction,
    outputType: row.output_type,
    protocols: toStringArray(row.protocols),
    calibrationProcedure: row.calibration_procedure,
    environmentalLimits: row.environmental_limits,
    applications: toStringArray(row.applications),
    advantages: toStringArray(row.advantages),
    disadvantages: toStringArray(row.disadvantages),
    verificationStatus: toStatus(row.verification_status),
    sourceUrl: fallbackUrl,
    sourceTitle: row.sources?.title ?? null,
    documentRev: row.sources?.document_rev ?? null,
    specs,
  };
}

const SENSOR_SELECT =
  "id,slug,name,sensor_group,measurand,measurement_principle,how_it_works,internal_construction,output_type,protocols,calibration_procedure,environmental_limits,applications,advantages,disadvantages,verification_status,sources(url,title,document_rev),sensor_specifications(key,min_value,typ_value,max_value,unit,conditions,verification_status,sources(url))";

export async function getSensorsResult(): Promise<{
  items: CatalogueSensor[];
  mode: AppMode;
  error: string | null;
}> {
  if (isDemoMode) {
    return { items: demoCatalogueSensors(), mode: "demo", error: null };
  }
  const session = await getCurrentUser();
  if (!session) {
    return { items: demoCatalogueSensors(), mode: "demo", error: null };
  }

  const { data, error } = await session.supabase
    .from("sensors")
    .select(SENSOR_SELECT)
    .order("name", { ascending: true });

  if (error) {
    return { items: [], mode: "live", error: error.message };
  }

  const rows = (data ?? []) as unknown as RawSensorRow[];
  return {
    items: rows.map(mapSensorRow),
    mode: "live",
    error: null,
  };
}

export async function getSensors(): Promise<CatalogueSensor[]> {
  const { items } = await getSensorsResult();
  return items;
}

export async function getSensorBySlugResult(slug: string): Promise<{
  item: CatalogueSensor | null;
  mode: AppMode;
  error: string | null;
}> {
  if (isDemoMode) {
    return {
      item: demoCatalogueSensors().find((s) => s.slug === slug) ?? null,
      mode: "demo",
      error: null,
    };
  }
  const session = await getCurrentUser();
  if (!session) {
    return {
      item: demoCatalogueSensors().find((s) => s.slug === slug) ?? null,
      mode: "demo",
      error: null,
    };
  }

  const { data, error } = await session.supabase
    .from("sensors")
    .select(SENSOR_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return { item: null, mode: "live", error: error.message };
  }

  return {
    item: data ? mapSensorRow(data as unknown as RawSensorRow) : null,
    mode: "live",
    error: null,
  };
}

export async function getSensorBySlug(slug: string): Promise<CatalogueSensor | null> {
  const { item } = await getSensorBySlugResult(slug);
  return item;
}
