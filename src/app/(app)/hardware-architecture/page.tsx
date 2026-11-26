import type { Metadata } from "next";
import { HardwareArchitectureWorkspace } from "@/components/design/hardware-architecture-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Hardware Architecture — My Engineering Lab",
  description: "Requirement-driven hardware configuration engine comparing 5 ranked alternatives across 10 criteria with editable BOM.",
};

export default function HardwareArchitecturePage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="demo" />
            <Badge variant="outline">Phase 5 · Engineering Design</Badge>
          </div>
        }
        title="Hardware Architecture & BOM"
        description="Compare five ranked hardware configurations across ten engineering criteria, inspect subsystem trade-offs, and manage an editable BOM with stale-price and provenance checks."
      />
      <HardwareArchitectureWorkspace />
    </div>
  );
}

