import type { Metadata } from "next";
import { LiveIoTMonitoringWorkspace } from "@/components/advanced/live-iot-monitoring-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Live IoT Device Monitoring" };

export default function LiveIotMonitoringPage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Module 23 · Telemetry</Badge>
            <Badge variant="illustrative">Simulated Telemetry Stream</Badge>
          </div>
        }
        title="Live IoT Device Monitoring"
        description="Monitor connected field nodes, inspect rail voltage, temperature, humidity and RSSI, dispatch downlink commands, and export telemetry snapshots."
      />

      <LiveIoTMonitoringWorkspace />
    </div>
  );
}

