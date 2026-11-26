import type { Metadata } from "next";
import { DigitalTwinWorkspace } from "@/components/cloud/digital-twin-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Digital Twin — My Engineering Lab",
  description: "3D device digital twin bound to telemetry state, actuator controls, and anomaly overlays.",
};

export default function DigitalTwinPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="illustrative" />
            <Badge variant="outline">Phase 11 · Digital Twin</Badge>
          </div>
        }
        title="Digital Twin"
        description="Interactive 3D digital twin bound to device telemetry metrics, actuator state, and anomaly overlays."
      />
      <DigitalTwinWorkspace />
    </div>
  );
}

