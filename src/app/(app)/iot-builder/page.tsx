import type { Metadata } from "next";
import { IotBuilderWorkspace } from "@/components/projects/iot-builder-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "IoT Project Builder — My Engineering Lab",
  description: "Standardized 22-section engineering workflow with reference templates for Smart Water Meter, Energy Meter, Railway Track & Bridge Monitoring.",
};

export default function IotBuilderPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="demo" />
            <Badge variant="outline">Phase 7 · IoT Builder</Badge>
          </div>
        }
        title="IoT Project Builder"
        description="Structured 22-section engineering specification workflow with pre-populated reference projects."
      />
      <IotBuilderWorkspace />
    </div>
  );
}

