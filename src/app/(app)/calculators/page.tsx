import type { Metadata } from "next";
import { CalculatorsWorkspace } from "@/components/calculators/calculators-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Engineering Calculators — My Engineering Lab",
  description: "Electrical, battery, RF link budget / FSPL, fluid flow, and mechanical torque calculators with step-by-step derivations.",
};

export default function CalculatorsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="live">Verified Math Engine</Badge>
            <Badge variant="outline">Phase 6 · Calculations</Badge>
          </div>
        }
        title="Engineering Calculators"
        description="Deterministic calculators for Electrical, Battery Runtime, RF Link Budget & FSPL, Fluid Pipe Flow, and Mechanical Motor Sizing — each showing formulas, derivation steps, assumptions, and limitations."
      />
      <CalculatorsWorkspace />
    </div>
  );
}

