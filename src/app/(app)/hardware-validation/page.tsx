import type { Metadata } from "next";
import { HardwareValidationWorkspace } from "@/components/advanced/hardware-validation-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hardware Validation Engine" };

export default function HardwareValidationPage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Module 22 · Pre-Layout DRC</Badge>
            <Badge variant="outline">Electrical &amp; Bus Checks</Badge>
          </div>
        }
        title="Hardware Validation Engine"
        description="Validate power rail budgets, MCU logic-level compatibility, I2C 7-bit address uniqueness, and linear regulator thermal dissipation before PCB fabrication."
      />

      <HardwareValidationWorkspace />
    </div>
  );
}

