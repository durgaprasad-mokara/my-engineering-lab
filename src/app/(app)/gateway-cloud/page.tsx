import type { Metadata } from "next";
import { GatewayCloudWorkspace } from "@/components/cloud/gateway-cloud-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gateway & Cloud — My Engineering Lab",
  description: "Device registry, MQTT topic architectures, telemetry ingest, and threshold alerting.",
};

export default function GatewayCloudPage() {
  const brokerConfigured = Boolean(process.env.MQTT_BROKER_URL?.trim());
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source={brokerConfigured ? "live" : "demo"} />
            <Badge variant="outline">Phase 11 · Gateway & Cloud</Badge>
          </div>
        }
        title="Gateway & Cloud"
        description="Manage field device registries, MQTT topic schemas, AWS/Azure/EMQX broker patterns, and real-time telemetry alert rules."
      />
      <GatewayCloudWorkspace brokerConfigured={brokerConfigured} />
    </div>
  );
}

