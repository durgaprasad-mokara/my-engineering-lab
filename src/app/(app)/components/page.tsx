import type { Metadata } from "next";
import { ComponentsBrowser } from "@/components/knowledge/components-browser";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getComponentsResult } from "@/lib/data/components";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Components Library" };

export default async function ComponentsPage() {
  const { items, mode, error } = await getComponentsResult();

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source={mode} />
            <Badge variant="outline">Phase 2 · Knowledge Base</Badge>
          </div>
        }
        title="Components Library"
        description="Searchable catalogue of passive parts, discrete semiconductors, ICs, power devices and connectors with per-value provenance and datasheet links."
      />

      {error && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          Could not load components from Supabase: {error}
        </div>
      )}

      <ComponentsBrowser items={items} />
    </div>
  );
}
