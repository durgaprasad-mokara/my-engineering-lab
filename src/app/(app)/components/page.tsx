import type { Metadata } from "next";
import { AzComponentsBrowser } from "@/components/knowledge/az-components-browser";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { AZ_COMPONENTS, getAzCountsByLetter } from "@/lib/components/az-catalog";
import { getComponentsResult } from "@/lib/data/components";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "A–Z Components Library" };

export default async function ComponentsPage() {
  const { items: dbItems, mode, error } = await getComponentsResult();
  const letterCounts = getAzCountsByLetter();

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source={mode} />
            <Badge variant="outline">A–Z Electronic Components Library</Badge>
            <Badge variant="illustrative">{AZ_COMPONENTS.length} A–Z Components · {dbItems.length} Parametric DB Parts</Badge>
          </div>
        }
        title="A–Z Electronic Components Library"
        description="Complete alphabetical catalog from Arduino to ZIF sockets across 14 engineering categories, with component-specific technical diagrams, pinouts, firmware examples, provenance badges and BOM export."
      />

      {error && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          Could not load Supabase parametric components: {error}
        </div>
      )}

      <AzComponentsBrowser items={AZ_COMPONENTS} letterCounts={letterCounts} />
    </div>
  );
}
