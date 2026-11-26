import type { Metadata } from "next";
import { ExplorerWorkspace } from "@/components/explorer-3d/explorer-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "3D Component Explorer — My Engineering Lab",
  description:
    "Interactive React Three Fiber 3D explorer with orbit/zoom/pan, exploded view, pinout inspection, labels, and 7 engineering view modes.",
};

export default async function Explorer3DPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string }>;
}) {
  const { model } = await searchParams;

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="illustrative" />
            <Badge variant="outline">Phase 4 · 3D Engineering</Badge>
          </div>
        }
        title="3D Component Explorer"
        description="Inspect electronic components, pins, PCB footprints, wiring harnesses, and system architectures across 7 interactive engineering view modes."
      />

      <ExplorerWorkspace initialModelSlug={model} />
    </div>
  );
}

