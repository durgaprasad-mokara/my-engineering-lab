import "server-only";
import { isDemoMode, type AppMode } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { demoCatalogueComponents } from "./demo";
import type {
  CatalogueComponent,
  ComponentAlternative,
  ComponentRating,
  PinoutEntry,
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

function toNumOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function parsePinout(raw: unknown): PinoutEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      pin: String(item.pin ?? ""),
      name: String(item.name ?? ""),
      function: String(item.function ?? ""),
    }))
    .filter((p) => p.pin || p.name);
}

function parseRatings(raw: unknown, fallbackSource: string | null): ComponentRating[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const entries = Object.entries(raw as Record<string, unknown>);
  return entries
    .filter(([, val]) => Boolean(val) && typeof val === "object")
    .map(([key, val]) => {
      const r = val as Record<string, unknown>;
      return {
        key,
        label: typeof r.label === "string" ? r.label : key.replace(/_/g, " "),
        min: toNumOrNull(r.min),
        typ: toNumOrNull(r.typ),
        max: toNumOrNull(r.max),
        unit: typeof r.unit === "string" ? r.unit : "",
        conditions: typeof r.conditions === "string" ? r.conditions : null,
        verificationStatus: toStatus(r.status ?? r.verification_status),
        source: typeof r.source === "string" ? r.source : (fallbackSource ?? ""),
      };
    });
}

interface RawComponentRow {
  id: string;
  slug: string;
  name: string;
  manufacturer: string | null;
  part_number: string | null;
  package: string | null;
  description: string | null;
  operating_principle: string | null;
  internal_structure: string | null;
  pinout: unknown;
  ratings: unknown;
  interfaces: unknown;
  applications: unknown;
  advantages: unknown;
  limitations: unknown;
  verification_status: unknown;
  component_categories: { name: string; slug: string } | null;
  sources: { url: string | null; title: string | null; document_rev: string | null } | null;
  component_datasheets?: { is_primary: boolean; sources: { url: string | null } | null }[] | null;
}

function mapComponentRow(row: RawComponentRow, alternatives?: ComponentAlternative[]): CatalogueComponent {
  const sourceUrl = row.sources?.url ?? null;
  const primaryDatasheet =
    row.component_datasheets?.find((d) => d.is_primary)?.sources?.url ??
    row.component_datasheets?.[0]?.sources?.url ??
    sourceUrl;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    manufacturer: row.manufacturer,
    partNumber: row.part_number,
    package: row.package,
    description: row.description,
    category: row.component_categories?.name ?? "Uncategorised",
    categorySlug: row.component_categories?.slug ?? "uncategorised",
    operatingPrinciple: row.operating_principle,
    internalStructure: row.internal_structure,
    interfaces: toStringArray(row.interfaces),
    applications: toStringArray(row.applications),
    advantages: toStringArray(row.advantages),
    limitations: toStringArray(row.limitations),
    verificationStatus: toStatus(row.verification_status),
    sourceUrl,
    datasheetUrl: primaryDatasheet,
    sourceTitle: row.sources?.title ?? null,
    documentRev: row.sources?.document_rev ?? null,
    pinout: parsePinout(row.pinout),
    ratings: parseRatings(row.ratings, sourceUrl),
    alternatives,
  };
}

const COMPONENT_SELECT =
  "id,slug,name,manufacturer,part_number,package,description,operating_principle,internal_structure,pinout,ratings,interfaces,applications,advantages,limitations,verification_status,component_categories(name,slug),sources(url,title,document_rev),component_datasheets(is_primary,sources(url))";

export async function getComponentsResult(): Promise<{
  items: CatalogueComponent[];
  mode: AppMode;
  error: string | null;
}> {
  if (isDemoMode) {
    return { items: demoCatalogueComponents(), mode: "demo", error: null };
  }
  const session = await getCurrentUser();
  if (!session) {
    return { items: demoCatalogueComponents(), mode: "demo", error: null };
  }

  const { data, error } = await session.supabase
    .from("components")
    .select(COMPONENT_SELECT)
    .order("name", { ascending: true });

  if (error) {
    return { items: [], mode: "live", error: error.message };
  }

  const rows = (data ?? []) as unknown as RawComponentRow[];
  return {
    items: rows.map((r) => mapComponentRow(r)),
    mode: "live",
    error: null,
  };
}

export async function getComponents(): Promise<CatalogueComponent[]> {
  const { items } = await getComponentsResult();
  return items;
}

export async function getComponentBySlugResult(slug: string): Promise<{
  item: CatalogueComponent | null;
  mode: AppMode;
  error: string | null;
}> {
  if (isDemoMode) {
    return {
      item: demoCatalogueComponents().find((c) => c.slug === slug) ?? null,
      mode: "demo",
      error: null,
    };
  }
  const session = await getCurrentUser();
  if (!session) {
    return {
      item: demoCatalogueComponents().find((c) => c.slug === slug) ?? null,
      mode: "demo",
      error: null,
    };
  }

  const { data, error } = await session.supabase
    .from("components")
    .select(COMPONENT_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return { item: null, mode: "live", error: error.message };
  }
  if (!data) {
    return { item: null, mode: "live", error: null };
  }

  const row = data as unknown as RawComponentRow;
  const { data: altRows } = await session.supabase
    .from("component_alternatives")
    .select("alternative_id,relation,notes")
    .eq("component_id", row.id);

  let alternatives: ComponentAlternative[] = [];
  if (altRows && altRows.length > 0) {
    const ids = altRows.map((a) => a.alternative_id as string);
    const { data: altComponents } = await session.supabase
      .from("components")
      .select("id,slug,name")
      .in("id", ids);
    const byId = new Map(
      (altComponents ?? []).map((c) => [c.id as string, { slug: c.slug as string, name: c.name as string }]),
    );
    alternatives = altRows
      .map((a): ComponentAlternative | null => {
        const target = byId.get(a.alternative_id as string);
        if (!target) return null;
        return {
          slug: target.slug,
          name: target.name,
          relation: a.relation === "compatible" ? "compatible" : "alternative",
          notes: (a.notes as string | null) ?? null,
        };
      })
      .filter((a): a is ComponentAlternative => a !== null);
  }

  return {
    item: mapComponentRow(row, alternatives),
    mode: "live",
    error: null,
  };
}

export async function getComponentBySlug(slug: string): Promise<CatalogueComponent | null> {
  const { item } = await getComponentBySlugResult(slug);
  return item;
}

export async function recordComponentView(componentId: string): Promise<void> {
  if (isDemoMode) return;
  const session = await getCurrentUser();
  if (!session) return;

  try {
    await session.supabase.from("component_views").upsert(
      {
        owner_id: session.user.id,
        component_id: componentId,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: "owner_id,component_id" },
    );
  } catch {
    // Recording recently viewed components is best-effort and non-blocking.
  }
}
