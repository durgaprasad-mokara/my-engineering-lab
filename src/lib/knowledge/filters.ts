import type {
  CatalogueComponent,
  CatalogueMcu,
  CatalogueSensor,
  SensorSpec,
  VerificationStatus,
} from "@/lib/data/types";

export const MAX_COMPARE_SENSORS = 5;

export const SENSOR_GROUP_LABELS: Record<string, string> = {
  distance_detection: "Distance & Detection",
  environmental: "Environmental",
  motion: "Motion & IMU",
  industrial: "Industrial",
  water: "Water & Flow",
  navigation: "Navigation",
};

export const SPEC_KEY_LABELS: Record<string, string> = {
  range: "Measurement range",
  accuracy: "Accuracy",
  resolution: "Resolution",
  repeatability: "Repeatability",
  response_time: "Response time",
  supply_voltage: "Supply voltage",
  operating_current: "Operating current",
  operating_temp: "Operating temperature",
  max_pressure: "Max working pressure",
  sensitivity: "Sensitivity",
  bandwidth: "Bandwidth",
  sample_rate: "Output data rate",
};

export function labelForSensorGroup(group: string): string {
  return SENSOR_GROUP_LABELS[group] ?? group.replace(/_/g, " ");
}

export function labelForSpecKey(key: string): string {
  return (
    SPEC_KEY_LABELS[key] ??
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export interface ComponentFilterOptions {
  query?: string;
  categorySlug?: string;
  status?: VerificationStatus | "all";
}

export function getComponentCategories(
  items: CatalogueComponent[],
): { slug: string; name: string; count: number }[] {
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const item of items) {
    const existing = map.get(item.categorySlug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(item.categorySlug, {
        slug: item.categorySlug,
        name: item.category,
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function filterComponents(
  items: CatalogueComponent[],
  opts: ComponentFilterOptions,
): CatalogueComponent[] {
  const q = opts.query?.trim().toLowerCase() ?? "";
  const categorySlug = opts.categorySlug && opts.categorySlug !== "all" ? opts.categorySlug : null;
  const status = opts.status && opts.status !== "all" ? opts.status : null;

  return items.filter((item) => {
    if (categorySlug && item.categorySlug !== categorySlug) return false;
    if (status && item.verificationStatus !== status) return false;
    if (!q) return true;

    const haystack = [
      item.name,
      item.partNumber ?? "",
      item.manufacturer ?? "",
      item.package ?? "",
      item.category,
      item.description ?? "",
      item.operatingPrinciple ?? "",
      ...item.interfaces,
      ...item.applications,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

export interface SensorFilterOptions {
  query?: string;
  group?: string;
  outputType?: string;
}

export function getSensorGroups(
  items: CatalogueSensor[],
): { group: string; label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const s of items) {
    map.set(s.sensorGroup, (map.get(s.sensorGroup) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([group, count]) => ({
      group,
      label: labelForSensorGroup(group),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function filterSensors(
  items: CatalogueSensor[],
  opts: SensorFilterOptions,
): CatalogueSensor[] {
  const q = opts.query?.trim().toLowerCase() ?? "";
  const group = opts.group && opts.group !== "all" ? opts.group : null;
  const outputType = opts.outputType && opts.outputType !== "all" ? opts.outputType : null;

  return items.filter((sensor) => {
    if (group && sensor.sensorGroup !== group) return false;
    if (outputType && sensor.outputType !== outputType) return false;
    if (!q) return true;

    const haystack = [
      sensor.name,
      sensor.slug,
      sensor.measurand,
      labelForSensorGroup(sensor.sensorGroup),
      sensor.measurementPrinciple ?? "",
      sensor.howItWorks ?? "",
      sensor.outputType ?? "",
      ...sensor.protocols,
      ...sensor.applications,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function parseCompareSlugs(
  param: string | null | undefined,
  validSlugs?: Set<string>,
  max = MAX_COMPARE_SENSORS,
): string[] {
  if (!param) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of param.split(",")) {
    const slug = raw.trim().toLowerCase();
    if (!slug || seen.has(slug)) continue;
    if (validSlugs && !validSlugs.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
    if (out.length >= max) break;
  }
  return out;
}

export function toggleCompareSlug(
  current: string[],
  slug: string,
  max = MAX_COMPARE_SENSORS,
): string[] {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return current;
  if (current.includes(normalized)) {
    return current.filter((s) => s !== normalized);
  }
  if (current.length >= max) {
    return current;
  }
  return [...current, normalized];
}

export function formatCompareParam(slugs: string[]): string {
  return slugs.slice(0, MAX_COMPARE_SENSORS).join(",");
}

export function formatSpecRange(
  spec: Pick<SensorSpec, "minValue" | "typValue" | "maxValue" | "unit">,
): string {
  const { minValue, typValue, maxValue, unit } = spec;
  const suffix = unit ? ` ${unit}` : "";
  if (minValue !== null && maxValue !== null) {
    if (typValue !== null) {
      return `${minValue} .. ${maxValue}${suffix} (typ ${typValue}${suffix})`;
    }
    return `${minValue} .. ${maxValue}${suffix}`;
  }
  if (typValue !== null) {
    return `${typValue}${suffix}`;
  }
  if (minValue !== null) {
    return `≥ ${minValue}${suffix}`;
  }
  if (maxValue !== null) {
    return `≤ ${maxValue}${suffix}`;
  }
  return unit || "—";
}

export interface ComparisonSpecRow {
  key: string;
  label: string;
  values: Record<string, SensorSpec | null>;
}

export function buildSensorComparisonMatrix(sensors: CatalogueSensor[]): {
  keys: string[];
  rows: ComparisonSpecRow[];
} {
  const keyOrder: string[] = [];
  const seen = new Set<string>();
  for (const sensor of sensors) {
    for (const spec of sensor.specs) {
      if (!seen.has(spec.key)) {
        seen.add(spec.key);
        keyOrder.push(spec.key);
      }
    }
  }

  const rows: ComparisonSpecRow[] = keyOrder.map((key) => {
    const values: Record<string, SensorSpec | null> = {};
    for (const sensor of sensors) {
      values[sensor.slug] = sensor.specs.find((s) => s.key === key) ?? null;
    }
    return {
      key,
      label: labelForSpecKey(key),
      values,
    };
  });

  return { keys: keyOrder, rows };
}

export interface McuSelectorCriteria {
  query?: string;
  vendor?: string;
  wirelessRequired?: "any" | "yes" | "no";
  wirelessProtocol?: string;
  minFlashKb?: number | null;
  minRamKb?: number | null;
  minGpio?: number | null;
  minClockMhz?: number | null;
}

export function filterMcus(
  items: CatalogueMcu[],
  criteria: McuSelectorCriteria,
): CatalogueMcu[] {
  const q = criteria.query?.trim().toLowerCase() ?? "";
  const vendor = criteria.vendor && criteria.vendor !== "all" ? criteria.vendor.toLowerCase() : null;
  const wirelessProtocol =
    criteria.wirelessProtocol && criteria.wirelessProtocol !== "all"
      ? criteria.wirelessProtocol.toLowerCase()
      : null;

  return items.filter((mcu) => {
    if (vendor && mcu.vendor.toLowerCase() !== vendor) return false;

    if (criteria.wirelessRequired === "yes" && mcu.wireless.length === 0) return false;
    if (criteria.wirelessRequired === "no" && mcu.wireless.length > 0) return false;

    if (wirelessProtocol) {
      const hasProto = mcu.wireless.some((w) => w.toLowerCase().includes(wirelessProtocol));
      if (!hasProto) return false;
    }

    if (criteria.minFlashKb !== null && criteria.minFlashKb !== undefined) {
      if (mcu.flashKb === null || mcu.flashKb < criteria.minFlashKb) return false;
    }
    if (criteria.minRamKb !== null && criteria.minRamKb !== undefined) {
      if (mcu.ramKb === null || mcu.ramKb < criteria.minRamKb) return false;
    }
    if (criteria.minGpio !== null && criteria.minGpio !== undefined) {
      if (mcu.gpioCount === null || mcu.gpioCount < criteria.minGpio) return false;
    }
    if (criteria.minClockMhz !== null && criteria.minClockMhz !== undefined) {
      if (mcu.maxClockMhz === null || mcu.maxClockMhz < criteria.minClockMhz) return false;
    }

    if (!q) return true;
    const haystack = [
      mcu.name,
      mcu.slug,
      mcu.vendor,
      mcu.architecture ?? "",
      mcu.cpu ?? "",
      ...mcu.wireless,
      ...mcu.devTools,
      ...mcu.languages,
      ...mcu.applications,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
