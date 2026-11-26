import type { Metadata } from "next";
import { IndustrialWorkspace } from "@/components/projects/industrial-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Industrial Applications — My Engineering Lab",
  description: "Smart metering, railway track & bridge monitoring prototypes with safety disclaimers, plus sourced industry technology research.",
};

export default function IndustrialPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="demo" />
            <Badge variant="outline">Phase 7 · Industrial</Badge>
          </div>
        }
        title="Industrial Applications & Research"
        description="Reference industrial telemetry architectures (with mandatory safety-critical disclaimers) and public-source company technology profiles."
      />
      <IndustrialWorkspace />
    </div>
  );
}

