import type { Metadata } from "next";
import { CodeLabWorkspace } from "@/components/code-lab/code-lab-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Embedded Code Lab — My Engineering Lab",
  description: "Multi-target embedded firmware templates (ESP-IDF, Arduino, STM32 HAL, MicroPython, Zephyr) with file tree, versioning, and bundle download.",
};

export default function CodeLabPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="demo" />
            <Badge variant="outline">Phase 9 · Embedded Code Lab</Badge>
          </div>
        }
        title="Embedded Code Lab"
        description="Edit, version, and export firmware templates for ESP32, STM32, RP2040, nRF52840, and Arduino. Build status remains untested until compiled."
      />
      <CodeLabWorkspace />
    </div>
  );
}

