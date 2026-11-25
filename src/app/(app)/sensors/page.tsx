import type { Metadata } from "next";
import { SensorsBrowser } from "@/components/knowledge/sensors-browser";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getSensorsResult } from "@/lib/data/sensors";
import { parseCompareSlugs } from "@/lib/knowledge/filters";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sensors Library" };

export default async function SensorsPage({
  searchParams,
}: {
  searchParams: Promise<{ compare?: string }>;
}) {
  const [{ items, mode, error }, sp] = await Promise.all([
    getSensorsResult(),
    searchParams,
  ]);

  const validSlugs = new Set(items.map((s) => s.slug));
  const initialCompareSlugs = parseCompareSlugs(sp.compare, validSlugs);

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source={mode} />
            <Badge variant="outline">Phase 2 · Five-way comparison</Badge>
          </div>
        }
        title="Sensors Library"
        description="Structured sensor reference covering measurement principle, tolerances, interfaces, calibration procedures and shareable 5-way comparison."
      />

      {error && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          Could not load sensors from Supabase: {error}
        </div>
      )}

      <SensorsBrowser items={items} initialCompareSlugs={initialCompareSlugs} />
    </div>
  );
}
