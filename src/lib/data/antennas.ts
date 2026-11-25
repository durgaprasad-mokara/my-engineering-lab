import "server-only";
import { isDemoMode, type AppMode } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { demoCatalogueAntennas } from "./demo";
import type {
  AntennaType,
  CatalogueAntenna,
  RadiationPatternPoint,
  VerificationStatus,
} from "./types";

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

function toNum(v: unknown, fallback: number): number {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

interface RawAntennaRow {
  id: string;
  slug: string;
  name: string;
  antenna_type: string;
  services: unknown;
  freq_min_mhz: unknown;
  freq_max_mhz: unknown;
  peak_gain_dbi: unknown;
  impedance_ohm: unknown;
  vswr_max: unknown;
  polarization: string | null;
  connector: string | null;
  cable: string | null;
  ground_plane: string | null;
  pattern_data: unknown;
  verification_status: unknown;
  sources: { url: string; title?: string | null; document_rev?: string | null } | null;
}

function parseRawAntenna(row: RawAntennaRow): CatalogueAntenna {
  const demoFallback = demoCatalogueAntennas().find((d) => d.slug === row.slug);
  const patternData: RadiationPatternPoint[] =
    Array.isArray(row.pattern_data) && (row.pattern_data as RadiationPatternPoint[]).length > 0
      ? (row.pattern_data as RadiationPatternPoint[])
      : demoFallback?.patternData || [];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    manufacturer: demoFallback?.manufacturer || "Industrial Manufacturer",
    partNumber: demoFallback?.partNumber || row.slug.toUpperCase(),
    antennaType: (row.antenna_type as AntennaType) || demoFallback?.antennaType || "dipole",
    services: toStringArray(row.services).length > 0 ? toStringArray(row.services) : demoFallback?.services || [],
    freqMinMhz: toNum(row.freq_min_mhz, demoFallback?.freqMinMhz || 865),
    freqMaxMhz: toNum(row.freq_max_mhz, demoFallback?.freqMaxMhz || 868),
    peakGainDbi: toNum(row.peak_gain_dbi, demoFallback?.peakGainDbi || 2.1),
    impedanceOhm: toNum(row.impedance_ohm, demoFallback?.impedanceOhm || 50),
    vswrMax: toNum(row.vswr_max, demoFallback?.vswrMax || 2.0),
    returnLossDb: demoFallback?.returnLossDb ?? -10,
    polarization: row.polarization || demoFallback?.polarization || "Linear",
    connector: row.connector || demoFallback?.connector || "SMA",
    cableLengthMm: demoFallback?.cableLengthMm ?? null,
    groundPlane: row.ground_plane || demoFallback?.groundPlane || "Ground-plane independent",
    dimensionsMm: demoFallback?.dimensionsMm || "Standard form factor",
    efficiencyPercent: demoFallback?.efficiencyPercent ?? 60,
    radiationPatternType: demoFallback?.radiationPatternType || "omnidirectional",
    patternData,
    description: demoFallback?.description || "",
    designConsiderations: demoFallback?.designConsiderations || [],
    matchingNotes: demoFallback?.matchingNotes || "50-ohm standard matched feed.",
    applications: demoFallback?.applications || [],
    verificationStatus: toStatus(row.verification_status),
    sourceUrl: row.sources?.url ?? demoFallback?.sourceUrl ?? null,
    sourceTitle: row.sources?.title ?? demoFallback?.sourceTitle ?? null,
    documentRev: row.sources?.document_rev ?? demoFallback?.documentRev ?? null,
  };
}

export async function getAntennas(): Promise<CatalogueAntenna[]> {
  const result = await getAntennasResult();
  return result.items;
}

export async function getAntennasResult(): Promise<{
  items: CatalogueAntenna[];
  mode: AppMode;
  error: string | null;
}> {
  if (isDemoMode) {
    return { items: demoCatalogueAntennas(), mode: "demo", error: null };
  }

  const session = await getCurrentUser();
  if (!session) {
    return { items: demoCatalogueAntennas(), mode: "demo", error: null };
  }

  try {
    const { data, error } = await session.supabase
      .from("antennas")
      .select(`
        id,
        slug,
        name,
        antenna_type,
        services,
        freq_min_mhz,
        freq_max_mhz,
        peak_gain_dbi,
        impedance_ohm,
        vswr_max,
        polarization,
        connector,
        cable,
        ground_plane,
        pattern_data,
        verification_status,
        sources ( url, title, document_rev )
      `)
      .order("name", { ascending: true });

    if (error) {
      return { items: demoCatalogueAntennas(), mode: "demo", error: error.message };
    }

    if (!data || data.length === 0) {
      return { items: demoCatalogueAntennas(), mode: "demo", error: null };
    }

    const items = (data as unknown as RawAntennaRow[]).map(parseRawAntenna);
    return { items, mode: "live", error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { items: demoCatalogueAntennas(), mode: "demo", error: msg };
  }
}

export async function getAntennaBySlug(slug: string): Promise<CatalogueAntenna | null> {
  const result = await getAntennaBySlugResult(slug);
  return result.item;
}

export async function getAntennaBySlugResult(slug: string): Promise<{
  item: CatalogueAntenna | null;
  mode: AppMode;
  error: string | null;
}> {
  if (isDemoMode) {
    const item = demoCatalogueAntennas().find((a) => a.slug === slug) ?? null;
    return { item, mode: "demo", error: null };
  }

  const session = await getCurrentUser();
  if (!session) {
    const item = demoCatalogueAntennas().find((a) => a.slug === slug) ?? null;
    return { item, mode: "demo", error: null };
  }

  try {
    const { data, error } = await session.supabase
      .from("antennas")
      .select(`
        id,
        slug,
        name,
        antenna_type,
        services,
        freq_min_mhz,
        freq_max_mhz,
        peak_gain_dbi,
        impedance_ohm,
        vswr_max,
        polarization,
        connector,
        cable,
        ground_plane,
        pattern_data,
        verification_status,
        sources ( url, title, document_rev )
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      const fallback = demoCatalogueAntennas().find((a) => a.slug === slug) ?? null;
      return { item: fallback, mode: "demo", error: error.message };
    }

    if (!data) {
      const fallback = demoCatalogueAntennas().find((a) => a.slug === slug) ?? null;
      return { item: fallback, mode: fallback ? "demo" : "live", error: null };
    }

    const item = parseRawAntenna(data as unknown as RawAntennaRow);
    return { item, mode: "live", error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const fallback = demoCatalogueAntennas().find((a) => a.slug === slug) ?? null;
    return { item: fallback, mode: "demo", error: msg };
  }
}

