import type {
  CatalogueAntenna,
  CatalogueCommunicationModule,
  CatalogueComponent,
  CatalogueMcu,
  CatalogueSensor,
  VerificationStatus,
} from "@/lib/data/types";
import { searchNav } from "@/lib/navigation";
import { labelForSensorGroup } from "./filters";

export type CatalogueKind = "component" | "sensor" | "microcontroller" | "communication" | "antenna";

export interface CatalogueSearchItem {
  kind: CatalogueKind;
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
  verificationStatus: VerificationStatus;
}

export interface GlobalSearchResult {
  id: string;
  kind: "section" | CatalogueKind;
  title: string;
  summary: string;
  href: string;
  phase?: number;
  planned?: boolean;
  verificationStatus?: VerificationStatus;
}

export function catalogueToSearchItems(data: {
  components: CatalogueComponent[];
  sensors: CatalogueSensor[];
  mcus: CatalogueMcu[];
  communication?: CatalogueCommunicationModule[];
  antennas?: CatalogueAntenna[];
}): CatalogueSearchItem[] {
  const componentItems: CatalogueSearchItem[] = data.components.map((c) => ({
    kind: "component",
    slug: c.slug,
    title: c.name,
    subtitle: [c.partNumber, c.manufacturer, c.category].filter(Boolean).join(" · "),
    href: `/components/${c.slug}`,
    keywords: [
      c.slug,
      c.partNumber ?? "",
      c.manufacturer ?? "",
      c.category,
      c.categorySlug,
      c.package ?? "",
      ...c.interfaces,
      ...c.applications,
    ].filter(Boolean),
    verificationStatus: c.verificationStatus,
  }));

  const sensorItems: CatalogueSearchItem[] = data.sensors.map((s) => ({
    kind: "sensor",
    slug: s.slug,
    title: s.name,
    subtitle: [labelForSensorGroup(s.sensorGroup), s.measurand, s.outputType].filter(Boolean).join(" · "),
    href: `/sensors/${s.slug}`,
    keywords: [
      s.slug,
      s.sensorGroup,
      labelForSensorGroup(s.sensorGroup),
      s.measurand,
      s.outputType ?? "",
      ...s.protocols,
      ...s.applications,
    ].filter(Boolean),
    verificationStatus: s.verificationStatus,
  }));

  const mcuItems: CatalogueSearchItem[] = data.mcus.map((m) => ({
    kind: "microcontroller",
    slug: m.slug,
    title: m.name,
    subtitle: [m.vendor, m.architecture, m.maxClockMhz ? `${m.maxClockMhz} MHz` : null].filter(Boolean).join(" · "),
    href: `/microcontrollers/${m.slug}`,
    keywords: [
      m.slug,
      m.vendor,
      m.architecture ?? "",
      m.cpu ?? "",
      ...m.wireless,
      ...m.languages,
      ...m.devTools,
      ...m.applications,
    ].filter(Boolean),
    verificationStatus: m.verificationStatus,
  }));

  const commItems: CatalogueSearchItem[] = (data.communication ?? []).map((comm) => ({
    kind: "communication",
    slug: comm.slug,
    title: comm.name,
    subtitle: [comm.category.toUpperCase(), comm.standard, comm.typicalRange].filter(Boolean).join(" · "),
    href: `/communication/${comm.slug}`,
    keywords: [
      comm.slug,
      comm.name,
      comm.category,
      comm.standard,
      comm.typicalHardware,
      ...comm.frequencyBands,
      ...comm.applications,
    ].filter(Boolean),
    verificationStatus: comm.verificationStatus,
  }));

  const antennaItems: CatalogueSearchItem[] = (data.antennas ?? []).map((ant) => ({
    kind: "antenna",
    slug: ant.slug,
    title: ant.name,
    subtitle: [ant.antennaType.toUpperCase(), `${ant.freqMinMhz}–${ant.freqMaxMhz} MHz`, `+${ant.peakGainDbi} dBi`].filter(Boolean).join(" · "),
    href: `/antennas/${ant.slug}`,
    keywords: [
      ant.slug,
      ant.name,
      ant.partNumber,
      ant.manufacturer,
      ant.antennaType,
      ant.connector,
      ...ant.services,
      ...ant.applications,
    ].filter(Boolean),
    verificationStatus: ant.verificationStatus,
  }));

  return [...componentItems, ...sensorItems, ...mcuItems, ...commItems, ...antennaItems];
}

export function searchCatalogue(
  query: string,
  items: CatalogueSearchItem[],
): CatalogueSearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter((item) =>
    [item.title, item.subtitle, item.slug, ...item.keywords].some((field) =>
      field.toLowerCase().includes(q),
    ),
  );
}

export function searchGlobal(
  query: string,
  catalogueItems: CatalogueSearchItem[],
): GlobalSearchResult[] {
  const navResults: GlobalSearchResult[] = searchNav(query).map((item) => ({
    id: `section:${item.slug}`,
    kind: "section",
    title: item.title,
    summary: item.summary,
    href: item.href,
    phase: item.phase,
    planned: item.status === "planned",
  }));

  if (!query.trim()) {
    return navResults;
  }

  const catResults: GlobalSearchResult[] = searchCatalogue(query, catalogueItems).map((item) => ({
    id: `${item.kind}:${item.slug}`,
    kind: item.kind,
    title: item.title,
    summary: item.subtitle,
    href: item.href,
    verificationStatus: item.verificationStatus,
  }));

  return [...navResults, ...catResults];
}
