import "server-only";
import { isDemoMode, type AppMode } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { demoCatalogueCommunication, demoSpectrumRegulations } from "./demo";
import type {
  CatalogueCommunicationModule,
  CommunicationCategory,
  DomainSuitability,
  SpectrumRegulationEntry,
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

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

interface RawCommunicationRow {
  id: string;
  slug: string;
  name: string;
  technology: string;
  bands: unknown;
  interfaces: unknown;
  certifications: unknown;
  specs: unknown;
  verification_status: unknown;
  sources: { url: string; title?: string | null; document_rev?: string | null } | null;
}

function parseRawModule(row: RawCommunicationRow): CatalogueCommunicationModule {
  const specs = (row.specs && typeof row.specs === "object" ? row.specs : {}) as Record<string, unknown>;
  const demoFallback = demoCatalogueCommunication().find((d) => d.slug === row.slug);

  const category = (specs.category as CommunicationCategory) || demoFallback?.category || "cellular";
  const suitability: DomainSuitability[] =
    Array.isArray(specs.suitability)
      ? (specs.suitability as DomainSuitability[])
      : demoFallback?.suitability || [];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category,
    standard: typeof specs.standard === "string" ? specs.standard : demoFallback?.standard || row.technology,
    frequencyBands: toStringArray(row.bands).length > 0 ? toStringArray(row.bands) : demoFallback?.frequencyBands || [],
    dataRate: typeof specs.dataRate === "string" ? specs.dataRate : demoFallback?.dataRate || "Standard",
    typicalRange: typeof specs.typicalRange === "string" ? specs.typicalRange : demoFallback?.typicalRange || "Medium",
    topology: typeof specs.topology === "string" ? specs.topology : demoFallback?.topology || "Star",
    powerConsumption: typeof specs.powerConsumption === "string" ? specs.powerConsumption : demoFallback?.powerConsumption || "Medium",
    latency: typeof specs.latency === "string" ? specs.latency : demoFallback?.latency || "< 100 ms",
    payloadSize: typeof specs.payloadSize === "string" ? specs.payloadSize : demoFallback?.payloadSize || "Variable",
    security: typeof specs.security === "string" ? specs.security : demoFallback?.security || "Standard",
    deploymentCost: (specs.deploymentCost as "Low" | "Medium" | "High") || demoFallback?.deploymentCost || "Medium",
    infrastructure: typeof specs.infrastructure === "string" ? specs.infrastructure : demoFallback?.infrastructure || "Standard",
    typicalHardware: typeof specs.typicalHardware === "string" ? specs.typicalHardware : demoFallback?.typicalHardware || "",
    description: typeof specs.description === "string" ? specs.description : demoFallback?.description || "",
    advantages: toStringArray(specs.advantages).length > 0 ? toStringArray(specs.advantages) : demoFallback?.advantages || [],
    limitations: toStringArray(specs.limitations).length > 0 ? toStringArray(specs.limitations) : demoFallback?.limitations || [],
    applications: toStringArray(specs.applications).length > 0 ? toStringArray(specs.applications) : demoFallback?.applications || [],
    regionalBands: Array.isArray(specs.regionalBands)
      ? (specs.regionalBands as { region: string; band: string; notes: string }[])
      : demoFallback?.regionalBands || [],
    suitability,
    verificationStatus: toStatus(row.verification_status),
    sourceUrl: row.sources?.url ?? demoFallback?.sourceUrl ?? null,
    sourceTitle: row.sources?.title ?? demoFallback?.sourceTitle ?? null,
    documentRev: row.sources?.document_rev ?? demoFallback?.documentRev ?? null,
  };
}

export async function getCommunicationModules(): Promise<CatalogueCommunicationModule[]> {
  const result = await getCommunicationModulesResult();
  return result.items;
}

export async function getCommunicationModulesResult(): Promise<{
  items: CatalogueCommunicationModule[];
  mode: AppMode;
  error: string | null;
}> {
  if (isDemoMode) {
    return { items: demoCatalogueCommunication(), mode: "demo", error: null };
  }

  const session = await getCurrentUser();
  if (!session) {
    return { items: demoCatalogueCommunication(), mode: "demo", error: null };
  }

  try {
    const { data, error } = await session.supabase
      .from("communication_modules")
      .select(`
        id,
        slug,
        name,
        technology,
        bands,
        interfaces,
        certifications,
        specs,
        verification_status,
        sources ( url, title, document_rev )
      `)
      .order("name", { ascending: true });

    if (error) {
      return { items: demoCatalogueCommunication(), mode: "demo", error: error.message };
    }

    if (!data || data.length === 0) {
      return { items: demoCatalogueCommunication(), mode: "demo", error: null };
    }

    const items = (data as unknown as RawCommunicationRow[]).map(parseRawModule);
    return { items, mode: "live", error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { items: demoCatalogueCommunication(), mode: "demo", error: msg };
  }
}

export async function getCommunicationBySlug(slug: string): Promise<CatalogueCommunicationModule | null> {
  const result = await getCommunicationBySlugResult(slug);
  return result.item;
}

export async function getCommunicationBySlugResult(slug: string): Promise<{
  item: CatalogueCommunicationModule | null;
  mode: AppMode;
  error: string | null;
}> {
  if (isDemoMode) {
    const item = demoCatalogueCommunication().find((c) => c.slug === slug) ?? null;
    return { item, mode: "demo", error: null };
  }

  const session = await getCurrentUser();
  if (!session) {
    const item = demoCatalogueCommunication().find((c) => c.slug === slug) ?? null;
    return { item, mode: "demo", error: null };
  }

  try {
    const { data, error } = await session.supabase
      .from("communication_modules")
      .select(`
        id,
        slug,
        name,
        technology,
        bands,
        interfaces,
        certifications,
        specs,
        verification_status,
        sources ( url, title, document_rev )
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      const fallback = demoCatalogueCommunication().find((c) => c.slug === slug) ?? null;
      return { item: fallback, mode: "demo", error: error.message };
    }

    if (!data) {
      const fallback = demoCatalogueCommunication().find((c) => c.slug === slug) ?? null;
      return { item: fallback, mode: fallback ? "demo" : "live", error: null };
    }

    const item = parseRawModule(data as unknown as RawCommunicationRow);
    return { item, mode: "live", error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const fallback = demoCatalogueCommunication().find((c) => c.slug === slug) ?? null;
    return { item: fallback, mode: "demo", error: msg };
  }
}

export async function getSpectrumRegulations(): Promise<SpectrumRegulationEntry[]> {
  return demoSpectrumRegulations();
}

