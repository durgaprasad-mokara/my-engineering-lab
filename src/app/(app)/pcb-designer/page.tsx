import type { Metadata } from "next";
import { PcbDesignerWorkspace } from "@/components/design/pcb-designer-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "PCB Designer — My Engineering Lab",
  description: "PCB preparation workspace: layer stack-up, footprint assignment, placement planning, and KiCad netlist export.",
};

export default function PcbDesignerPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="illustrative" />
            <Badge variant="outline">Phase 5 · Engineering Design</Badge>
          </div>
        }
        title="PCB Designer"
        description="Plan 2-layer or 4-layer stack-ups, verify KiCad footprints, and export netlists (.net) and placement CSVs for physical routing."
      />
      <PcbDesignerWorkspace />
    </div>
  );
}

