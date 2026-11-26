import type { Metadata } from "next";
import { CostEstimatorWorkspace } from "@/components/advanced/cost-estimator-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prototype Cost Estimator" };

export default function PrototypeCostEstimatorPage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Module 25 · Manufacturing</Badge>
            <Badge variant="illustrative">Estimated Pricing</Badge>
          </div>
        }
        title="Prototype Cost Estimator"
        description="Estimate per-unit BOM, PCB fabrication, assembly, enclosure, and volume tier breakpoints across prototype batch quantities."
      />

      <CostEstimatorWorkspace />
    </div>
  );
}

