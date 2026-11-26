import type { Metadata } from "next";
import { CircuitDesignerWorkspace } from "@/components/design/circuit-designer-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Circuit Designer — My Engineering Lab",
  description: "Interactive block, wiring, schematic and PCB prep designer with live Electrical Rule Checks (ERC).",
};

export default function CircuitDesignerPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="illustrative" />
            <Badge variant="outline">Phase 5 · Engineering Design</Badge>
          </div>
        }
        title="Circuit Designer"
        description="Distinguish block, wiring, schematic and PCB views with live static Electrical Rule Checks for voltage levels, current budgets and bus compatibility."
      />
      <CircuitDesignerWorkspace />
    </div>
  );
}

