import type { Metadata } from "next";
import { AiHardwareResearchWorkspace } from "@/components/advanced/ai-hardware-research-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { runHardwareResearch } from "@/lib/advanced/engines";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI Hardware Research Agent" };

export default function AiHardwareResearchPage() {
  const initialReport = runHardwareResearch("Low-power ESP32 environmental node with I2C sensors and LiPo battery");

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Module 21 · AI R&amp;D</Badge>
            <Badge variant="illustrative">Grounded in A–Z Catalog</Badge>
          </div>
        }
        title="AI Hardware Research Agent"
        description="Research electronic architectures, compare candidate parts from the A–Z library, and synthesize engineering notes with Claude AI or the deterministic catalog engine."
      />

      <AiHardwareResearchWorkspace initialReport={initialReport} />
    </div>
  );
}

