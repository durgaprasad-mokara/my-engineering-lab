import "server-only";
import { isDemoMode, type AppMode } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { demoCatalogueMcus } from "./demo";
import type { CatalogueMcu, McuPowerSpec, VerificationStatus } from "./types";

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

function parseChannelsBits(raw: unknown): { channels: number | null; bits: number | null } | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const channels = toNumOrNull(obj.channels);
  const bits = toNumOrNull(obj.bits);
  if (channels === null && bits === null) return null;
  return { channels, bits };
}

function parsePeripherals(raw: unknown): Record<string, number | string> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, number | string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number" || typeof v === "string") {
      out[k] = v;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function parsePower(raw: unknown, fallbackSource: string | null): McuPowerSpec | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const activeMa = toNumOrNull(obj.active_ma ?? obj.activeMa);
  const deepSleepUa = toNumOrNull(obj.deep_sleep_ua ?? obj.deepSleepUa);
  const supplyVoltageMin = toNumOrNull(obj.supply_voltage_min ?? obj.supplyVoltageMin);
  const supplyVoltageMax = toNumOrNull(obj.supply_voltage_max ?? obj.supplyVoltageMax);
  if (activeMa === null && deepSleepUa === null && supplyVoltageMin === null && supplyVoltageMax === null) {
    return null;
  }
  return {
    activeMa,
    deepSleepUa,
    supplyVoltageMin,
    supplyVoltageMax,
    verificationStatus: toStatus(obj.status ?? obj.verification_status),
    source: typeof obj.source === "string" ? obj.source : (fallbackSource ?? ""),
  };
}

interface RawMcuRow {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  architecture: string | null;
  cpu: string | null;
  max_clock_mhz: number | string | null;
  flash_kb: number | string | null;
  ram_kb: number | string | null;
  gpio_count: number | null;
  adc: unknown;
  dac: unknown;
  peripherals: unknown;
  wireless: unknown;
  power: unknown;
  dev_tools: unknown;
  languages: unknown;
  applications: unknown;
  verification_status: unknown;
  sources: { url: string | null; title: string | null; document_rev: string | null } | null;
}

function mapMcuRow(row: RawMcuRow): CatalogueMcu {
  const sourceUrl = row.sources?.url ?? null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    vendor: row.vendor,
    architecture: row.architecture,
    cpu: row.cpu,
    maxClockMhz: toNumOrNull(row.max_clock_mhz),
    flashKb: toNumOrNull(row.flash_kb),
    ramKb: toNumOrNull(row.ram_kb),
    gpioCount: row.gpio_count,
    wireless: toStringArray(row.wireless),
    devTools: toStringArray(row.dev_tools),
    languages: toStringArray(row.languages),
    applications: toStringArray(row.applications),
    verificationStatus: toStatus(row.verification_status),
    sourceUrl,
    sourceTitle: row.sources?.title ?? null,
    documentRev: row.sources?.document_rev ?? null,
    adc: parseChannelsBits(row.adc),
    dac: parseChannelsBits(row.dac),
    peripherals: parsePeripherals(row.peripherals),
    power: parsePower(row.power, sourceUrl),
  };
}

const MCU_SELECT =
  "id,slug,name,vendor,architecture,cpu,max_clock_mhz,flash_kb,ram_kb,gpio_count,adc,dac,peripherals,wireless,power,dev_tools,languages,applications,verification_status,sources(url,title,document_rev)";

export async function getMicrocontrollersResult(): Promise<{
  items: CatalogueMcu[];
  mode: AppMode;
  error: string | null;
}> {
  if (isDemoMode) {
    return { items: demoCatalogueMcus(), mode: "demo", error: null };
  }
  const session = await getCurrentUser();
  if (!session) {
    return { items: demoCatalogueMcus(), mode: "demo", error: null };
  }

  const { data, error } = await session.supabase
    .from("microcontrollers")
    .select(MCU_SELECT)
    .order("name", { ascending: true });

  if (error) {
    return { items: [], mode: "live", error: error.message };
  }

  const rows = (data ?? []) as unknown as RawMcuRow[];
  return {
    items: rows.map(mapMcuRow),
    mode: "live",
    error: null,
  };
}

export async function getMicrocontrollers(): Promise<CatalogueMcu[]> {
  const { items } = await getMicrocontrollersResult();
  return items;
}

export async function getMicrocontrollerBySlugResult(slug: string): Promise<{
  item: CatalogueMcu | null;
  mode: AppMode;
  error: string | null;
}> {
  if (isDemoMode) {
    return {
      item: demoCatalogueMcus().find((m) => m.slug === slug) ?? null,
      mode: "demo",
      error: null,
    };
  }
  const session = await getCurrentUser();
  if (!session) {
    return {
      item: demoCatalogueMcus().find((m) => m.slug === slug) ?? null,
      mode: "demo",
      error: null,
    };
  }

  const { data, error } = await session.supabase
    .from("microcontrollers")
    .select(MCU_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return { item: null, mode: "live", error: error.message };
  }

  return {
    item: data ? mapMcuRow(data as unknown as RawMcuRow) : null,
    mode: "live",
    error: null,
  };
}

export async function getMicrocontrollerBySlug(slug: string): Promise<CatalogueMcu | null> {
  const { item } = await getMicrocontrollerBySlugResult(slug);
  return item;
}
